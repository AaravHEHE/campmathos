import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { AppShell } from "@/components/classroom/AppShell";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { MathInput } from "@/components/classroom/MathKeyboard";
import {
  getAssignmentToSolve,
  saveAnswer,
  submitAssignment,
} from "@/lib/classroom.functions";

export const Route = createFileRoute("/app/assignment/$assignmentId")({
  component: SolveAssignment,
  head: () => ({
    meta: [
      { title: "Assignment — Camp Mathos" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

// Render a prompt that may contain inline LaTeX between $...$ or $$...$$
function RichPrompt({ text }: { text: string }) {
  const parts = useMemo(() => {
    const re = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;
    const out: Array<{ type: "text" | "inline" | "block"; value: string }> = [];
    let last = 0;
    for (const m of text.matchAll(re)) {
      const idx = m.index ?? 0;
      if (idx > last) out.push({ type: "text", value: text.slice(last, idx) });
      const raw = m[0];
      if (raw.startsWith("$$"))
        out.push({ type: "block", value: raw.slice(2, -2) });
      else out.push({ type: "inline", value: raw.slice(1, -1) });
      last = idx + raw.length;
    }
    if (last < text.length) out.push({ type: "text", value: text.slice(last) });
    return out;
  }, [text]);
  return (
    <div className="whitespace-pre-wrap text-lg leading-relaxed">
      {parts.map((p, i) => {
        if (p.type === "text") return <span key={i}>{p.value}</span>;
        if (p.type === "inline")
          return (
            <span key={i}>
              <InlineMath math={p.value} />
            </span>
          );
        return <BlockMath key={i} math={p.value} />;
      })}
    </div>
  );
}

function SolveAssignment() {
  const { assignmentId } = Route.useParams();
  const navigate = useNavigate();
  const auth = useClassroomAuth("student");
  const fetchA = useServerFn(getAssignmentToSolve);
  const save = useServerFn(saveAnswer);
  const submit = useServerFn(submitAssignment);

  const [data, setData] = useState<Awaited<ReturnType<typeof getAssignmentToSolve>> | null>(null);
  const [err, setErr] = useState("");
  const [idx, setIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, { text: string; choice: string }>>({});
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    fetchA({ data: { assignmentId } })
      .then((res) => {
        setData(res);
        const seed: Record<string, { text: string; choice: string }> = {};
        for (const a of res.answers) {
          seed[a.problem_id] = {
            text: a.response_text ?? "",
            choice: a.selected_choice ?? "",
          };
        }
        setResponses(seed);
        if (res.submission.status !== "in_progress") {
          navigate({
            to: "/app/assignment/$assignmentId/result",
            params: { assignmentId },
            replace: true,
          });
        }
      })
      .catch((e) => setErr(e.message ?? "Could not load"));
  }, [auth.status, assignmentId, fetchA, navigate]);

  if (auth.status !== "authenticated" || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream font-mono text-ink/60">
        {err ? <span className="text-coral">{err}</span> : "Loading…"}
      </div>
    );
  }

  const problem = data.problems[idx];
  const current = responses[problem?.id ?? ""] ?? { text: "", choice: "" };

  async function persist(next: { text?: string; choice?: string }) {
    if (!problem) return;
    const merged = { ...current, ...next };
    setResponses((r) => ({ ...r, [problem.id]: merged }));
    setSavingState("saving");
    try {
      await save({
        data: {
          submissionId: data!.submission.id,
          problemId: problem.id,
          responseText: merged.text || null,
          selectedChoice: merged.choice || null,
        },
      });
      setSavingState("saved");
    } catch {
      setSavingState("idle");
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submit({ data: { submissionId: data!.submission.id } });
      navigate({
        to: "/app/assignment/$assignmentId/result",
        params: { assignmentId },
        replace: true,
      });
    } catch (e) {
      setErr((e as Error).message);
      setSubmitting(false);
    }
  }

  const answeredCount = data.problems.filter(
    (p) => {
      const r = responses[p.id];
      if (!r) return false;
      return p.type === "mcq" ? !!r.choice : !!r.text.trim();
    },
  ).length;
  const total = data.problems.length;

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
      <Link to="/app" className="font-mono text-xs text-ink/60 hover:underline">
        ← Dashboard
      </Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
            {data.assignment.className}
          </p>
          <h1 className="font-display text-3xl font-black">{data.assignment.title}</h1>
        </div>
        <div className="font-mono text-sm text-ink/70">
          Problem {idx + 1} of {total} • {answeredCount} answered
        </div>
      </div>

      {data.assignment.instructions && idx === 0 && (
        <div className="mt-4 rounded-xl border-2 border-ink/30 bg-cream p-4 font-mono text-sm text-ink/80">
          {data.assignment.instructions}
        </div>
      )}

      {problem && (
        <div className="mt-6 rounded-2xl border-2 border-ink bg-cream p-6 shadow-[6px_6px_0_0_var(--ink)]">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
            {problem.type === "short"
              ? "Short answer"
              : problem.type === "mcq"
                ? "Multiple choice"
                : "Show your work"}{" "}
            • {problem.points} pt{problem.points === 1 ? "" : "s"}
          </p>
          <div className="mt-3">
            <RichPrompt text={problem.prompt} />
          </div>

          <div className="mt-6">
            {problem.type === "mcq" && Array.isArray(problem.choices) && (
              <div className="space-y-2">
                {problem.choices.map((c) => (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 ${
                      current.choice === c.id
                        ? "border-ink bg-sun"
                        : "border-ink/30 bg-cream hover:bg-cream/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`p-${problem.id}`}
                      checked={current.choice === c.id}
                      onChange={() => persist({ choice: c.id })}
                      className="mt-1"
                    />
                    <span className="text-base">{c.label}</span>
                  </label>
                ))}
              </div>
            )}

            {problem.type === "short" && (
              <MathInput
                value={current.text}
                onChange={(v) => persist({ text: v })}
                placeholder="Type your answer…"
              />
            )}

            {problem.type === "free" && (
              <MathInput
                value={current.text}
                onChange={(v) => persist({ text: v })}
                placeholder="Show your work and explain your reasoning…"
                multiline
              />
            )}
          </div>

          <div className="mt-4 font-mono text-xs text-ink/50">
            {savingState === "saving" && "Saving…"}
            {savingState === "saved" && "Saved"}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="rounded-full border-2 border-ink bg-cream px-5 py-2 font-semibold disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
            disabled={idx >= total - 1}
            className="rounded-full border-2 border-ink bg-cream px-5 py-2 font-semibold disabled:opacity-40"
          >
            Next →
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-full bg-coral px-6 py-3 font-semibold text-cream border-2 border-ink shadow-[4px_4px_0_0_var(--ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_var(--ink)] disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit assignment"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {data.problems.map((p, i) => {
          const r = responses[p.id];
          const answered = r && (p.type === "mcq" ? !!r.choice : !!r.text.trim());
          return (
            <button
              key={p.id}
              onClick={() => setIdx(i)}
              className={`h-9 w-9 rounded-md border-2 border-ink font-mono text-sm ${
                i === idx
                  ? "bg-electric text-cream"
                  : answered
                    ? "bg-sun"
                    : "bg-cream"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {err && <p className="mt-4 font-mono text-sm text-coral">{err}</p>}
    </AppShell>
  );
}
