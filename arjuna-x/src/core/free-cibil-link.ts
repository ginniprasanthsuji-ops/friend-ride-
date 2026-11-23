/** Official TransUnion CIBIL free annual report entry point.
 * Opens externally; FRIEND RIDE does not collect CIBIL credentials or scrape report data.
 */
export const FREE_CIBIL_REPORT_URL = "https://www.cibil.com/freecibilscore";
export type FreeCibilLaunch = {
  label: string;
  url: string;
  external: true;
  notice: string;
};
export function buildFreeCibilLaunch(): FreeCibilLaunch {
  return {
    label: "Get Free CIBIL Score & Report",
    url: FREE_CIBIL_REPORT_URL,
    external: true,
    notice: "CIBIL offers one free score and report per calendar year. Complete identity verification on the official CIBIL website. FRIEND RIDE will not ask for your CIBIL password or OTP.",
  };
}
