"use client";

/**
 * Hero — Landing page hero.
 * Single sentence + one CTA. No eyebrow badge.
 * Animation: clip-path wipe on the headline (single play on load).
 * Respects prefers-reduced-motion.
 */

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import dynamic from "next/dynamic";
import { useLenis } from "lenis/react";
import { gsap, registerGsapPlugins } from "@/lib/gsap";
import { MagneticButton } from "./MagneticButton";
import "./Hero.css";

// WebGL scene is client-only — no SSR.
const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), { ssr: false });

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      registerGsapPlugins();

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set([headlineRef.current, paragraphRef.current, ctaRef.current], {
          clipPath: "none",
        });
        return;
      }

      // Delay so the hero reveals as the loading cover zooms into
      // the page. Cover zoom starts at 800ms and ends at 2000ms.
      // Starting the wipe at 800ms creates a layered reveal: cover
      // scales away + hero wipes in underneath.
      const tl = gsap.timeline({ defaults: { ease: "power4.inOut" }, delay: 0.8 });

      tl.fromTo(
        headlineRef.current,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 0.8 }
      )
        .fromTo(
          paragraphRef.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        )
        .fromTo(
          ctaRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.2"
        );
    },
    { scope: rootRef },
  );

  const handleCta = () => {
    if (lenis) {
      lenis.scrollTo("#cta", { offset: -72 });
      return;
    }
    const cta = document.getElementById("cta");
    if (cta) cta.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={rootRef} className="hero">
      <HeroScene />
      <div className="hero-inner">
        <h1 ref={headlineRef} className="hero-headline">
          <span>One prompt,</span>
          <br />
          <span>build everything.</span>
        </h1>
        <p ref={paragraphRef} className="hero-paragraph">
          The first LangGraph-powered multi-agent system that turns a single
          brief into a production-grade application — frontend, backend,
          database, architecture, reviewed and shipped to GitHub in days.
        </p>
        <div ref={ctaRef} className="hero-cta">
          <MagneticButton
            className="hero-button"
            onClick={handleCta}
          >
            Start building →
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
