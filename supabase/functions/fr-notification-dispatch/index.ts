import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-dispatch-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function b64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function pemBytes(pem: string) {
  const raw = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  return Uint8Array.from(atob(raw), c => c.charCodeAt(0));
}
async function oauthToken(email: string, key: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({
    iss: email, scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600
  })));
  const signing = header + "." + payload;
  const cryptoKey = await crypto.subtle.importKey("pkcs8", pemBytes(key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signing)));
  const assertion = signing + "." + b64url(sig);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) throw new Error("Google OAuth token failed");
  return json.access_token;
}

async function finalizeEvent(admin: any, eventId: string, claimToken: string, fields: Record<string, unknown>) {
  return await admin.from("fr_notification_events")
    .update({ ...fields, claim_token: null, claimed_at: null })
    .eq("id", eventId)
    .eq("claim_token", claimToken);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST required" }), {
    status: 405, headers: { ...cors, "Content-Type": "application/json" }
  });

  const secret = Deno.env.get("FR_NOTIFICATION_DISPATCH_SECRET");
  if (!secret || req.headers.get("x-dispatch-secret") !== secret) return new Response(JSON.stringify({ error: "Unauthorized dispatcher" }), {
    status: 401, headers: { ...cors, "Content-Type": "application/json" }
  });

  const url = Deno.env.get("SUPABASE_URL");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const project = Deno.env.get("FCM_PROJECT_ID");
  const email = Deno.env.get("FCM_CLIENT_EMAIL");
  const privateKey = Deno.env.get("FCM_PRIVATE_KEY");
  if (!url || !service) return new Response(JSON.stringify({ error: "Supabase service environment missing" }), {
    status: 500, headers: { ...cors, "Content-Type": "application/json" }
  });
  if (!project || !email || !privateKey) return new Response(JSON.stringify({ error: "FCM credentials not configured" }), {
    status: 503, headers: { ...cors, "Content-Type": "application/json" }
  });

  const admin = createClient(url, service, { auth: { persistSession: false } });
  let accessToken: string;
  try {
    accessToken = await oauthToken(email, privateKey);
  } catch {
    return new Response(JSON.stringify({ error: "Google OAuth token unavailable" }), {
      status: 502, headers: { ...cors, "Content-Type": "application/json" }
    });
  }

  const claimToken = crypto.randomUUID();
  const { data: events, error: claimError } = await admin.rpc("fr_notification_claim_batch", {
    p_claim_token: claimToken, p_limit: 50
  });
  if (claimError) return new Response(JSON.stringify({ error: "Notification claim failed" }), {
    status: 500, headers: { ...cors, "Content-Type": "application/json" }
  });

  let sent = 0, skipped = 0, failed = 0, finalizationErrors = 0;
  for (const event of (events || [])) {
    const prefField = ({
      ride: "ride_enabled", order: "order_enabled", payment: "payment_enabled",
      account: "account_enabled", partner: "partner_enabled", hourly: "hourly_enabled",
      promo: "promo_enabled", admin: "account_enabled"
    } as Record<string, string>)[event.category];

    const { data: pref } = await admin.from("fr_notification_preferences")
      .select("*").eq("user_id", event.user_id).maybeSingle();
    if (prefField && pref && pref[prefField] === false) {
      const { error } = await finalizeEvent(admin, event.id, claimToken, {
        status: "skipped", error_message: "Category disabled by user preference"
      });
      if (error) finalizationErrors++;
      skipped++;
      continue;
    }

    const { data: tokens } = await admin.from("fr_notification_tokens")
      .select("id,token,platform").eq("user_id", event.user_id).eq("is_active", true);
    if (!tokens?.length) {
      const { error } = await finalizeEvent(admin, event.id, claimToken, {
        status: "skipped", error_message: "No active device token"
      });
      if (error) finalizationErrors++;
      skipped++;
      continue;
    }

    let any = false, allOk = true;
    for (const token of tokens) {
      try {
        const res = await fetch("https://fcm.googleapis.com/v1/projects/" + project + "/messages:send", {
          method: "POST",
          headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
          body: JSON.stringify({ message: {
            token: token.token,
            notification: { title: event.title, body: event.body },
            data: Object.fromEntries(Object.entries(event.payload || {}).map(([k, v]) => [k, String(v)])),
            android: { priority: "HIGH", notification: { channel_id: "friendride_updates", click_action: "FLUTTER_NOTIFICATION_CLICK" } }
          } })
        });
        const result = await res.json();
        if (res.ok) {
          any = true;
          await admin.from("fr_notification_tokens").update({ last_seen_at: new Date().toISOString() }).eq("id", token.id);
        } else {
          allOk = false;
          if (JSON.stringify(result).includes("UNREGISTERED")) {
            await admin.from("fr_notification_tokens").update({ is_active: false }).eq("id", token.id);
          }
        }
      } catch {
        allOk = false;
      }
    }

    if (any) {
      const { error } = await finalizeEvent(admin, event.id, claimToken, {
        status: "sent", sent_at: new Date().toISOString(),
        error_message: allOk ? null : "One or more token deliveries failed"
      });
      if (error) finalizationErrors++;
      sent++;
    } else {
      const { error } = await finalizeEvent(admin, event.id, claimToken, {
        status: "failed", error_message: "FCM delivery failed for all active tokens"
      });
      if (error) finalizationErrors++;
      failed++;
    }
  }

  return new Response(JSON.stringify({
    processed: (events || []).length, sent, skipped, failed, finalizationErrors,
    credentialConfigured: true
  }), { headers: { ...cors, "Content-Type": "application/json" } });
});
