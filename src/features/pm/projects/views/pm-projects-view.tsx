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
} from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import {
  createDevFlowProject,
  listDevFlowProjects,
  type DevFlowProjectSummary,
} from "@/shared/api/devflow-api";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "hold", label: "On Hold" },
  { id: "delivered", label: "Delivered" },
  { id: "archived", label: "Archived" },
];

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
      await createDevFlowProject({ companyName, brief, stackKey });
      setForm({ companyName: "", brief: "", stackKey: "nextjs-nestjs-supabase" });
      setNewProjectOpen(false);
      await refreshBackendProjects();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : String(error));
    } finally {
      setCreating(false);
    }
  };

  const projects = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = backendProjects.filter((project) => {
      const lifecycleStage = project.lifecycle?.stage;
      const matchesFilter =
        filter === "all" ? true :
        filter === "hold" ? ["CLIENT_ONBOARDING", "KICKOFF", "CLIENT_REVIEW", "REVISION"].includes(lifecycleStage) :
        filter === "active" ? !["DELIVERED", "FAILED"].includes(lifecycleStage) :
        filter === "delivered" ? lifecycleStage === "DELIVERED" :
        filter === "archived" ? lifecycleStage === "FAILED" :
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

  return (
    <div data-screen-label="PM - Projects">
      <PMPageHeader
        title="Projects"
        subtitle="All active and past client engagements."
        actions={<Button variant="primary" size="sm" icon={<IconPlus size={14} />} onClick={() => setNewProjectOpen(true)}>New project</Button>}
      />

      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {FILTERS.map((item) => {
            const count = item.id === "all"
              ? backendProjects.length
              : item.id === "hold"
                ? backendProjects.filter((project) => ["CLIENT_ONBOARDING", "KICKOFF", "CLIENT_REVIEW", "REVISION"].includes(project.lifecycle?.stage)).length
                : item.id === "active"
                  ? backendProjects.filter((project) => !["DELIVERED", "FAILED"].includes(project.lifecycle?.stage)).length
                  : item.id === "delivered"
                    ? backendProjects.filter((project) => project.lifecycle?.stage === "DELIVERED").length
                    : backendProjects.filter((project) => project.lifecycle?.stage === "FAILED").length;

            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: filter === item.id ? "rgba(47,107,255,.15)" : "rgba(8,14,32,.5)",
                  border: filter === item.id ? "1px solid rgba(79,139,255,.55)" : "1px solid var(--border)",
                  color: filter === item.id ? "white" : "var(--text-2)",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {item.label}
                <span style={{
                  fontSize: 10.5,
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: filter === item.id ? "rgba(79,139,255,.30)" : "rgba(255,255,255,.05)",
                  color: filter === item.id ? "white" : "var(--text-3)",
                  fontWeight: 600,
                }}>
                  {count}
                </span>
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
            <option value="progress" disabled>Progress high to low</option>
            <option value="alerts" disabled>Most alerts</option>
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
        <EmptyProjects onOpenInbox={() => router.push("/pm/inbox")} />
      ) : view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {projects.map((project) => (
            <BackendProjectGridCard key={project.id} project={project} onClick={() => openProject(project.id)} />
          ))}
        </div>
      ) : (
        <BackendProjectsTable projects={projects} onOpen={openProject} />
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
          <Field label="Brief" helper="This creates a project draft only. Orchestration is started separately later.">
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

function BackendProjectStrip({ projects, loading, error, onRefresh, onOpen }) {
  return (
    <Card style={{ padding: 16, marginBottom: 16 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Backend projects</div>
          <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 3 }}>Live from NestJS and Supabase</div>
        </div>
        <Button variant="secondary" size="sm" onClick={onRefresh}>Refresh</Button>
      </div>

      {error ? (
        <div style={{ color: "#FCA5A5", fontSize: 12.5, lineHeight: 1.5 }}>{compactApiError(error)}</div>
      ) : loading ? (
        <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>Loading backend projects...</div>
      ) : projects.length === 0 ? (
        <div style={{ color: "var(--text-3)", fontSize: 12.5 }}>No backend projects yet.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {projects.slice(0, 6).map((project) => {
            const bits = backendStatusBits(project.status);
            return (
              <button key={project.id} onClick={() => onOpen(project.id)} style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 12,
                background: "rgba(8,14,32,.45)",
                minWidth: 0,
                color: "white",
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.companyName}</div>
                  <Badge tone={bits.tone}>{bits.label}</Badge>
                </div>
                <div className="mono" style={{ color: "var(--text-4)", fontSize: 10.5, marginTop: 8, overflow: "hidden", textOverflow: "ellipsis" }}>{project.id}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 5 }}>{formatDate(project.createdAt)}</div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function backendStatusBits(status) {
  const map = {
    PENDING: { tone: "gray", label: "Pending" },
    PARSING_REQUIREMENTS: { tone: "blue", label: "Parsing" },
    NEGOTIATING_CONTRACT: { tone: "purple", label: "Contract" },
    AWAITING_GATE_1: { tone: "amber", label: "Gate 1" },
    GENERATING_CODE: { tone: "purple", label: "Generating" },
    AWAITING_GATE_2: { tone: "amber", label: "Gate 2" },
    COMMITTING: { tone: "blue", label: "Committing" },
    DELIVERED: { tone: "green", label: "Delivered" },
    FAILED: { tone: "red", label: "Failed" },
  };
  return map[status] || { tone: "gray", label: status };
}

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
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width: 30,
        borderRadius: 6,
        background: active ? "rgba(47,107,255,.20)" : "transparent",
        color: active ? "white" : "var(--text-2)",
        border: 0,
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        fontFamily: "inherit",
      }}
    >
      {icon}
    </button>
  );
}

function EmptyProjects({ onOpenInbox }) {
  return (
    <Card style={{ padding: 60, textAlign: "center" }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: "rgba(47,107,255,.10)",
        color: "#93C5FD",
        display: "grid",
        placeItems: "center",
        margin: "0 auto 14px",
        border: "1px solid var(--border)",
      }}>
        <IconFolder size={22} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>No projects match your filters</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 6 }}>
        Clear the filters, or approve an inquiry to get started.
      </p>
      <Button variant="primary" size="sm" style={{ marginTop: 14 }} onClick={onOpenInbox} iconRight={<IconArrowRight size={13} />}>
        Open inbox
      </Button>
    </Card>
  );
}

function BackendProjectGridCard({ project, onClick }) {
  const status = backendStatusBits(project.status);
  const lifecycle = project.lifecycle || {
    label: status.label,
    tone: status.tone,
    nextAction: "Open project",
    progress: 0,
    signals: {},
  };

  return (
    <Card hover style={{ padding: 22, cursor: "pointer" }} onClick={onClick}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14, alignItems: "flex-start", gap: 12 }}>
        <div className="row gap-3" style={{ alignItems: "center", minWidth: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#4F8BFF,#8B5CF6)", color: "white", display: "grid", placeItems: "center", fontWeight: 700, flexShrink: 0 }}>{project.companyName.slice(0, 2).toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "var(--text-3)", fontSize: 11, fontWeight: 500 }}>Backend project</div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--text-4)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{project.id}</div>
          </div>
        </div>
        <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
      </div>

      <div style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.3 }}>{project.companyName}</div>
      <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 10 }}>Updated {formatDate(project.updatedAt || project.createdAt)}</div>
      <div style={{ marginTop: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 10 }}>
          <span style={{ color: "var(--text-3)", fontSize: 11.5 }}>Lifecycle</span>
          <span style={{ color: "var(--text-2)", fontSize: 11.5 }}>{lifecycle.progress}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(148,163,184,.16)", overflow: "hidden", marginTop: 6 }}>
          <div style={{ width: `${Math.max(0, Math.min(100, lifecycle.progress || 0))}%`, height: "100%", background: lifecycleProgressColor(lifecycle.tone) }} />
        </div>
      </div>
      <div className="row gap-2" style={{ flexWrap: "wrap", marginTop: 12 }}>
        <Badge tone={status.tone}>{status.label}</Badge>
        {lifecycle.signals?.openTasks > 0 && <Badge tone="blue">{lifecycle.signals.openTasks} open tasks</Badge>}
        {lifecycle.signals?.revisionOpen && <Badge tone="red">Revision open</Badge>}
      </div>
      <div className="row" style={{ marginTop: 16, justifyContent: "space-between" }}>
        <span style={{ color: "var(--text-2)", fontSize: 12 }}>{lifecycle.nextAction}</span>
        <IconChevronRight size={14} style={{ color: "var(--text-3)" }} />
      </div>
    </Card>
  );
}

