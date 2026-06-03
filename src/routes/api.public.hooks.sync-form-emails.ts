import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const SPREADSHEET_ID = '15Oq536NyApV9gC0YqFBV0hj6xFJ3gjoDLqkTwiq3vz0';
const SHEET_RANGE = "Form Responses 1!F2:F";

async function syncEmails() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!lovableKey) throw new Error('LOVABLE_API_KEY missing');
  if (!sheetsKey) throw new Error('GOOGLE_SHEETS_API_KEY missing');

  const url = `https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURI(SHEET_RANGE)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': sheetsKey,
    },
  });
  if (!res.ok) {
    throw new Error(`Sheets fetch failed ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { values?: string[][] };
  const rawEmails = (json.values ?? [])
    .map((r) => (r?.[0] ?? '').trim().toLowerCase())
    .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
  const formEmails = Array.from(new Set(rawEmails));

  const { data: existing, error: selErr } = await supabaseAdmin
    .from('registrations')
    .select('email');
  if (selErr) throw new Error(`registrations read failed: ${selErr.message}`);
  const existingSet = new Set(
    (existing ?? []).map((r) => r.email.trim().toLowerCase()),
  );

  const missing = formEmails.filter((e) => !existingSet.has(e));

  let inserted = 0;
  if (missing.length > 0) {
    const { error: insErr } = await supabaseAdmin
      .from('registrations')
      .insert(missing.map((email) => ({ email })));
    if (insErr) throw new Error(`registrations insert failed: ${insErr.message}`);
    inserted = missing.length;
  }

  return {
    form_total: formEmails.length,
    already_registered: formEmails.length - missing.length,
    inserted,
  };
}

function isAuthorized(request: Request): boolean {
  const expected = process.env.SYNC_WEBHOOK_SECRET;
  if (!expected) return false;
  const provided =
    request.headers.get('x-webhook-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    '';
  return provided === expected;
}

export const Route = createFileRoute('/api/public/hooks/sync-form-emails')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAuthorized(request)) {
          return new Response('Unauthorized', { status: 401 });
        }
        try {
          const result = await syncEmails();
          return new Response(JSON.stringify({ success: true, ...result }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          console.error('sync-form-emails failed:', message);
          return new Response(
            JSON.stringify({ success: false, error: 'Internal error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          );
        }
      },
      GET: async ({ request }) => {
        if (!isAuthorized(request)) {
          return new Response('Unauthorized', { status: 401 });
        }
        try {
          const result = await syncEmails();
          return new Response(JSON.stringify({ success: true, ...result }), {
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          console.error('sync-form-emails failed:', message);
          return new Response(
            JSON.stringify({ success: false, error: 'Internal error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          );
        }
      },
    },
  },
});
