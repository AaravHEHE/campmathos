import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_PASSWORD = "CampMathos123!@#";

function verify(password: string) {
  if (password !== ADMIN_PASSWORD) {
    throw new Error("Unauthorized");
  }
}

export const adminListRegistrations = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string }) => input)
  .handler(async ({ data }) => {
    verify(data.password);
    const { data: rows, error } = await supabaseAdmin
      .from("registrations")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const adminDeleteRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: { password: string; id: string }) => input)
  .handler(async ({ data }) => {
    verify(data.password);
    const { error } = await supabaseAdmin
      .from("registrations")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
