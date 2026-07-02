// Compact composer for emailing a single registrant via the branded pipeline.
// Reuses the broadcast-email edge function with recipients=[email].
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/broadcast-email`;

interface Props {
  email: string;
  displayName?: string | null;
  onClose: () => void;
}

export function EmailOneDialog({ email, displayName, onClose }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const send = async () => {
    setError("");
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are both required.");
      return;
    }
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
          recipients: [email],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Server returned ${res.status}`);
      if ((data?.sent ?? 0) === 0) {
        throw new Error(
          data?.errors?.[0] ?? "Send did not go through — check the address.",
        );
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    }
    setSending(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border-2 border-ink bg-cream p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Send email
            </p>
            <h2 className="mt-1 font-display text-xl font-black">
              {displayName ? `${displayName} · ` : ""}
              <span className="font-mono text-base">{email}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs text-ink/50 hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-2xl border-2 border-ink/30 bg-cream/60 p-4 font-mono text-sm">
              ✓ Sent to <strong>{email}</strong>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border-2 border-ink px-5 py-2.5 font-semibold transition hover:bg-ink hover:text-cream"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
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
              placeholder="Write your message…"
              rows={8}
              maxLength={10000}
              disabled={sending}
              className="w-full rounded-2xl border-2 border-ink bg-cream px-4 py-3 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:ring-4 focus:ring-electric/40 disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {message.length}/10000
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={sending}
                  className="rounded-full border-2 border-ink px-4 py-2 font-semibold transition hover:bg-ink hover:text-cream disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={send}
                  disabled={sending}
                  className="rounded-full border-2 border-ink bg-sun px-5 py-2 font-semibold transition hover:bg-ink hover:text-cream disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
            {error && <p className="font-mono text-sm text-coral">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
