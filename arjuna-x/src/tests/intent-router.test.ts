import test from "node:test";
import assert from "node:assert/strict";
import { classifyIntent } from "../core/intent-router.js";

test("empty input routes to UNKNOWN and requests clarification", () => {
  const result = classifyIntent("   ");
  assert.equal(result.kind, "UNKNOWN");
  assert.equal(result.needsClarification, true);
});

test("Telugu ride request routes to RIDE_BOOKING", () => {
  const result = classifyIntent("నాకు ఆటో కావాలి");
  assert.equal(result.kind, "RIDE_BOOKING");
});

test("multi-intent request is flagged and exposes secondary intents", () => {
  const result = classifyIntent("book cab and track order");
  assert.equal(result.kind, "RIDE_BOOKING");
  assert.equal(result.needsClarification, true);
  assert.ok(result.additionalIntents.includes("ORDER_TRACKING"));
});

test("unmatched text routes to general chat", () => {
  const result = classifyIntent("tell me a story");
  assert.equal(result.kind, "GENERAL_CHAT");
  assert.equal(result.needsClarification, false);
});
