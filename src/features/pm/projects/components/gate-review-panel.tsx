"use client";

import { useState } from "react";
import {
  approveDevFlowGate1,
  approveDevFlowGate2,
  getDevFlowProjectArtifact,
  type DevFlowArtifact,
  type DevFlowOrchestrationContract,
} from "@/shared/api/devflow-api";
import { Badge, Button, Card, Textarea } from "@/shared/components/ui";
import {
  IconAlertTriangle,
  IconCheck,
  IconClose,
  IconFileText,
  IconShield,
} from "@/shared/components/icons";
import { SectionTitle } from "./pm-project-ui";

const AGENT_LABELS: Record<string, string> = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DATABASE: "Database",
  ARCHITECTURE: "Architecture",
  CONTRACT: "Contract",
};

function agentLabel(agentType?: string): string {
  const key = (agentType || "OTHER").toUpperCase();
  return AGENT_LABELS[key] ?? key;
}

function fileLanguage(filePath: string): string {
  return filePath.split(".").pop() || "file";
}

interface GateReviewPanelProps {
  projectId: string;
  /** Project status — panel renders only for AWAITING_GATE_1 / AWAITING_GATE_2. */
  status: string;
  contract?: DevFlowOrchestrationContract | null;
  artifacts: DevFlowArtifact[];
  /** Called after a decision lands so the parent can refetch project state. */
  onDecided: () => Promise<void> | void;
}

/**
 * The two human decision points of a run, inline on the project page.
 * Gate 1 shows the architecture contract; Gate 2 shows the generated artifacts.
 * Approve/reject always travels with optional review notes.
 */
