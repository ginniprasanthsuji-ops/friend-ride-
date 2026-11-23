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
