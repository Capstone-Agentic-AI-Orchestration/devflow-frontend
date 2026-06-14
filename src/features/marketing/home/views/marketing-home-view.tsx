// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/shared/components/ui";
import { ContactCloser, Footer, TopNav, useReveal } from "@/shared/components/layout";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconChevronDown,
  IconGitBranch,
  IconRocket,
  IconStar,
  IconUser,
  IconZap,
} from "@/shared/components/icons";
function HeroWords({ text }) {
  // each word fades up with a stagger
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span
          key={i}
          className="word"
          style={{ animationDelay: `${0.06 * i}s`, marginRight: ".25em" }}
        >{w}</span>
      ))}
    </>
  );
}

/* --- Hero --- */
function LegacyHero({ onCta }) {
  return (
    <section style={{ position: "relative", paddingTop: 80, paddingBottom: 80 }}>
      <div className="container" style={{ position: "relative", textAlign: "center", maxWidth: 1080 }}>
        <div style={{ display: "inline-block", animation: "fadeUp .6s ease both" }}>
          <span className="eyebrow"><span className="dot" /> Enterprise IT Solutions for Philippine MSMEs</span>
        </div>

        <h1 className="h-display mt-6">
          <div><HeroWords text="Build Production-Ready" /></div>
          <div className="gradient-text" style={{ display: "block" }}>
            <HeroWords text="Apps Instantly" />
          </div>
        </h1>

        <p className="lead mt-6 fade-up" style={{ margin: "24px auto 0", animationDelay: ".55s" }}>
          Transform ideas into complete applications. Our specialist team and intelligent
          automation deliver production-ready software, repositories, and deployments — in
          days, not months.
        </p>

        <div className="row gap-3 mt-8 fade-up" style={{ justifyContent: "center", animationDelay: ".7s", position: "relative" }}>
          <div className="hero-glow" />
          <Button variant="primary" size="lg" icon={<IconZap />} iconRight={<IconArrowRight />} onClick={onCta}>
            Start Building
          </Button>
          <Button variant="secondary" size="lg" iconRight={<IconArrowUpRight />}>
            View Dashboard
          </Button>
        </div>

        {/* Outcome strip below the CTAs — abstract, business-facing */}
        <div className="mt-16 fade-up" style={{ animationDelay: ".9s", position: "relative", zIndex: 1 }}>
          <HeroOutcomeStrip />
        </div>
      </div>
    </section>
  );
}

LegacyHero.displayName = "LegacyHero";

function Hero({ onCta }) {
  return (
    <section className="kinetic-hero">
      <Image
        className="kinetic-hero-art"
        src="/images/animated-workflow-hero.png"
        alt=""
        aria-hidden="true"
        width={1280}
        height={900}
        priority
      />
      <div className="kinetic-hero-scrim" aria-hidden="true" />
      <div className="container kinetic-hero-inner">
        <div className="kinetic-copy">
          <span className="eyebrow"><span className="dot" /> Enterprise IT delivery for Philippine MSMEs</span>
          <h1 className="kinetic-title mt-6">
            <span className="kinetic-title-line"><HeroWords text="Build production-ready" /></span>
            <span className="kinetic-title-line kinetic-title-line--accent"><HeroWords text="systems with momentum." /></span>
          </h1>
          <p className="lead kinetic-lead mt-6 fade-up" style={{ animationDelay: ".55s" }}>
            A premium delivery workspace where PMs, developers, clients, and AI-assisted workflows
            move through scope, build, review, and handoff with visible progress.
          </p>

          <div className="row gap-3 mt-8 fade-up kinetic-actions" style={{ animationDelay: ".7s" }}>
            <Button variant="primary" size="lg" icon={<IconZap />} iconRight={<IconArrowRight />} onClick={onCta}>
              Start Building
            </Button>
            <Button variant="secondary" size="lg" iconRight={<IconArrowUpRight />}>
              View Dashboard
            </Button>
          </div>
        </div>

        <HeroMotionStage />
      </div>
      <HeroMarquee />
    </section>
  );
}

