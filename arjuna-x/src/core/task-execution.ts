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
    for (const action of actions) {
      if (!action || typeof action.id !== "string" || !action.id.trim()) throw new Error("Every action must have a non-empty id");
      if (seenIds.has(action.id)) throw new Error(`Duplicate action id: ${action.id}`);
      seenIds.add(action.id);
      if (![0, 1, 2, 3, 4].includes(action.permissionTier)) throw new Error(`Invalid permission tier for action ${action.id}`);
    }
    const confirmed = new Set(options.userConfirmedActionIds ?? []);
    const specialApproved = new Set(options.specialApprovalActionIds ?? []);
    const results: ActionExecutionResult[] = [];

    for (const action of actions) {
      if (options.signal?.aborted) {
        results.push({ actionId: action.id, status: "SKIPPED", attempts: 0, error: "Execution cancelled" });
        continue;
      }
      const decision = authorizeAction(
        action.permissionTier as PermissionTier,
        confirmed.has(action.id),
        specialApproved.has(action.id),
      );
      if (decision === "REQUIRE_CONFIRMATION") {
        results.push({ actionId: action.id, status: "NEEDS_CONFIRMATION", attempts: 0 });
        continue;
      }
      if (decision === "REQUIRE_SPECIAL_APPROVAL") {
        results.push({ actionId: action.id, status: "NEEDS_SPECIAL_APPROVAL", attempts: 0 });
        continue;
      }

      let attempts = 0;
      while (attempts <= maxRetries) {
        attempts += 1;
        try {
          const output = await this.executor.execute(action, options.signal);
          results.push({ actionId: action.id, status: "SUCCEEDED", attempts, output });
          break;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (options.signal?.aborted) {
            results.push({ actionId: action.id, status: "SKIPPED", attempts, error: "Execution cancelled during action" });
            break;
          }
          if (attempts > maxRetries) {
            results.push({ actionId: action.id, status: "FAILED", attempts, error: message });
          }
        }
      }
    }
    return results;
  }
}
