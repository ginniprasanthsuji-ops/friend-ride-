const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

const configCommand = "const config=require('./playwright.config.cjs');process.stdout.write(config.use.baseURL)";
function runConfig(baseUrl) {
  const env = { ...process.env };
  if (baseUrl === undefined) delete env.FRIEND_RIDE_BASE_URL;
  else env.FRIEND_RIDE_BASE_URL = baseUrl;
  return spawnSync(process.execPath, ['-e', configCommand], {
    cwd: process.cwd(),
    env,
    encoding: 'utf8'
  });
}

test('Playwright config fails closed when base URL is missing', () => {
  const result = runConfig(undefined);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /FRIEND_RIDE_BASE_URL is required/);
});

test('Playwright config rejects a non-loopback URL', () => {
  const result = runConfig('https://friendride.in');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Use localhost\/127\.0\.0\.1\/::1 only/);
});

test('Playwright config accepts local loopback targets only', () => {
  for (const baseUrl of [
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://[::1]:4173'
  ]) {
    const result = runConfig(baseUrl);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, new URL(baseUrl).toString());
  }
});
