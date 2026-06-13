// @ts-nocheck
"use client";

import { PMBackendPendingView } from "@/features/pm/shared/components/pm-backend-pending-view";

export function PMClientProfileView({ clientId }: { clientId: string }) {
  return (
    <PMBackendPendingView
      title="Client Profile"
      subtitle={`Client profile ${clientId || ""} is waiting for a real client account API. Static company timelines, contracts, notes, and messages have been removed.`}
      primaryRoute="/pm/clients"
      primaryLabel="Back to clients"
      pending={[
        "Client profile lookup by organization/contact id.",
        "Client documents, contracts, notes, and communications scoped to that profile.",
        "Backend relationship between projects, client organizations, and client users.",
      ]}
    />
  );
}
