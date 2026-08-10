import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "find_registration",
  title: "Find a sign-up",
  description:
    "Search Camp MathOs sign-ups by partial email, student name, or parent name.",
  inputSchema: {
    search: z
      .string()
      .describe("Text to search for across email, student name, and parent name."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ search }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const term = search.trim();
    if (!term) {
      return { content: [{ type: "text", text: "Search text is required" }], isError: true };
    }
    // Escape PostgREST `or()` separators so the filter can't be broken out of.
    const safe = term.replace(/[,()*]/g, " ").trim();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("registrations")
      .select(
        "id, email, student_first_name, student_last_name, parent_first_name, parent_last_name, phone, grade_level, camp_year, created_at",
      )
      .or(
        [
          `email.ilike.%${safe}%`,
          `student_first_name.ilike.%${safe}%`,
          `student_last_name.ilike.%${safe}%`,
          `parent_first_name.ilike.%${safe}%`,
          `parent_last_name.ilike.%${safe}%`,
        ].join(","),
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { count: data?.length ?? 0, matches: data ?? [] },
    };
  },
});
