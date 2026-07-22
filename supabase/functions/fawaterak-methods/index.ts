import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Fetches Fawaterak's enabled payment methods for the merchant account.
// Server-side only so the api_token never touches the browser. The client
// uses this to render a sub-selection UI (Visa, Fawry, Meeza, ...) inside
// the Fawaterak flow when more than one method is enabled.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const service = createClient(supabaseUrl, serviceKey);
    const { data: gw } = await service
      .from("payment_gateways")
      .select("id, is_enabled")
      .eq("gateway_key", "fawaterak")
      .maybeSingle();
    if (!gw) return json({ error: "Fawaterak gateway not configured" }, 500);
    if (!gw.is_enabled) return json({ error: "بوابة فواتيرك غير مفعّلة حاليًا" }, 400);

    const { data: sec } = await service
      .from("payment_gateway_secrets")
      .select("config")
      .eq("gateway_id", gw.id)
      .maybeSingle();
    const cfg = (sec?.config ?? {}) as { api_token?: string; mode?: string };
    const apiToken = String(cfg.api_token || "").trim();
    if (!apiToken) return json({ error: "بوابة فواتيرك غير مكتملة الإعداد" }, 400);
    const baseUrl = cfg.mode === "production"
      ? "https://app.fawaterak.com"
      : "https://staging.fawaterk.com";

    const res = await fetch(`${baseUrl}/api/v2/getPaymentmethods`, {
      headers: { Authorization: `Bearer ${apiToken}`, Accept: "application/json" },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("fawaterak getPaymentmethods error", res.status, body);
      return json({ error: (body as any)?.message || "تعذّر جلب طرق دفع فواتيرك" }, 400);
    }

    // Normalize the response into a stable, minimal shape for the client.
    const raw = Array.isArray((body as any)?.data) ? (body as any).data : [];
    const methods = raw.map((m: any) => ({
      payment_id: Number(m.paymentId ?? m.payment_id ?? 0),
      name_ar: String(m.name_ar ?? m.nameAr ?? m.name ?? ""),
      name_en: String(m.name_en ?? m.nameEn ?? m.name ?? ""),
      logo: String(m.logo ?? ""),
      redirect: String(m.redirect ?? "").toLowerCase() === "true",
    })).filter((m: any) => m.payment_id > 0);

    return json({ methods });
  } catch (e) {
    console.error("fawaterak-methods error", e);
    return json({ error: (e as Error).message ?? "internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
