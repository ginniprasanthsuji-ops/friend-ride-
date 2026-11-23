import { describe, expect, it } from "vitest";
import { GINNY_AVATAR_PROFILE, getGinnyAvatarAlt } from "../core/ginny-avatar-profile";

describe("Ginny male avatar profile", () => {
  it("keeps assistant name Ginny with male presentation", () => {
    expect(GINNY_AVATAR_PROFILE.assistantName).toBe("Ginny");
    expect(GINNY_AVATAR_PROFILE.presentation).toBe("male");
  });
  it("provides localized avatar alt text", () => {
    expect(getGinnyAvatarAlt("te")).toContain("పురుష");
    expect(getGinnyAvatarAlt("hi")).toContain("पुरुष");
    expect(getGinnyAvatarAlt("en")).toContain("male");
  });
});
