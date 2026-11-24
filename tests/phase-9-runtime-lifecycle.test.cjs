'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { RuntimeSessionLifecycle } = require('../qa/arjuna-x-runtime-lifecycle.cjs');

test('opens role-bound sessions and exposes safe snapshots only', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  const snapshot = lifecycle.openSession('s-1', 'customer');
  assert.equal(snapshot.status, 'active');
  assert.equal(snapshot.role, 'customer');
  assert.equal(snapshot.requestCount, 0);
  assert.throws(() => lifecycle.openSession('s-1', 'customer'), /already exists/);
  assert.throws(() => lifecycle.openSession('s-2', 'superuser'), /Invalid role/);
});

test('request IDs are one-time and duplicate requests are blocked', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  lifecycle.openSession('s-1', 'customer');
  assert.equal(lifecycle.beginRequest('s-1', 'r-1').status, 'started');
  assert.deepEqual(lifecycle.beginRequest('s-1', 'r-1'), { status: 'duplicate', reason: 'request_id_already_used' });
  assert.equal(lifecycle.finishRequest('s-1', 'r-1', 'completed').status, 'completed');
  assert.deepEqual(lifecycle.beginRequest('s-1', 'r-1'), { status: 'duplicate', reason: 'request_id_already_used' });
});

test('cancel request aborts its signal and prevents finish-after-cancel', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  lifecycle.openSession('s-1', 'customer');
  const begun = lifecycle.beginRequest('s-1', 'r-1');
  assert.equal(begun.signal.aborted, false);
  assert.equal(lifecycle.cancelRequest('s-1', 'r-1').status, 'cancelled');
  assert.equal(begun.signal.aborted, true);
  assert.deepEqual(lifecycle.finishRequest('s-1', 'r-1'), { status: 'blocked', reason: 'request_not_running' });
});

test('request timeout aborts in-flight work and records timed_out state', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  lifecycle.openSession('s-1', 'customer');
  const begun = lifecycle.beginRequest('s-1', 'r-1');
  assert.equal(lifecycle.timeoutRequest('s-1', 'r-1').status, 'timed_out');
  assert.equal(begun.signal.aborted, true);
  assert.equal(lifecycle.snapshot('s-1').requests[0].status, 'timed_out');
  assert.deepEqual(lifecycle.finishRequest('s-1', 'r-1'), { status: 'blocked', reason: 'request_not_running' });
});

test('session closure cancels all in-flight requests and blocks new work', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  lifecycle.openSession('s-1', 'partner');
  const first = lifecycle.beginRequest('s-1', 'r-1');
  const second = lifecycle.beginRequest('s-1', 'r-2');
  assert.equal(lifecycle.closeSession('s-1', 'cancelled').status, 'cancelled');
  assert.equal(first.signal.aborted, true);
  assert.equal(second.signal.aborted, true);
  assert.deepEqual(lifecycle.beginRequest('s-1', 'r-3'), { status: 'blocked', reason: 'session_not_active' });
});

test('TTL expiry aborts work and releases active session capacity', () => {
  let clock = 1000;
  const lifecycle = new RuntimeSessionLifecycle({ ttlMs: 50, maxSessions: 1, now: () => clock });
  lifecycle.openSession('s-1', 'customer');
  const work = lifecycle.beginRequest('s-1', 'r-1');
  clock += 50;
  assert.deepEqual(lifecycle.beginRequest('s-1', 'r-2'), { status: 'blocked', reason: 'session_not_active' });
  assert.equal(work.signal.aborted, true);
  const reopened = lifecycle.openSession('s-2', 'customer');
  assert.equal(reopened.status, 'active');
});

test('request cap and constructor validation fail closed', () => {
  assert.throws(() => new RuntimeSessionLifecycle({ ttlMs: 0 }), /positive integer/);
  assert.throws(() => new RuntimeSessionLifecycle({ maxSessions: 0 }), /positive integer/);
  const lifecycle = new RuntimeSessionLifecycle({ maxRequestsPerSession: 1 });
  lifecycle.openSession('s-1', 'admin');
  lifecycle.beginRequest('s-1', 'r-1');
  assert.deepEqual(lifecycle.beginRequest('s-1', 'r-2'), { status: 'blocked', reason: 'request_limit_reached' });
});
