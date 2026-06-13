// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, Input } from "@/shared/components/ui";
import { IconArrowRight, IconRefresh, IconShield, IconUser } from "@/shared/components/icons";
import { useAuth } from "@/shared/auth/auth-provider";
import { ClientPageHeader } from "@/features/client/shared/components/client-page-header";
import { BackendAwareRouteState } from "@/shared/components/backend-aware-route-state";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";
import { compactDevFlowError } from "@/shared/utils/devflow-projects";

export function ClientSettingsView() {
  const router = useRouter();
  const { devFlowUser, user, devFlowUserError } = useAuth();
  const { projects, selectedProject, selectedProjectLoading, selectedProjectError, refreshProjects } = useSelectedDevFlowProject();
  const displayName = devFlowUser?.fullName || user?.email?.split("@")[0] || "Client";
  const email = devFlowUser?.email || user?.email || "No email";

  return (
    <div data-screen-label="Client Settings" style={{ display: "grid", gap: 20 }}>
      <ClientPageHeader
        title="Settings"
        subtitle="Only authenticated profile and assigned project data are shown here until account settings APIs are added."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refreshProjects}>Refresh projects</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, .9fr)", gap: 16 }}>
        <Card style={{ padding: 24 }}>
          <div className="row gap-3" style={{ marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#4F8BFF,#8B5CF6)", display: "grid", placeItems: "center", color: "white" }}>
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
            <Field label="Role"><Input value={devFlowUser?.role || "CLIENT"} readOnly /></Field>
            {devFlowUserError && <Badge tone="red">{compactDevFlowError(devFlowUserError)}</Badge>}
          </div>
        </Card>

        <Card style={{ padding: 24 }}>
          <div className="row gap-3" style={{ marginBottom: 18 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(16,185,129,.12)", display: "grid", placeItems: "center", color: "#6EE7B7" }}>
              <IconShield size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Security</h3>
              <p style={{ color: "var(--text-3)", fontSize: 12, margin: "3px 0 0" }}>Password reset uses Supabase auth.</p>
            </div>
          </div>
          <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Profile editing, notification preferences, active sessions, and billing details need backend-owned persistence before they can be editable.
          </p>
          <Button style={{ marginTop: 18 }} variant="primary" iconRight={<IconArrowRight size={14} />} onClick={() => router.push("/client/forgot")}>
            Reset password
          </Button>
        </Card>
      </div>

      {selectedProject && (
        <Card style={{ padding: 20 }}>
          <Badge tone="blue">Selected project</Badge>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: "10px 0 0" }}>{selectedProject.companyName}</h3>
          <p style={{ color: "var(--text-2)", fontSize: 13, margin: "6px 0 0", lineHeight: 1.6 }}>{selectedProject.brief || "No brief has been saved yet."}</p>
        </Card>
      )}

      <BackendAwareRouteState
        eyebrow="Settings module"
        title="Editable account settings are pending backend persistence"
        subtitle="The previous settings page used fabricated company, session, billing, and notification records. This page now limits itself to the authenticated user and assigned project."
        projects={projects}
        loading={selectedProjectLoading}
        error={selectedProjectError}
        pending={[
          "User profile update endpoint for display name, phone, avatar, and client role metadata.",
          "Company profile endpoint for legal entity, address, website, tax identifiers, and industry.",
          "Notification preference, active session, and billing/invoice APIs.",
        ]}
      />
    </div>
  );
}
