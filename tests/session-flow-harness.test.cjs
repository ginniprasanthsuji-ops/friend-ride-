const test = require('node:test');
const assert = require('node:assert/strict');
const { SessionFlowHarness } = require('../qa/session-flow-harness.cjs');

function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}

test('session-flow harness accepts only synthetic fixture identities', async () => {
  const h = new SessionFlowHarness();
  await assert.rejects(h.signIn('real-user-id'), /Synthetic fixture identity required/);
});

test('late A profile result is rejected after B signs in', async () => {
  const h = new SessionFlowHarness();
  const profileA = deferred();
  const pendingA = h.signIn('fixture-user-a', { profile: () => profileA.promise });
  const resultB = await h.signIn('fixture-user-b');
  profileA.resolve({ role: 'partner' });
  const resultA = await pendingA;
  assert.equal(resultB.accepted, true);
  assert.equal(resultA.accepted, false);
  assert.equal(h.identity, 'fixture-user-b');
  assert.equal(h.role, 'customer');
});

test('stale A notifications cannot replace B private notifications', async () => {
  const h = new SessionFlowHarness();
  await h.signIn('fixture-user-a');
  const notificationsA = deferred();
  const pendingA = h.loadNotifications(() => notificationsA.promise);
  await h.signIn('fixture-user-b');
  h.privateNotifications = [{ userId: 'fixture-user-b', marker: 'B' }];
  notificationsA.resolve([{ userId: 'fixture-user-a', marker: 'A' }]);
  const result = await pendingA;
  assert.equal(result.accepted, false);
  assert.deepEqual(h.privateNotifications, [{ userId: 'fixture-user-b', marker: 'B' }]);
});

test('admin role is denied unless membership loader confirms admin', async () => {
  const h = new SessionFlowHarness();
  const denied = await h.signIn('fixture-user-a', {
    profile: async () => ({ role: 'admin' }),
    adminMembership: async () => false
  });
  assert.equal(denied.accepted, false);
  assert.equal(denied.reason, 'admin-membership-required');
  assert.equal(h.identity, null);
  const accepted = await h.signIn('fixture-user-b', {
    profile: async () => ({ role: 'admin' }),
    adminMembership: async () => true
  });
  assert.equal(accepted.accepted, true);
  assert.equal(h.admin, true);
});

test('driver access fails closed for unapproved status', async () => {
  const h = new SessionFlowHarness();
  const result = await h.signIn('fixture-user-a', {
    profile: async () => ({ role: 'driver', approval: 'pending' })
  });
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'driver-approval-required');
  assert.equal(h.identity, null);
});

test('logout invalidates pending profile response and clears all session state', async () => {
  const h = new SessionFlowHarness();
  const profile = deferred();
  const pending = h.signIn('fixture-user-a', { profile: () => profile.promise });
  h.listeners.add(() => {});
  h.signOut();
  profile.resolve({ role: 'customer' });
  assert.equal((await pending).accepted, false);
  assert.deepEqual(h.snapshot(), {
    identity: null, role: null, approval: null, admin: false,
    notifications: [], generation: 2, listenerCount: 0
  });
});

test('late A admin-membership result is rejected after B session switch', async () => {
  const h = new SessionFlowHarness();
  const adminA = deferred();
  const pendingA = h.signIn('fixture-user-a', {
    profile: async () => ({ role: 'admin' }),
    adminMembership: () => adminA.promise
  });
  const resultB = await h.signIn('fixture-user-b');
  adminA.resolve(true);
  const resultA = await pendingA;
  assert.equal(resultB.accepted, true);
  assert.equal(resultA.accepted, false);
  assert.equal(resultA.reason, 'stale-admin');
  assert.equal(h.identity, 'fixture-user-b');
  assert.equal(h.admin, false);
});

test('unknown role fails closed and clears session', async () => {
  const h = new SessionFlowHarness();
  const result = await h.signIn('fixture-user-a', {
    profile: async () => ({ role: 'superuser' })
  });
  assert.equal(result.accepted, false);
  assert.equal(result.reason, 'invalid-role');
  assert.equal(h.identity, null);
});

test('approved driver profile is accepted', async () => {
  const h = new SessionFlowHarness();
  const result = await h.signIn('fixture-user-a', {
    profile: async () => ({ role: 'driver', approval: 'approved' })
  });
  assert.equal(result.accepted, true);
  assert.equal(h.role, 'driver');
  assert.equal(h.approval, 'approved');
});

test('invalid restore resets to anonymous and clears private state', async () => {
  const h = new SessionFlowHarness();
  await h.signIn('fixture-user-a');
  h.privateNotifications = [{ userId: 'fixture-user-a', marker: 'private' }];
  const result = h.restore('fixture-user-a', false);
  assert.equal(result, false);
  assert.equal(h.identity, null);
  assert.deepEqual(h.privateNotifications, []);
});
