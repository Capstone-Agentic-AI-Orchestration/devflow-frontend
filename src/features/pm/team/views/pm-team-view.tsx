// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card } from "@/shared/components/ui";
import { IconArrowUpRight, IconFolder, IconRefresh, IconUsers, IconWorkflow } from "@/shared/components/icons";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { listDevFlowDevelopers } from "@/shared/api/devflow-api";
import { compactDevFlowError, projectInitials } from "@/shared/utils/devflow-projects";

function Avatar({ label }) {
  const initials = projectInitials(label);
  return (
    <div style={{
      width: 42, height: 42, borderRadius: "50%",
      display: "grid", placeItems: "center",
      background: "linear-gradient(135deg, #4F8BFF, #8B5CF6)",
      color: "white", fontSize: 13, fontWeight: 800,
      flexShrink: 0,
      boxShadow: "0 4px 12px rgba(79,139,255,0.25)",
    }}>
      {initials}
    </div>
  );
}

function availabilityTone(status) {
  if (status === "AVAILABLE") return "green";
  if (status === "LIMITED") return "amber";
  return "red";
}

function availabilityColor(status) {
  if (status === "AVAILABLE") return "#6EE7B7";
  if (status === "LIMITED") return "#FBBF24";
  return "#FCA5A5";
}

/* ---------- Double-Bezel Metric ---------- */
function TeamMetric({ icon, label, value, sub, accent }) {
  return (
    <div style={{
      padding: 6, borderRadius: 20,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        borderRadius: 14,
        padding: 18,
        background: "rgba(8,14,32,0.85)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08)",
      }}>
        <div className="row gap-2" style={{ color: accent, marginBottom: 10 }}>
          {icon}
          <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
        <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 5 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */
function TeamEmptyState({ loading, onRefresh }) {
  if (loading) return <TeamSkeleton />;
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
      <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>No developer profiles yet</h3>
      <p style={{ color: "var(--text-2)", fontSize: 13.5, maxWidth: 340, margin: "0 auto 24px", lineHeight: 1.55 }}>
        Developer profiles appear once they sign in and complete their onboarding.
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

/* ---------- Skeleton ---------- */
function TeamSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton" style={{
          height: 80, borderRadius: 16,
          background: "linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
          backgroundSize: "200% 100%",
        }} />
      ))}
    </div>
  );
}

/* ================================================================
   EXPORTED: PMTeamView
   ================================================================ */