function HeroMotionStage() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((index) => (index + 1) % 5), 1800);
    return () => clearInterval(id);
  }, []);

  const stages = [
    { label: "Inquiry", value: "Client brief captured", meta: "Public intake", tint: "#4F8BFF" },
    { label: "Scope", value: "PM gate aligned", meta: "Kickoff ready", tint: "#14B8A6" },
    { label: "Build", value: "Work orders moving", meta: "Team + agents", tint: "#F59E0B" },
    { label: "Review", value: "Artifacts validated", meta: "Client visible", tint: "#10B981" },
    { label: "Handoff", value: "Delivery package ready", meta: "Repo + docs", tint: "#93C5FD" },
  ];

  return (
    <div className="hero-stage fade-up" style={{ animationDelay: ".35s" }}>
      <div className="hero-stage-grid" aria-hidden="true" />
      <div className="hero-stage-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="hero-stage-window">
        <div className="hero-stage-top">
          <div className="row gap-2">
            <span className="chrome-dot" />
            <span className="chrome-dot" />
            <span className="chrome-dot" />
          </div>
          <span className="mono">delivery.graph</span>
        </div>
        <div className="hero-stage-body">
          <div className="hero-stage-map" aria-hidden="true">
            {stages.map((stage, index) => (
              <span
                key={stage.label}
                className={active === index ? "is-active" : ""}
                style={{ "--node-tint": stage.tint }}
              />
            ))}
          </div>
          <div className="hero-stage-list">
            {stages.map((stage, index) => (
              <button
                className={`stage-card ${active === index ? "is-active" : ""}`}
                key={stage.label}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                type="button"
                style={{ "--stage-tint": stage.tint }}
              >
                <span className="mono">{stage.label}</span>
                <strong>{stage.value}</strong>
                <small>{stage.meta}</small>
                <i />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="hero-stage-note">
        <span className="badge badge-green"><span className="dot" /> Live</span>
        <strong>Backend-reflective by design</strong>
        <p>Motion follows the same project lifecycle your PM, DEV, and CLIENT workspaces use.</p>
      </div>
    </div>
  );
}

function HeroMarquee() {
  const labels = ["Intake", "Kickoff", "Work orders", "Artifacts", "Client review", "Delivery handoff"];
  return (
    <div className="hero-marquee" aria-hidden="true">
      <div className="hero-marquee-track">
        {[...labels, ...labels].map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function InteractiveDeliveryExperience() {
  const [active, setActive] = useState(0);
  const panels = [
    {
      kicker: "01",
      title: "A guided delivery cockpit",
      body: "Project managers see motion around the same checkpoints the backend tracks: intake, kickoff, work orders, artifacts, and delivery review.",
      stat: "5 phases",
      tint: "#4F8BFF",
    },
    {
      kicker: "02",
      title: "Animated, not decorative",
      body: "Interactions are tied to real operational surfaces, so hover and focus states teach the workflow instead of adding noise.",
      stat: "Role aware",
      tint: "#14B8A6",
    },
    {
      kicker: "03",
      title: "Premium client confidence",
      body: "Clients get a polished sense of progress while the app keeps the same clear SaaS structure and backend-driven data model.",
      stat: "Live handoff",
      tint: "#F59E0B",
    },
  ];

  return (
    <section className="section interactive-delivery">
      <div className="container">
        <div className="interactive-head" data-reveal>
          <span className="eyebrow"><span className="dot" /> Interactive experience layer</span>
          <h2 className="h-1 mt-4">Premium motion that still behaves like product UI.</h2>
          <p className="lead mt-4">
            Inspired by high-end animated websites, tuned for a serious delivery platform.
          </p>
        </div>

        <div className="interactive-grid mt-12">
          <div className="interactive-preview" data-reveal>
            <div className="preview-rail">
              {panels.map((panel, index) => (
                <button
                  key={panel.kicker}
                  className={active === index ? "is-active" : ""}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  type="button"
                  style={{ "--panel-tint": panel.tint }}
                >
                  <span>{panel.kicker}</span>
                  {panel.title}
                </button>
              ))}
            </div>
            <div className="preview-canvas" style={{ "--panel-tint": panels[active].tint }}>
              <div className="preview-scan" />
              <div className="preview-card preview-card-a">
                <span className="mono">{panels[active].stat}</span>
                <strong>{panels[active].title}</strong>
              </div>
              <div className="preview-card preview-card-b">
                <span className="badge badge-blue"><span className="dot" /> Synced</span>
                <p>{panels[active].body}</p>
              </div>
              <div className="preview-pulse" />
            </div>
          </div>

          <div className="interactive-copy" data-reveal>
            {panels.map((panel, index) => (
              <article
                key={panel.kicker}
                className={active === index ? "is-active" : ""}
                onMouseEnter={() => setActive(index)}
                style={{ "--panel-tint": panel.tint }}
              >
                <span className="mono">{panel.kicker}</span>
                <h3>{panel.title}</h3>
                <p>{panel.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Hero outcome strip: 4 abstract delivery milestones, no architecture leaks */
function HeroOutcomeStrip() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2200);
    return () => clearInterval(id);
  }, []);
  const steps = [
    { title: "Discovery",  meta: "Day 1",      tint: "#4F8BFF" },
    { title: "Proposal",   meta: "Day 2",      tint: "#8B5CF6" },
    { title: "Build",      meta: "Days 3–10",  tint: "#A78BFA" },
    { title: "Review",     meta: "Day 11",     tint: "#3B82F6" },
    { title: "Deploy",     meta: "Day 12",     tint: "#10B981" },
  ];
  const activeIdx = tick % steps.length;
  return (
    <div className="card-glass" style={{ padding: 22, borderRadius: 18, position: "relative" }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 18, padding: "0 4px" }}>
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 10px #10B981" }} />
          <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>A typical delivery cycle</span>
        </div>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>~12 business days</span>
      </div>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: "6%", right: "6%", top: 22,
          height: 2, borderRadius: 2,
          background: "linear-gradient(90deg, rgba(79,139,255,.15), rgba(139,92,246,.5), rgba(16,185,129,.15))",
        }} />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 8, position: "relative" }}>
          {steps.map((s, i) => {
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <div key={s.title} style={{ textAlign: "center" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: done
                    ? `linear-gradient(135deg, ${s.tint}, ${s.tint}aa)`
                    : active
                      ? `radial-gradient(circle at 30% 30%, ${s.tint}66, ${s.tint}22)`
                      : "rgba(15,23,42,.85)",
                  border: `1px solid ${active ? s.tint : done ? s.tint + "99" : "#2a3a5a"}`,
                  color: done || active ? "white" : "var(--text-3)",
                  display: "grid", placeItems: "center",
                  margin: "0 auto",
                  fontWeight: 600, fontSize: 14,
                  boxShadow: active ? `0 0 0 6px ${s.tint}22` : "none",
                  transition: "all .4s ease",
                  position: "relative", zIndex: 1,
                }}>
                  {done ? <IconCheck size={16} stroke={3} /> : i + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 12, color: active ? "white" : "var(--text-2)" }}>{s.title}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{s.meta}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --- Feature cards --- */
function Features() {
  const items = [
    {
      icon: <IconRocket size={22} />, tint: "rgba(139,92,246,.15)", color: "#C4B5FD",
      title: "Rapid Development",
      desc: "Production-ready applications delivered in a fraction of the traditional timeline.",
    },
    {
      icon: <IconGitBranch size={22} />, tint: "rgba(47,107,255,.15)", color: "#93C5FD",
      title: "Automated CI/CD",
      desc: "Repository scaffolding, branch protection, tests, and deploy pipelines wired up before you write a line.",
    },
    {
      icon: <IconUser size={22} />, tint: "rgba(16,185,129,.15)", color: "#6EE7B7",
      title: "Expert-Led Delivery",
      desc: "A specialist 12-person team backed by intelligent automation, delivering production-ready solutions in days, not months.",
    },
  ];
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {items.map((it, i) => (
            <Card key={i} hover data-reveal style={{ padding: 26, transitionDelay: `${i * 80}ms` }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: it.tint, color: it.color,
                display: "grid", placeItems: "center",
                marginBottom: 18,
                border: "1px solid rgba(255,255,255,.05)",
              }}>{it.icon}</div>
              <h3 className="h-3" style={{ marginBottom: 10 }}>{it.title}</h3>
              <p style={{ color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.6 }}>{it.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- How it works (interactive delivery flow) --- */
function HowItWorks() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((index) => (index + 1) % 4), 2600);
    return () => clearInterval(id);
  }, []);

  const steps = [
    {
      n: "01",
      title: "Submit Inquiry",
      desc: "A guided intake captures scope, users, workflow pain points, and delivery urgency.",
      signal: "Client brief",
      metric: "10 min",
      tint: "#4F8BFF",
    },
    {
      n: "02",
      title: "Discovery & Approval",
      desc: "A PM turns the brief into a milestone plan, invite flow, team setup, and approval gates.",
      signal: "PM workspace",
      metric: "Day 1-2",
      tint: "#14B8A6",
    },
    {
      n: "03",
      title: "Development & Reviews",
      desc: "Work orders, artifacts, comments, and delivery events move through the live backend.",
      signal: "DEV + AI flow",
      metric: "Days 3-10",
      tint: "#F59E0B",
    },
    {
      n: "04",
      title: "Delivery & Support",
      desc: "Clients review the final package with repository, docs, timeline, and handoff status.",
      signal: "Client handoff",
      metric: "Day 12",
      tint: "#10B981",
    },
  ];
  const current = steps[active];

  return (
    <section className="section flow-lab">
      <div className="container">
        <div className="flow-lab-head" data-reveal>
          <span className="eyebrow"><span className="dot" /> The flow</span>
          <h2 className="h-1 mt-4">How it <span className="gradient-text">works</span></h2>
          <p className="lead mt-4">
            From a single inquiry to a deployed system, every phase has a visible state.
          </p>
        </div>

        <div className="flow-lab-grid mt-16">
          <div className="flow-lab-preview" data-reveal style={{ "--flow-tint": current.tint }}>
            <div className="flow-preview-glow" />
            <div className="flow-preview-top">
              <span className="badge badge-blue"><span className="dot" /> Active phase</span>
              <span className="mono">{current.metric}</span>
            </div>
            <div className="flow-preview-core">
              <span className="flow-preview-number">{current.n}</span>
              <h3>{current.title}</h3>
              <p>{current.desc}</p>
            </div>
            <div className="flow-preview-bottom">
              <div>
                <span className="mono">Signal</span>
                <strong>{current.signal}</strong>
              </div>
              <div>
                <span className="mono">Status</span>
                <strong>In motion</strong>
              </div>
            </div>
            <div className="flow-preview-rings" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="flow-lab-steps" data-reveal>
            <div className="flow-lab-path" aria-hidden="true">
              <span style={{ height: `${((active + 1) / steps.length) * 100}%` }} />
            </div>
            {steps.map((step, index) => (
              <button
                key={step.n}
                type="button"
                className={`flow-step ${active === index ? "is-active" : ""}`}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                style={{ "--flow-tint": step.tint, transitionDelay: `${index * 55}ms` }}
              >
                <span className="flow-step-index">{step.n}</span>
                <span className="flow-step-copy">
                  <strong>{step.title}</strong>
                  <small>{step.desc}</small>
                </span>
                <span className="flow-step-meta mono">{step.metric}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- Legacy static timeline kept for reference while the flow lab evolves --- */
function LegacyHowItWorks() {
  const steps = [
    { n: "01", title: "Submit Inquiry", desc: "Tell us your vision through a guided onboarding form." },
    { n: "02", title: "Discovery & Approval", desc: "Our PM aligns scope, deliverables, and timelines with you." },
    { n: "03", title: "Development & Reviews", desc: "Our specialist team builds your solution with milestone reviews along the way." },
    { n: "04", title: "Delivery & Support", desc: "Repository, infra, and docs handed over — fully owned by you." },
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="text-center" data-reveal>
          <span className="eyebrow"><span className="dot" /> The flow</span>
          <h2 className="h-1 mt-4">How it <span className="gradient-text">works</span></h2>
          <p className="lead mt-4" style={{ margin: "16px auto 0" }}>
            From a single inquiry to a deployed system in days, not quarters.
          </p>
        </div>

        <div className="mt-16" style={{ position: "relative" }}>
          {/* connecting flow line */}
          <svg
            viewBox="0 0 1200 60"
            preserveAspectRatio="none"
            style={{ position: "absolute", left: "5%", right: "5%", width: "90%", top: 32, height: 60, zIndex: 0, pointerEvents: "none" }}
          >
            <defs>
              <linearGradient id="flowg" x1="0" x2="1">
                <stop offset="0" stopColor="#2F6BFF" stopOpacity="0" />
                <stop offset=".2" stopColor="#4F8BFF" />
                <stop offset=".8" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 30 H1200" stroke="url(#flowg)" strokeWidth="1.5" fill="none" />
            <path d="M0 30 H1200" stroke="#4F8BFF" strokeWidth="1.5" fill="none" className="flow-line" opacity=".7" />
          </svg>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, position: "relative", zIndex: 1 }}>
            {steps.map((s, i) => (
              <div key={s.n} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "linear-gradient(180deg, rgba(15,23,42,1), rgba(8,14,32,1))",
                  border: "1px solid #2a3a5a",
                  display: "grid", placeItems: "center",
                  margin: "0 auto",
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 14, color: "#93C5FD", fontWeight: 600,
                  boxShadow: "0 0 0 6px rgba(5,11,31,1)",
                }}>{s.n}</div>
                <h4 className="h-3 text-center mt-6" style={{ fontSize: 18 }}>{s.title}</h4>
                <p className="text-center mt-2" style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.55, padding: "0 8px" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
LegacyHowItWorks.displayName = "LegacyHowItWorks";

/* --- MSME social proof strip --- */
function TrustedBy() {
  const logos = [
    "Bayan Cargo", "Halo Health", "Kapitbahay", "Iskolar Co-op",
    "Haribon BPO", "Tindahan PH", "Lakbay Tech", "MariCity Logistics",
  ];
  return (
    <section className="section-sm" style={{ paddingTop: 32 }}>
      <div className="container">
        <div className="text-center" data-reveal>
          <div style={{ fontSize: 13, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--text-3)", fontWeight: 600 }}>
            Trusted by Philippine MSMEs scaling fast
          </div>
        </div>
        <div className="mt-8" style={{
          display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 28,
          alignItems: "center", justifyItems: "center",
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}>
          {logos.map(l => (
            <div key={l} style={{
              fontFamily: "Geist Mono, monospace",
              color: "var(--text-3)", fontSize: 14, fontWeight: 500,
              letterSpacing: "-.01em", whiteSpace: "nowrap", opacity: .7,
            }}>{l}</div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Stats band --- */
function Stats() {
  const items = [
    { num: "50+", label: "Enterprise solutions delivered" },
    { num: "100%", label: "Delivery transparency" },
    { num: "12", label: "Person delivery team" },
    { num: "300%", label: "Market demand growth" },
  ];
  return (
    <section className="section-sm">
      <div className="container">
        <Card data-reveal style={{
          padding: "44px 32px",
          background: "linear-gradient(180deg, rgba(20,30,55,.55), rgba(10,18,40,.6))",
          border: "1px solid var(--border)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }}>
            {items.map((s, i) => (
              <div key={i}>
                <div style={{
                  fontSize: "clamp(36px, 4.6vw, 56px)",
                  fontWeight: 800, letterSpacing: "-0.04em",
                  background: "linear-gradient(180deg, #fff, #93C5FD)",
                  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                }}>{s.num}</div>
                <div style={{ color: "var(--text-2)", fontSize: 14, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

/* --- Outcomes / testimonial strip --- */
function Outcomes() {
  const items = [
    {
      quote: "Alphaexplora rebuilt our customer portal in three weeks. We'd been quoted six months by two other firms.",
      name: "Liza R.", role: "COO, Halo Health",
      tint: "#4F8BFF",
    },
    {
      quote: "They don't just write code — they understand the business outcome we needed.",
      name: "Marco T.", role: "CEO, Bayan Cargo",
      tint: "#8B5CF6",
    },
    {
      quote: "From kickoff to production deploy in twelve business days. The repo was clean enough that our team picked it up on day one.",
      name: "Aileen V.", role: "CTO, Tindahan PH",
      tint: "#10B981",
    },
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="text-center" data-reveal>
          <span className="eyebrow"><span className="dot" /> Client outcomes</span>
          <h2 className="h-1 mt-4">Built for <span className="gradient-text">Filipino businesses.</span></h2>
          <p className="lead mt-4" style={{ margin: "16px auto 0" }}>
            Real teams, real timelines, real production deployments.
          </p>
        </div>
        <div className="mt-12" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
          {items.map((it, i) => (
            <Card key={i} hover data-reveal style={{ padding: 28, transitionDelay: `${i * 80}ms` }}>
              <div className="row gap-1" style={{ marginBottom: 14 }}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <IconStar key={k} size={14} style={{ color: "#FBBF24", fill: "#FBBF24" }} />
                ))}
              </div>
              <p style={{ fontSize: 15.5, lineHeight: 1.65, color: "var(--text)", fontWeight: 500 }}>
                “{it.quote}”
              </p>
              <div className="row gap-3" style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${it.tint}, ${it.tint}99)`,
                  display: "grid", placeItems: "center",
                  color: "white", fontWeight: 600, fontSize: 14,
                }}>{it.name.split(" ").map(p => p[0]).join("")}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{it.name}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>{it.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- FAQ --- */
function FAQ() {
  const items = [
    { q: "What does Alphaexplora actually deliver?",
      a: "A working production application — repository, CI/CD, infrastructure, tests, and documentation — owned entirely by you. Every project is led by a real Project Manager from kickoff to handover." },
    { q: "Who is this for?",
      a: "Philippine MSMEs and mid-market companies who want enterprise-grade engineering output without staffing a 20-person team. We specialize in B2B platforms, customer portals, internal tools, and migrations." },
    { q: "How is this different from hiring an agency?",
      a: "Agencies bill quarters; we deliver in weeks. Our specialist team is backed by intelligent automation, so you get senior-level architecture decisions and faster turnaround on the build." },
    { q: "What happens to the source code?",
      a: "It's yours. We push to your GitHub organization from day one. You can fork, leave, or take it in-house at any milestone — no lock-in." },
    { q: "How do you handle security and compliance?",
      a: "All builds run in isolated environments. We're SOC2-aligned and follow Philippine Data Privacy Act guidelines. Enterprise tier adds custom DPAs and on-prem deployment." },
    { q: "Can we add our own engineers to a project?",
      a: "Yes. Every plan supports human collaborators. Your engineers get full repo access from day one and review PRs alongside our team." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 880 }}>
        <div className="text-center" data-reveal>
          <span className="eyebrow"><span className="dot" /> FAQ</span>
          <h2 className="h-1 mt-4">Common questions</h2>
        </div>
        <div className="mt-12 flex-col gap-3">
          {items.map((it, i) => (
            <Card key={i} data-reveal style={{ padding: 0, overflow: "hidden", transitionDelay: `${i * 60}ms` }}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                style={{
                  width: "100%", textAlign: "left", background: "none", border: 0,
                  padding: "20px 22px", color: "white", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: "inherit", fontSize: 16, fontWeight: 600,
                }}
              >
                <span style={{ paddingRight: 16 }}>{it.q}</span>
                <IconChevronDown
                  size={18}
                  style={{
                    color: "var(--text-2)", flexShrink: 0,
                    transform: open === i ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform .25s ease",
                  }}
                />
              </button>
              <div style={{
                maxHeight: open === i ? 240 : 0,
                overflow: "hidden",
                transition: "max-height .3s ease",
              }}>
                <div style={{ padding: "0 22px 22px", color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.65 }}>
                  {it.a}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Page composition --- */
function HomePage({ onSubmittedForm, scrollTarget, onScrolled }) {
  useReveal();
  useEffect(() => {
    if (scrollTarget) {
      // small delay so refs render
      const id = setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (onScrolled) onScrolled();
      }, 120);
      return () => clearTimeout(id);
    }
  }, [onScrolled, scrollTarget]);

  return (
    <div data-screen-label="01 Landing">
      <Hero onCta={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} />
      <InteractiveDeliveryExperience />
      <Features />
      <HowItWorks />
      <TrustedBy />
      <Stats />
      <Outcomes />
      <FAQ />
      <ContactCloser onSubmitted={onSubmittedForm} />
    </div>
  );
}

export function MarketingHomeView() {
  const router = useRouter();
  const [scrollTo, setScrollTo] = useState(null);

  const navigate = (route, scrollId) => {
    if (route === "home" && scrollId) {
      setScrollTo(scrollId);
      return;
    }
    if (route === "home") {
      router.push("/");
      return;
    }
    router.push(`/${route}`);
  };

  return (
    <>
      <div className="app-bg" />
      <TopNav route="home" onNavigate={navigate} />
      <HomePage
        onSubmittedForm={() => router.push("/onboarding/submitted")}
        scrollTarget={scrollTo}
        onScrolled={() => setScrollTo(null)}
      />
      <Footer onNavigate={navigate} />
    </>
  );
}
