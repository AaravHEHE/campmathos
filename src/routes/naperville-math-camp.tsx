import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy landing page removed when the camp moved to a hybrid format.
 * Permanent redirect so old Google results and inbound links don't 404.
 */
export const Route = createFileRoute("/naperville-math-camp")({
  beforeLoad: () => {
    throw redirect({ to: "/details", replace: true, statusCode: 301 });
  },
});
