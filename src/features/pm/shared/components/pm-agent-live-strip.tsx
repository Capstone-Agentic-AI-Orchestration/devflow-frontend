// @ts-nocheck
"use client";

import { Badge, Card } from "@/shared/components/ui";
import { IconCpu } from "@/shared/components/icons";

export function AgentLiveStrip({ scoped = false }) {
  return (
    <Card glass style={{ padding: 18, borderRadius: 16 }}>
      <div className="row gap-3" style={{ alignItems: "flex-start" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(251,191,36,.12)", color: "#FBBF24", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <IconCpu size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            <Badge tone="amber">Orchestration pending</Badge>
            <Badge tone="gray">{scoped ? "Project scoped" : "Global"}</Badge>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "10px 0 0" }}>Agent live view is not connected yet</h3>
          <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6, margin: "6px 0 0" }}>
            Runtime agents, model names, statuses, and project activity should come from the orchestration backend. This strip intentionally avoids simulated live activity.
          </p>
        </div>
      </div>
    </Card>
  );
}
