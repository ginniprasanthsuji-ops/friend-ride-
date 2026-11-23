import { describe, expect, it } from "vitest";
import { evaluateGinnyVoiceReadiness, ginnyListeningTransition } from "../core/ginny-voice-readiness";
const capabilities = { microphonePermission: "granted" as const, speechRecognitionAvailable: true, speechSynthesisAvailable: true, recognitionLocales: ["te-IN", "hi-IN", "en-IN"], synthesisLocales: ["te-IN", "hi-IN", "en-IN"] };

describe("Ginny voice readiness", () => {
  it("enables voice only when permission and both language capabilities are available", () => {
    expect(evaluateGinnyVoiceReadiness("te", capabilities).mode).toBe("voice");
  });
  it("uses text fallback when microphone permission is denied", () => {
    expect(evaluateGinnyVoiceReadiness("hi", { ...capabilities, microphonePermission: "denied" }).canListen).toBe(false);
  });
  it("uses text fallback when requested recognition locale is unavailable", () => {
    expect(evaluateGinnyVoiceReadiness("te", { ...capabilities, recognitionLocales: ["hi-IN"] }).listenReason).toBe("locale-unavailable");
  });
  it("uses text fallback when synthesis locale is unavailable", () => {
    expect(evaluateGinnyVoiceReadiness("en", { ...capabilities, synthesisLocales: ["te-IN"] }).speakReason).toBe("locale-unavailable");
  });
  it("does not mark listening until capture-started is acknowledged", () => {
    let state = ginnyListeningTransition("idle", "request");
    state = ginnyListeningTransition(state, "permission-granted");
    expect(state).toBe("starting");
    state = ginnyListeningTransition(state, "capture-started");
    expect(state).toBe("listening");
  });
  it("stops or errors without falsely indicating listening", () => {
    expect(ginnyListeningTransition("starting", "failure")).toBe("error");
    expect(ginnyListeningTransition("listening", "stop")).toBe("stopped");
  });
});
