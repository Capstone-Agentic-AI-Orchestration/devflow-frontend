"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The orchestrator wizard was folded into the project page — everything it
 * did (kickoff, readiness, run, gates, delivery) now lives at /pm/project/[id],
 * driven by project status. This route survives only so old links keep working.
 */
export default function OrchestratorRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  useEffect(() => {
    router.replace(`/pm/project/${projectId}`);
  }, [projectId, router]);

  return (
    <div style={{ padding: 60, textAlign: "center", color: "var(--text-3)", fontSize: "0.875rem" }}>
      Redirecting to the project page…
    </div>
  );
}
