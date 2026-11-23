import type { GinnyLanguage } from "./ginny-assistant-localization";
export type GinnyConversationMessage = { id: string; role: "user" | "assistant"; text: string; language: GinnyLanguage; timestamp: number };
export type GinnyConversationState = { sessionId: string; messages: GinnyConversationMessage[]; status: "idle" | "sending" | "cancelled" | "error"; error?: string };
export type GinnyConversationEvent =
  | { type: "submit-user-message"; message: GinnyConversationMessage }
  | { type: "assistant-response"; message: GinnyConversationMessage }
  | { type: "cancel" }
  | { type: "failure"; error?: string }
  | { type: "reset" };
const MAX_MESSAGES = 100;
const MAX_TEXT = 8000;
export function createGinnyConversation(sessionId: string): GinnyConversationState {
  return { sessionId: sessionId.trim(), messages: [], status: "idle" };
}
/** Pure conversation reducer. API requests/history persistence are intentionally out of scope. */
export function updateGinnyConversation(state: GinnyConversationState, event: GinnyConversationEvent): GinnyConversationState {
  if (event.type === "reset") return { sessionId: state.sessionId, messages: [], status: "idle" };
  if (event.type === "cancel") return { ...state, status: "cancelled", error: undefined };
  if (event.type === "failure") return { ...state, status: "error", error: (event.error ?? "Assistant request failed").trim().slice(0, 500) };
  if (event.type === "submit-user-message") {
    const text = event.message.text.trim().slice(0, MAX_TEXT);
    if (!text || state.status === "sending") return state;
    const message = { ...event.message, text };
    return { ...state, messages: [...state.messages, message].slice(-MAX_MESSAGES), status: "sending", error: undefined };
  }
  if (event.type === "assistant-response") {
    if (state.status !== "sending") return state; // Ignore late response after cancellation/other state.
    const text = event.message.text.trim().slice(0, MAX_TEXT);
    if (!text) return { ...state, status: "idle" };
    return { ...state, messages: [...state.messages, { ...event.message, text }].slice(-MAX_MESSAGES), status: "idle", error: undefined };
  }
  return state;
}
