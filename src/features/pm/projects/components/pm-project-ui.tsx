// @ts-nocheck
"use client";

import { Badge } from "@/shared/components/ui";

/**
 * Reusable badge and presentational components for PM project detail views.
 */

export function ProjectTaskStatusDot({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    TODO: "var(--text-3)", IN_PROGRESS: "var(--blue)", DONE: "var(--green)", BLOCKED: "var(--red)",
  };
  return <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[status || "TODO"] || "var(--text-3)", flexShrink: 0 }} />;
}

export function BackendTaskStatusBadge({ status }: { status?: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    TODO: { tone: "gray", label: "To Do" },
    IN_PROGRESS: { tone: "blue", label: "In Progress" },
    DONE: { tone: "green", label: "Done" },
    BLOCKED: { tone: "red", label: "Blocked" },
  };
  const next = map[status || "TODO"] || map.TODO;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

export function WorkOrderStatusBadge({ status }: { status?: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    DRAFT: { tone: "gray", label: "Draft" },
    READY: { tone: "blue", label: "Ready" },
    DISPATCHED: { tone: "purple", label: "Dispatched" },
    COMPLETED: { tone: "green", label: "Completed" },
    FAILED: { tone: "red", label: "Failed" },
    CANCELLED: { tone: "gray", label: "Cancelled" },
  };
  const next = map[status || "DRAFT"] || map.DRAFT;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

export function WorkOrderPriorityBadge({ priority }: { priority?: string }) {
  const map: Record<string, { tone: string }> = {
    LOW: { tone: "gray" }, NORMAL: { tone: "blue" }, HIGH: { tone: "amber" }, URGENT: { tone: "red" },
  };
  const next = map[priority || "NORMAL"] || map.NORMAL;
  return <Badge tone={next.tone}>{priority || "Normal"}</Badge>;
}

export function BackendReviewBadge({ status }: { status?: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    PENDING: { tone: "gray", label: "Pending" },
    APPROVED: { tone: "green", label: "Approved" },
    REVISION_REQUESTED: { tone: "amber", label: "Revision" },
  };
  const next = map[status || "PENDING"] || map.PENDING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

export function ArtifactValidationBadge({ status }: { status?: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    PASS: { tone: "green", label: "Valid" },
    FAIL: { tone: "red", label: "Invalid" },
    PENDING: { tone: "gray", label: "Unchecked" },
  };
  const next = map[status || "PENDING"] || map.PENDING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

export function OutputReviewBadge({ status }: { status?: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    PENDING: { tone: "gray", label: "Awaiting" },
    APPROVED: { tone: "green", label: "Approved" },
    REWORK_REQUESTED: { tone: "amber", label: "Rework" },
  };
  const next = map[status || "PENDING"] || map.PENDING;
  return <Badge tone={next.tone}>{next.label}</Badge>;
}

export function SectionTitle({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="row gap-2" style={{ alignItems: "flex-start" }}>
      {icon && <span style={{ color: "var(--primary)", marginTop: 1 }}>{icon}</span>}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ color: "var(--text-3)", fontSize: 12, margin: "3px 0 0" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: 14, borderRadius: 10, background: "rgba(10,10,10,.55)", border: "1px solid var(--border)", marginTop: 10 }}>
      <div style={{ color: "var(--text-3)", fontSize: 11 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export function ReviewNote({ title, body, tone }: { title?: string; body?: string; tone?: string }) {
  const border = tone === "green" ? "rgba(16,185,129,.24)" : tone === "blue" ? "rgba(255,255,255,.24)" : "rgba(245,158,11,.28)";
  const background = tone === "green" ? "rgba(16,185,129,.07)" : tone === "blue" ? "rgba(255,255,255,.07)" : "rgba(245,158,11,.08)";
  return (
    <div style={{ padding: 12, border: `1px solid ${border}`, background, borderRadius: 10 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}
