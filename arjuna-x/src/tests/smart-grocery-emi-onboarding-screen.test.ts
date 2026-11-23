import { describe, expect, it } from "vitest";
import { buildGroceryEmiOnboardingScreen } from "../core/smart-grocery-emi-onboarding-screen";
describe("Smart Grocery EMI onboarding screen model",()=>{
 it("shows DigiLocker information on identity step",()=>expect(buildGroceryEmiOnboardingScreen("identity")).toMatchObject({heading:"Verify your identity with DigiLocker",externalUrl:"https://www.digilocker.gov.in/",information:{sections:[{title:"DigiLocker ఏమిటి?"}]}}));
 it("launches official CIBIL free report externally",()=>expect(buildGroceryEmiOnboardingScreen("cibil-report")).toMatchObject({externalUrl:"https://www.cibil.com/freecibilscore",primaryAction:"Get Free CIBIL Score & Report"}));
 it("does not show an approval limit before review approval",()=>expect(buildGroceryEmiOnboardingScreen("application-review").description).toMatch(/No limit is displayed/));
 it("states limit must come from approval record",()=>expect(buildGroceryEmiOnboardingScreen("approved").description).toMatch(/authoritative approval record/));
 it("provides quote step",()=>expect(buildGroceryEmiOnboardingScreen("quotation")).toMatchObject({heading:"Grocery quotation",primaryAction:"Submit quotation"}));
});
