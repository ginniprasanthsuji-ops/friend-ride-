const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const preflight = path.join(__dirname, '..', 'scripts', 'qa-local-preflight.cjs');

function runPreflight(baseUrl) {
  const env = { ...process.env };
  if (baseUrl === undefined) delete env.FRIEND_RIDE_BASE_URL;
  else env.FRIEND_RIDE_BASE_URL = baseUrl;
  return spawnSync(process.execPath, [preflight], { env, encoding: 'utf8', timeout: 6000 });
}

test('preflight blocks when target is not explicitly configured', () => {
  const result = runPreflight(undefined);
  assert.equal(result.status, 2);
  assert.match(result.stderr, /must be explicitly set/i);
});

test('preflight rejects hosted and external URLs before making requests', () => {
  for (const url of [
    'https://friendride.in/',
    'https://example.com/',
    'http://localhost.evil.example/',
    'https://127.0.0.1.evil.example/',
    'ftp://localhost/'
  ]) {
    const result = runPreflight(url);
    assert.equal(result.status, 2, url);
    assert.match(result.stderr, /only localhost\/loopback URLs are allowed/i, url);
  }
});

test('preflight rejects malformed URL strings', () => {
  const result = runPreflight('not-a-url');
  assert.equal(result.status, 2);
  assert.match(result.stderr, /invalid base URL/i);
});

test('loopback URL passes target validation but fails safely when no local server exists', () => {
  const result = runPreflight('http://127.0.0.1:1/');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /local server unavailable/i);
});
