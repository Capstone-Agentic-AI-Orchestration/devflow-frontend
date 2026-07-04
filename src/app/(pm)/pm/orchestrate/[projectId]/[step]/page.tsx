"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Old wizard step deep-links (brief, kickoff, gate-1, …) all resolve to the project page. */
export default function OrchestratorStepRedirectPage() {
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
