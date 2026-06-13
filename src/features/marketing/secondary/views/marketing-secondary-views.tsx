// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { ContactCloser, Footer, TopNav, useReveal } from "@/shared/components/layout";
import {
  IconActivity,
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconCheckCircle,
  IconClipboard,
  IconCloud,
  IconCode,
  IconDatabase,
  IconFileText,
  IconGitBranch,
  IconHeadphones,
  IconHome,
  IconLayout,
  IconMessageCircle,
  IconRocket,
  IconShield,
  IconSmartphone,
} from "@/shared/components/icons";

function useMarketingNav(current) {
  const router = useRouter();
  const navigate = (route, scrollId) => {
    if (route === "home") {
      if (scrollId) router.push(`/#${scrollId}`);
      else router.push("/");
      return;
    }
    router.push(`/${route}`);
  };
  const submitted = () => router.push("/onboarding/submitted");
  return { navigate, submitted, current };
}

function MarketingShell({ route, children }) {
  const { navigate } = useMarketingNav(route);
  return (
    <>
      <div className="app-bg" />
      <TopNav route={route} onNavigate={navigate} />
      {children}
      <Footer onNavigate={navigate} />
    </>
  );
}

function PageHero({ eyebrow, title, gradientWord, subtitle }) {
  const [a, b] = gradientWord ? title.split(gradientWord) : [title, ""];
  return (
    <section style={{ paddingTop: 96, paddingBottom: 56, position: "relative" }}>
      <div className="hero-glow" style={{ top: "30%", opacity: .55 }} />
      <div className="container text-center" style={{ position: "relative", maxWidth: 920 }}>
        <span className="eyebrow fade-up"><span className="dot" /> {eyebrow}</span>
        <h1 className="h-1 mt-6 fade-up" style={{ animationDelay: ".1s", fontSize: "clamp(40px, 5.5vw, 72px)" }}>
          {a}
          {gradientWord && <span className="gradient-text">{gradientWord}</span>}
          {b}
        </h1>
        <p className="lead mt-6 fade-up" style={{ margin: "20px auto 0", animationDelay: ".2s", fontSize: 18 }}>{subtitle}</p>
      </div>
    </section>
  );
}

function SecondaryContactCloser() {
  const { submitted } = useMarketingNav("home");
  return <ContactCloser onSubmitted={submitted} />;
}

