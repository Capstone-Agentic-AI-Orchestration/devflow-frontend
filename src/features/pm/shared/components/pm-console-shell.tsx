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
  IconActivity,
  IconBell,
  IconCalendar,
  IconChevronDown,
  IconCpu,
  IconFileText,
  IconFolder,
  IconHome,
  IconLifeBuoy,
  IconLogout,
  IconMessageCircle,
  IconSearch,
  IconSettings,
  IconShield,
  IconUser,
  IconUsers,
} from "@/shared/components/icons";

const PM_NAV = [
  { id: "dashboard", label: "Dashboard", icon: <IconHome size={17} /> },
  { id: "inbox", label: "Inbox", icon: <IconBell size={17} />, sublabel: "Inquiries" },
  { id: "projects", label: "Projects", icon: <IconFolder size={17} /> },
  { id: "clients", label: "Clients", icon: <IconUsers size={17} /> },
  { id: "team", label: "Team", icon: <IconUsers size={17} />, sublabel: "Developers" },
  { id: "calendar", label: "Calendar", icon: <IconCalendar size={17} /> },
  { id: "messages", label: "Messages", icon: <IconMessageCircle size={17} /> },
  { id: "documents", label: "Documents", icon: <IconFileText size={17} /> },
  { id: "ai-usage", label: "AI Usage", icon: <IconCpu size={17} /> },
  { id: "reports", label: "Reports", icon: <IconActivity size={17} /> },
  { id: "settings", label: "Settings", icon: <IconSettings size={17} /> },
];

const TITLES = {
  dashboard: "Dashboard",
  inbox: "Inbox",
  project: "Projects",
  projects: "Projects",
  client: "Clients",
  clients: "Clients",
  dev: "Team",
  team: "Team",
  calendar: "Calendar",
  messages: "Messages",
  documents: "Documents",
  "ai-usage": "AI Usage",
  reports: "Reports",
  settings: "Settings",
};

export function PMConsoleShell({ children }: { children: ReactNode }) {
  return (
    <SelectedProjectProvider storageKey="devflow.pm.selectedProjectId">
      <PMConsoleShellInner>{children}</PMConsoleShellInner>
    </SelectedProjectProvider>
  );
}

function PMConsoleShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { devFlowUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const route = pathname.replace(/^\/pm\/?/, "") || "dashboard";
  const base = route.split("/")[0] || "dashboard";
  const profile = profileView(devFlowUser);

  const navigate = async (target: string) => {
    if (target === "__signout") {
      await signOut();
      router.push("/client/sign-in");
      return;
    }
    router.push(`/pm/${target}`);
  };

  const crumbs = [{ label: TITLES[base] || "Dashboard" }];

  return (
    <div className="cs-shell">
      <PMSidebar route={route} profile={profile} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="cs-content">
        <PMTopBar crumbs={crumbs} profile={profile} onMenu={() => setMobileOpen((open) => !open)} onNavigate={navigate} />
        <main className="cs-page">{children}</main>
      </div>
    </div>
  );
}

function PMSidebar({ route, profile, onNavigate, mobileOpen, setMobileOpen }) {
  const base = route.split("/")[0];

  return (
    <aside className={"cs-sidebar" + (mobileOpen ? " is-mobile-open" : "")}>
      <div className="cs-sidebar-inner">
        <div className="cs-brand">
          <Logo />
        </div>

        <div className="pm-org">
          <div className="pm-org-label">Persona</div>
          <div className="pm-org-name">Project Manager</div>
          <div className="pm-org-meta">Alphaexplora - Internal</div>
        </div>

        <nav className="cs-nav" style={{ overflowY: "auto", minHeight: 0 }}>
          {PM_NAV.map((item) => (
            <a
              key={item.id}
              className={"cs-nav-item" + ((base === item.id || (item.id === "projects" && base === "project") || (item.id === "clients" && base === "client") || (item.id === "team" && base === "dev")) ? " active" : "")}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen?.(false);
              }}
            >
              <span className="cs-nav-icon">{item.icon}</span>
              <span className="cs-nav-label">
                {item.label}
                {item.sublabel && <span style={{ color: "var(--text-3)", fontWeight: 400, marginLeft: 4, fontSize: 11 }}>- {item.sublabel}</span>}
              </span>
              {item.badge !== undefined && <span className="cs-nav-badge cs-nav-badge--count">{item.badge}</span>}
            </a>
          ))}
        </nav>

        <div className="cs-spacer" />

        <a className="cs-support">
          <IconLifeBuoy size={15} />
          Help &amp; Support
        </a>

        <div className="cs-user">
          <div style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: profile.color,
            display: "grid",
            placeItems: "center",
            color: "white",
            fontWeight: 600,
            fontSize: 13,
            flexShrink: 0,
            position: "relative",
            border: "1px solid rgba(255,255,255,.08)",
          }}>
            {profile.initials}
            <span style={{
              position: "absolute",
              right: -2,
              bottom: -2,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--green)",
              border: "2px solid var(--bg-0)",
            }} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {profile.email}
            </div>
          </div>
          <span className="pm-pill">PM</span>
        </div>
      </div>
    </aside>
  );
}

function PMTopBar({ crumbs, profile, onMenu, onNavigate }) {
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <div className="cs-crumbs">
          {crumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="cs-crumb-current">{crumb.label}</span>
          ))}
        </div>

        <div style={{ flex: 1, maxWidth: 460, marginLeft: 24 }}>
          <div style={{ position: "relative" }}>
            <IconSearch size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input
              className="input"
              placeholder="Search projects, clients, inquiries, developers..."
              style={{ paddingLeft: 36, height: 36, fontSize: 13.5 }}
            />
            <span className="mono" style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 10,
              color: "var(--text-3)",
              padding: "2px 6px",
              borderRadius: 4,
              background: "rgba(8,14,32,.7)",
              border: "1px solid var(--border)",
            }}>Ctrl K</span>
          </div>
        </div>

        <ProjectSwitcher compact />

        <DevFlowNotificationBell />

        <div ref={ref} className="cs-avatar-wrap">
          <button className="cs-avatar-trigger" onClick={() => setOpen((value) => !value)}>
            <span style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: profile.color,
              display: "grid",
              placeItems: "center",
              color: "white",
              fontWeight: 600,
              fontSize: 12,
            }}>{profile.initials}</span>
            <IconChevronDown size={14} style={{ color: "var(--text-3)" }} />
          </button>

          {open && (
            <div className="cs-menu">
              <div className="cs-menu-header">
                <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{profile.email}</div>
              </div>
              <button className="cs-menu-item" onClick={() => { setOpen(false); onNavigate("settings"); }}>
                <IconUser size={15} /> Profile &amp; preferences
              </button>
              <button className="cs-menu-item"><IconShield size={15} /> Security</button>
              <div className="cs-menu-sep" />
              <button className="cs-menu-item cs-menu-item--danger" onClick={() => onNavigate("__signout")}>
                <IconLogout size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function profileView(user) {
  const name = user?.fullName || user?.email?.split("@")[0] || "Project Manager";
  return {
    name,
    email: user?.email || "No email",
    initials: initialsFor(name),
    color: user?.role === "ADMIN" ? "linear-gradient(135deg,#64748B,#334155)" : "linear-gradient(135deg,#4F8BFF,#8B5CF6)",
  };
}

function initialsFor(value) {
  return value
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PM";
}
