// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, Input } from "@/shared/components/ui";
import { IconArrowRight, IconRefresh, IconUser } from "@/shared/components/icons";
import { useAuth } from "@/shared/auth/auth-provider";
import { DevPageHeader } from "@/features/dev/shared/components/dev-page-header";
import { BackendAwareRouteState } from "@/shared/components/backend-aware-route-state";
import { useDevFlowProjects } from "@/shared/hooks/use-devflow-projects";
import { ProjectConversationPanel } from "@/shared/components/collaboration/project-conversation-panel";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";
import { compactDevFlowError } from "@/shared/utils/devflow-projects";

export function DevFoldersView() {
  return (
    <DevPendingView
      title="Project Folders"
      subtitle="Backend project visibility is live. File trees and generated folder storage still need an artifact storage contract."
      pending={[
        "Project file tree API scoped to the assigned developer.",
        "Artifact storage metadata for folders, paths, versions, and download URLs.",
        "Read-only source viewer backed by real generated files.",
      ]}
    />
  );
}

export function DevGithubView() {
  return (
    <DevPendingView
      title="GitHub"
      subtitle="The previous GitHub page showed sample repos, branches, PRs, and CI state. It is now held until OAuth and repository sync are implemented."
      pending={[
        "GitHub OAuth connection state for the authenticated developer.",
        "Repository, branch, pull request, and workflow status sync.",
        "Project-to-repository linkage owned by the backend.",
      ]}
    />
  );
}

export function DevMessagesView() {
  const { selectedProject, selectedProjectId, selectedProjectLoading, selectedProjectError, refreshProjects } = useSelectedDevFlowProject();

  return (
    <div data-screen-label="Dev Messages" style={{ display: "grid", gap: 20 }}>
      <DevPageHeader
        title="Messages"
        subtitle="Team-only project conversations are connected to the collaboration backend."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refreshProjects}>Refresh projects</Button>}
      />
      <ProjectConversationPanel
        projectId={selectedProjectId}
        title="Developer team conversations"
        subtitle={selectedProjectError ? selectedProjectError : selectedProjectLoading ? "Loading selected project..." : selectedProject ? `PM and developer threads for ${selectedProject.companyName}.` : "Select a project from the top bar."}
        defaultVisibility="TEAM"
        defaultCategory="GENERAL"
        emptyText="No team conversations yet."
      />
    </div>
  );
}

export function DevCalendarView() {
  return (
    <DevPendingView
      title="Calendar"
      subtitle="Calendar items are no longer fabricated. We need backend events before due dates, standups, and delivery reviews can render here."
      pending={[
        "Developer calendar API sourced from project milestones, tasks, and meetings.",
        "Timezone-aware event start/end fields.",
        "Calendar filters for assigned projects and event type.",
      ]}
    />
  );
}

export function DevSettingsView() {
  const { devFlowUser, user, devFlowUserError } = useAuth();
  const displayName = devFlowUser?.fullName || user?.email?.split("@")[0] || "Developer";
  const email = devFlowUser?.email || user?.email || "No email";

  return (
    <DevPendingView
      title="Settings"
      subtitle="Authenticated identity comes from Supabase and `/auth/me`. Editable developer preferences need their own backend model."
      pending={[
        "Developer profile update endpoint for display name, avatar, skills, and GitHub handle.",
        "IDE, notification, and collaboration preferences persisted per user.",
        "Security/session management beyond Supabase password reset.",
      ]}
    >
      <Card style={{ padding: 24, maxWidth: 760 }}>
        <div className="row gap-3" style={{ marginBottom: 18 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#A855F7,#EC4899)", display: "grid", placeItems: "center", color: "white" }}>
            <IconUser size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Authenticated profile</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "3px 0 0" }}>Read from Supabase auth and `/auth/me`.</p>
          </div>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <Field label="Name"><Input value={displayName} readOnly /></Field>
          <Field label="Email"><Input value={email} readOnly /></Field>
          <Field label="Role"><Input value={devFlowUser?.role || "DEV"} readOnly /></Field>
          {devFlowUserError && <Badge tone="red">{compactDevFlowError(devFlowUserError)}</Badge>}
        </div>
      </Card>
    </DevPendingView>
  );
}

function DevPendingView({ title, subtitle, pending, children }) {
  const router = useRouter();
  const { projects, loading, error, refresh } = useDevFlowProjects();

  return (
    <div data-screen-label={`Dev ${title}`} style={{ display: "grid", gap: 20 }}>
      <DevPageHeader
        title={title}
        subtitle={subtitle}
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refresh}>Refresh projects</Button>}
      />
      <BackendAwareRouteState
        eyebrow="Developer module"
        title={`${title} is waiting for a backend module`}
        subtitle="This route remains available for navigation and integration planning, but it no longer presents demo operational data as real."
        projects={projects}
        loading={loading}
        error={error}
        pending={pending}
        primaryAction={{ label: "Open projects", onClick: () => router.push("/dev/projects") }}
      />
      {children}
    </div>
  );
}