export function PMTeamView() {
  const router = useRouter();
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const assignedProjects = useMemo(() => new Set(developers.flatMap((d) => d.projects.map((p) => p.id))).size, [developers]);
  const activeWorkOrders = developers.reduce((s, d) => s + d.activeWorkOrderCount, 0);
  const openTasks = developers.reduce((s, d) => s + d.openTaskCount, 0);

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

  useEffect(() => { load(); }, []);

  return (
    <div data-screen-label="PM - Team" className="team-cascade-section">
      <PMPageHeader
        title="Team"
        subtitle="Developer capacity, availability, and project load from the developer directory."
        actions={
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
        }
      />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 16, marginBottom: 28,
      }}>
        <TeamMetric
          icon={<IconUsers size={17} />}
          label="Developers"
          value={loading ? "..." : String(developers.length)}
          sub="Directory profiles"
          accent="#93C5FD"
        />
        <TeamMetric
          icon={<IconFolder size={17} />}
          label="Assigned projects"
          value={loading ? "..." : String(assignedProjects)}
          sub="Across developer roster"
          accent="#C4B5FD"
        />
        <TeamMetric
          icon={<IconWorkflow size={17} />}
          label="Open tasks"
          value={loading ? "..." : String(openTasks)}
          sub={`${activeWorkOrders} active work orders`}
          accent="#FBBF24"
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
      ) : developers.length === 0 ? (
        <TeamEmptyState loading={loading} onRefresh={load} />
      ) : (
        <div style={{ position: "relative", zIndex: 2 }}>
          {developers.map((developer, i) => {
            const rot = i % 2 === 0 ? -1.2 : 1.2;
            const zIndex = developers.length - i;
            return (
              <div
                key={developer.userId}
                className="team-card"
                style={{
                  "--card-index": i,
                  zIndex,
                  marginTop: i === 0 ? 0 : -12,
                  cursor: "pointer",
                  transform: `rotate(${rot}deg)`,
                }}
                onClick={() => router.push(`/pm/dev/${developer.userId}`)}
              >
                {/* Double-Bezel Outer */}
                <div style={{
                  padding: 6, borderRadius: 24,
                  background: i === 0
                    ? "linear-gradient(135deg, rgba(47,107,255,0.12), rgba(139,92,246,0.08))"
                    : "rgba(255,255,255,0.03)",
                  border: i === 0
                    ? "1px solid rgba(79,139,255,0.30)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: `0 ${8 + i * 4}px ${24 + i * 8}px rgba(0,0,0,${0.18 + i * 0.03})`,
                }}>
                  {/* Double-Bezel Inner */}
                  <div style={{
                    borderRadius: 18,
                    padding: "16px 20px",
                    background: "rgba(8,14,32,0.88)",
                    backdropFilter: "blur(20px) saturate(140%)",
                    WebkitBackdropFilter: "blur(20px) saturate(140%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "inset 0 1px 1px rgba(255,255,255,0.08)",
                  }}>
                    <div className="row" style={{ justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                      <div className="row gap-4" style={{ minWidth: 0, flex: 1 }}>
                        <Avatar label={developer.displayName} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{developer.displayName}</div>
                          <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 3 }}>{developer.email || "No email"}</div>
                          <div style={{ marginTop: 6 }}>
                            <div style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "2px 10px", borderRadius: 999,
                              fontSize: 10.5, fontWeight: 600,
                              letterSpacing: "0.04em", textTransform: "uppercase",
                              background: `${availabilityColor(developer.availabilityStatus)}18`,
                              color: availabilityColor(developer.availabilityStatus),
                              border: `1px solid ${availabilityColor(developer.availabilityStatus)}30`,
                            }}>
                              {developer.availabilityStatus === "AVAILABLE" ? "Available" : developer.availabilityStatus === "LIMITED" ? "Limited" : "Unavailable"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row gap-3" style={{ flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>
                            {developer.weeklyCapacityHours == null ? "---" : `${developer.weeklyCapacityHours}h`}
                          </div>
                          <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>Capacity</div>
                        </div>
                        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "white" }}>
                            {developer.assignedProjectCount}
                          </div>
                          <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>Projects</div>
                        </div>
                        <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: developer.openTaskCount > 0 ? "#FBBF24" : "var(--text-3)" }}>
                            {developer.openTaskCount}
                          </div>
                          <div style={{ color: "var(--text-3)", fontSize: 11, marginTop: 2 }}>Tasks</div>
                        </div>
                      </div>

                      {/* Button-in-Button arrow */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.4s cubic-bezier(0.32,0.72,0,1)",
                      }}
                        className="pricing-cta-icon"
                      >
                        <IconArrowUpRight size={14} style={{ color: "var(--text-3)" }} />
                      </div>
                    </div>

                    {developer.skills.length > 0 && (
                      <div className="row gap-2" style={{ marginTop: 12, flexWrap: "wrap" }}>
                        {developer.skills.slice(0, 4).map((skill) => (
                          <span key={skill} style={{
                            padding: "2px 10px", borderRadius: 999,
                            fontSize: 10.5, fontWeight: 500,
                            background: "rgba(148,163,184,0.08)",
                            border: "1px solid rgba(148,163,184,0.15)",
                            color: "var(--text-2)",
                            letterSpacing: "0.02em",
                          }}>
                            {skill}
                          </span>
                        ))}
                        {developer.skills.length > 4 && (
                          <span style={{
                            padding: "2px 10px", borderRadius: 999,
                            fontSize: 10.5, fontWeight: 500,
                            color: "var(--text-3)",
                          }}>
                            +{developer.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
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