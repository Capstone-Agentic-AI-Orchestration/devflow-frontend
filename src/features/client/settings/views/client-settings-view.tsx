// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconRefresh, IconShield } from "@/shared/components/icons";
import { ClientPageHeader } from "@/features/client/shared/components/client-page-header";
import { ProfileSettingsPanel } from "@/shared/components/profile/profile-settings-panel";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";

export function ClientSettingsView() {
  const router = useRouter();
  const { selectedProject, refreshProjects } = useSelectedDevFlowProject();

  return (
    <div data-screen-label="Client Settings" style={{ display: "grid", gap: 20 }}>
      <ClientPageHeader
        title="Settings"
        subtitle="Profile changes are persisted to your account profile."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refreshProjects}>Refresh project</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, .9fr)", gap: 16 }}>
        <ProfileSettingsPanel
          title="Client profile"
          subtitle="Update your display name and lightweight account preferences."
          accent="linear-gradient(135deg,#10B981,#4F8BFF)"
        />

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
            Display name and preferences are editable now. Active sessions, billing, and company legal profile remain pending backend modules.
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
    </div>
  );
}
