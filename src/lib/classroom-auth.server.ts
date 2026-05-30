import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function getUserRole(
  userId: string,
): Promise<"admin" | "teacher" | "student" | null> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error || !data) return null;
  if (data.some((r) => r.role === "admin")) return "admin";
  if (data.some((r) => r.role === "teacher")) return "teacher";
  if (data.some((r) => r.role === "student")) return "student";
  return null;
}

export async function assertTeacherOrAdmin(userId: string) {
  const role = await getUserRole(userId);
  if (role !== "teacher" && role !== "admin") throw new Error("Forbidden");
  return role;
}

export async function assertAdmin(userId: string) {
  const role = await getUserRole(userId);
  if (role !== "admin") throw new Error("Forbidden");
}
