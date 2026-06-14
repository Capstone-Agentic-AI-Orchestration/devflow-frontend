// TODO: remove @ts-nocheck and fix types
// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, Input, Textarea } from "@/shared/components/ui";
import { OrchestrationProviderStatusPanel } from "@/shared/components/orchestration/orchestration-provider-status-panel";
import { OrchestrationLiveVisualizer } from "@/shared/components/orchestration/orchestration-live-visualizer";
import { getDevFlowOrchestrationRuns, getDevFlowProjectEvents } from "@/shared/api/devflow-api";
import { useDevFlowOrchestrationProviderStatus, useDevFlowProjectOutputs, useDevFlowProjects } from "@/shared/hooks/use-devflow-projects";
import { compactDevFlowError } from "@/shared/utils/devflow-projects";
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowRight,
  IconBell,
  IconCheck,
  IconCpu,
  IconCreditCard,
  IconDatabase,
  IconDownload,
  IconFileText,
  IconFolder,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconShield,
  IconUsers,
} from "@/shared/components/icons";
import {
  ADMIN,
  ADMIN_ALERTS,
  AGENT_AGGREGATE,
  AGENT_DEFS,
  AGENT_KEYS,
  ALL_USERS,
  AUDIT_LOG,
  EXECS,
  INCIDENTS,
  LIVE_PIPELINES,
  PROJECTS,
  PROJECT_COSTS,
  PROVIDER_HEALTH,
  SERVICES,
  WORKFLOW_VERSIONS,
} from "@/features/admin/shared/model/admin.mock";

