// @ts-nocheck
"use client";

import { Badge, Card, Field, Input } from "@/shared/components/ui";
import { IconUser } from "@/shared/components/icons";
import { useAuth } from "@/shared/auth/auth-provider";
import { PMBackendPendingView } from "@/features/pm/shared/components/pm-backend-pending-view";
import { compactDevFlowError } from "@/shared/utils/devflow-projects";

export function PMSettingsView() {
  const { devFlowUser, user, devFlowUserError } = useAuth();
  const displayName = devFlowUser?.fullName || user?.email?.split("@")[0] || "Project Manager";
  const email = devFlowUser?.email || user?.email || "No email";

  return (
    <PMBackendPendingView
      title="Settings"
      subtitle="Authenticated identity is connected. Editable PM preferences, notification rules, templates, and workspace settings need backend persistence."
      pending={[
        "PM profile update endpoint for display name, phone, avatar, and signature.",
        "Notification, approval, and email-template preferences persisted per PM.",
        "Workspace settings for inquiry routing, client onboarding, and project defaults.",
      ]}
    >
      <Card style={{ padding: 24, maxWidth: 760 }}>
        <div className="row gap-3" style={{ marginBottom: 18 }}>
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
          <Field label="Role"><Input value={devFlowUser?.role || "PROJECT_MANAGER"} readOnly /></Field>
          {devFlowUserError && <Badge tone="red">{compactDevFlowError(devFlowUserError)}</Badge>}
        </div>
      </Card>
    </PMBackendPendingView>
  );
}
