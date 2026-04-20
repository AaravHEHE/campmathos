import { useState } from "react";
import { Check, Copy, Facebook, Mail } from "lucide-react";

const SHARE_URL = "https://campmathos.lovable.app";
const SHARE_TEXT =
  "MathOs is a completely free summer applied math camp for grades 4–7 at Naperville Public Library. Mon/Wed/Fri in June. Worth a look:";

export function ShareButtons() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent("Free summer math camp in Naperville")}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}`)}`;

  const btn =
    "inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ink hover:text-cream focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-electric/40";

  return (
    <div className="mt-6">
      <p className="font-mono text-xs tracking-widest text-ink/60">
        Know another family who'd love this?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={btn}
        >
          <span aria-hidden className="font-bold">𝕏</span>
          <span>X</span>
        </a>
        <a
          href={fbUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className={btn}
        >
          <Facebook className="h-4 w-4" aria-hidden />
          <span>Facebook</span>
        </a>
        <a href={mailUrl} aria-label="Share by email" className={btn}>
          <Mail className="h-4 w-4" aria-hidden />
          <span>Email</span>
        </a>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Link copied" : "Copy link"}
          className={btn}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden />
              <span>Copy link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
