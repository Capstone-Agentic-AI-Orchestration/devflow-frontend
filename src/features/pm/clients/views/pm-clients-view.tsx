// @ts-nocheck
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconFolder, IconRefresh, IconUsers } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { useDevFlowProjectDirectory } from "@/shared/hooks/use-devflow-projects";
import { compactDevFlowError, devflowLifecycleView, formatDevFlowDate } from "@/shared/utils/devflow-projects";

export function PMClientsView() {
  const router = useRouter();
  const { projects, loading, error, refresh } = useDevFlowProjectDirectory();
  const clients = useMemo(() => deriveClients(projects), [projects]);
  const accepted = clients.filter((client) => client.status === "ACCEPTED").length;
  const pending = clients.filter((client) => client.status === "PENDING").length;

  return (
    <div data-screen-label="PM - Clients">
      <PMPageHeader
        title="Clients"
        subtitle="Client contacts derived from accepted invites, pending invites, and CLIENT project members."
        actions={<Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={refresh}>Refresh</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Metric icon={<IconUsers size={17} />} label="Client contacts" value={loading ? "..." : String(clients.length)} sub="From backend project records" />
        <Metric icon={<IconFolder size={17} />} label="Accepted clients" value={loading ? "..." : String(accepted)} sub="Invite accepted or project member" />
        <Metric icon={<IconUsers size={17} />} label="Pending invites" value={loading ? "..." : String(pending)} sub="Awaiting client signup" />
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: 18, borderBottom: "1px solid var(--border)", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Backend client directory</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Grouped by email across PM-visible projects.</p>
          </div>
          <Badge tone="blue">{loading ? "Loading" : `${clients.length} clients`}</Badge>
        </div>

        {error ? (
          <div style={{ padding: 24, color: "#FCA5A5" }}>{compactDevFlowError(error)}</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: 24, color: "var(--text-3)" }}>{loading ? "Loading clients..." : "No client invites or client members found yet."}</div>
        ) : (
          clients.map((client, index) => {
            const primary = client.projects[0];
            const lifecycle = devflowLifecycleView(primary);
            return (
              <button
                key={client.key}
                onClick={() => router.push(`/pm/project/${primary.id}`)}
                style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr) 130px 34px", gap: 14, alignItems: "center", padding: "15px 18px", border: 0, borderBottom: index === clients.length - 1 ? 0 : "1px solid var(--border)", background: "transparent", color: "white", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{client.name}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{client.email}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{primary.companyName}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{client.projects.length} project{client.projects.length === 1 ? "" : "s"} - updated {formatDevFlowDate(primary.updatedAt)}</div>
                </div>
                <div className="row gap-2" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <Badge tone={client.status === "ACCEPTED" ? "green" : "amber"}>{client.status}</Badge>
                  <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
                </div>
                <IconArrowRight size={14} style={{ color: "var(--text-3)" }} />
              </button>
            );
          })
        )}
      </Card>
    </div>
  );
}

function deriveClients(projects) {
  const clients = new Map();

  for (const project of projects) {
    for (const invite of project.clientInvites || []) {
      const key = invite.email.toLowerCase();
      const existing = clients.get(key) || {
        key,
        email: invite.email,
        name: invite.contactName || invite.email,
        status: invite.status,
        projects: [],
      };
      existing.status = existing.status === "ACCEPTED" || invite.status === "ACCEPTED" ? "ACCEPTED" : invite.status;
      existing.projects.push(project);
      clients.set(key, existing);
    }

    for (const member of project.members || []) {
      if (member.role !== "CLIENT") continue;
      const email = member.user.email || member.userId;
      const key = email.toLowerCase();
      const existing = clients.get(key) || {
        key,
        email,
        name: member.user.fullName || email,
        status: "ACCEPTED",
        projects: [],
      };
      existing.status = "ACCEPTED";
      if (!existing.projects.some((item) => item.id === project.id)) existing.projects.push(project);
      clients.set(key, existing);
    }
  }

  return Array.from(clients.values()).sort((a, b) => a.name.localeCompare(b.name));
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
