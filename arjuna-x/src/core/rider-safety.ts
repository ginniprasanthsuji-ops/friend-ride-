export type RiderSafetyStatus = "ACTIVE" | "GRACE" | "SAFE" | "ESCALATED" | "DISABLED";

export interface RiderSafetyState {
  etaAt: number;
  graceMs: number;
  status: RiderSafetyStatus;
  enabled: boolean;
  escalationIssued: boolean;
  safeConfirmedAt?: number;
  graceStartedAt?: number;
  extendedCount: number;
}

export interface RiderSafetyTransition {
  state: RiderSafetyState;
  action: "NONE" | "START_GRACE" | "ESCALATE" | "CONFIRM_SAFE" | "EXTEND" | "DISABLE";
}

export const DEFAULT_RIDER_SAFETY_GRACE_MS = 2 * 60 * 1000;
const MAX_ETA_EXTENSION_MS = 24 * 60 * 60 * 1000;

export function createRiderSafetyState(etaAt: number, enabled: boolean, graceMs = DEFAULT_RIDER_SAFETY_GRACE_MS): RiderSafetyState {
  if (!Number.isFinite(etaAt) || etaAt <= 0) throw new Error("etaAt must be a valid future timestamp");
  if (!Number.isFinite(graceMs) || graceMs < 0 || graceMs > 30 * 60 * 1000) throw new Error("graceMs must be between 0 and 30 minutes");
  return { etaAt, graceMs, status: enabled ? "ACTIVE" : "DISABLED", enabled, escalationIssued: false, extendedCount: 0 };
}

/** Pure transition: caller persists state and schedules reliable server-side notifications. */
export function riderSafetyTick(state: RiderSafetyState, now: number): RiderSafetyTransition {
  if (!Number.isFinite(now)) throw new Error("now must be a valid timestamp");
  if (!state.enabled || state.status === "DISABLED" || state.status === "SAFE" || state.status === "ESCALATED") return { state, action: "NONE" };
  if (now < state.etaAt) return { state, action: "NONE" };
  if (state.status === "ACTIVE") {
    const next = { ...state, status: "GRACE" as const, graceStartedAt: now };
    return { state: next, action: "START_GRACE" };
  }
  const graceStartedAt = state.graceStartedAt ?? state.etaAt;
  if (now >= graceStartedAt + state.graceMs && !state.escalationIssued) {
    const next = { ...state, status: "ESCALATED" as const, escalationIssued: true };
    return { state: next, action: "ESCALATE" };
  }
  return { state, action: "NONE" };
}

export function confirmRiderSafe(state: RiderSafetyState, now: number): RiderSafetyTransition {
  if (!Number.isFinite(now)) throw new Error("now must be a valid timestamp");
  if (!state.enabled || state.status === "DISABLED" || state.status === "ESCALATED") return { state, action: "NONE" };
  const next = { ...state, status: "SAFE" as const, safeConfirmedAt: now };
  return { state: next, action: "CONFIRM_SAFE" };
}

export function extendRiderSafetyEta(state: RiderSafetyState, newEtaAt: number, now: number): RiderSafetyTransition {
  if (!Number.isFinite(newEtaAt) || !Number.isFinite(now) || newEtaAt <= now || newEtaAt > now + MAX_ETA_EXTENSION_MS) throw new Error("new ETA must be within the next 24 hours");
  if (!state.enabled || state.status === "DISABLED" || state.status === "SAFE" || state.status === "ESCALATED") return { state, action: "NONE" };
  const next = { ...state, etaAt: newEtaAt, status: "ACTIVE" as const, graceStartedAt: undefined, extendedCount: state.extendedCount + 1 };
  return { state: next, action: "EXTEND" };
}

export function disableRiderSafety(state: RiderSafetyState): RiderSafetyTransition {
  const next = { ...state, enabled: false, status: "DISABLED" as const, graceStartedAt: undefined };
  return { state: next, action: "DISABLE" };
}
