// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentLiveStrip } from "@/features/pm/shared/components/pm-agent-live-strip";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { Badge, Button, Card, Field, Input, Modal, ProgressBar, Select, Tabs, Textarea } from "@/shared/components/ui";
import { DevFlowProjectTimeline } from "@/shared/components/project-timeline/devflow-project-timeline";
import { OrchestrationProviderStatusPanel } from "@/shared/components/orchestration/orchestration-provider-status-panel";
import { OrchestrationLiveVisualizer } from "@/shared/components/orchestration/orchestration-live-visualizer";
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconCheckCircle,
  IconCircle,
  IconClipboard,
  IconCode,
  IconCpu,
  IconDatabase,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFileText,
  IconFolder,
  IconGitBranch,
  IconHash,
  IconLock,
  IconMessageCircle,
  IconMoreVertical,
  IconPlus,
  IconPlay,
  IconRefresh,
  IconRocket,
  IconSearch,
  IconSend,
  IconSettings,
  IconShield,
  IconStar,
  IconUpload,
  IconUser,
  IconUsers,
  IconWorkflow,
} from "@/shared/components/icons";
import {
  addDevFlowProjectMember,
  addDevFlowProjectTaskComment,
  createDevFlowKickoffTasks,
  createDevFlowKickoffWorkOrders,
  createDevFlowProjectTask,
  createDevFlowWorkOrder,
  dispatchDevFlowWorkOrder,
  getDevFlowDeliveryReadiness,
  getDevFlowOrchestrationRuns,
  getDevFlowProjectTaskActivity,
  getDevFlowProject,
  getDevFlowProjectArtifact,
  handleDevFlowArtifactRevision,
  publishDevFlowArtifactOutput,
  rerunReadyDevFlowWorkOrders,
  removeDevFlowProjectMember,
  retryDevFlowWorkOrder,
  reviewDevFlowArtifactOutput,
  resolveDevFlowProjectDeliveryRevision,
  searchDevFlowProfiles,
  startDevFlowOrchestration,
  updateDevFlowArtifactSharing,
  updateDevFlowProject,
  updateDevFlowProjectKickoff,
  updateDevFlowProjectTask,
  updateDevFlowWorkOrder,
  verifyDevFlowGithubDelivery,
  verifyDevFlowLlmProvider,
} from "@/shared/api/devflow-api";
import { useDevFlowOrchestrationProviderStatus, useDevFlowOrchestrationStatus, useDevFlowProjectOutputs } from "@/shared/hooks/use-devflow-projects";

