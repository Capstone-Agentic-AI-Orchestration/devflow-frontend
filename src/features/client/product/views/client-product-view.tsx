// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, Modal, Textarea } from "@/shared/components/ui";
import { ClientPageHeader } from "@/features/client/shared/components/client-page-header";
import { IconAlertTriangle, IconCalendar, IconCheck, IconCheckCircle, IconCircle, IconCode, IconDatabase, IconDownload, IconExternalLink, IconGitBranch, IconMessageCircle, IconMonitor, IconRefresh, IconShield, IconSmartphone, IconTablet } from "@/shared/components/icons";
import { acceptDevFlowProjectDelivery, getDevFlowDeliveryReadiness, requestDevFlowProjectDeliveryRevision, reviewDevFlowArtifact } from "@/shared/api/devflow-api";
import { useDevFlowProjectOutputs } from "@/shared/hooks/use-devflow-projects";
import { useSelectedDevFlowProject } from "@/shared/projects/selected-project-context";
import { compactDevFlowError, devflowLifecycleView, formatDevFlowDate, lifecycleProgressColor } from "@/shared/utils/devflow-projects";

export function ClientProductView() {
  const [tab, setTab] = useState("web");
  const [approveOpen, setApproveOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryError, setDeliveryError] = useState("");
  const [deliverySaving, setDeliverySaving] = useState(false);
  const [deliveryReadiness, setDeliveryReadiness] = useState(null);
  const [deliveryReadinessLoading, setDeliveryReadinessLoading] = useState(false);
  const [deliveryReadinessError, setDeliveryReadinessError] = useState("");
  const { selectedProject, selectedProjectLoading, selectedProjectError, refreshProjects, refreshSelectedProject } = useSelectedDevFlowProject();
  const outputs = useDevFlowProjectOutputs(selectedProject?.id, { includeDocuments: true, includeEvents: true });
  const lifecycle = devflowLifecycleView(selectedProject);
  const productName = selectedProject?.companyName || "No selected product";
  const progress = selectedProject ? lifecycle.progress : 0;
  const sharedArtifacts = outputs.artifacts.filter((artifact) => artifact.clientVisible);
  const sharedDocuments = outputs.documents.filter((document) => document.clientVisible);
  const deliveryReview = selectedProject?.deliveryReview;
  const deliveryBlockers = selectedProject
    ? deliveryReadiness
      ? deliveryReadiness.blockers.filter((blocker) => blocker.severity === "BLOCKER").map((blocker) => blocker.message)
      : deliveryReadinessError
        ? [`Delivery readiness could not be verified: ${compactDevFlowError(deliveryReadinessError)}`]
        : clientDeliveryBlockers(selectedProject, sharedArtifacts, sharedDocuments)
    : [];

  const refreshDeliveryReadiness = async () => {
    if (!selectedProject?.id) {
      setDeliveryReadiness(null);
      return;
    }

    setDeliveryReadinessLoading(true);
    setDeliveryReadinessError("");
    try {
      setDeliveryReadiness(await getDevFlowDeliveryReadiness(selectedProject.id));
    } catch (nextError) {
      setDeliveryReadiness(null);
      setDeliveryReadinessError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setDeliveryReadinessLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    if (!selectedProject?.id) {
      setDeliveryReadiness(null);
      setDeliveryReadinessError("");
      setDeliveryReadinessLoading(false);
      return () => {
        active = false;
      };
    }

    setDeliveryReadinessLoading(true);
    setDeliveryReadinessError("");
    getDevFlowDeliveryReadiness(selectedProject.id)
      .then((readiness) => {
        if (!active) return;
        setDeliveryReadiness(readiness);
      })
      .catch((nextError) => {
        if (!active) return;
        setDeliveryReadiness(null);
        setDeliveryReadinessError(nextError instanceof Error ? nextError.message : String(nextError));
      })
      .finally(() => {
        if (!active) return;
        setDeliveryReadinessLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedProject?.id]);

  const refresh = async () => {
    await Promise.all([refreshProjects(), refreshSelectedProject?.(), outputs.refresh(), refreshDeliveryReadiness()]);
  };

  const acceptDelivery = async () => {
    if (deliveryBlockers.length) {
      setDeliveryError(deliveryBlockers[0]);
      return;
    }

    setDeliverySaving(true);
    setDeliveryError("");
    try {
      await acceptDevFlowProjectDelivery(selectedProject.id, { note: deliveryNote.trim() || undefined });
      setApproveOpen(false);
      setDeliveryNote("");
      await refresh();
    } catch (nextError) {
      setDeliveryError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setDeliverySaving(false);
    }
  };

  const requestRevision = async () => {
    setDeliverySaving(true);
    setDeliveryError("");
    try {
      await requestDevFlowProjectDeliveryRevision(selectedProject.id, { note: deliveryNote.trim() });
      setRevisionOpen(false);
      setDeliveryNote("");
      await refresh();
    } catch (nextError) {
      setDeliveryError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setDeliverySaving(false);
    }
  };

  if (!selectedProject) {
    return (
      <div data-screen-label="Client - My Product">
        <ClientPageHeader title="My Product" subtitle="Preview your application, review the latest build, and approve final delivery." />
        <ClientProductBackendNotice loading={selectedProjectLoading} error={selectedProjectError} project={selectedProject} />
      </div>
    );
  }

  return (
    <div data-screen-label="Client - My Product">
      <ClientPageHeader title="My Product" subtitle="Preview your application, review the latest build, and approve final delivery." />

      <ClientProductBackendNotice loading={selectedProjectLoading} error={selectedProjectError} project={selectedProject} />

      <Card style={{ padding: 28, marginBottom: 24, background: "linear-gradient(135deg, rgba(47,107,255,.10), rgba(139,92,246,.06))", border: "1px solid rgba(79,139,255,.30)", position: "relative", overflow: "hidden" }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: 0, margin: "12px 0 8px" }}>{productName}</h2>
            <p style={{ color: "var(--text-2)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 560 }}>{selectedProject.brief}</p>
            <div style={{ marginTop: 22, maxWidth: 460 }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 500 }}>Overall completion</span><span className="mono" style={{ fontSize: 12.5, color: "white", fontWeight: 600 }}>{progress}%</span></div>
              <div style={{ height: 8, borderRadius: 999, background: "rgba(8,14,32,.7)", overflow: "hidden" }}><div style={{ width: `${progress}%`, height: "100%", background: lifecycleProgressColor(lifecycle.tone), boxShadow: "0 0 12px rgba(79,139,255,.35)" }} /></div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8 }}>{lifecycle.nextAction} - updated {formatDevFlowDate(selectedProject.updatedAt)}.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Button variant="secondary" icon={<IconExternalLink size={15} />} disabled>Preview unavailable</Button><Button variant="primary" icon={<IconRefresh size={15} />} onClick={refresh}>Refresh build</Button></div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 20 }}>
        <div style={{ minWidth: 0 }}>
          <div className="tabs" style={{ marginBottom: 20 }}>
            {[["web", "Web Preview"], ["mobile", "Mobile Preview"], ["backend", "Backend & Architecture"]].map(([key, label]) => <button key={key} className={"tab" + (tab === key ? " active" : "")} onClick={() => setTab(key)}>{label}</button>)}
          </div>
          {tab === "web" && <WebPreviewPane artifacts={sharedArtifacts} />}
          {tab === "mobile" && <MobilePreviewPane artifacts={sharedArtifacts} />}
          {tab === "backend" && <BackendPreviewPane artifacts={sharedArtifacts} events={outputs.events} project={selectedProject} onReviewed={outputs.refresh} />}

          <Card style={{ padding: 26, marginTop: 20 }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Approval Section</div>
              <DeliveryReviewBadge review={deliveryReview} />
            </div>
            <p style={{ color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.55, marginBottom: 18, maxWidth: 580 }}>Once you&apos;re happy with the build, accept delivery to trigger final production deploy and start your support window.</p>
            {deliveryReview?.revisionNote && <div style={{ padding: 12, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.08)", borderRadius: 10, color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{deliveryReview.revisionNote}</div>}
            {deliveryReview?.resolutionNote && <div style={{ padding: 12, border: "1px solid rgba(16,185,129,.24)", background: "rgba(16,185,129,.07)", borderRadius: 10, color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, marginBottom: 14 }}>{deliveryReview.resolutionNote}</div>}
            <div className="row" style={{ justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <Badge tone={deliveryReadiness?.ready ? "green" : deliveryReadinessLoading ? "blue" : "amber"}>
                {deliveryReadiness?.ready ? "Ready for acceptance" : deliveryReadinessLoading ? "Checking readiness" : "Acceptance blocked"}
              </Badge>
              <Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={refreshDeliveryReadiness} disabled={deliveryReadinessLoading}>
                {deliveryReadinessLoading ? "Checking..." : "Check readiness"}
              </Button>
            </div>
            {deliveryReadiness && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 10, marginBottom: 14 }}>
                <DeliveryMetric label="Artifacts" value={deliveryReadiness.counts.publishedArtifacts} />
                <DeliveryMetric label="Work orders" value={deliveryReadiness.counts.activeWorkOrders} />
                <DeliveryMetric label="Documents" value={deliveryReadiness.counts.openDocuments} />
                <DeliveryMetric label="Coverage gaps" value={deliveryReadiness.counts.missingAgentTypes} />
              </div>
            )}
            {deliveryBlockers.length > 0 && (
              <div style={{ padding: 12, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.08)", borderRadius: 10, color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.55, marginBottom: 14 }}>
                <strong style={{ color: "white" }}>Delivery acceptance is blocked.</strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                  {deliveryBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
                </ul>
              </div>
            )}
            {deliveryError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginBottom: 12 }}>{compactDevFlowError(deliveryError)}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 }}>
              <ApprovalButton tint="#10B981" icon={<IconCheckCircle size={18} />} title="Approve & Accept Delivery" sub={deliveryBlockers.length ? "Resolve open reviews first" : "Marks the engagement as delivered"} onClick={() => { setDeliveryError(""); setDeliveryNote(deliveryReview?.acceptanceNote || ""); setApproveOpen(true); }} primary disabled={deliveryBlockers.length > 0} />
              <ApprovalButton tint="#F59E0B" icon={<IconMessageCircle size={18} />} title="Request Revisions" sub="Send a project-level delivery request" onClick={() => { setDeliveryError(""); setDeliveryNote(deliveryReview?.revisionNote || ""); setRevisionOpen(true); }} />
              <ApprovalButton tint="#4F8BFF" icon={<IconCalendar size={18} />} title="Schedule Walkthrough Call" sub="Scheduling integration is not connected yet" disabled />
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 22 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Deliverable checklist</h4>
            <p style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 14 }}>What you&apos;ll receive on handover</p>
            <ClientDeliverableChecklist artifacts={sharedArtifacts} hasBackendProject={Boolean(selectedProject)} />
          </Card>
          <Card style={{ padding: 22 }}><h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Build info</h4><KV label="Build" value={selectedProject.runId || "Not started"} /><KV label="Branch" value={selectedProject.repoUrl ? "linked repo" : "Not linked"} /><KV label="Last update" value={formatDevFlowDate(selectedProject.updatedAt)} /><KV label="Environment" value={selectedProject.stackKey} /></Card>
          <Card style={{ padding: 18, background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.25)" }}><div className="row gap-2" style={{ alignItems: "flex-start" }}><IconAlertTriangle size={16} style={{ color: "#FBBF24", flexShrink: 0, marginTop: 2 }} /><div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.55 }}><strong style={{ color: "white" }}>Note:</strong> Previews are sandboxed and refresh as the team commits updates.</div></div></Card>
        </div>
      </div>

      <Modal open={approveOpen} onClose={() => !deliverySaving && setApproveOpen(false)} title="Accept final delivery" width={520} footer={<><Button variant="ghost" onClick={() => setApproveOpen(false)} disabled={deliverySaving}>Cancel</Button><Button variant="primary" icon={<IconCheck size={15} />} onClick={acceptDelivery} disabled={deliverySaving || deliveryBlockers.length > 0}>{deliverySaving ? "Confirming..." : "Confirm acceptance"}</Button></>}>
        <div style={{ padding: 18, background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 12, marginBottom: 16 }}><div className="row gap-3"><IconCheckCircle size={22} style={{ color: "#6EE7B7", flexShrink: 0 }} /><div style={{ fontSize: 13.5, lineHeight: 1.55 }}>By confirming, you agree that the delivered application meets the approved requirements.</div></div></div>
        {deliveryBlockers.length > 0 && <div style={{ color: "#FBBF24", fontSize: 12.5, marginBottom: 12 }}>{deliveryBlockers.join(" ")}</div>}
        {deliveryError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginBottom: 12 }}>{compactDevFlowError(deliveryError)}</div>}
        <Field label="Acceptance comments"><Textarea rows={4} value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} placeholder="Anything you'd like to flag for the team." /></Field>
      </Modal>

      <Modal open={revisionOpen} onClose={() => !deliverySaving && setRevisionOpen(false)} title="Request delivery revisions" width={520} footer={<><Button variant="ghost" onClick={() => setRevisionOpen(false)} disabled={deliverySaving}>Cancel</Button><Button variant="primary" icon={<IconMessageCircle size={15} />} onClick={requestRevision} disabled={deliverySaving || !deliveryNote.trim()}>{deliverySaving ? "Submitting..." : "Submit request"}</Button></>}>
        <Field label="Revision request"><Textarea rows={5} value={deliveryNote} onChange={(event) => setDeliveryNote(event.target.value)} placeholder="Describe what needs to change before final acceptance." /></Field>
        {deliveryError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 12 }}>{compactDevFlowError(deliveryError)}</div>}
      </Modal>
    </div>
  );
}

