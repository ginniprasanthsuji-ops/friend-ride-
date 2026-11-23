import { describe, expect, it } from "vitest";
import { validateGinnyAssistantRequest, normalizeGinnyDisplayText } from "../core/ginny-assistant-message";
const base = { language: "te" as const, message: "  నమస్కారం Ginny  ", sessionId: " session-1 ", consentedToSend: true };
describe("Ginny assistant request validation", () => {
  it("normalizes valid requests", () => {
    const result = validateGinnyAssistantRequest(base);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.normalized.message).toBe("నమస్కారం Ginny");
  });
  it("requires consent before external request", () => {
    expect(validateGinnyAssistantRequest({ ...base, consentedToSend: false })).toEqual({ valid: false, reason: "consent-required" });
  });
  it("rejects empty, oversized, and sessionless messages", () => {
    expect(validateGinnyAssistantRequest({ ...base, message: "  " })).toEqual({ valid: false, reason: "empty-message" });
    expect(validateGinnyAssistantRequest({ ...base, message: "a".repeat(4001) })).toEqual({ valid: false, reason: "message-too-long" });
    expect(validateGinnyAssistantRequest({ ...base, sessionId: " " })).toEqual({ valid: false, reason: "missing-session" });
  });
  it("removes control chars and caps display output", () => {
    expect(normalizeGinnyDisplayText("hello\\u0000 world")).toBe("hello world");
    expect(normalizeGinnyDisplayText("x".repeat(9000)).length).toBe(8000);
  });
});
