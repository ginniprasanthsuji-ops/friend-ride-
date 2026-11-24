'use strict';

/**
 * ARJUNA X voice-intent adapter contract.
 * Pure parsing only: no microphone, GPS, network, booking, payment, or app mutation.
 */
const ALLOWED_NAV_TARGETS = new Set(['home','ride','orders','services','profile','help']);
const RIDE_TYPES = new Set(['bike','auto','car']);

function normalizeCommand(input) {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[.,!?;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseVoiceIntent(input) {
  const text = normalizeCommand(input);
  if (!text) return { type: 'unknown', reason: 'empty' };

  // Navigation intents are safe and do not mutate booking/order state.
  const nav = [
    { target: 'home', patterns: [/^(home|open home|go home|హోమ్|హోమ్ కు వెళ్ళు)$/] },
    { target: 'ride', patterns: [/^(ride|rides|book ride|cab|టాక్సీ|క్యాబ్|రైడ్ బుక్)$/] },
    { target: 'orders', patterns: [/^(orders|my orders|order history|ఆర్డర్లు|నా ఆర్డర్లు)$/] },
    { target: 'services', patterns: [/^(services|service|సర్వీసులు|సేవలు)$/] },
    { target: 'profile', patterns: [/^(profile|my profile|ప్రొఫైల్)$/] },
    { target: 'help', patterns: [/^(help|support|సహాయం)$/] },
  ];
  for (const item of nav) {
    if (item.patterns.some(p => p.test(text)) && ALLOWED_NAV_TARGETS.has(item.target)) {
      return { type: 'navigate', target: item.target };
    }
  }

  const ride = text.match(/^(bike|auto|car|బైక్|ఆటో|కారు)(?: ride)?$/);
  if (ride) {
    const map = { bike: 'bike', auto: 'auto', car: 'car', 'బైక్': 'bike', 'ఆటో': 'auto', 'కారు': 'car' };
    return { type: 'select_ride', rideType: map[ride[1]] };
  }

  if (/^(book|booking|confirm|confirm booking|బుక్ చేయి|బుకింగ్|కన్ఫర్మ్)$/.test(text)) {
    return { type: 'review_booking', requiresConfirmation: true, execution: 'none' };
  }
  if (/^(pay|payment|pay now|చెల్లించు|పేమెంట్)$/.test(text)) {
    return { type: 'blocked_action', action: 'payment', reason: 'voice_only_payment_blocked' };
  }
  if (/^(cancel ride|cancel booking|రైడ్ రద్దు|బుకింగ్ రద్దు)$/.test(text)) {
    return { type: 'blocked_action', action: 'ride_cancel', reason: 'explicit_in_app_confirmation_required' };
  }
  return { type: 'unknown', reason: 'not_allowlisted' };
}

function isAllowedIntent(intent) {
  if (!intent || typeof intent !== 'object') return false;
  if (intent.type === 'navigate') return ALLOWED_NAV_TARGETS.has(intent.target);
  if (intent.type === 'select_ride') return RIDE_TYPES.has(intent.rideType);
  if (intent.type === 'review_booking') return intent.requiresConfirmation === true && intent.execution === 'none';
  return intent.type === 'unknown' || intent.type === 'blocked_action';
}

module.exports = { normalizeCommand, parseVoiceIntent, isAllowedIntent, ALLOWED_NAV_TARGETS, RIDE_TYPES };
