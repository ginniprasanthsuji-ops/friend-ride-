/** Product/assistant identity boundary for ARJUNA X Phase 7. */
export const ARJUNA_X_BRANDING = {
  appName: "FRIEND RIDE",
  assistantName: "Ginny",
  assistantLabel: "Ginny AI",
  assistantAvatarPresentation: "male",
  theme: {
    primary: "navy",
    accent: "gold",
  },
  supportedAssistantLanguages: ["te", "hi", "en"] as const,
} as const;

/** UI labels should use appName for product chrome and assistantLabel for the AI entry. */
export function getArjunaXBrandLabels() {
  return {
    appName: ARJUNA_X_BRANDING.appName,
    assistantName: ARJUNA_X_BRANDING.assistantName,
    assistantLabel: ARJUNA_X_BRANDING.assistantLabel,
  };
}
