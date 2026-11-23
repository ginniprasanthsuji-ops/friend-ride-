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

test("English word boundaries avoid accidental substring intent matches", () => {
  assert.equal(classifyIntent("cabinet repair").kind, "GENERAL_CHAT");
  assert.equal(classifyIntent("autonomous systems").kind, "GENERAL_CHAT");
  assert.equal(classifyIntent("I need a cab").kind, "RIDE_BOOKING");
});

test("expanded Telugu location phrases route correctly", () => {
  const result = classifyIntent("నా అడ్రస్ చెప్పు");
  assert.equal(result.kind, "LOCATION");
});

test("expanded Telugu food and service requests route", () => {
  assert.equal(classifyIntent("నాకు భోజనం కావాలి").kind, "FOOD_ORDER");
  assert.equal(classifyIntent("ప్లంబర్ కావాలి").kind, "HOME_SERVICE");
});

test("multi-intent Telugu request requests clarification", () => {
  const result = classifyIntent("ఆటో కావాలి, నా లొకేషన్ చెప్పు");
  assert.equal(result.kind, "RIDE_BOOKING");
  assert.equal(result.needsClarification, true);
  assert.ok(result.additionalIntents.includes("LOCATION"));
});
