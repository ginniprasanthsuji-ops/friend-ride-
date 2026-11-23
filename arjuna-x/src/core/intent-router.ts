export type IntentKind =
  | "RIDE_BOOKING"
  | "LOCATION"
  | "ORDER_TRACKING"
  | "FOOD_ORDER"
  | "SHOPPING"
  | "HOME_SERVICE"
  | "GENERAL_CHAT"
  | "UNKNOWN";

export interface IntentResult {
  kind: IntentKind;
  confidence: number;
  matchedTerms: string[];
  additionalIntents: IntentKind[];
  needsClarification: boolean;
}

const patterns: Array<{ kind: IntentKind; terms: string[] }> = [
  { kind: "RIDE_BOOKING", terms: ["book cab", "book ride", "bike ride", "taxi", "cab", "auto", "ride", "క్యాబ్", "ఆటో", "బైక్", "రైడ్", "ప్రయాణం", "వెళ్ళాలి", "బుక్ చేయాలి"] },
  { kind: "LOCATION", terms: ["my location", "current location", "where am i", "location", "address", "gps", "లొకేషన్", "చిరునామా", "ఎక్కడ ఉన్నాను", "నా అడ్రస్", "నా స్థానం"] },
  { kind: "ORDER_TRACKING", terms: ["track order", "order status", "track ride", "tracking", "track parcel", "ఆర్డర్ ఎక్కడ", "ట్రాక్", "స్టేటస్", "ఎక్కడికి వచ్చింది"] },
  { kind: "FOOD_ORDER", terms: ["food", "restaurant", "meal", "pizza", "biryani", "delivery food", "తిండి", "ఫుడ్", "బిర్యానీ", "భోజనం", "ఆహారం", "తినడానికి"] },
  { kind: "SHOPPING", terms: ["buy", "grocery", "shop", "store", "shopping", "కిరాణా", "కొనాలి", "షాపింగ్", "సరుకులు", "దుకాణం"] },
  { kind: "HOME_SERVICE", terms: ["plumber", "electrician", "cleaning", "laundry", "home service", "repair", "లాండ్రీ", "క్లీనింగ్", "ప్లంబర్", "ఎలక్ట్రీషియన్", "రిపేర్", "మరమ్మత్తు"] },
];

function matchesTerm(text: string, term: string): boolean {
  if (/^[a-z0-9 ]+$/i.test(term)) {
    if (term.includes(" ")) return text.includes(term);
    return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "i").test(text);
  }
  return text.includes(term);
}

export function classifyIntent(input: string): IntentResult {
  const normalized = input.trim().toLocaleLowerCase();
  if (!normalized) return { kind: "UNKNOWN", confidence: 0, matchedTerms: [], additionalIntents: [], needsClarification: true };

  const hits = patterns
    .map((pattern) => ({ kind: pattern.kind, terms: pattern.terms.filter((term) => matchesTerm(normalized, term)) }))
    .filter((entry) => entry.terms.length > 0)
    .sort((a, b) => b.terms.length - a.terms.length);

  if (hits.length === 0) return { kind: "GENERAL_CHAT", confidence: 0.4, matchedTerms: [], additionalIntents: [], needsClarification: false };
  const top = hits[0]!;
  const ambiguous = hits.length > 1;
  return {
    kind: top.kind,
    confidence: Math.min(0.95, 0.55 + top.terms.length * 0.15),
    matchedTerms: top.terms,
    additionalIntents: hits.slice(1).map((hit) => hit.kind),
    needsClarification: ambiguous,
  };
}
