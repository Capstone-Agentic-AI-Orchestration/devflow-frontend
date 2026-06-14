// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconFolder, IconRefresh, IconUsers, IconWorkflow } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { listDevFlowDevelopers } from "@/shared/api/devflow-api";
import { compactDevFlowError, projectInitials } from "@/shared/utils/devflow-projects";

export function PMTeamView() {
  const router = useRouter();
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const assignedProjects = useMemo(() => new Set(developers.flatMap((developer) => developer.projects.map((project) => project.id))).size, [developers]);
  const activeWorkOrders = developers.reduce((sum, developer) => sum + developer.activeWorkOrderCount, 0);
  const openTasks = developers.reduce((sum, developer) => sum + developer.openTaskCount, 0);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setDevelopers(await listDevFlowDevelopers());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div data-screen-label="PM - Team">
      <PMPageHeader
        title="Team"
        subtitle="Developer capacity, availability, and project load from the developer directory."
        actions={<Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={load}>Refresh</Button>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Metric icon={<IconUsers size={17} />} label="Developers" value={loading ? "..." : String(developers.length)} sub="Directory profiles" />
        <Metric icon={<IconFolder size={17} />} label="Assigned projects" value={loading ? "..." : String(assignedProjects)} sub="Across developer roster" />
        <Metric icon={<IconWorkflow size={17} />} label="Open tasks" value={loading ? "..." : String(openTasks)} sub={`${activeWorkOrders} active work orders`} />
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ padding: 18, borderBottom: "1px solid var(--border)", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Developer directory</h3>
            <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Capacity fields are maintained by developers in their settings.</p>
          </div>
          <Badge tone="blue">{loading ? "Loading" : `${developers.length} developers`}</Badge>
        </div>

        {error ? (
          <div style={{ padding: 24, color: "#FCA5A5" }}>{compactDevFlowError(error)}</div>
        ) : developers.length === 0 ? (
          <div style={{ padding: 24, color: "var(--text-3)" }}>{loading ? "Loading team..." : "No developer profiles are available yet."}</div>
        ) : (
          developers.map((developer, index) => (
            <button
              key={developer.userId}
              onClick={() => router.push(`/pm/dev/${developer.userId}`)}
              style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, .9fr) minmax(0, 1fr) 34px", gap: 14, alignItems: "center", padding: "15px 18px", border: 0, borderBottom: index === developers.length - 1 ? 0 : "1px solid var(--border)", background: "transparent", color: "white", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}
            >
              <div className="row gap-3" style={{ minWidth: 0 }}>
                <Avatar label={developer.displayName} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{developer.displayName}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{developer.email || "No email"}</div>
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{developer.weeklyCapacityHours == null ? "No capacity set" : `${developer.weeklyCapacityHours}h/week`}</div>
                <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>{developer.skills.length ? developer.skills.slice(0, 3).join(", ") : "No skills listed"}</div>
              </div>
              <div className="row gap-2" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
                <Badge tone={availabilityTone(developer.availabilityStatus)}>{developer.availabilityStatus}</Badge>
                <Badge tone="purple">{developer.assignedProjectCount} projects</Badge>
                <Badge tone={developer.openTaskCount > 0 ? "amber" : "gray"}>{developer.openTaskCount} open tasks</Badge>
              </div>
              <IconArrowRight size={14} style={{ color: "var(--text-3)" }} />
            </button>
          ))
        )}
      </Card>
    </div>
  );
}

function Avatar({ label }) {
  return (
    <div style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #4F8BFF, #8B5CF6)", color: "white", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
      {projectInitials(label)}
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

function availabilityTone(status) {
  if (status === "AVAILABLE") return "green";
  if (status === "LIMITED") return "amber";
  return "red";
}
