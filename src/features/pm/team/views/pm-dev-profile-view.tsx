// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowRight, IconFolder, IconRefresh, IconUsers, IconWorkflow } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { getDevFlowDeveloper } from "@/shared/api/devflow-api";
import { compactDevFlowError, devflowLifecycleView, formatDevFlowDate, projectInitials } from "@/shared/utils/devflow-projects";

export function PMDevProfileView({ devInitials }: { devInitials: string }) {
  const router = useRouter();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setDeveloper(await getDevFlowDeveloper(devInitials));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [devInitials]);

  const title = developer?.displayName || "Developer profile";

  return (
    <div data-screen-label="PM Developer Profile">
      <PMPageHeader
        title={title}
        subtitle={developer?.email || "Developer capacity and project load from the backend directory."}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={load}>Refresh</Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/pm/team")}>Back to team</Button>
          </>
        }
      />

      {error && <Card style={{ padding: 18, color: "#FCA5A5", marginBottom: 20 }}>{compactDevFlowError(error)}</Card>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Metric icon={<IconUsers size={17} />} label="Availability" value={loading ? "..." : developer?.availabilityStatus || "Unknown"} sub={developer?.weeklyCapacityHours == null ? "No weekly capacity" : `${developer.weeklyCapacityHours} hours/week`} />
        <Metric icon={<IconFolder size={17} />} label="Projects" value={loading ? "..." : developer?.assignedProjectCount ?? 0} sub="Assigned projects" />
        <Metric icon={<IconWorkflow size={17} />} label="Open tasks" value={loading ? "..." : developer?.openTaskCount ?? 0} sub={`${developer?.activeWorkOrderCount ?? 0} active work orders`} />
      </div>

      {developer && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, .8fr) minmax(0, 1.2fr)", gap: 16 }}>
          <Card style={{ padding: 22 }}>
            <div className="row gap-3" style={{ marginBottom: 18 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #4F8BFF, #8B5CF6)", color: "white", fontSize: 14, fontWeight: 800 }}>
                {projectInitials(developer.displayName)}
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{developer.displayName}</h3>
                <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>{developer.email || "No email"}</p>
              </div>
            </div>
            <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 16 }}>
              <Badge tone={availabilityTone(developer.availabilityStatus)}>{developer.availabilityStatus}</Badge>
              <Badge tone="purple">{developer.weeklyCapacityHours == null ? "Capacity unset" : `${developer.weeklyCapacityHours}h/week`}</Badge>
            </div>
            <Section title="Skills">
              {developer.skills.length ? (
                <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                  {developer.skills.map((skill) => <Badge key={skill} tone="blue">{skill}</Badge>)}
                </div>
              ) : (
                <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>No skills listed yet.</p>
              )}
            </Section>
            <Section title="Notes">
              <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{developer.notes || "No capacity notes."}</p>
            </Section>
          </Card>

          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Assigned projects</h3>
              <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>Backend project assignments visible to PM.</p>
            </div>
            {developer.projects.length === 0 ? (
              <div style={{ padding: 24, color: "var(--text-3)" }}>No assigned projects yet.</div>
            ) : (
              developer.projects.map((project, index) => {
                const lifecycle = devflowLifecycleView(project);
                return (
                  <button key={project.id} onClick={() => router.push(`/pm/project/${project.id}`)} style={{ width: "100%", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 30px", gap: 12, alignItems: "center", padding: "14px 18px", border: 0, borderBottom: index === developer.projects.length - 1 ? 0 : "1px solid var(--border)", background: "transparent", color: "white", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{project.companyName}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 3 }}>Updated {formatDevFlowDate(project.updatedAt)}</div>
                    </div>
                    <Badge tone={lifecycle.tone}>{lifecycle.label}</Badge>
                    <IconArrowRight size={14} style={{ color: "var(--text-3)" }} />
                  </button>
                );
              })
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, sub }) {
  return (
    <Card style={{ padding: 16 }}>
      <div className="row gap-2" style={{ color: "#93C5FD" }}>{icon}<span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span></div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 10 }}>{value}</div>
      <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <h4 style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 8px" }}>{title}</h4>
      {children}
    </div>
  );
}

function availabilityTone(status) {
  if (status === "AVAILABLE") return "green";
  if (status === "LIMITED") return "amber";
  return "red";
}
