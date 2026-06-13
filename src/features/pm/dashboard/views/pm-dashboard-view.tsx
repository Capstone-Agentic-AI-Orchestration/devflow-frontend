// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconBell, IconFolder, IconRefresh, IconUsers } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { useDevFlowProjects } from "@/shared/hooks/use-devflow-projects";
import { useDevFlowNotifications } from "@/shared/hooks/use-devflow-notifications";
import { BackendAwareRouteState } from "@/shared/components/backend-aware-route-state";
import { compactDevFlowError, devflowStatusView, formatDevFlowDate } from "@/shared/utils/devflow-projects";

export function PMDashboardView() {
  const router = useRouter();
  const { projects, loading, error, refresh } = useDevFlowProjects();
  const notifications = useDevFlowNotifications();
  const activeProjects = projects.filter((project) => !["DELIVERED", "FAILED"].includes(project.status));

  return (
    <div data-screen-label="PM - Dashboard">
      <PMPageHeader
        title="Operations dashboard"
        subtitle="Backend projects, role-scoped notifications, and honest pending modules."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={() => { refresh(); notifications.refresh(); }}>Refresh</Button>
            <Button variant="primary" size="sm" iconRight={<IconArrowRight size={14} />} onClick={() => router.push("/pm/projects")}>Projects</Button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Metric icon={<IconFolder size={17} />} label="Visible projects" value={loading ? "..." : String(projects.length)} sub={error ? compactDevFlowError(error) : "Scoped by backend access"} />
        <Metric icon={<IconUsers size={17} />} label="Active projects" value={loading ? "..." : String(activeProjects.length)} sub="Not delivered or failed" />
        <Metric icon={<IconBell size={17} />} label="Unread notifications" value={notifications.loading ? "..." : String(notifications.unreadCount)} sub={notifications.error ? compactDevFlowError(notifications.error) : "From notification API"} />
      </div>

      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div className="row" style={{ padding: 18, borderBottom: "1px solid var(--border)", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Backend project queue</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Current projects returned for this PM account.</p>
          </div>
          <Badge tone="blue">{loading ? "Loading" : `${projects.length} projects`}</Badge>
        </div>
        {error ? (
          <div style={{ padding: 24, color: "#FCA5A5" }}>{compactDevFlowError(error)}</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: 24, color: "var(--text-3)" }}>{loading ? "Loading projects..." : "No backend projects are assigned to this PM account yet."}</div>
        ) : (
          projects.slice(0, 6).map((project, index) => {
            const status = devflowStatusView(project.status);
            return (
              <button key={project.id} onClick={() => router.push(`/pm/project/${project.id}`)} style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) 1fr 1fr 36px", gap: 14, alignItems: "center", padding: "14px 18px", border: 0, borderBottom: index === projects.length - 1 ? 0 : "1px solid var(--border)", background: "transparent", color: "white", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{project.companyName}</div>
                  <div className="mono" style={{ color: "var(--text-3)", fontSize: 11, marginTop: 3 }}>{project.id}</div>
                </div>
                <Badge tone={status.tone}>{status.label}</Badge>
                <div style={{ color: "var(--text-2)", fontSize: 12 }}>{formatDevFlowDate(project.createdAt)}</div>
                <IconArrowRight size={14} style={{ color: "var(--text-3)" }} />
              </button>
            );
          })
        )}
      </Card>

      <BackendAwareRouteState
        title="Schedule, pipeline analytics, and SLA widgets need backend modules"
        subtitle="The old dashboard showed static schedules, token spend, and availability numbers. Those have been removed from this dashboard until calendar, usage, and staffing APIs exist."
        projects={projects}
        loading={loading}
        error={error}
        pending={["Calendar and meeting source", "AI/token usage aggregation", "Developer capacity and availability", "Inquiry intake service"]}
        primaryAction={{ label: "Open projects", onClick: () => router.push("/pm/projects") }}
      />
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
