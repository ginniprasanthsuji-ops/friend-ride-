import test from "node:test";
import assert from "node:assert/strict";
import { TaskExecutionRuntime } from "../dist/core/task-execution.js";

const action = (id, tier) => ({ id, description: id, permissionTier: tier, status: "QUEUED" });

test("execution runtime gates booking actions until confirmation", async () => {
  let calls = 0;
  const runtime = new TaskExecutionRuntime({ execute: async () => { calls++; return "ok"; } });
  const results = await runtime.run([action("book", 3)]);
  assert.equal(results[0].status, "NEEDS_CONFIRMATION");
  assert.equal(calls, 0);
});

test("execution runtime gates tier 4 special approval", async () => {
  let calls = 0;
  const runtime = new TaskExecutionRuntime({ execute: async () => { calls++; } });
  const results = await runtime.run([action("sensitive", 4)]);
  assert.equal(results[0].status, "NEEDS_SPECIAL_APPROVAL");
  assert.equal(calls, 0);
});

test("approved action executes and bounded retry recovers", async () => {
  let calls = 0;
  const runtime = new TaskExecutionRuntime({ execute: async () => {
    calls++;
    if (calls < 2) throw new Error("temporary");
    return { ok: true };
  } });
  const results = await runtime.run([action("booking", 3)], { userConfirmedActionIds: ["booking"], maxRetries: 1 });
  assert.equal(results[0].status, "SUCCEEDED");
  assert.equal(results[0].attempts, 2);
});

test("retry limit rejects unsafe/unbounded configuration", async () => {
  const runtime = new TaskExecutionRuntime({ execute: async () => undefined });
  await assert.rejects(runtime.run([], { maxRetries: 100 }), /between 0 and 3/);
});

test("executor failure is reported after bounded attempts", async () => {
  const runtime = new TaskExecutionRuntime({ execute: async () => { throw new Error("down"); } });
  const results = await runtime.run([action("read", 1)], { maxRetries: 2 });
  assert.equal(results[0].status, "FAILED");
  assert.equal(results[0].attempts, 3);
});
test("execution runtime rejects duplicate action IDs and invalid tiers", async () => {
  const runtime = new TaskExecutionRuntime({ execute: async () => undefined });
  await assert.rejects(runtime.run([action("dup", 1), action("dup", 1)]), /Duplicate action id/);
  await assert.rejects(runtime.run([action("bad-tier", 8)]), /Invalid permission tier/);
  await assert.rejects(runtime.run([{ ...action("blank", 1), id: " " }]), /non-empty id/);
});

test("aborted execution returns a cancellation result rather than losing it", async () => {
  const controller = new AbortController();
  const runtime = new TaskExecutionRuntime({ execute: async () => {
    controller.abort();
    throw new Error("aborted by executor");
  } });
  const results = await runtime.run([action("cancelled", 1)], { signal: controller.signal, maxRetries: 2 });
  assert.equal(results[0].status, "SKIPPED");
  assert.equal(results[0].attempts, 1);
  assert.match(results[0].error, /cancelled/);
});
