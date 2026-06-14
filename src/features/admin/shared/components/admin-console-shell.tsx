// @ts-nocheck
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/shared/components/ui";
import { useAuth } from "@/shared/auth/auth-provider";
import {
  IconActivity,
  IconBell,
  IconCalendar,
  IconChevronDown,
  IconCpu,
  IconCreditCard,
  IconDatabase,
  IconFileText,
  IconFolder,
  IconHome,
  IconLifeBuoy,
  IconLogout,
  IconSearch,
  IconSettings,
  IconShield,
  IconUser,
  IconUsers,
} from "@/shared/components/icons";
import { ADMIN } from "@/features/admin/shared/model/admin.mock";

const ADMIN_NAV = [
  { id: "overview", label: "Overview", icon: <IconHome size={17} /> },
  { id: "orchestration", label: "AI Orchestration", icon: <IconCpu size={17} />, badge: "Live" },
  { id: "cost", label: "Cost & Billing", icon: <IconCreditCard size={17} /> },
  { id: "providers", label: "AI Providers", icon: <IconDatabase size={17} /> },
  { id: "users", label: "User Management", icon: <IconUsers size={17} /> },
  { id: "projects", label: "Projects", icon: <IconFolder size={17} /> },
  { id: "audit", label: "Audit Log", icon: <IconFileText size={17} /> },
  { id: "execs", label: "Executive Comms", icon: <IconBell size={17} /> },
  { id: "health", label: "System Health", icon: <IconActivity size={17} /> },
  { id: "settings", label: "Settings", icon: <IconSettings size={17} /> },
];

const TITLES = {
  overview: "Overview",
  orchestration: "AI Orchestration",
  cost: "Cost & Billing",
  providers: "AI Providers",
  users: "User Management",
  projects: "Projects",
  audit: "Audit Log",
  execs: "Executive Comms",
  health: "System Health",
  settings: "Settings",
};

export function AdminConsoleShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const route = pathname.replace(/^\/admin\/?/, "") || "overview";
  const base = route.split("/")[0] || "overview";

  const navigate = async (target: string) => {
    if (target === "__signout") {
      await signOut();
      router.push("/client/sign-in");
    } else router.push(`/admin/${target}`);
  };

  return (
    <div className="cs-shell">
      <AdminSidebar route={base} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="cs-content">
        <AdminTopBar title={TITLES[base] || "Overview"} onMenu={() => setMobileOpen((open) => !open)} onNavigate={navigate} />
        <main className="cs-page">{children}</main>
      </div>
    </div>
  );
}

function AdminSidebar({ route, onNavigate, mobileOpen, setMobileOpen }) {
  return (
    <aside className={"cs-sidebar" + (mobileOpen ? " is-mobile-open" : "")}>
      <div className="cs-sidebar-inner">
        <div className="cs-brand"><Logo /></div>
        <div className="pm-org">
          <div className="pm-org-label">Persona</div>
          <div className="pm-org-name">Platform Admin</div>
          <div className="pm-org-meta">Alphaexplora - Control Plane</div>
        </div>
        <nav className="cs-nav" style={{ overflowY: "auto", minHeight: 0 }}>
          {ADMIN_NAV.map((item) => (
            <a key={item.id} className={"cs-nav-item" + (route === item.id ? " active" : "")} onClick={() => { onNavigate(item.id); setMobileOpen?.(false); }}>
              <span className="cs-nav-icon">{item.icon}</span>
              <span className="cs-nav-label">{item.label}</span>
              {item.badge && <span className="dev-live-pill"><span className="dot" />{item.badge}</span>}
            </a>
          ))}
        </nav>
        <div className="cs-spacer" />
        <a className="cs-support"><IconLifeBuoy size={15} /> Help &amp; Support</a>
        <div className="cs-user">
          <span style={{ width: 38, height: 38, borderRadius: "50%", background: ADMIN.color, display: "grid", placeItems: "center", color: "white", fontWeight: 600, fontSize: 13, flexShrink: 0, position: "relative", border: "1px solid rgba(255,255,255,.08)" }}>{ADMIN.initials}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ADMIN.firstName} {ADMIN.lastName}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ADMIN.role}</div>
          </div>
          <span className="pm-pill">Admin</span>
        </div>
      </div>
    </aside>
  );
}

function AdminTopBar({ title, onMenu, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const click = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  return (
    <header className="cs-topbar">
      <div className="cs-topbar-inner">
        <button className="cs-mobile-menu" onClick={onMenu} aria-label="Menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg></button>
        <div className="cs-crumbs"><span className="cs-crumb-root">Admin</span><span className="cs-crumb-sep">/</span><span className="cs-crumb-current">{title}</span></div>
        <div style={{ flex: 1, maxWidth: 430, marginLeft: 24 }}>
          <div style={{ position: "relative" }}>
            <IconSearch size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input className="input" placeholder="Search users, projects, providers, audit events..." style={{ paddingLeft: 36, height: 36, fontSize: 13.5 }} />
          </div>
        </div>
        <button className="cs-iconbtn" aria-label="Notifications"><IconBell size={17} /><span className="cs-iconbtn-badge">5</span></button>
        <div ref={ref} className="cs-avatar-wrap">
          <button className="cs-avatar-trigger" onClick={() => setOpen((value) => !value)}><span style={{ width: 32, height: 32, borderRadius: "50%", background: ADMIN.color, display: "grid", placeItems: "center", color: "white", fontWeight: 600, fontSize: 12 }}>{ADMIN.initials}</span><IconChevronDown size={14} style={{ color: "var(--text-3)" }} /></button>
          {open && <div className="cs-menu"><div className="cs-menu-header"><div style={{ fontWeight: 600, fontSize: 14 }}>{ADMIN.firstName} {ADMIN.lastName}</div><div style={{ fontSize: 12, color: "var(--text-3)" }}>{ADMIN.email}</div></div><button className="cs-menu-item" onClick={() => { setOpen(false); onNavigate("settings"); }}><IconUser size={15} /> Profile &amp; settings</button><button className="cs-menu-item"><IconShield size={15} /> Security</button><div className="cs-menu-sep" /><button className="cs-menu-item cs-menu-item--danger" onClick={() => onNavigate("__signout")}><IconLogout size={15} /> Sign out</button></div>}
        </div>
      </div>
    </header>
  );
}
