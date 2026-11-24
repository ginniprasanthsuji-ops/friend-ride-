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

test('parallel sessions isolate identical request IDs and role state', () => {
  const lifecycle = new RuntimeSessionLifecycle({ maxSessions: 2 });
  lifecycle.openSession('s-customer', 'customer');
  lifecycle.openSession('s-driver', 'driver');
  const customer = lifecycle.beginRequest('s-customer', 'same-id');
  const driver = lifecycle.beginRequest('s-driver', 'same-id');
  assert.equal(customer.status, 'started');
  assert.equal(driver.status, 'started');
  assert.notEqual(customer.signal, driver.signal);
  assert.equal(lifecycle.finishRequest('s-customer', 'same-id', 'completed').status, 'completed');
  assert.equal(lifecycle.snapshot('s-driver').requests[0].status, 'running');
});

test('parallel requests in one session can finish independently', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  lifecycle.openSession('s-parallel', 'partner');
  const a = lifecycle.beginRequest('s-parallel', 'r-a');
  const b = lifecycle.beginRequest('s-parallel', 'r-b');
  assert.equal(a.status, 'started');
  assert.equal(b.status, 'started');
  assert.equal(lifecycle.finishRequest('s-parallel', 'r-a', 'failed').status, 'failed');
  assert.equal(lifecycle.snapshot('s-parallel').requests.find(r => r.id === 'r-b').status, 'running');
  assert.equal(lifecycle.finishRequest('s-parallel', 'r-b', 'completed').status, 'completed');
});

test('terminal requests cannot be changed again and invalid outcome is rejected', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  lifecycle.openSession('s-terminal', 'admin');
  lifecycle.beginRequest('s-terminal', 'r-terminal');
  assert.throws(() => lifecycle.finishRequest('s-terminal', 'r-terminal', 'cancelled'), /outcome/);
  assert.equal(lifecycle.finishRequest('s-terminal', 'r-terminal', 'completed').status, 'completed');
  assert.deepEqual(lifecycle.cancelRequest('s-terminal', 'r-terminal'), { status: 'blocked', reason: 'request_not_running' });
  assert.deepEqual(lifecycle.timeoutRequest('s-terminal', 'r-terminal'), { status: 'blocked', reason: 'request_not_running' });
});

test('unknown session and request return blocked statuses; malformed IDs reject safely', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  assert.deepEqual(lifecycle.beginRequest('missing', 'r-1'), { status: 'blocked', reason: 'session_not_active' });
  lifecycle.openSession('s-edge', 'customer');
  assert.deepEqual(lifecycle.finishRequest('s-edge', 'missing-r'), { status: 'blocked', reason: 'request_not_found' });
  assert.throws(() => lifecycle.beginRequest('s-edge', '   '), /requestId/);
  assert.deepEqual(lifecycle.snapshot('missing'), undefined);
});

test('snapshot exposes no abort controllers and mutations do not alter internal state', () => {
  const lifecycle = new RuntimeSessionLifecycle();
  lifecycle.openSession('s-safe', 'customer');
  lifecycle.beginRequest('s-safe', 'r-safe');
  const snap = lifecycle.snapshot('s-safe');
  assert.equal(JSON.stringify(snap).includes('AbortController'), false);
  snap.requests[0].status = 'completed';
  snap.requests.push({ id: 'fake' });
  const fresh = lifecycle.snapshot('s-safe');
  assert.equal(fresh.requests[0].status, 'running');
  assert.equal(fresh.requests.length, 1);
});
