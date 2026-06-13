// @ts-nocheck
"use client";

import { Button } from "@/shared/components/ui";
import { IconRefresh } from "@/shared/components/icons";
import { ClientPageHeader } from "@/features/client/shared/components/client-page-header";
import { ProjectConversationPanel } from "@/shared/components/collaboration/project-conversation-panel";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";

export function ClientChatView() {
  const { selectedProject, selectedProjectId, selectedProjectLoading, refreshProjects } = useSelectedDevFlowProject();

  return (
    <div data-screen-label="Client Chat" style={{ display: "grid", gap: 20 }}>
      <ClientPageHeader
        title="Chat"
        subtitle="Client-visible project conversations are connected to the collaboration backend."
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refreshProjects}>Refresh projects</Button>}
      />
      <ProjectConversationPanel
        projectId={selectedProjectId}
        title="Client project chat"
        subtitle={selectedProject ? `Conversation threads for ${selectedProject.companyName}.` : selectedProjectLoading ? "Loading selected project..." : "Select a project from the top bar."}
        defaultVisibility="CLIENT"
        defaultCategory="SUPPORT"
        emptyText="No client-visible conversations yet."
      />
    </div>
  );
}
