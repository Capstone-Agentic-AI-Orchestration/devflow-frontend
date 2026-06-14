// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Field, Input, Logo } from "@/shared/components/ui";
import { IconArrowLeft, IconArrowRight, IconCheck, IconEye, IconEyeOff, IconMail, IconShield } from "@/shared/components/icons";
import { useAuth } from "@/shared/auth/auth-provider";
import { loginPathForRole } from "@/shared/auth/role-routing";
import { getDevFlowClientInviteStatus } from "@/shared/api/devflow-api";

const BRAND_HEADINGS = {
  "sign-in": <>Welcome back to <span className="gradient-text">Alphaexplora.</span></>,
  "sign-up": <>One last step to start your <span className="gradient-text">engagement.</span></>,
  forgot: <>No worries, we'll get you <span className="gradient-text">back in.</span></>,
  reset: <>Choose a new <span className="gradient-text">password.</span></>,
};

export function ClientAuthView({ mode = "sign-in" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  return (
    <div className="auth-shell" data-screen-label={`Client Auth - ${mode}`}>
      <div className="auth-shell-main">
        <AuthBrandPanel
          heading={BRAND_HEADINGS[mode]}
          sub="Track your engagement, message your project manager, review documents, and approve deliverables in one secure place."
        />
        <main className="auth-form-side">
          <button type="button" className="auth-back-home" onClick={() => router.push("/")}>
            <IconArrowLeft size={15} /> Back to home
          </button>

          <div className="auth-form-card">
            {mode === "sign-in" && <SignInForm onDone={(role) => router.push(loginPathForRole(role, nextPath))} />}
            {mode === "sign-up" && <SignUpForm initialEmail={searchParams.get("email") || ""} onDone={(role) => router.push(loginPathForRole(role, nextPath))} />}
            {mode === "forgot" && <ForgotForm />}
            {mode === "reset" && <ResetForm onDone={() => router.push("/client/sign-in")} />}
          </div>

          <div className="auth-form-footnote">
            Need help signing in? <button type="button" className="auth-link auth-link-btn">Contact support</button>
          </div>
        </main>
      </div>

      <div className="auth-shell-footer">
        <div>© 2026 Alphaexplora IT Services. All rights reserved.</div>
        <div className="row gap-4">
          <span className="row gap-2"><span className="dot" /> All systems normal</span>
          <div className="row gap-3"><span>Terms</span><span>Privacy</span><span>Help</span></div>
        </div>
      </div>
    </div>
  );
}

const FLOW_STAGES = [
  { label: "Inquiry", tint: "#4F8BFF" },
  { label: "Scope", tint: "#14B8A6" },
  { label: "Build", tint: "#F59E0B" },
  { label: "Review", tint: "#10B981" },
  { label: "Handoff", tint: "#93C5FD" },
];

function AuthFlowStrip() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((index) => (index + 1) % FLOW_STAGES.length), 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="auth-flow-strip">
      <div className="auth-flow-line"><span style={{ width: `${(active / (FLOW_STAGES.length - 1)) * 100}%` }} /></div>
      <div className="auth-flow-nodes">
        {FLOW_STAGES.map((stage, index) => {
          const done = index < active;
          const isActive = index === active;
          return (
            <div className="auth-flow-node" key={stage.label}>
              <span
                className={`auth-flow-dot${done ? " is-done" : ""}${isActive ? " is-active" : ""}`}
                style={{ "--tint": stage.tint, "--tint-soft": `${stage.tint}aa`, "--tint-glow": `${stage.tint}22` }}
              >
                {done ? <IconCheck size={11} stroke={3} /> : index + 1}
              </span>
              <small className={done || isActive ? "is-on" : ""}>{stage.label}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuthBrandPanel({ heading, sub }) {
  const router = useRouter();
  return (
    <aside className="auth-brand">
      <div className="auth-brand-orb auth-brand-orb--1" />
      <div className="auth-brand-orb auth-brand-orb--2" />
      <div className="auth-brand-orb auth-brand-orb--3" />
      <button type="button" className="auth-brand-logo" onClick={() => router.push("/")} aria-label="Back to home">
        <Logo />
      </button>
      <div className="auth-brand-content">
        <span className="eyebrow auth-brand-eyebrow"><span className="dot" /> Enterprise IT Solutions, Intelligently Delivered</span>
        <h2 className="auth-brand-heading">{heading}</h2>
        <p className="auth-brand-sub">{sub}</p>
        <AuthFlowStrip />
        <div className="auth-quote">
          <div className="auth-quote-text">From kickoff to production deploy in twelve business days.</div>
          <div className="auth-quote-author">
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#10B981,#14B8A6)", display: "grid", placeItems: "center", color: "white", fontWeight: 600, fontSize: 14, flexShrink: 0 }}>AV</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Aileen V.</div>
              <div style={{ color: "var(--text-3)", fontSize: 12 }}>CTO, Tindahan PH</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SignInForm({ onDone }) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const user = await signIn(form.email.trim(), form.password);
      onDone(user.role);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <h1>Sign in to your dashboard</h1>
      <p className="lede">Use the credentials your project manager sent you.</p>
      <div className="auth-form-fields">
        <Field label="Work Email" error={errors.email}><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field>
        <Field label="Password" error={errors.password}><PasswordInput value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></Field>
        <div className="row auth-form-row" style={{ justifyContent: "space-between" }}>
          <label className="auth-checkbox"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me for 30 days</label>
          <a className="auth-link" href="/client/forgot">Forgot password?</a>
        </div>
        {submitError && <div className="auth-inline-error">{submitError}</div>}
        <Button type="submit" variant="primary" size="lg" iconRight={<IconArrowRight />} style={{ width: "100%", marginTop: 6 }} disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
        <div className="row gap-2" style={{ justifyContent: "center", marginTop: 8, fontSize: 12.5, color: "var(--text-3)" }}><IconShield size={13} /> Secure, end-to-end encrypted session</div>
      </div>
      <div className="auth-switch">
        Don't have an account? <button type="button" className="auth-link auth-link-btn" onClick={() => router.push("/client/sign-up")}>Sign up</button>
      </div>
    </form>
  );
}

function SignUpForm({ initialEmail = "", onDone }) {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ email: initialEmail, password: "", confirm: "", terms: false });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitNotice, setSubmitNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.password !== form.confirm) next.confirm = "Passwords don't match";
    if (!form.terms) next.terms = "Please accept the terms to continue";
    setErrors(next);
    setSubmitError("");
    setSubmitNotice("");
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const invite = await getDevFlowClientInviteStatus(form.email.trim());
      if (invite.pending === 0 && invite.accepted === 0) {
        setSubmitError("No approved client invitation was found for this email. Submit an inquiry first or ask your PM to approve the request.");
        return;
      }

      const user = await signUp(form.email.trim(), form.password);
      if (!user) {
        setSubmitNotice("Check your email to confirm the account, then sign in with this address.");
        return;
      }
      onDone(user.role);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div style={{ padding: 14, borderRadius: 12, background: "rgba(47,107,255,.10)", border: "1px solid rgba(79,139,255,.30)", display: "flex", gap: 12, marginBottom: 24 }}>
        <IconMail size={18} style={{ color: "#93C5FD", flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}><strong style={{ color: "white" }}>You were invited by Alphaexplora.</strong> Complete your account to access your client dashboard.</div>
      </div>
      <h1>Create your account</h1>
      <p className="lede">Set a password to finish onboarding.</p>
      <div className="auth-form-fields">
        <Field label="Work Email" error={errors.email} helper="Use the email from your invitation.">
          <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@company.com" />
        </Field>
        <Field label="Set Password" error={errors.password}><PasswordInput value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></Field>
        <Field label="Confirm Password" error={errors.confirm}><PasswordInput value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} placeholder="Re-enter password" /></Field>
        <label className="auth-checkbox" style={{ alignItems: "flex-start", gap: 10 }}><input type="checkbox" checked={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.checked })} /> I agree to Alphaexplora's Terms of Service and Privacy Policy.</label>
        {errors.terms && <span className="field-error">{errors.terms}</span>}
        {submitError && <div className="auth-inline-error">{submitError}</div>}
        {submitNotice && <div style={{ padding: 12, borderRadius: 10, background: "rgba(16,185,129,.10)", border: "1px solid rgba(16,185,129,.25)", color: "#B7F7D8", fontSize: 13, lineHeight: 1.5 }}>{submitNotice}</div>}
        <Button type="submit" variant="primary" size="lg" iconRight={<IconArrowRight />} style={{ width: "100%" }} disabled={submitting}>
          {submitting ? "Creating account..." : "Create Account & Sign In"}
        </Button>
      </div>
      <div className="auth-switch">
        Already have an account? <button type="button" className="auth-link auth-link-btn" onClick={() => router.push("/client/sign-in")}>Sign in</button>
      </div>
    </form>
  );
}

