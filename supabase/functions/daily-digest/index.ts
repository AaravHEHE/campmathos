// Edge function: weekly digest of new sign-ups (last 7 days) emailed to the director.
// Triggered by pg_cron. Sends from campmathos@gmail.com via Gmail SMTP.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendGmail, closeGmail } from "../_shared/gmail.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DIGEST_HOOK_SECRET = Deno.env.get("DIGEST_HOOK_SECRET") ?? "";

const DIRECTOR_NOTIFY = "campmathos@gmail.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function digestHtml(rows: { email: string; created_at: string }[], total: number) {
  const list = rows
    .map((r) => {
      const when = new Date(r.created_at).toLocaleString("en-US", {
        timeZone: "America/Chicago",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      return `<li style="margin:0 0 6px;"><strong>${escapeHtml(r.email)}</strong> <span style="color:#666;">— ${escapeHtml(when)}</span></li>`;
    })
    .join("");
  const body = rows.length === 0
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;">No new sign-ups in the last 7 days.</p>`
    : `<p style="margin:0 0 12px;font-size:16px;line-height:1.5;"><strong>${rows.length}</strong> new sign-up${rows.length === 1 ? "" : "s"} in the last 7 days:</p>
       <ul style="margin:0 0 16px 20px;padding:0;font-size:14px;line-height:1.6;">${list}</ul>`;

  return `
<!doctype html>
<html><body style="margin:0;padding:0;background:#fdf8ee;font-family:Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #1a1a2e;border-radius:16px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Mathos Camp · Weekly Digest</p>
          <h1 style="margin:0 0 16px;font-size:24px;line-height:1.1;">Sign-ups summary</h1>
          ${body}
          <p style="margin:24px 0 0;font-size:13px;color:#666;">
            Total interest list: <strong>${total}</strong> people.
          </p>
          <p style="margin:24px 0 0;font-size:13px;color:#666;">
            View the full list in the <a href="https://campmathos.lovable.app/admin">admin dashboard</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  // Only the scheduled pg_cron job may trigger this. It sends a private shared
  // secret (DIGEST_HOOK_SECRET) that is never shipped to the browser bundle.
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const provided = req.headers.get("x-digest-secret") ?? "";
  if (!DIGEST_HOOK_SECRET || provided !== DIGEST_HOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recent, error: recentErr } = await supabase
      .from("registrations")
      .select("email, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false });
    if (recentErr) throw recentErr;

    const { count, error: countErr } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true });
    if (countErr) throw countErr;

    const rows = recent ?? [];
    const subject = rows.length === 0
      ? "Mathos weekly digest: 0 new sign-ups"
      : `Mathos weekly digest: ${rows.length} new sign-up${rows.length === 1 ? "" : "s"}`;

    await sendGmail({
      to: DIRECTOR_NOTIFY,
      subject,
      html: digestHtml(rows, count ?? 0),
    });

    await closeGmail();

    return new Response(
      JSON.stringify({ ok: true, sentTo: DIRECTOR_NOTIFY, count: rows.length, total: count ?? 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Digest failed", err);
    await closeGmail();
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
});
