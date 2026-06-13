// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconCode, IconFileText, IconRefresh } from "@/shared/components/icons";
import { DevPageHeader } from "@/features/dev/shared/components/dev-page-header";
import { BackendAwareRouteState } from "@/shared/components/backend-aware-route-state";
import { useDevFlowProjectOutputs } from "@/shared/hooks/use-devflow-projects";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";
import { compactDevFlowError, devflowLifecycleView, formatDevFlowDate } from "@/shared/utils/devflow-projects";

export function DevIDEView() {
  const router = useRouter();
  const { projects, selectedProject, selectedProjectId, selectedProjectLoading, selectedProjectError, refreshProjects } = useSelectedDevFlowProject();
  const outputs = useDevFlowProjectOutputs(selectedProjectId, { includeEvents: true });
  const lifecycle = devflowLifecycleView(selectedProject);
  const refresh = () => {
    refreshProjects();
    outputs.refresh();
  };

  return (
    <div data-screen-label="Dev IDE" style={{ display: "grid", gap: 20 }}>
      <DevPageHeader
        title="IDE"
        subtitle="Read-only backend artifact workspace for the selected developer project."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refresh}>Refresh projects</Button>}
      />

      {selectedProjectError || outputs.error ? (
        <Card style={{ padding: 22, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>{compactDevFlowError(selectedProjectError || outputs.error)}</Card>
      ) : selectedProjectLoading ? (
        <Card style={{ padding: 22, color: "var(--text-2)" }}>Loading selected project...</Card>
      ) : !selectedProject ? (
        <BackendAwareRouteState
          eyebrow="Developer IDE module"
          title="No assigned project selected"
          subtitle="Artifact workspace appears after this developer account is assigned to a backend project."
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
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 0" }}>{selectedProject.companyName}</h2>
                <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.6, marginTop: 8 }}>{selectedProject.stackKey} - {lifecycle.nextAction}</p>
              </div>
              <Badge tone="blue">{outputs.loading ? "Loading" : `${outputs.artifacts.length} artifacts`}</Badge>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 18 }}>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Artifact workspace</h3>
                <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>Generated files exposed by the backend artifact API</p>
              </div>
              {outputs.loading ? (
                <div style={{ padding: 18, color: "var(--text-2)" }}>Loading artifacts...</div>
              ) : outputs.artifacts.length === 0 ? (
                <div style={{ padding: 18, color: "var(--text-3)" }}>No generated files are recorded yet.</div>
              ) : outputs.artifacts.map((artifact) => (
                <div key={artifact.id} className="row gap-3" style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
                  <IconFileText size={15} style={{ color: "#93C5FD", marginTop: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ color: "white", fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>{artifact.filePath}</div>
                    <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{artifact.agentType} - {formatDevFlowDate(artifact.createdAt)}</div>
                  </div>
                  <Badge tone={artifact.clientVisible ? "green" : "gray"}>{artifact.clientVisible ? "Shared" : "Internal"}</Badge>
                </div>
              ))}
            </Card>

            <Card style={{ padding: 18 }}>
              <div className="row gap-2" style={{ color: "#93C5FD" }}><IconCode size={16} />Workspace facts</div>
              <WorkspaceFact label="Repo" value={selectedProject.repoUrl || "Not linked"} />
              <WorkspaceFact label="Run" value={selectedProject.runId || "Not started"} />
              <WorkspaceFact label="Events" value={String(outputs.events.length)} />
              <WorkspaceFact label="Mode" value="Read-only" />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function WorkspaceFact({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text-3)", fontSize: 12 }}>{label}</span>
      <span className="mono" style={{ color: "white", fontSize: 11.5, textAlign: "right", overflowWrap: "anywhere" }}>{value}</span>
    </div>
  );
}
