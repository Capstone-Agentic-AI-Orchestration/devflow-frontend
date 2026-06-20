// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, Field, Input, Modal, Select, Textarea } from "@/shared/components/ui";
import {
  IconArrowRight,
  IconChevronRight,
  IconFolder,
  IconLayout,
  IconList,
  IconPlus,
  IconSearch,
  IconRocket,
  IconClipboard,
  IconCheck,
  IconAlertTriangle,
} from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import {
  createDevFlowProject,
  listDevFlowProjects,
  type DevFlowProjectSummary,
} from "@/shared/api/devflow-api";
import {
  LIFECYCLE_STAGES,
  mapProjectStatusToLifecycleStage,
  getStageIndex,
  getStageProgress,
  getOrchestratorRouteForStage,
  type LifecycleStageId,
} from "@/shared/components/project-lifecycle/project-lifecycle-indicator";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "hold", label: "On Hold" },
  { id: "delivered", label: "Delivered" },
  { id: "archived", label: "Archived" },
];

const LIFECYCLE_BADGE = {
  draft: "lifecycle-badge-draft",
  kickoff: "lifecycle-badge-kickoff",
  build: "lifecycle-badge-build",
  review: "lifecycle-badge-review",
  delivered: "lifecycle-badge-delivered",
};

function getLifecycleSignals(project) {
  const signals: Record<string, any> = {};
  const lifecycle = project.lifecycle || {};
  if (lifecycle.signals?.openTasks > 0) signals.openTasks = lifecycle.signals.openTasks;
  if (lifecycle.signals?.revisionOpen) signals.revisionOpen = true;
  return signals;
}

function getNextAction(stageId: LifecycleStageId, project): string {
  const stage = LIFECYCLE_STAGES.find((s) => s.id === stageId);
  if (!stage) return "View project";
  if (stageId === "build") {
    if (project.status === "AWAITING_GATE_1") return "Review Gate 1";
    if (project.status === "AWAITING_GATE_2") return "Review Gate 2";
    if (project.status === "GENERATING_CODE") return "Monitoring build";
  }
  return stage.nextAction;
}

