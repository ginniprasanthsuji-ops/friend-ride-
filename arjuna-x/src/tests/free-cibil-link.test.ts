import { describe, expect, it } from "vitest";
import { buildFreeCibilLaunch, FREE_CIBIL_REPORT_URL } from "../core/free-cibil-link";
describe("official free CIBIL link", () => {
 it("launches the official annual free-report page externally", () => {
  expect(buildFreeCibilLaunch()).toMatchObject({label:"Get Free CIBIL Score & Report",url:FREE_CIBIL_REPORT_URL,external:true});
  expect(FREE_CIBIL_REPORT_URL).toBe("https://www.cibil.com/freecibilscore");
 });
 it("warns users to verify on CIBIL and not share credentials with FRIEND RIDE", () => {
  expect(buildFreeCibilLaunch().notice).toMatch(/official CIBIL website/);
  expect(buildFreeCibilLaunch().notice).toMatch(/password or OTP/);
 });
});
