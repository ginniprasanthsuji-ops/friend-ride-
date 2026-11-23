export type TaskStatus =
  | "QUEUED"
  | "READY"
  | "RUNNING"
  | "WAITING_APPROVAL"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED"
  | "BLOCKED"
  | "CANCELLED";

export type TaskPriority = "P0" | "P1" | "P2" | "P3";

export interface TaskRecord {
  id: string;
  sessionId: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  requiresApproval: boolean;
}

export const terminalTaskStatuses: readonly TaskStatus[] = [
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

export function isTerminalTaskStatus(status: TaskStatus): boolean {
  return terminalTaskStatuses.includes(status);
}