export function PMProjectsView() {
  const router = useRouter();
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updated");
  const [backendProjects, setBackendProjects] = useState<DevFlowProjectSummary[]>([]);
  const [apiError, setApiError] = useState("");
  const [loadingBackend, setLoadingBackend] = useState(true);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    brief: "",
    stackKey: "nextjs-nestjs-supabase",
  });

  const refreshBackendProjects = async () => {
    setLoadingBackend(true);
    setApiError("");
    try {
      setBackendProjects(await listDevFlowProjects());
    } catch (error) {
      setApiError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingBackend(false);
    }
  };

  useEffect(() => {
    void refreshBackendProjects();
  }, []);

  const createProject = async () => {
    const companyName = form.companyName.trim();
    const brief = form.brief.trim();
    const stackKey = form.stackKey.trim();
    if (!companyName || brief.length < 10 || !stackKey) {
      setApiError("Company, stack, and a brief of at least 10 characters are required.");
      return;
    }
    setCreating(true);
    setApiError("");
    try {
      const result = await createDevFlowProject({ companyName, brief, stackKey });
      setForm({ companyName: "", brief: "", stackKey: "nextjs-nestjs-supabase" });
      setNewProjectOpen(false);
      await refreshBackendProjects();
      if (result?.id) {
        router.push(`/pm/orchestrate/${result.id}/brief`);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : String(error));
    } finally {
      setCreating(false);
    }
  };

  const projects = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = backendProjects.filter((project) => {
      const stage = mapProjectStatusToLifecycleStage(project.status, project.kickoffStatus);
      const matchesFilter =
        filter === "all" ? true :
        filter === "hold" ? stage === "kickoff" :
        filter === "active" ? !["delivered"].includes(stage) :
        filter === "delivered" ? stage === "delivered" :
        filter === "archived" ? project.status === "FAILED" :
        true;
      const matchesSearch =
        !query ||
        project.companyName.toLowerCase().includes(query) ||
        project.id.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
    return filtered.sort((a, b) => {
      if (sort === "started") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      return Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt);
    });
  }, [backendProjects, filter, search, sort]);

  const openProject = (id: string) => router.push(`/pm/project/${id}`);

  const hasNoProjects = !loadingBackend && !apiError && backendProjects.length === 0;

  return (
    <div data-screen-label="PM - Projects">
      <PMPageHeader
        title="Projects"
        subtitle="All active and past client engagements."
        actions={
          <Button variant="primary" size="sm" icon={<IconPlus size={14} />} onClick={() => setNewProjectOpen(true)}>
            New project
          </Button>
        }
      />

      {/* Onboarding for new PMs */}
      {hasNoProjects ? (
        <PMOnboarding onNewProject={() => setNewProjectOpen(true)} />
      ) : (
        <>
          {/* Filters and search */}
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              {FILTERS.map((item) => {
                const count = item.id === "all"
                  ? backendProjects.length
                  : item.id === "hold"
                    ? backendProjects.filter((p) => mapProjectStatusToLifecycleStage(p.status, p.kickoffStatus) === "kickoff").length
                    : item.id === "active"
                      ? backendProjects.filter((p) => mapProjectStatusToLifecycleStage(p.status, p.kickoffStatus) !== "delivered").length
                      : item.id === "delivered"
                        ? backendProjects.filter((p) => mapProjectStatusToLifecycleStage(p.status, p.kickoffStatus) === "delivered").length
                        : backendProjects.filter((p) => p.status === "FAILED").length;

                return (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className={`projects-filter-chip ${filter === item.id ? "projects-filter-active" : ""}`}
                  >
                    {item.label}
                    <span className="projects-filter-count">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="row gap-2" style={{ flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: 240, maxWidth: "100%" }}>
                <IconSearch size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }} />
                <input
                  className="input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search projects..."
                  style={{ paddingLeft: 34, height: 36, fontSize: 13 }}
                />
              </div>
              <select className="input select" value={sort} onChange={(event) => setSort(event.target.value)} style={{ width: 168, height: 36, fontSize: 13, paddingTop: 0, paddingBottom: 0 }}>
                <option value="updated">Recently updated</option>
                <option value="started">Recently started</option>
              </select>
              <div style={{ display: "flex", background: "rgba(8,14,32,.6)", borderRadius: 8, padding: 3, border: "1px solid var(--border)", height: 36 }}>
                <ViewToggle active={view === "grid"} onClick={() => setView("grid")} icon={<IconLayout size={13} />} label="Grid view" />
                <ViewToggle active={view === "table"} onClick={() => setView("table")} icon={<IconList size={13} />} label="Table view" />
              </div>
            </div>
          </div>

          {apiError ? (
            <Card style={{ padding: 22, color: "#FCA5A5", border: "1px solid rgba(239,68,68,.30)" }}>{compactApiError(apiError)}</Card>
          ) : loadingBackend ? (
            <Card style={{ padding: 22, color: "var(--text-2)" }}>Loading backend projects...</Card>
          ) : projects.length === 0 ? (
            <div className="projects-empty-state">
              <IconFolder size={36} style={{ color: "var(--text-3)" }} />
              <h3>No projects match your filters</h3>
              <p>Try a different search term or filter, or create a new project.</p>
              <Button variant="primary" size="sm" onClick={() => { setFilter("all"); setSearch(""); }} icon={<IconArrowRight size={14} />}>
                Clear filters
              </Button>
            </div>
          ) : view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
              {projects.map((project) => (
                <LifecycleGridCard key={project.id} project={project} onClick={() => openProject(project.id)} />
              ))}
            </div>
          ) : (
            <LifecycleTable projects={projects} onOpen={openProject} />
          )}
        </>
      )}

      <Modal
        open={newProjectOpen}
        onClose={() => !creating && setNewProjectOpen(false)}
        title="New project draft"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setNewProjectOpen(false)} disabled={creating}>Cancel</Button>
            <Button variant="primary" size="sm" icon={<IconPlus size={13} />} onClick={createProject} disabled={creating}>
              {creating ? "Creating..." : "Create project"}
            </Button>
          </>
        }
      >
        <div style={{ display: "grid", gap: 14 }}>
          <Field label="Company">
            <Input
              value={form.companyName}
              onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
              placeholder="Acme Logistics"
            />
          </Field>
          <Field label="Stack">
            <Select
              value={form.stackKey}
              onChange={(event) => setForm((current) => ({ ...current, stackKey: event.target.value }))}
            >
              <option value="nextjs-nestjs-supabase">Next.js + NestJS + Supabase</option>
              <option value="nextjs-nestjs-postgres">Next.js + NestJS + PostgreSQL</option>
              <option value="nextjs-only">Next.js only</option>
            </Select>
          </Field>
          <Field label="Brief" helper="After creating, the orchestration wizard will guide you through setup step by step.">
            <Textarea
              rows={5}
              value={form.brief}
              onChange={(event) => setForm((current) => ({ ...current, brief: event.target.value }))}
              placeholder="Build a dashboard for tracking deliveries, drivers, customer notifications, and admin reporting."
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Onboarding for new PMs ──────────────────────────────────────── */
function PMOnboarding({ onNewProject }: { onNewProject: () => void }) {
  const router = useRouter();
  return (
    <div className="pm-onboarding-hero">
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(47,107,255,.1)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
        <IconFolder size={28} style={{ color: "var(--primary)" }} />
      </div>
      <h2>Welcome to DevFlow Projects</h2>
      <p>
        Manage your projects from start to finish. Create a new project draft to get started,
        then follow the step-by-step orchestration wizard to set up, build, and deliver.
      </p>
      <div className="pm-onboarding-cards">
        <button type="button" className="pm-onboarding-card" onClick={onNewProject}>
          <div className="pm-onboarding-card-icon" style={{ background: "rgba(47,107,255,.12)", color: "var(--primary)" }}>
            <IconPlus size={18} />
          </div>
          <div className="pm-onboarding-card-body">
            <h4>Create a new project</h4>
            <p>Start a project draft with a company name, tech stack, and project brief.</p>
          </div>
        </button>
        <button type="button" className="pm-onboarding-card" onClick={() => router.push("/pm/inbox")}>
          <div className="pm-onboarding-card-icon" style={{ background: "rgba(251,191,36,.12)", color: "#FBBF24" }}>
            <IconRocket size={18} />
          </div>
          <div className="pm-onboarding-card-body">
            <h4>Approve an inquiry</h4>
            <p>Check your inbox for client inquiries and approve them to create projects.</p>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ─── Lifecycle grid card ─────────────────────────────────────────── */
function LifecycleGridCard({ project, onClick }) {
  const stageId = mapProjectStatusToLifecycleStage(project.status, project.kickoffStatus);
  const stage = LIFECYCLE_STAGES.find((s) => s.id === stageId);
  const signals = getLifecycleSignals(project);
  const nextAction = getNextAction(stageId, project);

  return (
    <Card hover style={{ padding: 0, cursor: "pointer", overflow: "hidden" }} onClick={onClick}>
      {/* Lifecycle color bar */}
      <div style={{
        height: 4,
        background: stageId === "draft" ? "var(--text-4)" :
                    stageId === "kickoff" ? "#FBBF24" :
                    stageId === "build" ? "var(--primary)" :
                    stageId === "review" ? "#A78BFA" : "#34D399",
      }} />

      <div style={{ padding: 20 }}>
        {/* Header row */}
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12, alignItems: "center", gap: 10 }}>
          <div className="row gap-3" style={{ alignItems: "center", minWidth: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#4F8BFF,#8B5CF6)", color: "white", display: "grid", placeItems: "center", fontWeight: 700, flexShrink: 0, fontSize: 16 }}>{project.companyName.slice(0, 2).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.companyName}</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--text-4)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis" }}>{project.id}</div>
            </div>
          </div>
          <span className={`lifecycle-badge-${stageId}`} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, border: "1px solid", whiteSpace: "nowrap" }}>
            {stage?.shortLabel ?? stageId}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 14 }}>
          <div className="row" style={{ justifyContent: "space-between", gap: 8, fontSize: 11.5 }}>
            <span style={{ color: "var(--text-3)" }}>Progress</span>
            <span style={{ color: "var(--text-2)", fontWeight: 600 }}>
              {getStageIndex(stageId) + 1} of 5 stages
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "rgba(148,163,184,.16)", overflow: "hidden", marginTop: 5 }}>
            <div style={{ width: `${getStageProgress(stageId)}%`, height: "100%", borderRadius: 999,
              background: stageId === "delivered" ? "#34D399" : "linear-gradient(90deg, var(--primary), #8B5CF6)",
            }} />
          </div>
        </div>

        {/* Status badges */}
        <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 12 }}>
          {signals.openTasks > 0 && <Badge tone="blue">{signals.openTasks} task{signals.openTasks > 1 ? "s" : ""}</Badge>}
          {signals.revisionOpen && <Badge tone="red">Revision open</Badge>}
          {project.status === "FAILED" && <Badge tone="red">Failed</Badge>}
        </div>

        {/* Next action */}
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>{nextAction}</span>
          <IconChevronRight size={14} style={{ color: "var(--text-3)" }} />
        </div>
      </div>
    </Card>
  );
}