export function GateReviewPanel({ projectId, status, contract, artifacts, onDecided }: GateReviewPanelProps) {
  const [notes, setNotes] = useState("");
  const [acting, setActing] = useState<"approve" | "reject" | "">("");
  const [error, setError] = useState("");

  const gate = status === "AWAITING_GATE_1" ? 1 : status === "AWAITING_GATE_2" ? 2 : null;
  if (!gate) return null;

  const decide = async (approved: boolean) => {
    setActing(approved ? "approve" : "reject");
    setError("");
    try {
      const fn = gate === 1 ? approveDevFlowGate1 : approveDevFlowGate2;
      await fn(projectId, approved, notes.trim() || undefined);
      setNotes("");
      await onDecided();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActing("");
    }
  };

  return (
    <Card style={{ padding: 22, marginBottom: 16, border: "1px solid rgba(245,158,11,.30)" }} id="gate-review">
      <SectionTitle
        title={gate === 1 ? "Gate 1 — Architecture review" : "Gate 2 — Code review"}
        subtitle={
          gate === 1
            ? "Approving starts parallel code generation. Rejecting aborts the run — your notes guide the next contract."
            : "Approving commits everything to GitHub. Rejecting sends your notes back to the agents for another pass."
        }
      />

      {error && (
        <div className="row gap-2" style={{ marginTop: 12, color: "#FCA5A5", fontSize: 13 }}>
          <IconAlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {gate === 1 ? <ContractReview contract={contract} /> : <ArtifactReview projectId={projectId} artifacts={artifacts} />}
      </div>

      <div style={{ marginTop: 18 }}>
        <Textarea
          rows={3}
          value={notes}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(event.target.value)}
          placeholder="Optional review notes — feedback, conditions, or reasons for rejection…"
        />
        <div className="row gap-2" style={{ marginTop: 12 }}>
          <Button
            variant="primary"
            size="md"
            icon={<IconCheck size={14} />}
            onClick={() => decide(true)}
            disabled={acting !== ""}
          >
            {acting === "approve" ? "Approving…" : gate === 1 ? "Approve & generate code" : "Approve & commit to GitHub"}
          </Button>
          <Button
            variant="secondary"
            size="md"
            icon={<IconClose size={14} />}
            onClick={() => decide(false)}
            disabled={acting !== ""}
          >
            {acting === "reject" ? "Rejecting…" : gate === 1 ? "Reject" : "Request changes"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ContractReview({ contract }: { contract?: DevFlowOrchestrationContract | null }) {
  if (!contract) {
    return (
      <div className="row gap-2" style={{ color: "var(--text-3)", fontSize: 13 }}>
        <IconShield size={15} />
        <span>The contract could not be loaded from the run state. You can still approve or reject below.</span>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ padding: 14, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{contract.projectName}</div>
        <p style={{ margin: "6px 0 0", color: "var(--text-2)", fontSize: 13, lineHeight: 1.55 }}>{contract.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, fontSize: 12.5, color: "var(--text-2)" }}>
          <span><span style={{ color: "var(--text-3)" }}>Type</span> {contract.requirements.projectType}</span>
          <span><span style={{ color: "var(--text-3)" }}>Complexity</span> {contract.requirements.complexity}</span>
          <span><span style={{ color: "var(--text-3)" }}>Est. files</span> {contract.requirements.estimatedFiles}</span>
          <span>
            <span style={{ color: "var(--text-3)" }}>Stack</span>{" "}
            {contract.requirements.techStack.frontend} + {contract.requirements.techStack.backend}
          </span>
        </div>
        {contract.requirements.features.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {contract.requirements.features.map((feature) => (
              <Badge key={feature} tone="gray">{feature}</Badge>
            ))}
          </div>
        )}
      </div>

      {contract.fileManifest.length > 0 && (
        <details style={{ padding: 14, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            File manifest ({contract.fileManifest.length} files)
          </summary>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 4, marginTop: 10, fontSize: 12, fontFamily: "var(--font-mono, monospace)", color: "var(--text-2)" }}>
            {contract.fileManifest.map((path) => (
              <div key={path}>{path}</div>
            ))}
          </div>
        </details>
      )}

      {contract.acceptanceCriteria.length > 0 && (
        <div style={{ padding: 14, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>
            Acceptance criteria
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {contract.acceptanceCriteria.map((criterion) => (
              <div key={criterion} className="row gap-2" style={{ fontSize: 13, color: "var(--text-2)", alignItems: "flex-start" }}>
                <IconCheck size={14} style={{ color: "var(--green, #10B981)", flexShrink: 0, marginTop: 2 }} />
                <span>{criterion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ArtifactReview({ projectId, artifacts }: { projectId: string; artifacts: DevFlowArtifact[] }) {
  const [expanded, setExpanded] = useState<Record<string, string>>({});

  const loadContent = async (artifactId: string) => {
    if (expanded[artifactId] !== undefined) return;
    try {
      const full = await getDevFlowProjectArtifact(projectId, artifactId);
      setExpanded((prev) => ({ ...prev, [artifactId]: full.content ?? "" }));
    } catch {
      setExpanded((prev) => ({ ...prev, [artifactId]: "Failed to load content." }));
    }
  };

  if (artifacts.length === 0) {
    return (
      <div className="row gap-2" style={{ color: "var(--text-3)", fontSize: 13 }}>
        <IconFileText size={15} />
        <span>No artifacts have been recorded for this run yet.</span>
      </div>
    );
  }

  const grouped = new Map<string, DevFlowArtifact[]>();
  for (const artifact of artifacts) {
    const key = agentLabel(artifact.agentType);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(artifact);
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {Array.from(grouped.entries()).map(([agent, items]) => (
        <div key={agent}>
          <div className="row gap-2" style={{ marginBottom: 8, alignItems: "center" }}>
            <Badge tone="gray">{agent}</Badge>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>
              {items.length} file{items.length === 1 ? "" : "s"}
            </span>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            {items.map((artifact) => (
              <details
                key={artifact.id}
                style={{ border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)" }}
                onToggle={(event) => {
                  if ((event.target as HTMLDetailsElement).open) void loadContent(artifact.id);
                }}
              >
                <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px", cursor: "pointer", fontSize: 13 }}>
                  <span className="row gap-2" style={{ alignItems: "center", minWidth: 0 }}>
                    <IconFileText size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--font-mono, monospace)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {artifact.filePath}
                    </span>
                  </span>
                  <Badge tone="gray">{fileLanguage(artifact.filePath)}</Badge>
                </summary>
                <pre style={{ margin: 0, padding: "10px 12px", borderTop: "1px solid var(--border)", overflow: "auto", maxHeight: 320, fontSize: 12, lineHeight: 1.5 }}>
                  <code>{expanded[artifact.id] ?? artifact.content ?? "Loading…"}</code>
                </pre>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
