const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

test("WebView audit detects required files and browser APIs", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "fr-webview-audit-"));
  const www = path.join(temp, "www");
  fs.mkdirSync(www, { recursive: true });
  fs.writeFileSync(path.join(www, "index.html"), "<script>navigator.geolocation; Notification; window.open('x');</script> https://example.supabase.co cashfree https://cdn.example.test/lib.js");
  fs.writeFileSync(path.join(www, "manifest.webmanifest"), JSON.stringify({ icons: [{ src: "./icons/icon-192.png" }] }));
  fs.writeFileSync(path.join(www, "service-worker.js"), "worker fixture");
  const audit = path.resolve(__dirname, "../scripts/android-webview-audit.cjs");
  const run = spawnSync(process.execPath, [audit, temp], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  assert.match(run.stdout, /Geolocation API/);
  assert.match(run.stdout, /Notification APIs/);
  assert.match(run.stdout, /External navigation/);
  assert.match(run.stdout, /External network dependencies/);
  assert.match(run.stdout, /cdn\.example\.test/);
  assert.match(run.stdout, /WARN .*Manifest icon/);
  assert.match(run.stdout, /PASS .*Service worker registration file/);
  fs.rmSync(temp, { recursive: true, force: true });
});

test("WebView audit fails when staged app and worker are missing", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "fr-webview-missing-"));
  const audit = path.resolve(__dirname, "../scripts/android-webview-audit.cjs");
  const run = spawnSync(process.execPath, [audit, temp], { encoding: "utf8" });
  assert.notEqual(run.status, 0);
  assert.match(run.stdout, /FAIL .*Staged index.html/);
  assert.match(run.stdout, /FAIL .*Service worker registration file/);
  fs.rmSync(temp, { recursive: true, force: true });
});
