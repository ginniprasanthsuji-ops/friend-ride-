// FRIEND RIDE — internal server-side Web Push sender.
// Integration branch only. Not deployed. Calls must come from trusted backend services.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "null",
  "Access-Control-Allow-Headers": "content-type, x-fr-push-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function constantTimeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aa = encoder.encode(a);
  const bb = encoder.encode(b);
  if (aa.length !== bb.length) return false;
  return crypto.subtle.timingSafeEqual(aa, bb);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method-not-allowed" }, 405);

  const internalSecret = Deno.env.get("FR_PUSH_INTERNAL_SECRET");
  const suppliedSecret = req.headers.get("x-fr-push-secret") || "";
  if (!internalSecret || !(await constantTimeEqual(suppliedSecret, internalSecret))) {
    return json({ error: "unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
  const vapidPublic = Deno.env.get("FR_VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("FR_VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("FR_VAPID_SUBJECT") || "mailto:support@friendride.in";
  if (!supabaseUrl || !secretKeysRaw || !vapidPublic || !vapidPrivate) {
    return json({ error: "server-configuration-incomplete" }, 503);
  }

  let secretKeys: Record<string, string>;
  try { secretKeys = JSON.parse(secretKeysRaw); } catch { return json({ error: "server-key-config-invalid" }, 503); }
  const serviceKey = secretKeys.default;
  if (!serviceKey) return json({ error: "server-key-missing" }, 503);

  let body: { user_ids?: unknown; notification?: unknown };
  try { body = await req.json(); } catch { return json({ error: "invalid-json" }, 400); }
  const userIds = Array.isArray(body.user_ids)
    ? [...new Set(body.user_ids.filter((v): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v)))]
    : [];
  const notification = body.notification as Record<string, unknown> | undefined;
  if (!userIds.length || userIds.length > 100 || !notification) return json({ error: "invalid-payload" }, 400);

  const title = typeof notification.title === "string" ? notification.title.slice(0, 100) : "FRIEND RIDE";
  const message = typeof notification.body === "string" ? notification.body.slice(0, 240) : "మీ FRIEND RIDE అప్‌డేట్ ఉంది.";
  const url = typeof notification.url === "string" && notification.url.startsWith("/") ? notification.url : "/";
  const tag = typeof notification.tag === "string" ? notification.tag.slice(0, 80) : undefined;

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const { data: rows, error } = await admin.from("fr_push_subscriptions")
    .select("id,user_id,endpoint,p256dh,auth_key")
    .eq("is_active", true)
    .in("user_id", userIds);
  if (error) return json({ error: "subscription-query-failed" }, 500);

  let sent = 0, failed = 0, expired = 0;
  for (const row of rows || []) {
    const subscription = { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth_key } };
    try {
      await webpush.sendNotification(subscription, JSON.stringify({ title, body: message, url, tag }));
      sent++;
      await admin.from("fr_push_subscriptions").update({ last_success_at: new Date().toISOString() }).eq("id", row.id);
    } catch (err) {
      failed++;
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        expired++;
        await admin.from("fr_push_subscriptions").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", row.id);
      }
      // Avoid logging endpoint/key details.
      console.warn("Web push delivery failed", { statusCode, subscriptionId: row.id });
    }
  }
  return json({ targetedSubscriptions: (rows || []).length, sent, failed, expired });
});