function ClientProductBackendNotice({ loading, error, project }) {
  if (loading) {
    return <Card style={{ padding: 16, marginBottom: 18, color: "var(--text-2)" }}>Loading assigned product...</Card>;
  }

  if (error) {
    return (
      <Card style={{ padding: 16, marginBottom: 18, border: "1px solid rgba(239,68,68,.30)" }}>
        <div style={{ color: "#FCA5A5", fontWeight: 600 }}>Backend product unavailable</div>
        <div style={{ color: "var(--text-2)", fontSize: 12.5, marginTop: 4 }}>{compactDevFlowError(error)}</div>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card style={{ padding: 16, marginBottom: 18 }}>
        <div style={{ fontWeight: 600 }}>No backend product assigned</div>
        <div style={{ color: "var(--text-3)", fontSize: 12.5, marginTop: 4 }}>Product previews appear after you select a backend project from the top bar.</div>
      </Card>
    );
  }

  return null;
}

function WebPreviewPane({ artifacts }) {
  const frontendArtifacts = artifacts.filter((artifact) => artifactAgentIs(artifact, "frontend"));
  return (
    <Card style={{ padding: 24 }}>
      <div className="row gap-3" style={{ alignItems: "flex-start" }}>
        <IconMonitor size={20} style={{ color: "#93C5FD", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600 }}>Web preview artifact</div>
          <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>
            {frontendArtifacts.length ? `${frontendArtifacts.length} frontend artifact${frontendArtifacts.length === 1 ? "" : "s"} available in the backend deliverable list.` : "No client-visible frontend artifact has been shared yet."}
          </div>
        </div>
      </div>
    </Card>
  );
}

