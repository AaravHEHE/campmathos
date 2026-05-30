import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { joinClassByCode } from "@/lib/classroom.functions";

export const Route = createFileRoute("/app/join")({
  component: JoinClass,
  head: () => ({
    meta: [
      { title: "Join a class — Camp Mathos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function JoinClass() {
  const auth = useClassroomAuth("student");
  const navigate = useNavigate();
  const join = useServerFn(joinClassByCode);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth.status !== "authenticated") {
    return <div className="grid min-h-screen place-items-center bg-cream font-mono text-ink/60">Loading…</div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await join({ data: { code: code.trim() } });
      navigate({ to: "/app/class/$classId", params: { classId: res.classId } });
    } catch (e) {
      setErr((e as Error).message ?? "Could not join");
      setLoading(false);
    }
  };

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut} title="Join a class">
      <form
        onSubmit={submit}
        className="max-w-md rounded-2xl border-2 border-ink bg-cream p-6 shadow-[6px_6px_0_0_var(--ink)]"
      >
        <p className="font-mono text-sm text-ink/70">
          Enter the 6-character code your camp director gave you.
        </p>
        <input
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2X9"
          maxLength={12}
          className="mt-4 w-full rounded-full border-2 border-ink bg-cream px-5 py-3 text-center font-mono text-xl tracking-[0.4em] focus:outline-none focus:ring-4 focus:ring-electric/40"
        />
        {err && <p className="mt-3 font-mono text-sm text-coral">{err}</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-full bg-ink px-6 py-3 font-semibold text-cream hover:bg-electric disabled:opacity-60"
          >
            {loading ? "Joining…" : "Join"}
          </button>
          <Link
            to="/app"
            className="rounded-full border-2 border-ink bg-cream px-6 py-3 font-semibold text-ink"
          >
            Cancel
          </Link>
        </div>
      </form>
    </AppShell>
  );
}
