import { describe, expect, it } from "vitest";
import { ARJUNA_X_BRANDING, getArjunaXBrandLabels } from "../core/arjuna-x-branding";

describe("ARJUNA X product and assistant branding", () => {
  it("keeps FRIEND RIDE as app name and Ginny as AI assistant", () => {
    const labels = getArjunaXBrandLabels();
    expect(labels.appName).toBe("FRIEND RIDE");
    expect(labels.assistantName).toBe("Ginny");
    expect(labels.assistantLabel).toBe("Ginny AI");
  });
  it("declares male avatar and Telugu, Hindi, English support", () => {
    expect(ARJUNA_X_BRANDING.assistantAvatarPresentation).toBe("male");
    expect(ARJUNA_X_BRANDING.supportedAssistantLanguages).toEqual(["te", "hi", "en"]);
  });
  it("uses navy and gold theme tokens", () => {
    expect(ARJUNA_X_BRANDING.theme).toEqual({ primary: "navy", accent: "gold" });
  });
});
