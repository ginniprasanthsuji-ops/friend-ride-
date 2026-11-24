'use strict';

/**
 * QA-only event guard for speed-warning proposals. It deduplicates event IDs,
 * enforces per-ride cooldown, and fails closed at configured capacity.
 * No notifications, audio, GPS, SQL, or ride mutations are performed.
 */
const DEFAULT_COOLDOWN_MS = 60_000;
const DEFAULT_MAX_EVENTS = 10_000;
const DEFAULT_MAX_RIDES = 1_000;

class BikeSpeedWarningEventGuard {
  constructor({ cooldownMs = DEFAULT_COOLDOWN_MS, maxEvents = DEFAULT_MAX_EVENTS, maxRides = DEFAULT_MAX_RIDES } = {}) {
    if (!Number.isSafeInteger(cooldownMs) || cooldownMs < 0) throw new TypeError('invalid_cooldown');
    if (!Number.isSafeInteger(maxEvents) || maxEvents < 1) throw new TypeError('invalid_max_events');
    if (!Number.isSafeInteger(maxRides) || maxRides < 1) throw new TypeError('invalid_max_rides');
    this.cooldownMs = cooldownMs;
    this.maxEvents = maxEvents;
    this.maxRides = maxRides;
    this.seenEventIds = new Set();
    this.lastProposalAtByRide = new Map();
  }

  evaluate({ rideId, eventId, nowMs } = {}) {
    if (typeof rideId !== 'string' || !rideId.trim() || typeof eventId !== 'string' || !eventId.trim() || !Number.isSafeInteger(nowMs) || nowMs < 0) {
      return { status: 'blocked', reason: 'invalid_event_context', sideEffects: false };
    }
    if (this.seenEventIds.has(eventId)) return { status: 'blocked', reason: 'duplicate_event_id', sideEffects: false };
    if (this.seenEventIds.size >= this.maxEvents) return { status: 'blocked', reason: 'event_capacity_reached', sideEffects: false };
    if (!this.lastProposalAtByRide.has(rideId) && this.lastProposalAtByRide.size >= this.maxRides) {
      return { status: 'blocked', reason: 'ride_capacity_reached', sideEffects: false };
    }
    this.seenEventIds.add(eventId);
    const last = this.lastProposalAtByRide.get(rideId);
    if (last !== undefined && nowMs - last < this.cooldownMs) {
      return { status: 'suppressed', reason: 'ride_cooldown', sideEffects: false };
    }
    this.lastProposalAtByRide.set(rideId, nowMs);
    return { status: 'proposal_accepted', rideId, eventId, cooldownMs: this.cooldownMs, sideEffects: false };
  }
}

module.exports = { DEFAULT_COOLDOWN_MS, DEFAULT_MAX_EVENTS, DEFAULT_MAX_RIDES, BikeSpeedWarningEventGuard };
