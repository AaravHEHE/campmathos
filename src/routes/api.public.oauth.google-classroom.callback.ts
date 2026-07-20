import { createFileRoute, redirect } from "@tanstack/react-router";

// Server-side OAuth handshake. Two entry points via query string:
//   ?start=1     -> redirect the user to Google's consent screen
//   ?code=...    -> Google's callback; exchange for tokens and store
// Renders a minimal status page for direct visits.

async function serverHandle(request: Request) {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/public/oauth/google-classroom/callback`;

  if (url.searchParams.get("start") === "1") {
    const {
      buildAuthorizeUrl,
      requireOAuthClient,
    } = await import("@/lib/gclassroom.server");
    try {
      requireOAuthClient();
    } catch (e) {
      return htmlPage(
        "Not configured",
        `<p>${escape((e as Error).message)}</p>` +
          `<p>Ask your developer to set <code>GOOGLE_OAUTH_CLIENT_ID</code> and <code>GOOGLE_OAUTH_CLIENT_SECRET</code>.</p>`,
      );
    }
    const state = crypto.randomUUID();
    const authorize = buildAuthorizeUrl(redirectUri, state);
    return Response.redirect(authorize, 302);
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    return htmlPage(
      "Google rejected the request",
      `<p>${escape(error)}</p>` +
        `<p><a href="/admin">Back to admin</a></p>`,
    );
  }
  if (code) {
    try {
      const { exchangeCodeForTokens, saveStoredToken } =
        await import("@/lib/gclassroom.server");
      const tok = await exchangeCodeForTokens(code, redirectUri);
      if (!tok.refresh_token) {
        return htmlPage(
          "Missing refresh token",
          `<p>Google didn't return a refresh token. Revoke access at ` +
            `<a href="https://myaccount.google.com/permissions" target="_blank">myaccount.google.com/permissions</a> ` +
            `and try again.</p>`,
        );
      }
      await saveStoredToken({
        refresh_token: tok.refresh_token,
        google_email: tok.google_email,
        scope: tok.scope,
      });
      throw redirect({ to: "/admin/classroom", search: { connected: 1 } as never });
    } catch (e) {
      if (isRedirect(e)) throw e;
      return htmlPage("Sign-in failed", `<p>${escape((e as Error).message)}</p>`);
    }
  }

  return htmlPage(
    "Google Classroom",
    `<p>Use the connect button in the admin dashboard.</p>` +
      `<p><a href="/admin/classroom">Go to /admin/classroom</a></p>`,
  );
}

function isRedirect(e: unknown): boolean {
  return typeof e === "object" && e !== null && "isRedirect" in (e as object);
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}

function htmlPage(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${escape(title)}</title>` +
      `<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:4rem auto;padding:0 1rem;line-height:1.5}</style>` +
      `</head><body><h1>${escape(title)}</h1>${body}</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/public/oauth/google-classroom/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => serverHandle(request),
    },
  },
});
