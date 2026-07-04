"use client";

import type { ReactNode } from "react";

/**
 * Route-level enter transition. Rendered from each segment's `template.tsx`,
 * so it remounts on navigation (animating the incoming page) while the
 * surrounding layout — console shell, nav, providers — persists untouched.
 *
 * Pure CSS (`.page-transition` in globals.css): 250ms fade + 8px rise,
 * disabled under prefers-reduced-motion.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
