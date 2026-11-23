import type { TaskRecord, TaskStatus } from "./task.js";
import { assertTransition } from "./state-machine.js";
import { permissionDecision, type PermissionTier } from "./permissions.js";

export interface PlannedAction {
  id: string;
  description: string;
  permissionTier: PermissionTier;
  status: TaskStatus;
  /** Opt-in only: retries are allowed only when the action is idempotent/safe to repeat. */
  retrySafe?: boolean;
}

export interface OrchestratorPlan {
  sessionId: string;
  request: string;
  actions: PlannedAction[];
  createdAt: string;
}

export function createPlan(sessionId: string, request: string, actions: Omit<PlannedAction, "status">[]): OrchestratorPlan {
  if (typeof sessionId !== "string" || !sessionId.trim()) throw new Error("sessionId is required");
  if (typeof request !== "string" || !request.trim()) throw new Error("request is required");
  if (!Array.isArray(actions)) throw new Error("actions must be an array");

  const seenIds = new Set<string>();
  const validatedActions = actions.map((action) => {
    if (!action || typeof action !== "object") throw new Error("Action must be an object");
    if (typeof action.id !== "string" || !action.id.trim()) throw new Error("Action id is required");
    const id = action.id.trim();
    if (seenIds.has(id)) throw new Error(`Duplicate action id: ${id}`);
    seenIds.add(id);
    if (typeof action.description !== "string" || !action.description.trim()) throw new Error(`Action description is required: ${id}`);
    if (!Number.isInteger(action.permissionTier) || ![0, 1, 2, 3, 4].includes(action.permissionTier)) {
      throw new Error(`Invalid permission tier for action ${id}`);
    }
    return { id, description: action.description.trim(), permissionTier: action.permissionTier, status: "QUEUED" as const };
  });

  return {
    sessionId: sessionId.trim(),
    request: request.trim(),
    actions: validatedActions,
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
