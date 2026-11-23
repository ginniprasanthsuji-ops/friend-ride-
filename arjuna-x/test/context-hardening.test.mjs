import test from "node:test";
import assert from "node:assert/strict";
import { SessionContextStore } from "../dist/core/session-context.js";

test("context store caps message count to configured bound", () => {
  const store = new SessionContextStore(2, 20);
  store.create("bounded");
  store.appendMessage("bounded", "user", "first");
  store.appendMessage("bounded", "assistant", "second");
  store.appendMessage("bounded", "user", "third");
  assert.deepEqual(store.get("bounded")?.messages.map((m) => m.content), ["second", "third"]);
});

test("context store rejects empty and over-limit messages", () => {
  const store = new SessionContextStore(10, 5);
  store.create("bounded");
  assert.throws(() => store.appendMessage("bounded", "user", " "), /cannot be empty/);
  assert.throws(() => store.appendMessage("bounded", "user", "abcdef"), /character limit/);
});

test("context limits validate at construction", () => {
  assert.throws(() => new SessionContextStore(0), /positive integer/);
  assert.throws(() => new SessionContextStore(10, 0), /positive integer/);
});

test("recent message and fact snapshots are bounded and detached", () => {
  const store = new SessionContextStore(5, 50);
  store.create("snapshot");
  store.appendMessage("snapshot", "user", "one");
  store.appendMessage("snapshot", "assistant", "two");
  store.setFact("snapshot", "language", "Telugu");
  const history = store.getRecentMessages("snapshot", 1);
  history[0].content = "mutated";
  const facts = store.getFactsSnapshot("snapshot");
  facts.language = "mutated";
  assert.equal(store.getRecentMessages("snapshot", 1)[0].content, "two");
  assert.equal(store.getFactsSnapshot("snapshot").language, "Telugu");
  assert.throws(() => store.getRecentMessages("snapshot", 6), /limit must be/);
  assert.throws(() => store.getFactsSnapshot("snapshot", 101), /maxFacts/);
});

test("facts reject invalid keys and values", () => {
  const store = new SessionContextStore(5, 10);
  store.create("facts");
  assert.throws(() => store.setFact("facts", " ", "value"), /Fact key/);
  assert.throws(() => store.setFact("facts", "key", " "), /Fact value/);
  assert.throws(() => store.setFact("facts", "key", "12345678901"), /message limit/);
});
