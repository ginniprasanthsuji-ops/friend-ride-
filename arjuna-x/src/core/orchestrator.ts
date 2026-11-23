import type { TaskRecord, TaskStatus } from "./task.js";
import { assertTransition } from "./state-machine.js";
import { permissionDecision, type PermissionTier } from "./permissions.js";

export interface PlannedAction {
  id: string;
  description: string;
  permissionTier: PermissionTier;
  status: TaskStatus;
}

export interface OrchestratorPlan {
  sessionId: string;
  request: string;
  actions: PlannedAction[];
  createdAt: string;
}

export function createPlan(sessionId: string, request: string, actions: Omit<PlannedAction, "status">[]): OrchestratorPlan {
  if (!sessionId.trim()) throw new Error("sessionId is required");
  if (!request.trim()) throw new Error("request is required");
  return {
    sessionId,
    request,
    actions: actions.map((action) => ({ ...action, status: "QUEUED" })),
    createdAt: new Date().toISOString(),
  };
}

export function authorizeAction(tier: PermissionTier, userConfirmed = false, specialApproval = false) {
  return permissionDecision({ tier, action: "orchestrated-action", userConfirmed, specialApproval });
}

export function transitionTask(task: TaskRecord, nextStatus: TaskStatus): TaskRecord {
  assertTransition(task.status, nextStatus);
  return { ...task, status: nextStatus, updatedAt: new Date().toISOString() };
}
