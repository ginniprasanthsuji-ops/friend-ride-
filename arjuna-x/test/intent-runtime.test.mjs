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
