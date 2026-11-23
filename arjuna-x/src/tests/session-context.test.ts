import test from "node:test";
import assert from "node:assert/strict";
import { SessionContextStore } from "../core/session-context.js";

test("get/create return defensive snapshots and cannot mutate stored session", () => {
  const store = new SessionContextStore();
  const created = store.create("safe-session");
  created.facts.injected = "bad";
  store.appendMessage("safe-session", "user", "hello");
  const snapshot = store.get("safe-session")!;
  snapshot.messages[0]!.content = "changed";
  snapshot.facts.injected = "bad";
  const stored = store.get("safe-session")!;
  assert.equal(stored.messages[0]?.content, "hello");
  assert.equal(stored.facts.injected, undefined);
});

test("facts are bounded and can be deleted", () => {
  const store = new SessionContextStore(10, 100, 5, 8);
  store.create("facts-session");
  assert.throws(() => store.setFact("facts-session", "", "v"), /key cannot be empty/i);
  assert.throws(() => store.setFact("facts-session", "toolong", "v"), /key exceeds/i);
  assert.throws(() => store.setFact("facts-session", "key", "123456789"), /value exceeds/i);
  store.setFact("facts-session", "name", "Ginni");
  assert.equal(store.deleteFact("facts-session", "name"), true);
  assert.equal(store.deleteFact("facts-session", "name"), false);
});

test("clearData resets messages and facts while preserving session", () => {
  const store = new SessionContextStore();
  store.create("reset-session");
  store.appendMessage("reset-session", "user", "private message");
  store.setFact("reset-session", "preference", "telugu");
  store.clearData("reset-session");
  assert.deepEqual(store.get("reset-session")?.messages, []);
  assert.deepEqual(store.get("reset-session")?.facts, {});
  store.appendMessage("reset-session", "user", "fresh conversation");
  assert.equal(store.get("reset-session")?.messages.length, 1);
});

test("session clear removes it and rejects later access", () => {
  const store = new SessionContextStore();
  store.create("remove-session");
  assert.equal(store.clear("remove-session"), true);
  assert.equal(store.clear("remove-session"), false);
  assert.throws(() => store.appendMessage("remove-session", "user", "x"), /Unknown session/);
});
