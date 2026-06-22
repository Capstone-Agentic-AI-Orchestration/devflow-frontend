"use client";

/**
 * MarketingFrame — Owns the loading screen + scroll lock + smooth scroll
 * for marketing routes. Renders children underneath the cover so the
 * hand-off is seamless (no flash).
 *
 * Scroll lock: while the cover is active, both `html` and `body` get
 * overflow:hidden. The body lock alone is enough — there's nothing to
 * scroll since the cover is on top.
 */

import { useState, useEffect, type ReactNode } from "react";
import { SmoothScroll } from "@/shared/components/layout/SmoothScroll";
import { LoadingScreen } from "@/features/marketing/loading/LoadingScreen";

export function MarketingFrame({ children }: { children: ReactNode }) {
  const [coverDone, setCoverDone] = useState(false);

  useEffect(() => {
    if (coverDone) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      return;
    }
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [coverDone]);

  return (
    <>
      <SmoothScroll>{children}</SmoothScroll>
      {!coverDone && <LoadingScreen onComplete={() => setCoverDone(true)} />}
    </>
  );
}
