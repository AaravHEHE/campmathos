import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * A two-layer cursor effect: a small dot that tracks the cursor exactly,
 * and a larger ring that lags behind with spring physics for a parallax feel.
 *
 * Disabled automatically when:
 *   - the user prefers reduced motion
 *   - the device is touch-only (no fine pointer)
 */
export function CursorParallax() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // Ring lags behind with spring; dot snaps.
  const ringX = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const isInteractive = !!target?.closest(
        "a, button, [role='button'], input, textarea, select, summary, label",
      );
      setHovering(isInteractive);
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer ring — parallax / lagging */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--electric)] mix-blend-difference md:block"
        style={{
          x: ringX,
          y: ringY,
          scale: hovering ? 1.6 : 1,
          backgroundColor: hovering ? "var(--electric)" : "transparent",
          opacity: hovering ? 0.25 : 0.9,
          transition: "scale 0.2s ease, background-color 0.2s ease, opacity 0.2s ease",
        }}
      />
      {/* Inner dot — exact tracking */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--coral)] mix-blend-difference md:block"
        style={{ x, y }}
      />
    </>
  );
}
