// @ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import { Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconRefresh } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { BackendAwareRouteState } from "@/shared/components/backend-aware-route-state";
import { useDevFlowProjects } from "@/shared/hooks/use-devflow-projects";

export function PMBackendPendingView({ title, subtitle, pending, primaryRoute = "/pm/projects", primaryLabel = "Open projects", children }) {
  const router = useRouter();
  const { projects, loading, error, refresh } = useDevFlowProjects();

  return (
    <div data-screen-label={`PM ${title}`} style={{ display: "grid", gap: 20 }}>
      <PMPageHeader
        title={title}
        subtitle={subtitle}
        actions={<Button variant="secondary" icon={<IconRefresh size={14} />} onClick={refresh}>Refresh projects</Button>}
      />
      {children}
      <BackendAwareRouteState
        eyebrow="Project manager module"
        title={`${title} is waiting for a backend module`}
        subtitle="This route remains in the app for navigation and planning, but it no longer presents demo operational data as real."
        projects={projects}
        loading={loading}
        error={error}
        pending={pending}
        primaryAction={{ label: primaryLabel, onClick: () => router.push(primaryRoute) }}
      />
    </div>
  );
}

export function PMBackendNote({ title, body, actionLabel, onAction }) {
  return (
    <Card style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h3>
          <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6, margin: "6px 0 0", maxWidth: 760 }}>{body}</p>
        </div>
        {actionLabel && onAction && (
          <Button variant="ghost" iconRight={<IconArrowRight size={14} />} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
