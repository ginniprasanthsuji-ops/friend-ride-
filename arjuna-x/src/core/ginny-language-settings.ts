import { resolveGinnyLanguage, type GinnyLanguage } from "./ginny-assistant-localization";

/** Language preference resolution: valid saved choice wins, then device locale, Telugu fallback. */
export function resolveGinnyLanguagePreference(saved?: string | null, deviceLocale?: string | null): GinnyLanguage {
  if (saved === "te" || saved === "hi" || saved === "en") return saved;
  return resolveGinnyLanguage(deviceLocale);
}

/** BCP-47 locale tags for speech recognition/synthesis integrations. */
export const GINNY_SPEECH_LOCALES: Record<GinnyLanguage, { recognition: string; synthesis: string }> = {
  te: { recognition: "te-IN", synthesis: "te-IN" },
  hi: { recognition: "hi-IN", synthesis: "hi-IN" },
  en: { recognition: "en-IN", synthesis: "en-IN" },
};

export function getGinnySpeechLocale(language: GinnyLanguage) {
  return GINNY_SPEECH_LOCALES[language];
}

/** If a device lacks the requested voice, use text mode rather than silently switching language. */
export function getGinnyVoiceMode(language: GinnyLanguage, supportedLanguages: readonly string[]) {
  const requestedLocale = GINNY_SPEECH_LOCALES[language].synthesis;
  return supportedLanguages.includes(requestedLocale) ? "voice" as const : "text-fallback" as const;
}
