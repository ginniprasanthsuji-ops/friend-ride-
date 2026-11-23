import type { GinnyLanguage } from "./ginny-assistant-localization";
import { evaluateGinnyVoiceReadiness, ginnyListeningTransition, type GinnyVoiceAvailability, type GinnyListeningState } from "./ginny-voice-readiness";

export type GinnyVoiceSession = { language: GinnyLanguage; state: GinnyListeningState; readiness: ReturnType<typeof evaluateGinnyVoiceReadiness>; transcript: string; error?: string };
export function createGinnyVoiceSession(language: GinnyLanguage, capabilities: GinnyVoiceAvailability): GinnyVoiceSession {
  return { language, state: "idle", readiness: evaluateGinnyVoiceReadiness(language, capabilities), transcript: "" };
}
/** Reducer-like session updates; no microphone access or speech engine side effects. */
export function updateGinnyVoiceSession(session: GinnyVoiceSession, event: "request" | "permission-granted" | "capture-started" | "stop" | "failure", error?: string): GinnyVoiceSession {
  if (event === "request" && !session.readiness.canListen) return { ...session, state: "error", error: session.readiness.listenReason };
  const next = ginnyListeningTransition(session.state, event);
  return { ...session, state: next, error: event === "failure" ? (error ?? "Voice session failed") : undefined };
}
export function appendGinnyTranscript(session: GinnyVoiceSession, text: string): GinnyVoiceSession {
  if (session.state !== "listening") return session;
  const safeText = text.trim().slice(0, 4000);
  return safeText ? { ...session, transcript: safeText } : session;
}
