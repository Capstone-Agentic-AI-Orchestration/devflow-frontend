// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconClipboard, IconFolder, IconRefresh, IconUsers, IconWorkflow } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { getDevFlowPmSummary } from "@/shared/api/devflow-api";
import { compactDevFlowError, devflowLifecycleView, formatDevFlowDate } from "@/shared/utils/devflow-projects";

export function PMReportsView() {
  const router = useRouter();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setSummary(await getDevFlowPmSummary());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusRows = useMemo(() => Object.entries(summary?.projectStatusCounts || {}).sort(([a], [b]) => a.localeCompare(b)), [summary]);

  return (
    <div data-screen-label="PM Reports">
      <PMPageHeader
        title="Reports"
        subtitle="Operational summary computed from existing backend project, inquiry, task, invite, and work-order records."
        actions={<Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={load}>Refresh</Button>}
      />

      {error && <Card style={{ padding: 18, color: "#FCA5A5", marginBottom: 20 }}>{compactDevFlowError(error)}</Card>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Metric icon={<IconFolder size={17} />} label="Projects" value={loading ? "..." : summary?.totals.projects ?? 0} sub="PM-visible projects" />
        <Metric icon={<IconUsers size={17} />} label="Pending invites" value={loading ? "..." : summary?.totals.pendingInvites ?? 0} sub="Client onboarding" />
        <Metric icon={<IconClipboard size={17} />} label="Open tasks" value={loading ? "..." : summary?.totals.openTasks ?? 0} sub="Not done yet" />
        <Metric icon={<IconWorkflow size={17} />} label="Active work orders" value={loading ? "..." : summary?.totals.activeWorkOrders ?? 0} sub="In-flight handoffs" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, .9fr) minmax(0, 1.1fr)", gap: 16 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Projects by status</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Counts use current project statuses.</p>
          </div>
          {statusRows.length === 0 ? (
            <div style={{ padding: 24, color: "var(--text-3)" }}>{loading ? "Loading report..." : "No project statuses to report yet."}</div>
          ) : (
            statusRows.map(([status, count]) => (
              <div key={status} className="row" style={{ padding: "13px 18px", justifyContent: "space-between", borderBottom: "1px solid var(--border)" }}>
                <Badge tone={statusTone(status)}>{status.replaceAll("_", " ")}</Badge>
                <strong>{count}</strong>
              </div>
            ))
          )}
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent projects</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Latest backend projects with lifecycle signal.</p>
          </div>
          {summary?.recentProjects?.length ? (
            summary.recentProjects.map((project, index) => {
              const lifecycle = devflowLifecycleView(project);
              return (
                <button key={project.id} onClick={() => router.push(`/pm/project/${project.id}`)} style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 30px", gap: 12, alignItems: "center", padding: "14px 18px", border: 0, borderBottom: index === summary.recentProjects.length - 1 ? 0 : "1px solid var(--border)", background: "transparent", color: "white", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{project.companyName}</div>
                    <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>Updated {formatDevFlowDate(project.updatedAt)}</div>
                  </div>
                  <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
                  <IconArrowRight size={14} style={{ color: "var(--text-3)" }} />
                </button>
              );
            })
          ) : (
            <div style={{ padding: 24, color: "var(--text-3)" }}>{loading ? "Loading projects..." : "No recent projects yet."}</div>
          )}
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: "hidden", marginTop: 16 }}>
        <div className="row" style={{ padding: 18, borderBottom: "1px solid var(--border)", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Recent inquiries</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Last intake records included in the PM summary.</p>
          </div>
          <Badge tone="blue">{loading ? "Loading" : `${summary?.totals.recentInquiries ?? 0} recent`}</Badge>
        </div>
        {summary?.recentInquiries?.length ? (
          summary.recentInquiries.map((inquiry, index) => (
            <div key={inquiry.id} className="row" style={{ padding: "14px 18px", borderBottom: index === summary.recentInquiries.length - 1 ? 0 : "1px solid var(--border)", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{inquiry.companyName}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{inquiry.contactName} - {inquiry.email}</div>
              </div>
              <div className="row gap-2">
                <Badge tone={inquiry.status === "APPROVED" ? "green" : inquiry.status === "REJECTED" ? "red" : "blue"}>{inquiry.status}</Badge>
                <span style={{ color: "var(--text-3)", fontSize: 12 }}>{formatDevFlowDate(inquiry.createdAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: 24, color: "var(--text-3)" }}>{loading ? "Loading inquiries..." : "No recent inquiries yet."}</div>
        )}
      </Card>
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

function statusTone(status) {
  if (status === "DELIVERED") return "green";
  if (status === "FAILED") return "red";
  if (status.includes("AWAITING")) return "amber";
  if (status.includes("GENERATING") || status.includes("COMMITTING")) return "purple";
  return "blue";
}
