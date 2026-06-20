// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Field, Input, Modal, Select, Textarea } from "@/shared/components/ui";
import { IconCalendar, IconClock, IconPlus, IconRefresh, IconArrowUpRight } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { createDevFlowScheduleEvent, deleteDevFlowScheduleEvent, listDevFlowScheduleEvents } from "@/shared/api/devflow-api";
import { useDevFlowProjects } from "@/shared/hooks/use-devflow-projects";
import { compactDevFlowError, formatDevFlowDate } from "@/shared/utils/devflow-projects";

const EMPTY_FORM = {
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  type: "MEETING",
  projectId: "",
  visibility: "TEAM",
};

const TYPE_CONFIG = {
  MEETING:    { label: "Meeting",   tone: "blue",   color: "#93C5FD" },
  MILESTONE:  { label: "Milestone", tone: "green",  color: "#6EE7B7" },
  DUE_DATE:   { label: "Due date",  tone: "amber",  color: "#FBBF24" },
  REMINDER:   { label: "Reminder",  tone: "purple", color: "#C4B5FD" },
  OTHER:      { label: "Other",     tone: "gray",   color: "#94A3B8" },
};

const VISIBILITY_CONFIG = {
  CLIENT: { tone: "green", color: "#6EE7B7" },
  TEAM:   { tone: "purple", color: "#C4B5FD" },
  PRIVATE: { tone: "gray", color: "#94A3B8" },
};

