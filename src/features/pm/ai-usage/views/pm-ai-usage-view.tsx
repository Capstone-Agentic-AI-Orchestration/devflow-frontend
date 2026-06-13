// @ts-nocheck
"use client";

import { PMBackendPendingView } from "@/features/pm/shared/components/pm-backend-pending-view";

export function PMAIUsageView() {
  return (
    <PMBackendPendingView
      title="AI Usage"
      subtitle="AI spend, provider usage, and agent token metrics should come from the orchestration backend. Demo spend data has been removed."
      pending={[
        "Usage metering API by project, provider, agent, model, and time window.",
        "Cost attribution and budget thresholds tied to project ownership.",
        "Orchestration run linkage from usage records to artifacts and approvals.",
      ]}
    />
  );
}
