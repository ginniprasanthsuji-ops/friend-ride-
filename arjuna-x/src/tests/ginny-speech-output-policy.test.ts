import { describe, expect, it } from "vitest";
import { decideGinnySpeechOutput } from "../core/ginny-speech-output-policy";
describe("Ginny speech output safety policy", () => {
  it("speaks in selected language only when voice is supported", () => {
    expect(decideGinnySpeechOutput({ language: "hi", text: "नमस्ते", supportedVoices: ["hi-IN"] })).toEqual({ mode: "speak", locale: "hi-IN", text: "नमस्ते" });
  });
  it("keeps sensitive response text-only", () => {
    expect(decideGinnySpeechOutput({ language: "te", text: "private info", supportedVoices: ["te-IN"], sensitive: true })).toMatchObject({ mode: "text-only", reason: "sensitive-content" });
  });
  it("suppresses cancelled and empty output", () => {
    expect(decideGinnySpeechOutput({ language: "en", text: "hello", supportedVoices: ["en-IN"], cancelled: true })).toMatchObject({ mode: "suppressed", reason: "cancelled" });
    expect(decideGinnySpeechOutput({ language: "en", text: "  ", supportedVoices: ["en-IN"] })).toMatchObject({ mode: "suppressed", reason: "empty" });
  });
  it("uses text fallback and caps spoken text", () => {
    expect(decideGinnySpeechOutput({ language: "te", text: "hi", supportedVoices: [] })).toMatchObject({ mode: "text-only", reason: "voice-unavailable" });
    expect(decideGinnySpeechOutput({ language: "en", text: "x".repeat(5000), supportedVoices: ["en-IN"] }).text.length).toBe(4000);
  });
});
