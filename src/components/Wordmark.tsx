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
