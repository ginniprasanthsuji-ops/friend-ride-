const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

test("Capacitor staging copies app entry, UI modules, and required assets while preserving sources", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "friendride-cap-stage-"));
  const root = path.join(temp, "repo");
  fs.mkdirSync(path.join(root, "scripts"), { recursive: true });
  const files = {
    "index.html": "<html>test</html>",
    "manifest.webmanifest": "{\"name\":\"test\"}",
    "sw.js": "self.addEventListener('install',()=>{});",
    "learn-teach.css": "/* css fixture */",
    "learn-teach.js": "/* js fixture */",
    "assets/ride-contact.js": "/* contact fixture */",
    "assets/driver-kyc-upload.js": "/* upload fixture */",
    "icons/icon-192.png": "binary-icon-192-fixture",
    "icons/icon-512.png": "binary-icon-512-fixture""
  };
  for (const [name, content] of Object.entries(files)) {
    const file = path.join(root, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  const script = path.resolve(__dirname, "../scripts/stage-capacitor-web.cjs");
  const result = spawnSync(process.execPath, [script, root], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  for (const [name, content] of Object.entries(files)) {
    assert.equal(fs.readFileSync(path.join(root, name), "utf8"), content, "source remains unchanged");
    assert.equal(fs.readFileSync(path.join(root, "www", name), "utf8"), content, "staged copy matches");
  }
  assert.deepEqual(fs.readdirSync(path.join(root, "www")).sort(), ["assets", "icons", "index.html", "learn-teach.css", "learn-teach.js", "manifest.webmanifest", "service-worker.js", "sw.js"].sort());
  assert.equal(fs.readFileSync(path.join(root, "www", "service-worker.js"), "utf8"), files["sw.js"], "registered worker alias matches source");
  assert.deepEqual(fs.readdirSync(path.join(root, "www", "assets")).sort(), ["driver-kyc-upload.js", "ride-contact.js"].sort());
  assert.deepEqual(fs.readdirSync(path.join(root, "www", "icons")).sort(), ["icon-192.png", "icon-512.png"].sort());
  fs.rmSync(temp, { recursive: true, force: true });
});

test("Capacitor staging fails clearly when required source files are missing", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "friendride-cap-missing-"));
  const script = path.resolve(__dirname, "../scripts/stage-capacitor-web.cjs");
  const result = spawnSync(process.execPath, [script, temp], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Required staging input missing/);
  fs.rmSync(temp, { recursive: true, force: true });
});
