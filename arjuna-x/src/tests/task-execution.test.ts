import test from "node:test";
import assert from "node:assert/strict";
import { TaskExecutionRuntime } from "../core/task-execution.js";
import type { PlannedAction } from "../core/orchestrator.js";

const action: PlannedAction = { id: "a1", description: "test action", permissionTier: 0, status: "QUEUED" };

test("cancelled action emits one terminal SKIPPED result, not FAILED plus SKIPPED", async () => {
  const controller = new AbortController();
  const runtime = new TaskExecutionRuntime({
    async execute() {
      controller.abort();
      throw new Error("cancelled");
    },
  });
  const results = await runtime.run([action], { signal: controller.signal, maxRetries: 1 });
  assert.equal(results.length, 1);
  assert.equal(results[0]?.status, "SKIPPED");
  assert.equal(results[0]?.attempts, 1);
});

test("tier 3 action requires explicit confirmation", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({
    async execute() { executions += 1; return "ok"; },
  });
  const result = await runtime.run([{ ...action, permissionTier: 3 }]);
  assert.equal(result[0]?.status, "NEEDS_CONFIRMATION");
  assert.equal(executions, 0);
});

test("unsafe actions do not retry even when global retry count is set", async () => {
  let attempts = 0;
  const runtime = new TaskExecutionRuntime({
    async execute() { attempts++; throw new Error("transient"); },
  });
  const result = await runtime.run([action], { maxRetries: 3 });
  assert.equal(attempts, 1);
  assert.equal(result[0]?.attempts, 1);
  assert.equal(result[0]?.status, "FAILED");
});

test("explicit retry-safe action retries within configured bound", async () => {
  let attempts = 0;
  const runtime = new TaskExecutionRuntime({
    async execute() {
      attempts++;
      if (attempts < 3) throw new Error("temporary");
      return "recovered";
    },
  });
  const result = await runtime.run([{ ...action, retrySafe: true }], { maxRetries: 2 });
  assert.equal(attempts, 3);
  assert.equal(result[0]?.status, "SUCCEEDED");
  assert.equal(result[0]?.attempts, 3);
  assert.equal(result[0]?.output, "recovered");
});

test("retry-safe action still obeys retry limit", async () => {
  let attempts = 0;
  const runtime = new TaskExecutionRuntime({
    async execute() { attempts++; throw new Error("always fails"); },
  });
  const result = await runtime.run([{ ...action, retrySafe: true }], { maxRetries: 1 });
  assert.equal(attempts, 2);
  assert.equal(result[0]?.status, "FAILED");
  assert.equal(result[0]?.attempts, 2);
});

test("tier 4 action requires special approval, not normal confirmation", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  const denied = await runtime.run([{ ...action, permissionTier: 4 }], { userConfirmedActionIds: ["a1"] });
  assert.equal(denied[0]?.status, "NEEDS_SPECIAL_APPROVAL");
  assert.equal(executions, 0);
  const approved = await runtime.run([{ ...action, permissionTier: 4 }], { specialApprovalActionIds: ["a1"] });
  assert.equal(approved[0]?.status, "SUCCEEDED");
  assert.equal(executions, 1);
});

test("duplicate action IDs are rejected before any execution", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([action, { ...action }]), /Duplicate action id/);
  assert.equal(executions, 0);
});

test("retry configuration outside supported bounds is rejected", async () => {
  const runtime = new TaskExecutionRuntime({ async execute() { return "ok"; } });
  await assert.rejects(() => runtime.run([action], { maxRetries: 4 }), /between 0 and 3/);
  await assert.rejects(() => runtime.run([action], { maxRetries: -1 }), /between 0 and 3/);
});

test("executor validates action retrySafe and malformed approval lists before execution", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([{ ...action, retrySafe: "true" } as never]), /retrySafe must be a boolean/);
  await assert.rejects(() => runtime.run([action], { userConfirmedActionIds: "a1" as never }), /array of strings/);
  await assert.rejects(() => runtime.run([action], { specialApprovalActionIds: [1] as never }), /array of strings/);
  assert.equal(executions, 0);
});

test("duplicate IDs with surrounding whitespace are rejected", async () => {
  const runtime = new TaskExecutionRuntime({ async execute() { return "ok"; } });
  await assert.rejects(() => runtime.run([{ ...action, id: "a1 " }, { ...action, id: " a1" }]), /Duplicate action id/);
});

test("approval IDs are trimmed and matched against normalized action IDs", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  const result = await runtime.run([{ ...action, id: " action-3 ", permissionTier: 3 }], {
    userConfirmedActionIds: ["action-3 "],
  });
  assert.equal(result[0]?.status, "SUCCEEDED");
  assert.equal(executions, 1);
});

test("malformed actions array entries are rejected before executor runs", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([null as never]), /non-empty id/);
  assert.equal(executions, 0);
});

test("cancellation between actions prevents later executor calls", async () => {
  const controller = new AbortController();
  const seen: string[] = [];
  const runtime = new TaskExecutionRuntime({
    async execute(current) {
      seen.push(current.id);
      controller.abort();
      return "done";
    },
  });
  const result = await runtime.run([{ ...action, id: "first" }, { ...action, id: "second" }], { signal: controller.signal });
  assert.deepEqual(seen, ["first"]);
  assert.deepEqual(result.map((item) => item.status), ["SUCCEEDED", "SKIPPED"]);
});

test("execution failure error details are capped to avoid oversized payloads", async () => {
  const runtime = new TaskExecutionRuntime({ async execute() { throw new Error("x".repeat(1200)); } });
  const result = await runtime.run([action]);
  assert.equal(result[0]?.status, "FAILED");
  assert.equal(result[0]?.error?.length, 500);
});

test("cancellation signal after executor resolves marks action SKIPPED", async () => {
  const controller = new AbortController();
  const runtime = new TaskExecutionRuntime({
    async execute() {
      controller.abort();
      return "late output";
    },
  });
  const result = await runtime.run([action], { signal: controller.signal });
  assert.equal(result[0]?.status, "SKIPPED");
  assert.equal(result[0]?.output, undefined);
});

test("empty or non-string action descriptions are rejected before execution", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([{ ...action, description: "   " }]), /Action description is required/);
  await assert.rejects(() => runtime.run([{ ...action, description: 123 } as never]), /Action description is required/);
  assert.equal(executions, 0);
});
