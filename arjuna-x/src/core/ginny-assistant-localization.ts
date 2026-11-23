/** Ginny is the user-facing name for the ARJUNA X AI H1 assistant. */
export type GinnyLanguage = "te" | "hi" | "en";

export const GINNY_NAME = "Ginny" as const;

export const GINNY_COPY: Record<GinnyLanguage, {
  welcome: string;
  welcomeShort: string;
  greeting: (name?: string) => string;
  inputPlaceholder: string;
  voicePrompt: string;
  languageLabel: string;
}> = {
  te: {
    welcome: "Ginny మీ కోసం!",
    welcomeShort: "మీ కోసం Ginny",
    greeting: (name) => name ? `హాయ్ ${name}! Ginny మీ కోసం. ఈరోజు మీకు ఏం సహాయం చేయాలి?` : "హాయ్! Ginny మీ కోసం. ఈరోజు మీకు ఏం సహాయం చేయాలి?",
    inputPlaceholder: "Ginnyని అడగండి…",
    voicePrompt: "మాట్లాడండి—Ginny వింటోంది",
    languageLabel: "తెలుగు",
  },
  hi: {
    welcome: "Ginny आपके लिए!",
    welcomeShort: "आपके लिए Ginny",
    greeting: (name) => name ? `नमस्ते ${name}! Ginny आपके लिए है। आज मैं आपकी क्या मदद करूँ?` : "नमस्ते! Ginny आपके लिए है। आज मैं आपकी क्या मदद करूँ?",
    inputPlaceholder: "Ginny से पूछें…",
    voicePrompt: "बोलिए—Ginny सुन रही है",
    languageLabel: "हिन्दी",
  },
  en: {
    welcome: "Ginny is here for you!",
    welcomeShort: "Ginny, for you",
    greeting: (name) => name ? `Hi ${name}! Ginny is here for you. How can I help today?` : "Hi! Ginny is here for you. How can I help today?",
    inputPlaceholder: "Ask Ginny…",
    voicePrompt: "Speak—Ginny is listening",
    languageLabel: "English",
  },
};

/** Pick Telugu/Hindi based on user choice or locale; default to Telugu for India. */
export function resolveGinnyLanguage(language?: string | null): GinnyLanguage {
  const normalized = (language ?? "").toLowerCase();
  if (normalized.startsWith("hi")) return "hi";
  if (normalized.startsWith("en")) return "en";
  return "te";
}

export function getGinnyCopy(language?: string | null) {
  return GINNY_COPY[resolveGinnyLanguage(language)];
}
