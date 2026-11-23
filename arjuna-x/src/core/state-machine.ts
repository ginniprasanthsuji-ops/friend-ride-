import type { TaskStatus } from "./task.js";

const transitions: Record<TaskStatus, readonly TaskStatus[]> = {
  QUEUED: ["READY", "CANCELLED", "BLOCKED"],
  READY: ["RUNNING", "WAITING_APPROVAL", "CANCELLED", "BLOCKED"],
  RUNNING: ["WAITING_APPROVAL", "VERIFYING", "FAILED", "BLOCKED", "CANCELLED"],
  WAITING_APPROVAL: ["READY", "CANCELLED", "BLOCKED"],
  VERIFYING: ["COMPLETED", "FAILED", "BLOCKED"],
  COMPLETED: [],
  FAILED: ["READY", "CANCELLED"],
  BLOCKED: ["READY", "CANCELLED"],
  CANCELLED: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid task transition: ${from} -> ${to}`);
  }
}
