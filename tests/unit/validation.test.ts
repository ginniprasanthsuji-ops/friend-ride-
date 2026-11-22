import { describe, expect, it } from "vitest";
import {
  isFinitePositiveNumber,
  isNonEmptyString,
  isRecord
} from "../../src/core/validation";

describe("runtime validation guards", () => {
  it("recognizes plain object records", () => {
    expect(isRecord({ id: "x" })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
  });

  it("recognizes non-empty strings without accepting whitespace", () => {
    expect(isNonEmptyString("FRIEND RIDE")).toBe(true);
    expect(isNonEmptyString("   ")).toBe(false);
    expect(isNonEmptyString(12)).toBe(false);
  });

  it("accepts only finite positive numbers", () => {
    expect(isFinitePositiveNumber(1)).toBe(true);
    expect(isFinitePositiveNumber(0)).toBe(false);
    expect(isFinitePositiveNumber(Number.NaN)).toBe(false);
    expect(isFinitePositiveNumber(Infinity)).toBe(false);
  });
});