// @ts-nocheck
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconCpu, IconFileText, IconRefresh, IconWorkflow } from "@/shared/components/icons";
import { DevPageHeader } from "@/features/dev/shared/components/dev-page-header";
import { BackendAwareRouteState } from "@/shared/components/backend-aware-route-state";
import { OrchestrationProviderStatusPanel } from "@/shared/components/orchestration/orchestration-provider-status-panel";
import { OrchestrationLiveVisualizer } from "@/shared/components/orchestration/orchestration-live-visualizer";
import { useDevFlowOrchestrationProviderStatus, useDevFlowOrchestrationStatus, useDevFlowProject, useDevFlowProjectOutputs, useDevFlowProjects } from "@/shared/hooks/use-devflow-projects";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";
import { compactDevFlowError, devflowLifecycleView, formatDevFlowDate, lifecycleProgressColor } from "@/shared/utils/devflow-projects";

export function DevOrchestratorView() {
  const router = useRouter();
  const { projects, selectedProject, selectedProjectId, selectedProjectLoading, selectedProjectError, refreshProjects } = useSelectedDevFlowProject();
  const outputs = useDevFlowProjectOutputs(selectedProjectId, { includeEvents: true, includeTasks: true, includeTimeline: true, includeWorkOrders: true });
  const orchestration = useDevFlowOrchestrationStatus(selectedProjectId);
  const provider = useDevFlowOrchestrationProviderStatus(selectedProjectId);
  const lifecycle = devflowLifecycleView(selectedProject);
  const refresh = () => {
    refreshProjects();
    outputs.refresh();
    orchestration.refresh();
    provider.refresh();
  };

  useEffect(() => {
    const liveRun = Boolean(selectedProject?.runId) && !["DELIVERED", "FAILED"].includes(selectedProject?.status || "");
    const activeWorkOrder = outputs.workOrders.some((workOrder) => workOrder.status === "DISPATCHED");
    if (!selectedProjectId || (!liveRun && !activeWorkOrder)) return;

    let mounted = true;
    let pending = false;
    const refreshLiveSnapshot = async () => {
      if (pending) return;
      pending = true;
      try {
        await Promise.all([
          refreshProjects?.(),
          outputs.refresh?.(),
          orchestration.refresh?.(),
          provider.refresh?.(),
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
  }, [selectedProjectId, selectedProject?.runId, selectedProject?.status, orchestration.status?.status, outputs.workOrders.length]);

  return (
    <div data-screen-label="Dev Orchestrator" style={{ display: "grid", gap: 20 }}>
      <DevPageHeader
        title="AI Orchestrator"
        subtitle="Role-scoped orchestration status, handoffs, artifacts, and event logs for the selected project."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refresh}>Refresh projects</Button>}
      />

      {selectedProjectError || outputs.error || orchestration.error ? (
        <Card style={{ padding: 22, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>{compactDevFlowError(selectedProjectError || outputs.error || orchestration.error)}</Card>
      ) : selectedProjectLoading ? (
        <Card style={{ padding: 22, color: "var(--text-2)" }}>Loading selected project...</Card>
      ) : !selectedProject ? (
        <BackendAwareRouteState
          eyebrow="Orchestration module"
          title="No assigned project selected"
          subtitle="Orchestration status appears after this developer account is assigned to a backend project."
          projects={projects}
          loading={selectedProjectLoading}
          error={selectedProjectError}
          pending={["Project assignment through PM member management"]}
          primaryAction={{ label: "Open projects", onClick: () => router.push("/dev/projects") }}
        />
      ) : (
        <>
          <Card style={{ padding: 24 }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
                <h2 style={{ margin: "12px 0 0", fontSize: 22, fontWeight: 700 }}>{selectedProject.companyName}</h2>
                <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, marginTop: 8, maxWidth: 760 }}>{selectedProject.brief}</p>
              </div>
              <Button variant="primary" iconRight={<IconArrowRight size={14} />} onClick={() => router.push(`/dev/orchestrator/output/${selectedProject.id}`)}>Open output</Button>
            </div>
            <div style={{ marginTop: 18, maxWidth: 520 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ color: "var(--text-2)", fontSize: 12 }}>Lifecycle progress</span>
                <span className="mono" style={{ fontSize: 12, color: "white" }}>{lifecycle.progress}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "rgba(8,14,32,.7)", overflow: "hidden" }}>
                <div style={{ width: `${lifecycle.progress}%`, height: "100%", background: lifecycleProgressColor(lifecycle.tone) }} />
              </div>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
            <OrchestratorMetric icon={<IconCpu size={16} />} label="Provider" value={provider.loading ? "..." : provider.status?.activeMode?.toUpperCase() || "Unknown"} sub={provider.error || provider.status?.reason || (provider.status?.available ? "Ready" : "Not ready")} />
            <OrchestratorMetric icon={<IconCpu size={16} />} label="Run status" value={orchestration.loading ? "..." : orchestration.status?.status || "Not started"} sub={orchestration.status?.currentNode || selectedProject.runId || "No run id"} />
            <OrchestratorMetric icon={<IconWorkflow size={16} />} label="Work orders" value={outputs.loading ? "..." : String(outputs.workOrders.length)} sub={`${outputs.workOrders.filter((item) => item.status === "DISPATCHED").length} dispatched`} />
            <OrchestratorMetric icon={<IconFileText size={16} />} label="Artifacts" value={outputs.loading ? "..." : String(outputs.artifacts.length)} sub={`${outputs.artifacts.filter((item) => item.clientVisible).length} client-visible`} />
          </div>

          <OrchestrationProviderStatusPanel status={provider.status} loading={provider.loading} error={provider.error ? compactDevFlowError(provider.error) : ""} />

          <OrchestrationLiveVisualizer
            project={selectedProject}
            status={orchestration.status}
            providerStatus={provider.status}
            workOrders={outputs.workOrders}
            artifacts={outputs.artifacts}
            events={outputs.events}
            loading={outputs.loading || orchestration.loading || provider.loading}
          />

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 18 }}>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Recent orchestration events</h3>
                <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>Backend event log records for this project</p>
              </div>
              {outputs.loading ? (
                <div style={{ padding: 18, color: "var(--text-2)" }}>Loading events...</div>
              ) : outputs.events.length === 0 ? (
                <div style={{ padding: 18, color: "var(--text-3)" }}>No event logs yet.</div>
              ) : outputs.events.slice(0, 8).map((event) => (
                <div key={event.id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{event.nodeName}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{event.eventType} - {formatDevFlowDate(event.occurredAt)} - {event.runTokens} tokens</div>
                </div>
              ))}
            </Card>

            <Card style={{ padding: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Assigned handoffs</h3>
              <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>Work orders visible to this developer</p>
              {outputs.workOrders.length === 0 ? (
                <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 14 }}>No visible handoffs yet.</div>
              ) : outputs.workOrders.slice(0, 5).map((workOrder) => (
                <div key={workOrder.id} style={{ padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                  <div className="row" style={{ justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{workOrder.title}</div>
                    <Badge tone={workOrder.status === "DISPATCHED" ? "purple" : workOrder.status === "READY" ? "blue" : "gray"}>{workOrder.status}</Badge>
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>{workOrder.agentType} - {workOrder.priority}</div>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export function DevOutputView({ projectId }) {
  const router = useRouter();
  const { project, loading, error } = useDevFlowProject(projectId);
  const outputs = useDevFlowProjectOutputs(projectId, { includeEvents: true, includeTimeline: true, includeWorkOrders: true });

  return (
    <div data-screen-label="Dev Orchestrator Output" style={{ display: "grid", gap: 20 }}>
      <DevPageHeader
        title={project?.companyName || "Generated Output"}
        subtitle={project ? `Generated artifacts and run records for ${project.id}.` : `Project output for ${projectId || "the selected project"}.`}
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={outputs.refresh}>Refresh output</Button>}
      />

      {error || outputs.error ? (
        <Card style={{ padding: 22, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>{compactDevFlowError(error || outputs.error)}</Card>
      ) : loading ? (
        <Card style={{ padding: 22, color: "var(--text-2)" }}>Loading project output...</Card>
      ) : !project ? (
        <Card style={{ padding: 22, color: "var(--text-3)" }}>No assigned backend project was found for this output route.</Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 18 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Generated artifacts</h3>
              <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>{outputs.artifacts.length} project artifact records</p>
            </div>
            {outputs.loading ? (
              <div style={{ padding: 18, color: "var(--text-2)" }}>Loading artifacts...</div>
            ) : outputs.artifacts.length === 0 ? (
              <div style={{ padding: 18, color: "var(--text-3)" }}>No generated artifacts have been recorded yet.</div>
            ) : outputs.artifacts.map((artifact) => (
              <div key={artifact.id} style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)" }}>
                <div className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{artifact.displayName || artifact.filePath}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>{artifact.agentType} - {formatDevFlowDate(artifact.createdAt)}</div>
              </div>
            ))}
          </Card>
          <Card style={{ padding: 18 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Output facts</h3>
            <OutputFact label="Run" value={project.runId || "Not started"} />
            <OutputFact label="Repo" value={project.repoUrl || "Not linked"} />
            <OutputFact label="Stack" value={project.stackKey} />
            <OutputFact label="Events" value={String(outputs.events.length)} />
          </Card>
        </div>
      )}
    </div>
  );
}

function OrchestratorMetric({ icon, label, value, sub }) {
  return (
    <Card style={{ padding: 16 }}>
      <div className="row gap-2" style={{ color: "#C4B5FD" }}>{icon}<span style={{ color: "var(--text-2)", fontSize: 12 }}>{label}</span></div>
      <div style={{ fontSize: 23, fontWeight: 800, marginTop: 10 }}>{value}</div>
      <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

function OutputFact({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text-3)", fontSize: 12 }}>{label}</span>
      <span className="mono" style={{ color: "white", fontSize: 11.5, textAlign: "right", overflowWrap: "anywhere" }}>{value}</span>
    </div>
  );
}
