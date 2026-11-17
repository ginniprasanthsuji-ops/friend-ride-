import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Server configuration is incomplete" }, 500);
  }

  const authorization = req.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

  // Verify the JWT with Supabase Auth; never trust role/user_metadata from the browser.
  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser();
  const user = authData?.user;
  if (authError || !user) return json({ error: "Invalid or expired session" }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // The existing single Primary Admin ACL is public.admin_users(user_id).
  const { data: adminRow, error: adminError } = await adminClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminError) return json({ error: "Admin authorization could not be verified" }, 500);
  if (!adminRow) return json({ error: "Admin access denied" }, 403);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = body.action;
  if (action === "list_applications") {
    const { data, error } = await adminClient
      .from("fr_grocery_applications")
      .select("id,user_id,application_status,cibil_band,suggested_grocery_limit,final_grocery_limit,created_at,reviewed_at,review_note")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return json({ error: "Unable to load applications" }, 500);
    return json({ applications: data ?? [] });
  }

  if (action === "decide_application") {
    const id = typeof body.application_id === "string" ? body.application_id : "";
    const status = body.status;
    const allowed = ["approved", "rejected", "on_hold"];
    if (!id || !allowed.includes(String(status))) {
      return json({ error: "Valid application_id and status are required" }, 400);
    }
    const note = typeof body.review_note === "string" ? body.review_note.slice(0, 1000) : null;
    const finalLimit = body.final_grocery_limit;
    if (finalLimit !== undefined &&
        (typeof finalLimit !== "number" || !Number.isFinite(finalLimit) || finalLimit < 0 || finalLimit > 7000)) {
      return json({ error: "Invalid grocery programme cap" }, 400);
    }
    const update: Record<string, unknown> = {
      application_status: status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_note: note,
      updated_at: new Date().toISOString(),
    };
    if (finalLimit !== undefined) update.final_grocery_limit = finalLimit;

    const { data, error } = await adminClient
      .from("fr_grocery_applications")
      .update(update)
      .eq("id", id)
      .select("id,application_status,final_grocery_limit,reviewed_at")
      .single();
    if (error) return json({ error: "Application decision could not be saved" }, 500);
    return json({ application: data, congratulations_allowed: data.application_status === "approved" });
  }

  if (action === "get_links") {
    const { data, error } = await adminClient
      .from("fr_grocery_admin_links")
      .select("fd_secured_card_url,new_credit_card_url,updated_at")
      .eq("config_key", "active")
      .maybeSingle();
    if (error) return json({ error: "Unable to load issuer links" }, 500);
    return json({ links: data ?? null });
  }

  if (action === "update_links") {
    const fdUrl = body.fd_secured_card_url;
    const newUrl = body.new_credit_card_url;
    for (const value of [fdUrl, newUrl]) {
      if (value !== null && value !== undefined) {
        if (typeof value !== "string" || value.length > 2048) return json({ error: "Invalid issuer URL" }, 400);
        try {
          if (new URL(value).protocol !== "https:") return json({ error: "Only HTTPS issuer URLs are allowed" }, 400);
        } catch {
          return json({ error: "Invalid issuer URL" }, 400);
        }
      }
    }
    const { data, error } = await adminClient
      .from("fr_grocery_admin_links")
      .upsert({
        config_key: "active",
        fd_secured_card_url: fdUrl ?? null,
        new_credit_card_url: newUrl ?? null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "config_key" })
      .select("fd_secured_card_url,new_credit_card_url,updated_at")
      .single();
    if (error) return json({ error: "Issuer links could not be saved" }, 500);
    return json({ links: data });
  }

  return json({ error: "Unsupported action" }, 400);
});