export function PlatformView() {
  useReveal();
  const services = [
    { icon: <IconLayout size={22} />, color: "#93C5FD", tint: "rgba(47,107,255,.15)", title: "Custom Web Applications", desc: "B2B portals, customer dashboards, admin tools, and internal apps built on modern stacks like Next.js, FastAPI, and Postgres." },
    { icon: <IconSmartphone size={22} />, color: "#F9C29A", tint: "rgba(249,115,22,.15)", title: "Mobile Applications", desc: "iOS and Android apps using Expo, React Native, or Flutter with crash reporting and analytics." },
    { icon: <IconDatabase size={22} />, color: "#5EEAD4", tint: "rgba(20,184,166,.15)", title: "Database & Migrations", desc: "Schema design, ER diagrams, migrations, and seed data for Postgres, MySQL, SQLite, or document stores." },
    { icon: <IconGitBranch size={22} />, color: "#C4B5FD", tint: "rgba(139,92,246,.15)", title: "Repo & CI/CD Setup", desc: "GitHub org provisioning, branch protection, PR templates, GitHub Actions, and preview environments." },
    { icon: <IconCloud size={22} />, color: "#6EE7B7", tint: "rgba(16,185,129,.15)", title: "Cloud Infrastructure", desc: "Deploy to AWS, GCP, or Azure with monitoring, alerting, and operational runbooks." },
    { icon: <IconShield size={22} />, color: "#FCA5A5", tint: "rgba(239,68,68,.15)", title: "Security & Compliance", desc: "Automated tests, contract testing, security scans, and Philippine Data Privacy Act alignment." },
  ];
  return (
    <MarketingShell route="platform">
      <div data-screen-label="02 Services">
        <PageHero eyebrow="What we deliver" title="Enterprise software, delivered in days." gradientWord="in days." subtitle="From web platforms to mobile apps to internal tools - full-stack delivery with the repo, infrastructure, and documentation owned by you." />
        <section className="container" style={{ paddingBottom: 64 }}>
          <Card data-reveal style={{ padding: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 32, alignItems: "center" }}>
              <div>
                <Badge tone="blue">What you get</Badge>
                <h2 className="h-2 mt-4">A complete production package, on day one.</h2>
                <p className="mt-4" style={{ color: "var(--text-2)", fontSize: 15.5, lineHeight: 1.65 }}>Every project ends with the same handover: a working application, a clean repository, deployed infrastructure, and documentation your team can operate.</p>
                <div className="row gap-3 mt-6"><Button variant="primary" iconRight={<IconArrowRight />}>Start a project</Button><Button variant="secondary">See sample handover</Button></div>
              </div>
              <DeliverablesGrid />
            </div>
          </Card>
        </section>
        <section className="section">
          <div className="container">
            <div className="text-center" data-reveal><span className="eyebrow"><span className="dot" /> Capabilities</span><h2 className="h-1 mt-4">Everything an enterprise <span className="gradient-text">build</span> needs.</h2></div>
            <div className="mt-12" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
              {services.map((service) => <Card key={service.title} hover data-reveal style={{ padding: 24 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: service.tint, color: service.color, display: "grid", placeItems: "center", marginBottom: 16 }}>{service.icon}</div><h3 className="h-3" style={{ marginBottom: 8 }}>{service.title}</h3><p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{service.desc}</p></Card>)}
            </div>
          </div>
        </section>
        <section className="section-sm">
          <div className="container"><Card data-reveal style={{ padding: 32 }}><div className="row" style={{ justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 16 }}><h3 className="h-3">Stacks we build on</h3><span className="text-3" style={{ fontSize: 13 }}>Pick one, swap any time.</span></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>{["Frontend - Next.js, React, Vue", "Backend - FastAPI, NestJS, Go", "Database - Postgres, MySQL, MongoDB", "Mobile - Expo, Flutter, Swift"].map((stack) => <div key={stack} style={{ borderLeft: "2px solid #2a3a5a", paddingLeft: 14, fontSize: 14 }}>{stack}</div>)}</div></Card></div>
        </section>
        <SecondaryContactCloser />
      </div>
    </MarketingShell>
  );
}