function MobilePreviewPane({ artifacts }) {
  const mobileArtifacts = artifacts.filter((artifact) => artifactAgentIs(artifact, "mobile") || artifact.filePath.toLowerCase().includes("mobile"));
  return (
    <Card style={{ padding: 24 }}>
      <div className="row gap-3" style={{ alignItems: "flex-start" }}>
        <IconSmartphone size={20} style={{ color: "#93C5FD", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600 }}>Mobile preview artifact</div>
          <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>
            {mobileArtifacts.length ? `${mobileArtifacts.length} mobile artifact${mobileArtifacts.length === 1 ? "" : "s"} available in the backend deliverable list.` : "No client-visible mobile artifact has been shared yet."}
          </div>
        </div>
      </div>
    </Card>
  );
}

function BackendPreviewPane({ artifacts = [], events = [], project, onReviewed }) {
  const artifactCount = artifacts.length;
  const latestEvent = events[0];
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [revisionArtifact, setRevisionArtifact] = useState(null);
  const [revisionNote, setRevisionNote] = useState("");

  const reviewArtifact = async (artifact, reviewStatus, reviewNote = "") => {
    setReviewing(true);
    setReviewError("");
    try {
      await reviewDevFlowArtifact(artifact.projectId, artifact.id, {
        reviewStatus,
        reviewNote: reviewNote.trim() || undefined,
      });
      setRevisionArtifact(null);
      setRevisionNote("");
      await onReviewed?.();
    } catch (nextError) {
      setReviewError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setReviewing(false);
    }
  };

  const items = [
    { icon: <IconCode size={18} />, tint: "#8B5CF6", title: "Generated Artifacts", sub: `${artifactCount} files recorded`, cta: "Read-only" },
    { icon: <IconGitBranch size={18} />, tint: "#10B981", title: "Source Repository", sub: project.repoUrl || "Repository not linked yet", cta: "Status" },
    { icon: <IconDatabase size={18} />, tint: "#14B8A6", title: "Latest Build Event", sub: latestEvent ? `${latestEvent.nodeName} ${latestEvent.eventType}` : "No event logs yet", cta: "View" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ padding: 18, background: "linear-gradient(135deg, rgba(47,107,255,.10), rgba(139,92,246,.04))" }}>
        <div className="row gap-3"><IconShield size={16} style={{ color: "#93C5FD" }} /><div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.55 }}><strong style={{ color: "white" }}>You&apos;ll own everything on handover.</strong> All code, infrastructure, and documentation transfer to your team.</div></div>
      </Card>
      {items.map((item) => <Card key={item.title} hover style={{ padding: 22 }}><div className="row gap-4"><div style={{ width: 44, height: 44, borderRadius: 12, background: `${item.tint}22`, color: item.tint, border: `1px solid ${item.tint}44`, display: "grid", placeItems: "center", flexShrink: 0 }}>{item.icon}</div><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</div><div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>{item.sub}</div></div><Button variant="secondary" size="sm">{item.cta}</Button></div></Card>)}
      {project && artifacts.length > 0 && (
        <Card style={{ padding: 18 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Deliverable summary</h4>
          <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>Source preview is available to the delivery team only.</p>
          {reviewError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 10 }}>{compactDevFlowError(reviewError)}</div>}
          {artifacts.slice(0, 5).map((artifact) => (
            <div key={artifact.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis" }}>{artifact.displayName || artifact.filePath}</span>
                <div className="row gap-2" style={{ flexShrink: 0 }}>
                  {artifact.publishedAt && <Badge tone="blue">Published</Badge>}
                  <ReviewBadge status={artifact.reviewStatus} />
                </div>
              </div>
              {artifact.reviewNote && <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 5 }}>{artifact.reviewNote}</div>}
              <div className="row gap-2" style={{ marginTop: 8, flexWrap: "wrap" }}>
                <Button variant="secondary" size="sm" icon={<IconCheck size={12} />} onClick={() => reviewArtifact(artifact, "APPROVED")} disabled={reviewing}>Approve</Button>
                <Button variant="secondary" size="sm" icon={<IconMessageCircle size={12} />} onClick={() => { setRevisionArtifact(artifact); setRevisionNote(artifact.reviewNote || ""); }} disabled={reviewing}>Request revision</Button>
                <Badge tone="gray">{artifact.agentType}</Badge>
              </div>
            </div>
          ))}
        </Card>
      )}
      <Modal
        open={Boolean(revisionArtifact)}
        onClose={() => !reviewing && setRevisionArtifact(null)}
        title="Request revision"
        width={520}
        footer={<><Button variant="ghost" onClick={() => setRevisionArtifact(null)} disabled={reviewing}>Cancel</Button><Button variant="primary" onClick={() => reviewArtifact(revisionArtifact, "REVISION_REQUESTED", revisionNote)} disabled={reviewing || !revisionNote.trim()}>Submit request</Button></>}
      >
        <Field label="Revision note">
          <Textarea rows={4} value={revisionNote} onChange={(event) => setRevisionNote(event.target.value)} placeholder="Describe what should change before approval." />
        </Field>
      </Modal>
    </div>
  );
}

