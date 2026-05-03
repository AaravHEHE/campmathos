import { useState } from "react";
import { Check, Copy, Facebook, Mail } from "lucide-react";

const SHARE_URL = "https://campmathos.lovable.app";
const SHARE_TEXT =
  "MathOs is a completely free summer applied math camp for grades 4–7 at Naperville Public Library. Tue/Thu, June 2 – July 9, 2026. Worth a look:";

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

  const subject = "Free summer math camp in Naperville";
  const body = `${SHARE_TEXT}\n\n${SHARE_URL}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const onEmail = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Try the user's default mail client first.
    const start = Date.now();
    const blurHandler = () => {
      // If the window blurred quickly, a mail client opened — do nothing.
      window.removeEventListener("blur", blurHandler);
      clearTimeout(fallbackTimer);
    };
    window.addEventListener("blur", blurHandler);
    const fallbackTimer = window.setTimeout(() => {
      window.removeEventListener("blur", blurHandler);
      // No mail client took over — open Gmail web compose as a fallback.
      if (Date.now() - start < 1500) {
        window.open(gmailUrl, "_blank", "noopener,noreferrer");
      }
    }, 500);
    window.location.href = mailUrl;
  };

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
        <a href={mailUrl} onClick={onEmail} aria-label="Share by email" className={btn}>
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
