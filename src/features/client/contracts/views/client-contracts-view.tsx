// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconRefresh } from "@/shared/components/icons";
import { ClientPageHeader } from "@/features/client/shared/components/client-page-header";
import { ProjectDocumentsPanel } from "@/shared/components/collaboration/project-documents-panel";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";
import { devflowLifecycleView, formatDevFlowDate } from "@/shared/utils/devflow-projects";

export function ClientContractsView() {
  const router = useRouter();
  const { selectedProject, selectedProjectId, refreshProjects } = useSelectedDevFlowProject();
  const lifecycle = devflowLifecycleView(selectedProject);

  return (
    <div data-screen-label="Client Contracts" style={{ display: "grid", gap: 20 }}>
      <ClientPageHeader
        title="Contracts & Requirements"
        subtitle="Client-visible contract and requirements document records are connected to the collaboration backend."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refreshProjects}>Refresh</Button>}
      />

      {selectedProject && (
        <Card style={{ padding: 22 }}>
          <div className="row" style={{ justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "12px 0 0" }}>{selectedProject.companyName}</h2>
              <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 780 }}>{selectedProject.brief || "No project brief has been saved yet."}</p>
            </div>
            <Button variant="ghost" iconRight={<IconArrowRight size={14} />} onClick={() => router.push("/client/product")}>
              View product
            </Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 18 }}>
            <Metric label="Project id" value={selectedProject.id} />
            <Metric label="Stack" value={selectedProject.stackKey || "Not selected"} />
            <Metric label="Next action" value={lifecycle.nextAction} />
            <Metric label="Created" value={formatDevFlowDate(selectedProject.createdAt)} />
          </div>
        </Card>
      )}

      <ProjectDocumentsPanel
        projectId={selectedProjectId}
        title="Contracts and requirements"
        subtitle="Approval status is persisted on collaboration document records."
        allowCreate
        allowReview
        defaultClientVisible={true}
        defaultKind="CONTRACT"
      />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={{ padding: 14, border: "1px solid var(--border)", borderRadius: 8, background: "rgba(8,14,32,.45)" }}>
      <div style={{ color: "var(--text-3)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</div>
      <div style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 600, marginTop: 6, overflowWrap: "anywhere" }}>{value}</div>
    </div>
  );
}
