import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-dispatch-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  const dispatchSecret = Deno.env.get("FR_NOTIFICATION_DISPATCH_SECRET");
  if (!dispatchSecret || req.headers.get("x-dispatch-secret") !== dispatchSecret)
    return json({ error: "Unauthorized dispatcher" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const publicKey = Deno.env.get("FR_VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("FR_VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("FR_VAPID_SUBJECT") || "mailto:support@friendride.in";
  if (!supabaseUrl || !serviceRole) return json({ error: "Supabase service environment missing" }, 500);
  if (!publicKey || !privateKey) return json({ error: "VAPID keys not configured in Supabase secrets" }, 503);

  let input: { user_id?: string; title?: string; body?: string; data?: Record<string, unknown> };
  try { input = await req.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
  if (!input.user_id || !input.title || !input.body) return json({ error: "user_id, title and body are required" }, 400);
  if (input.title.length > 120 || input.body.length > 1000) return json({ error: "Notification text too long" }, 400);

  try { webpush.setVapidDetails(subject, publicKey, privateKey); }
  catch (e) { return json({ error: "Invalid VAPID configuration", detail: String(e) }, 500); }

  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });
  const { data: subscriptions, error } = await admin.from("fr_push_subscriptions")
    .select("id,endpoint,p256dh,auth_key")
    .eq("user_id", input.user_id)
    .eq("is_active", true);
  if (error) return json({ error: error.message }, 500);
  if (!subscriptions?.length) return json({ sent: 0, failed: 0, message: "No active Web Push subscriptions" });

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    data: input.data || {},
    url: typeof input.data?.url === "string" ? input.data.url : "/",
  });
  let sent = 0, failed = 0, expired = 0;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth_key },
      }, payload, { TTL: 60 * 60, urgency: "high" });
      sent++;
      await admin.from("fr_push_subscriptions").update({ last_success_at: new Date().toISOString() }).eq("id", sub.id);
    } catch (e) {
      failed++;
      const status = Number((e as { statusCode?: number }).statusCode || 0);
      if (status === 404 || status === 410) {
        expired++;
        await admin.from("fr_push_subscriptions").update({ is_active: false }).eq("id", sub.id);
      }
    }
  }
  return json({ attempted: subscriptions.length, sent, failed, expired_deactivated: expired });
});
