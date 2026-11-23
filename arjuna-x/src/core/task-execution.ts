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

const MAX_OUTPUT_JSON_CHARS = 10_000;
const MAX_ACTIONS_PER_RUN = 100;
const MAX_ACTION_ID_LENGTH = 128;
const MAX_ACTION_DESCRIPTION_LENGTH = 1_000;

function boundOutput(output: unknown): unknown {
  if (output === undefined) return undefined;
  try {
    const serialized = JSON.stringify(output);
    if (serialized === undefined) return "[Output omitted: not JSON-serializable]";
    if (serialized.length <= MAX_OUTPUT_JSON_CHARS) return output;
    return `[Output truncated: ${serialized.slice(0, MAX_OUTPUT_JSON_CHARS)}]`;
  } catch {
    return "[Output omitted: serialization failed]";
  }
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
      if (actionId.length > MAX_ACTION_ID_LENGTH) throw new Error(`Action id exceeds maximum length of ${MAX_ACTION_ID_LENGTH}`);
      if (seenIds.has(actionId)) throw new Error(`Duplicate action id: ${actionId}`);
      seenIds.add(actionId);
      if (![0, 1, 2, 3, 4].includes(action.permissionTier)) throw new Error(`Invalid permission tier for action ${action.id}`);
      if (action.retrySafe !== undefined && typeof action.retrySafe !== "boolean") throw new Error(`retrySafe must be a boolean for action ${action.id}`);
      if (typeof action.description !== "string" || !action.description.trim()) throw new Error(`Action description is required for ${action.id}`);
      if (action.description.trim().length > MAX_ACTION_DESCRIPTION_LENGTH) throw new Error(`Action description exceeds maximum length of ${MAX_ACTION_DESCRIPTION_LENGTH} for ${action.id}`);
      if (action.status !== "QUEUED" && action.status !== "READY") throw new Error(`Action ${action.id} is not runnable from status ${action.status}`);
    }
    if (options.userConfirmedActionIds !== undefined && (!Array.isArray(options.userConfirmedActionIds) || options.userConfirmedActionIds.some((id) => typeof id !== "string"))) throw new Error("userConfirmedActionIds must be an array of strings");
    if (options.specialApprovalActionIds !== undefined && (!Array.isArray(options.specialApprovalActionIds) || options.specialApprovalActionIds.some((id) => typeof id !== "string"))) throw new Error("specialApprovalActionIds must be an array of strings");
    if (options.signal !== undefined && (!options.signal || typeof options.signal.aborted !== "boolean" || typeof options.signal.addEventListener !== "function")) throw new Error("signal must be a valid AbortSignal");
    for (const [label, ids] of [["userConfirmedActionIds", options.userConfirmedActionIds], ["specialApprovalActionIds", options.specialApprovalActionIds]] as const) {
      if (ids && (ids.length > MAX_ACTIONS_PER_RUN || ids.some((id) => !id.trim() || id.trim().length > MAX_ACTION_ID_LENGTH))) throw new Error(`${label} contains invalid or excessive action IDs`);
      if (ids && new Set(ids.map((id) => id.trim())).size !== ids.length) throw new Error(`${label} contains duplicate action IDs`);
      if (ids && ids.some((id) => !seenIds.has(id.trim()))) throw new Error(`${label} contains IDs not present in this execution plan`);
    }
    if (options.signal !== undefined && (!options.signal || typeof options.signal.aborted !== "boolean" || typeof options.signal.addEventListener !== "function")) throw new Error("signal must be a valid AbortSignal");
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
          results.push({ actionId: action.id.trim(), status: "SKIPPED", attempts, error: "Execution cancelled before attempt" });
          break;
        }
        attempts += 1;
        try {
          const output = await this.executor.execute({ ...action, id: action.id.trim(), description: action.description.trim() }, options.signal);
          if (options.signal?.aborted) {
            results.push({ actionId: action.id.trim(), status: "SKIPPED", attempts, error: "Execution cancelled after action completion" });
            break;
          }
          results.push({ actionId: action.id.trim(), status: "SUCCEEDED", attempts, output: boundOutput(output) });
          break;
        } catch (error) {
          const rawMessage = error instanceof Error ? error.message : String(error);
          const message = rawMessage.slice(0, 500);
          if (options.signal?.aborted) {
            results.push({ actionId: action.id.trim(), status: "SKIPPED", attempts, error: "Execution cancelled during action" });
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
