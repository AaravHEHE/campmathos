import { motion, useReducedMotion } from "framer-motion";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Wraps page content with a lively fade + slide-up transition keyed on pathname.
 * Honors prefers-reduced-motion (renders children with no motion).
 *
 * To avoid SSR hydration mismatches, the very first render after hydration
 * skips animation — only subsequent route changes animate.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // SSR + first paint: render a plain div (no motion) so server markup
  // matches client markup exactly. After hydration, swap to motion.
  if (reduce || !hydrated) return <div>{children}</div>;

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
