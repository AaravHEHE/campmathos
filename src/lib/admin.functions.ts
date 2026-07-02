import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";

// Client middleware: attach the current Supabase session token to the
// outgoing server-fn request so requireSupabaseAuth can read it.
const attachAuthHeader = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data: { session } } = await supabase.auth.getSession();
    return next({
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {},
    });
  },
);

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Authorization check failed");
  if (!data) throw new Error("Forbidden");
}

export const adminListRegistrations = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("registrations")
      .select(
        "id, email, created_at, student_first_name, student_last_name, parent_first_name, parent_last_name, phone, grade_level",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const adminDeleteRegistration = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const SPREADSHEET_ID = "1nAS5YQGtZTY9QXIKgClLVvZySRnCUrZeAiT-cDvHbmQ";
const SHEET_RANGE = "Form Responses 1!G2:G";

export const adminListFormEmails = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const lovableKey = process.env.LOVABLE_API_KEY;
    const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
    if (!lovableKey || !sheetsKey) {
      return { emails: [] as string[], error: "Google Sheets not connected" };
    }
    const url = `https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURI(SHEET_RANGE)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": sheetsKey,
      },
    });
    if (!res.ok) {
      return { emails: [] as string[], error: `Sheets read failed (${res.status})` };
    }
    const json = (await res.json()) as { values?: string[][] };
    const emails = Array.from(
      new Set(
        (json.values ?? [])
          .map((r) => (r?.[0] ?? "").trim().toLowerCase())
          .filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)),
      ),
    );
    return { emails, error: null as string | null };
  });
