import { Fragment, type ReactNode } from "react";

type Props = { className?: string };

/** MathOs wordmark with brand colors: "Math" in electric blue, "Os" in coral. */
export function Wordmark({ className }: Props) {
  return (
    <span className={className}>
      <span className="text-electric">Math</span>
      <span className="text-coral">Os</span>
    </span>
  );
}

/** Replace every literal "MathOs" inside a string with the colored wordmark. */
export function colorizeMathOs(text: string): ReactNode {
  const parts = text.split(/(MathOs)/g);
  return parts.map((part, i) =>
    part === "MathOs" ? (
      <Wordmark key={i} />
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}
