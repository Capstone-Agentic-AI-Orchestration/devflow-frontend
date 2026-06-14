// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "@/shared/components/ui";
import { IconCheckCircle, IconRefresh } from "@/shared/components/icons";
import { useAuth } from "@/shared/auth/auth-provider";
import { DevPageHeader } from "@/features/dev/shared/components/dev-page-header";
import { BackendAwareRouteState } from "@/shared/components/backend-aware-route-state";
import { useDevFlowProjects } from "@/shared/hooks/use-devflow-projects";
import { ProjectConversationPanel } from "@/shared/components/collaboration/project-conversation-panel";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";
import { ProfileSettingsPanel } from "@/shared/components/profile/profile-settings-panel";
import { getDevFlowDeveloper, updateDevFlowDeveloperCapacity } from "@/shared/api/devflow-api";
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
  const { devFlowUser } = useAuth();
  const [capacity, setCapacity] = useState({
    skillsText: "",
    weeklyCapacityHours: "",
    availabilityStatus: "AVAILABLE",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const loadCapacity = async () => {
    if (!devFlowUser?.id) return;
    setLoading(true);
    setError("");
    try {
      const developer = await getDevFlowDeveloper(devFlowUser.id);
      setCapacity({
        skillsText: developer.skills.join(", "),
        weeklyCapacityHours: developer.weeklyCapacityHours == null ? "" : String(developer.weeklyCapacityHours),
        availabilityStatus: developer.availabilityStatus,
        notes: developer.notes || "",
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapacity();
  }, [devFlowUser?.id]);

  const saveCapacity = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const developer = await updateDevFlowDeveloperCapacity({
        skills: capacity.skillsText.split(",").map((skill) => skill.trim()).filter(Boolean),
        weeklyCapacityHours: capacity.weeklyCapacityHours === "" ? null : Number(capacity.weeklyCapacityHours),
        availabilityStatus: capacity.availabilityStatus,
        notes: capacity.notes.trim() || null,
      });
      setCapacity({
        skillsText: developer.skills.join(", "),
        weeklyCapacityHours: developer.weeklyCapacityHours == null ? "" : String(developer.weeklyCapacityHours),
        availabilityStatus: developer.availabilityStatus,
        notes: developer.notes || "",
      });
      setSaved(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-screen-label="Dev Settings" style={{ display: "grid", gap: 20 }}>
      <DevPageHeader
        title="Settings"
        subtitle="Profile preferences and developer capacity are persisted through backend APIs."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={loadCapacity}>Refresh capacity</Button>}
      />

      <ProfileSettingsPanel
        title="Developer profile"
        subtitle="Update your display name and lightweight preferences."
        accent="linear-gradient(135deg,#A855F7,#EC4899)"
      />

      <Card style={{ padding: 24 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Capacity</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>This is visible to PMs in the developer directory.</p>
          </div>
          {saved && <Badge tone="green">Saved</Badge>}
        </div>
        {error && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginBottom: 14 }}>{compactDevFlowError(error)}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <Field label="Weekly capacity hours">
            <Input type="number" min="0" max="168" value={capacity.weeklyCapacityHours} onChange={(event) => setCapacity({ ...capacity, weeklyCapacityHours: event.target.value })} disabled={loading || saving} />
          </Field>
          <Field label="Availability">
            <Select value={capacity.availabilityStatus} onChange={(event) => setCapacity({ ...capacity, availabilityStatus: event.target.value })} disabled={loading || saving}>
              <option value="AVAILABLE">Available</option>
              <option value="LIMITED">Limited</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </Select>
          </Field>
          <Field label="Skills">
            <Input value={capacity.skillsText} onChange={(event) => setCapacity({ ...capacity, skillsText: event.target.value })} placeholder="React, NestJS, Prisma" disabled={loading || saving} />
          </Field>
        </div>
        <Field label="Notes">
          <Textarea rows={3} value={capacity.notes} onChange={(event) => setCapacity({ ...capacity, notes: event.target.value })} placeholder="Availability notes" disabled={loading || saving} />
        </Field>
        <div className="row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
          <Button variant="primary" icon={<IconCheckCircle size={14} />} disabled={loading || saving} onClick={saveCapacity}>
            {saving ? "Saving..." : "Save capacity"}
          </Button>
        </div>
      </Card>
    </div>
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
