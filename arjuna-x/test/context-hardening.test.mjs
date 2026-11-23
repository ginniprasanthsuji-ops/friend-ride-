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
