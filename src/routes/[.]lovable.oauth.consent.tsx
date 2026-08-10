import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthDetails = {
  client?: { name?: string } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/admin/login",
        search: {
          next: `/.lovable/oauth/consent?authorization_id=${encodeURIComponent(
            search.authorization_id,
          )}`,
        },
      });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 text-ink">
      <p className="font-mono text-sm text-coral">
        Could not load this authorization request:{" "}
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
  head: () => ({
    meta: [
      { title: "Authorize app access — MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: decisionError } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (decisionError) {
      setBusy(false);
      setError(decisionError.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 text-ink">
      <div className="w-full max-w-md card-3d bg-cream p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Authorize access
        </p>
        <h1 className="mt-2 font-display text-3xl font-black">
          Connect {clientName} to MathOs
        </h1>
        <p className="mt-3 font-mono text-sm text-ink/70">
          {clientName} will be able to use Camp MathOs tools as you, including reading
          the camp sign-up list your account can access.
        </p>
        {error && <p className="mt-3 font-mono text-sm text-coral">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-full bg-ink px-5 py-3 font-semibold text-cream transition hover:bg-electric disabled:opacity-60"
          >
            {busy ? "…" : "Approve"}
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 rounded-full border-2 border-ink bg-cream px-5 py-3 font-semibold transition hover:bg-ink hover:text-cream disabled:opacity-60"
          >
            Deny
          </button>
        </div>
      </div>
    </main>
  );
}
