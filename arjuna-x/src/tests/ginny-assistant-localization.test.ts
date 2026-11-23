import { describe, expect, it } from "vitest";
import { GINNY_NAME, GINNY_COPY, getGinnyCopy, resolveGinnyLanguage } from "../core/ginny-assistant-localization";

describe("Ginny assistant localization", () => {
  it("uses Ginny as the assistant name", () => {
    expect(GINNY_NAME).toBe("Ginny");
  });

  it("resolves Telugu and Hindi locale variants", () => {
    expect(resolveGinnyLanguage("te-IN")).toBe("te");
    expect(resolveGinnyLanguage("hi-IN")).toBe("hi");
  });

  it("defaults to Telugu for missing or unsupported locale", () => {
    expect(resolveGinnyLanguage()).toBe("te");
    expect(resolveGinnyLanguage("fr-FR")).toBe("te");
  });

  it("has Telugu welcome and prompt copy", () => {
    const copy = getGinnyCopy("te-IN");
    expect(copy.welcome).toContain("మీ కోసం");
    expect(copy.inputPlaceholder).toContain("Ginny");
    expect(copy.voicePrompt).toContain("వింటోంది");
  });

  it("has Hindi welcome and prompt copy", () => {
    const copy = getGinnyCopy("hi-IN");
    expect(copy.welcome).toContain("आपके लिए");
    expect(copy.inputPlaceholder).toContain("Ginny");
    expect(copy.voicePrompt).toContain("सुन रही है");
  });

  it("personalizes greeting safely with a supplied name", () => {
    expect(GINNY_COPY.te.greeting("ప్రసాద్")).toContain("ప్రసాద్");
    expect(GINNY_COPY.hi.greeting("अमित")).toContain("अमित");
  });
});