function ForgotForm() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to send reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #14B8A6)", display: "grid", placeItems: "center", marginBottom: 22 }}><IconCheck size={28} stroke={3} style={{ color: "white" }} /></div>
        <h1>Check your inbox</h1>
        <p className="lede" style={{ marginTop: 10 }}>We sent a reset link to <strong style={{ color: "white" }}>{email}</strong>.</p>
        <Button variant="secondary" size="lg" style={{ width: "100%", marginTop: 24 }} onClick={() => setSent(false)}>Try another email</Button>
        <div className="auth-switch">
          Remembered it? <button type="button" className="auth-link auth-link-btn" onClick={() => router.push("/client/sign-in")}>Sign in</button>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <h1>Forgot your password?</h1>
      <p className="lede">We'll email you a secure link to reset it.</p>
      <div className="auth-form-fields">
        <Field label="Work Email" error={error}><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></Field>
        <Button type="submit" variant="primary" size="lg" iconRight={<IconArrowRight />} style={{ width: "100%" }} disabled={submitting}>
          {submitting ? "Sending..." : "Send reset link"}
        </Button>
      </div>
      <div className="auth-switch">
        Remembered your password? <button type="button" className="auth-link auth-link-btn" onClick={() => router.push("/client/sign-in")}>Sign in</button>
      </div>
    </form>
  );
}

