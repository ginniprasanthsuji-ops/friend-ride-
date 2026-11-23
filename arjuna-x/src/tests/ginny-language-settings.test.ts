import { describe, expect, it } from "vitest";
import { resolveGinnyLanguagePreference, getGinnySpeechLocale, getGinnyVoiceMode } from "../core/ginny-language-settings";

describe("Ginny language settings", () => {
  it("uses a valid saved selection over device locale", () => {
    expect(resolveGinnyLanguagePreference("hi", "te-IN")).toBe("hi");
  });
  it("falls back to device locale for invalid saved value", () => {
    expect(resolveGinnyLanguagePreference("invalid", "hi-IN")).toBe("hi");
  });
  it("defaults to Telugu if both saved selection and locale are absent", () => {
    expect(resolveGinnyLanguagePreference()).toBe("te");
  });
  it("provides Indian speech locale tags for all languages", () => {
    expect(getGinnySpeechLocale("te")).toEqual({ recognition: "te-IN", synthesis: "te-IN" });
    expect(getGinnySpeechLocale("hi")).toEqual({ recognition: "hi-IN", synthesis: "hi-IN" });
    expect(getGinnySpeechLocale("en")).toEqual({ recognition: "en-IN", synthesis: "en-IN" });
  });
  it("falls back to text when requested voice is unavailable", () => {
    expect(getGinnyVoiceMode("hi", ["te-IN"])).toBe("text-fallback");
    expect(getGinnyVoiceMode("te", ["te-IN"])).toBe("voice");
  });
});
