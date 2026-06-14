// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, Field, Input, Logo, Textarea } from "@/shared/components/ui";
import { createDevFlowInquiry } from "@/shared/api/devflow-api";
import {
  IconArrowRight,
  IconCheckCircle,
  IconGitHub,
  IconLinkedIn,
  IconMail,
  IconMapPin,
  IconPhone,
  IconTwitter,
} from "@/shared/components/icons";
/* ---------- Reveal-on-scroll hook ----------
   Watches for [data-reveal] nodes added at any time and toggles .is-visible
   when they enter the viewport. Falls back to immediate-visible for nodes
   already past the fold. */
function useReveal() {
  useEffect(() => {
    let cancelled = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

    const observe = (el) => {
      if (!el || el.__reveal_obs) return;
      el.__reveal_obs = true;
      // If already in view (top of page), reveal immediately
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("is-visible");
        return;
      }
      io.observe(el);
    };

    const scan = () => {
      if (cancelled) return;
      document.querySelectorAll("[data-reveal]").forEach(observe);
    };

    // Initial scan + a couple of rAF passes to catch later-mounting children
    scan();
    requestAnimationFrame(() => { scan(); requestAnimationFrame(scan); });

    // Watch for new nodes being added (e.g. when pages mount async)
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    // Safety fallback: after 1.5s, force-reveal anything still hidden
    const safety = setTimeout(() => {
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => {
        el.classList.add("is-visible");
      });
    }, 1500);

    return () => {
      cancelled = true;
      io.disconnect();
      mo.disconnect();
      clearTimeout(safety);
    };
  }, []);
}

/* ---------- Top nav ---------- */
function TopNav({ route, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { id: "platform", label: "Platform" },
    { id: "how-it-works", label: "How It Works" },
    { id: "pricing", label: "Pricing" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];
  return (
    <nav className={"topnav" + (scrolled ? " scrolled" : "")}>
      <div className="topnav-inner">
        <a className="brand" onClick={() => onNavigate("home")} style={{ cursor: "pointer" }}>
          <Logo size={24} />
        </a>
        <div className="links">
          {links.map(l => (
            <a key={l.id}
              className={"nlink" + (route === l.id ? " active" : "")}
              onClick={() => l.id === "contact" ? onNavigate("home", "contact") : onNavigate(l.id)}
            >{l.label}</a>
          ))}
        </div>
        <div className="row gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/client/sign-in"}>Sign In</Button>
          <Button variant="primary" size="sm" iconRight={<IconArrowRight />} onClick={() => onNavigate("home", "contact")}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}

/* ---------- Contact / "Ready to transform" closer ---------- */
function ContactCloser({ onSubmitted }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", company: "", phone: "", details: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.company.trim()) errs.company = "Company is required";
    if (!form.details.trim() || form.details.length < 10) errs.details = "Please share a few details (min 10 characters)";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const inquiry = await createDevFlowInquiry({
        companyName: form.company.trim(),
        contactName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        brief: form.details.trim(),
        stackKey: "nextjs-nestjs-supabase",
      });
      onSubmitted && onSubmitted(inquiry);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Unable to submit inquiry right now.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="text-center" data-reveal>
          <span className="eyebrow"><span className="dot" /> Get in touch</span>
          <h2 className="h-1 mt-4">Ready to <span className="gradient-text">transform</span> your enterprise?</h2>
          <p className="lead mt-4" style={{ margin: "16px auto 0" }}>
            Let's discuss how Alphaexplora can accelerate your digital transformation
            and drive measurable business outcomes.
          </p>
        </div>

        <div className="mt-12" style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 32 }}>
          {/* Left: contact info */}
          <div data-reveal>
            <h3 className="h-3 mb-6">Get in Touch</h3>

            <div className="flex-col gap-4">
              <ContactRow
                icon={<IconMail size={18} />}
                tint="rgba(47,107,255,.15)" iconColor="#93C5FD"
                label="Email" value="inquire@alphaexplora.com" href="mailto:inquire@alphaexplora.com"
              />
              <ContactRow
                icon={<IconPhone size={18} />}
                tint="rgba(139,92,246,.15)" iconColor="#C4B5FD"
                label="Phone"
                value={<>+63 2 70060042 <span style={{ color: "var(--text-3)" }}>·</span> +63 915 8101010</>}
              />
              <ContactRow
                icon={<IconMapPin size={18} />}
                tint="rgba(16,185,129,.15)" iconColor="#6EE7B7"
                label="Headquarters"
                value="#6 T. Bugallon Street, Marikina Heights, Marikina City, Philippines 1810"
              />
            </div>

            <div className="mt-8">
              <div className="field-label" style={{ marginBottom: 12 }}>Connect with us</div>
              <div className="row gap-3">
                <SocialBtn label="LinkedIn"><IconLinkedIn size={17} /></SocialBtn>
                <SocialBtn label="Twitter"><IconTwitter size={17} /></SocialBtn>
                <SocialBtn label="GitHub"><IconGitHub size={17} /></SocialBtn>
              </div>
            </div>

            <Card style={{ padding: 20, marginTop: 28 }}>
              <div className="row gap-3" style={{ alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(16,185,129,.12)", color: "#6EE7B7",
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <IconCheckCircle size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Project Manager review within 1–2 days</div>
                  <div style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.55 }}>
                    Every inquiry is read by a real PM. We'll align scope, send credentials, and onboard your team.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: form */}
          <Card data-reveal style={{ padding: 28, background: "linear-gradient(180deg, rgba(8,14,32,.85), rgba(5,11,31,.95))" }}>
            <h3 className="h-3 mb-2">Client Onboarding</h3>
            <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 22 }}>
              Tell us about your project. Our PM will reach out shortly.
            </p>
            <form onSubmit={submit} className="flex-col gap-4" noValidate>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="First Name" error={errors.firstName}>
                  <Input value={form.firstName} onChange={set("firstName")} placeholder="Juan" autoComplete="given-name" />
                </Field>
                <Field label="Last Name" error={errors.lastName}>
                  <Input value={form.lastName} onChange={set("lastName")} placeholder="dela Cruz" autoComplete="family-name" />
                </Field>
              </div>
              <Field label="Work Email" error={errors.email}>
                <Input type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" autoComplete="email" />
              </Field>
              <Field label="Company" error={errors.company}>
                <Input value={form.company} onChange={set("company")} placeholder="Your organization" autoComplete="organization" />
              </Field>
              <Field label="Contact Number" helper="Optional — we'll reach out by email if blank">
                <Input value={form.phone} onChange={set("phone")} placeholder="+63 ___ ___ ____" autoComplete="tel" />
              </Field>
              <Field label="Inquiry Details" error={errors.details}>
                <Textarea
                  value={form.details}
                  onChange={set("details")}
                  rows={5}
                  placeholder="Tell us about your transformation goals, current stack, timeline…"
                />
              </Field>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
                style={{
                  width: "100%", marginTop: 8,
                  letterSpacing: ".12em", fontWeight: 700,
                  textTransform: "uppercase", fontSize: 13.5,
                }}
              >
                {submitting ? "Submitting..." : "Start Your Transformation"}
              </button>
              {errors.form && <div style={{ fontSize: 12.5, color: "#FCA5A5", textAlign: "center" }}>{errors.form}</div>}
              <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>
                By submitting you agree to our terms & privacy policy.
              </div>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ icon, tint, iconColor, label, value, href }) {
  const inner = (
    <div className="row gap-4" style={{ alignItems: "flex-start" }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: tint, color: iconColor,
        display: "grid", placeItems: "center", flexShrink: 0,
      }}>{icon}</div>
      <div style={{ paddingTop: 2 }}>
        <div className="field-label" style={{ fontSize: 12.5 }}>{label}</div>
        <div style={{ fontSize: 15, marginTop: 2, lineHeight: 1.5 }}>{value}</div>
      </div>
    </div>
  );
  return href
    ? <a href={href} style={{ display: "block" }}>{inner}</a>
    : inner;
}