function ReviewBadge({ status }) {
  const map = {
    APPROVED: { tone: "green", label: "Approved" },
    REVISION_REQUESTED: { tone: "amber", label: "Revision requested" },
    PENDING: { tone: "gray", label: "Pending review" },
  };
  const next = map[status || "PENDING"] || map.PENDING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

function DeliveryReviewBadge({ review }) {
  const map = {
    ACCEPTED: { tone: "green", label: "Delivery accepted" },
    REVISION_REQUESTED: { tone: "amber", label: "Delivery revision" },
    REVISION_RESOLVED: { tone: "blue", label: "Ready for acceptance" },
    PENDING: { tone: "gray", label: "Awaiting acceptance" },
  };
  const next = map[review?.status || "PENDING"] || map.PENDING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

function ApprovalButton({ tint, icon, title, sub, onClick, primary, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ padding: "16px 18px", textAlign: "left", background: primary ? `linear-gradient(135deg, ${tint}26, ${tint}10)` : "rgba(8,14,32,.5)", border: `1px solid ${primary ? `${tint}55` : "var(--border)"}`, borderRadius: 14, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .62 : 1, color: "white", fontFamily: "inherit", display: "flex", alignItems: "flex-start", gap: 14 }}><div style={{ width: 36, height: 36, borderRadius: 10, background: `${tint}22`, color: tint, display: "grid", placeItems: "center", flexShrink: 0 }}>{icon}</div><div><div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div><div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4, lineHeight: 1.45 }}>{sub}</div></div></button>;
}

