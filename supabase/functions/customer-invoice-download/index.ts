import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) return json({ error: "Server configuration missing" }, 500);

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: authError } = await userClient.auth.getUser();
  if (authError || !userData.user) return json({ error: "Invalid session" }, 401);

  let body: { invoice_id?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!body.invoice_id || !/^[0-9a-f-]{36}$/i.test(body.invoice_id)) return json({ error: "Invalid invoice ID" }, 400);

  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: invoice, error } = await admin.from("invoices")
    .select("id,customer_id,invoice_number,payment_status,pdf_path")
    .eq("id", body.invoice_id).eq("customer_id", userData.user.id).maybeSingle();
  if (error) return json({ error: "Invoice lookup failed" }, 500);
  if (!invoice) return json({ error: "Invoice not found" }, 404);
  if (invoice.payment_status !== "paid" || !invoice.pdf_path) return json({ error: "Paid invoice PDF is not available yet" }, 409);
  if (!invoice.pdf_path.startsWith(userData.user.id + "/")) return json({ error: "Invalid invoice storage path" }, 403);

  const { data: signed, error: signError } = await admin.storage
    .from("friendride-invoices").createSignedUrl(invoice.pdf_path, 60, { download: invoice.invoice_number + ".pdf" });
  if (signError || !signed?.signedUrl) return json({ error: "Could not create secure download link" }, 500);
  return json({ url: signed.signedUrl, file_name: invoice.invoice_number + ".pdf" });
});
