"use client";

import { useRouter } from "next/navigation";
import { useSocketSubscription } from "@/shared/hooks/use-socket-subscription";
import { useOrchestrationStore } from "@/shared/store/orchestration-store";
import type { DevFlowProjectSummary } from "@/shared/api/devflow-api";
import { IconArrowRight } from "@/shared/components/icons";

const NODE_LABELS: Record<string, string> = {
  parse_requirements: "Requirements parser",
  negotiate_contract: "Contract negotiator",
  architecture_agent: "Architecture agent",
  frontend_agent: "Frontend agent",
  backend_agent: "Backend agent",
  database_agent: "Database agent",
  self_critique: "Self-review",
  validate_outputs: "Validator",
  commit_to_github: "GitHub delivery",
};

const STATUS_LABELS: Record<string, string> = {
  PARSING_REQUIREMENTS: "Parsing requirements",
  NEGOTIATING_CONTRACT: "Negotiating contract",
  GENERATING_CODE: "Generating code",
  COMMITTING: "Committing to GitHub",
};

function nodeLabel(nodeId: string): string {
  return NODE_LABELS[nodeId] ?? nodeId.replace(/_/g, " ");
}

function fmtTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/**
 * Compact terminal-style strip shown on the projects list while a run is
 * active: subscribes to the project's socket room and tails the current
 * agent's token stream in real time.
 */
export function LiveRunTicker({ project }: { project: DevFlowProjectSummary }) {
  const router = useRouter();

  useSocketSubscription({ projectId: project.id, initialStatus: project.status });

  const state = useOrchestrationStore((s) => s.orchestrationState);
  const streams = useOrchestrationStore((s) => s.agentStreams);
  const nodeStates = useOrchestrationStore((s) => s.nodeStates);

  const currentNode = state?.currentNode && state.currentNode !== "unknown" ? state.currentNode : "";
  const buffer = (currentNode && streams[currentNode]?.buffer) || "";
  const tail = buffer.slice(-260).replace(/\s+/g, " ").trimStart();
  const outputTokens = Object.values(nodeStates).reduce(
    (sum, n) => sum + (n.telemetry?.outputTokens ?? 0),
    0,
  );
  const statusLabel = STATUS_LABELS[state?.status ?? project.status] ?? "Running";

  return (
    <section className="pmx-live pmx-rise" aria-label="Live orchestration run">
      <header className="pmx-live-head">
        <span className="pmx-live-dot" aria-hidden="true" />
        <span className="pmx-live-title">
          Building now — <strong>{project.companyName}</strong>
        </span>
        <span className="pmx-live-meta mono">
          {statusLabel}
          {currentNode ? ` · ${nodeLabel(currentNode)}` : ""}
          {outputTokens > 0 ? ` · ${fmtTokens(outputTokens)} tokens` : ""}
        </span>
        <button
          type="button"
          className="pmx-live-cta"
          onClick={() => router.push(`/pm/project/${project.id}`)}
        >
          Watch live <IconArrowRight size={13} />
        </button>
      </header>
      <div className="pmx-live-stream mono" aria-live="off">
        {tail ? (
          <span className="pmx-live-tokens">{tail}</span>
        ) : (
          <span className="pmx-live-placeholder">Waiting for agent output…</span>
        )}
        <span className="pmx-cursor" aria-hidden="true" />
      </div>
    </section>
  );
}
