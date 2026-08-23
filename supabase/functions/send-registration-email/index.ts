// Edge function: stores a registration and sends confirmation + director notification.
// Uses Gmail SMTP — emails come directly from campmathos@gmail.com.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendGmail, closeGmail } from "../_shared/gmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const DIRECTOR_NOTIFY = "campmathos@gmail.com";

// Camp year new interest-list signups belong to.
const CAMP_YEAR = 2027;

// Restrict to standard printable email characters — explicitly excludes <, >, &, " to prevent HTML injection.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Checks the domain can actually receive mail. Uses DNS-over-HTTPS (MX, then A/AAAA
// fallback per RFC 5321). Fails open on network trouble so we never block a real signup.
async function domainAcceptsMail(domain: string): Promise<boolean> {
  if (!domain) return false;
  const lookup = async (type: "MX" | "A" | "AAAA") => {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
      { headers: { accept: "application/dns-json" } },
    );
    if (!res.ok) throw new Error(`DNS lookup failed: ${res.status}`);
    const json = (await res.json()) as { Status?: number; Answer?: unknown[] };
    return (json.Answer?.length ?? 0) > 0;
  };
  try {
    if (await lookup("MX")) return true;
    if (await lookup("A")) return true;
    return await lookup("AAAA");
  } catch (err) {
    console.error("DNS check error", err);
    return true; // fail open
  }
}


