import type { GinnyLanguage } from "./ginny-assistant-localization";
import { GINNY_SPEECH_LOCALES } from "./ginny-language-settings";

export type GinnyVoiceAvailability = {
  microphonePermission: "granted" | "denied" | "prompt";
  speechRecognitionAvailable: boolean;
  speechSynthesisAvailable: boolean;
  recognitionLocales: readonly string[];
  synthesisLocales: readonly string[];
};
export type GinnyVoiceReadiness = {
  canListen: boolean;
  canSpeak: boolean;
  listenReason: "ready" | "permission-required" | "permission-denied" | "recognition-unavailable" | "locale-unavailable";
  speakReason: "ready" | "synthesis-unavailable" | "locale-unavailable";
  recognitionLocale: string;
  synthesisLocale: string;
  mode: "voice" | "text-fallback";
};

/** Capability/permission evaluation only; does not request permissions or start audio. */
export function evaluateGinnyVoiceReadiness(language: GinnyLanguage, capabilities: GinnyVoiceAvailability): GinnyVoiceReadiness {
  const locales = GINNY_SPEECH_LOCALES[language];
  let listenReason: GinnyVoiceReadiness["listenReason"] = "ready";
  if (capabilities.microphonePermission === "denied") listenReason = "permission-denied";
  else if (capabilities.microphonePermission !== "granted") listenReason = "permission-required";
  else if (!capabilities.speechRecognitionAvailable) listenReason = "recognition-unavailable";
  else if (!capabilities.recognitionLocales.includes(locales.recognition)) listenReason = "locale-unavailable";

  let speakReason: GinnyVoiceReadiness["speakReason"] = "ready";
  if (!capabilities.speechSynthesisAvailable) speakReason = "synthesis-unavailable";
  else if (!capabilities.synthesisLocales.includes(locales.synthesis)) speakReason = "locale-unavailable";
  const canListen = listenReason === "ready";
  const canSpeak = speakReason === "ready";
  return { canListen, canSpeak, listenReason, speakReason, recognitionLocale: locales.recognition, synthesisLocale: locales.synthesis, mode: canListen && canSpeak ? "voice" : "text-fallback" };
}

export type GinnyListeningState = "idle" | "requesting-permission" | "starting" | "listening" | "stopped" | "error";
/** Listening indicator must only become active after platform confirms capture started. */
export function ginnyListeningTransition(state: GinnyListeningState, event: "request" | "permission-granted" | "capture-started" | "stop" | "failure"): GinnyListeningState {
  if (event === "stop") return "stopped";
  if (event === "failure") return "error";
  if (state === "idle" && event === "request") return "requesting-permission";
  if (state === "requesting-permission" && event === "permission-granted") return "starting";
  if (state === "starting" && event === "capture-started") return "listening";
  return state;
}