/* ---------- Utility ---------- */
function formatDateTime(value) {
  const d = formatDevFlowDate(value);
  const t = new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${d} ${t}`;
}

function groupByDate(events) {
  const map = {};
  events.forEach((event) => {
    const key = formatDevFlowDate(event.startsAt);
    if (!map[key]) map[key] = [];
    map[key].push(event);
  });
  return map;
}

function isToday(dateStr) {
  const today = formatDevFlowDate(new Date().toISOString());
  return dateStr === today;
}

/* ---------- Loading Skeleton ---------- */
function CalendarSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="cal-skeleton" style={{ height: 100, padding: 20 }}>
          <div style={{ width: "40%", height: 14, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 10 }} />
          <div style={{ width: "70%", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
        </div>
      ))}
    </div>
  );
}

/* ---------- Metric Card ---------- */
function MetricCard({ icon, label, value, sub, variant }) {
  return (
    <div className={`cal-metric-card cal-metric-card--${variant}`}>
      <div className="row gap-2" style={{ color: variant === "events" ? "#93C5FD" : "#6EE7B7", marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 12.5, color: "var(--text-2)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

/* ---------- Empty State ---------- */
function CalendarEmptyState({ loading, onNew }) {
  if (loading) return <CalendarSkeleton />;
  return (
    <div className="cal-empty-state">
      <div className="cal-empty-state-icon">
        <IconCalendar size={22} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>No schedule events yet</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13.5, maxWidth: 320, margin: "0 auto 20px", lineHeight: 1.55 }}>
        Create your first meeting, milestone, or reminder to keep your team aligned.
      </p>
      <button
        type="button"
        onClick={onNew}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "0 20px 0 24px", height: 44,
          borderRadius: 999,
          background: "linear-gradient(135deg, #2F6BFF, #4F8BFF)",
          border: "none",
          color: "white", fontWeight: 600, fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(47,107,255,0.30)",
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <IconPlus size={16} />
        Create event
        <span style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <IconArrowUpRight size={12} />
        </span>
      </button>
    </div>
  );
}

/* ---------- Event Card ---------- */
function EventCard({ event, onDelete, busy, isLast }) {
  const typeConf = TYPE_CONFIG[event.type] || TYPE_CONFIG.OTHER;
  const visConf = VISIBILITY_CONFIG[event.visibility] || VISIBILITY_CONFIG.PRIVATE;
  return (
    <div className="cal-event-card">
      <div className="cal-accent" style={{ background: typeConf.color }} />
      <div style={{ padding: "16px 18px 16px 22px" }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "2px 10px", borderRadius: 999,
                fontSize: 10.5, fontWeight: 600,
                letterSpacing: "0.04em", textTransform: "uppercase",
                background: `${typeConf.color}18`,
                color: typeConf.color,
                border: `1px solid ${typeConf.color}30`,
              }}>
                {typeConf.label}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "2px 10px", borderRadius: 999,
                fontSize: 10.5, fontWeight: 600,
                letterSpacing: "0.04em", textTransform: "uppercase",
                background: `${visConf.color}14`,
                color: visConf.color,
                border: `1px solid ${visConf.color}25`,
              }}>
                {event.visibility}
              </span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.35 }}>{event.title}</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 6, fontFeatureSettings: "'cv11','ss01','ss03'" }}>
              {formatDateTime(event.startsAt)} to {formatDateTime(event.endsAt)}
            </p>
            {event.project && (
              <p style={{ color: "var(--text-2)", fontSize: 12.5, marginTop: 6, fontWeight: 500 }}>
                {event.project.companyName}
              </p>
            )}
            {event.description && (
              <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.55, marginTop: 8, maxWidth: 600 }}>
                {event.description}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(event.id)}
            style={{
              padding: "6px 14px", borderRadius: 999,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.20)",
              color: "#FCA5A5",
              fontSize: 12, fontWeight: 500,
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.5 : 1,
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Date Group ---------- */
function DateGroup({ date, events, onDelete, busy, index }) {
  const today = isToday(date);
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="cal-date-header">
        <span className="cal-date-dot" style={{
          background: today ? "linear-gradient(135deg, #4F8BFF, #8B5CF6)" : undefined,
          boxShadow: today ? "0 0 16px rgba(79,139,255,0.40)" : undefined,
        }} />
        <span style={{
          fontSize: 13,
          fontWeight: today ? 700 : 600,
          color: today ? "white" : "var(--text-2)",
          letterSpacing: today ? "-0.01em" : undefined,
        }}>
          {today ? "Today" : date}
        </span>
        <span style={{
          fontSize: 11,
          color: "var(--text-4)",
          fontWeight: 500,
          padding: "1px 8px",
          borderRadius: 999,
          background: "rgba(255,255,255,0.03)",
        }}>
          {events.length} {events.length === 1 ? "event" : "events"}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} onDelete={onDelete} busy={busy} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Create-Event Modal ---------- */
function CreateEventModal({ open, onClose, onSubmit, form, setForm, projects, error, busy }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New schedule event"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0 18px", height: 40,
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "white",
              fontSize: 13.5, fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !form.title.trim() || !form.startsAt || !form.endsAt}
            onClick={onSubmit}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "0 18px 0 22px", height: 40,
              borderRadius: 999,
              background: "linear-gradient(135deg, #2F6BFF, #4F8BFF)",
              border: "none",
              color: "white",
              fontWeight: 600, fontSize: 13.5,
              cursor: busy || !form.title.trim() || !form.startsAt || !form.endsAt ? "not-allowed" : "pointer",
              opacity: busy || !form.title.trim() || !form.startsAt || !form.endsAt ? 0.5 : 1,
              boxShadow: "0 4px 16px rgba(47,107,255,0.25)",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {busy ? "Creating..." : "Create event"}
            <span style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "rgba(0,0,0,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <IconArrowUpRight size={11} />
            </span>
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 16 }}>
        <Field label="Title">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Milestone review"
          />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Starts">
            <Input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
            />
          </Field>
          <Field label="Ends">
            <Input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
            />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="MEETING">Meeting</option>
              <option value="MILESTONE">Milestone</option>
              <option value="DUE_DATE">Due date</option>
              <option value="REMINDER">Reminder</option>
              <option value="OTHER">Other</option>
            </Select>
          </Field>
          <Field label="Visibility">
            <Select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
              <option value="TEAM">Team</option>
              <option value="CLIENT">Client</option>
              <option value="PRIVATE">Private</option>
            </Select>
          </Field>
        </div>
        <Field label="Project">
          <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">No linked project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.companyName}</option>)}
          </Select>
        </Field>
        <Field label="Description">
          <Textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Agenda or reminder notes"
          />
        </Field>
        {error && <div style={{ color: "#FCA5A5", fontSize: 12.5 }}>{compactDevFlowError(error)}</div>}
      </div>
    </Modal>
  );
}

/* ================================================================
   EXPORTED: PMCalendarView
   ================================================================ */
export function PMCalendarView() {
  const { projects, refresh: refreshProjects } = useDevFlowProjects();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sortedEvents = useMemo(() => [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [events]);
  const upcomingCount = sortedEvents.filter((e) => new Date(e.endsAt).getTime() >= Date.now()).length;
  const grouped = useMemo(() => groupByDate(sortedEvents), [sortedEvents]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [nextEvents] = await Promise.all([listDevFlowScheduleEvents(), refreshProjects()]);
      setEvents(nextEvents);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await createDevFlowScheduleEvent({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        type: form.type,
        projectId: form.projectId || null,
        visibility: form.visibility,
      });
      setForm(EMPTY_FORM);
      setModalOpen(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (eventId) => {
    setBusy(true);
    setError("");
    try {
      await deleteDevFlowScheduleEvent(eventId);
      setEvents((current) => current.filter((e) => e.id !== eventId));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-screen-label="PM Calendar">
      <PMPageHeader
        title="Calendar"
        subtitle="Project milestones, meetings, due dates, and reminders from the schedule backend."
        actions={
          <div className="row gap-3">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "0 16px", height: 36,
                borderRadius: 999,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "white", fontWeight: 500, fontSize: 13,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              <IconRefresh size={14} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "0 18px 0 16px", height: 36,
                borderRadius: 999,
                background: "linear-gradient(135deg, #2F6BFF, #4F8BFF)",
                border: "none",
                color: "white", fontWeight: 600, fontSize: 13,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(47,107,255,0.25)",
                transition: "all 0.2s ease",
              }}
            >
              <IconPlus size={14} />
              New event
            </button>
          </div>
        }
      />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16,
        marginBottom: 28,
      }}>
        <MetricCard
          icon={<IconCalendar size={17} />}
          label="Events"
          value={loading ? "..." : String(events.length)}
          sub="Visible to your role"
          variant="events"
        />
        <MetricCard
          icon={<IconClock size={17} />}
          label="Upcoming"
          value={loading ? "..." : String(upcomingCount)}
          sub="Not yet ended"
          variant="upcoming"
        />
      </div>

      {error ? (
        <div style={{
          padding: 20, borderRadius: 14,
          border: "1px solid rgba(239,68,68,0.25)",
          background: "rgba(239,68,68,0.06)",
          color: "#FCA5A5", fontSize: 13.5,
        }}>
          {compactDevFlowError(error)}
        </div>
      ) : sortedEvents.length === 0 ? (
        <CalendarEmptyState loading={loading} onNew={() => setModalOpen(true)} />
      ) : (
        <div className="cal-timeline" style={{ paddingLeft: 8 }}>
          {Object.entries(grouped).map(([date, dateEvents], i) => (
            <DateGroup
              key={date}
              date={date}
              events={dateEvents}
              onDelete={remove}
              busy={busy}
              index={i}
            />
          ))}
        </div>
      )}

      <CreateEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submit}
        form={form}
        setForm={setForm}
        projects={projects}
        error={error}
        busy={busy}
      />
    </div>
  );
}