import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "registration_stats",
  title: "Sign-up statistics",
  description:
    "Summarize Camp MathOs sign-ups: totals per camp year, per grade level, and how many arrived in the last 7 days.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("registrations")
      .select("camp_year, grade_level, created_at");

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const rows = data ?? [];
    const byYear: Record<string, number> = {};
    const byGrade: Record<string, number> = {};
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let lastSevenDays = 0;

    for (const row of rows) {
      const year = String(row.camp_year ?? "unknown");
      byYear[year] = (byYear[year] ?? 0) + 1;
      const grade = row.grade_level ?? "unspecified";
      byGrade[grade] = (byGrade[grade] ?? 0) + 1;
      if (row.created_at && new Date(row.created_at).getTime() >= weekAgo) lastSevenDays += 1;
    }

    const summary = { total: rows.length, byCampYear: byYear, byGradeLevel: byGrade, lastSevenDays };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});
