import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const reply = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function hashOtp(otp: string) {
  const bytes = new TextEncoder().encode(otp);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizedPhone(value: string) {
  return value.replace(/\D/g, "").replace(/^91/, "");
}

async function findAuthUserByPhone(admin: ReturnType<typeof createClient>, phone: string) {
  const target = normalizedPhone(phone);
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 500 });
    if (error) throw error;
    const found = data.users.find((user) =>
      user.phone && normalizedPhone(user.phone) === target
    );
    if (found) return found;
    if (data.users.length < 500) break;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "POST required" }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("FRIEND_RIDE_DB_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const authkey = Deno.env.get("APITXT_AUTHKEY");
    const templateId = Deno.env.get("APITXT_TEMPLATE_ID");

    if (!url || !serviceRoleKey || !anonKey || !authkey) {
      console.error("Missing required Edge Function secrets");
      return reply({ error: "Server configuration is incomplete" }, 500);
    }

    const admin = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const publicAuth = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const action = String(body.action ?? "");
    const mobile = String(body.mobile ?? "").replace(/\s/g, "");

    if (!/^(?:91)?[6-9]\d{9}$/.test(mobile)) {
      return reply({ error: "Valid Indian mobile number required" }, 400);
    }

    const nationalNumber = mobile.startsWith("91") ? mobile.slice(2) : mobile;
    const dbPhone = "91" + nationalNumber;
    const authPhone = "+91" + nationalNumber;

    if (action === "send") {
      const { data: old, error: oldError } = await admin
        .from("phone_otps")
        .select("created_at")
        .eq("mobile", dbPhone)
        .maybeSingle();

      if (oldError) {
        console.error("OTP lookup failed:", oldError.message);
        return reply({ error: "Could not start OTP request" }, 500);
      }
      if (old && Date.now() - Date.parse(old.created_at) < 60_000) {
        return reply({ error: "Wait 60 seconds before retrying" }, 429);
      }

      const otp = String(
        crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
      ).padStart(6, "0");

      const fields = new URLSearchParams({ authkey, mobile: dbPhone, otp });
      if (templateId) fields.set("template_id", templateId);

      const sms = await fetch("https://apitxt.com/api/sendOTP", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: fields,
      });
      const smsText = await sms.text();
      let smsResult: Record<string, unknown> = {};
      try {
        const parsed = JSON.parse(smsText);
        if (parsed && typeof parsed === "object") smsResult = parsed as Record<string, unknown>;
      } catch {
        smsResult = { message: smsText };
      }

      const providerStatus = String(smsResult.status ?? smsResult.type ?? "").trim().toLowerCase();
      const providerCode = Number(smsResult.code ?? smsResult.status_code ?? (typeof smsResult.status === "number" ? smsResult.status : NaN));
      const providerMessage = String(smsResult.message ?? smsResult.error ?? "").trim();
      const rateLimited = sms.status === 429 || providerCode === 429 ||
        /rate.?limit|too many requests|wait 15 seconds/i.test(providerMessage);
      const providerRejected = !sms.ok ||
        ["error", "failed", "failure", "rejected"].includes(providerStatus) ||
        (Number.isFinite(providerCode) && providerCode >= 400) ||
        smsResult.success === false;

      if (providerRejected) {
        console.error("APITXT rejected OTP request:", {
          httpStatus: sms.status,
          providerStatus,
          providerCode: Number.isFinite(providerCode) ? providerCode : null,
          rateLimited,
        });
        return reply({
          error: rateLimited
            ? "APITXT rate limit. దయచేసి 15 seconds వేచి మళ్లీ OTP ప్రయత్నించండి."
            : "APITXT OTP request failed. APITXT credits, DLT template, sender ID మరియు account status తనిఖీ చేయండి.",
        }, rateLimited ? 429 : 502);
      }

      const nestedData = smsResult.data && typeof smsResult.data === "object" ? smsResult.data as Record<string, unknown> : {};
      const requestId = String(smsResult.request_id ?? smsResult.requestId ?? nestedData.request_id ?? nestedData.requestId ?? nestedData.id ?? "").trim();
      const safeProviderMessage = providerMessage.replace(/\\b\\d{4,12}\\b/g, "[redacted]").slice(0, 180);
      console.log("APITXT OTP response diagnostics:", {
        httpStatus: sms.status,
        providerStatus: providerStatus || String(smsResult.status ?? ""),
        providerCode: Number.isFinite(providerCode) ? providerCode : null,
        requestIdPresent: Boolean(requestId),
        requestId: requestId || null,
        responseKeys: Object.keys(smsResult).slice(0, 12),
        safeMessage: safeProviderMessage,
      });
      // APITXT may return HTTP 200 + status=success + message without a request ID.
      // A request ID is useful for provider tracking, but must not block OTP storage
      // when the provider explicitly confirms successful submission.
      if (!requestId) {
        console.warn("APITXT success response had no request ID; OTP accepted based on provider success status.");
      }

      const { error: saveError } = await admin.from("phone_otps").upsert({
        mobile: dbPhone,
        otp_hash: await hashOtp(otp),
        expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
        attempts: 0,
        verified_at: null,
        created_at: new Date().toISOString(),
      }, { onConflict: "mobile" });

      if (saveError) {
        console.error("OTP storage failed:", saveError.message);
        return reply({ error: "Could not save OTP" }, 500);
      }

      return reply({ ok: true, message: "OTP request submitted" });
    }

    if (action === "verify") {
      const otp = String(body.otp ?? "");
      if (!/^\d{6}$/.test(otp)) {
        return reply({ error: "Enter the 6-digit OTP" }, 400);
      }

      const { data: record, error: readError } = await admin
        .from("phone_otps")
        .select("*")
        .eq("mobile", dbPhone)
        .maybeSingle();

      if (readError || !record) return reply({ error: "Request a new OTP" }, 400);
      if (record.verified_at) return reply({ error: "OTP already used" }, 400);
      if (Date.now() > Date.parse(record.expires_at)) {
        return reply({ error: "OTP expired. Request a new one" }, 400);
      }
      if (record.attempts >= 5) {
        return reply({ error: "Too many attempts. Request a new OTP" }, 429);
      }

      const { error: attemptError } = await admin
        .from("phone_otps")
        .update({ attempts: record.attempts + 1 })
        .eq("mobile", dbPhone);
      if (attemptError) return reply({ error: "Verification unavailable" }, 500);

      if ((await hashOtp(otp)) !== record.otp_hash) {
        return reply({ error: "Incorrect OTP" }, 400);
      }

      // Custom SMS OTP must be exchanged for a real Supabase Auth session.
      // A high-entropy password is generated and never returned to the client.
      let user = await findAuthUserByPhone(admin, authPhone);
      const oneTimePassword = randomPassword();

      if (!user) {
        const { data: created, error: createError } = await admin.auth.admin.createUser({
          phone: authPhone,
          phone_confirm: true,
          password: oneTimePassword,
          user_metadata: { mobile: nationalNumber, login_method: "sms_otp" },
        });

        if (createError) {
          // Another simultaneous request may have created the user.
          user = await findAuthUserByPhone(admin, authPhone);
          if (!user) {
            console.error("Auth user creation failed:", createError.message);
            return reply({ error: "Could not create the account for this phone number" }, 500);
          }
        } else {
          user = created.user;
        }
      } else {
        const { data: updated, error: updateUserError } = await admin.auth.admin.updateUserById(
          user.id,
          {
            password: oneTimePassword,
            phone: authPhone,
            phone_confirm: true,
          },
        );
        if (updateUserError) {
          console.error("Auth user update failed:", updateUserError.message);
          return reply({ error: "Could not prepare secure login session" }, 500);
        }
        user = updated.user;
      }

      const { data: signIn, error: signInError } = await publicAuth.auth.signInWithPassword({
        phone: authPhone,
        password: oneTimePassword,
      });

      if (signInError || !signIn.session || !signIn.user) {
        console.error("Session creation failed:", signInError?.message);
        return reply({ error: "OTP verified, but Supabase session creation failed" }, 500);
      }

      const { error: usedError } = await admin
        .from("phone_otps")
        .update({ verified_at: new Date().toISOString() })
        .eq("mobile", dbPhone)
        .is("verified_at", null);

      if (usedError) {
        console.error("OTP consume failed:", usedError.message);
        return reply({ error: "Session created but OTP finalization failed. Request a new OTP." }, 500);
      }

      return reply({
        ok: true,
        verified: true,
        session: signIn.session,
        user: signIn.user,
      });
    }

    return reply({ error: "Action must be send or verify" }, 400);
  } catch (error) {
    console.error("OTP function error:", error);
    return reply({ error: "Internal server error" }, 500);
  }
});