// @ts-nocheck
"use client";

import {
  IconCheck,
  IconClipboard,
  IconRocket,
  IconCode,
  IconGitBranch,
} from "@/shared/components/icons";

export interface LifecycleStage {
  id: LifecycleStageId;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  nextAction: string;
}

export type LifecycleStageId = "draft" | "build" | "review" | "delivered";

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: "draft",
    label: "Draft",
    shortLabel: "Draft",
    description: "Describe what the agents should build",
    icon: IconClipboard,
    nextAction: "Start orchestration",
  },
  {
    id: "build",
    label: "Build",
    shortLabel: "Build",
    description: "Agents parse, contract, and generate code",
    icon: IconRocket,
    nextAction: "Watch the build",
  },
  {
    id: "review",
    label: "Review",
    shortLabel: "Review",
    description: "Approve gates and review artifacts",
    icon: IconCode,
    nextAction: "Review and approve",
  },
  {
    id: "delivered",
    label: "Delivered",
    shortLabel: "Done",
    description: "Project delivered and accepted",
    icon: IconGitBranch,
    nextAction: "Project complete",
  },
];

const STAGE_ORDER: LifecycleStageId[] = ["draft", "build", "review", "delivered"];

export function getStageIndex(id: LifecycleStageId): number {
  return STAGE_ORDER.indexOf(id);
}

export function mapProjectStatusToLifecycleStage(status: string): LifecycleStageId {
  if (!status) return "draft";

  switch (status) {
    case "DELIVERED":
      return "delivered";
    case "COMMITTING":
    case "AWAITING_GATE_1":
    case "AWAITING_GATE_2":
      return "review";
    case "GENERATING_CODE":
    case "PARSING_REQUIREMENTS":
    case "NEGOTIATING_CONTRACT":
    case "FAILED":
      return "build";
    default:
      return "draft";
  }
}

export function getStageProgress(stageId: LifecycleStageId): number {
  const index = getStageIndex(stageId);
  return Math.round(((index + 1) / STAGE_ORDER.length) * 100);
}

export interface ProjectLifecycleIndicatorProps {
  currentStage: LifecycleStageId;
  maxReachedStage: LifecycleStageId;
  completedStages: Set<LifecycleStageId>;
  onClickStage?: (stage: LifecycleStageId) => void;
  compact?: boolean;
}

export function ProjectLifecycleIndicator({
  currentStage,
  maxReachedStage,
  completedStages,
  onClickStage,
  compact = false,
}: ProjectLifecycleIndicatorProps) {
  const currentIndex = getStageIndex(currentStage);
  const maxReachedIndex = getStageIndex(maxReachedStage);

  return (
    <div className={`project-lifecycle ${compact ? "project-lifecycle-compact" : ""}`}>
      <div className="project-lifecycle-track">
        {LIFECYCLE_STAGES.map((stage, index) => {
          const isCurrent = stage.id === currentStage;
          const isCompleted = completedStages.has(stage.id);
          const isReachable = index <= maxReachedIndex;
          const isPast = index < currentIndex;
          const Icon = stage.icon;

          const stateClass = isCurrent
            ? "pl-step-current"
            : isCompleted
              ? "pl-step-done"
              : isReachable
                ? "pl-step-reachable"
                : "pl-step-locked";

          return (
            <button
              key={stage.id}
              type="button"
              className={`pl-step ${stateClass}`}
              disabled={!isReachable || compact}
              onClick={() => isReachable && onClickStage?.(stage.id)}
              aria-current={isCurrent ? "step" : undefined}
              title={stage.description}
            >
              <span className="pl-step-connector" aria-hidden="true">
                {index > 0 && (
                  <span className={`pl-step-line ${isPast || isCompleted ? "pl-line-filled" : ""}`} />
                )}
              </span>
              <span className="pl-step-marker">
                {isCompleted ? (
                  <IconCheck size={compact ? 12 : 16} className="pl-step-check" />
                ) : (
                  <Icon size={compact ? 12 : 16} className="pl-step-icon" />
                )}
              </span>
              {!compact && (
                <span className="pl-step-label">
                  <span className="pl-step-label-text">{stage.shortLabel}</span>
                  {isCurrent && (
                    <span className="pl-step-label-sub">{stage.nextAction}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

