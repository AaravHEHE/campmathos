import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/classroom/AppShell";
import { MathInput } from "@/components/classroom/MathKeyboard";
import { useClassroomAuth, signOut } from "@/hooks/useClassroomAuth";
import { getAssignmentForEdit, saveAssignment } from "@/lib/teacher.functions";

export const Route = createFileRoute("/teacher/assignment/$assignmentId")({
  component: AssignmentEditor,
  head: () => ({
    meta: [
      { title: "Edit assignment — MathOs" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type ProblemType = "short" | "mcq" | "free";
interface Choice {
  id: string;
  label: string;
  correct?: boolean;
}
interface Problem {
  id?: string;
  position: number;
  prompt: string;
  type: ProblemType;
  points: number;
  correct_answer?: string | null;
  choices?: Choice[] | null;
}

function newProblem(position: number): Problem {
  return {
    position,
    prompt: "",
    type: "short",
    points: 1,
    correct_answer: "",
    choices: null,
  };
}

function AssignmentEditor() {
  const auth = useClassroomAuth("teacher");
  const { assignmentId } = Route.useParams();
  const [classId, setClassId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [published, setPublished] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    (async () => {
      try {
        const res = await getAssignmentForEdit({ data: { assignmentId } });
        const a = res.assignment as {
          id: string;
          title: string;
          instructions: string | null;
          due_at: string | null;
          published: boolean;
          class_id: string;
        };
        setClassId(a.class_id);
        setTitle(a.title);
        setInstructions(a.instructions ?? "");
        setDueAt(a.due_at ? a.due_at.slice(0, 16) : "");
        setPublished(a.published);
        setProblems(
          (res.problems as Problem[]).map((p) => ({
            ...p,
            correct_answer: p.correct_answer ?? "",
            choices: p.choices ?? null,
          })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      }
      setLoading(false);
    })();
  }, [auth.status, assignmentId]);

  const updateProblem = (idx: number, patch: Partial<Problem>) => {
    setProblems((arr) => arr.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };
  const setType = (idx: number, type: ProblemType) => {
    updateProblem(idx, {
      type,
      correct_answer: type === "short" ? "" : null,
      choices:
        type === "mcq"
          ? [
              { id: "a", label: "", correct: true },
              { id: "b", label: "" },
            ]
          : null,
    });
  };
  const addProblem = () => setProblems((arr) => [...arr, newProblem(arr.length)]);
  const removeProblem = (idx: number) =>
    setProblems((arr) => arr.filter((_, i) => i !== idx).map((p, i) => ({ ...p, position: i })));
  const move = (idx: number, dir: -1 | 1) => {
    setProblems((arr) => {
      const next = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return arr;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next.map((p, i) => ({ ...p, position: i }));
    });
  };

  const addChoice = (idx: number) => {
    setProblems((arr) =>
      arr.map((p, i) => {
        if (i !== idx) return p;
        const choices = [...(p.choices ?? [])];
        const id = String.fromCharCode(97 + choices.length);
        choices.push({ id, label: "" });
        return { ...p, choices };
      }),
    );
  };
  const updateChoice = (pIdx: number, cIdx: number, patch: Partial<Choice>) => {
    setProblems((arr) =>
      arr.map((p, i) => {
        if (i !== pIdx || !p.choices) return p;
        return { ...p, choices: p.choices.map((c, j) => (j === cIdx ? { ...c, ...patch } : c)) };
      }),
    );
  };
  const setCorrectChoice = (pIdx: number, cIdx: number) => {
    setProblems((arr) =>
      arr.map((p, i) => {
        if (i !== pIdx || !p.choices) return p;
        return {
          ...p,
          choices: p.choices.map((c, j) => ({ ...c, correct: j === cIdx })),
        };
      }),
    );
  };
  const removeChoice = (pIdx: number, cIdx: number) => {
    setProblems((arr) =>
      arr.map((p, i) => {
        if (i !== pIdx || !p.choices) return p;
        return { ...p, choices: p.choices.filter((_, j) => j !== cIdx) };
      }),
    );
  };

  const handleSave = async (opts: { publish?: boolean } = {}) => {
    setSaving(true);
    setStatus("");
    setError("");
    const willPublish = opts.publish ?? published;
    try {
      await saveAssignment({
        data: {
          assignmentId,
          title: title.trim(),
          instructions: instructions.trim() || null,
          dueAt: dueAt ? new Date(dueAt).toISOString() : null,
          published: willPublish,
          problems: problems.map((p, i) => ({
            id: p.id,
            position: i,
            prompt: p.prompt,
            type: p.type,
            points: p.points,
            correct_answer: p.type === "short" ? p.correct_answer ?? null : null,
            choices: p.type === "mcq" ? p.choices ?? [] : null,
          })),
        },
      });
      setPublished(willPublish);
      setStatus(willPublish ? "Published ✓" : "Saved ✓");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    }
    setSaving(false);
  };

  if (auth.status !== "authenticated") return <div className="min-h-screen bg-cream" />;
  if (loading) {
    return (
      <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
        <p className="font-mono text-sm text-ink/60">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell role={auth.role} displayName={auth.displayName} onSignOut={signOut}>
      {classId && (
        <Link
          to="/teacher/class/$classId"
          params={{ classId }}
          className="font-mono text-xs uppercase tracking-widest hover:underline"
        >
          ← Back to class
        </Link>
      )}

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-black md:text-4xl">Edit assignment</h1>
        <div className="flex flex-wrap items-center gap-2">
          {status && <span className="font-mono text-xs text-electric">{status}</span>}
          <Link
            to="/teacher/assignment/$assignmentId/submissions"
            params={{ assignmentId }}
            className="rounded-full border-2 border-ink px-4 py-2 font-mono text-xs hover:bg-ink hover:text-cream"
          >
            View submissions
          </Link>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-full border-2 border-ink bg-cream px-4 py-2 font-semibold hover:bg-sun disabled:opacity-60"
          >
            {saving ? "…" : "Save draft"}
          </button>
          <button
            onClick={() => handleSave({ publish: !published })}
            disabled={saving || !title.trim()}
            className="rounded-full bg-electric px-5 py-2 font-semibold text-cream hover:bg-ink disabled:opacity-60"
          >
            {published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 font-mono text-sm text-coral">{error}</p>}

      <div className="mt-6 grid gap-4 rounded-3xl border-2 border-ink bg-cream p-6">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/70">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-full border-2 border-ink bg-cream px-4 py-2 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
            Instructions
          </span>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-ink bg-cream px-4 py-2 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
          />
        </label>
        <label className="block max-w-xs">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
            Due (optional)
          </span>
          <input
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="mt-1 w-full rounded-full border-2 border-ink bg-cream px-4 py-2 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40"
          />
        </label>
      </div>

      <h2 className="mt-10 font-display text-2xl font-black">Problems</h2>
      <div className="mt-4 space-y-4">
        {problems.map((p, idx) => (
          <article
            key={idx}
            className="rounded-3xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_0_var(--ink)]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full border-2 border-ink bg-ink px-3 py-1 font-mono text-xs text-cream">
                Problem {idx + 1}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={p.type}
                  onChange={(e) => setType(idx, e.target.value as ProblemType)}
                  className="rounded-full border-2 border-ink bg-cream px-3 py-1 font-mono text-xs"
                >
                  <option value="short">Short answer</option>
                  <option value="mcq">Multiple choice</option>
                  <option value="free">Free response</option>
                </select>
                <label className="flex items-center gap-1 font-mono text-xs">
                  Pts
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={p.points}
                    onChange={(e) =>
                      updateProblem(idx, { points: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="w-16 rounded-md border-2 border-ink bg-cream px-2 py-0.5 font-mono text-xs"
                  />
                </label>
                <button
                  onClick={() => move(idx, -1)}
                  className="rounded-md border-2 border-ink px-2 py-0.5 font-mono text-xs hover:bg-sun"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  className="rounded-md border-2 border-ink px-2 py-0.5 font-mono text-xs hover:bg-sun"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeProblem(idx)}
                  className="rounded-md border-2 border-coral px-2 py-0.5 font-mono text-xs text-coral hover:bg-coral hover:text-cream"
                >
                  Delete
                </button>
              </div>
            </div>

            <MathInput
              multiline
              value={p.prompt}
              onChange={(v) => updateProblem(idx, { prompt: v })}
              placeholder="Problem prompt (LaTeX supported with $…$)"
            />

            {p.type === "short" && (
              <div className="mt-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
                  Correct answer (case-insensitive, numbers tolerated)
                </span>
                <MathInput
                  value={p.correct_answer ?? ""}
                  onChange={(v) => updateProblem(idx, { correct_answer: v })}
                  placeholder="e.g. 42 or 3.14"
                />
              </div>
            )}

            {p.type === "mcq" && (
              <div className="mt-3 space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-widest text-ink/70">
                  Choices (select the correct one)
                </span>
                {(p.choices ?? []).map((c, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${idx}`}
                      checked={!!c.correct}
                      onChange={() => setCorrectChoice(idx, cIdx)}
                      aria-label="Mark as correct"
                    />
                    <input
                      value={c.label}
                      onChange={(e) => updateChoice(idx, cIdx, { label: e.target.value })}
                      placeholder={`Choice ${c.id.toUpperCase()}`}
                      className="flex-1 rounded-full border-2 border-ink bg-cream px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-electric/40"
                    />
                    <button
                      onClick={() => removeChoice(idx, cIdx)}
                      className="rounded-md border-2 border-ink px-2 py-0.5 font-mono text-xs hover:bg-coral hover:text-cream"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addChoice(idx)}
                  className="rounded-full border-2 border-ink px-3 py-1 font-mono text-xs hover:bg-sun"
                >
                  + Add choice
                </button>
              </div>
            )}

            {p.type === "free" && (
              <p className="mt-3 font-mono text-xs text-ink/60">
                Free-response problems are graded manually after the student submits.
              </p>
            )}
          </article>
        ))}
      </div>
      <button
        onClick={addProblem}
        className="mt-4 rounded-full border-2 border-dashed border-ink px-5 py-2 font-mono text-sm hover:border-solid hover:bg-sun"
      >
        + Add problem
      </button>
    </AppShell>
  );
}
