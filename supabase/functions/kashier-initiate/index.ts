import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface InitiateBody {
  purpose: "course_purchase" | "wallet_topup";
  course_id?: string;
  topup_amount_piastres?: number;
  return_url: string; // absolute URL to /payment/kashier/return on the client
}

function hex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return hex(sig);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);

    const body = (await req.json()) as InitiateBody;
    if (!body?.purpose || !body.return_url) return json({ error: "Missing fields" }, 400);
    if (body.purpose !== "course_purchase" && body.purpose !== "wallet_topup") {
      return json({ error: "Invalid purpose" }, 400);
    }
    try {
      const u = new URL(body.return_url);
      if (!["http:", "https:"].includes(u.protocol)) return json({ error: "Invalid return_url" }, 400);
    } catch {
      return json({ error: "Invalid return_url" }, 400);
    }

    // Load Kashier config using service role (secret keys never exposed to client).
    const service = createClient(supabaseUrl, serviceKey);
    const { data: gwRow, error: gwErr } = await service
      .from("payment_gateways")
      .select("id, is_enabled, type, gateway_key")
      .eq("gateway_key", "kashier")
      .maybeSingle();
    if (gwErr || !gwRow) return json({ error: "Kashier gateway not configured" }, 500);
    if (!gwRow.is_enabled) return json({ error: "بوابة Kashier غير مفعّلة حاليًا" }, 400);

    const { data: secRow, error: secErr } = await service
      .from("payment_gateway_secrets")
      .select("config")
      .eq("gateway_id", gwRow.id)
      .maybeSingle();
    if (secErr || !secRow) return json({ error: "Kashier config missing" }, 500);

    const cfg = (secRow.config ?? {}) as Record<string, string>;
    const merchantId = String(cfg.merchant_id || "").trim();
    const apiKey = String(cfg.api_key || "").trim();
    const secretKey = String(cfg.secret_key || "").trim();
    const mode = (cfg.mode === "live" ? "live" : "test") as "test" | "live";
    if (!merchantId || !apiKey || !secretKey) {
      return json({ error: "بوابة Kashier غير مكتملة الإعداد. تواصل مع الإدارة." }, 400);
    }

    // Create pending transaction as the authenticated user (RLS + validation inside RPC).
    const { data: created, error: rpcErr } = await userClient.rpc(
      "create_pending_gateway_transaction",
      {
        p_gateway_key: "kashier",
        p_purpose: body.purpose,
        p_course_id: body.purpose === "course_purchase" ? body.course_id ?? null : null,
        p_topup_amount_piastres:
          body.purpose === "wallet_topup" ? body.topup_amount_piastres ?? null : null,
      },
    );
    if (rpcErr) return json({ error: rpcErr.message }, 400);
    const reference = String(created?.reference_number || "");
    const amountPiastres = Number(created?.amount_piastres || 0);
    if (!reference || amountPiastres <= 0) return json({ error: "Failed to create transaction" }, 500);

    // Load enabled methods for this gateway (Phase 45).
    const { data: methodRows } = await service
      .from("payment_gateway_methods")
      .select("method_key, is_enabled")
      .eq("gateway_id", gwRow.id);
    const allRows = (methodRows ?? []) as Array<{ method_key: string; is_enabled: boolean }>;
    const enabledKeys = allRows.filter((r) => r.is_enabled).map((r) => r.method_key);
    if (enabledKeys.length === 0) {
      return json(
        { error: "لا توجد طرق دفع مفعّلة لبوابة Kashier. تواصل مع الإدارة." },
        400,
      );
    }

    // Kashier expects a plain decimal EGP string, 2 decimals.
    const amountStr = (amountPiastres / 100).toFixed(2);
    const currency = "EGP";
    const path = `/?payment=${merchantId}.${reference}.${amountStr}.${currency}`;
    const hash = await hmacSha256Hex(secretKey, path);

    const host = mode === "live" ? "https://checkout.kashier.io" : "https://checkout.kashier.io";
    // Kashier's Hosted Payment Page URL. Mode is signaled to Kashier by the merchant account itself;
    // test-mode merchants receive test-processing on the same host per current Kashier docs.
    // Historically Kashier also documented `test-iframe`/`iframe` subdomains; keep that for compatibility.
    const legacyHost = mode === "live" ? "https://iframe.kashier.io" : "https://test-iframe.kashier.io";
    const params = new URLSearchParams({
      mid: merchantId,
      orderId: reference,
      amount: amountStr,
      currency,
      hash,
      mode: mode === "live" ? "live" : "test",
      merchantRedirect: body.return_url,
      allowedMethods: enabledKeys.join(","),
      display: "ar",
      redirectMethod: "get",
    });
    const redirectUrl = `${legacyHost}/?${params.toString()}`;

    return json({
      redirect_url: redirectUrl,
      reference_number: reference,
      amount_piastres: amountPiastres,
      mode,
    });
  } catch (e) {
    console.error("kashier-initiate error", e);
    return json({ error: (e as Error).message ?? "internal error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
