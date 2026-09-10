import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// Client middleware: attach the current Supabase session token so
// requireSupabaseAuth can read it (same pattern as admin.functions.ts).
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

export type Enrollment = Tables<"camp_enrollments">;

export type CapacityStatus = {
  caps: { in_person: number | null; online: number | null };
  confirmed: { in_person: number; online: number };
  remaining: { in_person: number | null; online: number | null };
};

async function readCapacity(campYear: number): Promise<CapacityStatus> {
  const { data: settingsRow } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", `capacity_${campYear}`)
    .maybeSingle();
  const raw = (settingsRow?.value ?? {}) as Record<string, unknown>;
  const cap = (v: unknown) =>
    typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
  const caps = { in_person: cap(raw.in_person), online: cap(raw.online) };

  const countConfirmed = async (format: "in_person" | "online") => {
    const { count } = await supabaseAdmin
      .from("camp_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("camp_year", campYear)
      .eq("format_preference", format)
      .eq("status", "confirmed");
    return count ?? 0;
  };
  const confirmed = {
    in_person: await countConfirmed("in_person"),
    online: await countConfirmed("online"),
  };
  return {
    caps,
    confirmed,
    remaining: {
      in_person: caps.in_person === null ? null : Math.max(0, caps.in_person - confirmed.in_person),
      online: caps.online === null ? null : Math.max(0, caps.online - confirmed.online),
    },
  };
}

// Public: capacity snapshot for the /register page. Counts only — no PII.
export const getCapacityStatus = createServerFn({ method: "GET" })
  .inputValidator((data: { campYear: number }) => data)
  .handler(async ({ data }) => {
    return readCapacity(data.campYear);
  });

export const adminListEnrollments = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("camp_enrollments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

const STATUSES = new Set(["pending", "confirmed", "waitlisted", "withdrawn"]);

export const adminSetEnrollmentStatus = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => {
    if (!input?.id || !STATUSES.has(input?.status)) throw new Error("Invalid input");
    return { id: input.id, status: input.status as "pending" | "confirmed" | "waitlisted" | "withdrawn" };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("camp_enrollments")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteEnrollment = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("Invalid input");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("camp_enrollments")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetCapacity = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input: { campYear: number }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    return readCapacity(data.campYear);
  });

export const adminSaveCapacity = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((input: { campYear: number; inPerson: number | null; online: number | null }) => {
    const clean = (v: number | null) =>
      typeof v === "number" && Number.isInteger(v) && v > 0 ? v : null;
    if (!Number.isInteger(input?.campYear)) throw new Error("Invalid camp year");
    return { campYear: input.campYear, in_person: clean(input.inPerson), online: clean(input.online) };
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({
        key: `capacity_${data.campYear}`,
        value: { in_person: data.in_person, online: data.online },
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
