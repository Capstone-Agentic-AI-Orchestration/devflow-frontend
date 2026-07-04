"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui";
import {
  IconArrowRight,
  IconChevronRight,
  IconPlus,
  IconSearch,
} from "@/shared/components/icons";
import {
  listDevFlowProjects,
  type DevFlowProjectStatus,
  type DevFlowProjectSummary,
} from "@/shared/api/devflow-api";
import {
  LIFECYCLE_STAGES,
  mapProjectStatusToLifecycleStage,
  getStageProgress,
  type LifecycleStageId,
} from "@/shared/components/project-lifecycle/project-lifecycle-indicator";
import { LiveRunTicker } from "../components/live-run-ticker";

type FilterId = "all" | "attention" | "active" | "delivered" | "failed";

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "attention", label: "Needs attention" },
  { id: "active", label: "Active" },
  { id: "delivered", label: "Delivered" },
  { id: "failed", label: "Failed" },
];

const ATTENTION_STATUSES = new Set<DevFlowProjectStatus>([
  "AWAITING_GATE_1",
  "AWAITING_GATE_2",
  "FAILED",
]);

const RUNNING_STATUSES = new Set<DevFlowProjectStatus>([
  "PARSING_REQUIREMENTS",
  "NEGOTIATING_CONTRACT",
  "GENERATING_CODE",
  "COMMITTING",
]);

function isAttention(project: DevFlowProjectSummary): boolean {
  return ATTENTION_STATUSES.has(project.status);
}

function stageOf(project: DevFlowProjectSummary): LifecycleStageId {
  return mapProjectStatusToLifecycleStage(project.status);
}

/** The project page is status-driven — every next action lives there. */
function projectRoute(project: DevFlowProjectSummary): string {
  return `/pm/project/${project.id}`;
}

function attentionLabel(project: DevFlowProjectSummary): { reason: string; cta: string } {
  switch (project.status) {
    case "AWAITING_GATE_1":
      return { reason: "Gate 1 — approve the architecture contract", cta: "Review contract" };
    case "AWAITING_GATE_2":
      return { reason: "Gate 2 — approve the generated code", cta: "Review code" };
    default:
      return { reason: "Run failed — needs a resume or a fix", cta: "Resume run" };
  }
}

function nextAction(stageId: LifecycleStageId, project: DevFlowProjectSummary): string {
  if (project.status === "AWAITING_GATE_1") return "Review Gate 1";
  if (project.status === "AWAITING_GATE_2") return "Review Gate 2";
  if (project.status === "FAILED") return "Resume run";
  if (RUNNING_STATUSES.has(project.status)) return "Watch live";
  const stage = LIFECYCLE_STAGES.find((s) => s.id === stageId);
  return stage?.nextAction ?? "Continue";
}

function compactApiError(message: string): string {
  try {
    const parsed = JSON.parse(message) as { message?: string; error?: string };
    return parsed.message || parsed.error || message;
  } catch {
    return message;
  }
}

