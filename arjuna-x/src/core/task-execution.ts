import { authorizeAction, type PlannedAction } from "./orchestrator.js";
import type { PermissionTier } from "./permissions.js";

export type ActionExecutionStatus = "SUCCEEDED" | "FAILED" | "SKIPPED" | "NEEDS_CONFIRMATION" | "NEEDS_SPECIAL_APPROVAL";

export interface ActionExecutionResult {
  actionId: string;
  status: ActionExecutionStatus;
  attempts: number;
  output?: unknown;
  error?: string;
}

export interface ActionExecutor {
  execute(action: PlannedAction, signal?: AbortSignal): Promise<unknown>;
}

export interface ExecutionOptions {
  userConfirmedActionIds?: string[];
  specialApprovalActionIds?: string[];
  maxRetries?: number;
  signal?: AbortSignal;
}

function validateRetries(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 3) throw new Error("maxRetries must be an integer between 0 and 3");
  return value;
}

/** Safe sequential executor: permissions gate each action; retries are bounded; no default real-world executor. */
export class TaskExecutionRuntime {
  constructor(private readonly executor: ActionExecutor) {}

  async run(actions: PlannedAction[], options: ExecutionOptions = {}): Promise<ActionExecutionResult[]> {
    const maxRetries = validateRetries(options.maxRetries ?? 0);
    const seenIds = new Set<string>();
    if (!Array.isArray(actions)) throw new Error("actions must be an array");
    for (const action of actions) {
      if (!action || typeof action.id !== "string" || !action.id.trim()) throw new Error("Every action must have a non-empty id");
      const actionId = action.id.trim();
      if (seenIds.has(actionId)) throw new Error(`Duplicate action id: ${actionId}`);
      seenIds.add(actionId);
      if (![0, 1, 2, 3, 4].includes(action.permissionTier)) throw new Error(`Invalid permission tier for action ${action.id}`);
      if (action.retrySafe !== undefined && typeof action.retrySafe !== "boolean") throw new Error(`retrySafe must be a boolean for action ${action.id}`);
      if (typeof action.description !== "string" || !action.description.trim()) throw new Error(`Action description is required for ${action.id}`);
    }
    if (options.userConfirmedActionIds !== undefined && (!Array.isArray(options.userConfirmedActionIds) || options.userConfirmedActionIds.some((id) => typeof id !== "string"))) throw new Error("userConfirmedActionIds must be an array of strings");
    if (options.specialApprovalActionIds !== undefined && (!Array.isArray(options.specialApprovalActionIds) || options.specialApprovalActionIds.some((id) => typeof id !== "string"))) throw new Error("specialApprovalActionIds must be an array of strings");
    const confirmed = new Set((options.userConfirmedActionIds ?? []).map((id) => id.trim()));
    const specialApproved = new Set((options.specialApprovalActionIds ?? []).map((id) => id.trim()));
    const results: ActionExecutionResult[] = [];

    for (const action of actions) {
      if (options.signal?.aborted) {
        results.push({ actionId: action.id.trim(), status: "SKIPPED", attempts: 0, error: "Execution cancelled" });
        continue;
      }
      const decision = authorizeAction(
        action.permissionTier as PermissionTier,
        confirmed.has(action.id.trim()),
        specialApproved.has(action.id.trim()),
      );
      if (decision === "REQUIRE_CONFIRMATION") {
        results.push({ actionId: action.id.trim(), status: "NEEDS_CONFIRMATION", attempts: 0 });
        continue;
      }
      if (decision === "REQUIRE_SPECIAL_APPROVAL") {
        results.push({ actionId: action.id.trim(), status: "NEEDS_SPECIAL_APPROVAL", attempts: 0 });
        continue;
      }

      // Retry only actions explicitly marked safe/idempotent; all others run once.
      const actionRetries = action.retrySafe === true ? maxRetries : 0;
      let attempts = 0;
      while (attempts <= actionRetries) {
        if (options.signal?.aborted) {
          results.push({ actionId: action.id, status: "SKIPPED", attempts, error: "Execution cancelled before attempt" });
          break;
        }
        attempts += 1;
        try {
          const output = await this.executor.execute(action, options.signal);
          if (options.signal?.aborted) {
            results.push({ actionId: action.id, status: "SKIPPED", attempts, error: "Execution cancelled after action completion" });
            break;
          }
          results.push({ actionId: action.id.trim(), status: "SUCCEEDED", attempts, output });
          break;
        } catch (error) {
          const rawMessage = error instanceof Error ? error.message : String(error);
          const message = rawMessage.slice(0, 500);
          if (options.signal?.aborted) {
            results.push({ actionId: action.id, status: "SKIPPED", attempts, error: "Execution cancelled during action" });
            break;
          }
          if (attempts > actionRetries) {
            results.push({ actionId: action.id.trim(), status: "FAILED", attempts, error: message });
          }
        }
      }
    }
    return results;
  }
}
