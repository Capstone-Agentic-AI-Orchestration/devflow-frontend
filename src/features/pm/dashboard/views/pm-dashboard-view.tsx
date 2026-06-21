"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconArrowUpRight,
  IconBell,
  IconClipboard,
  IconCode,
  IconFolder,
  IconLayers,
  IconRefresh,
  IconRocket,
  IconShield,
} from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { useDevFlowProjects } from "@/shared/hooks/use-devflow-projects";
import { useDevFlowNotifications } from "@/shared/hooks/use-devflow-notifications";
import { BackendAwareRouteState } from "@/shared/components/backend-aware-route-state";
import {
  compactDevFlowError,
  devflowLifecycleView,
  formatDevFlowDate,
  lifecycleProgressColor,
} from "@/shared/utils/devflow-projects";
import type { DevFlowProjectSummary } from "@/shared/api/devflow-api";

const INACTIVE_STATUSES = new Set(["DELIVERED", "FAILED"]);
const GATE_STATUSES = new Set(["AWAITING_GATE_1", "AWAITING_GATE_2"]);

/* ---------- Next-best-action picker ---------- */
function actionPriority(status: string): number {
  switch (status) {
    case "AWAITING_GATE_1":
    case "AWAITING_GATE_2": return 0;
    case "FAILED": return 1;
    case "GENERATING_CODE":
    case "PARSING_REQUIREMENTS":
    case "NEGOTIATING_CONTRACT":
    case "COMMITTING": return 2;
    case "PENDING": return 3;
    default: return 4;
  }
}

function actionView(project: DevFlowProjectSummary) {
  const id = project.id;
  switch (project.status) {
    case "AWAITING_GATE_1":
      return { reason: "Gate 1 — approve the architecture contract", cta: "Review Gate 1", route: `/pm/orchestrate/${id}/gate-1`, icon: <IconShield size={18} />, color: "#FBBF24" };
    case "AWAITING_GATE_2":
      return { reason: "Gate 2 — review the generated code", cta: "Review Gate 2", route: `/pm/orchestrate/${id}/gate-2`, icon: <IconCode size={18} />, color: "#A78BFA" };
    case "FAILED":
      return { reason: "The orchestration run hit an error", cta: "Resume run", route: `/pm/orchestrate/${id}/run`, icon: <IconAlertTriangle size={18} />, color: "#FCA5A5" };
    case "GENERATING_CODE":
    case "PARSING_REQUIREMENTS":
    case "NEGOTIATING_CONTRACT":
    case "COMMITTING":
      return { reason: "Agents are building — watch them live", cta: "Open live cockpit", route: `/pm/orchestrate/${id}/run`, icon: <IconRocket size={18} />, color: "#60A5FA" };
    default:
      return { reason: "Continue project setup", cta: "Continue setup", route: `/pm/orchestrate/${id}`, icon: <IconClipboard size={18} />, color: "#60A5FA" };
  }
}

function pickNextBest(projects: DevFlowProjectSummary[]): DevFlowProjectSummary | null {
  const actionable = projects.filter((p) => p.status !== "DELIVERED");
  if (actionable.length === 0) return null;
  return [...actionable].sort(
    (a, b) => actionPriority(a.status) - actionPriority(b.status) ||
      Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt),
  )[0];
}

function NextBestAction({ project, onGo }: { project: DevFlowProjectSummary; onGo: (route: string) => void }) {
  const view = actionView(project);
  return (
    <button className="pmd-next reveal magnetic" style={{ ["--accent" as string]: view.color } as CSSProperties} onClick={() => onGo(view.route)}>
      <span className="pmd-next-icon" style={{ background: `${view.color}1f`, color: view.color }}>{view.icon}</span>
      <span className="pmd-next-body">
        <span className="pmd-next-eyebrow">Pick up where you left off</span>
        <span className="pmd-next-title">{project.companyName}</span>
        <span className="pmd-next-sub">{view.reason}</span>
      </span>
      <span className="pmd-next-cta">{view.cta}<IconArrowRight size={15} /></span>
    </button>
  );
}

