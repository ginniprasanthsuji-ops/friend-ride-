export type CibilScoreSource = "customer-entered" | "authorized-partner";
export type CibilScoreRecord = {
  score: number;
  reportDate: string;
  source: CibilScoreSource;
  consent: true;
  verificationStatus: "unverified" | "partner-verified";
};
export type CibilScoreCaptureResult =
  | { accepted: true; record: CibilScoreRecord; display: { score: number; label: string; verified: boolean; note: string } }
  | { accepted: false; reason: "consent-required" | "invalid-score" | "invalid-report-date" | "partner-verification-required" };

/** Safe display/capture scaffold. Manual entries are explicitly unverified and must not drive lending decisions. */
export function captureCibilScore(input: {
  score: number;
  reportDate: string;
  consent: boolean;
  source: CibilScoreSource;
  partnerVerificationReference?: string;
}): CibilScoreCaptureResult {
  if (!input.consent) return { accepted: false, reason: "consent-required" };
  if (!Number.isInteger(input.score) || input.score < 300 || input.score > 900) return { accepted: false, reason: "invalid-score" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.reportDate) || !Number.isFinite(Date.parse(input.reportDate + "T00:00:00Z"))) return { accepted: false, reason: "invalid-report-date" };
  if (input.source === "authorized-partner" && !input.partnerVerificationReference?.trim()) return { accepted: false, reason: "partner-verification-required" };
  const verified = input.source === "authorized-partner";
  const record: CibilScoreRecord = { score: input.score, reportDate: input.reportDate, source: input.source, consent: true, verificationStatus: verified ? "partner-verified" : "unverified" };
  return { accepted: true, record, display: { score: input.score, label: verified ? "Partner-verified CIBIL score" : "Customer-entered score (unverified)", verified, note: verified ? "Verified through an authorized partner integration." : "Entered by the customer from their CIBIL report; not verified by FRIEND RIDE and must not be used as an authoritative credit decision." } };
}
