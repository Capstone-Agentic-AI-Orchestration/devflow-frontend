// @ts-nocheck
"use client";

import { PMBackendPendingView } from "@/features/pm/shared/components/pm-backend-pending-view";

export function PMDevProfileView({ devInitials }: { devInitials: string }) {
  return (
    <PMBackendPendingView
      title="Developer Profile"
      subtitle={`Developer profile ${devInitials || ""} needs a real developer directory API before profile, workload, and review details can be shown.`}
      primaryRoute="/pm/team"
      primaryLabel="Back to team"
      pending={[
        "Developer lookup by backend user id.",
        "Skills, workload, availability, and assigned project summary.",
        "Performance/activity history sourced from project tasks and work orders.",
      ]}
    />
  );
}
