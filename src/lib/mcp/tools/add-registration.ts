import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "add_registration",
  title: "Add a sign-up",
  description:
    "Add someone to the Camp MathOs sign-up / interest list. Does not send a confirmation email.",
  inputSchema: {
    email: z.string().describe("Contact email address for the sign-up."),
    campYear: z.number().int().optional().describe("Camp year. Defaults to 2027."),
    studentFirstName: z.string().optional().describe("Camper's first name."),
    studentLastName: z.string().optional().describe("Camper's last name."),
    parentFirstName: z.string().optional().describe("Parent or guardian first name."),
    parentLastName: z.string().optional().describe("Parent or guardian last name."),
    phone: z.string().optional().describe("Contact phone number."),
    gradeLevel: z.string().optional().describe("Camper's grade level, e.g. '5th'."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const email = input.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return {
        content: [{ type: "text", text: "That does not look like a valid email address." }],
        isError: true,
      };
    }

    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("registrations")
      .insert({
        email,
        camp_year: input.campYear ?? 2027,
        student_first_name: input.studentFirstName ?? null,
        student_last_name: input.studentLastName ?? null,
        parent_first_name: input.parentFirstName ?? null,
        parent_last_name: input.parentLastName ?? null,
        phone: input.phone ?? null,
        grade_level: input.gradeLevel ?? null,
      })
      .select()
      .single();

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Added ${email} to the ${data.camp_year} list.` }],
      structuredContent: { registration: data },
    };
  },
});
