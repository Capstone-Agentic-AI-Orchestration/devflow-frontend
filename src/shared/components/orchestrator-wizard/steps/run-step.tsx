// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  startDevFlowOrchestration,
  rerunReadyDevFlowWorkOrders,
} from "@/shared/api/devflow-api";
import { Button, Badge } from "@/shared/components/ui";
import {
  IconRocket,
  IconActivity,
  IconAlertTriangle,
  IconCheck,
  IconRefresh,
  IconPlay,
} from "@/shared/components/icons";
import { ActivityConsole } from "@/shared/components/orchestration/activity-console";
import { OrchestrationLiveVisualizer } from "@/shared/components/orchestration/orchestration-live-visualizer";
import { useSocketSubscription } from "@/shared/hooks/use-socket-subscription";
import { useOrchestrationStore } from "@/shared/store/orchestration-store";
import { OrchestratorStepNav } from "@/shared/components/orchestrator-wizard/orchestrator-stepper";
import type { OrchestratorWizardContextValue } from "@/shared/components/orchestrator-wizard/orchestrator-wizard-layout";

export function RunStep({ ctx }: { ctx: OrchestratorWizardContextValue }) {
  const { project, projectId, status, refresh } = ctx;
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  const store = useOrchestrationStore();
  const orchestrationState = store.orchestrationState;
  const connectionStatus = store.connectionStatus;

  useSocketSubscription({
    projectId,
    fallbackPollFn: async () => {
      await refresh();
      return status;
    },
  });

  const projectStatus = project?.status ?? status?.status;
  const runId = status?.runId ?? orchestrationState?.runId;
  const isRunning =
    projectStatus === "PARSING_REQUIREMENTS" ||
    projectStatus === "NEGOTIATING_CONTRACT" ||
    projectStatus === "GENERATING_CODE" ||
    projectStatus === "COMMITTING";
  const isAwaitingGate1 = projectStatus === "AWAITING_GATE_1";
  const isAwaitingGate2 = projectStatus === "AWAITING_GATE_2";
  const isFailed = projectStatus === "FAILED";
  const isDelivered = projectStatus === "DELIVERED";

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      await startDevFlowOrchestration(projectId);
      setStarted(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setStarting(false);
    }
  };

  const handleRerun = async () => {
    setStarting(true);
    setError("");
    try {
      await rerunReadyDevFlowWorkOrders(projectId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (isAwaitingGate1) {
      const timer = setTimeout(() => {
        router.push(`/pm/orchestrate/${projectId}/gate-1`);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (isAwaitingGate2) {
      const timer = setTimeout(() => {
        router.push(`/pm/orchestrate/${projectId}/gate-2`);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (isDelivered) {
      const timer = setTimeout(() => {
        router.push(`/pm/orchestrate/${projectId}/delivery`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAwaitingGate1, isAwaitingGate2, isDelivered, projectId, router]);

  return (
    <div>
      <div className="wizard-step-section">
        <h3 className="wizard-step-section-title">
          <IconRocket size={16} />
          Orchestration Run
        </h3>
        <p className="wizard-step-section-desc">
          Launch the agent pipeline. The system will parse requirements, negotiate a contract, and
          generate code in parallel.
        </p>
      </div>

      {error && (
        <div className="wizard-info-banner warning">
          <IconAlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {started && (
        <div className="wizard-info-banner success">
          <IconCheck size={16} />
          <span>Orchestration started. Monitor progress below.</span>
        </div>
      )}

      <div className="wizard-status-display">
        <div className="status-label">Current Status</div>
        <div className="status-value">{projectStatus?.replace(/_/g, " ") ?? "Unknown"}</div>
        {runId && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 6 }}>
            Run ID: {runId}
          </div>
        )}
        <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: 4 }}>
          WebSocket: <Badge tone={connectionStatus === "connected" ? "green" : "gray"}>{connectionStatus}</Badge>
        </div>
      </div>

      {/* Start controls */}
      {!isRunning && !isAwaitingGate1 && !isAwaitingGate2 && !isDelivered && (
        <div className="wizard-step-section">
          <div
            style={{
              padding: 24,
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <IconRocket size={32} style={{ color: "var(--primary)", marginBottom: 8 }} />
            <h4 style={{ margin: "0 0 6px", fontSize: "0.9375rem", fontWeight: 700 }}>
              {isFailed ? "Orchestration failed — retry?" : "Ready to launch"}
            </h4>
            <p style={{ margin: "0 0 16px", fontSize: "0.8125rem", color: "var(--text-3)" }}>
              {isFailed
                ? "The previous run encountered errors. You can retry or rerun ready work orders."
                : "Click below to start the orchestration pipeline."}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <Button variant="primary" onClick={handleStart} disabled={starting}>
                {starting ? (
                  <>
                    <IconRefresh size={14} className="spin" />
                    Starting…
                  </>
                ) : (
                  <>
                    <IconPlay size={14} />
                    {isFailed ? "Retry orchestration" : "Start orchestration"}
                  </>
                )}
              </Button>
              {isFailed && (
                <Button variant="secondary" onClick={handleRerun} disabled={starting}>
                  <IconRefresh size={14} />
                  Rerun ready work orders
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live monitor */}
      {(isRunning || isAwaitingGate1 || isAwaitingGate2) && (
        <div className="wizard-step-section">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <IconActivity size={16} style={{ color: "var(--primary)" }} />
            <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700 }}>Live Pipeline Monitor</h4>
            {isRunning && (
              <span className="orchestration-pulse-dot" style={{ marginLeft: 4 }} />
            )}
          </div>
          <OrchestrationLiveVisualizer
            project={project}
            status={status}
            useWebSocket
          />
        </div>
      )}

      {/* Activity console */}
      {(isRunning || isAwaitingGate1 || isAwaitingGate2) && (
        <div className="wizard-step-section">
          <h4 style={{ margin: "0 0 10px", fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Activity Log
          </h4>
          <ActivityConsole />
        </div>
      )}

      {isAwaitingGate1 && (
        <div className="wizard-info-banner info">
          <IconCheck size={16} />
          <span>Requirements and contract are ready. Redirecting to Gate 1 review…</span>
        </div>
      )}
      {isAwaitingGate2 && (
        <div className="wizard-info-banner info">
          <IconCheck size={16} />
          <span>Code generation complete. Redirecting to Gate 2 review…</span>
        </div>
      )}

      <OrchestratorStepNav
        projectId={projectId}
        currentStep="run"
        nextLabel={isAwaitingGate1 ? "Go to Gate 1" : isAwaitingGate2 ? "Go to Gate 2" : isDelivered ? "Go to Delivery" : "Continue"}
        isLastStep={false}
        nextDisabled={!isAwaitingGate1 && !isAwaitingGate2 && !isDelivered}
        onComplete={() => {
          if (isAwaitingGate1) router.push(`/pm/orchestrate/${projectId}/gate-1`);
          else if (isAwaitingGate2) router.push(`/pm/orchestrate/${projectId}/gate-2`);
          else if (isDelivered) router.push(`/pm/orchestrate/${projectId}/delivery`);
        }}
      />
    </div>
  );
}
