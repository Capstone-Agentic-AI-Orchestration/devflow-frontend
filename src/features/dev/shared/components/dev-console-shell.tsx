// @ts-nocheck
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/shared/components/ui";
import { useAuth } from "@/shared/auth/auth-provider";
import { DevFlowNotificationBell } from "@/shared/components/notifications/devflow-notification-bell";
import { SelectedProjectProvider } from "@/shared/projects/selected-project-context";
import { ProjectSwitcher } from "@/shared/projects/project-switcher";
import {
  IconBell,
  IconCalendar,
  IconChevronDown,
  IconCode,
  IconCpu,
  IconFileText,
  IconFolder,
  IconGitBranch,
  IconHome,
  IconLayout,
  IconLifeBuoy,
  IconLogout,
  IconMessageCircle,
  IconSearch,
  IconSettings,
  IconShield,
  IconUser,
} from "@/shared/components/icons";

const DEV_NAV = [
  { id: "dashboard", label: "Dashboard", icon: <IconHome size={17} /> },
  { id: "projects", label: "Projects", icon: <IconFolder size={17} /> },
  { id: "orchestrator", label: "AI Orchestrator", icon: <IconCpu size={17} /> },
  { id: "ide", label: "IDE", icon: <IconCode size={17} /> },
  { id: "folders", label: "Project Folders", icon: <IconFileText size={17} /> },
  { id: "github", label: "GitHub", icon: <IconGitBranch size={17} /> },
  { id: "messages", label: "Messages", icon: <IconMessageCircle size={17} /> },
  { id: "calendar", label: "Calendar", icon: <IconCalendar size={17} /> },
  { id: "settings", label: "Settings", icon: <IconSettings size={17} /> },
];

const TITLES = {
  dashboard: "Dashboard",
  projects: "Projects",
  project: "Projects",
  orchestrator: "AI Orchestrator",
  ide: "IDE",
  folders: "Project Folders",
  github: "GitHub",
  messages: "Messages",
  calendar: "Calendar",
  settings: "Settings",
};

export function DevConsoleShell({ children }: { children: ReactNode }) {
  return (
    <SelectedProjectProvider storageKey="devflow.dev.selectedProjectId">
      <DevConsoleShellInner>{children}</DevConsoleShellInner>
    </SelectedProjectProvider>
  );
}

function DevConsoleShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { devFlowUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const route = pathname.replace(/^\/dev\/?/, "") || "dashboard";
  const base = route.split("/")[0] || "dashboard";
  const profile = profileView(devFlowUser);

  const navigate = async (target: string) => {
    if (target === "__signout") {
      await signOut();
      router.push("/client/sign-in");
      return;
    }
    router.push(`/dev/${target}`);
  };

  return (
    <div className="cs-shell">
      <DevSidebar route={route} profile={profile} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="cs-content">
        <DevTopBar title={TITLES[base] || "Dashboard"} profile={profile} onMenu={() => setMobileOpen((open) => !open)} onNavigate={navigate} />
        <main className="cs-page">{children}</main>
      </div>
    </div>
  );
}

function DevSidebar({ route, profile, onNavigate, mobileOpen, setMobileOpen }) {
  const base = route.split("/")[0];
  const isActive = (id: string) => base === id || (id === "projects" && base === "project") || (id === "orchestrator" && route.startsWith("orchestrator/output"));

  return (
    <aside className={"cs-sidebar" + (mobileOpen ? " is-mobile-open" : "")}>
      <div className="cs-sidebar-inner">
        <div className="cs-brand"><Logo /></div>
        <div className="pm-org">
          <div className="pm-org-label">Persona</div>
          <div className="pm-org-name">Developer</div>
          <div className="pm-org-meta">Alphaexplora - Internal</div>
        </div>
        <nav className="cs-nav" style={{ overflowY: "auto", minHeight: 0 }}>
          {DEV_NAV.map((item) => (
            <a key={item.id} className={"cs-nav-item" + (isActive(item.id) ? " active" : "")} onClick={() => { onNavigate(item.id); setMobileOpen?.(false); }}>
              <span className="cs-nav-icon">{item.icon}</span>
              <span className="cs-nav-label">{item.label}</span>
              {item.badge !== undefined && (typeof item.badge === "number" ? <span className="cs-nav-badge cs-nav-badge--count">{item.badge}</span> : <span className="dev-live-pill"><span className="dot" />{item.badge}</span>)}
            </a>
          ))}
        </nav>
        <div className="cs-spacer" />
        <a className="cs-support"><IconLifeBuoy size={15} /> Help &amp; Support</a>
        <div className="cs-user">
          <span style={{ width: 38, height: 38, borderRadius: "50%", background: profile.color, display: "grid", placeItems: "center", color: "white", fontWeight: 600, fontSize: 13, flexShrink: 0, position: "relative", border: "1px solid rgba(255,255,255,.08)" }}>
            {profile.initials}
            <span style={{ position: "absolute", right: -2, bottom: -2, width: 10, height: 10, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--bg-0)" }} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.email}</div>
          </div>
          <span className="dev-pill">Dev</span>
        </div>
      </div>
    </aside>
  );
}

function DevTopBar({ title, profile, onMenu, onNavigate }) {
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
        <button className="cs-mobile-menu" onClick={onMenu} aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
        <div className="cs-crumbs">
          <span className="cs-crumb-root">Dev</span>
          <span className="cs-crumb-sep">/</span>
          <span className="cs-crumb-current">{title}</span>
        </div>
        <div style={{ flex: 1, maxWidth: 430, marginLeft: 24 }}>
          <div style={{ position: "relative" }}>
            <IconSearch size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input className="input" placeholder="Search tasks, repos, files, agents..." style={{ paddingLeft: 36, height: 36, fontSize: 13.5 }} />
            <span className="mono" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--text-3)", padding: "2px 6px", borderRadius: 4, background: "rgba(8,14,32,.7)", border: "1px solid var(--border)" }}>Ctrl K</span>
          </div>
        </div>
        <ProjectSwitcher compact />
        <DevFlowNotificationBell />
        <button className="cs-iconbtn" aria-label="Open IDE" onClick={() => onNavigate("ide")}>
          <IconLayout size={17} />
        </button>
        <div ref={ref} className="cs-avatar-wrap">
          <button className="cs-avatar-trigger" onClick={() => setOpen((value) => !value)}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: profile.color, display: "grid", placeItems: "center", color: "white", fontWeight: 600, fontSize: 12 }}>{profile.initials}</span>
            <IconChevronDown size={14} style={{ color: "var(--text-3)" }} />
          </button>
          {open && (
            <div className="cs-menu">
              <div className="cs-menu-header">
                <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{profile.email}</div>
              </div>
              <button className="cs-menu-item" onClick={() => { setOpen(false); onNavigate("settings"); }}><IconUser size={15} /> Profile &amp; preferences</button>
              <button className="cs-menu-item"><IconShield size={15} /> Security</button>
              <div className="cs-menu-sep" />
              <button className="cs-menu-item cs-menu-item--danger" onClick={() => onNavigate("__signout")}><IconLogout size={15} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function profileView(user) {
  const name = user?.fullName || user?.email?.split("@")[0] || "Developer";
  return {
    name,
    email: user?.email || "No email",
    initials: initialsFor(name),
    color: user?.role === "ADMIN" ? "linear-gradient(135deg,#64748B,#334155)" : "linear-gradient(135deg,#A855F7,#EC4899)",
  };
}

function initialsFor(value) {
  return value
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "DV";
}
