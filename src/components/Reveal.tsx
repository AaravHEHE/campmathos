import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale";

interface RevealProps {
  children: ReactNode;
  /** Animation direction. Defaults to "up". */
  direction?: Direction;
  /** Delay in seconds before animating. */
  delay?: number;
  /** Animation duration in seconds. Defaults to 0.6. */
  duration?: number;
  /** Custom className applied to the wrapper. */
  className?: string;
  /** Trigger once (default true) or every time it scrolls into view. */
  once?: boolean;
  /** How much of the element must be visible to trigger (0-1). Defaults 0.15. */
  amount?: number;
}

const offset = 64;
const directionMap: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: offset },
  down: { y: -offset },
  left: { x: offset },
  right: { x: -offset },
  scale: { scale: 0.82 },
};

/**
 * Lightweight scroll-reveal wrapper. Uses framer-motion's `whileInView`
 * (IntersectionObserver under the hood). Respects reduced-motion.
 *
 * Usage:
 *   <Reveal><h2>Title</h2></Reveal>
 *   <Reveal direction="left" delay={0.1}>...</Reveal>
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.95,
  className,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const from = directionMap[direction];
  const variants: Variants = {
    hidden: { opacity: 0, ...from },
    show: { opacity: 1, x: 0, y: 0, scale: 1 },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
