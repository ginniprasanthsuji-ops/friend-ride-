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

test("execution results use normalized action identifiers", async () => {
  const runtime = new TaskExecutionRuntime({ async execute() { return "ok"; } });
  const result = await runtime.run([{ ...action, id: "  action-normalized  " }]);
  assert.equal(result[0]?.actionId, "action-normalized");
});

test("cancelled result paths preserve normalized action IDs", async () => {
  const controller = new AbortController();
  controller.abort();
  const runtime = new TaskExecutionRuntime({ async execute() { return "should not run"; } });
  const result = await runtime.run([{ ...action, id: "  cancelled-id  " }], { signal: controller.signal });
  assert.equal(result[0]?.actionId, "cancelled-id");
  assert.equal(result[0]?.status, "SKIPPED");
});

test("invalid planned action status is rejected before execution", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([{ ...action, status: "INVALID" as never }]), /Invalid task status/);
  assert.equal(executions, 0);
});

test("executor rejects non-runnable action states before any execution", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  for (const status of ["RUNNING", "WAITING_APPROVAL", "VERIFYING", "COMPLETED", "FAILED", "BLOCKED", "CANCELLED"]) {
    await assert.rejects(() => runtime.run([{ ...action, status: status as never }]), /not runnable from status/);
  }
  assert.equal(executions, 0);
});

test("oversized executor outputs are truncated to a bounded result payload", async () => {
  const runtime = new TaskExecutionRuntime({ async execute() { return "x".repeat(20_000); } });
  const result = await runtime.run([action]);
  assert.equal(result[0]?.status, "SUCCEEDED");
  assert.equal(typeof result[0]?.output, "string");
  assert.ok((result[0]?.output as string).length <= 10_050);
  assert.match(result[0]?.output as string, /^\[Output truncated:/);
});

test("circular executor output is safely omitted instead of crashing", async () => {
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  const runtime = new TaskExecutionRuntime({ async execute() { return circular; } });
  const result = await runtime.run([action]);
  assert.equal(result[0]?.status, "SUCCEEDED");
  assert.equal(result[0]?.output, "[Output omitted: serialization failed]");
});

test("executor rejects plans exceeding the per-run action cap", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  const oversized = Array.from({ length: 101 }, (_, i) => ({ ...action, id: "a" + i }));
  await assert.rejects(() => runtime.run(oversized), /Action count exceeds maximum of 100/);
  assert.equal(executions, 0);
});

test("action IDs and descriptions have input length caps", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([{ ...action, id: "i".repeat(129) }]), /Action id exceeds maximum length/);
  await assert.rejects(() => runtime.run([{ ...action, description: "d".repeat(1001) }]), /Action description exceeds maximum length/);
  assert.equal(executions, 0);
});

test("executor receives trimmed action ID and description", async () => {
  let captured: PlannedAction | undefined;
  const runtime = new TaskExecutionRuntime({ async execute(current) { captured = current; return "ok"; } });
  await runtime.run([{ ...action, id: "  trimmed-id  ", description: "  normalized description  " }]);
  assert.equal(captured?.id, "trimmed-id");
  assert.equal(captured?.description, "normalized description");
});

test("runtime rejects malformed cancellation signal before executor", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([action], { signal: { aborted: false } as AbortSignal }), /signal must be a valid AbortSignal/);
  assert.equal(executions, 0);
});

test("valid cancellation signal is passed to executor and execution completes", async () => {
  const controller = new AbortController();
  let receivedSignal: AbortSignal | undefined;
  const runtime = new TaskExecutionRuntime({
    async execute(_current, signal) { receivedSignal = signal; return "done"; },
  });
  const result = await runtime.run([action], { signal: controller.signal });
  assert.equal(receivedSignal, controller.signal);
  assert.equal(result[0]?.status, "SUCCEEDED");
});

test("approval ID lists are bounded and validated before execution", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([action], { userConfirmedActionIds: ["x".repeat(129)] }), /userConfirmedActionIds contains invalid or excessive action IDs/);
  await assert.rejects(() => runtime.run([action], { specialApprovalActionIds: Array.from({ length: 101 }, (_, i) => "a" + i) }), /specialApprovalActionIds contains invalid or excessive action IDs/);
  await assert.rejects(() => runtime.run([action], { userConfirmedActionIds: ["  "] }), /userConfirmedActionIds contains invalid or excessive action IDs/);
  assert.equal(executions, 0);
});

test("approval ID lists reject duplicate IDs after trimming", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([action], { userConfirmedActionIds: ["a1", " a1 "] }), /userConfirmedActionIds contains duplicate action IDs/);
  await assert.rejects(() => runtime.run([action], { specialApprovalActionIds: ["a1", "a1"] }), /specialApprovalActionIds contains duplicate action IDs/);
  assert.equal(executions, 0);
});

test("approval IDs must belong to actions in the current plan", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([action], { userConfirmedActionIds: ["other-action"] }), /IDs not present in this execution plan/);
  await assert.rejects(() => runtime.run([action], { specialApprovalActionIds: ["other-action"] }), /IDs not present in this execution plan/);
  assert.equal(executions, 0);
});

test("reject conflicting user-confirmation and special-approval grants", async () => {
  let executions = 0;
  const runtime = new TaskExecutionRuntime({ async execute() { executions++; return "ok"; } });
  await assert.rejects(() => runtime.run([action], { userConfirmedActionIds: ["a1"], specialApprovalActionIds: [" a1 "] }), /both confirmation and special approval grants/);
  assert.equal(executions, 0);
});
