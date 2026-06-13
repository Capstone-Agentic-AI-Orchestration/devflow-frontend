// @ts-nocheck
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconFolder, IconRefresh, IconUsers, IconWorkflow } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { useDevFlowProjectDirectory } from "@/shared/hooks/use-devflow-projects";
import { compactDevFlowError, devflowLifecycleView, formatDevFlowDate, projectInitials } from "@/shared/utils/devflow-projects";

export function PMTeamView() {
  const router = useRouter();
  const { projects, loading, error, refresh } = useDevFlowProjectDirectory();
  const developers = useMemo(() => deriveDevelopers(projects), [projects]);
  const assignedProjects = new Set(developers.flatMap((developer) => developer.projects.map((project) => project.id))).size;
  const activeWorkOrders = developers.reduce((sum, developer) => sum + developer.activeWorkOrders, 0);

  return (
    <div data-screen-label="PM - Team">
      <PMPageHeader
        title="Team"
        subtitle="Developer roster derived from backend project membership and lifecycle signals."
        actions={<Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={refresh}>Refresh</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Metric icon={<IconUsers size={17} />} label="Developers" value={loading ? "..." : String(developers.length)} sub="DEV project members" />
        <Metric icon={<IconFolder size={17} />} label="Assigned projects" value={loading ? "..." : String(assignedProjects)} sub="Across PM-visible projects" />
        <Metric icon={<IconWorkflow size={17} />} label="Active handoffs" value={loading ? "..." : String(activeWorkOrders)} sub="Lifecycle work-order signal" />
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: 18, borderBottom: "1px solid var(--border)", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Backend developer roster</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Current DEV members grouped across assigned projects.</p>
          </div>
          <Badge tone="blue">{loading ? "Loading" : `${developers.length} developers`}</Badge>
        </div>

        {error ? (
          <div style={{ padding: 24, color: "#FCA5A5" }}>{compactDevFlowError(error)}</div>
        ) : developers.length === 0 ? (
          <div style={{ padding: 24, color: "var(--text-3)" }}>{loading ? "Loading team..." : "No developers are assigned to backend projects yet."}</div>
        ) : (
          developers.map((developer, index) => {
            const primary = developer.projects[0];
            const lifecycle = devflowLifecycleView(primary);
            return (
              <button
                key={developer.id}
                onClick={() => router.push(`/pm/project/${primary.id}`)}
                style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr) 160px 34px", gap: 14, alignItems: "center", padding: "15px 18px", border: 0, borderBottom: index === developers.length - 1 ? 0 : "1px solid var(--border)", background: "transparent", color: "white", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
              >
                <div className="row gap-3" style={{ minWidth: 0 }}>
                  <Avatar label={developer.name} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{developer.name}</div>
                    <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{developer.email}</div>
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{primary.companyName}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{developer.projects.length} project{developer.projects.length === 1 ? "" : "s"} - updated {formatDevFlowDate(primary.updatedAt)}</div>
                </div>
                <div className="row gap-2" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <Badge tone={developer.activeWorkOrders > 0 ? "purple" : "gray"}>{developer.activeWorkOrders} active handoff{developer.activeWorkOrders === 1 ? "" : "s"}</Badge>
                  <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
                </div>
                <IconArrowRight size={14} style={{ color: "var(--text-3)" }} />
              </button>
            );
          })
        )}
      </Card>
    </div>
  );
}

function deriveDevelopers(projects) {
  const developers = new Map();

  for (const project of projects) {
    for (const member of project.members || []) {
      if (member.role !== "DEV") continue;
      const existing = developers.get(member.userId) || {
        id: member.userId,
        name: member.user.fullName || member.user.email || member.userId,
        email: member.user.email || "No email",
        projects: [],
        activeWorkOrders: 0,
      };
      existing.projects.push(project);
      existing.activeWorkOrders += project.lifecycle?.signals?.activeWorkOrders || 0;
      developers.set(member.userId, existing);
    }
  }

  return Array.from(developers.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function Avatar({ label }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #4F8BFF, #8B5CF6)", color: "white", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
      {projectInitials(label)}
    </div>
  );
}

function Metric({ icon, label, value, sub }) {
  return (
    <Card style={{ padding: 16 }}>
      <div className="row gap-2" style={{ color: "#93C5FD" }}>{icon}<span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span></div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{value}</div>
      <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}
