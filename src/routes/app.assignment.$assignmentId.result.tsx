import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { AppShell, StatusPill } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { getSubmissionResult } from "@/lib/classroom.functions";

export const Route = createFileRoute("/app/assignment/$assignmentId/result")({
  component: ResultPage,
  head: () => ({
    meta: [
      { title: "Result — Camp Mathos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function RichPrompt({ text }: { text: string }) {
  const parts = useMemo(() => {
    const re = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;
    const out: Array<{ type: "text" | "inline" | "block"; value: string }> = [];
    let last = 0;
    for (const m of text.matchAll(re)) {
      const idx = m.index ?? 0;
      if (idx > last) out.push({ type: "text", value: text.slice(last, idx) });
      const raw = m[0];
      if (raw.startsWith("$$")) out.push({ type: "block", value: raw.slice(2, -2) });
      else out.push({ type: "inline", value: raw.slice(1, -1) });
      last = idx + raw.length;
    }
    if (last < text.length) out.push({ type: "text", value: text.slice(last) });
    return out;
  }, [text]);
  return (
    <div className="whitespace-pre-wrap">
      {parts.map((p, i) =>
        p.type === "text" ? (
          <span key={i}>{p.value}</span>
        ) : p.type === "inline" ? (
          <span key={i}>
            <InlineMath math={p.value} />
          </span>
        ) : (
          <BlockMath key={i} math={p.value} />
        ),
      )}
    </div>
  );
}

function ResultPage() {
  const { assignmentId } = Route.useParams();
  const auth = useClassroomAuth("student");
  const fetchResult = useServerFn(getSubmissionResult);
  const [data, setData] = useState<Awaited<ReturnType<typeof getSubmissionResult>> | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    fetchResult({ data: { assignmentId } })
      .then(setData)
      .catch((e) => setErr(e.message ?? "Could not load"));
  }, [auth.status, assignmentId, fetchResult]);

  if (auth.status !== "authenticated" || (!data && !err)) {
    return <div className="grid min-h-screen place-items-center bg-cream font-mono text-ink/60">Loading…</div>;
  }

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
      <Link to="/app" className="font-mono text-xs text-ink/60 hover:underline">
        ← Dashboard
      </Link>
      {err && <p className="mt-4 font-mono text-coral">{err}</p>}
      {data && (
        <>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
                {((data.submission.assignments as { classes?: { name?: string } | null } | null)?.classes?.name) ?? ""}
              </p>
              <h1 className="font-display text-3xl font-black">
                {(data.submission.assignments as { title?: string } | null)?.title}
              </h1>
            </div>
            <div className="text-right">
              <StatusPill status={data.submission.status as "submitted" | "graded"} />
              <p className="mt-1 font-mono text-2xl">
                {data.submission.final_score ?? data.submission.auto_score ?? 0}
                <span className="text-base text-ink/60"> / {data.submission.max_score}</span>
              </p>
            </div>
          </div>

          {data.submission.teacher_feedback && (
            <div className="mt-6 rounded-2xl border-2 border-ink bg-sun p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-ink/70">
                Teacher feedback
              </p>
              <p className="mt-2 whitespace-pre-wrap">{data.submission.teacher_feedback}</p>
            </div>
          )}

          <div className="mt-8 space-y-4">
            {data.problems.map((p, i) => {
              const a = data.answers.find((x) => x.problem_id === p.id);
              const choices = Array.isArray(p.choices)
                ? (p.choices as Array<{ id: string; label: string; correct?: boolean }>)
                : [];
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_0_var(--ink)]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
                      Problem {i + 1} • {p.points} pt{p.points === 1 ? "" : "s"}
                    </p>
                    <p className="font-mono text-sm">
                      {a?.points_awarded ?? 0} / {p.points}
                    </p>
                  </div>
                  <RichPrompt text={p.prompt} />
                  <div className="mt-3 rounded-xl border-2 border-ink/30 p-3 font-mono text-sm">
                    <span className="text-ink/60">Your answer: </span>
                    {p.type === "mcq"
                      ? choices.find((c) => c.id === a?.selected_choice)?.label ?? "(none)"
                      : a?.response_text || "(none)"}
                  </div>
                  {p.type !== "free" && p.correct_answer && (
                    <div className="mt-2 rounded-xl border-2 border-ink/30 bg-sun/30 p-3 font-mono text-sm">
                      <span className="text-ink/60">Correct: </span>
                      {p.type === "mcq"
                        ? choices.find((c) => c.correct)?.label
                        : p.correct_answer}
                    </div>
                  )}
                  {a?.teacher_comment && (
                    <div className="mt-2 rounded-xl border-2 border-electric bg-electric/10 p-3 text-sm">
                      <span className="font-mono text-xs uppercase text-electric">
                        Teacher note
                      </span>
                      <p className="mt-1 whitespace-pre-wrap">{a.teacher_comment}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
}