function BackendProjectsTable({ projects, onOpen }) {
  return (
    <Card style={{ padding: 0, overflow: "auto" }}>
      <div style={{ minWidth: 760 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1fr 60px",
          padding: "12px 18px",
          borderBottom: "1px solid var(--border)",
          fontSize: 11.5,
          color: "var(--text-3)",
          fontWeight: 600,
          letterSpacing: ".06em",
          textTransform: "uppercase",
          background: "rgba(8,14,32,.5)",
          gap: 16,
          alignItems: "center",
        }}>
          <div>Project</div>
          <div>Lifecycle</div>
          <div>Next action</div>
          <div>Updated</div>
          <div />
        </div>
        {projects.map((project, index) => {
          const status = backendStatusBits(project.status);
          const lifecycle = project.lifecycle || { label: status.label, tone: status.tone, nextAction: "Open project", progress: 0 };

          return (
            <button
              key={project.id}
              onClick={() => onOpen(project.id)}
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 1fr 1fr 60px",
                padding: "16px 18px",
                background: "none",
                border: 0,
                borderBottom: index === projects.length - 1 ? 0 : "1px solid var(--border)",
                color: "white",
                fontFamily: "inherit",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{project.companyName}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{project.id}</div>
              </div>
              <div>
                <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
                <div style={{ height: 5, borderRadius: 999, background: "rgba(148,163,184,.16)", overflow: "hidden", marginTop: 8, width: 120 }}>
                  <div style={{ width: `${Math.max(0, Math.min(100, lifecycle.progress || 0))}%`, height: "100%", background: lifecycleProgressColor(lifecycle.tone) }} />
                </div>
              </div>
              <div style={{ color: "var(--text-2)", fontSize: 12.5 }}>{lifecycle.nextAction}</div>
              <div style={{ color: "var(--text-2)", fontSize: 12.5 }}>{formatDate(project.updatedAt || project.createdAt)}</div>
              <IconChevronRight size={14} style={{ color: "var(--text-3)" }} />
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function lifecycleProgressColor(tone) {
  const map = {
    gray: "#94A3B8",
    blue: "#60A5FA",
    purple: "#A78BFA",
    yellow: "#FBBF24",
    green: "#34D399",
    red: "#F87171",
  };
  return map[tone] || "#94A3B8";
}
