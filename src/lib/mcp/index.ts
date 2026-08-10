import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listRegistrationsTool from "./tools/list-registrations";
import findRegistrationTool from "./tools/find-registration";
import registrationStatsTool from "./tools/registration-stats";
import addRegistrationTool from "./tools/add-registration";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "camp-mathos",
  title: "Camp MathOs",
  version: "0.1.0",
  instructions:
    "Tools for Camp MathOs, a free hybrid summer applied math camp. Use `list_registrations` and `find_registration` to look up camp sign-ups, `registration_stats` for totals by camp year and grade, and `add_registration` to add someone to the interest list. Sign-up data is visible only to Camp Director (admin) accounts.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listRegistrationsTool,
    findRegistrationTool,
    registrationStatsTool,
    addRegistrationTool,
  ],
});
