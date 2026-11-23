import { describe, expect, it } from "vitest";
import { captureCibilScore } from "../core/cibil-score-display";
const base={score:742,reportDate:"2026-11-23",consent:true,source:"customer-entered" as const};
describe("CIBIL score capture and display",()=>{
 it("displays customer-entered score as explicitly unverified",()=>{
  expect(captureCibilScore(base)).toMatchObject({accepted:true,record:{score:742,verificationStatus:"unverified"},display:{score:742,verified:false,label:"Customer-entered score (unverified)"}});
 });
 it("requires consent",()=>expect(captureCibilScore({...base,consent:false})).toMatchObject({accepted:false,reason:"consent-required"}));
 it("rejects score outside range",()=>expect(captureCibilScore({...base,score:901})).toMatchObject({accepted:false,reason:"invalid-score"}));
 it("rejects malformed report date",()=>expect(captureCibilScore({...base,reportDate:"yesterday"})).toMatchObject({accepted:false,reason:"invalid-report-date"}));
 it("requires partner reference for verified status",()=>expect(captureCibilScore({...base,source:"authorized-partner"})).toMatchObject({accepted:false,reason:"partner-verification-required"}));
 it("labels partner-verified score only with a partner reference",()=>expect(captureCibilScore({...base,source:"authorized-partner",partnerVerificationReference:"ref-123"})).toMatchObject({accepted:true,record:{verificationStatus:"partner-verified"},display:{verified:true,label:"Partner-verified CIBIL score"}}));
});
