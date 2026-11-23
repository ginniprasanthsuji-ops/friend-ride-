export type DigiLockerInfoSection = { title: string; bullets: string[] };
export type DigiLockerAppInfo = {
  title: string;
  subtitle: string;
  officialUrl: string;
  sections: DigiLockerInfoSection[];
  privacyNotice: string;
  actions: { label: string; url: string }[];
};
export const DIGILOCKER_OFFICIAL_URL = "https://www.digilocker.gov.in/";
export const DIGILOCKER_SIGNIN_URL = "https://api.digitallocker.gov.in/";
export function getDigiLockerInformation(): DigiLockerAppInfo {
  return {
    title: "DigiLocker — Digital Documents",
    subtitle: "Government of India • Ministry of Electronics & IT (MeitY) • Digital India",
    officialUrl: DIGILOCKER_OFFICIAL_URL,
    sections: [
      { title: "DigiLocker ఏమిటి?", bullets: ["Government-backed digital document wallet.", "Issued documentsను పొందడం, నిల్వ/అందుబాటులో ఉంచడం, consentతో share చేయడం, verify చేయడం కోసం ఉపయోగపడుతుంది."] },
      { title: "ఏ documents అందుబాటులో ఉండవచ్చు?", bullets: ["Driving Licence, vehicle-related documents", "PAN, identity and other government certificates (issuer availabilityపై ఆధారపడి)", "Education certificates/marksheets", "Insurance, finance and other issuer documents (availabilityపై ఆధారపడి)"] },
      { title: "ఎలా ఉపయోగించాలి?", bullets: ["Official DigiLocker site/appలో register లేదా sign in చేయండి.", "Identity verification complete చేయండి.", "Available issuers నుంచి documents fetch చేయండి.", "Document share చేసే ముందు requesting organization, purpose, మరియు consent వివరాలు పరిశీలించండి."] },
      { title: "FRIEND RIDEలో ఎందుకు?", bullets: ["Smart Grocery EMI identity verification stepలో userకి DigiLocker గురించి వివరాలు చూపించడానికి.", "Authorized integration ఏర్పడితే, అవసరమైన document మాత్రమే explicit consentతో fetch/verify చేయడానికి.", "ప్రస్తుతం external official DigiLocker link మాత్రమే; automatic document fetch/verification ఉందని app claim చేయదు."] },
    ],
    privacyNotice: "మీ DigiLocker password, OTP లేదా authentication secrets FRIEND RIDEలో enter చేయకండి. Documents access చేయడానికి authorized requester integration మరియు explicit consent అవసరం. Consent లేకుండా documents fetch చేయకూడదు.",
    actions: [
      { label: "Open Official DigiLocker", url: DIGILOCKER_OFFICIAL_URL },
      { label: "DigiLocker Sign In / Sign Up", url: DIGILOCKER_SIGNIN_URL },
    ],
  };
}
