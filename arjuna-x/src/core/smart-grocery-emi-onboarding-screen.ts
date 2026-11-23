import { getDigiLockerInformation } from "./digilocker-information";
import { buildFreeCibilLaunch } from "./free-cibil-link";
export type GroceryEmiOnboardingStep = "intro" | "identity" | "credit-consent" | "cibil-report" | "application-review" | "approved" | "quotation";
export type GroceryEmiOnboardingScreen = {
  step: GroceryEmiOnboardingStep;
  heading: string;
  description: string;
  primaryAction: string;
  externalUrl?: string;
  information?: ReturnType<typeof getDigiLockerInformation>;
  safetyNote?: string;
};
export function buildGroceryEmiOnboardingScreen(step: GroceryEmiOnboardingStep): GroceryEmiOnboardingScreen {
  switch(step) {
    case "intro": return {step,heading:"Smart Grocery EMI",description:"Apply for a grocery credit limit. Approval and limit depend on authorized review.",primaryAction:"Start application",safetyNote:"No credit limit is guaranteed before approval."};
    case "identity": return {step,heading:"Verify your identity with DigiLocker",description:"Learn how DigiLocker works and continue to the official service if you choose.",primaryAction:"Open DigiLocker",externalUrl:getDigiLockerInformation().officialUrl,information:getDigiLockerInformation(),safetyNote:getDigiLockerInformation().privacyNotice};
    case "credit-consent": return {step,heading:"Credit enquiry consent",description:"Read the purpose and provider details before giving separate consent to any authorized credit enquiry.",primaryAction:"Review consent",safetyNote:"Do not proceed without clear consent and an authorized provider."};
    case "cibil-report": return {step,heading:"Check your free CIBIL report",description:"Open the official CIBIL page. If you wish, enter your score and report date back in FRIEND RIDE; manual entries are shown as unverified.",primaryAction:buildFreeCibilLaunch().label,externalUrl:buildFreeCibilLaunch().url,safetyNote:buildFreeCibilLaunch().notice};
    case "application-review": return {step,heading:"Application review",description:"Your application is pending authorized lender/Admin review. No limit is displayed until a valid approval is recorded.",primaryAction:"View application status"};
    case "approved": return {step,heading:"Limit approved",description:"Show the approved limit from the authoritative approval record only.",primaryAction:"Continue to quotation"};
    case "quotation": return {step,heading:"Grocery quotation",description:"Create a quotation within your approved limit and submit it for Admin review.",primaryAction:"Submit quotation"};
  }
}
