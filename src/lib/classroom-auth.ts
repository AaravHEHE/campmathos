import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Client middleware that attaches the current Supabase access token to
// outgoing server-fn requests. Matches the pattern used by admin.functions.ts.
export const attachAuthHeader = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data: { session } } = await supabase.auth.getSession();
    return next({
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {},
    });
  },
);

export async function getUserRole(userId: string): Promise<"admin" | "teacher" | "student" | null> {
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
  if (role !== "teacher" && role !== "admin") {
    throw new Error("Forbidden");
  }
  return role;
}

export async function assertAdmin(userId: string) {
  const role = await getUserRole(userId);
  if (role !== "admin") throw new Error("Forbidden");
}

export function generateJoinCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
