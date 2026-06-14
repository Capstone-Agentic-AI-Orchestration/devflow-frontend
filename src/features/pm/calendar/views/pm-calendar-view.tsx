// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Field, Input, Modal, Select, Textarea } from "@/shared/components/ui";
import { IconCalendar, IconClock, IconPlus, IconRefresh } from "@/shared/components/icons";
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

export function PMCalendarView() {
  const { projects, refresh: refreshProjects } = useDevFlowProjects();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sortedEvents = useMemo(() => [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [events]);
  const upcomingCount = sortedEvents.filter((event) => new Date(event.endsAt).getTime() >= Date.now()).length;

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

  useEffect(() => {
    load();
  }, []);

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
      setEvents((current) => current.filter((event) => event.id !== eventId));
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
          <>
            <Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={load}>Refresh</Button>
            <Button variant="primary" size="sm" icon={<IconPlus size={14} />} onClick={() => setModalOpen(true)}>New event</Button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Metric icon={<IconCalendar size={17} />} label="Events" value={loading ? "..." : String(events.length)} sub="Visible to your role" />
        <Metric icon={<IconClock size={17} />} label="Upcoming" value={loading ? "..." : String(upcomingCount)} sub="Not yet ended" />
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: 18, borderBottom: "1px solid var(--border)", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Schedule events</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Project-linked events are scoped by backend access rules.</p>
          </div>
          <Badge tone="blue">{loading ? "Loading" : `${events.length} total`}</Badge>
        </div>

        {error ? (
          <div style={{ padding: 24, color: "#FCA5A5" }}>{compactDevFlowError(error)}</div>
        ) : sortedEvents.length === 0 ? (
          <div style={{ padding: 24, color: "var(--text-3)" }}>{loading ? "Loading calendar..." : "No schedule events yet."}</div>
        ) : (
          sortedEvents.map((event, index) => (
            <div key={event.id} style={{ padding: 18, borderBottom: index === sortedEvents.length - 1 ? 0 : "1px solid var(--border)" }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div>
                  <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 8 }}>
                    <Badge tone={typeTone(event.type)}>{event.type.replaceAll("_", " ")}</Badge>
                    <Badge tone={event.visibility === "CLIENT" ? "green" : event.visibility === "TEAM" ? "purple" : "gray"}>{event.visibility}</Badge>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{event.title}</h3>
                  <p style={{ color: "var(--text-3)", fontSize: 12, margin: "5px 0 0" }}>
                    {formatDateTime(event.startsAt)} to {formatDateTime(event.endsAt)}
                  </p>
                  {event.project && <p style={{ color: "var(--text-2)", fontSize: 12, margin: "6px 0 0" }}>{event.project.companyName}</p>}
                  {event.description && <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, margin: "10px 0 0" }}>{event.description}</p>}
                </div>
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => remove(event.id)}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New schedule event"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" disabled={busy || !form.title.trim() || !form.startsAt || !form.endsAt} onClick={submit}>Create event</Button>
          </>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="Title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Milestone review" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Starts"><Input type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} /></Field>
            <Field label="Ends"><Input type="datetime-local" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} /></Field>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Type">
              <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                <option value="MEETING">Meeting</option>
                <option value="MILESTONE">Milestone</option>
                <option value="DUE_DATE">Due date</option>
                <option value="REMINDER">Reminder</option>
                <option value="OTHER">Other</option>
              </Select>
            </Field>
            <Field label="Visibility">
              <Select value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value })}>
                <option value="TEAM">Team</option>
                <option value="CLIENT">Client</option>
                <option value="PRIVATE">Private</option>
              </Select>
            </Field>
          </div>
          <Field label="Project">
            <Select value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value })}>
              <option value="">No linked project</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.companyName}</option>)}
            </Select>
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Agenda or reminder notes" />
          </Field>
          {error && <div style={{ color: "#FCA5A5", fontSize: 12.5 }}>{compactDevFlowError(error)}</div>}
        </div>
      </Modal>
    </div>
  );
}

function Metric({ icon, label, value, sub }) {
  return (
    <Card style={{ padding: 16 }}>
      <div className="row gap-2" style={{ color: "#93C5FD" }}>{icon}<span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span></div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10 }}>{value}</div>
      <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

function formatDateTime(value) {
  const formatted = formatDevFlowDate(value);
  const time = new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${formatted} ${time}`;
}

function typeTone(type) {
  if (type === "MILESTONE") return "green";
  if (type === "DUE_DATE") return "amber";
  if (type === "REMINDER") return "purple";
  if (type === "OTHER") return "gray";
  return "blue";
}
