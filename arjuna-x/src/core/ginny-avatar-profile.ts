/** ARJUNA X AI H1 assistant avatar profile: male-presenting avatar, assistant name remains Ginny. */
export const GINNY_AVATAR_PROFILE = {
  assistantName: "Ginny",
  presentation: "male",
  visualStyle: "friendly South Asian male avatar, navy-and-gold ARJUNA X theme, headset, warm smile",
  frameStyle: "gold circular halo on deep navy background",
  voicePresentation: "masculine voice preference; selected language Telugu/Hindi/English",
  altText: {
    te: "Ginny AI సహాయకుడి పురుష అవతార్",
    hi: "Ginny AI सहायक का पुरुष अवतार",
    en: "Ginny AI assistant male avatar",
  },
} as const;

export type GinnyAvatarLocale = keyof typeof GINNY_AVATAR_PROFILE.altText;
export function getGinnyAvatarAlt(locale: GinnyAvatarLocale = "te") {
  return GINNY_AVATAR_PROFILE.altText[locale];
}
