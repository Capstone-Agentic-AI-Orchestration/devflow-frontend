// @ts-nocheck
"use client";

import { PMBackendPendingView } from "@/features/pm/shared/components/pm-backend-pending-view";

export function PMCalendarView() {
  return (
    <PMBackendPendingView
      title="Calendar"
      subtitle="Calendar events are no longer mocked. Project milestones and meetings need a backend event model before this page can render schedule data."
      pending={[
        "Calendar event API with project, owner, start/end, timezone, and type.",
        "Meeting linkage to clients/developers and notification reminders.",
        "Filters for PM-owned projects and cross-persona visibility rules.",
      ]}
    />
  );
}