export function PMProjectDetailView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [backendProject, setBackendProject] = useState(null);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState("");

  useEffect(() => {
    let active = true;
    setBackendLoading(true);
    setBackendError("");
    getDevFlowProject(projectId)
      .then((detail) => {
        if (!active) return;
        setBackendProject(detail);
      })
      .catch((error) => {
        if (!active) return;
        setBackendProject(null);
        setBackendError(error instanceof Error ? error.message : String(error));
      })
      .finally(() => {
        if (!active) return;
        setBackendLoading(false);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  if (backendProject) {
    return <BackendProjectDetail project={backendProject} onBack={() => router.push("/pm/projects")} />;
  }

  if (backendLoading) {
    return (
      <div>
        <PMPageHeader
          title="Loading project"
          subtitle={`Checking backend record for ${projectId}.`}
          actions={<Button variant="secondary" size="sm" icon={<IconArrowLeft size={14} />} onClick={() => router.push("/pm/projects")}>Back to projects</Button>}
        />
        <Card style={{ padding: 32, color: "var(--text-2)" }}>Loading backend project...</Card>
      </div>
    );
  }

  return (
    <div>
      <PMPageHeader
        title="Project not found"
        subtitle={`No backend project exists for ${projectId}.`}
        actions={<Button variant="secondary" size="sm" icon={<IconArrowLeft size={14} />} onClick={() => router.push("/pm/projects")}>Back to projects</Button>}
      />
      <Card style={{ padding: 32 }}>
        <div className="row gap-3">
          <IconFolder size={24} style={{ color: "var(--text-3)" }} />
          <div>
            <div style={{ fontWeight: 600 }}>This project is not available from the backend.</div>
            <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>{compactBackendError(backendError) || "Open the project list and select an active backend project."}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function BackendProjectDetail({ project, onBack }) {
  const [detail, setDetail] = useState(project);
  const [tab, setTab] = useState(project.kickoff?.status === "READY" || project.runId ? "overview" : "kickoff");
  const outputs = useDevFlowProjectOutputs(detail.id, { includeEvents: true, includeTasks: true, includeTimeline: true, includeWorkOrders: true });
  const orchestration = useDevFlowOrchestrationStatus(detail.id);
  const provider = useDevFlowOrchestrationProviderStatus(detail.id);
  const [orchestrationRuns, setOrchestrationRuns] = useState([]);
  const [orchestrationRunsLoading, setOrchestrationRunsLoading] = useState(false);
  const [orchestrationRunsError, setOrchestrationRunsError] = useState("");
  const [deliveryReadiness, setDeliveryReadiness] = useState(null);
  const [deliveryReadinessLoading, setDeliveryReadinessLoading] = useState(false);
  const [deliveryReadinessError, setDeliveryReadinessError] = useState("");
  const [githubVerification, setGithubVerification] = useState(null);
  const [githubVerificationLoading, setGithubVerificationLoading] = useState(false);
  const [githubVerificationError, setGithubVerificationError] = useState("");
  const [llmVerification, setLlmVerification] = useState(null);
  const [llmVerificationLoading, setLlmVerificationLoading] = useState(false);
  const [llmVerificationError, setLlmVerificationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [orchestrationAction, setOrchestrationAction] = useState("");
  const [error, setError] = useState("");
  const [memberSearchError, setMemberSearchError] = useState("");
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [form, setForm] = useState({
    companyName: project.companyName,
    brief: project.brief,
    stackKey: project.stackKey,
    status: project.status,
    repoUrl: project.repoUrl || "",
  });
  const [memberForm, setMemberForm] = useState({ email: "", role: "DEV" });

  const status = backendStatusBits(detail.status);
  const kickoffReady = detail.kickoff?.status === "READY" || detail.kickoff?.status === "LOCKED";
  const lifecycle = detail.lifecycle || {
    label: status.label,
    tone: status.tone,
    nextAction: "Open project",
    progress: 0,
    signals: {},
  };
  const budgetPct = detail.runBudget
    ? Math.min(100, Math.round((detail.runBudget.tokensConsumed / detail.runBudget.tokenBudget) * 100))
    : 0;
  const managerIds = projectManagerIds(detail);
  const readyExecutableWorkOrders = outputs.workOrders.filter((workOrder) => workOrder.status === "READY" && workOrder.instructions?.trim());
  const orchestrationBlockers = orchestrationReadinessBlockers(detail, outputs.workOrders, outputs.loading);
  const providerActionBlocked = provider.loading || provider.error || (provider.status && !provider.status.available);
  const canStartOrchestration = orchestrationBlockers.length === 0 && !detail.runId && !starting && !providerActionBlocked;

  const refreshOrchestrationRuns = async (quiet = false) => {
    if (!quiet) setOrchestrationRunsLoading(true);
    setOrchestrationRunsError("");
    try {
      setOrchestrationRuns(await getDevFlowOrchestrationRuns(detail.id));
    } catch (nextError) {
      setOrchestrationRunsError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      if (!quiet) setOrchestrationRunsLoading(false);
    }
  };

  const refreshDeliveryReadiness = async () => {
    setDeliveryReadinessLoading(true);
    setDeliveryReadinessError("");
    try {
      setDeliveryReadiness(await getDevFlowDeliveryReadiness(detail.id));
    } catch (nextError) {
      setDeliveryReadiness(null);
      setDeliveryReadinessError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setDeliveryReadinessLoading(false);
    }
  };

  const verifyGithubDelivery = async () => {
    setGithubVerificationLoading(true);
    setGithubVerificationError("");
    try {
      setGithubVerification(await verifyDevFlowGithubDelivery(detail.id));
      await provider.refresh?.();
    } catch (nextError) {
      setGithubVerification(null);
      setGithubVerificationError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setGithubVerificationLoading(false);
    }
  };

  const verifyLlmProvider = async () => {
    setLlmVerificationLoading(true);
    setLlmVerificationError("");
    try {
      setLlmVerification(await verifyDevFlowLlmProvider(detail.id));
      await provider.refresh?.();
    } catch (nextError) {
      setLlmVerification(null);
      setLlmVerificationError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLlmVerificationLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const query = memberForm.email.trim();
    setSelectedProfile(null);
    setMemberSearchError("");

    if (query.length < 2) {
      setMemberSearchResults([]);
      setMemberSearchLoading(false);
      return () => {
        active = false;
      };
    }

    setMemberSearchLoading(true);
    const timeout = window.setTimeout(() => {
      searchDevFlowProfiles({
        q: query,
        roles: [memberForm.role],
        limit: 8,
      })
        .then((profiles) => {
          if (!active) return;
          setMemberSearchResults(profiles);
        })
        .catch((nextError) => {
          if (!active) return;
          setMemberSearchResults([]);
          setMemberSearchError(nextError instanceof Error ? nextError.message : String(nextError));
        })
        .finally(() => {
          if (!active) return;
          setMemberSearchLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [memberForm.email, memberForm.role]);

  useEffect(() => {
    refreshOrchestrationRuns();
    refreshDeliveryReadiness();
  }, [detail.id]);

  useEffect(() => {
    const liveRun = Boolean(detail.runId) && !["DELIVERED", "FAILED"].includes(detail.status);
    const activeRun = orchestrationRuns.some((run) => run.status === "RUNNING");
    const activeWorkOrder = outputs.workOrders.some((workOrder) => workOrder.status === "DISPATCHED");

    if (!liveRun && !activeRun && !activeWorkOrder && !orchestrationAction) return;

    let mounted = true;
    let pending = false;
    const refreshLiveSnapshot = async () => {
      if (pending) return;
      pending = true;
      try {
        const updated = await getDevFlowProject(detail.id);
        if (!mounted) return;
        setDetail(updated);
        await Promise.all([
          outputs.refresh?.(),
          orchestration.refresh?.(),
          provider.refresh?.(),
          refreshOrchestrationRuns(true),
        ]);
      } catch {
        // Existing hooks surface their own request errors; avoid replacing the page with a transient live-refresh failure.
      } finally {
        pending = false;
      }
    };

    const timer = window.setInterval(refreshLiveSnapshot, 4000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [detail.id, detail.runId, detail.status, orchestration.status?.status, orchestrationAction, outputs.workOrders.length, orchestrationRuns.length]);

  const saveProject = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateDevFlowProject(detail.id, {
        ...form,
        repoUrl: form.repoUrl.trim() || undefined,
      });
      setDetail(updated);
      setForm({
        companyName: updated.companyName,
        brief: updated.brief,
        stackKey: updated.stackKey,
        status: updated.status,
        repoUrl: updated.repoUrl || "",
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSaving(false);
    }
  };

  const addMember = async () => {
    if (!selectedProfile) {
      setError("Select an existing profile before adding a member.");
      return;
    }
    if (selectedProfile.role !== memberForm.role) {
      setError(`Selected profile is ${selectedProfile.role}. Choose a matching ${selectedProfile.role} project role before adding this member.`);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await addDevFlowProjectMember(detail.id, {
        userId: selectedProfile.id,
        role: memberForm.role,
      });
      setDetail(updated);
      setMemberForm({ email: "", role: "DEV" });
      setSelectedProfile(null);
      setMemberSearchResults([]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (userId) => {
    setSaving(true);
    setError("");
    try {
      setDetail(await removeDevFlowProjectMember(detail.id, userId));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSaving(false);
    }
  };

  const startRun = async () => {
    const blockers = orchestrationReadinessBlockers(detail, outputs.workOrders, outputs.loading);
    const providerBlocker = provider.error || (provider.status && !provider.status.available ? provider.status.reason : "");
    if (provider.loading) {
      setError("Wait for the agent provider check to finish before starting orchestration.");
      return;
    }
    if (providerBlocker) {
      setError(providerBlocker);
      return;
    }
    if (blockers.length && !detail.runId) {
      setError(blockers[0]);
      setTab(blockers[0].includes("work order") ? "work-orders" : "kickoff");
      return;
    }

    setStarting(true);
    setError("");
    try {
      await startDevFlowOrchestration(detail.id);
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      setDetail(await getDevFlowProject(detail.id));
      await Promise.all([outputs.refresh?.(), orchestration.refresh?.(), provider.refresh?.(), refreshOrchestrationRuns(), refreshDeliveryReadiness()]);
      setTab("overview");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setStarting(false);
    }
  };

  const rerunReadyWorkOrders = async () => {
    const blockers = orchestrationReadinessBlockers(detail, outputs.workOrders, outputs.loading);
    if (blockers.length) {
      setError(blockers[0]);
      return;
    }

    setOrchestrationAction("rerun-ready");
    setError("");
    try {
      await rerunReadyDevFlowWorkOrders(detail.id);
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      setDetail(await getDevFlowProject(detail.id));
      await Promise.all([outputs.refresh?.(), orchestration.refresh?.(), provider.refresh?.(), refreshOrchestrationRuns(), refreshDeliveryReadiness()]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setOrchestrationAction("");
    }
  };

  const retryFailedWorkOrder = async (workOrderId) => {
    setOrchestrationAction(workOrderId);
    setError("");
    try {
      await retryDevFlowWorkOrder(detail.id, workOrderId);
      await Promise.all([outputs.refresh?.(), orchestration.refresh?.(), refreshOrchestrationRuns(), refreshDeliveryReadiness()]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setOrchestrationAction("");
    }
  };

  return (
    <div data-screen-label={`PM - Backend Project - ${detail.id}`}>
      <PMPageHeader
        title={detail.companyName}
        subtitle={`${detail.stackKey} - ${detail.id}`}
        actions={
          <div className="row gap-2">
            <Button variant="secondary" size="sm" icon={<IconArrowLeft size={14} />} onClick={onBack}>All projects</Button>
            <Button variant="primary" size="sm" icon={<IconPlay size={13} />} onClick={startRun} disabled={!canStartOrchestration}>
              {detail.runId ? "Run started" : starting ? "Starting..." : canStartOrchestration ? "Start orchestration" : "Not ready"}
            </Button>
          </div>
        }
      />

      {error && (
        <Card style={{ padding: 14, marginBottom: 16, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>
          {compactBackendError(error)}
        </Card>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.45fr) minmax(280px, .8fr)", gap: 18, marginBottom: 18 }}>
        <Card style={{ padding: 24 }}>
          <div className="row" style={{ justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <div className="row gap-2" style={{ marginBottom: 10, flexWrap: "wrap" }}>
                <Badge tone={status.tone}>{status.label}</Badge>
                <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
                <Badge tone={detail.runId ? "green" : canStartOrchestration ? "blue" : "gray"}>{detail.runId ? "Run active" : canStartOrchestration ? "Ready to start" : "Not ready"}</Badge>
                <Badge tone={kickoffReady ? "green" : "yellow"}>{kickoffReady ? "Kickoff ready" : "Kickoff required"}</Badge>
              </div>
              <h2 style={{ margin: 0, fontSize: 24, letterSpacing: 0 }}>{detail.companyName}</h2>
              <p style={{ margin: "10px 0 0", color: "var(--text-2)", maxWidth: 760, fontSize: 14.5, lineHeight: 1.6 }}>{detail.brief}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--text-3)", fontSize: 12 }}>Artifacts</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{detail._count.artifacts}</div>
            </div>
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Backend facts</div>
          <FactRow icon={<IconCalendar size={15} />} label="Created" value={formatBackendDate(detail.createdAt)} />
          <FactRow icon={<IconRefresh size={15} />} label="Updated" value={formatBackendDate(detail.updatedAt)} />
          <FactRow icon={<IconWorkflow size={15} />} label="Next action" value={lifecycle.nextAction} />
          <FactRow icon={<IconCpu size={15} />} label="Orchestration" value={orchestration.loading ? "Checking..." : orchestration.status?.status || detail.status} />
          <FactRow icon={<IconCpu size={15} />} label="Run ID" value={detail.runId || "Not started"} />
          <FactRow icon={<IconGitBranch size={15} />} label="Repo" value={detail.repoUrl || "Not linked"} />
        </Card>
      </section>

      <Tabs
        items={[
          { value: "overview", label: "Overview" },
          { value: "kickoff", label: "Kickoff" },
          { value: "members", label: "Members" },
          { value: "tasks", label: "Tasks" },
          { value: "work-orders", label: "Work Orders" },
          { value: "gates", label: "Gates & Budget" },
          { value: "artifacts", label: "Artifacts" },
          { value: "activity", label: "Activity" },
          { value: "settings", label: "Settings" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div style={{ marginTop: 18 }}>
        {tab === "overview" && (
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 18 }}>
              <Card style={{ padding: 22 }}>
                <SectionTitle title="Live backend record" subtitle="Data loaded from NestJS and Supabase" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 12 }}>
                  <MiniStat label="Stack" value={detail.stackKey} />
                  <MiniStat label="Members" value={String(detail.members.length)} />
                  <MiniStat label="Gate decisions" value={String(detail.gates.length)} />
                  <MiniStat label="Events" value={String(detail._count.eventLogs)} />
                  <MiniStat label="Ready work orders" value={String(readyExecutableWorkOrders.length)} />
                  <MiniStat label="Progress" value={`${lifecycle.progress || 0}%`} />
                </div>
              </Card>
              <Card style={{ padding: 22 }}>
                <SectionTitle title="Creator" subtitle="Profile attached to this project" />
                {detail.createdBy ? (
                  <BackendPersonRow profile={detail.createdBy} role="Creator" />
                ) : (
                  <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 12 }}>Legacy project with no creator profile.</div>
                )}
              </Card>
            </div>
            <BackendDeliveryReviewPanel
              review={detail.deliveryReview}
              readiness={deliveryReadiness}
              readinessLoading={deliveryReadinessLoading}
              readinessError={deliveryReadinessError}
              onRefreshReadiness={refreshDeliveryReadiness}
              onResolve={async (note) => {
                await resolveDevFlowProjectDeliveryRevision(detail.id, { note });
                setDetail(await getDevFlowProject(detail.id));
                await Promise.all([outputs.refresh?.(), refreshDeliveryReadiness()]);
              }}
            />
            <BackendOrchestrationPanel
              detail={detail}
              status={orchestration.status}
              statusLoading={orchestration.loading}
              statusError={orchestration.error}
              providerStatus={provider.status}
              providerLoading={provider.loading}
              providerError={provider.error}
              githubVerification={githubVerification}
              githubVerificationLoading={githubVerificationLoading}
              githubVerificationError={githubVerificationError}
              llmVerification={llmVerification}
              llmVerificationLoading={llmVerificationLoading}
              llmVerificationError={llmVerificationError}
              workOrders={outputs.workOrders}
              artifacts={outputs.artifacts}
              events={outputs.events}
              runs={orchestrationRuns}
              runsLoading={orchestrationRunsLoading}
              runsError={orchestrationRunsError}
              blockers={orchestrationBlockers}
              starting={starting}
              actionId={orchestrationAction}
              onStart={startRun}
              onRerunReady={rerunReadyWorkOrders}
              onRetryFailedWorkOrder={retryFailedWorkOrder}
              onVerifyGithubDelivery={verifyGithubDelivery}
              onVerifyLlmProvider={verifyLlmProvider}
              onRefresh={async () => {
                setDetail(await getDevFlowProject(detail.id));
                await Promise.all([outputs.refresh?.(), orchestration.refresh?.(), provider.refresh?.(), refreshOrchestrationRuns(), refreshDeliveryReadiness()]);
              }}
            />
          </div>
        )}

        {tab === "kickoff" && (
          <BackendKickoffPanel
            detail={detail}
            tasks={outputs.tasks}
            workOrders={outputs.workOrders}
            loading={outputs.loading}
            error={outputs.error}
            onChanged={async () => {
              setDetail(await getDevFlowProject(detail.id));
              await Promise.all([outputs.refresh?.(), refreshDeliveryReadiness()]);
            }}
          />
        )}

        {tab === "members" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 18 }}>
            <Card style={{ padding: 22 }}>
              <SectionTitle title="Project members" subtitle="Users who can access this project" />
              <div style={{ marginTop: 12 }}>
                {detail.members.length === 0 ? (
                  <div style={{ color: "var(--text-3)", fontSize: 13 }}>No assigned members yet.</div>
                ) : detail.members.map((member) => {
                  const isLastManager = managerIds.has(member.userId) && managerIds.size <= 1;

                  return (
                  <div key={member.id} className="row" style={{ gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <BackendPersonAvatar profile={member.user} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{member.user.fullName || member.user.email || member.user.id}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{member.user.email || "No email"} - member role {member.role}</div>
                      {isLastManager && <div style={{ color: "#FBBF24", fontSize: 11.5, marginTop: 3 }}>Last project manager cannot be removed.</div>}
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => removeMember(member.userId)} disabled={saving || isLastManager}>Remove</Button>
                  </div>
                );})}
              </div>
            </Card>
            <Card style={{ padding: 22 }}>
              <SectionTitle title="Add member" subtitle="Search signed-in developer or client profiles" />
              <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                <Field label="Project role">
                  <Select value={memberForm.role} onChange={(event) => setMemberForm((current) => ({ ...current, role: event.target.value }))}>
                    <option value="DEV">Developer</option>
                    <option value="CLIENT">Client</option>
                  </Select>
                </Field>
                <Field label="Search profile">
                  <Input value={memberForm.email} onChange={(event) => setMemberForm((current) => ({ ...current, email: event.target.value }))} placeholder="name or email" />
                </Field>

                <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "rgba(8,14,32,.45)", minHeight: 94 }}>
                  {memberForm.email.trim().length < 2 ? (
                    <div style={{ padding: 14, color: "var(--text-3)", fontSize: 12.5 }}>Type at least 2 characters to search profiles.</div>
                  ) : memberSearchLoading ? (
                    <div style={{ padding: 14, color: "var(--text-2)", fontSize: 12.5 }}>Searching profiles...</div>
                  ) : memberSearchError ? (
                    <div style={{ padding: 14, color: "#FCA5A5", fontSize: 12.5 }}>{compactBackendError(memberSearchError)}</div>
                  ) : memberSearchResults.length === 0 ? (
                    <div style={{ padding: 14 }}>
                      <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>No matching profile found.</div>
                      <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>The user must sign in once before they can be assigned.</div>
                    </div>
                  ) : (
                    memberSearchResults.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setSelectedProfile(profile);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: 0,
                          borderBottom: "1px solid var(--border)",
                          background: selectedProfile?.id === profile.id ? "rgba(79,139,255,.14)" : "transparent",
                          color: "white",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                      >
                        <div className="row gap-3">
                          <BackendPersonAvatar profile={profile} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{profile.fullName || profile.email || profile.id}</div>
                            <div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{profile.email || "No email"}</div>
                          </div>
                          <Badge tone={profile.role === "DEV" ? "purple" : "blue"}>{profile.role}</Badge>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {selectedProfile && (
                  <div style={{ color: "#6EE7B7", fontSize: 12 }}>
                    Selected {selectedProfile.fullName || selectedProfile.email || selectedProfile.id}.
                  </div>
                )}

                <Button variant="primary" size="sm" icon={<IconPlus size={13} />} onClick={addMember} disabled={saving || !selectedProfile}>Add selected member</Button>
              </div>
            </Card>
          </div>
        )}

        {tab === "tasks" && (
          <BackendTasksPanel
            projectId={detail.id}
            tasks={outputs.tasks}
            artifacts={outputs.artifacts}
            members={detail.members}
            loading={outputs.loading}
            error={outputs.error}
            onChanged={async () => {
              await Promise.all([outputs.refresh?.(), refreshDeliveryReadiness()]);
            }}
          />
        )}

        {tab === "work-orders" && (
          <BackendWorkOrdersPanel
            projectId={detail.id}
            workOrders={outputs.workOrders}
            tasks={outputs.tasks}
            artifacts={outputs.artifacts}
            loading={outputs.loading}
            error={outputs.error}
            onChanged={async () => {
              await Promise.all([outputs.refresh?.(), refreshDeliveryReadiness()]);
            }}
          />
        )}

        {tab === "gates" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 18 }}>
            <Card style={{ padding: 22 }}>
              <SectionTitle title="Gate decisions" subtitle="Architecture and code review gates" />
              {detail.gates.length === 0 ? (
                <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 12 }}>No gate decisions recorded yet.</div>
              ) : detail.gates.map((gate) => (
                <div key={gate.id} style={{ padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                  <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{gate.gateType}</div>
                    <Badge tone={gate.decision === "APPROVED" ? "green" : "red"}>{gate.decision}</Badge>
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>{formatBackendDate(gate.decidedAt)}</div>
                  {gate.notes && <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 6 }}>{gate.notes}</div>}
                </div>
              ))}
            </Card>
            <Card style={{ padding: 22 }}>
              <SectionTitle title="Run budget" subtitle="Supervisor budget state" />
              {detail.runBudget ? (
                <>
                  <MiniStat label="Tokens consumed" value={`${detail.runBudget.tokensConsumed} / ${detail.runBudget.tokenBudget}`} />
                  <ProgressBar percent={budgetPct} color="#8B5CF6" />
                  <MiniStat label="Retries" value={`${detail.runBudget.retryCount} / ${detail.runBudget.maxRetries}`} />
                </>
              ) : (
                <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 12 }}>No run budget exists until orchestration starts.</div>
              )}
            </Card>
          </div>
        )}

        {tab === "artifacts" && (
          <BackendArtifactsPanel
            projectId={detail.id}
            artifacts={outputs.artifacts}
            tasks={outputs.tasks}
            members={detail.members}
            loading={outputs.loading}
            error={outputs.error}
            emptyText="No generated artifacts have been recorded for this project yet."
            onChanged={outputs.refresh}
          />
        )}

        {tab === "activity" && (
          <DevFlowProjectTimeline
            timeline={outputs.timeline}
            loading={outputs.loading}
            error={outputs.error}
            emptyText="No timeline events have been recorded for this project yet."
            compactError={compactBackendError}
          />
        )}

        {tab === "settings" && (
          <Card style={{ padding: 22, maxWidth: 780 }}>
            <SectionTitle title="Project settings" subtitle="Update backend project metadata" />
            <div style={{ display: "grid", gap: 14, marginTop: 16 }}>
              <Field label="Company">
                <Input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
              </Field>
              <Field label="Stack">
                <Input value={form.stackKey} onChange={(event) => setForm((current) => ({ ...current, stackKey: event.target.value }))} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="PENDING">Pending</option>
                  <option value="PARSING_REQUIREMENTS">Parsing requirements</option>
                  <option value="NEGOTIATING_CONTRACT">Negotiating contract</option>
                  <option value="AWAITING_GATE_1">Awaiting gate 1</option>
                  <option value="GENERATING_CODE">Generating code</option>
                  <option value="AWAITING_GATE_2">Awaiting gate 2</option>
                  <option value="COMMITTING">Committing</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="FAILED">Failed</option>
                </Select>
              </Field>
              <Field label="Repo URL">
                <Input value={form.repoUrl} onChange={(event) => setForm((current) => ({ ...current, repoUrl: event.target.value }))} placeholder="https://github.com/org/repo" />
              </Field>
              <Field label="Brief">
                <Textarea rows={5} value={form.brief} onChange={(event) => setForm((current) => ({ ...current, brief: event.target.value }))} />
              </Field>
              <Button variant="primary" size="sm" icon={<IconCheck size={13} />} onClick={saveProject} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function BackendOrchestrationPanel({ detail, status, statusLoading, statusError, providerStatus, providerLoading, providerError, githubVerification, githubVerificationLoading, githubVerificationError, llmVerification, llmVerificationLoading, llmVerificationError, workOrders, artifacts, events, runs, runsLoading, runsError, blockers, starting, actionId, onStart, onRerunReady, onRetryFailedWorkOrder, onVerifyGithubDelivery, onVerifyLlmProvider, onRefresh }) {
  const readyWorkOrders = workOrders.filter((workOrder) => workOrder.status === "READY");
  const executableWorkOrders = readyWorkOrders.filter((workOrder) => workOrder.instructions?.trim());
  const failedWorkOrders = workOrders.filter((workOrder) => workOrder.status === "FAILED");
  const completedWorkOrders = workOrders.filter((workOrder) => workOrder.status === "COMPLETED");
  const generatedWorkOrderArtifacts = artifacts.filter((artifact) => artifact.filePath?.startsWith("work-orders/"));
  const pendingPmReview = artifacts.filter((artifact) => (artifact.outputReviewStatus || "PENDING") === "PENDING");
  const statusView = backendStatusBits(status?.status || detail.status);
  const currentNode = status?.currentNode && status.currentNode !== "none" ? status.currentNode : detail.runId || "No active node";
  const latestRun = runs?.[0];
  const providerUnavailable = !providerLoading && (providerError || (providerStatus && !providerStatus.available));
  const githubDelivery = providerStatus?.githubDelivery;
  const githubDeliveryUnavailable = providerStatus?.activeMode === "llm" && githubDelivery && !githubDelivery.available;
  const actionBlocked = blockers.length > 0 || Boolean(providerUnavailable) || Boolean(githubDeliveryUnavailable);
  const activeProviderLabel = providerStatus?.activeMode === "llm" ? "LLM" : providerStatus?.activeMode === "mock" ? "Mock" : "Agent";
  const autopushView = githubAutopushStatus(detail, githubDelivery, providerStatus?.activeMode);

  return (
    <Card style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
        <SectionTitle
          title={`${activeProviderLabel}-provider orchestration`}
          subtitle="Selected agents execute READY work orders and send generated artifacts to PM review."
          icon={<IconCpu size={16} />}
        />
        <div className="row gap-2" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Button variant="secondary" size="sm" icon={<IconRefresh size={13} />} onClick={onRefresh}>Refresh</Button>
          <Button variant="secondary" size="sm" icon={<IconRocket size={13} />} onClick={onRerunReady} disabled={actionId === "rerun-ready" || actionBlocked || executableWorkOrders.length === 0}>
            {actionId === "rerun-ready" ? "Queuing..." : "Rerun READY"}
          </Button>
          <Button variant="primary" size="sm" icon={<IconPlay size={13} />} onClick={onStart} disabled={starting || Boolean(detail.runId) || actionBlocked}>
            {detail.runId ? "Run started" : starting ? "Starting..." : `Start ${activeProviderLabel.toLowerCase()} run`}
          </Button>
        </div>
      </div>

      {statusError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 12 }}>{compactBackendError(statusError)}</div>}
      {runsError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 12 }}>{compactBackendError(runsError)}</div>}

      <div style={{ marginTop: 14 }}>
        <OrchestrationProviderStatusPanel
          status={providerStatus}
          loading={providerLoading}
          error={providerError ? compactBackendError(providerError) : ""}
          githubVerification={githubVerification}
          githubVerificationLoading={githubVerificationLoading}
          githubVerificationError={githubVerificationError ? compactBackendError(githubVerificationError) : ""}
          onVerifyGithubDelivery={onVerifyGithubDelivery}
          llmVerification={llmVerification}
          llmVerificationLoading={llmVerificationLoading}
          llmVerificationError={llmVerificationError ? compactBackendError(llmVerificationError) : ""}
          onVerifyLlmProvider={onVerifyLlmProvider}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
        <OrchestrationFact label="Agent provider" value={providerLoading ? "Checking..." : activeProviderLabel} tone={providerStatus?.available ? "green" : "amber"} />
        <OrchestrationFact label="GitHub delivery" value={githubDelivery ? (githubDelivery.available ? githubDelivery.owner || "Ready" : "Setup needed") : "Checking..."} tone={githubDelivery?.available ? "green" : "amber"} />
        <OrchestrationFact label="Repository" value={detail.repoUrl || "Not linked"} tone={detail.repoUrl ? "green" : "gray"} mono />
        <OrchestrationFact label="Autopush" value={autopushView.label} tone={autopushView.tone} />
        <OrchestrationFact label="Run status" value={statusLoading ? "Checking..." : statusView.label} tone={statusView.tone} />
        <OrchestrationFact label="Current node" value={currentNode} tone="purple" mono />
        <OrchestrationFact label="Run history" value={runsLoading ? "Loading..." : String(runs?.length || 0)} tone={runs?.length ? "blue" : "gray"} />
        <OrchestrationFact label="Executable work orders" value={String(executableWorkOrders.length)} tone={executableWorkOrders.length ? "green" : "gray"} />
        <OrchestrationFact label="Completed work orders" value={String(completedWorkOrders.length)} tone={completedWorkOrders.length ? "green" : "gray"} />
        <OrchestrationFact label="Failed work orders" value={String(failedWorkOrders.length)} tone={failedWorkOrders.length ? "red" : "green"} />
        <OrchestrationFact label="Generated artifacts" value={String(generatedWorkOrderArtifacts.length)} tone={generatedWorkOrderArtifacts.length ? "blue" : "gray"} />
        <OrchestrationFact label="PM review queue" value={String(pendingPmReview.length)} tone={pendingPmReview.length ? "amber" : "green"} />
      </div>

      <div style={{ marginTop: 16 }}>
        <OrchestrationLiveVisualizer
          project={detail}
          status={status}
          providerStatus={providerStatus}
          runs={runs || []}
          workOrders={workOrders}
          artifacts={artifacts}
          events={events}
          loading={statusLoading || runsLoading}
        />
      </div>

      {latestRun && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid rgba(79,139,255,.24)", background: "rgba(79,139,255,.07)", borderRadius: 10 }}>
          <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>Latest run</div>
              <div className="mono" style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{latestRun.runId}</div>
            </div>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <OrchestrationRunBadge status={latestRun.status} />
              <Badge tone="purple">{orchestrationTriggerLabel(latestRun.trigger)}</Badge>
              <Badge tone="gray">{formatBackendDate(latestRun.startedAt)}</Badge>
            </div>
          </div>
          {latestRun.error && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 8 }}>{latestRun.error}</div>}
        </div>
      )}

      {failedWorkOrders.length > 0 && (
        <div style={{ marginTop: 14, padding: 12, border: "1px solid rgba(239,68,68,.28)", background: "rgba(239,68,68,.07)", borderRadius: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 8 }}>Failed work orders</div>
          {failedWorkOrders.map((workOrder) => (
            <div key={workOrder.id} className="row gap-2" style={{ justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(239,68,68,.16)", alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{workOrder.title}</div>
                {workOrder.executionError && <div style={{ color: "#FCA5A5", fontSize: 11.5, marginTop: 3 }}>{workOrder.executionError}</div>}
              </div>
              <Button variant="secondary" size="sm" icon={<IconRefresh size={12} />} onClick={() => onRetryFailedWorkOrder(workOrder.id)} disabled={actionId === workOrder.id || !workOrder.instructions?.trim()}>
                {actionId === workOrder.id ? "Retrying..." : "Retry"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {detail.repoUrl && (
        <div className="row gap-2" style={{ marginTop: 14, padding: 10, border: "1px solid rgba(16,185,129,.24)", background: "rgba(16,185,129,.08)", borderRadius: 8, color: "var(--text-2)", fontSize: 12.5, justifyContent: "space-between", flexWrap: "wrap" }}>
          <span className="row gap-2"><IconGitBranch size={13} style={{ color: "#6EE7B7" }} /> Generated repository is linked.</span>
          <a href={detail.repoUrl} target="_blank" rel="noreferrer" className="row gap-1" style={{ color: "#93C5FD", fontWeight: 700 }}>
            Open repo <IconExternalLink size={12} />
          </a>
        </div>
      )}

      {(blockers.length > 0 || providerUnavailable || githubDeliveryUnavailable) && !detail.runId ? (
        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {providerUnavailable && (
            <div className="row gap-2" style={{ padding: 10, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.08)", borderRadius: 8, color: "var(--text-2)", fontSize: 12.5 }}>
              <IconAlertTriangle size={13} style={{ color: "#FBBF24", flexShrink: 0 }} />
              <span>{compactBackendError(providerError) || providerStatus?.reason || "The selected agent provider is not available."}</span>
            </div>
          )}
          {githubDeliveryUnavailable && (
            <div className="row gap-2" style={{ padding: 10, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.08)", borderRadius: 8, color: "var(--text-2)", fontSize: 12.5 }}>
              <IconAlertTriangle size={13} style={{ color: "#FBBF24", flexShrink: 0 }} />
              <span>{githubDelivery?.reason || "GitHub delivery is not ready. Configure GitHub App credentials before starting the LLM delivery flow."}</span>
            </div>
          )}
          {blockers.map((blocker) => (
            <div key={blocker} className="row gap-2" style={{ padding: 10, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.08)", borderRadius: 8, color: "var(--text-2)", fontSize: 12.5 }}>
              <IconAlertTriangle size={13} style={{ color: "#FBBF24", flexShrink: 0 }} />
              <span>{blocker}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 14, padding: 10, border: "1px solid rgba(16,185,129,.24)", background: "rgba(16,185,129,.08)", borderRadius: 8, color: "var(--text-2)", fontSize: 12.5 }}>
          {providerUnavailable
            ? compactBackendError(providerError) || providerStatus?.reason || "The selected agent provider is not available."
            : detail.runId
              ? "This project already has an orchestration run. Review generated artifacts and publish approved outputs when ready."
              : `This project can start the ${activeProviderLabel.toLowerCase()} provider orchestration run.`}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, .7fr)", gap: 14, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>READY work orders</div>
          {readyWorkOrders.length === 0 ? (
            <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>No READY work orders are queued.</div>
          ) : readyWorkOrders.slice(0, 5).map((workOrder) => (
            <div key={workOrder.id} className="row gap-2" style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
              <Badge tone={workOrder.instructions?.trim() ? "blue" : "amber"}>{workOrder.agentType}</Badge>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{workOrder.title}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 2 }}>{workOrder.instructions?.trim() ? "Instructions ready" : "Missing instructions"}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Recent run events</div>
          {events.length === 0 ? (
            <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>No orchestration event logs yet.</div>
          ) : events.slice(0, 5).map((event) => (
            <div key={event.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{event.nodeName}</div>
              <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 2 }}>{event.eventType} - {formatBackendDate(event.occurredAt)}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Run history</div>
        {runsLoading ? (
          <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>Loading run history...</div>
        ) : !runs?.length ? (
          <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>No durable orchestration runs recorded yet.</div>
        ) : runs.slice(0, 5).map((run) => (
          <div key={run.id} style={{ padding: "10px 0", borderTop: "1px solid var(--border)" }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 11.5, color: "white", overflowWrap: "anywhere" }}>{run.runId}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{orchestrationTriggerLabel(run.trigger)} - {run.currentNode || "No node"}</div>
              </div>
              <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                <OrchestrationRunBadge status={run.status} />
                <Badge tone="green">{run.completedWorkOrders} done</Badge>
                {run.failedWorkOrders > 0 && <Badge tone="red">{run.failedWorkOrders} failed</Badge>}
                <Badge tone="blue">{run.completedArtifacts} artifacts</Badge>
              </div>
            </div>
            {run.executions?.length > 0 && (
              <div style={{ marginTop: 7, color: "var(--text-3)", fontSize: 11.5 }}>
                {run.executions.length} execution{run.executions.length === 1 ? "" : "s"} recorded
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function OrchestrationRunBadge({ status }) {
  const map = {
    SUCCEEDED: { tone: "green", label: "Succeeded" },
    RUNNING: { tone: "blue", label: "Running" },
    FAILED: { tone: "red", label: "Failed" },
    CANCELLED: { tone: "gray", label: "Cancelled" },
  };
  const next = map[status || "RUNNING"] || map.RUNNING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

function orchestrationTriggerLabel(trigger) {
  const map = {
    START: "Initial start",
    RERUN_READY_WORK_ORDERS: "READY rerun",
    WORK_ORDER_DISPATCH: "Manual dispatch",
    RETRY_FAILED_WORK_ORDER: "Failed retry",
  };
  return map[trigger] || trigger;
}

function OrchestrationFact({ label, value, tone, mono }) {
  return (
    <div style={{ padding: 12, borderRadius: 10, background: "rgba(8,14,32,.55)", border: "1px solid var(--border)", minWidth: 0 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <span style={{ color: "var(--text-3)", fontSize: 11.5 }}>{label}</span>
        <Badge tone={tone || "gray"}>{tone === "green" ? "OK" : tone === "amber" ? "Review" : tone === "red" ? "Blocked" : "Live"}</Badge>
      </div>
      <div className={mono ? "mono" : undefined} style={{ fontSize: 15, fontWeight: 800, overflowWrap: "anywhere" }}>{value}</div>
    </div>
  );
}

function BackendKickoffPanel({ detail, tasks, workOrders, loading, error, onChanged }) {
  const kickoff = detail.kickoff || {};
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState("");
  const [kickoffError, setKickoffError] = useState("");
  const [form, setForm] = useState(() => kickoffFormFromDetail(kickoff, detail));

  useEffect(() => {
    setForm(kickoffFormFromDetail(detail.kickoff || {}, detail));
  }, [detail.id, detail.kickoff?.updatedAt]);

  const checklist = [
    { key: "scopeConfirmed", label: "Scope", body: form.scopeSummary || detail.brief },
    { key: "milestonesConfirmed", label: "Milestones", body: form.milestones || "No milestones saved" },
    { key: "documentsConfirmed", label: "Documents", body: form.requiredDocuments || "No required documents saved" },
    { key: "techStackConfirmed", label: "Stack", body: form.techStackNotes || detail.stackKey },
    { key: "rolesConfirmed", label: "Roles", body: form.deliveryRoles || `${detail.members.length} project member${detail.members.length === 1 ? "" : "s"}` },
    { key: "clientAccessConfirmed", label: "Client access", body: clientInviteSummary(detail.clientInvites) },
    { key: "initialTasksCreated", label: "Tasks", body: `${tasks.length} task${tasks.length === 1 ? "" : "s"}` },
    { key: "initialWorkOrdersCreated", label: "Work orders", body: `${workOrders.length} work order${workOrders.length === 1 ? "" : "s"}` },
  ];
  const completed = checklist.filter((item) => form[item.key]).length;
  const ready = kickoff.status === "READY" || kickoff.status === "LOCKED";

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveKickoff = async () => {
    setSaving(true);
    setKickoffError("");
    try {
      await updateDevFlowProjectKickoff(detail.id, form);
      await onChanged?.();
    } catch (nextError) {
      setKickoffError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSaving(false);
    }
  };

  const createStarterTasks = async () => {
    setAction("tasks");
    setKickoffError("");
    try {
      await createDevFlowKickoffTasks(detail.id);
      await onChanged?.();
    } catch (nextError) {
      setKickoffError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setAction("");
    }
  };

  const createStarterWorkOrders = async () => {
    setAction("work-orders");
    setKickoffError("");
    try {
      await createDevFlowKickoffWorkOrders(detail.id);
      await onChanged?.();
    } catch (nextError) {
      setKickoffError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setAction("");
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 18 }}>
      <Card style={{ padding: 22 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <SectionTitle title="Project kickoff" subtitle={`${completed} of ${checklist.length} checks complete`} />
          <Badge tone={ready ? "green" : "yellow"}>{ready ? "Ready" : kickoff.status || "Draft"}</Badge>
        </div>
        {kickoffError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 10 }}>{compactBackendError(kickoffError)}</div>}
        {error && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 10 }}>{compactBackendError(error)}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
          <Field label="Scope summary">
            <Textarea rows={4} value={form.scopeSummary} onChange={(event) => setValue("scopeSummary", event.target.value)} />
          </Field>
          <Field label="Milestones">
            <Textarea rows={4} value={form.milestones} onChange={(event) => setValue("milestones", event.target.value)} />
          </Field>
          <Field label="Required documents">
            <Textarea rows={4} value={form.requiredDocuments} onChange={(event) => setValue("requiredDocuments", event.target.value)} />
          </Field>
          <Field label="Tech stack notes">
            <Textarea rows={4} value={form.techStackNotes} onChange={(event) => setValue("techStackNotes", event.target.value)} />
          </Field>
          <Field label="Delivery roles">
            <Textarea rows={4} value={form.deliveryRoles} onChange={(event) => setValue("deliveryRoles", event.target.value)} />
          </Field>
          <Field label="Readiness notes">
            <Textarea rows={4} value={form.readinessNotes} onChange={(event) => setValue("readinessNotes", event.target.value)} />
          </Field>
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
          {checklist.map((item) => (
            <label
              key={item.key}
              className="row"
              style={{
                gap: 12,
                alignItems: "flex-start",
                padding: "11px 12px",
                border: "1px solid var(--border)",
                borderRadius: 8,
                background: form[item.key] ? "rgba(16,185,129,.08)" : "rgba(8,14,32,.35)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(form[item.key])}
                onChange={(event) => setValue(item.key, event.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16 }}
              />
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", color: "white", fontSize: 13, fontWeight: 700 }}>{item.label}</span>
                <span style={{ display: "block", color: "var(--text-3)", fontSize: 12, marginTop: 3, lineHeight: 1.45 }}>{item.body}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="row gap-2" style={{ marginTop: 16, flexWrap: "wrap" }}>
          <Button variant="primary" size="sm" icon={<IconCheckCircle size={13} />} onClick={saveKickoff} disabled={saving}>
            {saving ? "Saving..." : "Save kickoff"}
          </Button>
          <Button variant="secondary" size="sm" icon={<IconClipboard size={13} />} onClick={createStarterTasks} disabled={action === "tasks" || loading}>
            {action === "tasks" ? "Creating..." : "Create starter tasks"}
          </Button>
          <Button variant="secondary" size="sm" icon={<IconWorkflow size={13} />} onClick={createStarterWorkOrders} disabled={action === "work-orders" || loading}>
            {action === "work-orders" ? "Creating..." : "Create starter work orders"}
          </Button>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
        <Card style={{ padding: 20 }}>
          <SectionTitle title="Client onboarding" subtitle={`${detail.clientInvites?.length || 0} invite${detail.clientInvites?.length === 1 ? "" : "s"}`} />
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {(detail.clientInvites || []).length === 0 ? (
              <div style={{ color: "var(--text-3)", fontSize: 13 }}>No client invite is linked to this project.</div>
            ) : detail.clientInvites.map((invite) => (
              <div key={invite.id} style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}>
                <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{invite.contactName}</div>
                  <Badge tone={invite.status === "ACCEPTED" ? "green" : invite.status === "PENDING" ? "yellow" : "red"}>{invite.status}</Badge>
                </div>
                <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>{invite.email}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>
                  {invite.acceptedAt ? `Joined ${formatBackendDate(invite.acceptedAt)}` : `Invited ${formatBackendDate(invite.createdAt)}`}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <SectionTitle title="Kickoff outputs" subtitle="Task and work-order hooks" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <MiniStat label="Tasks" value={String(tasks.length)} />
            <MiniStat label="Work orders" value={String(workOrders.length)} />
          </div>
          <div style={{ color: ready ? "#6EE7B7" : "var(--text-3)", fontSize: 12.5, lineHeight: 1.5, marginTop: 12 }}>
            {ready ? "Orchestration start is available." : "Orchestration start unlocks when every kickoff check is saved."}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BackendTasksPanel({ projectId, tasks, artifacts, members, loading, error, onChanged }) {
  const devMembers = members.filter((member) => member.role === "DEV");
  const [savingTask, setSavingTask] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [comment, setComment] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedToId: "",
    artifactId: "",
  });

  const createTask = async () => {
    if (!form.title.trim()) return;
    setSavingTask(true);
    setTaskError("");
    try {
      await createDevFlowProjectTask(projectId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        assignedToId: form.assignedToId || undefined,
        artifactId: form.artifactId || undefined,
      });
      setForm({ title: "", description: "", assignedToId: "", artifactId: "" });
      await onChanged?.();
    } catch (nextError) {
      setTaskError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSavingTask(false);
    }
  };

  const openTaskActivity = async (task) => {
    setSelectedTask(task);
    setActivityOpen(true);
    setActivity([]);
    setActivityError("");
    setActivityLoading(true);
    try {
      setActivity(await getDevFlowProjectTaskActivity(projectId, task.id));
    } catch (nextError) {
      setActivityError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setActivityLoading(false);
    }
  };

  const addComment = async () => {
    if (!selectedTask || !comment.trim()) return;
    setCommentSaving(true);
    setActivityError("");
    try {
      await addDevFlowProjectTaskComment(projectId, selectedTask.id, { message: comment.trim() });
      setComment("");
      setActivity(await getDevFlowProjectTaskActivity(projectId, selectedTask.id));
    } catch (nextError) {
      setActivityError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setCommentSaving(false);
    }
  };

  const updateTaskStatus = async (task, status) => {
    setTaskError("");
    try {
      await updateDevFlowProjectTask(projectId, task.id, { status });
      await onChanged?.();
    } catch (nextError) {
      setTaskError(nextError instanceof Error ? nextError.message : String(nextError));
    }
  };

  if (loading) return <Card style={{ padding: 22, color: "var(--text-2)" }}>Loading project tasks...</Card>;
  if (error) return <Card style={{ padding: 22, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>{compactBackendError(error)}</Card>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: 18 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
          <SectionTitle title="Project work queue" subtitle={`${tasks.length} backend task${tasks.length === 1 ? "" : "s"}`} />
          {taskError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 8 }}>{compactBackendError(taskError)}</div>}
        </div>
        {tasks.length === 0 ? (
          <div style={{ padding: 18, color: "var(--text-3)", fontSize: 13 }}>No tasks created yet.</div>
        ) : tasks.map((task) => (
          <div key={task.id} className="row gap-3" style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
            <ProjectTaskStatusDot status={task.status} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{task.title}</div>
              {task.description && <div style={{ color: "var(--text-2)", fontSize: 12.5, marginTop: 4, lineHeight: 1.45 }}>{task.description}</div>}
              <div className="row gap-2" style={{ marginTop: 8, flexWrap: "wrap" }}>
                <Badge tone="blue">{task.assignedTo?.fullName || task.assignedTo?.email || "Unassigned"}</Badge>
                {task.artifact && <Badge tone="purple">{task.artifact.displayName || task.artifact.filePath}</Badge>}
              </div>
            </div>
            <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
              <Select value={task.status} onChange={(event) => updateTaskStatus(task, event.target.value)} style={{ width: 150 }}>
                <option value="TODO">To do</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="IN_REVIEW">In review</option>
                <option value="DONE">Done</option>
              </Select>
              <Button variant="secondary" size="sm" icon={<IconMessageCircle size={13} />} onClick={() => openTaskActivity(task)}>Activity</Button>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 22 }}>
        <SectionTitle title="New task" subtitle="Assign work to a project developer" />
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <Field label="Title">
            <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Fix requested dashboard copy" />
          </Field>
          <Field label="Description">
            <Textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Specific acceptance notes for the assigned developer." />
          </Field>
          <Field label="Assignee">
            <Select value={form.assignedToId} onChange={(event) => setForm((current) => ({ ...current, assignedToId: event.target.value }))}>
              <option value="">Unassigned</option>
              {devMembers.map((member) => (
                <option key={member.userId} value={member.userId}>{member.user.fullName || member.user.email || member.user.id}</option>
              ))}
            </Select>
          </Field>
          <Field label="Related artifact">
            <Select value={form.artifactId} onChange={(event) => setForm((current) => ({ ...current, artifactId: event.target.value }))}>
              <option value="">No artifact link</option>
              {artifacts.map((artifact) => (
                <option key={artifact.id} value={artifact.id}>{artifact.displayName || artifact.filePath}</option>
              ))}
            </Select>
          </Field>
          <Button variant="primary" size="sm" icon={<IconPlus size={13} />} onClick={createTask} disabled={savingTask || !form.title.trim()}>
            {savingTask ? "Creating..." : "Create task"}
          </Button>
        </div>
      </Card>

      <TaskActivityModal
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        task={selectedTask}
        activity={activity}
        loading={activityLoading}
        error={activityError}
        comment={comment}
        onCommentChange={setComment}
        onAddComment={addComment}
        commentSaving={commentSaving}
      />
    </div>
  );
}

function BackendWorkOrdersPanel({ projectId, workOrders, tasks, artifacts, loading, error, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [workOrderError, setWorkOrderError] = useState("");
  const [form, setForm] = useState({
    title: "",
    instructions: "",
    agentType: "FRONTEND",
    priority: "NORMAL",
    taskId: "",
    artifactId: "",
  });

  const selectedTask = tasks.find((task) => task.id === form.taskId);
  const selectedArtifact = artifacts.find((artifact) => artifact.id === form.artifactId);
  const formIssue = !form.title.trim()
    ? "Title is required."
    : !form.instructions.trim()
      ? "Instructions are required before a work order can be actioned."
      : "";

  const createWorkOrder = async () => {
    if (formIssue) {
      setWorkOrderError(formIssue);
      return;
    }
    setSaving(true);
    setWorkOrderError("");
    try {
      await createDevFlowWorkOrder(projectId, {
        title: form.title.trim(),
        instructions: form.instructions.trim() || undefined,
        agentType: form.agentType,
        priority: form.priority,
        taskId: form.taskId || undefined,
        artifactId: form.artifactId || undefined,
      });
      setForm({ title: "", instructions: "", agentType: "FRONTEND", priority: "NORMAL", taskId: "", artifactId: "" });
      await onChanged?.();
    } catch (nextError) {
      setWorkOrderError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSaving(false);
    }
  };

  const createFromTask = (task) => {
    setForm((current) => ({
      ...current,
      title: current.title || `Handoff: ${task.title}`,
      instructions: current.instructions || task.description || "",
      taskId: task.id,
      artifactId: task.artifactId || current.artifactId,
    }));
  };

  const changeStatus = async (workOrder, status) => {
    if (["READY", "DISPATCHED", "COMPLETED"].includes(status) && !workOrder.instructions?.trim()) {
      setWorkOrderError("Instructions are required before a work order can be marked ready, dispatched, or completed.");
      return;
    }

    setActionId(workOrder.id);
    setWorkOrderError("");
    try {
      await updateDevFlowWorkOrder(projectId, workOrder.id, { status });
      await onChanged?.();
    } catch (nextError) {
      setWorkOrderError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setActionId("");
    }
  };

  const dispatchWorkOrder = async (workOrder) => {
    const blocker = workOrderDispatchBlocker(workOrder);
    if (blocker) {
      setWorkOrderError(blocker);
      return;
    }

    setActionId(workOrder.id);
    setWorkOrderError("");
    try {
      await dispatchDevFlowWorkOrder(projectId, workOrder.id);
      await onChanged?.();
    } catch (nextError) {
      setWorkOrderError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setActionId("");
    }
  };

  if (loading) return <Card style={{ padding: 22, color: "var(--text-2)" }}>Loading work orders...</Card>;
  if (error) return <Card style={{ padding: 22, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>{compactBackendError(error)}</Card>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 380px", gap: 18 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
          <SectionTitle title="Orchestration handoff" subtitle={`${workOrders.length} work order${workOrders.length === 1 ? "" : "s"} ready for persona handoff`} />
          {workOrderError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 8 }}>{compactBackendError(workOrderError)}</div>}
        </div>

        {workOrders.length === 0 ? (
          <div style={{ padding: 18, color: "var(--text-3)", fontSize: 13 }}>No work orders created yet.</div>
        ) : workOrders.map((workOrder) => (
          <div key={workOrder.id} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 7 }}>
                  <WorkOrderStatusBadge status={workOrder.status} />
                  <WorkOrderPriorityBadge priority={workOrder.priority} />
                  <Badge tone="purple">{workOrder.agentType}</Badge>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{workOrder.title}</div>
                {workOrder.instructions ? (
                  <div style={{ color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.5, marginTop: 5, whiteSpace: "pre-wrap" }}>{workOrder.instructions}</div>
                ) : (
                  <div style={{ color: "#FBBF24", fontSize: 12.5, lineHeight: 1.5, marginTop: 5 }}>Instructions required before ready or dispatch.</div>
                )}
                <div className="row gap-2" style={{ marginTop: 9, flexWrap: "wrap" }}>
                  {workOrder.task && <Badge tone="blue">{workOrder.task.title}</Badge>}
                  {workOrder.artifact && <Badge tone="gray">{workOrder.artifact.displayName || workOrder.artifact.filePath}</Badge>}
                  {workOrder.executionRunId && <Badge tone="purple">Run {workOrder.executionAttempt || 1}</Badge>}
                  <span style={{ color: "var(--text-3)", fontSize: 11.5 }}>Updated {formatBackendDate(workOrder.updatedAt)}</span>
                </div>
                {(workOrder.executionStartedAt || workOrder.executionCompletedAt || workOrder.executionError) && (
                  <div style={{ color: workOrder.executionError ? "#FCA5A5" : "var(--text-3)", fontSize: 11.5, marginTop: 6 }}>
                    {workOrder.executionError
                      ? `Execution failed: ${workOrder.executionError}`
                      : workOrder.executionCompletedAt
                        ? `Execution completed ${formatBackendDate(workOrder.executionCompletedAt)}`
                        : `Execution started ${formatBackendDate(workOrder.executionStartedAt)}`}
                  </div>
                )}
              </div>
              <div style={{ display: "grid", gap: 8, justifyItems: "end", minWidth: 152 }}>
                <Select value={workOrder.status} onChange={(event) => changeStatus(workOrder, event.target.value)} disabled={actionId === workOrder.id || ["DISPATCHED", "COMPLETED"].includes(workOrder.status)} style={{ width: 152 }}>
                  <option value="DRAFT">Draft</option>
                  <option value="READY">Ready</option>
                  {workOrder.status === "DISPATCHED" && <option value="DISPATCHED">Dispatched</option>}
                  {workOrder.status === "COMPLETED" && <option value="COMPLETED">Completed</option>}
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<IconRocket size={13} />}
                  onClick={() => dispatchWorkOrder(workOrder)}
                  disabled={actionId === workOrder.id || Boolean(workOrderDispatchBlocker(workOrder))}
                >
                  {actionId === workOrder.id ? "Executing..." : "Dispatch"}
                </Button>
                {workOrderDispatchBlocker(workOrder) && <div style={{ color: "var(--text-3)", fontSize: 11, maxWidth: 152, textAlign: "right" }}>{workOrderDispatchBlocker(workOrder)}</div>}
              </div>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ padding: 22 }}>
        <SectionTitle title="New work order" subtitle="Package a task or artifact for a specialist persona" />
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <Field label="Source task">
            <Select value={form.taskId} onChange={(event) => setForm((current) => ({ ...current, taskId: event.target.value, artifactId: tasks.find((task) => task.id === event.target.value)?.artifactId || current.artifactId }))}>
              <option value="">No task link</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </Select>
          </Field>

          {tasks.length > 0 && (
            <div style={{ display: "grid", gap: 6, maxHeight: 132, overflow: "auto", paddingRight: 2 }}>
              {tasks.slice(0, 4).map((task) => (
                <button key={task.id} onClick={() => createFromTask(task)} style={{ padding: "8px 10px", border: "1px solid var(--border)", borderRadius: 8, background: task.id === form.taskId ? "rgba(79,139,255,.14)" : "rgba(8,14,32,.35)", color: "white", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{task.title}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 2 }}>{task.assignedTo?.fullName || task.assignedTo?.email || "Unassigned"} - {task.status}</div>
                </button>
              ))}
            </div>
          )}

          <Field label="Title">
            <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Handoff: implement dashboard shell" />
          </Field>
          <Field label="Instructions">
            <Textarea rows={5} value={form.instructions} onChange={(event) => setForm((current) => ({ ...current, instructions: event.target.value }))} placeholder="Acceptance notes, scope, constraints, and files to inspect." />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Agent">
              <Select value={form.agentType} onChange={(event) => setForm((current) => ({ ...current, agentType: event.target.value }))}>
                <option value="FRONTEND">Frontend</option>
                <option value="BACKEND">Backend</option>
                <option value="DATABASE">Database</option>
                <option value="ARCHITECTURE">Architecture</option>
                <option value="CONTRACT">Contract</option>
              </Select>
            </Field>
            <Field label="Priority">
              <Select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </Field>
          </div>
          <Field label="Related artifact">
            <Select value={form.artifactId} onChange={(event) => setForm((current) => ({ ...current, artifactId: event.target.value }))}>
              <option value="">No artifact link</option>
              {artifacts.map((artifact) => (
                <option key={artifact.id} value={artifact.id}>{artifact.displayName || artifact.filePath}</option>
              ))}
            </Select>
          </Field>
          {(selectedTask || selectedArtifact) && (
            <div style={{ padding: 10, border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.5 }}>
              {selectedTask && <div>Task: {selectedTask.title}</div>}
              {selectedArtifact && <div>Artifact: {selectedArtifact.displayName || selectedArtifact.filePath}</div>}
            </div>
          )}
          {formIssue && <div style={{ color: "var(--text-3)", fontSize: 12 }}>{formIssue}</div>}
          <Button variant="primary" size="sm" icon={<IconPlus size={13} />} onClick={createWorkOrder} disabled={saving || Boolean(formIssue)}>
            {saving ? "Creating..." : "Create work order"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function TaskActivityModal({ open, onClose, task, activity, loading, error, comment, onCommentChange, onAddComment, commentSaving }) {
  return (
    <Modal open={open} onClose={onClose} title="Task activity" width={760} footer={<><Button variant="ghost" size="sm" onClick={onClose}>Close</Button></>}>
      {!task ? null : (
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{task.title}</div>
            {task.description && <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, marginTop: 5 }}>{task.description}</div>}
          </div>
          <div style={{ display: "grid", gap: 10, maxHeight: 360, overflow: "auto", paddingRight: 4 }}>
            {loading ? (
              <div style={{ color: "var(--text-2)", fontSize: 13 }}>Loading activity...</div>
            ) : error ? (
              <div style={{ color: "#FCA5A5", fontSize: 13 }}>{compactBackendError(error)}</div>
            ) : activity.length === 0 ? (
              <div style={{ color: "var(--text-3)", fontSize: 13 }}>No activity yet.</div>
            ) : activity.map((item) => (
              <TaskActivityRow key={item.id} item={item} />
            ))}
          </div>
          <Field label="Add comment">
            <Textarea rows={3} value={comment} onChange={(event) => onCommentChange(event.target.value)} placeholder="Share a project update, blocker, or decision." />
          </Field>
          <Button variant="primary" size="sm" icon={<IconSend size={13} />} onClick={onAddComment} disabled={commentSaving || !comment.trim()}>
            {commentSaving ? "Posting..." : "Post comment"}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function TaskActivityRow({ item }) {
  const isComment = item.type === "COMMENT";
  return (
    <div style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, background: isComment ? "rgba(79,139,255,.08)" : "rgba(8,14,32,.45)" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700 }}>{item.actor?.fullName || item.actor?.email || "System"}</div>
          <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 2 }}>{taskActivityLabel(item.type)}</div>
        </div>
        <span style={{ color: "var(--text-3)", fontSize: 11.5, whiteSpace: "nowrap" }}>{formatBackendDate(item.createdAt)}</span>
      </div>
      {item.message && <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, marginTop: 8, whiteSpace: "pre-wrap" }}>{item.message}</div>}
    </div>
  );
}

function taskActivityLabel(type) {
  const map = {
    TASK_CREATED: "created task",
    STATUS_CHANGED: "changed status",
    ASSIGNEE_CHANGED: "changed assignee",
    ARTIFACT_CHANGED: "changed artifact link",
    COMMENT: "commented",
  };
  return map[type] || type;
}

function ProjectTaskStatusDot({ status }) {
  const map = {
    TODO: { color: "#94A3B8", label: "To do" },
    IN_PROGRESS: { color: "#60A5FA", label: "In progress" },
    IN_REVIEW: { color: "#FBBF24", label: "In review" },
    DONE: { color: "#6EE7B7", label: "Done" },
  };
  const item = map[status] || map.TODO;
  return (
    <div title={item.label} style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, boxShadow: `0 0 10px ${item.color}`, marginTop: 5, flexShrink: 0 }} />
  );
}

function BackendTaskStatusBadge({ status }) {
  const map = {
    TODO: { tone: "gray", label: "To do" },
    IN_PROGRESS: { tone: "blue", label: "In progress" },
    IN_REVIEW: { tone: "amber", label: "In review" },
    DONE: { tone: "green", label: "Done" },
  };
  const item = map[status] || map.TODO;
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

function WorkOrderStatusBadge({ status }) {
  const map = {
    DRAFT: { tone: "gray", label: "Draft" },
    READY: { tone: "blue", label: "Ready" },
    DISPATCHED: { tone: "purple", label: "Dispatched" },
    COMPLETED: { tone: "green", label: "Completed" },
    FAILED: { tone: "red", label: "Failed" },
    CANCELLED: { tone: "gray", label: "Cancelled" },
  };
  const item = map[status] || map.DRAFT;
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

function WorkOrderPriorityBadge({ priority }) {
  const map = {
    LOW: { tone: "gray", label: "Low" },
    NORMAL: { tone: "blue", label: "Normal" },
    HIGH: { tone: "amber", label: "High" },
    URGENT: { tone: "red", label: "Urgent" },
  };
  const item = map[priority] || map.NORMAL;
  return <Badge tone={item.tone}>{item.label}</Badge>;
}

function BackendDeliveryReviewPanel({ review, readiness, readinessLoading, readinessError, onRefreshReadiness, onResolve }) {
  const [note, setNote] = useState(review?.resolutionNote || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const status = deliveryReviewStatusView(review?.status);
  const readinessStatus = readiness?.ready
    ? { tone: "green", label: "Ready" }
    : { tone: "amber", label: readinessLoading ? "Checking" : "Blocked" };

  const resolveRevision = async () => {
    setSaving(true);
    setError("");
    try {
      await onResolve(note.trim() || undefined);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <SectionTitle title="Delivery review" subtitle="Project-level acceptance and revision state" />
        <div className="row gap-2">
          <Badge tone={readinessStatus.tone}>{readinessStatus.label}</Badge>
          <Badge tone={status.tone}>{status.label}</Badge>
          <Button variant="secondary" size="sm" icon={<IconRefresh size={13} />} onClick={onRefreshReadiness} disabled={readinessLoading}>
            {readinessLoading ? "Checking..." : "Refresh"}
          </Button>
        </div>
      </div>

      {readinessError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 12 }}>{compactBackendError(readinessError)}</div>}
      {readiness && (
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10 }}>
            <MiniStat label="Published artifacts" value={String(readiness.counts.publishedArtifacts)} />
            <MiniStat label="Open work orders" value={String(readiness.counts.activeWorkOrders)} />
            <MiniStat label="Open documents" value={String(readiness.counts.openDocuments)} />
            <MiniStat label="Missing coverage" value={String(readiness.counts.missingAgentTypes)} />
          </div>
          {readiness.blockers.length > 0 ? (
            <div style={{ padding: 12, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.08)", borderRadius: 10 }}>
              <div style={{ color: "white", fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>Acceptance blockers</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.55 }}>
                {readiness.blockers.map((blocker) => <li key={blocker.code}>{blocker.message}</li>)}
              </ul>
            </div>
          ) : (
            <div style={{ padding: 12, border: "1px solid rgba(16,185,129,.24)", background: "rgba(16,185,129,.07)", borderRadius: 10, color: "var(--text-2)", fontSize: 12.5 }}>
              Final delivery is ready for client acceptance.
            </div>
          )}
        </div>
      )}

      {!review ? (
        <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 12 }}>No project-level delivery review has been submitted yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {review.acceptedAt && <MiniStat label="Accepted" value={formatBackendDate(review.acceptedAt)} />}
          {review.acceptanceNote && <ReviewNote tone="green" title="Client acceptance note" body={review.acceptanceNote} />}
          {review.revisionRequestedAt && <MiniStat label="Revision requested" value={formatBackendDate(review.revisionRequestedAt)} />}
          {review.revisionNote && <ReviewNote tone="amber" title="Client revision request" body={review.revisionNote} />}
          {review.resolutionNote && <ReviewNote tone="blue" title="PM resolution note" body={review.resolutionNote} />}

          {review.status === "REVISION_REQUESTED" && (
            <div style={{ display: "grid", gap: 10, paddingTop: 4 }}>
              <Field label="Resolution note">
                <Textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Summarize what the delivery team changed or will change." />
              </Field>
              {error && <div style={{ color: "#FCA5A5", fontSize: 12.5 }}>{compactBackendError(error)}</div>}
              <Button variant="primary" size="sm" icon={<IconCheck size={13} />} onClick={resolveRevision} disabled={saving}>
                {saving ? "Resolving..." : "Mark delivery revision resolved"}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function deliveryReviewStatusView(status) {
  const map = {
    ACCEPTED: { tone: "green", label: "Accepted" },
    REVISION_REQUESTED: { tone: "amber", label: "Revision requested" },
    REVISION_RESOLVED: { tone: "blue", label: "Ready for acceptance" },
    PENDING: { tone: "gray", label: "Pending" },
  };
  return map[status || "PENDING"] || map.PENDING;
}

function ReviewNote({ title, body, tone }) {
  const border = tone === "green" ? "rgba(16,185,129,.24)" : tone === "blue" ? "rgba(79,139,255,.24)" : "rgba(245,158,11,.28)";
  const background = tone === "green" ? "rgba(16,185,129,.07)" : tone === "blue" ? "rgba(79,139,255,.07)" : "rgba(245,158,11,.08)";
  return (
    <div style={{ padding: 12, border: `1px solid ${border}`, background, borderRadius: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5 }}>{title}</div>
      <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

function BackendArtifactsPanel({ projectId, artifacts, tasks, members, loading, error, emptyText, onChanged }) {
  const devMembers = members.filter((member) => member.role === "DEV");
  const [preview, setPreview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [revisionHandling, setRevisionHandling] = useState(false);
  const [revisionResolutionNote, setRevisionResolutionNote] = useState("");
  const [revisionTaskAssigneeId, setRevisionTaskAssigneeId] = useState("");
  const [revisionTaskCreating, setRevisionTaskCreating] = useState(false);
  const [outputReviewing, setOutputReviewing] = useState(false);
  const [outputReviewNote, setOutputReviewNote] = useState("");
  const [outputReviewAssigneeId, setOutputReviewAssigneeId] = useState("");

  const unresolvedRevisions = artifacts.filter(
    (artifact) => artifact.reviewStatus === "REVISION_REQUESTED" && !artifact.revisionHandledAt,
  );
  const linkedTasks = preview ? tasks.filter((task) => task.artifactId === preview.id) : [];

  const openPreview = async (artifactId) => {
    setPreviewOpen(true);
    setPreview(null);
    setPreviewError("");
    setRevisionResolutionNote("");
    setRevisionTaskAssigneeId("");
    setPreviewLoading(true);
    try {
      const artifact = await getDevFlowProjectArtifact(projectId, artifactId);
      setPreview(artifact);
      setDisplayName(artifact.displayName || artifact.filePath);
      setRevisionResolutionNote(artifact.revisionResolutionNote || "");
      setOutputReviewNote(artifact.outputReviewNote || "");
      setOutputReviewAssigneeId("");
    } catch (nextError) {
      setPreviewError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setPreviewLoading(false);
    }
  };

  const createRevisionTask = async () => {
    if (!preview || !revisionTaskAssigneeId) return;
    setRevisionTaskCreating(true);
    setPreviewError("");
    try {
      const artifactLabel = preview.displayName || preview.filePath;
      const notes = [
        preview.reviewNote ? `Client revision request:\n${preview.reviewNote}` : "Client requested a revision for this artifact.",
        preview.revisionResolutionNote || revisionResolutionNote.trim()
          ? `PM resolution note:\n${preview.revisionResolutionNote || revisionResolutionNote.trim()}`
          : "",
      ].filter(Boolean).join("\n\n");

      const task = await createDevFlowProjectTask(projectId, {
        title: `Revision: ${artifactLabel}`,
        description: notes,
        assignedToId: revisionTaskAssigneeId,
        artifactId: preview.id,
      });
      const workOrder = await createDevFlowWorkOrder(projectId, {
        title: `Revision handoff: ${artifactLabel}`,
        instructions: notes,
        agentType: workOrderAgentTypeFromArtifact(preview.agentType),
        priority: "HIGH",
        taskId: task.id,
        artifactId: preview.id,
      });
      await updateDevFlowWorkOrder(projectId, workOrder.id, { status: "READY" });
      await onChanged?.();
    } catch (nextError) {
      setPreviewError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setRevisionTaskCreating(false);
    }
  };

  const handleRevision = async () => {
    if (!preview) return;
    setRevisionHandling(true);
    setPreviewError("");
    try {
      const updated = await handleDevFlowArtifactRevision(projectId, preview.id, {
        resolutionNote: revisionResolutionNote.trim() || undefined,
      });
      setPreview(updated);
      setRevisionResolutionNote(updated.revisionResolutionNote || "");
      await onChanged?.();
    } catch (nextError) {
      setPreviewError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setRevisionHandling(false);
    }
  };

  const updateSharing = async (clientVisible) => {
    if (!preview) return;
    setSharing(true);
    setPreviewError("");
    try {
      const updated = await updateDevFlowArtifactSharing(projectId, preview.id, {
        clientVisible,
        displayName: clientVisible ? displayName.trim() || preview.filePath : undefined,
      });
      setPreview(updated);
      setDisplayName(updated.displayName || updated.filePath);
      await onChanged?.();
    } catch (nextError) {
      setPreviewError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setSharing(false);
    }
  };

  const approveOutput = async () => {
    if (!preview) return;
    setOutputReviewing(true);
    setPreviewError("");
    try {
      const updated = await reviewDevFlowArtifactOutput(projectId, preview.id, {
        status: "APPROVED",
        note: outputReviewNote.trim() || undefined,
      });
      setPreview(updated);
      setOutputReviewNote(updated.outputReviewNote || "");
      await onChanged?.();
    } catch (nextError) {
      setPreviewError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setOutputReviewing(false);
    }
  };

  const requestOutputRework = async () => {
    if (!preview) return;
    setOutputReviewing(true);
    setPreviewError("");
    try {
      const updated = await reviewDevFlowArtifactOutput(projectId, preview.id, {
        status: "REWORK_REQUESTED",
        note: outputReviewNote.trim() || undefined,
        assignedToId: outputReviewAssigneeId || undefined,
      });
      setPreview(updated);
      setOutputReviewNote(updated.outputReviewNote || "");
      await onChanged?.();
    } catch (nextError) {
      setPreviewError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setOutputReviewing(false);
    }
  };

  const publishOutput = async () => {
    if (!preview) return;
    setOutputReviewing(true);
    setPreviewError("");
    try {
      const updated = await publishDevFlowArtifactOutput(projectId, preview.id, {
        displayName: displayName.trim() || preview.displayName || preview.filePath,
      });
      setPreview(updated);
      setDisplayName(updated.displayName || updated.filePath);
      await onChanged?.();
    } catch (nextError) {
      setPreviewError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setOutputReviewing(false);
    }
  };

  if (loading) return <Card style={{ padding: 22, color: "var(--text-2)" }}>Loading artifacts...</Card>;
  if (error) return <Card style={{ padding: 22, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>{compactBackendError(error)}</Card>;
  if (!artifacts.length) return <Card style={{ padding: 22, color: "var(--text-3)" }}>{emptyText}</Card>;

  return (
    <>
      {unresolvedRevisions.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(245,158,11,.34)", marginBottom: 14 }}>
          <div style={{ padding: 16, borderBottom: "1px solid rgba(245,158,11,.22)", background: "rgba(245,158,11,.08)" }}>
            <SectionTitle title="Needs PM action" subtitle={`${unresolvedRevisions.length} client revision request${unresolvedRevisions.length === 1 ? "" : "s"} waiting for acknowledgement`} />
          </div>
          {unresolvedRevisions.map((artifact) => (
            <button key={artifact.id} onClick={() => openPreview(artifact.id)} className="row gap-3" style={{ width: "100%", padding: "12px 16px", border: 0, borderBottom: "1px solid var(--border)", background: "transparent", color: "white", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(245,158,11,.16)", color: "#FCD34D", display: "grid", placeItems: "center", flexShrink: 0 }}><IconAlertTriangle size={15} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 12.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>{artifact.displayName || artifact.filePath}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{artifact.reviewedAt ? `Requested ${formatBackendDate(artifact.reviewedAt)}` : "Revision requested"}</div>
              </div>
              {tasks.some((task) => task.artifactId === artifact.id) && <Badge tone="blue">Task linked</Badge>}
              <Badge tone="amber">Open request</Badge>
            </button>
          ))}
        </Card>
      )}

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
          <SectionTitle title="Generated artifacts" subtitle={`${artifacts.length} backend artifact records`} />
        </div>
        {artifacts.map((artifact) => (
          <button key={artifact.id} onClick={() => openPreview(artifact.id)} style={{ width: "100%", padding: "12px 16px", border: 0, borderBottom: "1px solid var(--border)", background: "transparent", color: "white", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
            <div className="row gap-3" style={{ alignItems: "flex-start" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(79,139,255,.14)", color: "#93C5FD", display: "grid", placeItems: "center", flexShrink: 0 }}><IconFileText size={15} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis" }}>{artifact.filePath}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{artifact.agentType} - {formatBackendDate(artifact.createdAt)}</div>
              </div>
              <div className="row gap-2" style={{ flexShrink: 0 }}>
                <BackendReviewBadge status={artifact.reviewStatus} />
                <OutputReviewBadge status={artifact.outputReviewStatus} />
                <ArtifactValidationBadge status={artifact.validationStatus} />
                {tasks.some((task) => task.artifactId === artifact.id) && <Badge tone="blue">Task linked</Badge>}
                <Badge tone={artifact.clientVisible ? "green" : "blue"}>{artifact.clientVisible ? "Client-visible" : "Internal"}</Badge>
              </div>
            </div>
          </button>
        ))}
      </Card>

      <ArtifactPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        artifact={preview}
        loading={previewLoading}
        error={previewError}
        sharing={sharing}
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        revisionHandling={revisionHandling}
        revisionResolutionNote={revisionResolutionNote}
        onRevisionResolutionNoteChange={setRevisionResolutionNote}
        onHandleRevision={handleRevision}
        revisionTaskAssigneeId={revisionTaskAssigneeId}
        onRevisionTaskAssigneeChange={setRevisionTaskAssigneeId}
        revisionTaskCreating={revisionTaskCreating}
        onCreateRevisionTask={createRevisionTask}
        outputReviewing={outputReviewing}
        outputReviewNote={outputReviewNote}
        onOutputReviewNoteChange={setOutputReviewNote}
        outputReviewAssigneeId={outputReviewAssigneeId}
        onOutputReviewAssigneeChange={setOutputReviewAssigneeId}
        onApproveOutput={approveOutput}
        onRequestOutputRework={requestOutputRework}
        onPublishOutput={publishOutput}
        devMembers={devMembers}
        linkedTasks={linkedTasks}
        onShare={() => updateSharing(true)}
        onUnshare={() => updateSharing(false)}
      />
    </>
  );
}

function ArtifactPreviewModal({ open, onClose, artifact, loading, error, sharing, displayName, onDisplayNameChange, revisionHandling, revisionResolutionNote, onRevisionResolutionNoteChange, onHandleRevision, revisionTaskAssigneeId, onRevisionTaskAssigneeChange, revisionTaskCreating, onCreateRevisionTask, outputReviewing, outputReviewNote, onOutputReviewNoteChange, outputReviewAssigneeId, onOutputReviewAssigneeChange, onApproveOutput, onRequestOutputRework, onPublishOutput, devMembers, linkedTasks, onShare, onUnshare }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Artifact preview"
      width={900}
      footer={<><Button variant="secondary" size="sm" disabled>Download disabled</Button>{artifact?.clientVisible ? <Button variant="secondary" size="sm" onClick={onUnshare} disabled={sharing}>Unshare</Button> : <Button variant="primary" size="sm" onClick={onShare} disabled={sharing || !artifact}>Share with client</Button>}<Button variant="ghost" size="sm" onClick={onClose}>Close</Button></>}
    >
      {loading ? (
        <div style={{ color: "var(--text-2)", padding: 12 }}>Loading artifact...</div>
      ) : error ? (
        <div style={{ color: "#FCA5A5", padding: 12 }}>{compactBackendError(error)}</div>
      ) : artifact ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div className="mono" style={{ fontWeight: 700 }}>{artifact.filePath}</div>
              <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 3 }}>{artifact.agentType} - {formatBackendDate(artifact.createdAt)}</div>
            </div>
            <Badge tone={artifact.clientVisible ? "green" : "gray"}>{artifact.clientVisible ? "Client-visible" : "Internal only"}</Badge>
          </div>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            <BackendReviewBadge status={artifact.reviewStatus} />
            <OutputReviewBadge status={artifact.outputReviewStatus} />
            <ArtifactValidationBadge status={artifact.validationStatus} />
            {artifact.reviewedAt && <span style={{ color: "var(--text-3)", fontSize: 12 }}>Reviewed {formatBackendDate(artifact.reviewedAt)}</span>}
            {artifact.publishedAt && <span style={{ color: "var(--text-3)", fontSize: 12 }}>Published {formatBackendDate(artifact.publishedAt)}</span>}
          </div>
          <ArtifactValidationPanel artifact={artifact} />
          <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid rgba(79,139,255,.22)", background: "rgba(79,139,255,.06)", borderRadius: 10 }}>
            <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>PM output handoff</div>
                <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 2 }}>Approve internally, request rework, or publish to client review.</div>
              </div>
              <OutputReviewBadge status={artifact.outputReviewStatus} />
            </div>
            {artifact.outputReviewNote && <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5 }}>{artifact.outputReviewNote}</div>}
            {artifact.outputReviewStatus === "REWORK_REQUESTED" && (
              <div style={{ padding: 10, borderRadius: 8, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.08)", color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.45 }}>
                This artifact is blocked from publishing until the rework handoff produces a revised output.
              </div>
            )}
            <Field label="Output review note">
              <Textarea rows={3} value={outputReviewNote} onChange={(event) => onOutputReviewNoteChange(event.target.value)} placeholder="PM review notes, publish context, or rework instructions." />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
              <Field label="Rework assignee">
                <Select value={outputReviewAssigneeId} onChange={(event) => onOutputReviewAssigneeChange(event.target.value)}>
                  <option value="">Use linked developer</option>
                  {devMembers.map((member) => <option key={member.userId} value={member.userId}>{member.user.fullName || member.user.email || member.userId}</option>)}
                </Select>
              </Field>
              <Button variant="secondary" size="sm" icon={<IconAlertTriangle size={13} />} onClick={onRequestOutputRework} disabled={outputReviewing || artifact.outputReviewStatus === "PUBLISHED"}>
                Rework
              </Button>
            </div>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <Button variant="secondary" size="sm" icon={<IconCheck size={13} />} onClick={onApproveOutput} disabled={outputReviewing || artifact.outputReviewStatus === "PUBLISHED"}>
                Approve output
              </Button>
              <Button variant="primary" size="sm" icon={<IconExternalLink size={13} />} onClick={onPublishOutput} disabled={outputReviewing || ["PUBLISHED", "REWORK_REQUESTED"].includes(artifact.outputReviewStatus)}>
                Publish to client
              </Button>
            </div>
          </div>
          {artifact.reviewNote && (
            <div style={{ padding: 12, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.08)", borderRadius: 10, color: "var(--text-2)", fontSize: 13, lineHeight: 1.5 }}>
              {artifact.reviewNote}
            </div>
          )}
          {artifact.reviewStatus === "REVISION_REQUESTED" && (
            <div style={{ display: "grid", gap: 10, padding: 12, border: "1px solid rgba(245,158,11,.28)", background: "rgba(245,158,11,.06)", borderRadius: 10 }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Revision handling</div>
                  <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 2 }}>
                    {artifact.revisionHandledAt ? `Handled ${formatBackendDate(artifact.revisionHandledAt)}` : "Awaiting PM acknowledgement"}
                  </div>
                </div>
                {artifact.revisionHandledAt ? <Badge tone="green">Handled</Badge> : <Badge tone="amber">Needs action</Badge>}
              </div>
              {artifact.revisionHandledAt ? (
                artifact.revisionResolutionNote && <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5 }}>{artifact.revisionResolutionNote}</div>
              ) : (
                <>
                  <Field label="PM resolution note">
                    <Textarea rows={3} value={revisionResolutionNote} onChange={(event) => onRevisionResolutionNoteChange(event.target.value)} placeholder="Summarize what needs to happen next." />
                  </Field>
                  <Button variant="primary" size="sm" icon={<IconCheck size={13} />} onClick={onHandleRevision} disabled={revisionHandling || !artifact}>
                    {revisionHandling ? "Marking..." : "Mark revision handled"}
                  </Button>
                </>
              )}
              <div style={{ borderTop: "1px solid rgba(245,158,11,.20)", paddingTop: 10, display: "grid", gap: 10 }}>
                <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Linked work</div>
                    <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 2 }}>
                      {linkedTasks.length ? `${linkedTasks.length} task${linkedTasks.length === 1 ? "" : "s"} linked to this revision` : "Create a developer task from this revision request"}
                    </div>
                  </div>
                  {linkedTasks.length > 0 && <Badge tone="blue">Task linked</Badge>}
                </div>
                {linkedTasks.map((task) => (
                  <div key={task.id} className="row gap-2" style={{ padding: "8px 0", borderBottom: "1px solid rgba(245,158,11,.14)" }}>
                    <ProjectTaskStatusDot status={task.status} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{task.title}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 2 }}>{task.assignedTo?.fullName || task.assignedTo?.email || "Unassigned"}</div>
                    </div>
                    <BackendTaskStatusBadge status={task.status} />
                  </div>
                ))}
                <Field label="Task assignee">
                  <Select value={revisionTaskAssigneeId} onChange={(event) => onRevisionTaskAssigneeChange(event.target.value)}>
                    <option value="">Choose developer</option>
                    {devMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>{member.user.fullName || member.user.email || member.user.id}</option>
                    ))}
                  </Select>
                </Field>
                <div style={{ padding: 10, borderRadius: 8, border: "1px solid rgba(148,163,184,.22)", background: "rgba(8,14,32,.42)", color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.45 }}>
                  <div style={{ color: "white", fontWeight: 700, marginBottom: 4 }}>Revision: {artifact.displayName || artifact.filePath}</div>
                  {artifact.reviewNote || "Client requested a revision for this artifact."}
                </div>
                <Button variant="primary" size="sm" icon={<IconPlus size={13} />} onClick={onCreateRevisionTask} disabled={revisionTaskCreating || !revisionTaskAssigneeId}>
                  {revisionTaskCreating ? "Creating..." : "Create task + work order"}
                </Button>
              </div>
            </div>
          )}
          <Field label="Client display name" helper="Used only when this artifact is shared with the client.">
            <Input value={displayName} onChange={(event) => onDisplayNameChange(event.target.value)} placeholder={artifact.filePath} />
          </Field>
          <pre style={{ margin: 0, maxHeight: 520, overflow: "auto", padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "rgba(8,14,32,.85)", color: "var(--text-2)", fontSize: 12, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{artifact.content ?? ""}</pre>
        </div>
      ) : null}
    </Modal>
  );
}

function BackendReviewBadge({ status }) {
  const map = {
    APPROVED: { tone: "green", label: "Approved" },
    REVISION_REQUESTED: { tone: "amber", label: "Revision requested" },
    PENDING: { tone: "gray", label: "Pending review" },
  };
  const next = map[status || "PENDING"] || map.PENDING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

function ArtifactValidationBadge({ status }) {
  const map = {
    PASSED: { tone: "green", label: "Validated" },
    FAILED: { tone: "red", label: "Invalid" },
    PENDING: { tone: "gray", label: "Unvalidated" },
  };
  const next = map[status || "PENDING"] || map.PENDING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

function ArtifactValidationPanel({ artifact }) {
  const errors = Array.isArray(artifact.validationErrors) ? artifact.validationErrors.filter(Boolean) : [];
  if (!artifact.validationSummary && errors.length === 0 && !artifact.validationStatus) return null;

  const failed = artifact.validationStatus === "FAILED";
  return (
    <div style={{ padding: 12, border: `1px solid ${failed ? "rgba(239,68,68,.28)" : "rgba(16,185,129,.24)"}`, background: failed ? "rgba(239,68,68,.07)" : "rgba(16,185,129,.07)", borderRadius: 10 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Artifact contract</div>
        <ArtifactValidationBadge status={artifact.validationStatus} />
      </div>
      {artifact.validationSummary && <div style={{ color: "var(--text-2)", fontSize: 12.5, marginTop: 6 }}>{artifact.validationSummary}</div>}
      {errors.length > 0 && (
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: failed ? "#FCA5A5" : "var(--text-2)", fontSize: 12.5, lineHeight: 1.45 }}>
          {errors.map((error, index) => <li key={`${String(error)}-${index}`}>{String(error)}</li>)}
        </ul>
      )}
    </div>
  );
}

function workOrderAgentTypeFromArtifact(agentType) {
  const normalized = String(agentType || "").toUpperCase();
  return ["FRONTEND", "BACKEND", "DATABASE", "ARCHITECTURE", "CONTRACT"].includes(normalized)
    ? normalized
    : "FRONTEND";
}

function OutputReviewBadge({ status }) {
  const map = {
    APPROVED: { tone: "green", label: "PM approved" },
    REWORK_REQUESTED: { tone: "amber", label: "Rework requested" },
    PUBLISHED: { tone: "blue", label: "Published" },
    PENDING: { tone: "gray", label: "PM review pending" },
  };
  const next = map[status || "PENDING"] || map.PENDING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

function BackendEventsPanel({ events, loading, error, emptyText }) {
  if (loading) return <Card style={{ padding: 22, color: "var(--text-2)" }}>Loading activity...</Card>;
  if (error) return <Card style={{ padding: 22, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>{compactBackendError(error)}</Card>;
  if (!events.length) return <Card style={{ padding: 22, color: "var(--text-3)" }}>{emptyText}</Card>;

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
        <SectionTitle title="Backend activity" subtitle={`${events.length} recent event log records`} />
      </div>
      {events.map((event) => (
        <div key={event.id} className="row gap-3" style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(139,92,246,.16)", color: "#C4B5FD", display: "grid", placeItems: "center", flexShrink: 0 }}><IconActivity size={14} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{event.nodeName} <span style={{ color: "var(--text-2)", fontWeight: 500 }}>{event.eventType}</span></div>
            <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{formatBackendDate(event.occurredAt)}</div>
          </div>
          <Badge tone={event.eventType === "FAILED" ? "red" : event.eventType === "COMPLETED" ? "green" : "blue"}>{event.runTokens} tokens</Badge>
        </div>
      ))}
    </Card>
  );
}

function BackendPersonRow({ profile, role }) {
  return (
    <div className="row gap-3" style={{ padding: "12px 0", marginTop: 10 }}>
      <BackendPersonAvatar profile={profile} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{profile.fullName || profile.email || profile.id}</div>
        <div style={{ color: "var(--text-3)", fontSize: 11.5 }}>{profile.email || "No email"} - {role}</div>
      </div>
    </div>
  );
}

function BackendPersonAvatar({ profile }) {
  const label = profile.fullName || profile.email || profile.id || "User";
  const initials = label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #4F8BFF, #8B5CF6)", display: "grid", placeItems: "center", color: "white", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function kickoffFormFromDetail(kickoff, detail) {
  return {
    scopeSummary: kickoff.scopeSummary || detail.brief || "",
    milestones: kickoff.milestones || "",
    requiredDocuments: kickoff.requiredDocuments || "",
    techStackNotes: kickoff.techStackNotes || detail.stackKey || "",
    deliveryRoles: kickoff.deliveryRoles || "",
    readinessNotes: kickoff.readinessNotes || "",
    scopeConfirmed: Boolean(kickoff.scopeConfirmed),
    milestonesConfirmed: Boolean(kickoff.milestonesConfirmed),
    documentsConfirmed: Boolean(kickoff.documentsConfirmed),
    techStackConfirmed: Boolean(kickoff.techStackConfirmed),
    rolesConfirmed: Boolean(kickoff.rolesConfirmed),
    clientAccessConfirmed: Boolean(kickoff.clientAccessConfirmed),
    initialTasksCreated: Boolean(kickoff.initialTasksCreated),
    initialWorkOrdersCreated: Boolean(kickoff.initialWorkOrdersCreated),
  };
}

function clientInviteSummary(invites = []) {
  if (!invites.length) return "No invite linked";
  const accepted = invites.filter((invite) => invite.status === "ACCEPTED").length;
  const pending = invites.filter((invite) => invite.status === "PENDING").length;
  if (accepted && pending) return `${accepted} joined, ${pending} pending`;
  if (accepted) return `${accepted} joined`;
  if (pending) return `${pending} pending`;
  return `${invites.length} invite${invites.length === 1 ? "" : "s"}`;
}

function projectManagerIds(detail) {
  return new Set([
    detail.createdById,
    ...detail.members
      .filter((member) => ["PM", "ADMIN"].includes(member.role))
      .map((member) => member.userId),
  ].filter(Boolean));
}

function orchestrationReadinessBlockers(detail, workOrders = [], outputsLoading = false) {
  const blockers = [];
  const kickoffReady = detail.kickoff?.status === "READY" || detail.kickoff?.status === "LOCKED";
  const readyExecutableWorkOrders = workOrders.filter((workOrder) => workOrder.status === "READY" && workOrder.instructions?.trim());

  if (detail.runId) return blockers;
  if (!kickoffReady) blockers.push("Complete and save the kickoff checklist before starting orchestration.");
  if (outputsLoading) blockers.push("Wait for work orders to finish loading before starting orchestration.");
  if (!outputsLoading && readyExecutableWorkOrders.length === 0) blockers.push("Create or mark at least one work order as READY with instructions before starting orchestration.");

  return blockers;
}

function workOrderDispatchBlocker(workOrder) {
  if (workOrder.status !== "READY") return "Only READY work orders can dispatch.";
  if (!workOrder.instructions?.trim()) return "Instructions are required before dispatch.";
  return "";
}

function backendStatusBits(status) {
  const map = {
    PENDING: { label: "Pending", tone: "gray" },
    PARSING_REQUIREMENTS: { label: "Parsing requirements", tone: "blue" },
    NEGOTIATING_CONTRACT: { label: "Negotiating contract", tone: "yellow" },
    AWAITING_GATE_1: { label: "Awaiting architecture gate", tone: "yellow" },
    GENERATING_CODE: { label: "Generating code", tone: "blue" },
    AWAITING_GATE_2: { label: "Awaiting code gate", tone: "yellow" },
    COMMITTING: { label: "Committing", tone: "blue" },
    DELIVERED: { label: "Delivered", tone: "green" },
    FAILED: { label: "Failed", tone: "red" },
  };

  return map[status] || { label: status || "Unknown", tone: "gray" };
}

function githubAutopushStatus(detail, githubDelivery, activeMode) {
  if (detail.repoUrl) return { label: "Pushed to GitHub", tone: "green" };
  if (detail.status === "DELIVERED") return { label: "Delivered, repo missing", tone: "red" };
  if (detail.status === "COMMITTING") return { label: "Pushing now", tone: "blue" };
  if (detail.status === "AWAITING_GATE_2") return { label: "Waiting for Gate 2", tone: "amber" };
  if (activeMode === "llm" && githubDelivery && !githubDelivery.available) {
    return { label: "Blocked by setup", tone: "red" };
  }
  if (activeMode === "llm" && githubDelivery?.available) {
    return { label: "Ready after Gate 2", tone: "green" };
  }
  if (detail.runId) return { label: "Run in progress", tone: "blue" };
  return { label: "Not started", tone: "gray" };
}

function compactBackendError(message) {
  if (!message) return "";

  try {
    const parsed = JSON.parse(message);
    if (Array.isArray(parsed.message)) return parsed.message.join(" ");
    if (typeof parsed.message === "string") return parsed.message;
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    // Plain text API errors are already suitable for display.
  }

  return message;
}

function formatBackendDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function SectionTitle({ title, subtitle, icon }) {
  return (
    <div className="row gap-2" style={{ alignItems: "flex-start" }}>
      {icon && <span style={{ color: "var(--primary)", marginTop: 1 }}>{icon}</span>}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ color: "var(--text-3)", fontSize: 12, margin: "3px 0 0" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ padding: 14, borderRadius: 10, background: "rgba(8,14,32,.55)", border: "1px solid var(--border)", marginTop: 10 }}>
      <div style={{ color: "var(--text-3)", fontSize: 11 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function FactRow({ icon, label, value }) {
  return (
    <div className="row" style={{ justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="row gap-2" style={{ color: "var(--text-3)", fontSize: 12 }}>{icon}{label}</div>
      <div style={{ fontWeight: 600, fontSize: 13, textAlign: "right" }}>{value}</div>
    </div>
  );
}