function DeliveryMetric({ label, value }) {
  const done = Number(value || 0) === 0 && label !== "Artifacts";
  return <div style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10, background: "rgba(8,14,32,.45)" }}><div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{label}</div><div className="mono" style={{ color: done ? "#6EE7B7" : "white", fontWeight: 700, marginTop: 3 }}>{value}</div></div>;
}

function DeliverableCheck({ label, done, inProgress, last }) {
  const color = done ? "#10B981" : inProgress ? "#F59E0B" : "#64748B";
  return <div className="row" style={{ padding: "10px 0", borderBottom: last ? 0 : "1px solid var(--border)", gap: 12 }}><div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? `${color}22` : "rgba(15,23,42,.85)", border: `1px solid ${color}66`, color, display: "grid", placeItems: "center", flexShrink: 0 }}>{done ? <IconCheck size={12} /> : inProgress ? "..." : <IconCircle size={10} />}</div><div style={{ flex: 1, fontSize: 13, color: done || inProgress ? "white" : "var(--text-3)" }}>{label}</div><div style={{ fontSize: 11, color, fontWeight: 500 }}>{done ? "Complete" : inProgress ? "In progress" : "Pending"}</div></div>;
}

function ClientDeliverableChecklist({ artifacts, hasBackendProject }) {
  if (!hasBackendProject) {
    return (
      <>
        <DeliverableCheck label="Frontend application" />
        <DeliverableCheck label="Backend API" />
        <DeliverableCheck label="Database schema" />
        <DeliverableCheck label="Documentation" />
        <DeliverableCheck label="Production deployment" pending last />
      </>
    );
  }

  const frontend = artifacts.some((artifact) => artifactAgentIs(artifact, "frontend"));
  const backend = artifacts.some((artifact) => artifactAgentIs(artifact, "backend"));
  const database = artifacts.some((artifact) => artifactAgentIs(artifact, "database"));
  const docs = artifacts.some((artifact) => artifact.filePath.toLowerCase().includes("readme") || artifact.filePath.toLowerCase().includes("doc"));

  return (
    <>
      <DeliverableCheck label="Frontend application" done={frontend} inProgress={!frontend} />
      <DeliverableCheck label="Backend API" done={backend} inProgress={!backend} />
      <DeliverableCheck label="Database schema" done={database} inProgress={!database} />
      <DeliverableCheck label="Documentation" done={docs} inProgress={!docs} />
      <DeliverableCheck label="Production deployment" pending last />
    </>
  );
}

function clientDeliveryBlockers(project, artifacts, documents) {
  const blockers = [];
  const acceptedInvite = project.clientInvites?.some((invite) => invite.status === "ACCEPTED");
  const openArtifacts = artifacts.filter((artifact) => artifact.reviewStatus !== "APPROVED");
  const openDocuments = documents.filter((document) => !["APPROVED", "ARCHIVED"].includes(document.status));

  if (!acceptedInvite) {
    blockers.push("Accept the project invite before accepting final delivery.");
  }
  if (openArtifacts.length > 0) {
    blockers.push(`${openArtifacts.length} shared artifact${openArtifacts.length === 1 ? "" : "s"} still need approval or revision handling.`);
  }
  if (openDocuments.length > 0) {
    blockers.push(`${openDocuments.length} client-visible document${openDocuments.length === 1 ? "" : "s"} still need approval or archival.`);
  }

  return blockers;
}

function artifactAgentIs(artifact, agentType) {
  return String(artifact.agentType || "").toLowerCase() === agentType;
}

function KV({ label, value }) {
  return <div className="row" style={{ justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}><span style={{ color: "var(--text-3)" }}>{label}</span><span className="mono" style={{ color: "white" }}>{value}</span></div>;
}
