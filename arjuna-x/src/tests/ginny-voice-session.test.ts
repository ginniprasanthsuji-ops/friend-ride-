import { describe, expect, it } from "vitest";
import { appendGinnyTranscript, createGinnyVoiceSession, updateGinnyVoiceSession } from "../core/ginny-voice-session";
const caps = { microphonePermission: "granted" as const, speechRecognitionAvailable: true, speechSynthesisAvailable: true, recognitionLocales: ["te-IN", "hi-IN", "en-IN"], synthesisLocales: ["te-IN", "hi-IN", "en-IN"] };
describe("Ginny voice session reducer", () => {
  it("blocks voice request when readiness is not satisfied", () => {
    const session = createGinnyVoiceSession("te", { ...caps, microphonePermission: "denied" });
    expect(updateGinnyVoiceSession(session, "request").state).toBe("error");
  });
  it("only accepts transcript while listening and caps transcript length", () => {
    const session = createGinnyVoiceSession("te", caps);
    expect(appendGinnyTranscript(session, "ignored").transcript).toBe("");
    let active = updateGinnyVoiceSession(session, "request");
    active = updateGinnyVoiceSession(active, "permission-granted");
    active = updateGinnyVoiceSession(active, "capture-started");
    expect(appendGinnyTranscript(active, "hello").transcript).toBe("hello");
    expect(appendGinnyTranscript(active, "x".repeat(5000)).transcript.length).toBe(4000);
  });
  it("handles stop and failure transitions", () => {
    const session = createGinnyVoiceSession("en", caps);
    expect(updateGinnyVoiceSession(session, "failure", "device error").error).toBe("device error");
    expect(updateGinnyVoiceSession(session, "stop").state).toBe("stopped");
  });
});
