/** Runtime guards for values received from forms, storage, and APIs. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function assertNever(value: never, context = "Unexpected value"): never {
  throw new Error(`${context}: ${String(value)}`);
}