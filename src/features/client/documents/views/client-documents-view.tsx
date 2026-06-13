// @ts-nocheck
"use client";

import { Badge, Button, Card } from "@/shared/components/ui";
import { IconDownload, IconFileText, IconRefresh } from "@/shared/components/icons";
import { ClientPageHeader } from "@/features/client/shared/components/client-page-header";
import { useDevFlowProjectOutputs } from "@/shared/hooks/use-devflow-projects";
import { ProjectDocumentsPanel } from "@/shared/components/collaboration/project-documents-panel";
import { compactDevFlowError, formatDevFlowDate } from "@/shared/utils/devflow-projects";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";

export function ClientDocumentsView() {
  const { selectedProject, selectedProjectId, selectedProjectLoading, selectedProjectError, refreshProjects } = useSelectedDevFlowProject();
  const outputs = useDevFlowProjectOutputs(selectedProjectId, { includeEvents: false });
  const refresh = () => {
    refreshProjects();
    outputs.refresh();
  };

  return (
    <div data-screen-label="Client - Documents">
      <ClientPageHeader
        title="Documents"
        subtitle="Client-visible backend artifacts and collaboration document records for your assigned project."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refresh}>Refresh</Button>}
      />

      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <div className="row" style={{ padding: 18, borderBottom: "1px solid var(--border)", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Shared artifacts</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>{selectedProject ? selectedProject.companyName : "No selected backend project"}</p>
          </div>
          <Badge tone="green">{outputs.loading ? "Loading" : `${outputs.artifacts.length} visible`}</Badge>
        </div>
        {selectedProjectError || outputs.error ? (
          <div style={{ padding: 24, color: "#FCA5A5" }}>{compactDevFlowError(selectedProjectError || outputs.error)}</div>
        ) : outputs.artifacts.length === 0 ? (
          <div style={{ padding: 24, color: "var(--text-3)" }}>{selectedProjectLoading || outputs.loading ? "Loading documents..." : "No client-visible documents have been shared yet."}</div>
        ) : (
          outputs.artifacts.map((artifact, index) => (
            <div key={artifact.id} className="row gap-3" style={{ padding: "14px 18px", borderBottom: index === outputs.artifacts.length - 1 ? 0 : "1px solid var(--border)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "rgba(79,139,255,.16)", color: "#93C5FD", display: "grid", placeItems: "center", flexShrink: 0 }}><IconFileText size={16} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{artifact.displayName || artifact.filePath}</div>
                <div className="mono" style={{ color: "var(--text-3)", fontSize: 11, marginTop: 3 }}>{artifact.filePath}</div>
              </div>
              <Badge tone={artifact.reviewStatus === "APPROVED" ? "green" : artifact.reviewStatus === "REVISION_REQUESTED" ? "amber" : "blue"}>{artifact.reviewStatus}</Badge>
              <div style={{ color: "var(--text-2)", fontSize: 12 }}>{formatDevFlowDate(artifact.sharedAt || artifact.createdAt)}</div>
              <Button variant="ghost" size="sm" icon={<IconDownload size={13} />} disabled />
            </div>
          ))
        )}
      </Card>

      <ProjectDocumentsPanel
        projectId={selectedProjectId}
        title="Uploaded and approval documents"
        subtitle="Metadata records are stored now; binary upload storage can attach to these records later."
        allowCreate
        allowReview
        defaultClientVisible={true}
        defaultKind="REQUIREMENT"
      />
    </div>
  );
}
