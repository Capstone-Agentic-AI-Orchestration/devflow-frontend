"use client";

import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconClipboard,
  IconUsers,
  IconShield,
  IconRocket,
  IconLock,
  IconCode,
  IconGitBranch,
  IconArrowRight,
} from "@/shared/components/icons";

export type OrchestratorStepId =
  | "brief"
  | "kickoff"
  | "team"
  | "readiness"
  | "run"
  | "gate-1"
  | "gate-2"
  | "delivery";

export interface OrchestratorStep {
  id: OrchestratorStepId;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const ORCHESTRATOR_STEPS: OrchestratorStep[] = [
  {
    id: "brief",
    label: "Project Brief",
    shortLabel: "Brief",
    description: "Define the project idea and let AI enhance it",
    icon: IconClipboard,
  },
  {
    id: "kickoff",
    label: "Kickoff Setup",
    shortLabel: "Kickoff",
    description: "Scope, milestones, and readiness checklist",
    icon: IconLock,
  },
  {
    id: "team",
    label: "Team & Roles",
    shortLabel: "Team",
    description: "Assign developers and client members",
    icon: IconUsers,
  },
  {
    id: "readiness",
    label: "Provider Readiness",
    shortLabel: "Readiness",
    description: "Verify LLM and GitHub delivery are configured",
    icon: IconShield,
  },
  {
    id: "run",
    label: "Run Orchestration",
    shortLabel: "Run",
    description: "Launch the agent pipeline and monitor live",
    icon: IconRocket,
  },
  {
    id: "gate-1",
    label: "Gate 1: Architecture",
    shortLabel: "Gate 1",
    description: "Review the project contract before code generation",
    icon: IconClipboard,
  },
  {
    id: "gate-2",
    label: "Gate 2: Code Review",
    shortLabel: "Gate 2",
    description: "Review generated artifacts before GitHub commit",
    icon: IconCode,
  },
  {
    id: "delivery",
    label: "Delivery",
    shortLabel: "Delivery",
    description: "Client acceptance and project handoff",
    icon: IconGitBranch,
  },
];

interface OrchestratorStepperProps {
  projectId: string;
  currentStep: OrchestratorStepId;
  maxReachedStep: OrchestratorStepId;
  completedSteps: Set<OrchestratorStepId>;
}

const STEP_ORDER = ORCHESTRATOR_STEPS.map((s) => s.id);

export function OrchestratorStepper({
  projectId,
  currentStep,
  maxReachedStep,
  completedSteps,
}: OrchestratorStepperProps) {
  const router = useRouter();
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const maxReachedIndex = STEP_ORDER.indexOf(maxReachedStep);

  return (
    <nav className="orchestrator-stepper" aria-label="Orchestration progress">
      <div className="orchestrator-stepper-track">
        {ORCHESTRATOR_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = completedSteps.has(step.id);
          const isReachable = index <= maxReachedIndex;
          const isPast = index < currentIndex;
          const Icon = step.icon;

          const stateClass = isCurrent
            ? "orch-step-current"
            : isCompleted
              ? "orch-step-done"
              : isReachable
                ? "orch-step-reachable"
                : "orch-step-locked";

          return (
            <button
              key={step.id}
              type="button"
              className={`orchestrator-step ${stateClass}`}
              disabled={!isReachable}
              onClick={() =>
                isReachable &&
                router.push(`/pm/orchestrate/${projectId}/${step.id}`)
              }
              aria-current={isCurrent ? "step" : undefined}
              title={step.description}
            >
              <span className="orch-step-connector" aria-hidden="true">
                {index > 0 && (
                  <span
                    className={`orch-step-line ${isPast ? "orch-line-filled" : ""}`}
                  />
                )}
              </span>
              <span className="orch-step-marker">
                {isCompleted ? (
                  <IconCheck size={16} className="orch-step-check" />
                ) : (
                  <Icon size={16} className="orch-step-icon" />
                )}
                <span className="orch-step-number">{index + 1}</span>
              </span>
              <span className="orch-step-label">
                <span className="orch-step-label-text">{step.shortLabel}</span>
                {isCurrent && (
                  <span className="orch-step-label-sub">{step.description}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function OrchestratorStepNav({
  projectId,
  currentStep,
  onComplete,
  nextLabel,
  backLabel = "Back",
  nextDisabled = false,
  isLastStep = false,
}: {
  projectId: string;
  currentStep: OrchestratorStepId;
  onComplete?: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  isLastStep?: boolean;
}) {
  const router = useRouter();
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const prevStep = currentIndex > 0 ? STEP_ORDER[currentIndex - 1] : null;
  const nextStep =
    currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : null;

  return (
    <div className="orchestrator-step-nav">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() =>
          prevStep
            ? router.push(`/pm/orchestrate/${projectId}/${prevStep}`)
            : router.push(`/pm/project/${projectId}`)
        }
      >
        <IconArrowRight size={14} style={{ transform: "rotate(180deg)" }} />
        {backLabel}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        disabled={nextDisabled}
        onClick={() => {
          if (onComplete) {
            onComplete();
          }
          if (!isLastStep && nextStep) {
            router.push(`/pm/orchestrate/${projectId}/${nextStep}`);
          }
        }}
      >
        {nextLabel ?? (isLastStep ? "Finish" : "Continue")}
        <IconArrowRight size={14} />
      </button>
    </div>
  );
}

export function getStepIndex(stepId: OrchestratorStepId): number {
  return STEP_ORDER.indexOf(stepId);
}

export function getStepById(stepId: string): OrchestratorStep | undefined {
  return ORCHESTRATOR_STEPS.find((s) => s.id === stepId);
}
