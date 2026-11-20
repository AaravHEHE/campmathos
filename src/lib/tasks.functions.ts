import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";

const attachAuthHeader = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const { data: { session } } = await supabase.auth.getSession();
  return next({
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  });
});

async function assertAdmin(sb: any, userId: string) {
  const { data, error } = await sb.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden");
}

async function assertOwner(sb: any, userId: string) {
  const { data, error } = await sb.rpc("is_tasks_owner", { _user_id: userId });
  if (error || !data) throw new Error("Only the main camp account can add or delete tasks");
}

export type AdminTask = {
  id: string; title: string; notes: string | null; due_date: string | null;
  assigned_to: string; created_by: string; done: boolean; created_at: string;
};
export type AdminPerson = { id: string; email: string };

export const listAdminTasks = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "admin");
    const ids = new Set((roles ?? []).map((r) => r.user_id));
    const { data: users } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    const admins: AdminPerson[] = (users?.users ?? [])
      .filter((u) => ids.has(u.id))
      .map((u) => ({ id: u.id, email: u.email ?? "" }))
      .sort((a, b) => a.email.localeCompare(b.email));
    const { data: tasks, error } = await context.supabase
      .from("admin_tasks").select("*").order("done").order("due_date", { nullsFirst: false }).order("created_at");
    if (error) throw new Error(error.message);
    const { data: isOwner } = await context.supabase.rpc("is_tasks_owner", { _user_id: context.userId });
    return { me: context.userId, isOwner: !!isOwner, admins, tasks: (tasks ?? []) as AdminTask[] };
  });

export const createAdminTask = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((i: { title: string; notes?: string; dueDate?: string; assignedTo: string }) => {
    const title = (i?.title ?? "").trim();
    if (!title || title.length > 300) throw new Error("Task needs a title (max 300 characters)");
    if (!i.assignedTo) throw new Error("Pick who the task is for");
    if (i.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(i.dueDate)) throw new Error("Invalid date");
    return { title, notes: (i.notes ?? "").trim().slice(0, 2000) || null, due_date: i.dueDate || null, assigned_to: i.assignedTo };
  })
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    const { error } = await context.supabase.from("admin_tasks").insert({ ...data, created_by: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setAdminTaskDone = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((i: { id: string; done: boolean }) => i)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("admin_tasks")
      .update({ done: data.done, done_at: data.done ? new Date().toISOString() : null }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAdminTask = createServerFn({ method: "POST" })
  .middleware([attachAuthHeader, requireSupabaseAuth])
  .inputValidator((i: { id: string }) => i)
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId);
    const { error } = await context.supabase.from("admin_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
