import { describe, expect, it } from "vitest";
import { err, matchResult, ok } from "../../src/core/result";

describe("Result", () => {
  it("returns successful values through the success branch", () => {
    expect(matchResult(ok(42), {
      onOk: value => value + 1,
      onError: () => 0
    })).toBe(43);
  });

  it("returns errors through the error branch", () => {
    expect(matchResult(err("invalid"), {
      onOk: () => "unexpected",
      onError: error => error
    })).toBe("invalid");
  });
});