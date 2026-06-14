// @ts-nocheck
"use client";

import React from "react";
import {
  IconAlertTriangle,
  IconBell,
  IconCheckCircle,
  IconClose,
  IconInfo,
  IconSearch,
} from "@/shared/components/icons";
/* ---------------- Logo ---------------- */
function Logo({ size = 28 }) {
  const markSize = size + 18;
  return (
    <div className="alpha-logo" style={{ "--logo-mark-size": `${markSize}px` }}>
      <div className="alpha-logo-mark" aria-hidden="true">
        <svg width={markSize} height={markSize} viewBox="0 0 96 96" fill="none">
          <path d="M16 57C11 40 17 22 33 12" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M63 12C79 20 87 38 80 56" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M22 78L48 16L74 78L48 66L22 78Z" stroke="currentColor" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M38 55L48 31L58 55L48 50L38 55Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M25 88L34 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M12 88L24 65" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
          <path d="M39 82C47 85 57 85 65 81" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
      <div className="alpha-logo-wordmark">
        ALPHAEXPLORA
      </div>
    </div>
  );
}

/* ---------------- Button ---------------- */
function Button({
  variant = "primary", size = "md", icon, iconRight, children, onClick,
  type = "button", style, className = "", disabled,
}) {
  const cls = ["btn", `btn-${variant}`, size !== "md" && `btn-${size}`, className].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} style={style}>
      {icon ? React.cloneElement(icon, { className: "icon" }) : null}
      {children}
      {iconRight ? React.cloneElement(iconRight, { className: "icon" }) : null}
    </button>
  );
}

/* ---------------- Input / Textarea / Select ---------------- */
function Field({ label, helper, error, children }) {
  return (
    <div className={"field" + (error ? " has-error" : "")}>
      {label && <label className="field-label">{label}</label>}
      {children}
      {error
        ? <span className="field-error">{error}</span>
        : helper ? <span className="field-helper">{helper}</span> : null}
    </div>
  );
}
function Input(props) { return <input className="input" {...props} />; }
function Textarea(props) { return <textarea className="textarea" {...props} />; }
function Select({ children, ...rest }) {
  return <select className="select input" {...rest}>{children}</select>;
}

/* ---------------- Card ---------------- */
function Card({ glass = false, hover = false, className = "", style, children, ...rest }) {
  const cls = [glass ? "card-glass" : "card", hover && "card-hover", className].filter(Boolean).join(" ");
  return <div className={cls} style={style} {...rest}>{children}</div>;
}

/* ---------------- Badge ---------------- */
function Badge({ tone = "blue", dot = true, children, style }) {
  return (
    <span className={`badge badge-${tone}`} style={style}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
function Avatar({ initials = "AE", online, size = 36, color }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * .38, background: color }}
    >
      {initials}
      {online && <span className="online" />}
    </span>
  );
}

/* ---------------- Tabs ---------------- */
function Tabs({ items, value, onChange }) {
  return (
    <div className="tabs">
      {items.map(t => (
        <button
          key={t.value}
          className={"tab" + (value === t.value ? " active" : "")}
          onClick={() => onChange(t.value)}
        >{t.label}</button>
      ))}
    </div>
  );
}

/* ---------------- Modal ---------------- */
function Modal({ open, onClose, title, children, footer, width = 520 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(2,6,18,.7)",
        backdropFilter: "blur(8px)",
        display: "grid", placeItems: "center",
        animation: "fadeUp .25s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{ width, maxWidth: "90vw", animation: "fadeUp .3s ease" }}
      >
        <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="h-3" style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 8, height: 32 }}>
            <IconClose size={16} />
          </button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
        {footer && <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ---------------- Toast (simple inline) ---------------- */
function Toast({ tone = "green", title, message }) {
  const tones = {
    green: { Icon: IconCheckCircle, color: "#6EE7B7" },
    blue:  { Icon: IconInfo,        color: "#93C5FD" },
    amber: { Icon: IconAlertTriangle, color: "#FBBF24" },
    red:   { Icon: IconAlertTriangle, color: "#FCA5A5" },
  };
  const T = tones[tone] || tones.green;
  return (
    <div className="toast">
      <T.Icon size={20} style={{ color: T.color }} className="toast-icon" />
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        {message && <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 2 }}>{message}</div>}
      </div>
    </div>
  );
}

/* ---------------- Sidebar nav item ---------------- */
function SideNavItem({ icon, label, active, onClick, badge }) {
  return (
    <div className={"snav" + (active ? " active" : "")} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {badge && <span style={{ marginLeft: "auto" }}>{badge}</span>}
    </div>
  );
}

/* ---------------- Top app bar (for product chrome demo) ---------------- */
function TopBar() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "12px 20px",
      borderBottom: "1px solid var(--border)",
      background: "rgba(8,14,32,.7)",
    }}>
      <div className="row gap-2" style={{ flex: 1, maxWidth: 480 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <IconSearch size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
          <input className="input" placeholder="Search projects, clients, deliveries…" style={{ paddingLeft: 36, height: 38 }} />
        </div>
      </div>
      <button className="btn btn-ghost btn-sm" style={{ padding: 8, height: 36, position: "relative" }}>
        <IconBell size={17} />
        <span style={{
          position: "absolute", top: 6, right: 8, width: 7, height: 7,
          borderRadius: "50%", background: "var(--red)",
          boxShadow: "0 0 0 2px rgba(8,14,32,1)"
        }} />
      </button>
      <div className="row gap-2">
        <Avatar initials="JM" online size={32} />
      </div>
    </div>
  );
}

/* ---------------- Empty state ---------------- */
function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: "rgba(47,107,255,.08)",
        border: "1px solid var(--border)",
        display: "grid", placeItems: "center",
        margin: "0 auto 16px", color: "var(--text-2)"
      }}>{icon}</div>
      <h4 className="h-3" style={{ marginBottom: 6 }}>{title}</h4>
      <p style={{ color: "var(--text-2)", fontSize: 14, maxWidth: 360, margin: "0 auto 18px" }}>{description}</p>
      {action}
    </div>
  );
}

/* ---------------- Loading skeleton ---------------- */
function Skeleton({ w = "100%", h = 14, r = 6, style }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export {
  Logo,
  Button,
  Field,
  Input,
  Textarea,
  Select,
  Card,
  Badge,
  Avatar,
  Tabs,
  Modal,
  Toast,
  SideNavItem,
  TopBar,
  EmptyState,
  Skeleton,
};
