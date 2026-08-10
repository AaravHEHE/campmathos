import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_registrations",
  title: "List camp sign-ups",
  description:
    "List Camp MathOs sign-ups (campers and interest-list entries), newest first. Optionally filter by camp year or grade level.",
  inputSchema: {
    campYear: z
      .number()
      .int()
      .optional()
      .describe("Camp year to filter by, e.g. 2026 or 2027. Omit for all years."),
    gradeLevel: z
      .string()
      .optional()
      .describe("Exact grade level value to filter by, e.g. '5th'."),
    limit: z
      .number()
      .int()
      .optional()
      .describe("How many rows to return. Defaults to 50, maximum 200."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ campYear, gradeLevel, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(Math.max(limit ?? 50, 1), 200);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("registrations")
      .select(
        "id, email, student_first_name, student_last_name, parent_first_name, parent_last_name, phone, grade_level, camp_year, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(take);
    if (typeof campYear === "number") query = query.eq("camp_year", campYear);
    if (gradeLevel) query = query.eq("grade_level", gradeLevel);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { count: data?.length ?? 0, registrations: data ?? [] },
    };
  },
});
