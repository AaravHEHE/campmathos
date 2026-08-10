// Admin broadcast composer — sends a one-off message to a chosen audience.
// Calls the broadcast-email edge function with the user's session JWT.
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/broadcast-email`;

interface Result {
  total: number;
  sent: number;
  failed: number;
  errors: string[];
}

type Audience = "all" | "filled" | "not_filled";

interface BroadcastFormProps {
  registrations: { email: string }[];
  formEmails: Set<string>;
}

export function BroadcastForm({ registrations, formEmails }: BroadcastFormProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const allEmails = useMemo(
    () =>
      Array.from(
        new Set(
          registrations
            .map((r) => (r.email ?? "").trim().toLowerCase())
            .filter(Boolean),
        ),
      ),
    [registrations],
  );

  const recipients = useMemo(() => {
    if (audience === "all") return allEmails;
    if (audience === "filled") return allEmails.filter((e) => formEmails.has(e));
    return allEmails.filter((e) => !formEmails.has(e));
  }, [allEmails, formEmails, audience]);

  const recipientCount = recipients.length;

  const audienceLabel =
    audience === "all"
      ? "all registrants"
      : audience === "filled"
        ? "registrants who FILLED the form"
        : "registrants who did NOT fill the form";

  const send = async () => {
    setError("");
    setResult(null);
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are both required.");
      return;
    }
    if (recipientCount === 0) {
      setError("No recipients match the selected audience.");
      return;
    }
    const ok = window.confirm(
      `Send this message to ${recipientCount} ${audienceLabel}?\n\nThis cannot be undone.`,
    );
    if (!ok) return;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          // Always send explicit recipients so the audience filter applies.
          recipients,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Server returned ${res.status}`);
      setResult(data as Result);
      if (data?.failed === 0) {
        setSubject("");
        setMessage("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    }
    setSending(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border-2 border-ink bg-electric px-5 py-2.5 font-semibold text-cream transition hover:bg-ink"
      >
        Email registrants
      </button>
    );
  }

  return (
    <div className="card-3d bg-cream p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Broadcast
          </p>
          <h2 className="mt-1 font-display text-xl font-black">
            Email {recipientCount} {audienceLabel}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
            setResult(null);
          }}
          className="font-mono text-xs text-ink/50 hover:text-ink"
          aria-label="Close broadcast form"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {/* Audience selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/70">
            Audience
          </span>
          <div className="inline-flex items-center rounded-full border-2 border-ink p-0.5 font-mono text-[10px] uppercase tracking-widest">
            {(
              [
                { id: "all" as Audience, label: "Everyone" },
                { id: "filled" as Audience, label: "Form ✓" },
                { id: "not_filled" as Audience, label: "Form ✗" },
              ]
            ).map((opt) => {
              const count =
                opt.id === "all"
                  ? allEmails.length
                  : opt.id === "filled"
                    ? allEmails.filter((e) => formEmails.has(e)).length
                    : allEmails.filter((e) => !formEmails.has(e)).length;
              const active = audience === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAudience(opt.id)}
                  disabled={sending}
                  className={`rounded-full px-3 py-1 transition ${
                    active ? "bg-ink text-cream" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {opt.label} · {count}
                </button>
              );
            })}
          </div>
        </div>

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject line"
          maxLength={200}
          disabled={sending}
          className="w-full rounded-2xl border-2 border-ink bg-cream px-4 py-2.5 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40 disabled:opacity-60"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message… plain text, line breaks become &lt;br&gt;."
          rows={8}
          maxLength={10000}
          disabled={sending}
          className="w-full rounded-2xl border-2 border-ink bg-cream px-4 py-3 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40 disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {message.length}/10000 chars · sent ~2/sec
          </p>
          <button
            type="button"
            onClick={send}
            disabled={sending || recipientCount === 0}
            className="rounded-full border-2 border-ink bg-sun px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream disabled:opacity-50"
          >
            {sending ? "Sending…" : `Send to ${recipientCount}`}
          </button>
        </div>

        {error && <p className="font-mono text-sm text-coral">{error}</p>}
        {result && (
          <div className="rounded-2xl border-2 border-ink/30 bg-cream/60 p-4">
            <p className="font-mono text-sm">
              ✓ Sent to <strong>{result.sent}</strong> of {result.total}
              {result.failed > 0 && (
                <span className="text-coral"> · {result.failed} failed</span>
              )}
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-2 space-y-1 font-mono text-xs text-coral/80">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
