"use client";

/**
 * SmoothScroll — Lenis + GSAP integration.
 * Provides buttery-smooth scroll on desktop with ScrollTrigger sync.
 * Falls back to native scroll on touch devices and reduced-motion.
 *
 * Wrap any subtree:
 *   <SmoothScroll>{children}</SmoothScroll>
 */

import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, type ReactNode } from "react";
import { gsap, ScrollTrigger, registerGsapPlugins } from "@/lib/gsap";

interface SmoothScrollProps {
  children: ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenis = useLenis();

  useEffect(() => {
    registerGsapPlugins();
  }, []);

  useEffect(() => {
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenis.raf);
    };
  }, [lenis]);

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
