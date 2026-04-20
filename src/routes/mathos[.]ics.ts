import { createFileRoute } from "@tanstack/react-router";
import { buildCampIcs } from "@/lib/ics";

export const Route = createFileRoute("/mathos.ics")({
  server: {
    handlers: {
      GET: async () => {
        const ics = buildCampIcs();
        return new Response(ics, {
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": 'attachment; filename="mathos-2026.ics"',
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
