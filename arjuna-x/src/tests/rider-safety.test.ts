import test from "node:test";
import assert from "node:assert/strict";
import {
  createRiderSafetyState,
  riderSafetyTick,
  confirmRiderSafe,
  extendRiderSafetyEta,
  disableRiderSafety,
} from "../core/rider-safety.js";

const start = 1_800_000_000_000;

test("Rider Safety timer starts grace only once ETA has passed", () => {
  const state = createRiderSafetyState(start + 60_000, true);
  assert.equal(riderSafetyTick(state, start).action, "NONE");
  const transition = riderSafetyTick(state, start + 60_001);
  assert.equal(transition.action, "START_GRACE");
  assert.equal(transition.state.status, "GRACE");
});

test("grace countdown expiry escalates once", () => {
  const state = createRiderSafetyState(start, true, 120_000);
  const grace = riderSafetyTick(state, start).state;
  assert.equal(riderSafetyTick(grace, start + 119_999).action, "NONE");
  const expired = riderSafetyTick(grace, start + 120_000);
  assert.equal(expired.action, "ESCALATE");
  assert.equal(expired.state.escalationIssued, true);
  assert.equal(riderSafetyTick(expired.state, start + 180_000).action, "NONE");
});

test("safe confirmation stops pending escalation", () => {
  const state = createRiderSafetyState(start, true);
  const confirmed = confirmRiderSafe(state, start + 5);
  assert.equal(confirmed.state.status, "SAFE");
  assert.equal(riderSafetyTick(confirmed.state, start + 10_000).action, "NONE");
});

test("ETA extension resets grace and increments extension counter", () => {
  const state = createRiderSafetyState(start, true);
  const grace = riderSafetyTick(state, start).state;
  const extended = extendRiderSafetyEta(grace, start + 10 * 60_000, start + 1);
  assert.equal(extended.action, "EXTEND");
  assert.equal(extended.state.status, "ACTIVE");
  assert.equal(extended.state.extendedCount, 1);
  assert.equal(extended.state.graceStartedAt, undefined);
});

test("disabled safety cannot trigger escalation", () => {
  const state = disableRiderSafety(createRiderSafetyState(start, true)).state;
  assert.equal(riderSafetyTick(state, start + 999_999).action, "NONE");
});

test("invalid grace and ETA values rejected", () => {
  assert.throws(() => createRiderSafetyState(Number.NaN, true), /valid future timestamp/);
  assert.throws(() => createRiderSafetyState(start, true, -1), /between 0 and 30 minutes/);
  assert.throws(() => extendRiderSafetyEta(createRiderSafetyState(start, true), start - 1, start), /within the next 24 hours/);
});
