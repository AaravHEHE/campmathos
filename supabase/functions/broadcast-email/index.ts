// Edge function: admin-only broadcast to all registrants via Gmail SMTP.
// Verifies the caller is an authenticated admin via user_roles, then sends
// the same email body to every row in the registrations table.
// Each recipient gets their own message (no other addresses visible).
// NOTE: Gmail free has a ~500 recipients/day limit.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendGmail, closeGmail } from "../_shared/gmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bodyHtml(message: string) {
  const safe = escapeHtml(message).replace(/\n/g, "<br>");
  return `
<!doctype html>
<html><body style="margin:0;padding:0;background:#fdf8ee;font-family:Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #1a1a2e;border-radius:16px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Mathos Camp · Update</p>
          <div style="margin:0 0 16px;font-size:16px;line-height:1.6;">${safe}</div>
          <p style="margin:24px 0 0;font-size:14px;color:#666;">
            Reply to this email to reach the directors directly (campmathos@gmail.com).
          </p>
          <p style="margin:24px 0 0;font-size:14px;">— The Mathos team</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.slice(7);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: roleRow, error: roleErr } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleErr || !roleRow) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const subject = (body.subject ?? "").trim();
  const message = (body.message ?? "").trim();
  if (!subject || subject.length > 200) {
    return new Response(JSON.stringify({ error: "Subject is required (≤200 chars)" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!message || message.length > 10000) {
    return new Response(JSON.stringify({ error: "Message is required (≤10000 chars)" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: regs, error: regsErr } = await admin
    .from("registrations")
    .select("email");
  if (regsErr) {
    console.error("List regs failed", regsErr);
    return new Response(JSON.stringify({ error: "Could not load registrants" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const emails = Array.from(new Set((regs ?? []).map((r) => r.email).filter(Boolean)));
  const html = bodyHtml(message);

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  // Sequential with small pacing — Gmail tolerates ~1 send/sec via SMTP pool.
  for (const to of emails) {
    try {
      await sendGmail({ to, subject, html });
      sent++;
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${to}: ${msg}`);
      console.error("Broadcast send failed", to, msg);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  await closeGmail();

  return new Response(
    JSON.stringify({
      ok: true,
      total: emails.length,
      sent,
      failed,
      errors: errors.slice(0, 5),
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
