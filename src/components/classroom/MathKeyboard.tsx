import { useState, useRef, useEffect, type RefObject } from "react";

const SYMBOLS: Array<{ label: string; insert: string; title?: string }> = [
  { label: "π", insert: "π" },
  { label: "x²", insert: "^2", title: "squared" },
  { label: "x³", insert: "^3" },
  { label: "xⁿ", insert: "^", title: "exponent" },
  { label: "√", insert: "√(" },
  { label: "±", insert: "±" },
  { label: "×", insert: "×" },
  { label: "÷", insert: "÷" },
  { label: "≤", insert: "≤" },
  { label: "≥", insert: "≥" },
  { label: "≠", insert: "≠" },
  { label: "∞", insert: "∞" },
  { label: "a/b", insert: "/", title: "fraction" },
  { label: "(", insert: "(" },
  { label: ")", insert: ")" },
  { label: "x", insert: "x" },
  { label: "y", insert: "y" },
  { label: "n", insert: "n" },
];

const PEMDAS_HINT = "PEMDAS: parentheses → exponents → ×÷ → +−";

type AnyInputRef = RefObject<HTMLInputElement | HTMLTextAreaElement | null>;

export function MathKeyboard({
  inputRef,
  onChange,
}: {
  inputRef: AnyInputRef;
  onChange: (next: string) => void;
}) {
  const insert = (text: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = el.value.slice(0, start) + text + el.value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="mt-2 rounded-2xl border-2 border-ink bg-cream/80 p-3 shadow-[4px_4px_0_0_var(--ink)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Math keyboard
        </span>
        <span className="font-mono text-[10px] text-ink/60" title={PEMDAS_HINT}>
          PEMDAS
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {SYMBOLS.map((s) => (
          <button
            key={s.label}
            type="button"
            title={s.title ?? s.label}
            onMouseDown={(e) => {
              e.preventDefault();
              insert(s.insert);
            }}
            className="min-w-9 rounded-md border-2 border-ink bg-cream px-2 py-1.5 font-mono text-sm hover:bg-sun"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MathInput({
  value,
  onChange,
  placeholder,
  multiline,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Close keyboard on outside-focus change.
  useEffect(() => {
    if (!showKeyboard) return;
    const handler = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target === inputRef.current) return;
      if (target.closest("[data-math-keyboard]")) return;
      setShowKeyboard(false);
    };
    document.addEventListener("focusin", handler);
    return () => document.removeEventListener("focusin", handler);
  }, [showKeyboard]);

  const sharedProps = {
    ref: inputRef as never,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onFocus: () => setShowKeyboard(true),
    placeholder,
    disabled,
    className:
      "w-full rounded-2xl border-2 border-ink bg-cream px-4 py-3 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-electric/40 disabled:opacity-60",
  };

  return (
    <div>
      {multiline ? (
        <textarea rows={5} {...sharedProps} />
      ) : (
        <input type="text" {...sharedProps} />
      )}
      {showKeyboard && !disabled && (
        <div data-math-keyboard>
          <MathKeyboard inputRef={inputRef} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
