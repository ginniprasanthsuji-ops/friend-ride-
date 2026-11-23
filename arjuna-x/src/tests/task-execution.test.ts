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
