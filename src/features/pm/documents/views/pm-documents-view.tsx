// @ts-nocheck
"use client";

import { Button } from "@/shared/components/ui";
import { IconRefresh } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { ProjectDocumentsPanel } from "@/shared/components/collaboration/project-documents-panel";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";

export function PMDocumentsView() {
  const { selectedProject, selectedProjectId, refreshProjects } = useSelectedDevFlowProject();

  return (
    <div data-screen-label="PM Documents" style={{ display: "grid", gap: 20 }}>
      <PMPageHeader
        title="Documents"
        subtitle="PM document records, client visibility, and approval status now come from the collaboration backend."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refreshProjects}>Refresh projects</Button>}
      />
      <ProjectDocumentsPanel
        projectId={selectedProjectId}
        subtitle={selectedProject ? `Documents for ${selectedProject.companyName}.` : "Select a project from the top bar."}
        allowCreate
        allowReview
        defaultClientVisible={true}
      />
    </div>
  );
}
