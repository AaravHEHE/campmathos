// Edge function: stores a registration and sends confirmation + director notification.
// Uses Resend for email delivery. Default Resend sender (no domain required) with reply-to your Gmail.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM = "Mathos Camp <onboarding@resend.dev>";
const REPLY_TO = "campmathos@gmail.com";
const DIRECTOR_NOTIFY = "campmathos@gmail.com";

// Restrict to standard printable email characters — explicitly excludes <, >, &, " to prevent HTML injection.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
}) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY missing — skipping send");
    return { skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.reply_to ?? REPLY_TO,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("Resend error", res.status, text);
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

function confirmationHtml(email: string) {
  return `
<!doctype html>
<html><body style="margin:0;padding:0;background:#fdf8ee;font-family:Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #1a1a2e;border-radius:16px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Mathos Camp · June 2026</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;">Thanks for your interest! 👋</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
            We've noted that your family is interested in <strong>Mathos</strong> — the completely free summer applied math camp at Naperville Public Library. This isn't a commitment, just a heads-up so we can keep you in the loop.
          </p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
            We've got <strong>${escapeHtml(email)}</strong> on the list. In the next few weeks we'll send you:
          </p>
          <ul style="margin:0 0 16px 20px;padding:0;font-size:16px;line-height:1.6;">
            <li>The full June schedule (Mon · Wed · Fri)</li>
            <li>Library check-in details and room location</li>
            <li>What to bring on day one — if you decide to come</li>
          </ul>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
            Sessions are 2.5 hours with a 15-minute break in the middle. Camp is for grades 4–7 and is 100% free. You can decide closer to June whether to attend.
          </p>
          <p style="margin:24px 0 0;font-size:14px;color:#666;">
            Questions? Just reply to this email — it goes straight to our directors at campmathos@gmail.com.
          </p>
          <p style="margin:24px 0 0;font-size:14px;">— The Mathos team</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function notifyHtml(email: string, when: string) {
  return `
<!doctype html>
<html><body style="font-family:Arial,sans-serif;color:#111;">
  <h2 style="margin:0 0 12px;">New Mathos interest</h2>
  <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p style="margin:0 0 8px;"><strong>Submitted:</strong> ${escapeHtml(when)}</p>
  <p style="margin:16px 0 0;font-size:13px;color:#666;">View all interested families in the admin dashboard.</p>
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

  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!rawEmail || rawEmail.length > 320 || !EMAIL_RE.test(rawEmail)) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Duplicate check first — friendly message instead of a generic error.
    const { data: existing, error: existingError } = await supabase
      .from("registrations")
      .select("id")
      .eq("email", rawEmail)
      .maybeSingle();

    if (existingError) {
      console.error("Lookup error", existingError);
      return new Response(JSON.stringify({ error: "Could not check your registration. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (existing) {
      return new Response(
        JSON.stringify({
          duplicate: true,
          message: "Looks like you've already signed up — we have you on the list! 📬",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("registrations")
      .insert({ email: rawEmail })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Insert error", insertError);
      // Race-condition fallback: if a unique constraint fires, treat as duplicate.
      const code = (insertError as { code?: string }).code;
      if (code === "23505") {
        return new Response(
          JSON.stringify({
            duplicate: true,
            message: "Looks like you've already signed up — we have you on the list! 📬",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "Could not save your registration. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send both emails in parallel; don't fail the request if email fails.
    const when = new Date(inserted!.created_at as string).toLocaleString("en-US", {
      timeZone: "America/Chicago",
    });

    const results = await Promise.allSettled([
      sendEmail({
        to: rawEmail,
        subject: "Thanks for your interest in Mathos camp 👋",
        html: confirmationHtml(rawEmail),
      }),
      sendEmail({
        to: DIRECTOR_NOTIFY,
        subject: `New Mathos interest: ${rawEmail}`,
        html: notifyHtml(rawEmail, when),
        reply_to: rawEmail,
      }),
    ]);

    results.forEach((r, i) => {
      if (r.status === "rejected") console.error(`Email ${i} failed:`, r.reason);
    });

    return new Response(JSON.stringify({ ok: true, id: inserted!.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unhandled error", err);
    return new Response(JSON.stringify({ error: "Unexpected server error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