function DeliverablesGrid() {
  const items = [
    { icon: <IconGitBranch size={18} />, label: "GitHub repository", sub: "Yours from day one", tint: "#4F8BFF" },
    { icon: <IconCloud size={18} />, label: "Production deployment", sub: "AWS, GCP, or Azure", tint: "#8B5CF6" },
    { icon: <IconActivity size={18} />, label: "CI/CD pipeline", sub: "Tests, previews, gates", tint: "#A78BFA" },
    { icon: <IconShield size={18} />, label: "Security review", sub: "DPA-aligned", tint: "#EF4444" },
    { icon: <IconFileText size={18} />, label: "Documentation", sub: "Runbooks + API docs", tint: "#10B981" },
    { icon: <IconHeadphones size={18} />, label: "Post-launch support", sub: "1-3 months included", tint: "#14B8A6" },
  ];
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>{items.map((item) => <div key={item.label} style={{ padding: 18, borderRadius: 14, background: "rgba(8,14,32,.6)", border: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 14 }}><div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.tint}22`, color: item.tint, display: "grid", placeItems: "center", flexShrink: 0, border: `1px solid ${item.tint}44` }}>{item.icon}</div><div><div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div><div style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 2 }}>{item.sub}</div></div></div>)}</div>;
}

export function HowItWorksView() {
  useReveal();
  const steps = [
    { n: "01", color: "#4F8BFF", title: "Submit Inquiry", lede: "Tell us your vision.", desc: "Share your idea through our guided onboarding form.", timeframe: "Day 1", icon: <IconClipboard size={22} />, deliverables: ["Submitted inquiry", "Confirmation email", "PM assignment"] },
    { n: "02", color: "#8B5CF6", title: "Discovery & Approval", lede: "We listen, scope, and align.", desc: "Your PM schedules discovery, refines scope, and confirms outcomes.", timeframe: "Day 1-2", icon: <IconMessageCircle size={22} />, deliverables: ["Project brief", "Timeline", "Cost estimate"] },
    { n: "03", color: "#A855F7", title: "Development", lede: "Our team builds in parallel.", desc: "Specialists design, implement, and test against the approved spec.", timeframe: "Days 3-10", icon: <IconCode size={22} />, deliverables: ["Working code", "Preview environment", "Daily updates"] },
    { n: "04", color: "#3B82F6", title: "Reviews & Quality Gates", lede: "We validate every step.", desc: "Milestone reviews, scans, contract tests, and regression checks.", timeframe: "Day 11", icon: <IconCheckCircle size={22} />, deliverables: ["Security report", "QA sign-off"] },
    { n: "05", color: "#10B981", title: "Delivery & Support", lede: "Production-ready and owned by you.", desc: "We deploy to production, hand over docs, and support the launch.", timeframe: "Day 12+", icon: <IconRocket size={22} />, deliverables: ["Production deploy", "Runbooks", "Support"] },
  ];
  return (
    <MarketingShell route="how-it-works">
      <div data-screen-label="03 How It Works">
        <PageHero eyebrow="How we work" title="From inquiry to production, in twelve days." gradientWord="twelve days." subtitle="A transparent, milestone-driven process. Every project follows the same five steps with you in the loop at every gate." />
        <section className="container" style={{ paddingBottom: 32 }}><Card data-reveal style={{ padding: 28 }}><div className="row" style={{ justifyContent: "space-between", marginBottom: 22 }}><div><Badge tone="blue">A typical engagement</Badge><h3 className="h-3 mt-2">12 business days, end-to-end</h3></div><span className="text-3" style={{ fontSize: 13 }}>Custom timelines available for enterprise</span></div><div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 8 }}>{steps.map((step, index) => <div key={step.n} style={{ textAlign: "center" }}><div style={{ width: 54, height: 54, borderRadius: "50%", background: `linear-gradient(135deg, ${step.color}, ${step.color}aa)`, color: "white", display: "grid", placeItems: "center", margin: "0 auto", fontWeight: 700, fontSize: 18 }}>{index + 1}</div><div style={{ fontWeight: 600, fontSize: 14, marginTop: 12 }}>{step.title}</div><div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{step.timeframe}</div></div>)}</div></Card></section>
        <section className="section-sm"><div className="container"><div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{steps.map((step) => <Card key={step.n} data-reveal style={{ padding: 32 }}><div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 28, alignItems: "flex-start" }}><div style={{ width: 96, height: 96, borderRadius: 20, background: `${step.color}22`, border: `1px solid ${step.color}55`, color: step.color, display: "grid", placeItems: "center" }}>{step.icon}</div><div><div className="row gap-3" style={{ alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}><h3 className="h-3">{step.title}</h3><Badge tone="blue">{step.timeframe}</Badge></div><p style={{ fontSize: 16, fontWeight: 500, color: "white", marginBottom: 8 }}>{step.lede}</p><p style={{ color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.65 }}>{step.desc}</p><div style={{ marginTop: 22, paddingTop: 22, borderTop: "1px solid var(--border)" }}><div className="field-label" style={{ marginBottom: 10 }}>You receive</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{step.deliverables.map((item) => <div key={item} className="row gap-2" style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(8,14,32,.6)", border: "1px solid var(--border)", fontSize: 13 }}><IconCheck size={13} style={{ color: step.color }} />{item}</div>)}</div></div></div></div></Card>)}</div></div></section>
        <SecondaryContactCloser />
      </div>
    </MarketingShell>
  );
}

export function PricingView() {
  useReveal();
  const tiers = [
    { name: "Starter", price: "PHP 180k", per: "per project", tagline: "For MSMEs validating one idea fast.", cta: "Start a project", features: ["1 application build", "Web or mobile", "GitHub repo + CI/CD setup", "1 month post-launch support"] },
    { name: "Growth", featured: true, price: "PHP 520k", per: "per project", tagline: "For teams scaling a real product.", cta: "Talk to sales", features: ["Up to 3 application builds", "Web + mobile delivery", "Preview environments", "Dedicated PM", "Custom integrations"] },
    { name: "Enterprise", price: "Custom", per: "annual contract", tagline: "For complex orgs and compliance-heavy work.", cta: "Contact us", features: ["Unlimited application builds", "VPC deployment", "DPA and audit logs", "Dedicated delivery team"] },
  ];
  return (
    <MarketingShell route="pricing">
      <div data-screen-label="04 Pricing">
        <PageHero eyebrow="Pricing" title="Pay for what you ship." gradientWord="ship." subtitle="Predictable per-project pricing for MSMEs. Custom annual contracts for enterprises. No hidden fees, no surprise bills." />
        <section className="container" style={{ paddingBottom: 32 }}><div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>{tiers.map((tier) => <Card key={tier.name} hover style={{ padding: 32, border: tier.featured ? "1px solid rgba(79,139,255,.55)" : "1px solid var(--border)", background: tier.featured ? "linear-gradient(180deg, rgba(47,107,255,.10), rgba(139,92,246,.06))" : undefined, position: "relative" }}>{tier.featured && <div style={{ position: "absolute", top: -12, left: 28, padding: "4px 12px", borderRadius: 999, background: "linear-gradient(135deg, #2F6BFF, #8B5CF6)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>Most popular</div>}<div style={{ fontWeight: 600, fontSize: 16, color: tier.featured ? "#BAD1FF" : "var(--text-2)" }}>{tier.name}</div><div className="row" style={{ alignItems: "baseline", gap: 8, marginTop: 12 }}><div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em" }}>{tier.price}</div><div style={{ color: "var(--text-3)", fontSize: 13 }}>{tier.per}</div></div><p style={{ color: "var(--text-2)", fontSize: 14, marginTop: 8 }}>{tier.tagline}</p><Button variant={tier.featured ? "primary" : "secondary"} style={{ width: "100%", marginTop: 24 }} iconRight={<IconArrowRight />}>{tier.cta}</Button><div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} /><ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>{tier.features.map((item) => <li key={item} className="row gap-3" style={{ fontSize: 14, alignItems: "flex-start" }}><IconCheck size={15} style={{ color: tier.featured ? "#93C5FD" : "#6EE7B7", flexShrink: 0, marginTop: 2 }} /><span>{item}</span></li>)}</ul></Card>)}</div></section>
        <section className="section"><div className="container"><Card data-reveal style={{ padding: 32 }}><div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}><div><h3 className="h-3">Need help choosing?</h3><p className="text-2 mt-2" style={{ fontSize: 14 }}>Book a 30-min scoping call. We will recommend a tier and ballpark a timeline.</p></div><Button variant="primary" iconRight={<IconArrowRight />}>Book a scoping call</Button></div></Card></div></section>
        <SecondaryContactCloser />
      </div>
    </MarketingShell>
  );
}

export function AboutView() {
  useReveal();
  const values = [
    { title: "Ownership, not lock-in", desc: "Your code lives in your repo from day one." },
    { title: "Real engineers, real partnership", desc: "Every project has a human PM, architect, and reviewer." },
    { title: "Built in the Philippines", desc: "Headquartered in Marikina and focused on MSME growth." },
  ];
  const team = [
    ["RM", "Founder - CEO", "#4F8BFF"], ["AC", "Head of Delivery", "#10B981"], ["JT", "Lead Engineer", "#A855F7"], ["MV", "Head of Engineering", "#F97316"], ["DS", "Design Lead", "#3B82F6"], ["GP", "Head of Security", "#EF4444"],
  ];
  return (
    <MarketingShell route="about">
      <div data-screen-label="05 About">
        <PageHero eyebrow="About Alphaexplora" title="A boutique IT consultancy on a mission to scale Filipino MSMEs." gradientWord="Filipino MSMEs." subtitle="We are a Marikina-based enterprise IT services firm helping Philippine businesses ship production software fast, transparently, and on their terms." />
        <section className="container" style={{ paddingBottom: 64 }}><Card data-reveal style={{ padding: 40, background: "linear-gradient(135deg, rgba(47,107,255,.10), rgba(139,92,246,.06))", border: "1px solid rgba(79,139,255,.30)" }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 32, alignItems: "center" }}><div><Badge tone="purple">Our mission</Badge><h2 className="h-2 mt-4">Make enterprise-grade engineering accessible to every Philippine MSME.</h2></div><p style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.7 }}>The companies that drive Philippine business deserve the same engineering output as larger enterprises. We pair senior PH engineers with intelligent automation so delivery is fast and stewarded.</p></div></Card></section>
        <section className="section-sm"><div className="container"><div className="text-center mb-8" data-reveal><h3 className="h-2">What we believe</h3></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>{values.map((value) => <Card key={value.title} data-reveal style={{ padding: 28 }}><div style={{ width: 8, height: 28, borderRadius: 4, background: "linear-gradient(180deg, #2F6BFF, #8B5CF6)", marginBottom: 16 }} /><h4 className="h-3" style={{ marginBottom: 8 }}>{value.title}</h4><p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{value.desc}</p></Card>)}</div></div></section>
        <section className="section"><div className="container"><div className="text-center mb-8" data-reveal><span className="eyebrow"><span className="dot" /> The team</span><h3 className="h-2 mt-4">A 12-person delivery team and growing.</h3></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>{team.map(([initials, role, tint]) => <Card key={initials} hover data-reveal style={{ padding: 22 }}><div className="row gap-4"><div style={{ width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg, ${tint}, ${tint}99)`, display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{initials}</div><div><div style={{ fontWeight: 600 }}>{role}</div><p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.55, marginTop: 4 }}>Senior delivery specialist focused on transparent production software.</p></div></div></Card>)}</div></div></section>
        <SecondaryContactCloser />
      </div>
    </MarketingShell>
  );
}

