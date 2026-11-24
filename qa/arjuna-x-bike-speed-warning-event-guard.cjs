'use strict';

/**
 * QA-only event guard for speed-warning proposals. It deduplicates event IDs
 * and enforces per-ride cooldown deterministically. No notifications or audio.
 */
const DEFAULT_COOLDOWN_MS = 60_000;

class BikeSpeedWarningEventGuard {
  constructor({ cooldownMs = DEFAULT_COOLDOWN_MS } = {}) {
    if (!Number.isSafeInteger(cooldownMs) || cooldownMs < 0) throw new TypeError('invalid_cooldown');
    this.cooldownMs = cooldownMs;
    this.seenEventIds = new Set();
    this.lastProposalAtByRide = new Map();
  }

  evaluate({ rideId, eventId, nowMs } = {}) {
    if (typeof rideId !== 'string' || !rideId.trim() || typeof eventId !== 'string' || !eventId.trim() || !Number.isSafeInteger(nowMs) || nowMs < 0) {
      return { status: 'blocked', reason: 'invalid_event_context', sideEffects: false };
    }
    if (this.seenEventIds.has(eventId)) return { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false };
    this.seenEventIds.add(eventId);
    const last = this.lastProposalAtByRide.get(rideId);
    if (last !== undefined && nowMs - last < this.cooldownMs) {
      return { status: 'suppressed', reason: 'ride_cooldown', sideEffects: false };
    }
    this.lastProposalAtByRide.set(rideId, nowMs);
    return { status: 'proposal_accepted', rideId, eventId, cooldownMs: this.cooldownMs, sideEffects: false };
  }
}

module.exports = { DEFAULT_COOLDOWN_MS, BikeSpeedWarningEventGuard };
