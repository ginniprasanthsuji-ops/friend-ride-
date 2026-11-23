import type { GinnyLanguage } from "./ginny-assistant-localization";
import { getGinnySpeechLocale, getGinnyVoiceMode } from "./ginny-language-settings";

export type GinnySpeechOutputInput = { language: GinnyLanguage; text: string; supportedVoices: readonly string[]; sensitive?: boolean; cancelled?: boolean };
export type GinnySpeechOutputDecision = { mode: "speak" | "text-only" | "suppressed"; locale?: string; text: string; reason?: "cancelled" | "sensitive-content" | "voice-unavailable" | "empty" };
/** Policy only: no TTS engine calls. Sensitive/cancelled content is never spoken automatically. */
export function decideGinnySpeechOutput(input: GinnySpeechOutputInput): GinnySpeechOutputDecision {
  const text = input.text.trim().slice(0, 4000);
  if (!text) return { mode: "suppressed", text, reason: "empty" };
  if (input.cancelled) return { mode: "suppressed", text: "", reason: "cancelled" };
  if (input.sensitive) return { mode: "text-only", text, reason: "sensitive-content" };
  const locale = getGinnySpeechLocale(input.language).synthesis;
  if (getGinnyVoiceMode(input.language, input.supportedVoices) !== "voice") return { mode: "text-only", text, reason: "voice-unavailable" };
  return { mode: "speak", locale, text };
}