function relativeTime(value: string): string {
  const then = Date.parse(value);
  if (Number.isNaN(then)) return "—";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function PMProjectsView() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterId>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"updated" | "started">("updated");
  const [backendProjects, setBackendProjects] = useState<DevFlowProjectSummary[]>([]);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const projects = await listDevFlowProjects();
        if (!cancelled) setBackendProjects(projects);
      } catch (error) {
        if (!cancelled) setApiError(error instanceof Error ? error.message : String(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo<Record<FilterId, number>>(() => {
    const active = backendProjects.filter(
      (p) => stageOf(p) !== "delivered" && p.status !== "FAILED",
    ).length;
    return {
      all: backendProjects.length,
      attention: backendProjects.filter(isAttention).length,
      active,
      delivered: backendProjects.filter((p) => stageOf(p) === "delivered").length,
      failed: backendProjects.filter((p) => p.status === "FAILED").length,
    };
  }, [backendProjects]);

  const projects = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = backendProjects.filter((project) => {
      const stage = stageOf(project);
      const matchesFilter =
        filter === "all" ? true :
        filter === "attention" ? isAttention(project) :
        filter === "active" ? stage !== "delivered" && project.status !== "FAILED" :
        filter === "delivered" ? stage === "delivered" :
        project.status === "FAILED";
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

  const attentionProjects = useMemo(
    () =>
      backendProjects
        .filter(isAttention)
        .sort((a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt)),
    [backendProjects],
  );

  const runningProject = useMemo(
    () =>
      backendProjects
        .filter((p) => RUNNING_STATUSES.has(p.status))
        .sort((a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt))[0],
    [backendProjects],
  );

  const hasNoProjects = !loading && !apiError && backendProjects.length === 0;

  return (
    <div data-screen-label="PM - Projects" className="pmx-page">
      <header className="pmx-head pmx-rise">
        <div>
          <h1 className="pmx-title">Projects</h1>
          <p className="pmx-sub">
            {loading ? "Loading…" : `${counts.all} project${counts.all === 1 ? "" : "s"}`}
            {counts.attention > 0 && (
              <> · <span className="pmx-sub-attn">{counts.attention} need{counts.attention === 1 ? "s" : ""} your review</span></>
            )}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<IconPlus size={15} />}
          onClick={() => router.push("/pm/projects/new")}
        >
          New project
        </Button>
      </header>

      {hasNoProjects ? (
        <div className="pmx-empty pmx-rise">
          <h3>No projects yet</h3>
          <p>Create your first project — describe what to build, and the agents do the rest.</p>
          <Button variant="primary" size="md" onClick={() => router.push("/pm/projects/new")}>
            New project
          </Button>
        </div>
      ) : (
        <>
          {runningProject && <LiveRunTicker key={runningProject.id} project={runningProject} />}

          {attentionProjects.length > 0 && (
            <section className="pmx-attn pmx-rise" aria-label="Needs your attention">
              <div className="pmx-section-label">Needs your attention</div>
              {attentionProjects.map((project, i) => {
                const meta = attentionLabel(project);
                return (
                  <button
                    key={project.id}
                    type="button"
                    className="pmx-attn-row pmx-rise"
                    style={{ "--i": i } as CSSProperties}
                    onClick={() => router.push(projectRoute(project))}
                  >
                    <span
                      className={`pmx-attn-dot ${project.status === "FAILED" ? "is-failed" : ""}`}
                      aria-hidden="true"
                    />
                    <span className="pmx-attn-name">{project.companyName}</span>
                    <span className="pmx-attn-reason">{meta.reason}</span>
                    <span className="pmx-attn-cta">
                      {meta.cta} <IconArrowRight size={13} />
                    </span>
                  </button>
                );
              })}
            </section>
          )}

          <div className="pmx-toolbar pmx-rise">
            <div className="pmx-chips" role="tablist" aria-label="Filter projects">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === item.id}
                  onClick={() => setFilter(item.id)}
                  className={`pmx-chip ${filter === item.id ? "is-active" : ""}`}
                >
                  {item.label}
                  <span className="pmx-chip-count mono">{counts[item.id]}</span>
                </button>
              ))}
            </div>
            <div className="pmx-tools">
              <div className="pmx-search">
                <IconSearch size={14} aria-hidden="true" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  aria-label="Search projects"
                />
              </div>
              <select
                className="pmx-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as "updated" | "started")}
                aria-label="Sort projects"
              >
                <option value="updated">Recently updated</option>
                <option value="started">Recently started</option>
              </select>
            </div>
          </div>

          {apiError ? (
            <div className="pmx-error pmx-rise">
              <strong>Couldn&apos;t load projects.</strong> {compactApiError(apiError)}
            </div>
          ) : loading ? (
            <div className="pmx-table" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="pmx-row-skeleton" style={{ "--i": i } as CSSProperties} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="pmx-empty pmx-rise">
              <h3>No projects match</h3>
              <p>Try a different search or filter.</p>
              <Button variant="secondary" size="sm" onClick={() => { setFilter("all"); setSearch(""); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="pmx-table pmx-rise" role="table" aria-label="Projects">
              <div className="pmx-table-head" role="row">
                <div>Project</div>
                <div>Stage</div>
                <div>Progress</div>
                <div>Next action</div>
                <div>Updated</div>
                <div aria-hidden="true" />
              </div>
              {projects.map((project, i) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  index={i}
                  onOpen={() => router.push(`/pm/project/${project.id}`)}
                  onContinue={() => router.push(projectRoute(project))}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ProjectRow({
  project,
  index,
  onOpen,
  onContinue,
}: {
  project: DevFlowProjectSummary;
  index: number;
  onOpen: () => void;
  onContinue: () => void;
}) {
  const stageId = stageOf(project);
  const stage = LIFECYCLE_STAGES.find((s) => s.id === stageId);
  const running = RUNNING_STATUSES.has(project.status);
  const failed = project.status === "FAILED";
  const progress = getStageProgress(stageId);

  return (
    <div
      className="pmx-row pmx-rise"
      style={{ "--i": index } as CSSProperties}
      role="row"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
    >
      <div className="pmx-row-project">
        <span className="pmx-row-name">
          {running && <span className="pmx-live-dot pmx-live-dot-sm" aria-hidden="true" />}
          {project.companyName}
        </span>
        <span className="pmx-row-id mono">{project.id}</span>
      </div>
      <div className={`pmx-row-stage ${failed ? "is-failed" : ""}`}>
        {failed ? "Failed" : stage?.label ?? stageId}
      </div>
      <div className="pmx-row-progress">
        <div className="pmx-track">
          <div
            className={`pmx-fill ${stageId === "delivered" ? "is-done" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="pmx-row-pct mono">{progress}%</span>
      </div>
      <div>
        <button
          type="button"
          className="pmx-row-action"
          onClick={(e) => {
            e.stopPropagation();
            onContinue();
          }}
        >
          {nextAction(stageId, project)} <IconArrowRight size={12} />
        </button>
      </div>
      <div className="pmx-row-time">{relativeTime(project.updatedAt || project.createdAt)}</div>
      <IconChevronRight size={14} className="pmx-row-chevron" />
    </div>
  );
}
