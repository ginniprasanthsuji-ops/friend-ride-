# Phase 13D Ride Cancellation Gap Review — 2026-11-26

## Catalog findings
Searched public schema RPC catalog for cancellation, refund, and booking transition function names. No dedicated road-ride or shared-ride cancellation/refund RPCs were found. Only store flash-sale reservation cancellation was present (unrelated ride cancellation).

## Confirmed booking states
Both booking tables contain status fields, but reviewed booking functions create booking_pending and road ride confirmation advances to confirmed. The reviewed ride-booking RPCs have no cancellation state transition, refund logic, shared-seat restoration, ride status reopening, or cancellation event logic.

## Risk
Cancellation may currently be missing, implemented in frontend direct writes (which appear constrained by ACL/RLS), or implemented under a different non-obvious path. Cannot claim working cancellation without source/runtime evidence.

## Recommendation
Review frontend UI source for cancellation action, identify exact mutation target and intended role/state rules. If absent, design a QA-only cancellation RPC with locking, participant/driver ownership, valid-state guard, idempotency, shared seat decrement, live/full recomputation, event logging, and payment/refund status safeguards. Do not implement until frontend/back-end intended cancellation policy is confirmed.

## Scope
QA project catalog only; no fixture records or production changes.
