/* FRIEND RIDE — Additive push subscription lifecycle helper.
 * Explicitly invoked from a user action only. Existing alert tones/UI are untouched.
 * Requires authenticated Supabase client, current auth user, provider adapter, and public VAPID key.
 */
(function (global) {
  "use strict";

  async function enable({ sb, user, provider, vapidPublicKey } = {}) {
    if (!sb || !user?.id || !provider) return { enabled: false, reason: "missing-auth-or-provider" };
    const permission = await provider.requestPermission();
    if (permission !== "granted") return { enabled: false, reason: "permission-not-granted", permission };
    const result = await provider.subscribe({ vapidPublicKey });
    if (!result?.subscribed || !result.subscription) return { enabled: false, reason: result?.reason || "subscription-failed" };
    const sub = result.subscription;
    const endpoint = sub.endpoint;
    const p256dh = sub.keys?.p256dh;
    const auth_key = sub.keys?.auth;
    if (!endpoint || !p256dh || !auth_key) {
      return { enabled: false, reason: "subscription-data-incomplete" };
    }
    const { error } = await sb.from("fr_push_subscriptions").upsert({
      user_id: user.id,
      endpoint,
      p256dh,
      auth_key,
      user_agent: global.navigator?.userAgent || null,
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: "endpoint" });
    if (error) {
      try { await provider.unsubscribe(); } catch (_) {}
      return { enabled: false, reason: "subscription-save-failed", error: String(error.message || error) };
    }
    return { enabled: true, subscriptionSaved: true };
  }

  async function disable({ sb, user, provider } = {}) {
    if (!sb || !user?.id || !provider) return { disabled: false, reason: "missing-auth-or-provider" };
    let endpoint = null;
    try {
      const registration = await global.navigator?.serviceWorker?.getRegistration();
      const current = await registration?.pushManager?.getSubscription();
      endpoint = current?.endpoint || null;
    } catch (_) {}
    if (endpoint) {
      const { error } = await sb.from("fr_push_subscriptions")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("endpoint", endpoint);
      if (error) return { disabled: false, reason: "subscription-disable-failed", error: String(error.message || error) };
    }
    const result = await provider.unsubscribe();
    return { disabled: Boolean(result?.unsubscribed), databaseMarkedInactive: Boolean(endpoint), browserUnsubscribed: Boolean(result?.unsubscribed) };
  }

  global.FRPushSubscriptionLifecycle = Object.freeze({ enable, disable });
})(window);
