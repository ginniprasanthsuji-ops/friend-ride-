const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

test("existing notification page and alert controls remain present", () => {
  const html = fs.readFileSync("index.html", "utf8");
  for (const marker of [
    'id="notifications"',
    'frEnableDeviceAlerts()',
    'frPreviewAlertTone(\'order\')',
    'frPreviewAlertTone(\'ride\')',
    'frPreviewAlertTone(\'customer\')',
    'frRideNotificationStatus',
    'frNotificationFeed',
    'frRideUnreadBadge',
    'frRideShowToast',
    'frPlayAlertTone',
    'frSpeakAlert',
    'frRideSpeakNotification',
    'navigator.vibrate',
    'frRideStartRealtime',
    'fr_app_notifications',
    'fr_ride_notifications'
  ]) assert.ok(html.includes(marker), "existing notification marker missing: " + marker);
});

test("existing service worker push and notification click behavior remains present", () => {
  const sw = fs.readFileSync("sw.js", "utf8");
  for (const marker of ['addEventListener("push"', 'showNotification', 'addEventListener("notificationclick"', 'clients.openWindow', 'clients.matchAll']) {
    assert.ok(sw.includes(marker), "existing service worker marker missing: " + marker);
  }
});
