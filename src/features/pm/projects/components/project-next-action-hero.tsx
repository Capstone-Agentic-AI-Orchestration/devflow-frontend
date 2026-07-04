"use client";

import type { ReactNode } from "react";
import { Badge, Button, Card } from "@/shared/components/ui";
import {
  IconCheck,
  IconPlay,
  IconRocket,
  IconShield,
  IconUpload,
} from "@/shared/components/icons";

/**
 * Single hero card that shows ONE thing: what the PM needs to do next
 * (or what's currently happening).
 *
 * The hero is a state machine:
 * - blocked   → "Fix this to continue" with CTA
 * - waiting   → "Review and approve" — CTA opens the gate review panel
 * - running   → "Building..." with live activity
 * - idle      → "Ready to start" with Start button
 * - done      → "Delivered to GitHub" with repo link
 */

type ProjectStatus =
  | "PENDING"
  | "PARSING_REQUIREMENTS"
  | "NEGOTIATING_CONTRACT"
  | "AWAITING_GATE_1"
  | "GENERATING_CODE"
  | "AWAITING_GATE_2"
  | "COMMITTING"
  | "DELIVERED"
  | "FAILED"
  | string;

interface HeroCta {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant: "primary" | "secondary";
}

interface NextActionHeroProps {
  stackKey?: string;
  status: ProjectStatus;
  runId?: string | null;
  repoUrl?: string | null;
  artifactCount: number;
  providerAvailable?: boolean;
  providerReason?: string;
  lastActivity?: string;
  isStarting?: boolean;
  onStart: () => void;
  /** Opens the Gate 1 review panel (contract) — approval happens there, never here. */
  onReviewGate1: () => void;
  /** Opens the Gate 2 review panel (artifacts). */
  onReviewGate2: () => void;
}

interface HeroState {
  kind: "done" | "waiting" | "running" | "blocked" | "idle";
  badge: { tone: string; label: string };
  headline: string;
  detail: string | null;
  cta: HeroCta | null;
}

function resolveHeroState(props: NextActionHeroProps): HeroState {
  const { status, runId, repoUrl, providerAvailable } = props;

  if (status === "DELIVERED" && repoUrl) {
    return {
      kind: "done",
      badge: { tone: "green", label: "Delivered" },
      headline: "This project is live on GitHub.",
      detail: "Share the repo link with your client and close out the engagement.",
      cta: { label: "Open repository", icon: <IconUpload size={14} />, onClick: () => window.open(repoUrl, "_blank"), variant: "secondary" },
    };
  }

  if (status === "AWAITING_GATE_1") {
    return {
      kind: "waiting",
      badge: { tone: "amber", label: "Architecture review" },
      headline: "The contract is ready for your review.",
      detail: "Read the contract below, then approve to start parallel code generation — or reject with notes to improve it.",
      cta: { label: "Review contract", icon: <IconShield size={14} />, onClick: props.onReviewGate1, variant: "primary" },
    };
  }

  if (status === "AWAITING_GATE_2") {
    return {
      kind: "waiting",
      badge: { tone: "amber", label: "Code review" },
      headline: `All ${props.artifactCount} artifacts are ready for review.`,
      detail: "Approving commits everything to GitHub. Rejecting lets the agents retry with your feedback.",
      cta: { label: "Review artifacts", icon: <IconCheck size={14} />, onClick: props.onReviewGate2, variant: "primary" },
    };
  }

  if (status === "FAILED") {
    return {
      kind: "blocked",
      badge: { tone: "red", label: "Failed" },
      headline: "The orchestration run failed.",
      detail: props.providerReason || "Check the activity log and retry the run. Agents will pick up where they left off.",
      cta: { label: "Retry", icon: <IconRocket size={14} />, onClick: props.onStart, variant: "primary" },
    };
  }

  if (["PARSING_REQUIREMENTS", "NEGOTIATING_CONTRACT", "GENERATING_CODE", "COMMITTING"].includes(status) || runId) {
    const stepMap: Record<string, string> = {
      PARSING_REQUIREMENTS: "Parsing your brief",
      NEGOTIATING_CONTRACT: "Generating the project contract",
      GENERATING_CODE: "Building your application",
      COMMITTING: "Pushing to GitHub",
    };
    const step = stepMap[status] || "Working";
    return {
      kind: "running",
      badge: { tone: "blue", label: "In progress" },
      headline: `${step}...`,
      detail: props.lastActivity || "AI agents are working on your project.",
      cta: null,
    };
  }

  if (providerAvailable === false) {
    return {
      kind: "blocked",
      badge: { tone: "red", label: "Provider unavailable" },
      headline: "The AI provider is not configured.",
      detail: props.providerReason || "Check your LLM API keys in the admin settings.",
      cta: null,
    };
  }

  return {
    kind: "idle",
    badge: { tone: "green", label: "Ready" },
    headline: "Ready to build from your brief.",
    detail: "Starting the run seeds work orders automatically and dispatches all agents in parallel. You'll approve the architecture at Gate 1 before any code is written.",
    cta: { label: props.isStarting ? "Starting..." : "Start orchestration", icon: <IconPlay size={14} />, onClick: props.onStart, variant: "primary" },
  };
}

const KIND_TO_HERO_BG: Record<string, string> = {
  done: "rgba(16,185,129,.06)",
  waiting: "rgba(245,158,11,.06)",
  running: "rgba(255,255,255,.06)",
  blocked: "rgba(239,68,68,.06)",
  idle: "rgba(255,255,255,.04)",
};

const KIND_TO_BORDER: Record<string, string> = {
  done: "rgba(16,185,129,.24)",
  waiting: "rgba(245,158,11,.28)",
  running: "rgba(255,255,255,.24)",
  blocked: "rgba(239,68,68,.24)",
  idle: "rgba(255,255,255,.18)",
};

export function ProjectNextActionHero(props: NextActionHeroProps) {
  const state = resolveHeroState(props);
  const bg = KIND_TO_HERO_BG[state.kind] || KIND_TO_HERO_BG.idle;
  const border = KIND_TO_BORDER[state.kind] || KIND_TO_BORDER.idle;

  return (
    <Card
      style={{
        padding: 20,
        background: bg,
        borderColor: border,
        marginBottom: 16,
      }}
    >
      <div className="row" style={{ justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="row gap-2" style={{ marginBottom: 8, alignItems: "center" }}>
            <Badge tone={state.badge.tone} dot>{state.badge.label}</Badge>
            {props.stackKey && (
              <span style={{ color: "var(--text-3)", fontSize: 12, fontWeight: 500 }}>{props.stackKey}</span>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {state.headline}
          </h2>
          {state.detail && (
            <p style={{ margin: "8px 0 0", color: "var(--text-2)", fontSize: 14, lineHeight: 1.55, maxWidth: 680 }}>
              {state.detail}
            </p>
          )}
        </div>
        <div className="row gap-2" style={{ alignItems: "center", flexShrink: 0 }}>
          {state.cta && (
            <Button
              variant={state.cta.variant}
              size="md"
              icon={state.cta.icon}
              onClick={state.cta.onClick}
              disabled={props.isStarting}
            >
              {state.cta.label}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
