import { describe, expect, it } from "vitest";
import { getDigiLockerInformation, DIGILOCKER_OFFICIAL_URL, DIGILOCKER_SIGNIN_URL } from "../core/digilocker-information";
describe("DigiLocker app information",()=>{
 it("provides overview, document examples, usage and FRIEND RIDE context",()=>{
  const info=getDigiLockerInformation();
  expect(info.sections.map(s=>s.title)).toEqual(["DigiLocker ఏమిటి?","ఏ documents అందుబాటులో ఉండవచ్చు?","ఎలా ఉపయోగించాలి?","FRIEND RIDEలో ఎందుకు?"]);
  expect(info.sections.flatMap(s=>s.bullets).join(" ")).toMatch(/consent/i);
 });
 it("uses official DigiLocker entry URLs",()=>expect(getDigiLockerInformation().actions).toEqual([{label:"Open Official DigiLocker",url:DIGILOCKER_OFFICIAL_URL},{label:"DigiLocker Sign In / Sign Up",url:DIGILOCKER_SIGNIN_URL}]));
 it("includes a credential safety warning",()=>expect(getDigiLockerInformation().privacyNotice).toMatch(/password, OTP/));
});
