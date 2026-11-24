// FRIEND RIDE Razorpay Standard Checkout — QA branch implementation
// Configure Supabase Edge Function secrets before deployment:
// RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: corsHeaders });
const encoder = new TextEncoder();
const allowedPlans: Record<string, number> = { Basic: 299, Growth: 599, Premium: 999 };

async function authenticatedUser(req: Request, supabaseUrl: string, anonKey: string) {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\\s+/i, "");
  if (!token) return null;
  const response = await fetch(supabaseUrl + "/auth/v1/user", {
    headers: { apikey: anonKey, Authorization: "Bearer " + token },
  });
  if (!response.ok) return null;
  return await response.json();
}
function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
async function hmacSha256(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToHex(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message))));
}
function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
async function razorpayGet(path: string, keyId: string, keySecret: string) {
  return await fetch("https://api.razorpay.com/v1/" + path, {
    headers: { Authorization: "Basic " + btoa(keyId + ":" + keySecret) },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!supabaseUrl || !anonKey || !keyId || !keySecret) return json(500, { error: "Payment backend is not configured." });

  try {
    const user = await authenticatedUser(req, supabaseUrl, anonKey);
    if (!user?.id) return json(401, { error: "Authentication required." });
    const body = await req.json();
    const action = body?.action;

    if (action === "create-order") {
      const amount = Number(body.amount);
      const plan = String(body.plan || "");
      if (!Number.isInteger(amount) || amount < 100 || allowedPlans[plan] !== amount) {
        return json(400, { error: "Invalid subscription plan or amount." });
      }
      const receipt = ("frsub_" + String(user.id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) + "_" + Date.now()).slice(0, 40);
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { Authorization: "Basic " + btoa(keyId + ":" + keySecret), "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "INR", receipt, notes: { user_id: user.id, plan, product: "FRIEND RIDE subscription" } }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 401) return json(401, { error: "Razorpay credentials rejected." });
      if (!response.ok) return json(500, { error: result?.error?.description || "Razorpay order creation failed." });
      return json(200, { order_id: result.id, amount: result.amount, currency: result.currency, key_id: keyId, plan });
    }

    if (action === "verify-payment") {
      const orderId = String(body.razorpay_order_id || "");
      const paymentId = String(body.razorpay_payment_id || "");
      const signature = String(body.razorpay_signature || "");
      if (!orderId || !paymentId || !signature) return json(400, { error: "Missing payment verification fields." });
      const expected = await hmacSha256(keySecret, orderId + "|" + paymentId);
      if (!constantTimeEqual(expected, signature)) return json(400, { verified: false, error: "Payment signature mismatch." });

      const orderResponse = await razorpayGet("orders/" + encodeURIComponent(orderId), keyId, keySecret);
      if (!orderResponse.ok) return json(400, { verified: false, error: "Could not validate Razorpay order." });
      const order = await orderResponse.json();
      const plan = String(order?.notes?.plan || "");
      if (order?.notes?.user_id !== user.id || allowedPlans[plan] !== Number(order?.amount) / 100 || order?.currency !== "INR") {
        return json(400, { verified: false, error: "Order does not match this account or approved plan." });
      }

      const paymentResponse = await razorpayGet("payments/" + encodeURIComponent(paymentId), keyId, keySecret);
      if (!paymentResponse.ok) return json(400, { verified: false, error: "Could not validate Razorpay payment." });
      const payment = await paymentResponse.json();
      if (payment?.order_id !== orderId || payment?.status !== "captured" || payment?.amount !== order.amount || payment?.currency !== order.currency) {
        return json(400, { verified: false, error: "Payment is not captured or does not match the order." });
      }
      // Verified/captured only. Subscription persistence and activation require mapping to
      // the existing backend subscription model before a paid plan can be marked Active.
      return json(200, { verified: true, payment_id: paymentId, order_id: orderId, plan, amount: order.amount, activation: "pending_backend_mapping" });
    }
    return json(400, { error: "Unsupported action." });
  } catch (error) {
    console.error("FR Razorpay handler:", error);
    return json(500, { error: "Payment request failed." });
  }
});