export function SubmittedView() {
  const { navigate } = useMarketingNav("submitted");
  return (
    <MarketingShell route="submitted">
      <div data-screen-label="06 Submitted" style={{ paddingTop: 80, paddingBottom: 80, minHeight: "calc(100vh - 200px)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <Card style={{ padding: 48, textAlign: "center", background: "linear-gradient(180deg, rgba(15,23,42,.95), rgba(10,18,40,.98))", position: "relative", overflow: "hidden" }}>
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #14B8A6)", display: "grid", placeItems: "center", boxShadow: "0 12px 40px rgba(16,185,129,.4)", margin: "0 auto 24px" }}><IconCheck size={42} stroke={3} style={{ color: "white" }} /></div>
            <h1 className="h-1" style={{ fontSize: "clamp(32px, 4vw, 44px)", marginBottom: 14 }}>Your inquiry has been received.</h1>
            <p className="lead" style={{ margin: "0 auto", maxWidth: 560 }}>Our Project Manager will review your request and reach out within <strong style={{ color: "white" }}>1-2 business days</strong>. Once approved, you will receive account credentials and access to your client dashboard.</p>
            <div style={{ marginTop: 40, padding: 24, background: "rgba(8,14,32,.5)", border: "1px solid var(--border)", borderRadius: 14 }}>
              <div className="field-label" style={{ marginBottom: 16, textAlign: "left" }}>What happens next</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>{["Review", "Approval Email", "Sign In"].map((step, index) => <div key={step} style={{ textAlign: "center" }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: index === 0 ? "linear-gradient(135deg, #4F8BFF, #4F8BFFcc)" : "rgba(15,23,42,.95)", border: "1px solid #4F8BFF66", color: "white", display: "grid", placeItems: "center", margin: "0 auto", fontWeight: 600, fontSize: 13 }}>{index + 1}</div><div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>{step}</div></div>)}</div>
            </div>
            <div className="row gap-3" style={{ justifyContent: "center", marginTop: 32 }}><Button variant="ghost" onClick={() => navigate("home")} icon={<IconHome size={16} />}>Back to home</Button><Button variant="secondary" iconRight={<IconArrowUpRight size={15} />}>Read the docs</Button></div>
          </Card>
        </div>
      </div>
    </MarketingShell>
  );
}