function AdminPageHeader({ title, subtitle, actions }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-3)", fontSize: 13.5, marginTop: 6 }}>{subtitle}</p>}
        <div style={{ marginTop: 8 }}><Badge tone="amber">Admin demo data</Badge></div>
      </div>
      {actions && <div className="row gap-2" style={{ alignItems: "center", flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

function StatCard({ label, value, sub, icon, tint = "#4F8BFF" }) {
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${tint}22`, color: tint, border: `1px solid ${tint}44`, display: "grid", placeItems: "center" }}>{icon}</div>
      <div style={{ color: "var(--text-2)", fontSize: 12, marginTop: 14 }}>{label}</div>
      <div style={{ fontSize: 23, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

function StatusPill({ state }) {
  const map = {
    operational: { bg: "rgba(16,185,129,.15)", fg: "#6EE7B7", border: "rgba(16,185,129,.30)" },
    degraded: { bg: "rgba(245,158,11,.15)", fg: "#FBBF24", border: "rgba(245,158,11,.30)" },
    high: { bg: "rgba(239,68,68,.15)", fg: "#FCA5A5", border: "rgba(239,68,68,.30)" },
    medium: { bg: "rgba(245,158,11,.15)", fg: "#FBBF24", border: "rgba(245,158,11,.30)" },
    low: { bg: "rgba(148,163,184,.10)", fg: "#94A3B8", border: "rgba(148,163,184,.25)" },
    active: { bg: "rgba(16,185,129,.15)", fg: "#6EE7B7", border: "rgba(16,185,129,.30)" },
    pending: { bg: "rgba(245,158,11,.15)", fg: "#FBBF24", border: "rgba(245,158,11,.30)" },
    suspended: { bg: "rgba(239,68,68,.15)", fg: "#FCA5A5", border: "rgba(239,68,68,.30)" },
  }[state] || { bg: "rgba(148,163,184,.10)", fg: "#94A3B8", border: "rgba(148,163,184,.25)" };
  return <span style={{ padding: "2px 8px", borderRadius: 999, background: map.bg, color: map.fg, border: `1px solid ${map.border}`, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{state}</span>;
}

export function AdminOverviewView() {
  return (
    <div data-screen-label="Admin - Overview">
      <AdminPageHeader title="Platform Overview" subtitle="Live platform operations, provider health, and critical alerts." actions={<Button variant="secondary" size="sm" icon={<IconRefresh size={13} />}>Refresh</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Live pipelines" value={LIVE_PIPELINES.length} sub="Across all personas" icon={<IconCpu size={16} />} />
        <StatCard label="Active users" value="142" sub="16 admins, PMs, devs, clients" icon={<IconUsers size={16} />} tint="#10B981" />
        <StatCard label="Monthly token spend" value="$4.8k" sub="12% below cap" icon={<IconCreditCard size={16} />} tint="#A78BFA" />
        <StatCard label="Provider health" value="3/4" sub="Gemini degraded" icon={<IconDatabase size={16} />} tint="#F59E0B" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 1fr)", gap: 18 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Live pipelines</h3></div>
          {LIVE_PIPELINES.map((run, index) => <PipelineRow key={run.id} run={run} border={index < LIVE_PIPELINES.length - 1} />)}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>Provider health</h3>
            {PROVIDER_HEALTH.map((provider) => <ProviderRow key={provider.name} provider={provider} />)}
          </Card>
          <Card style={{ padding: 18, border: "1px solid rgba(239,68,68,.25)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>Critical alerts</h3>
            {ADMIN_ALERTS.map((alert) => <AlertRow key={alert.text} alert={alert} />)}
          </Card>
        </div>
      </div>
    </div>
  );
}

function PipelineRow({ run, border }) {
  return (
    <div className="row gap-3" style={{ padding: "13px 16px", borderBottom: border ? "1px solid var(--border)" : 0, alignItems: "center" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(79,139,255,.12)", color: "#93C5FD", display: "grid", placeItems: "center", flexShrink: 0 }}><IconCpu size={15} /></div>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{run.project}</div><div className="mono" style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>{run.id} - {run.client} - {run.phase}</div></div>
      <span style={{ color: "#93C5FD", fontSize: 11 }}>{run.activeAgents.length} agents</span>
      <StatusPill state={run.status} />
    </div>
  );
}

function ProviderRow({ provider }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="row" style={{ justifyContent: "space-between" }}><span style={{ fontWeight: 600, fontSize: 13 }}>{provider.name}</span><StatusPill state={provider.status} /></div>
      <div className="row" style={{ justifyContent: "space-between", color: "var(--text-3)", fontSize: 11.5, marginTop: 6 }}><span>{provider.latency}</span><span>{provider.errorRate}</span><span>{provider.quota}% quota</span></div>
    </div>
  );
}

function AlertRow({ alert }) {
  return <div className="row gap-3" style={{ padding: "9px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}><IconAlertTriangle size={14} style={{ color: alert.severity === "high" ? "#FCA5A5" : "#FBBF24", flexShrink: 0, marginTop: 2 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.45 }}>{alert.text}</div><div style={{ fontSize: 10.5, color: "var(--text-3)", marginTop: 3 }}>{alert.kind} - {alert.time}</div></div><StatusPill state={alert.severity} /></div>;
}

export function AdminOrchestrationView() {
  const projectsState = useDevFlowProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const selectedProject = projectsState.projects.find((project) => project.id === selectedProjectId) || projectsState.projects[0] || null;
  const effectiveProjectId = selectedProject?.id || "";
  const provider = useDevFlowOrchestrationProviderStatus(effectiveProjectId);
  const outputs = useDevFlowProjectOutputs(effectiveProjectId, { includeEvents: false, includeWorkOrders: true });
  const [runs, setRuns] = useState([]);
  const [events, setEvents] = useState([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [runsError, setRunsError] = useState("");
  const latestRun = runs[0] || null;
  const executions = runs.flatMap((run) => run.executions || []);
  const succeededExecutions = executions.filter((execution) => execution.status === "SUCCEEDED").length;
  const failedExecutions = executions.filter((execution) => execution.status === "FAILED").length;
  const activeExecutions = executions.filter((execution) => execution.status === "RUNNING").length;

  const refreshRuns = async (projectId = effectiveProjectId, quiet = false) => {
    if (!projectId) {
      setRuns([]);
      setEvents([]);
      setRunsLoading(false);
      setRunsError("");
      return;
    }

    if (!quiet) setRunsLoading(true);
    setRunsError("");
    try {
      const [nextRuns, nextEvents] = await Promise.all([
        getDevFlowOrchestrationRuns(projectId),
        getDevFlowProjectEvents(projectId),
      ]);
      setRuns(nextRuns);
      setEvents(nextEvents);
    } catch (nextError) {
      setRuns([]);
      setEvents([]);
      setRunsError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      if (!quiet) setRunsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedProjectId && projectsState.projects[0]?.id) setSelectedProjectId(projectsState.projects[0].id);
  }, [projectsState.projects, selectedProjectId]);

  useEffect(() => {
    void refreshRuns(effectiveProjectId);
  }, [effectiveProjectId]);

  useEffect(() => {
    const activeRun = runs.some((run) => run.status === "RUNNING");
    const activeWorkOrder = outputs.workOrders.some((workOrder) => workOrder.status === "DISPATCHED");
    if (!effectiveProjectId || (!activeRun && !activeWorkOrder)) return;

    let mounted = true;
    let pending = false;
    const refreshLiveSnapshot = async () => {
      if (pending) return;
      pending = true;
      try {
        await Promise.all([
          refreshRuns(effectiveProjectId, true),
          provider.refresh?.(),
          outputs.refresh?.(),
        ]);
      } catch {
        // Existing panels expose request failures; keep the live loop quiet.
      } finally {
        if (mounted) pending = false;
      }
    };

    const timer = window.setInterval(refreshLiveSnapshot, 4000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [effectiveProjectId, runs.length, latestRun?.status, outputs.workOrders.length]);

  const refresh = () => {
    projectsState.refresh();
    provider.refresh();
    outputs.refresh();
    refreshRuns();
  };

  return (
    <div data-screen-label="Admin - Orchestration">
      <AdminPageHeader title="AI Orchestration" subtitle="Backend orchestration runs, provider status, execution results, and recent event logs." actions={<Button variant="secondary" size="sm" icon={<IconRefresh size={13} />} onClick={refresh}>Refresh</Button>} />
      <Card style={{ padding: 22, marginBottom: 18 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 14, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Project runtime</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Choose a backend project to inspect durable orchestration state.</p>
          </div>
          <Field label="Project">
            <select className="input select" value={effectiveProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} style={{ minWidth: 300 }}>
              {projectsState.projects.map((project) => (
                <option key={project.id} value={project.id}>{project.companyName}</option>
              ))}
            </select>
          </Field>
        </div>
        {projectsState.error && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginBottom: 12 }}>{compactDevFlowError(projectsState.error)}</div>}
        {!projectsState.loading && !selectedProject ? (
          <div style={{ color: "var(--text-3)", fontSize: 13 }}>No backend projects are available to inspect.</div>
        ) : (
          <OrchestrationProviderStatusPanel status={provider.status} loading={projectsState.loading || provider.loading} error={provider.error ? compactDevFlowError(provider.error) : ""} compact />
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 16 }}>
          <StatCard label="Runs" value={runsLoading ? "..." : String(runs.length)} sub={latestRun ? `${latestRun.trigger} latest` : "No runs recorded"} icon={<IconCpu size={16} />} />
          <StatCard label="Executions" value={runsLoading ? "..." : String(executions.length)} sub={`${succeededExecutions} succeeded, ${failedExecutions} failed`} icon={<IconWorkflowIcon />} tint="#10B981" />
          <StatCard label="Running" value={String(activeExecutions)} sub={latestRun?.currentNode || "No active node"} icon={<IconActivity size={16} />} tint="#F59E0B" />
          <StatCard label="Events" value={runsLoading ? "..." : String(events.length)} sub="Project event log records" icon={<IconFileText size={16} />} tint="#A78BFA" />
        </div>
      </Card>
      <div style={{ marginBottom: 18 }}>
        <OrchestrationLiveVisualizer
          project={selectedProject}
          providerStatus={provider.status}
          runs={runs}
          workOrders={outputs.workOrders}
          artifacts={outputs.artifacts}
          events={events}
          loading={runsLoading || outputs.loading || provider.loading}
        />
        {outputs.error && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 8 }}>{compactDevFlowError(outputs.error)}</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) 360px", gap: 18 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Run history</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>{runs.length} durable backend orchestration run{runs.length === 1 ? "" : "s"}</p>
            {runsError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 8 }}>{compactDevFlowError(runsError)}</div>}
          </div>
          {runsLoading ? (
            <div style={{ padding: 18, color: "var(--text-2)" }}>Loading orchestration runs...</div>
          ) : runs.length === 0 ? (
            <div style={{ padding: 18, color: "var(--text-3)" }}>No orchestration runs recorded for this project.</div>
          ) : runs.map((run) => <AdminRunRow key={run.id} run={run} />)}
        </Card>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent events</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Event log records from the selected project</p>
          </div>
          {events.length === 0 ? (
            <div style={{ padding: 18, color: "var(--text-3)" }}>No event logs yet.</div>
          ) : events.slice(0, 8).map((event) => (
            <div key={event.id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: 12.5 }}>{event.nodeName}</div>
              <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{event.eventType} - {formatAdminDate(event.occurredAt)} - {event.runTokens} tokens</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function AdminRunRow({ run }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div className="mono" style={{ color: "white", fontSize: 12, fontWeight: 800, overflowWrap: "anywhere" }}>{run.runId}</div>
          <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>{run.trigger} - {run.currentNode || "No active node"} - {formatAdminDate(run.startedAt)}</div>
        </div>
        <Badge tone={run.status === "SUCCEEDED" ? "green" : run.status === "FAILED" ? "red" : run.status === "RUNNING" ? "blue" : "gray"}>{run.status}</Badge>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        <Badge tone="green">{run.completedWorkOrders} done</Badge>
        <Badge tone={run.failedWorkOrders ? "red" : "gray"}>{run.failedWorkOrders} failed</Badge>
        <Badge tone="blue">{run.completedArtifacts} artifacts</Badge>
        <Badge tone="purple">{run.providerMode}</Badge>
      </div>
      {run.executions?.length ? (
        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          {run.executions.slice(0, 3).map((execution) => (
            <div key={execution.id} className="row" style={{ justifyContent: "space-between", gap: 8, color: "var(--text-2)", fontSize: 11.5 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{execution.workOrder?.title || execution.workOrderId}</span>
              <span className="mono">{execution.status}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function IconWorkflowIcon() {
  return <IconCpu size={16} />;
}

function formatAdminDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function AdminCostView() {
  return (
    <div data-screen-label="Admin - Cost">
      <AdminPageHeader title="Cost & Billing" subtitle="Token spend, Project costs, budget utilization, and Margin health." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard label="Token spend" value="$4,820" sub="Month to date" icon={<IconCreditCard size={16} />} tint="#A78BFA" />
        <StatCard label="Gross margin" value="71%" sub="Margin after AI provider costs" icon={<IconActivity size={16} />} tint="#10B981" />
        <StatCard label="At-risk budgets" value="2" sub="HH and KB need review" icon={<IconAlertTriangle size={16} />} tint="#F59E0B" />
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Project costs</h3></div>
        {PROJECT_COSTS.map((cost) => <div key={cost.id} className="row" style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)", gap: 12 }}><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{cost.project}</div><div className="mono" style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>{cost.id} - {cost.client} - SLA {cost.sla}</div></div><span className="mono" style={{ width: 70, color: "var(--text-2)" }}>{cost.tokens}</span><span className="mono" style={{ width: 80, color: "white", fontWeight: 600 }}>{cost.cost}</span><StatusPill state={cost.profitable ? "active" : "high"} /></div>)}
      </Card>
    </div>
  );
}

export function AdminProvidersView() {
  const projectsState = useDevFlowProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const selectedProject = projectsState.projects.find((project) => project.id === selectedProjectId) || projectsState.projects[0] || null;
  const effectiveProjectId = selectedProject?.id || "";
  const provider = useDevFlowOrchestrationProviderStatus(effectiveProjectId);

  useEffect(() => {
    if (!selectedProjectId && projectsState.projects[0]?.id) setSelectedProjectId(projectsState.projects[0].id);
  }, [projectsState.projects, selectedProjectId]);

  const refresh = () => {
    projectsState.refresh();
    provider.refresh();
  };

  return (
    <div data-screen-label="Admin - Providers">
      <AdminPageHeader title="AI Providers" subtitle="Backend provider selection, adapter readiness, and missing runtime requirements." actions={<Button variant="secondary" size="sm" icon={<IconRefresh size={13} />} onClick={refresh}>Refresh</Button>} />

      <Card style={{ padding: 20, marginBottom: 18 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ minWidth: 260, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Project-scoped provider check</div>
            <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>Provider status is protected by project access and reflects the backend orchestration runtime.</div>
          </div>
          <Field label="Project">
            <select className="input select" value={effectiveProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} style={{ minWidth: 280 }}>
              {projectsState.projects.map((project) => (
                <option key={project.id} value={project.id}>{project.companyName}</option>
              ))}
            </select>
          </Field>
        </div>
        {projectsState.error && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 10 }}>{compactDevFlowError(projectsState.error)}</div>}
        {!projectsState.loading && !selectedProject ? (
          <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 14 }}>No backend projects are available for provider inspection.</div>
        ) : (
          <div style={{ marginTop: 16 }}>
            <OrchestrationProviderStatusPanel status={provider.status} loading={projectsState.loading || provider.loading} error={provider.error ? compactDevFlowError(provider.error) : ""} />
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {(provider.status?.providers || []).map((providerItem) => (
          <Card key={providerItem.mode} style={{ padding: 20 }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{providerItem.displayName}</h3>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>{providerItem.mode.toUpperCase()} adapter</div>
              </div>
              <Badge tone={providerItem.available ? "green" : providerItem.implemented ? "amber" : "gray"}>{providerItem.active ? "Active" : providerItem.available ? "Ready" : "Unavailable"}</Badge>
            </div>
            <div style={{ color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.5, minHeight: 38 }}>{providerItem.reason || "Provider can execute orchestration work orders."}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              <ProviderStatusFact label="Implemented" value={providerItem.implemented ? "Yes" : "No"} />
              <ProviderStatusFact label="Available" value={providerItem.available ? "Yes" : "No"} />
            </div>
            {providerItem.missingRequirements?.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
                {providerItem.missingRequirements.map((requirement) => <Badge key={requirement} tone="amber">{requirement}</Badge>)}
              </div>
            ) : null}
          </Card>
        ))}
        {!provider.loading && !provider.status?.providers?.length && (
          <Card style={{ padding: 20, color: "var(--text-3)" }}>Provider adapters appear after selecting an accessible backend project.</Card>
        )}
      </div>
    </div>
  );
}

function ProviderStatusFact({ label, value }) {
  return <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, background: "rgba(8,14,32,.45)" }}><div style={{ color: "var(--text-3)", fontSize: 11 }}>{label}</div><div style={{ color: "white", fontWeight: 800, fontSize: 13, marginTop: 3 }}>{value}</div></div>;
}

export function AdminUsersView() {
  const [role, setRole] = useState("All");
  const filtered = role === "All" ? ALL_USERS : ALL_USERS.filter((user) => user.role === role);
  return (
    <div data-screen-label="Admin - Users">
      <AdminPageHeader title="User Management" subtitle="Admins, PMs, developers, and Clients." actions={<><select className="input select" value={role} onChange={(event) => setRole(event.target.value)} style={{ height: 32 }}><option>All</option><option>PM</option><option>Dev</option><option>Client</option><option>Admin</option></select><Button variant="primary" size="sm" icon={<IconUsers size={13} />}>Invite user</Button></>} />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {filtered.map((user, index) => <div key={user.email} className="row" style={{ padding: "13px 16px", borderBottom: index < filtered.length - 1 ? "1px solid var(--border)" : 0, gap: 12, alignItems: "center" }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: user.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>{user.initials}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div><div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{user.email}</div></div><Badge tone={user.role === "Client" ? "blue" : user.role === "Dev" ? "purple" : "gray"}>{user.role}</Badge><span style={{ width: 80, color: "var(--text-3)", fontSize: 11 }}>{user.last}</span><StatusPill state={user.status} /></div>)}
      </Card>
    </div>
  );
}

export function AdminProjectsView() {
  return (
    <div data-screen-label="Admin - Projects">
      <AdminPageHeader title="Projects" subtitle="Platform-wide project registry, SLA status, and orchestration ownership." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {PROJECTS.slice(0, 6).map((project) => <Card key={project.id} hover style={{ padding: 20 }}><div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}><div style={{ width: 42, height: 42, borderRadius: 10, background: project.client.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>{project.client.short}</div><StatusPill state={project.status} /></div><h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{project.name}</h3><div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>{project.client.name} - {project.id}</div><div style={{ marginTop: 14 }}><div className="row" style={{ justifyContent: "space-between", fontSize: 11 }}><span>SLA progress</span><span>{project.progress}%</span></div><div style={{ height: 6, borderRadius: 999, background: "rgba(8,14,32,.7)", marginTop: 6 }}><div style={{ width: `${project.progress}%`, height: "100%", borderRadius: 999, background: "#4F8BFF" }} /></div></div><div className="row" style={{ justifyContent: "space-between", color: "var(--text-3)", fontSize: 11.5, marginTop: 14 }}><span>{project.contractValue}</span><span>{project.targetDate}</span></div></Card>)}
      </div>
    </div>
  );
}

export function AdminAuditView() {
  return (
    <div data-screen-label="Admin - Audit">
      <AdminPageHeader title="Audit Log" subtitle="Security-relevant platform activity, key.reveal events, login.success, and impersonate sessions." actions={<Button variant="secondary" size="sm" icon={<IconDownload size={13} />}>Export CSV</Button>} />
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {AUDIT_LOG.map((row, index) => <div key={`${row.time}-${row.action}`} className="row" style={{ padding: "12px 16px", borderBottom: index < AUDIT_LOG.length - 1 ? "1px solid var(--border)" : 0, gap: 12, alignItems: "flex-start" }}><span className="mono" style={{ width: 70, color: "var(--text-3)", fontSize: 11 }}>{row.time}</span><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{row.action}</div><div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 2 }}>{row.actor} - {row.target} - {row.ip}</div><div style={{ color: "var(--text-2)", fontSize: 12, marginTop: 4 }}>{row.details}</div></div><StatusPill state={row.result ? "active" : "high"} /></div>)}
      </Card>
    </div>
  );
}

export function AdminExecsView() {
  return (
    <div data-screen-label="Admin - Execs">
      <AdminPageHeader title="Executive Comms" subtitle="Board and executive communication, Weekly executive report, and escalation threads." actions={<Button variant="primary" size="sm" icon={<IconBell size={13} />}>New update</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0, 1fr)", gap: 18 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>{EXECS.map((exec, index) => <div key={exec.email} className="row gap-3" style={{ padding: 14, borderBottom: index < EXECS.length - 1 ? "1px solid var(--border)" : 0 }}><div style={{ width: 38, height: 38, borderRadius: "50%", background: exec.color, display: "grid", placeItems: "center", color: "white", fontWeight: 700 }}>{exec.initials}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{exec.name}</div><div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{exec.role}</div></div>{exec.unread > 0 && <Badge tone="blue">{exec.unread}</Badge>}</div>)}</Card>
        <Card style={{ padding: 22 }}><h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Roy Manuel</h3><div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>CEO - Founder - Board visibility</div><div style={{ marginTop: 18, padding: 16, border: "1px solid var(--border)", borderRadius: 10, background: "rgba(8,14,32,.5)" }}><div style={{ fontWeight: 600 }}>Weekly executive report</div><p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6 }}>Provider fallback worked during Gemini degradation. Token spend is under cap, but HH and KB need budget review before Friday.</p></div><Button variant="primary" icon={<IconArrowRight size={13} />}>Send report</Button></Card>
      </div>
    </div>
  );
}

export function AdminHealthView() {
  return (
    <div data-screen-label="Admin - Health">
      <AdminPageHeader title="System Health" subtitle="Service status, incidents, provider degradation, and infrastructure latency." />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) 360px", gap: 18 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Services</h3></div>
          {SERVICES.map((service, index) => <div key={service.name} className="row" style={{ padding: "13px 16px", borderBottom: index < SERVICES.length - 1 ? "1px solid var(--border)" : 0, gap: 12, alignItems: "center" }}><div style={{ width: 34, height: 34, borderRadius: 9, background: `${service.tint}22`, color: service.tint, display: "grid", placeItems: "center" }}><IconActivity size={14} /></div><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{service.name}</div><div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{service.latency} - err {service.err} - last incident {service.lastIncident}</div></div><StatusPill state={service.status} /></div>)}
        </Card>
        <Card style={{ padding: 18 }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 12px" }}>Incidents</h3>{INCIDENTS.map((incident) => <div key={incident.time} style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10, marginBottom: 10, background: "rgba(8,14,32,.45)" }}><div className="row" style={{ justifyContent: "space-between" }}><span style={{ fontWeight: 600, fontSize: 13 }}>{incident.service}</span><StatusPill state={incident.severity === "major" ? "high" : "medium"} /></div><div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 4 }}>{incident.time}</div><div style={{ color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.5, marginTop: 6 }}>{incident.text}</div></div>)}</Card>
      </div>
    </div>
  );
}

export function AdminSettingsView() {
  const [tab, setTab] = useState("profile");
  return (
    <div data-screen-label="Admin - Settings">
      <AdminPageHeader title="Settings" subtitle="Platform profile, Security policy, Workflow defaults, billing, and provider controls." />
      <div className="tabs" style={{ marginBottom: 18 }}>{[["profile", "Platform profile"], ["security", "Security policy"], ["workflow", "Workflow defaults"], ["billing", "Billing"], ["providers", "Provider controls"]].map(([key, label]) => <button key={key} className={"tab" + (tab === key ? " active" : "")} onClick={() => setTab(key)}>{label}</button>)}</div>
      {tab === "profile" && <Card style={{ padding: 24, maxWidth: 760 }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>Platform profile</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><Field label="Admin name"><Input defaultValue={`${ADMIN.firstName} ${ADMIN.lastName}`} /></Field><Field label="Email"><Input defaultValue={ADMIN.email} /></Field><Field label="Role"><Input defaultValue={ADMIN.role} /></Field><Field label="Timezone"><Input defaultValue="Asia/Manila" /></Field></div><Button variant="primary">Save profile</Button></Card>}
      {tab === "security" && <Card style={{ padding: 24, maxWidth: 760 }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>Security policy</h3><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{["Require 2FA for PM and Admin roles", "Block key.reveal without audit reason", "Limit impersonation to 20 minutes", "Enforce client session expiry"].map((item) => <label key={item} className="row gap-3" style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}><input type="checkbox" defaultChecked style={{ accentColor: "var(--primary)" }} /><span>{item}</span></label>)}</div></Card>}
      {tab === "workflow" && <Card style={{ padding: 24, maxWidth: 760 }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>Workflow defaults</h3><Field label="Default workflow version"><select className="input select"><option>v4.1 - current</option><option>v4.0</option></select></Field><Field label="Validator retry budget"><Input defaultValue="3" /></Field><Field label="Fallback provider order"><Textarea rows={3} defaultValue="Anthropic Claude&#10;OpenAI&#10;Google Gemini" /></Field></Card>}
      {tab === "billing" && <Card style={{ padding: 24, maxWidth: 760 }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>Billing</h3><p style={{ color: "var(--text-2)" }}>Token spend alerts, project caps, and provider invoice exports.</p><Button variant="primary" icon={<IconDownload size={13} />}>Export billing report</Button></Card>}
      {tab === "providers" && <Card style={{ padding: 24, maxWidth: 760 }}><h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px" }}>Provider controls</h3>{PROVIDER_HEALTH.map((provider) => <ProviderRow key={provider.name} provider={provider} />)}</Card>}
    </div>
  );
}