/* ---------- Stat strip cell ---------- */
function Stat({
  icon,
  label,
  value,
  sub,
  alert,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  alert?: boolean;
}) {
  return (
    <div className="pmd-stat">
      <span className="pmd-stat-label">
        {icon}
        {label}
      </span>
      <span className={`pmd-stat-value${alert ? " is-alert" : ""}`}>{value}</span>
      <span className="pmd-stat-sub">{sub}</span>
    </div>
  );
}

/* ---------- Project queue row ---------- */
function ProjectRow({
  project,
  onClick,
}: {
  project: DevFlowProjectSummary;
  onClick: () => void;
}) {
  const view = devflowLifecycleView(project);
  const color = lifecycleProgressColor(view.tone);
  const progress = Math.max(0, Math.min(100, view.progress ?? 0));
  const { activeWorkOrders, openTasks } = view.signals;

  return (
    <button type="button" className="pmd-row" onClick={onClick}>
      <span>
        <span className="pmd-row-name">{project.companyName}</span>
        <span className="pmd-row-id">{project.id}</span>
      </span>

      <span className="pmd-stage">
        <span className="pmd-stage-top">
          <span className="pmd-dot" style={{ background: color }} />
          {view.label}
        </span>
        <span className="pmd-bar">
          <span
            className="pmd-bar-fill"
            style={{ width: `${progress}%`, background: color }}
          />
        </span>
      </span>

      <span className="pmd-next-col">
        <span className="pmd-next">{view.nextAction}</span>
        <span className="pmd-signals">
          {activeWorkOrders} work orders · {openTasks} tasks · {formatDevFlowDate(project.updatedAt)}
        </span>
      </span>

      <span className="pmd-row-go" aria-hidden="true">
        <IconArrowUpRight size={13} />
      </span>
    </button>
  );
}

