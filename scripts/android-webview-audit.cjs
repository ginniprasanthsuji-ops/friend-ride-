#!/usr/bin/env node
"use strict";
/** Static audit for Android WebView/Capacitor readiness; heuristic only. */
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(process.argv[2] || path.join(__dirname, ".."));
const webDir = path.join(root, "www");
const entry = path.join(webDir, "index.html");
const manifest = path.join(webDir, "manifest.webmanifest");
const worker = path.join(webDir, "service-worker.js");
const checks = [];
const add = (name, status, detail) => checks.push({ name, status, detail });
if (!fs.existsSync(entry)) add("Staged index.html", "FAIL", "Run npm run build:capacitor-web first.");
else {
  const html = fs.readFileSync(entry, "utf8");
  add("Staged index.html", "PASS", "Present.");
  add("Geolocation API", /navigator\.geolocation/.test(html) ? "INFO" : "WARN", /navigator\.geolocation/.test(html) ? "App uses browser geolocation; native permission/device testing required." : "No geolocation API reference detected.");
  add("External navigation", /window\.open|target=["']_blank["']/.test(html) ? "WARN" : "INFO", /window\.open|target=["']_blank["']/.test(html) ? "External navigation/new-window patterns exist; WebView handling must be tested." : "No obvious external-window patterns.");
  add("Notification APIs", /Notification|PushManager/.test(html) ? "INFO" : "WARN", /Notification|PushManager/.test(html) ? "Notification APIs referenced; permission and push behavior need device tests." : "No notification API references detected.");
  add("Supabase endpoint", /supabase\.co/i.test(html) ? "PASS" : "WARN", "Static check only; auth, RLS and network reachability require live tests.");
  add("Payment flow", /cashfree/i.test(html) ? "INFO" : "WARN", /cashfree/i.test(html) ? "Cashfree references exist; redirects and payment results need device tests." : "No Cashfree references detected.");
}
if (!fs.existsSync(manifest)) add("Web manifest", "FAIL", "Staged manifest missing.");
else {
  add("Web manifest", "PASS", "Present.");
  try {
    const data = JSON.parse(fs.readFileSync(manifest, "utf8"));
    for (const icon of data.icons || []) {
      const iconPath = path.join(webDir, icon.src.replace(/^\.\//, ""));
      add("Manifest icon " + icon.src, fs.existsSync(iconPath) ? "PASS" : "WARN", fs.existsSync(iconPath) ? "Icon file present." : "Referenced icon file not found in staging.");
    }
  } catch (error) { add("Manifest JSON", "FAIL", "Invalid JSON: " + error.message); }
}
add("Service worker registration file", fs.existsSync(worker) ? "PASS" : "FAIL", fs.existsSync(worker) ? "service-worker.js exists in staging." : "Staging alias is missing; run staging script.");
const counts = checks.reduce((acc, item) => (acc[item.status] = (acc[item.status] || 0) + 1, acc), {});
console.log("FRIEND RIDE Android WebView static audit");
for (const item of checks) console.log(item.status.padEnd(5) + " | " + item.name + " | " + item.detail);
console.log("Summary:", JSON.stringify(counts));
if (checks.some(item => item.status === "FAIL")) process.exitCode = 1;
