#!/usr/bin/env node
"use strict";
/**
 * Prepare a staging-only static web bundle for a future Capacitor wrapper.
 * This script does not modify index.html, production files, or create Android files.
 * Usage: node scripts/stage-capacitor-web.cjs [repo-root]
 */
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const output = path.join(root, "www");
const required = ["index.html", "manifest.webmanifest", "sw.js"];

for (const name of required) {
  const src = path.join(root, name);
  if (!fs.existsSync(src) || !fs.statSync(src).isFile()) {
    throw new Error("Required staging input missing: " + name);
  }
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const name of required) {
  fs.copyFileSync(path.join(root, name), path.join(output, name));
}
console.log("Capacitor web staging prepared at " + output);
console.log("Copied: " + required.join(", "));
console.log("No production/runtime files were changed.");
