import test from "node:test";
import assert from "node:assert/strict";
import { canTransition, assertTransition } from "../core/state-machine.js";
import { isTerminalTaskStatus, terminalTaskStatuses, type TaskStatus, type TaskRecord } from "../core/task.js";
import { transitionTask } from "../core/orchestrator.js";

const statuses: TaskStatus[] = ["QUEUED", "READY", "RUNNING", "WAITING_APPROVAL", "VERIFYING", "COMPLETED", "FAILED", "BLOCKED", "CANCELLED"];

test("all task statuses have explicit terminal classification", () => {
  assert.deepEqual(terminalTaskStatuses, ["COMPLETED", "FAILED", "CANCELLED"]);
  for (const status of statuses) {
    assert.equal(isTerminalTaskStatus(status), terminalTaskStatuses.includes(status));
  }
});

test("terminal tasks cannot transition further", () => {
  for (const status of terminalTaskStatuses) {
    for (const next of statuses) assert.equal(canTransition(status, next), false, `${status} -> ${next}`);
  }
});

test("invalid transitions throw a clear error", () => {
  assert.throws(() => assertTransition("QUEUED", "RUNNING"), /Invalid task transition/);
  assert.throws(() => assertTransition("COMPLETED", "READY"), /Invalid task transition/);
});

test("transitionTask returns a new record and preserves source", () => {
  const task: TaskRecord = {
    id: "task-1", sessionId: "session-1", title: "QA task", status: "QUEUED",
    priority: "P2", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
    requiresApproval: false,
  };
  const next = transitionTask(task, "READY");
  assert.notEqual(next, task);
  assert.equal(next.status, "READY");
  assert.equal(task.status, "QUEUED");
  assert.notEqual(next.updatedAt, task.updatedAt);
});

test("approved workflow path remains valid", () => {
  const path: TaskStatus[] = ["QUEUED", "READY", "WAITING_APPROVAL", "READY", "RUNNING", "VERIFYING", "COMPLETED"];
  for (let i = 0; i < path.length - 1; i++) assertTransition(path[i]!, path[i + 1]!);
});

test("unknown runtime state values are rejected safely", () => {
  assert.equal(canTransition("UNKNOWN" as TaskStatus, "READY"), false);
  assert.equal(canTransition("QUEUED", "UNKNOWN" as TaskStatus), false);
  assert.throws(() => assertTransition("UNKNOWN" as TaskStatus, "READY"), /Invalid task transition/);
});