function ResetForm({ onDone }) {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (form.password !== form.confirm) next.confirm = "Passwords don't match";
    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await updatePassword(form.password);
      setDone(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #14B8A6)", display: "grid", placeItems: "center", marginBottom: 22 }}><IconCheck size={28} stroke={3} style={{ color: "white" }} /></div>
        <h1>All set!</h1>
        <p className="lede" style={{ marginTop: 10 }}>Your password has been updated.</p>
        <Button variant="primary" size="lg" iconRight={<IconArrowRight />} style={{ width: "100%", marginTop: 24 }} onClick={onDone}>Continue to sign in</Button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate>
      <h1>Reset your password</h1>
      <p className="lede">Choose a strong password for your account.</p>
      <div className="auth-form-fields">
        <Field label="New Password" error={errors.password}><PasswordInput value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /></Field>
        <Field label="Confirm New Password" error={errors.confirm}><PasswordInput value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} placeholder="Re-enter password" /></Field>
        {submitError && <div className="auth-inline-error">{submitError}</div>}
        <Button type="submit" variant="primary" size="lg" iconRight={<IconArrowRight />} style={{ width: "100%" }} disabled={submitting}>
          {submitting ? "Updating..." : "Reset password"}
        </Button>
      </div>
      <div className="auth-switch">
        Remembered it? <button type="button" className="auth-link auth-link-btn" onClick={() => router.push("/client/sign-in")}>Sign in</button>
      </div>
    </form>
  );
}

function PasswordInput({ value, onChange, placeholder = "Password" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-input-wrap">
      <input className="input" type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 40 }} />
      <button type="button" className="auth-input-toggle" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>
        {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  );
}