function SocialBtn({ children, label }) {
  return (
    <button
      title={label}
      className="btn btn-secondary btn-sm"
      style={{ width: 40, height: 40, padding: 0, borderRadius: 10 }}
    >{children}</button>
  );
}

/* ---------- Footer ---------- */
function Footer({ onNavigate }) {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Platform", route: "platform", desc: "What Alphaexplora delivers" },
        { label: "How It Works", route: "how-it-works", desc: "The delivery lifecycle" },
        { label: "Pricing", route: "pricing", desc: "Project and enterprise plans" },
        { label: "Changelog", route: "resources/changelog", desc: "Product updates placeholder" },
        { label: "Roadmap", route: "resources/roadmap", desc: "What is coming next" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", route: "about", desc: "Mission and team" },
        { label: "Customers", route: "resources/customers", desc: "Example customer stories" },
        { label: "Careers", route: "resources/careers", desc: "Future hiring information" },
        { label: "Press", route: "resources/press", desc: "Media kit placeholder" },
        { label: "Partners", route: "resources/partners", desc: "Integration partners" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", route: "resources/documentation", desc: "Delivery docs placeholder" },
        { label: "API Reference", route: "resources/api-reference", desc: "Backend API overview" },
        { label: "Guides", route: "resources/guides", desc: "Implementation guides" },
        { label: "Community", route: "resources/community", desc: "Community channels" },
        { label: "Status", route: "resources/status", desc: "System status placeholder" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of Service", route: "resources/terms-of-service", desc: "Terms placeholder" },
        { label: "Privacy Policy", route: "resources/privacy-policy", desc: "Privacy placeholder" },
        { label: "Security", route: "resources/security", desc: "Security practices" },
        { label: "DPA", route: "resources/dpa", desc: "Data processing addendum" },
        { label: "Cookies", route: "resources/cookies", desc: "Cookie policy" },
      ],
    },
  ];
  const handleFooterLink = (link) => {
    if (link.route === "contact") onNavigate("home", "contact");
    else onNavigate(link.route);
  };
  return (
    <footer className="footer">
      <div className="container-wide">
        <div className="footer-grid">
          <div>
            <Logo />
            <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginTop: 18, maxWidth: 280 }}>
              A Philippine boutique IT consultancy delivering enterprise software for MSMEs and
              mid-market companies \u2014 fast, transparent, and fully owned by you.
            </p>
            <div className="row gap-2 mt-6">
              <SocialBtn label="LinkedIn"><IconLinkedIn size={15} /></SocialBtn>
              <SocialBtn label="Twitter"><IconTwitter size={15} /></SocialBtn>
              <SocialBtn label="GitHub"><IconGitHub size={15} /></SocialBtn>
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.links.map(link => (
                  <li key={link.label}>
                    <button
                      type="button"
                      className="footer-link"
                      title={link.desc}
                      onClick={() => handleFooterLink(link)}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div>© 2026 Alphaexplora IT Services. All rights reserved.</div>
          <div className="row gap-4">
            <span className="row gap-2"><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)" }} /> All systems normal</span>
            <span style={{ color: "var(--text-4)" }}>Powered by intelligent automation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { TopNav, ContactCloser, Footer, useReveal };