function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function confirmationHtml(email: string) {
  return `
<!doctype html>
<html><body style="margin:0;padding:0;background:#fdf8ee;font-family:Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #1a1a2e;border-radius:16px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Mathos Camp</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;">Thanks for showing your interest! 🙌</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
            We've added <strong>${escapeHtml(email)}</strong> to our interest list for <strong>Mathos</strong> — the completely free online summer applied math camp taught live over Zoom. This isn't a commitment — we'll reach out with more details closer to the date of the camp.
          </p>
          <p style="margin:0 0 8px;font-size:16px;line-height:1.5;font-weight:bold;">For now, here's what to know:</p>
          <ul style="margin:0 0 16px 20px;padding:0;font-size:16px;line-height:1.6;">
            <li>Sessions run <strong>2 hours</strong> each (3–5 PM Central), with a short break</li>
            <li><strong>Tuesdays and Thursdays</strong>, 3–5 PM Central</li>
            <li>Runs <strong>July 7 – 30, 2026</strong></li>
            <li>Live online over Zoom · 100% free</li>
            <li>Recommended for campers working at <strong>4th-grade math through 7th grade math</strong></li>
          </ul>
          <p style="margin:24px 0 0;font-size:14px;color:#666;">
            Questions? Just reply to this email — it goes straight to campmathos@gmail.com.
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

// ---------------------------------------------------------------------------
// Sponsor inquiries (/sponsors page). Handled here because all Gmail SMTP
// sending lives in this function. Registration behaviour below is unchanged.
// ---------------------------------------------------------------------------
function sponsorNotifyHtml(
  type: string,
  name: string,
  email: string,
  message: string,
  when: string,
) {
  const label = type === "money" ? "Monetary sponsorship" : "Resource donation";
  return `
<!doctype html>
<html><body style="font-family:Arial,sans-serif;color:#111;">
  <h2 style="margin:0 0 12px;">New MathOs sponsor inquiry</h2>
  <p style="margin:0 0 8px;"><strong>Type:</strong> ${escapeHtml(label)}</p>
  <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
  <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
  <p style="margin:0 0 8px;"><strong>Message:</strong><br>${escapeHtml(message || "(none)").replace(/\n/g, "<br>")}</p>
  <p style="margin:0 0 8px;"><strong>Submitted:</strong> ${escapeHtml(when)}</p>
</body></html>`;
}

function sponsorConfirmationHtml(name: string, type: string) {
  const what = type === "money" ? "helping fund MathOs" : "offering resources to MathOs";
  return `
<!doctype html>
<html><body style="margin:0;padding:0;background:#fdf8ee;font-family:Arial,sans-serif;color:#1a1a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8ee;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #1a1a2e;border-radius:16px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#666;">Mathos Camp</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.1;">Thanks, ${escapeHtml(name)}! 🙌</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
            We got your note about ${what}. MathOs is a completely free, student-run applied math camp, and support like yours is what keeps it that way. One of our Camp Directors will be in touch soon.
          </p>
          <p style="margin:24px 0 0;font-size:14px;color:#666;">
            Questions? Just reply to this email — it goes straight to campmathos@gmail.com.
          </p>
          <p style="margin:24px 0 0;font-size:14px;">— The Mathos team</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function handleSponsorInquiry(body: Record<string, unknown>): Promise<Response> {
  const json = (payload: unknown, status: number) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const type = body?.type === "money" || body?.type === "resources" ? (body.type as string) : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";

  if (!type) return json({ error: "Please choose how you'd like to help." }, 400);
  if (!name) return json({ error: "Please enter your name." }, 400);
  if (!email || email.length > 320 || !EMAIL_RE.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }
  if (type === "resources" && !message) {
    return json({ error: "Please tell us what you'd like to offer." }, 400);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: inserted, error: insertError } = await supabase
    .from("sponsor_inquiries")
    .insert({ type, name, email, message: message || null })
    .select("id, created_at")
    .single();

  if (insertError) {
    console.error("Sponsor insert error", insertError);
    return json({ error: "Could not save your message. Please try again." }, 500);
  }

  const when = new Date(inserted!.created_at as string).toLocaleString("en-US", {
    timeZone: "America/Chicago",
  });

  try {
    await sendGmail({
      to: DIRECTOR_NOTIFY,
      subject: `New MathOs sponsor inquiry (${type}): ${name}`,
      html: sponsorNotifyHtml(type, name, email, message, when),
      replyTo: email,
    });
  } catch (notifyErr) {
    console.error("Sponsor notification failed:", notifyErr);
  }

  try {
    await sendGmail({
      to: email,
      subject: "Thanks for supporting MathOs 🙌",
      html: sponsorConfirmationHtml(name, type),
    });
  } catch (mailErr) {
    console.error("Sponsor confirmation failed:", mailErr);
  }

  await closeGmail();
  return json({ ok: true, id: inserted!.id }, 200);
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

    if (body?.kind === "sponsor") {
      return await handleSponsorInquiry(body);
    }

    const rawEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";


    if (!rawEmail || rawEmail.length > 320 || !EMAIL_RE.test(rawEmail)) {
      return new Response(JSON.stringify({ error: "Please enter a valid email address." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the email's domain can actually receive mail (MX, falling back to A/AAAA).
    const domainOk = await domainAcceptsMail(rawEmail.split("@")[1] ?? "");
    if (!domainOk) {
      return new Response(
        JSON.stringify({
          error:
            "We couldn't find a mail server for that email address — please check it for typos and try again.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }


    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
      .insert({ email: rawEmail, camp_year: CAMP_YEAR })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("Insert error", insertError);
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

    const when = new Date(inserted!.created_at as string).toLocaleString("en-US", {
      timeZone: "America/Chicago",
    });

    // The camper confirmation is the one that must succeed — if the mail server
    // rejects the address we roll the signup back so they can correct a typo.
    let confirmationFailed = false;
    try {
      await sendGmail({
        to: rawEmail,
        subject: "Thanks for your interest in Mathos camp 👋",
        html: confirmationHtml(rawEmail),
      });
    } catch (mailErr) {
      confirmationFailed = true;
      console.error("Confirmation email failed:", mailErr);
    }

    if (confirmationFailed) {
      await supabase.from("registrations").delete().eq("id", inserted!.id);
      await closeGmail();
      return new Response(
        JSON.stringify({
          error:
            "We couldn't deliver a confirmation to that address. Please double-check it for typos and try again.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    try {
      await sendGmail({
        to: DIRECTOR_NOTIFY,
        subject: `New Mathos interest: ${rawEmail}`,
        html: notifyHtml(rawEmail, when),
        replyTo: rawEmail,
      });
    } catch (notifyErr) {
      console.error("Director notification failed:", notifyErr);
    }

    await closeGmail();

    return new Response(JSON.stringify({ ok: true, id: inserted!.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unhandled error", err);
    await closeGmail();
    return new Response(JSON.stringify({ error: "Unexpected server error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
