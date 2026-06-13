// @ts-nocheck
"use client";

import { PMBackendPendingView } from "@/features/pm/shared/components/pm-backend-pending-view";

export function PMReportsView() {
  return (
    <PMBackendPendingView
      title="Reports"
      subtitle="Reports should be computed from real project, task, delivery, and usage records. Static KPI packs have been removed."
      pending={[
        "Reporting API for PM-owned projects with time ranges and metric definitions.",
        "Delivery, risk, health, task, and client satisfaction metrics backed by persisted data.",
        "Export generation for CSV/PDF reports.",
      ]}
    />
  );
}
