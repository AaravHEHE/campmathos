import { createFileRoute } from '@tanstack/react-router';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const SPREADSHEET_ID = '1nAS5YQGtZTY9QXIKgClLVvZySRnCUrZeAiT-cDvHbmQ';
// Columns: A Timestamp, B EmailAddr(often empty), C studentFirst, D studentLast,
// E parentFirst, F parentLast, G parentEmail, H phone, I gradeLevel
const SHEET_RANGE = "Form Responses 1!A2:I";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface FormRow {
  email: string;
  student_first_name: string | null;
  student_last_name: string | null;
  parent_first_name: string | null;
  parent_last_name: string | null;
  phone: string | null;
  grade_level: string | null;
}

function clean(v: string | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

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

  // Build one row per form response (per student). Same email may repeat.
  const parsed: FormRow[] = [];
  for (const r of json.values ?? []) {
    const email = (r?.[6] ?? '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) continue;
    parsed.push({
      email,
      student_first_name: clean(r?.[2]),
      student_last_name: clean(r?.[3]),
      parent_first_name: clean(r?.[4]),
      parent_last_name: clean(r?.[5]),
      phone: clean(r?.[7]),
      grade_level: clean(r?.[8]),
    });
  }

  // Load existing rows to dedup on (email, student_first, student_last).
  const { data: existing, error: selErr } = await supabaseAdmin
    .from('registrations')
    .select('email, student_first_name, student_last_name');
  if (selErr) throw new Error(`registrations read failed: ${selErr.message}`);

  const key = (
    e: string,
    f: string | null | undefined,
    l: string | null | undefined,
  ) =>
    `${e.trim().toLowerCase()}|${(f ?? '').trim().toLowerCase()}|${(l ?? '').trim().toLowerCase()}`;

  const existingKeys = new Set(
    (existing ?? []).map((r) =>
      key(r.email ?? '', r.student_first_name, r.student_last_name),
    ),
  );
  // Also allow matching an old email-only row (no student name) so we don't
  // double-count parents who registered before student info was captured.
  const existingEmailOnly = new Set(
    (existing ?? [])
      .filter((r) => !r.student_first_name && !r.student_last_name)
      .map((r) => (r.email ?? '').trim().toLowerCase()),
  );

  const toInsert: FormRow[] = [];
  const toUpgrade: FormRow[] = [];
  const emailsSeenInBatch = new Set<string>();
  for (const row of parsed) {
    const k = key(row.email, row.student_first_name, row.student_last_name);
    if (existingKeys.has(k)) continue;
    // If this is the first form entry we're seeing for an email that already
    // exists as an old email-only row, upgrade it in place instead of inserting.
    if (
      existingEmailOnly.has(row.email) &&
      !emailsSeenInBatch.has(row.email)
    ) {
      emailsSeenInBatch.add(row.email);
      toUpgrade.push(row);
      existingKeys.add(k);
      existingEmailOnly.delete(row.email);
      continue;
    }
    existingKeys.add(k);
    toInsert.push(row);
  }

  let upgraded = 0;
  for (const row of toUpgrade) {
    const { data: upData, error: upErr } = await supabaseAdmin
      .from('registrations')
      .update({
        student_first_name: row.student_first_name,
        student_last_name: row.student_last_name,
        parent_first_name: row.parent_first_name,
        parent_last_name: row.parent_last_name,
        phone: row.phone,
        grade_level: row.grade_level,
      })
      .eq('email', row.email)
      .eq('camp_year', 2026)
      .is('student_first_name', null)
      .is('student_last_name', null)
      .select('id');

    if (upErr) throw new Error(`upgrade failed for ${row.email}: ${upErr.message}`);
    upgraded += upData?.length ?? 0;
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const { error: insErr } = await supabaseAdmin
      .from('registrations')
      .insert(toInsert.map((r) => ({ ...r, camp_year: 2026 })));
    if (insErr) throw new Error(`registrations insert failed: ${insErr.message}`);

    inserted = toInsert.length;
  }

  return {
    form_total: parsed.length,
    upgraded,
    inserted,
    already_registered: parsed.length - inserted - upgraded,
  };
}

async function handle() {
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
}

export const Route = createFileRoute('/api/public/hooks/sync-form-emails')({
  server: {
    handlers: {
      POST: async () => handle(),
      GET: async () => handle(),
    },
  },
});
