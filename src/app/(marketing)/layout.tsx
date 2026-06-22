"use client";

/**
 * Marketing layout — wraps all marketing pages with SmoothScroll.
 * Provides smooth scrolling and GSAP integration for the landing page.
 */

import type { ReactNode } from "react";
import { SmoothScroll } from "@/shared/components/layout/SmoothScroll";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <SmoothScroll>{children}</SmoothScroll>;
}
