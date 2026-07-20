import { createFileRoute } from "@tanstack/react-router";

// Public cron/webhook endpoint. Requires ?key= matching SUPABASE_ANON_KEY
// (this same key is used by the pg_cron job in the apikey header).
export const Route = createFileRoute("/api/public/hooks/sync-classroom")({
  server: {
    handlers: {
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});

async function handle(request: Request) {
  try {
    const anon = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
    const url = new URL(request.url);
    const providedKey =
      request.headers.get("apikey") ??
      request.headers.get("x-api-key") ??
      url.searchParams.get("key");
    if (!anon || providedKey !== anon) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { runSync } = await import("@/lib/gclassroom.server");
    const summary = await runSync();
    return new Response(JSON.stringify({ success: true, ...summary }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("sync-classroom failed:", message);
    return new Response(
      JSON.stringify({ success: false, error: "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
