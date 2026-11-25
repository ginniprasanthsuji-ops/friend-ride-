const test = require('node:test');
const assert = require('node:assert/strict');
const { SessionSwitchModel } = require('../qa/session-switch-model.cjs');

function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}

test('anonymous protected request is denied', async () => {
  const model = new SessionSwitchModel();
  await assert.rejects(model.request(async () => []), /Anonymous protected request denied/);
});

test('late A request is discarded after switching to B', async () => {
  const model = new SessionSwitchModel();
  model.login('fixture-user-a');
  const lateA = deferred();
  const requestA = model.request(() => lateA.promise);
  model.login('fixture-user-b');
  model.privateRows = [{ userId: 'fixture-user-b', marker: 'B' }];
  lateA.resolve([{ userId: 'fixture-user-a', marker: 'A' }]);
  const resultA = await requestA;
  assert.equal(resultA.accepted, false);
  assert.deepEqual(model.privateRows, [{ userId: 'fixture-user-b', marker: 'B' }]);
});

test('requests remain bound to isolated model instances', async () => {
  const a = new SessionSwitchModel();
  const b = new SessionSwitchModel();
  a.login('fixture-user-a');
  b.login('fixture-user-b');
  await Promise.all([
    a.request(async id => [{ userId: id, marker: 'A' }]),
    b.request(async id => [{ userId: id, marker: 'B' }])
  ]);
  assert.deepEqual(a.privateRows, [{ userId: 'fixture-user-a', marker: 'A' }]);
  assert.deepEqual(b.privateRows, [{ userId: 'fixture-user-b', marker: 'B' }]);
});

test('logout invalidates pending request and clears private state', async () => {
  const model = new SessionSwitchModel();
  model.login('fixture-user-a');
  const pending = deferred();
  const request = model.request(() => pending.promise);
  model.logout();
  pending.resolve([{ userId: 'fixture-user-a', marker: 'private' }]);
  assert.equal((await request).accepted, false);
  assert.equal(model.userId, null);
  assert.deepEqual(model.privateRows, []);
  assert.equal(model.listenerCount, 0);
});

test('invalid restore falls back to anonymous', () => {
  const model = new SessionSwitchModel();
  assert.equal(model.restore('fixture-user-a', false), false);
  assert.equal(model.userId, null);
  assert.deepEqual(model.privateRows, []);
});

test('cross-user rows are filtered from accepted response', async () => {
  const model = new SessionSwitchModel();
  model.login('fixture-user-b');
  const result = await model.request(async () => [
    { userId: 'fixture-user-b', marker: 'B' },
    { userId: 'fixture-user-a', marker: 'A' }
  ]);
  assert.equal(result.accepted, true);
  assert.deepEqual(model.privateRows, [{ userId: 'fixture-user-b', marker: 'B' }]);
});
