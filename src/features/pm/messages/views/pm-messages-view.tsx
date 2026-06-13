// @ts-nocheck
"use client";

import { Button } from "@/shared/components/ui";
import { IconRefresh } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { ProjectConversationPanel } from "@/shared/components/collaboration/project-conversation-panel";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";

export function PMMessagesView() {
  const { selectedProject, selectedProjectId, selectedProjectLoading, refreshProjects } = useSelectedDevFlowProject();

  return (
    <div data-screen-label="PM Messages" style={{ display: "grid", gap: 20 }}>
      <PMPageHeader
        title="Messages"
        subtitle="Project-scoped conversations are now backed by the collaboration API."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refreshProjects}>Refresh projects</Button>}
      />
      <ProjectConversationPanel
        projectId={selectedProjectId}
        title="PM conversations"
        subtitle={selectedProject ? `Client-visible and team-only threads for ${selectedProject.companyName}.` : selectedProjectLoading ? "Loading selected project..." : "Select a project from the top bar."}
        defaultVisibility="CLIENT"
        defaultCategory="SUPPORT"
      />
    </div>
  );
}
