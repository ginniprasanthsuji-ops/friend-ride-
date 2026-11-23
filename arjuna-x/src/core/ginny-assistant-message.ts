import type { GinnyLanguage } from "./ginny-assistant-localization";

export type GinnyMessageRole = "user" | "assistant";
export type GinnyMessage = { id: string; role: GinnyMessageRole; text: string; language: GinnyLanguage; createdAt: number };
export type GinnyAssistantRequest = { language: GinnyLanguage; message: string; displayName?: string; sessionId: string; consentedToSend: boolean };
export type GinnyAssistantRequestValidation = { valid: true; normalized: GinnyAssistantRequest } | { valid: false; reason: "empty-message" | "message-too-long" | "missing-session" | "consent-required" };

/** Validate before any external AI/API request. This helper does not transmit data. */
export function validateGinnyAssistantRequest(request: GinnyAssistantRequest): GinnyAssistantRequestValidation {
  const message = request.message.trim();
  if (!message) return { valid: false, reason: "empty-message" };
  if (message.length > 4000) return { valid: false, reason: "message-too-long" };
  if (!request.sessionId.trim()) return { valid: false, reason: "missing-session" };
  if (!request.consentedToSend) return { valid: false, reason: "consent-required" };
  const displayName = request.displayName?.trim().slice(0, 80) || undefined;
  return { valid: true, normalized: { ...request, message, sessionId: request.sessionId.trim(), displayName } };
}

/** Normalize display-safe message text, preserving ordinary Unicode scripts. */
export function normalizeGinnyDisplayText(text: string): string {
  return text.replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]/g, "").trim().slice(0, 8000);
}
