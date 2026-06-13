"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/shared/components/ui";
import { useAuth } from "@/shared/auth/auth-provider";
import { SelectedProjectProvider, useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";
import { ProjectSwitcher } from "@/shared/projects/project-switcher";
import { DevFlowNotificationBell } from "@/shared/components/notifications/devflow-notification-bell";
import { devflowLifecycleView } from "@/shared/utils/devflow-projects";
import {
  IconBell,
  IconChevronDown,
  IconClipboard,
  IconFileText,
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

const CLIENT_NAV = [
  { id: "dashboard", label: "Dashboard", icon: <IconHome size={18} /> },
  { id: "chat", label: "Chat", icon: <IconMessageCircle size={18} /> },
  { id: "documents", label: "Documents", icon: <IconFileText size={18} /> },
  { id: "contracts", label: "Contracts & Requirements", icon: <IconClipboard size={18} /> },
  { id: "product", label: "My Product", icon: <IconLayout size={18} /> },
  { id: "settings", label: "Settings", icon: <IconSettings size={18} /> },
];

export function ClientConsoleShell({ children }: { children: ReactNode }) {
  return (
    <SelectedProjectProvider storageKey="devflow.client.selectedProjectId">
      <ClientConsoleShellInner>{children}</ClientConsoleShellInner>
    </SelectedProjectProvider>
  );
}

function ClientConsoleShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { devFlowUser, signOut } = useAuth();
  const { selectedProject } = useSelectedDevFlowProject();
  const [mobileOpen, setMobileOpen] = useState(false);
  const route = pathname.replace(/^\/client\/?/, "") || "dashboard";
  const base = route.split("/")[0] || "dashboard";
  const profile = profileView(devFlowUser);
  const lifecycle = devflowLifecycleView(selectedProject);
  const engagement = selectedProject
    ? {
        name: selectedProject.companyName,
        code: selectedProject.id,
        status: lifecycle.label,
      }
    : {
        name: "No assigned project",
        code: "Awaiting PM assignment",
        status: "Unassigned",
      };

  const navigate = async (target: string) => {
    if (target === "__signout") {
      await signOut();
      router.push("/client/sign-in");
      return;
    }
    router.push(`/client/${target}`);
  };

  return (
    <div className="cs-shell">
      <ClientSidebar route={base} profile={profile} engagement={engagement} onNavigate={navigate} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="cs-content">
        <ClientTopBar title={titleFor(base)} profile={profile} engagement={engagement} onMenu={() => setMobileOpen((open) => !open)} onNavigate={navigate} />
        <main className="cs-page">{children}</main>
      </div>
    </div>
  );
}

interface ProfileView { readonly name: string; readonly email: string; readonly initials: string }
interface EngagementView { readonly name: string; readonly code: string; readonly status: string }

function ClientSidebar({ route, profile, engagement, onNavigate, mobileOpen, setMobileOpen }: {
  readonly route: string;
  readonly profile: ProfileView;
  readonly engagement: EngagementView;
  readonly onNavigate: (target: string) => void;
  readonly mobileOpen: boolean;
  readonly setMobileOpen: (open: boolean) => void;
}) {
  return (
    <aside className={"cs-sidebar" + (mobileOpen ? " is-mobile-open" : "")}>
      <div className="cs-sidebar-inner">
        <div className="cs-brand"><Logo /></div>

        <div className="cs-engagement">
          <div className="cs-engagement-label">Current engagement</div>
          <div className="cs-engagement-name">{engagement.name}</div>
          <div className="cs-engagement-meta mono">{engagement.code}</div>
          <div className="cs-engagement-status"><span className="dot" /> {engagement.status}</div>
        </div>

        <nav className="cs-nav">
          {CLIENT_NAV.map((item) => (
            <a key={item.id} className={"cs-nav-item" + (route === item.id ? " active" : "")} onClick={() => { onNavigate(item.id); setMobileOpen?.(false); }}>
              <span className="cs-nav-icon">{item.icon}</span>
              <span className="cs-nav-label">{item.label}</span>
              {item.badge !== undefined && (typeof item.badge === "number" ? <span className="cs-nav-badge cs-nav-badge--count">{item.badge}</span> : <span className="cs-nav-badge cs-nav-badge--text">{item.badge}</span>)}
            </a>
          ))}
        </nav>

        <div className="cs-spacer" />
        <a className="cs-support"><IconLifeBuoy size={15} /> Help &amp; Support</a>
        <div className="cs-user">
          <span style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #4F8BFF, #8B5CF6)", display: "grid", placeItems: "center", color: "white", fontWeight: 600, fontSize: 13, flexShrink: 0, position: "relative", border: "1px solid rgba(255,255,255,.08)" }}>
            {profile.initials}
            <span style={{ position: "absolute", right: -2, bottom: -2, width: 10, height: 10, borderRadius: "50%", background: "var(--green)", border: "2px solid var(--bg-0)" }} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.email}</div>
          </div>
          <span className="cs-pill">Client</span>
        </div>
      </div>
    </aside>
  );
}

function ClientTopBar({ title, profile, engagement, onMenu, onNavigate }: {
  readonly title: string;
  readonly profile: ProfileView;
  readonly engagement: EngagementView;
  readonly onMenu: () => void;
  readonly onNavigate: (target: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const click = (event: MouseEvent) => {
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
          <span className="cs-crumb-root">{engagement.name}</span>
          <span className="cs-crumb-sep">/</span>
          <span className="cs-crumb-current">{title}</span>
        </div>
        <div style={{ flex: 1, maxWidth: 360, marginLeft: 24 }}>
          <div style={{ position: "relative" }}>
            <IconSearch size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
            <input className="input" placeholder="Search documents, messages..." style={{ paddingLeft: 36, height: 36, fontSize: 13.5 }} />
          </div>
        </div>
        <ProjectSwitcher compact />
        <DevFlowNotificationBell />
        <div ref={ref} className="cs-avatar-wrap">
          <button className="cs-avatar-trigger" onClick={() => setOpen((value) => !value)}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #4F8BFF, #8B5CF6)", display: "grid", placeItems: "center", color: "white", fontWeight: 600, fontSize: 12 }}>{profile.initials}</span>
            <IconChevronDown size={14} style={{ color: "var(--text-3)" }} />
          </button>
          {open && (
            <div className="cs-menu">
              <div className="cs-menu-header">
                <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{profile.email}</div>
              </div>
              <button className="cs-menu-item" onClick={() => { setOpen(false); onNavigate("settings"); }}><IconUser size={15} /> Profile &amp; Settings</button>
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

function profileView(user: { fullName?: string; email?: string } | null | undefined): ProfileView {
  const name = user?.fullName || user?.email?.split("@")[0] || "Client";
  return {
    name,
    email: user?.email || "No email",
    initials: initialsFor(name),
  };
}

function initialsFor(value: string): string {
  return value
    .split(/[\s.@_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CL";
}

function titleFor(route: string) {
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    chat: "Chat",
    documents: "Documents",
    contracts: "Contracts & Requirements",
    product: "My Product",
    settings: "Settings",
  };
  return map[route] || "Dashboard";
}
