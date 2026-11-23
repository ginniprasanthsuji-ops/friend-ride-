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
  { kind: "RIDE_BOOKING", terms: ["book cab", "book ride", "ride", "taxi", "cab", "auto", "bike ride", "బుక్ క్యాబ్", "క్యాబ్", "ఆటో"] },
  { kind: "LOCATION", terms: ["my location", "current location", "where am i", "location", "address", "లొకేషన్", "చిరునామా", "ఎక్కడ ఉన్నాను"] },
  { kind: "ORDER_TRACKING", terms: ["track order", "order status", "track ride", "tracking", "ఆర్డర్ ఎక్కడ", "ట్రాక్"] },
  { kind: "FOOD_ORDER", terms: ["food", "restaurant", "meal", "pizza", "biryani", "తిండి", "ఫుడ్", "బిర్యానీ"] },
  { kind: "SHOPPING", terms: ["buy", "grocery", "shop", "store", "shopping", "కిరాణా", "కొనాలి", "షాపింగ్"] },
  { kind: "HOME_SERVICE", terms: ["plumber", "electrician", "cleaning", "laundry", "home service", "లాండ్రీ", "క్లీనింగ్"] },
];

export function classifyIntent(input: string): IntentResult {
  const normalized = input.trim().toLocaleLowerCase();
  if (!normalized) return { kind: "UNKNOWN", confidence: 0, matchedTerms: [], additionalIntents: [], needsClarification: true };

  const hits = patterns
    .map((pattern) => ({ kind: pattern.kind, terms: pattern.terms.filter((term) => normalized.includes(term)) }))
    .filter((entry) => entry.terms.length > 0)
    .sort((a, b) => b.terms.length - a.terms.length);

  if (hits.length === 0) return { kind: "GENERAL_CHAT", confidence: 0.4, matchedTerms: [], additionalIntents: [], needsClarification: false };
  const top = hits[0]!;
  const second = hits[1];
  const ambiguous = hits.length > 1;
  return {
    kind: top.kind,
    confidence: Math.min(0.95, 0.55 + top.terms.length * 0.15),
    matchedTerms: top.terms,
    additionalIntents: hits.slice(1).map((hit) => hit.kind),
    needsClarification: ambiguous,
  };
}
