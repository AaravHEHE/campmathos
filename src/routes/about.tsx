import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy route: /about was merged into /details.
 * Kept as a permanent redirect so old Google results and inbound links don't 404.
 */
export const Route = createFileRoute("/about")({
  beforeLoad: () => {
    throw redirect({ to: "/details", replace: true, statusCode: 301 });
  },
});
