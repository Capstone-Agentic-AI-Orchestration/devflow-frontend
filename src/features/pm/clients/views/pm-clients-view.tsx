// @ts-nocheck
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowUpRight, IconFolder, IconRefresh, IconUsers } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { useDevFlowProjectDirectory } from "@/shared/hooks/use-devflow-projects";
import { compactDevFlowError, devflowLifecycleView, formatDevFlowDate } from "@/shared/utils/devflow-projects";

function deriveClients(projects) {
  const clients = new Map();
  for (const project of projects) {
    for (const invite of project.clientInvites || []) {
      const key = invite.email.toLowerCase();
      const existing = clients.get(key) || { key, email: invite.email, name: invite.contactName || invite.email, status: invite.status, projects: [] };
      existing.status = existing.status === "ACCEPTED" || invite.status === "ACCEPTED" ? "ACCEPTED" : invite.status;
      existing.projects.push(project);
      clients.set(key, existing);
    }
    for (const member of project.members || []) {
      if (member.role !== "CLIENT") continue;
      const email = member.user.email || member.userId;
      const key = email.toLowerCase();
      const existing = clients.get(key) || { key, email, name: member.user.fullName || email, status: "ACCEPTED", projects: [] };
      existing.status = "ACCEPTED";
      if (!existing.projects.some((p) => p.id === project.id)) existing.projects.push(project);
      clients.set(key, existing);
    }
  }
  return Array.from(clients.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/* ---------- Metric (double-bezel) ---------- */
function ClientMetric({ icon, label, value, sub, color }) {
  return (
    <div className="clients-metric">
      <div className="clients-metric-inner">
        <div className="row gap-2" style={{ color, marginBottom: 10 }}>
          {icon}
          <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </div>
        <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 5 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ---------- Skeleton ---------- */
function ClientsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[1, 2, 3].map((i) => <div key={i} className="client-skeleton" />)}
    </div>
  );
}

/* ---------- Empty State ---------- */
function ClientsEmptyState({ loading, onRefresh }) {
  if (loading) return <ClientsSkeleton />;
  return (
    <div style={{ textAlign: "center", padding: "64px 24px" }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: "rgba(47,107,255,0.08)",
        border: "1px solid rgba(79,139,255,0.20)",
        display: "grid", placeItems: "center",
        margin: "0 auto 16px", color: "#93C5FD",
      }}>
        <IconUsers size={24} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>No client contacts yet</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13.5, maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.55 }}>
        Client contacts appear when invitations are sent or client users are added to projects.
      </p>
      <button
        type="button"
        onClick={onRefresh}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "0 18px 0 22px", height: 44,
          borderRadius: 999,
          background: "linear-gradient(135deg, #2F6BFF, #4F8BFF)",
          border: "none",
          color: "white", fontWeight: 600, fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(47,107,255,0.30)",
          transition: "all 0.4s cubic-bezier(0.32,0.72,0,1)",
        }}
        className="pricing-cta-btn"
      >
        <IconRefresh size={14} />
        Refresh
        <span style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "rgba(0,0,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.4s cubic-bezier(0.32,0.72,0,1)",
        }} className="pricing-cta-icon">
          <IconArrowUpRight size={12} />
        </span>
      </button>
    </div>
  );
}

/* ================================================================
   EXPORTED: PMClientsView
   ================================================================ */
export function PMClientsView() {
  const router = useRouter();
  const { projects, loading, error, refresh } = useDevFlowProjectDirectory();
  const clients = useMemo(() => deriveClients(projects), [projects]);
  const accepted = clients.filter((c) => c.status === "ACCEPTED").length;
  const pending = clients.filter((c) => c.status === "PENDING").length;

  return (
    <div data-screen-label="PM - Clients" className="clients-section">
      <PMPageHeader
        title="Clients"
        subtitle="Client contacts derived from accepted invites, pending invites, and CLIENT project members."
        actions={
          <button
            type="button"
            onClick={refresh}
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
        }
      />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
        <ClientMetric icon={<IconUsers size={17} />} label="Client contacts" value={loading ? "..." : String(clients.length)} sub="From backend project records" color="#93C5FD" />
        <ClientMetric icon={<IconFolder size={17} />} label="Accepted" value={loading ? "..." : String(accepted)} sub="Invite accepted or project member" color="#6EE7B7" />
        <ClientMetric icon={<IconUsers size={17} />} label="Pending invites" value={loading ? "..." : String(pending)} sub="Awaiting client signup" color="#FBBF24" />
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
      ) : clients.length === 0 ? (
        <ClientsEmptyState loading={loading} onRefresh={refresh} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {clients.map((client, i) => {
            const primary = client.projects[0];
            const lifecycle = devflowLifecycleView(primary);
            const accentColor = client.status === "ACCEPTED" ? "#6EE7B7" : "#FBBF24";

            return (
              <div
                key={client.key}
                className="client-card"
                style={{ "--card-index": i }}
                onClick={() => router.push(`/pm/project/${primary.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(`/pm/project/${primary.id}`); } }}
              >
                <div className="client-accent" style={{ background: accentColor }} />

                <div style={{ padding: "16px 20px 16px 24px" }}>
                  <div className="row" style={{ justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{client.name}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 3 }}>{client.email}</div>
                    </div>

                    <div className="row gap-3" style={{ flexShrink: 0 }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>{primary.companyName}</div>
                        <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>
                          {client.projects.length} project{client.projects.length === 1 ? "" : "s"} &middot; updated {formatDevFlowDate(primary.updatedAt)}
                        </div>
                      </div>
                      <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
                      <div className="row gap-2" style={{ flexWrap: "wrap", alignSelf: "center" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 10px", borderRadius: 999,
                          fontSize: 10.5, fontWeight: 600,
                          letterSpacing: "0.04em", textTransform: "uppercase",
                          background: `${accentColor}18`,
                          color: accentColor,
                          border: `1px solid ${accentColor}30`,
                        }}>
                          {client.status}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 10px", borderRadius: 999,
                          fontSize: 10.5, fontWeight: 600,
                          letterSpacing: "0.04em", textTransform: "uppercase",
                          background: `${lifecycle.color || "#93C5FD"}18`,
                          color: lifecycle.color || "#93C5FD",
                          border: `1px solid ${lifecycle.color || "#93C5FD"}30`,
                        }}>
                          {lifecycle.label}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.3s cubic-bezier(0.32,0.72,0,1)",
                    }}
                      className="pricing-cta-icon"
                    >
                      <IconArrowUpRight size={13} style={{ color: "var(--text-3)" }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}