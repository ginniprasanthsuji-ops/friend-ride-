import test from "node:test";
import assert from "node:assert/strict";
import { classifyIntent } from "../dist/core/intent-router.js";
import { MockAIProvider } from "../dist/core/ai-provider.js";
import { AssistantRuntime } from "../dist/core/assistant-runtime.js";
import { SessionContextStore } from "../dist/core/session-context.js";

test("intent router recognizes Telugu and English ride requests", () => {
  assert.equal(classifyIntent("book cab please").kind, "RIDE_BOOKING");
  assert.equal(classifyIntent("క్యాబ్ బుక్ చేయి").kind, "RIDE_BOOKING");
});

test("empty input requires clarification and unknown phrases remain general", () => {
  assert.equal(classifyIntent("   ").needsClarification, true);
  assert.equal(classifyIntent("tell me a joke").kind, "GENERAL_CHAT");
});

test("runtime uses mock provider and appends session messages", async () => {
  const contexts = new SessionContextStore();
  contexts.create("runtime-test");
  const runtime = new AssistantRuntime(new MockAIProvider(), contexts);
  const reply = await runtime.handle("runtime-test", "Hello ARJUNA");
  assert.equal(reply.completion?.provider, "mock");
  assert.equal(contexts.get("runtime-test")?.messages.length, 2);
});

test("runtime rejects empty input and missing session", async () => {
  const contexts = new SessionContextStore();
  const runtime = new AssistantRuntime(new MockAIProvider(), contexts);
  await assert.rejects(runtime.handle("missing", "hello"), /Unknown session/);
  contexts.create("s1");
  await assert.rejects(runtime.handle("s1", "  "), /Message cannot be empty/);
});

test("runtime passes intent-aware safety and bounded session facts to provider", async () => {
  const contexts = new SessionContextStore();
  contexts.create("phase7-prompt");
  contexts.setFact("phase7-prompt", "preferredLanguage", "Telugu");
  let captured;
  const provider = {
    providerName: "capture",
    async complete(request) {
      captured = request.messages[0].content;
      return { text: "clarifying", provider: "capture", model: "test" };
    },
  };
  const runtime = new AssistantRuntime(provider, contexts);
  await runtime.handle("phase7-prompt", "book cab and order food");
  assert.match(captured, /Detected intent/);
  assert.match(captured, /Telugu/);
  assert.match(captured, /explicit user confirmation/);
  assert.match(captured, /verified tool result/);
});

test("router identifies multi-intent requests and asks for clarification", () => {
  const result = classifyIntent("book cab and order biryani");
  assert.equal(result.kind, "RIDE_BOOKING");
  assert.deepEqual(result.additionalIntents, ["FOOD_ORDER"]);
  assert.equal(result.needsClarification, true);
});

test("single intent keeps no extra intents", () => {
  const result = classifyIntent("track my order");
  assert.deepEqual(result.additionalIntents, []);
});
