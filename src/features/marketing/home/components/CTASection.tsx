"use client";

import { useState, type FormEvent } from "react";
import { SectionReveal } from "@/shared/components/layout/SectionReveal";
import { createDevFlowInquiry } from "@/shared/api/devflow-api";
import { compactDevFlowError } from "@/shared/utils/devflow-projects";
import { ParticleFieldCanvas } from "./VisualPrimitives";
import type { SceneProgressProps } from "./cinema-progress";
import "./CTASection.css";

export function CTASection({ cinematic = false, interactive = false, sceneName = "cta" }: SceneProgressProps) {
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email.");
      return;
    }
    if (!brief.trim() || brief.trim().length < 10) {
      setError("Brief should be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await createDevFlowInquiry({
        companyName: "TBD",
        contactName: email.trim().split("@")[0] ?? "TBD",
        email: email.trim(),
        brief: brief.trim(),
      });
      setSubmitted(true);
      setEmail("");
      setBrief("");
    } catch (err) {
      setError(compactDevFlowError(err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const briefPreview = brief.trim();

  const content = (
      <div className="cta-inner">
        <div className="cta-head" data-cinema-reveal>
          <p>Section 5</p>
          <h2>Let&apos;s build what&apos;s next.</h2>
          <span>Share a brief and we&apos;ll get back with a plan, timeline, and first steps.</span>
        </div>

        <div className="cta-grid">
          <article className="cta-terminal">
            <header className="cta-terminal-header">
              <span>DevFlow terminal</span>
              <span className="cta-online"><i />Online</span>
            </header>
            <div className="cta-terminal-body">
              <ParticleFieldCanvas variant="beam" className="cta-terminal-particles" sceneName={sceneName} interactive={interactive || cinematic} />
              <div className="cta-terminal-lines">
                <p><strong>&gt; devflow init</strong><span>Initializing DevFlow runtime...</span></p>
                <p><strong>&gt; analyze brief</strong><span>{briefPreview ? `Parsing "${briefPreview.slice(0, 72)}${briefPreview.length > 72 ? "..." : ""}"` : "Parsing project brief and requirements..."}</span></p>
                <p><strong>&gt; map architecture</strong><span>Designing scalable system architecture...</span></p>
                <p><strong>&gt; assemble team</strong><span>Matching capabilities to project needs...</span></p>
                <p><strong>&gt; schedule kickoff</strong><span>Setting timeline and milestones...</span></p>
                <p><strong>&gt; ready</strong><span>We&apos;re ready to build.</span></p>
                <p className="cta-cursor-line"><strong>&gt;</strong><span className="cta-cursor" aria-hidden="true" /></p>
              </div>
            </div>
          </article>

          <form className="cta-form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="cta-success">
                <p className="cta-success-title">Brief received.</p>
                <p className="cta-success-body">
                  You&apos;ll get a scoped contract back shortly. Watch your inbox.
                </p>
              </div>
            ) : (
              <>
                <div className="cta-form-head">
                  <h3>Start your project</h3>
                  <p>Tell us about your project and goals. We&apos;ll reply with next steps.</p>
                </div>

                <div className="cta-field">
                  <label htmlFor="cta-email" className="cta-label">
                    Email
                  </label>
                  <input
                    id="cta-email"
                    type="email"
                    className="cta-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@company.com"
                    autoComplete="email"
                    disabled={submitting}
                  />
                </div>

                <div className="cta-field">
                  <label htmlFor="cta-brief" className="cta-label">
                    Brief
                  </label>
                  <textarea
                    id="cta-brief"
                    className="cta-textarea"
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Describe your project, goals, key features, and any relevant details."
                    rows={5}
                    disabled={submitting}
                  />
                </div>

                {error && <p className="cta-error">{error}</p>}

                <button
                  type="submit"
                  className="cta-button"
                  disabled={submitting}
                >
                  <span>{submitting ? "Starting..." : "Start"}</span>
                  <span aria-hidden="true">→</span>
                </button>

                <p className="cta-secure">Your information is secure and confidential.</p>
              </>
            )}
          </form>
        </div>

        <div className="cta-trust" aria-label="Trusted by ambitious teams">
          <span>Trusted by ambitious teams</span>
          <div>
            <b>DevFlow</b>
            <b>Northpoint</b>
            <b>Veridian</b>
            <b>Thread</b>
            <b>Altura</b>
          </div>
        </div>
      </div>
  );

  if (cinematic) {
    return (
      <section className="cta is-cinematic">
        {content}
      </section>
    );
  }

  return (
    <SectionReveal as="section" className="cta" id="cta" y={12}>
      {content}
    </SectionReveal>
  );
}
