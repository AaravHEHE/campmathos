import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy route: /curriculum was merged into /details.
 * Kept as a permanent redirect so old Google results and inbound links don't 404.
 */
export const Route = createFileRoute("/curriculum")({
  beforeLoad: () => {
    throw redirect({ to: "/details", replace: true, statusCode: 301 });
  },
});
