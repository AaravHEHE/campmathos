import { useState, useRef, useEffect, useMemo, type RefObject } from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

// Each symbol inserts either a literal Unicode char OR a LaTeX snippet
// (wrapped in $...$ when not already inside math mode). Snippets use
// "$CURSOR$" as the caret-placement marker.
type Symbol = { label: string; insert: string; title?: string; latex?: boolean };

const SYMBOLS: Symbol[] = [
  { label: "π", insert: "\\pi", latex: true },
  { label: "x²", insert: "$CURSOR$^{2}", latex: true, title: "squared" },
  { label: "xⁿ", insert: "$CURSOR$^{}", latex: true, title: "exponent" },
  { label: "x₍ᵢ₎", insert: "$CURSOR$_{}", latex: true, title: "subscript" },
  { label: "a⁄b", insert: "\\frac{}{}", latex: true, title: "fraction" },
  { label: "√", insert: "\\sqrt{}", latex: true, title: "square root" },
  { label: "ⁿ√", insert: "\\sqrt[]{}", latex: true, title: "nth root" },
  { label: "±", insert: "\\pm", latex: true },
  { label: "×", insert: "\\times", latex: true },
  { label: "÷", insert: "\\div", latex: true },
  { label: "≤", insert: "\\le", latex: true },
  { label: "≥", insert: "\\ge", latex: true },
  { label: "≠", insert: "\\ne", latex: true },
  { label: "≈", insert: "\\approx", latex: true },
  { label: "∞", insert: "\\infty", latex: true },
  { label: "Σ", insert: "\\sum_{}^{}", latex: true, title: "sum" },
  { label: "∫", insert: "\\int_{}^{}", latex: true, title: "integral" },
  { label: "θ", insert: "\\theta", latex: true },
  { label: "(", insert: "(" },
  { label: ")", insert: ")" },
  { label: "x", insert: "x" },
  { label: "y", insert: "y" },
  { label: "n", insert: "n" },
];

const PEMDAS_HINT = "PEMDAS: parentheses → exponents → ×÷ → +−";

type AnyInputRef = RefObject<HTMLInputElement | HTMLTextAreaElement | null>;

// Render text that may contain $...$ (inline) or $$...$$ (block) LaTeX.
export function RichMath({ text }: { text: string }) {
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
    <span className="whitespace-pre-wrap break-words">
      {parts.map((p, i) => {
        if (p.type === "text") return <span key={i}>{p.value}</span>;
        try {
          return p.type === "inline" ? (
            <InlineMath key={i} math={p.value} />
          ) : (
            <BlockMath key={i} math={p.value} />
          );
        } catch {
          return <span key={i} className="text-coral">{p.type === "inline" ? `$${p.value}$` : `$$${p.value}$$`}</span>;
        }
      })}
    </span>
  );
}

export function MathKeyboard({
  inputRef,
  onChange,
}: {
  inputRef: AnyInputRef;
  onChange: (next: string) => void;
}) {
  const insert = (symbol: Symbol) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const value = el.value;

    let toInsert = symbol.insert;
    let caretOffset = toInsert.length;

    if (symbol.latex) {
      // Detect whether the caret is already inside an open $...$ region.
      const before = value.slice(0, start);
      const dollarsBefore = (before.match(/\$/g) ?? []).length;
      const insideMath = dollarsBefore % 2 === 1;

      // Resolve $CURSOR$ token if present (used when wrapping previous token).
      const cursorToken = "$CURSOR$";
      if (toInsert.includes(cursorToken)) {
        toInsert = toInsert.replace(cursorToken, "");
      }

      if (!insideMath) {
        toInsert = `$${toInsert}$`;
        // Place caret just before the closing $ if the snippet has empty braces,
        // otherwise after the snippet entirely.
        const emptyBraceIdx = toInsert.indexOf("{}");
        caretOffset = emptyBraceIdx >= 0 ? emptyBraceIdx + 1 : toInsert.length;
      } else {
        const emptyBraceIdx = toInsert.indexOf("{}");
        caretOffset = emptyBraceIdx >= 0 ? emptyBraceIdx + 1 : toInsert.length;
      }
    }

    const next = value.slice(0, start) + toInsert + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + caretOffset;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="mt-2 rounded-2xl border-2 border-ink bg-cream/80 p-3 shadow-[4px_4px_0_0_var(--ink)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Math keyboard · wraps in $…$ for LaTeX
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
              insert(s);
            }}
            className="min-w-9 rounded-md border-2 border-ink bg-cream px-2 py-1.5 font-mono text-sm hover:bg-sun"
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] text-ink/60">
        Tip: wrap math in <code>$…$</code> (e.g. <code>$\frac{"{1}"}{"{2}"}$</code>) for rendered equations.
      </p>
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

  const hasMath = /\$[^$\n]+\$|\$\$[^$]+\$\$/.test(value);

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
      {hasMath && value.trim() && (
        <div className="mt-2 rounded-xl border-2 border-ink/30 bg-cream/60 px-4 py-2 text-base">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Preview
          </p>
          <RichMath text={value} />
        </div>
      )}
      {showKeyboard && !disabled && (
        <div data-math-keyboard>
          <MathKeyboard inputRef={inputRef} onChange={onChange} />
        </div>
      )}
    </div>
  );
}