/* ─── Lifecycle table ─────────────────────────────────────────────── */
function LifecycleTable({ projects, onOpen }) {
  return (
    <Card style={{ padding: 0, overflow: "auto" }}>
      <div style={{ minWidth: 760 }}>
        <div className="projects-table-header">
          <div>Project</div>
          <div>Stage</div>
          <div>Progress</div>
          <div>Next action</div>
          <div>Updated</div>
          <div />
        </div>
        {projects.map((project, index) => {
          const stageId = mapProjectStatusToLifecycleStage(project.status, project.kickoffStatus);
          const nextAction = getNextAction(stageId, project);

          return (
            <button key={project.id} onClick={() => onOpen(project.id)} className="projects-table-row">
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{project.companyName}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{project.id}</div>
              </div>
              <div>
                <span className={`lifecycle-badge-${stageId}`} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, border: "1px solid" }}>
                  {stageId.charAt(0).toUpperCase() + stageId.slice(1)}
                </span>
              </div>
              <div style={{ width: 120 }}>
                <div style={{ height: 5, borderRadius: 999, background: "rgba(148,163,184,.16)", overflow: "hidden" }}>
                  <div style={{ width: `${getStageProgress(stageId)}%`, height: "100%", borderRadius: 999,
                    background: stageId === "delivered" ? "#34D399" : "linear-gradient(90deg, var(--primary), #8B5CF6)",
                  }} />
                </div>
              </div>
              <div style={{ color: "var(--primary)", fontSize: 12.5, fontWeight: 500 }}>{nextAction}</div>
              <div style={{ color: "var(--text-2)", fontSize: 12.5 }}>{formatDate(project.updatedAt || project.createdAt)}</div>
              <IconChevronRight size={14} style={{ color: "var(--text-3)" }} />
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
function compactApiError(message) {
  try {
    const parsed = JSON.parse(message);
    return parsed.message || parsed.error || message;
  } catch {
    return message;
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function ViewToggle({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      style={{
        width: 30, borderRadius: 6,
        background: active ? "rgba(47,107,255,.20)" : "transparent",
        color: active ? "white" : "var(--text-2)",
        border: 0, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "inherit",
      }}
    >
      {icon}
    </button>
  );
}