/* ---------- Skeleton (matches stat strip + queue layout) ---------- */
function DashSkeleton() {
  return (
    <div className="pmd-grid" aria-hidden="true">
      <div className="pmd-stats">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="pmd-stat">
            <div className="pmd-skel" style={{ height: 12, width: "60%" }} />
            <div className="pmd-skel" style={{ height: 26, width: "40%" }} />
            <div className="pmd-skel" style={{ height: 11, width: "70%" }} />
          </div>
        ))}
      </div>
      <div className="pmd-panel">
        <div className="pmd-panel-head">
          <div className="pmd-skel" style={{ height: 16, width: 180 }} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: 16, borderTop: "1px solid var(--border-soft)" }}>
            <div className="pmd-skel" style={{ height: 40 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   EXPORTED: PMDashboardView
   ================================================================ */
export function PMDashboardView() {
  const router = useRouter();
  const { projects, loading, error, refresh } = useDevFlowProjects();
  const notifications = useDevFlowNotifications();

  const stats = useMemo(() => {
    let active = 0;
    let gates = 0;
    let failed = 0;
    let openWorkOrders = 0;
    let openTasks = 0;

    for (const project of projects) {
      if (!INACTIVE_STATUSES.has(project.status)) active += 1;
      if (GATE_STATUSES.has(project.status)) gates += 1;
      if (project.status === "FAILED") failed += 1;
      const signals = project.lifecycle?.signals;
      if (signals) {
        openWorkOrders += signals.activeWorkOrders ?? 0;
        openTasks += signals.openTasks ?? 0;
      }
    }

    return { active, gates, failed, attention: gates + failed, openWorkOrders, openTasks };
  }, [projects]);

  const reloadAll = () => {
    refresh();
    notifications.refresh();
  };

  const nextBest = pickNextBest(projects);

  return (
    <div data-screen-label="PM - Dashboard">
      <PMPageHeader
        title="Operations dashboard"
        subtitle="Live backend projects, lifecycle stage, and role-scoped notifications."
        actions={
          <div className="row gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<IconRefresh size={14} />}
              onClick={reloadAll}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              iconRight={<IconArrowRight size={14} />}
              onClick={() => router.push("/pm/projects")}
            >
              Projects
            </Button>
          </div>
        }
      />

      {error ? (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: "var(--r-md)",
            border: "1px solid rgba(239,68,68,0.25)",
            background: "rgba(239,68,68,0.06)",
            color: "#FCA5A5",
            fontSize: 13.5,
            marginBottom: 20,
          }}
        >
          <IconAlertTriangle size={15} />
          {compactDevFlowError(error)}
        </div>
      ) : null}

      {loading ? (
        <DashSkeleton />
      ) : projects.length === 0 ? (
        <div className="pmd-panel pmd-empty pmd-anim">
          <span className="pmd-empty-icon">
            <IconFolder size={22} />
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Start your first project</h3>
          <p style={{ color: "var(--text-2)", fontSize: 13.5, maxWidth: 380, margin: "0 0 16px", lineHeight: 1.55 }}>
            Head to the Projects hub to spin one up — the guided wizard takes it from brief to a
            delivered GitHub repo, agents and all.
          </p>
          <Button variant="primary" size="sm" iconRight={<IconArrowRight size={14} />} onClick={() => router.push("/pm/projects")}>
            Go to Projects
          </Button>
        </div>
      ) : (
        <>
          {nextBest && <NextBestAction project={nextBest} onGo={(r) => router.push(r)} />}
          <div className="pmd-grid">
          <div className="pmd-stats pmd-anim" style={{ "--i": 0 } as CSSProperties}>
            <Stat
              icon={<IconFolder size={14} />}
              label="Visible projects"
              value={String(projects.length)}
              sub="Scoped by backend access"
            />
            <Stat
              icon={<IconLayers size={14} />}
              label="Active"
              value={String(stats.active)}
              sub="Not delivered or failed"
            />
            <Stat
              icon={<IconAlertTriangle size={14} />}
              label="Needs attention"
              value={String(stats.attention)}
              sub={`${stats.gates} at gates · ${stats.failed} failed`}
              alert={stats.attention > 0}
            />
            <Stat
              icon={<IconClipboard size={14} />}
              label="Open work orders"
              value={String(stats.openWorkOrders)}
              sub={`${stats.openTasks} open tasks`}
            />
            <Stat
              icon={<IconBell size={14} />}
              label="Unread notifications"
              value={notifications.loading ? "—" : String(notifications.unreadCount)}
              sub={notifications.error ? compactDevFlowError(notifications.error) : "From notification API"}
            />
          </div>

          <div className="pmd-panel pmd-anim" style={{ "--i": 1 } as CSSProperties}>
            <div className="pmd-panel-head">
              <div>
                <h3 className="pmd-panel-title">Backend project queue</h3>
                <p className="pmd-panel-sub">Current projects returned for this PM account.</p>
              </div>
              <span className="pmd-count">
                Showing {Math.min(projects.length, 8)} of {projects.length}
              </span>
            </div>

            {projects.slice(0, 8).map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                onClick={() => router.push(`/pm/project/${project.id}`)}
              />
            ))}
          </div>

          <div className="pmd-anim" style={{ "--i": 2 } as CSSProperties}>
            <BackendAwareRouteState
              title="Schedule, pipeline analytics, and SLA widgets need backend modules"
              subtitle="Calendar, token usage, and staffing numbers were removed until their APIs exist. Lifecycle, work-order, and task signals above come from the live projects API."
              projects={projects}
              loading={loading}
              error={error}
              pending={[
                "Calendar and meeting source",
                "AI/token usage aggregation",
                "Developer capacity and availability",
                "Inquiry intake service",
              ]}
              primaryAction={{ label: "Open projects", onClick: () => router.push("/pm/projects") }}
            />
          </div>
        </div>
        </>
      )}
    </div>
  );
}
