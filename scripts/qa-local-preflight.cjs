#!/usr/bin/env node
const target = process.env.FRIEND_RIDE_BASE_URL;
if (!target) {
  console.error('QA preflight BLOCKED: FRIEND_RIDE_BASE_URL must be explicitly set.');
  process.exit(2);
}
let url;
try { url = new URL(target); } catch {
  console.error('QA preflight BLOCKED: invalid base URL.');
  process.exit(2);
}
const hosts = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
if (!hosts.has(url.hostname) || !['http:', 'https:'].includes(url.protocol)) {
  console.error('QA preflight BLOCKED: only localhost/loopback URLs are allowed.');
  process.exit(2);
}
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 4000);
(async () => {
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'manual', signal: controller.signal });
    if (!response.ok || response.status >= 300) {
      console.error(`QA preflight FAILED: local server returned HTTP ${response.status}.`);
      process.exitCode = 1;
      return;
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      console.error('QA preflight FAILED: local server response is not HTML.');
      process.exitCode = 1;
      return;
    }
    console.log(`QA preflight OK: local server reachable at ${url.origin} (HTML response).`);
  } catch (error) {
    console.error(`QA preflight FAILED: local server unavailable at ${url.origin}; ${error.name || 'request error'}.`);
    process.exitCode = 1;
  } finally {
    clearTimeout(timeout);
  }
})();
