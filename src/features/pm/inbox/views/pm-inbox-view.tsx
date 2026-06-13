// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PMPageHeader } from "@/features/pm/shared/components/pm-page-header";
import { approveDevFlowInquiry, rejectDevFlowInquiry } from "@/shared/api/devflow-api";
import { useDevFlowInquiries } from "@/shared/hooks/use-devflow-inquiries";
import { Badge, Button, Card, EmptyState, Skeleton, Tabs, Textarea } from "@/shared/components/ui";
import { compactDevFlowError, formatDevFlowDate } from "@/shared/utils/devflow-projects";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconClipboard,
  IconMail,
  IconRefresh,
  IconUser,
  IconClose,
} from "@/shared/components/icons";

const FILTERS = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export function PMInboxView() {
  const router = useRouter();
  const [filter, setFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [actionError, setActionError] = useState("");
  const { inquiries, loading, error, refresh } = useDevFlowInquiries(filter);
  const selected = useMemo(
    () => inquiries.find((inquiry) => inquiry.id === selectedId) ?? inquiries[0] ?? null,
    [inquiries, selectedId],
  );

  const review = async (action) => {
    if (!selected) return;
    setBusyAction(action);
    setActionError("");
    try {
      if (action === "approve") {
        await approveDevFlowInquiry(selected.id, { reviewNote: reviewNote.trim() || undefined });
      } else {
        await rejectDevFlowInquiry(selected.id, { reviewNote: reviewNote.trim() || undefined });
      }
      setReviewNote("");
      await refresh();
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div>
      <PMPageHeader
        title="Inbox"
        subtitle="Review client inquiries and convert approved requests into project drafts."
        actions={(
          <Button variant="secondary" size="sm" icon={<IconRefresh size={14} />} onClick={refresh} disabled={loading}>
            Refresh
          </Button>
        )}
      >
        <div style={{ marginTop: 18 }}>
          <Tabs items={FILTERS} value={filter} onChange={setFilter} />
        </div>
      </PMPageHeader>

      {error && (
        <Card style={{ padding: 16, marginBottom: 16, borderColor: "rgba(239,68,68,.35)" }}>
          <div className="row gap-2" style={{ color: "#FCA5A5", alignItems: "center" }}>
            <IconAlertTriangle size={16} />
            <span style={{ fontSize: 13 }}>{compactDevFlowError(error)}</span>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, .85fr) minmax(0, 1.15fr)", gap: 18, alignItems: "start" }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 650 }}>Client inquiries</div>
            <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 3 }}>
              {loading ? "Loading..." : `${inquiries.length} ${inquiries.length === 1 ? "request" : "requests"}`}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2].map((item) => <Skeleton key={item} h={72} r={10} />)}
            </div>
          ) : inquiries.length === 0 ? (
            <EmptyState
              icon={<IconClipboard size={22} />}
              title="No inquiries"
              description="Client intake submissions will appear here once the public onboarding form is used."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {inquiries.map((inquiry) => (
                <button
                  key={inquiry.id}
                  onClick={() => { setSelectedId(inquiry.id); setReviewNote(""); }}
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    background: selected?.id === inquiry.id ? "rgba(79,139,255,.13)" : "transparent",
                    border: 0,
                    borderBottom: "1px solid var(--border)",
                    color: "white",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <div className="row" style={{ justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inquiry.companyName}</div>
                      <div style={{ color: "var(--text-2)", fontSize: 12.5, marginTop: 3 }}>{inquiry.contactName} - {inquiry.email}</div>
                    </div>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 8 }}>{formatDevFlowDate(inquiry.createdAt)}</div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <InquiryDetail
          inquiry={selected}
          reviewNote={reviewNote}
          setReviewNote={setReviewNote}
          busyAction={busyAction}
          actionError={actionError}
          onApprove={() => review("approve")}
          onReject={() => review("reject")}
          onOpenProject={(projectId) => router.push(`/pm/project/${projectId}`)}
        />
      </div>
    </div>
  );
}

function InquiryDetail({ inquiry, reviewNote, setReviewNote, busyAction, actionError, onApprove, onReject, onOpenProject }) {
  if (!inquiry) {
    return (
      <Card>
        <EmptyState
          icon={<IconMail size={22} />}
          title="Select an inquiry"
          description="Choose a client request to review contact details, scope, and next actions."
        />
      </Card>
    );
  }

  const reviewed = inquiry.status !== "NEW";

  return (
    <Card style={{ padding: 22 }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div className="row gap-2" style={{ marginBottom: 8, flexWrap: "wrap" }}>
            <StatusBadge status={inquiry.status} />
            <span className="mono" style={{ color: "var(--text-3)", fontSize: 11 }}>{inquiry.id}</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{inquiry.companyName}</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13.5, margin: "6px 0 0" }}>Submitted {formatDevFlowDate(inquiry.createdAt)}</p>
        </div>
        {inquiry.approvedProjectId && (
          <Button variant="secondary" size="sm" iconRight={<IconArrowRight size={13} />} onClick={() => onOpenProject(inquiry.approvedProjectId)}>
            Open project
          </Button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 18 }}>
        <Info label="Contact" value={inquiry.contactName} icon={<IconUser size={15} />} />
        <Info label="Email" value={inquiry.email} icon={<IconMail size={15} />} />
        <Info label="Phone" value={inquiry.phone || "Not provided"} />
        <Info label="Role" value={inquiry.role || "Not provided"} />
        <Info label="Stack" value={inquiry.stackKey} />
        <Info label="Timeline" value={inquiry.timeline || "Not provided"} />
      </div>

      {inquiry.budgetRange && (
        <div style={{ marginBottom: 18 }}>
          <div className="field-label">Budget range</div>
          <div style={{ marginTop: 6, color: "var(--text-2)", fontSize: 14 }}>{inquiry.budgetRange}</div>
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <div className="field-label">Inquiry brief</div>
        <div style={{ marginTop: 8, padding: 16, borderRadius: 10, background: "rgba(8,14,32,.45)", border: "1px solid var(--border)", color: "var(--text-2)", lineHeight: 1.65, fontSize: 14, whiteSpace: "pre-wrap" }}>
          {inquiry.brief}
        </div>
      </div>

      {reviewed ? (
        <div style={{ padding: 16, borderRadius: 10, background: "rgba(8,14,32,.45)", border: "1px solid var(--border)" }}>
          <div className="field-label">Review outcome</div>
          <div style={{ marginTop: 8, fontSize: 14 }}>
            {inquiry.reviewedBy?.fullName || inquiry.reviewedBy?.email || "PM"} marked this as {inquiry.status.toLowerCase()} {inquiry.reviewedAt ? `on ${formatDevFlowDate(inquiry.reviewedAt)}` : ""}.
          </div>
          {inquiry.reviewNote && <div style={{ color: "var(--text-2)", fontSize: 13.5, marginTop: 8, whiteSpace: "pre-wrap" }}>{inquiry.reviewNote}</div>}
          {inquiry.clientInvite && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div className="field-label">Client access</div>
              <div className="row gap-2" style={{ marginTop: 8, flexWrap: "wrap" }}>
                <Badge tone={inquiry.clientInvite.status === "ACCEPTED" ? "green" : "amber"}>
                  {inquiry.clientInvite.status === "ACCEPTED" ? "Joined" : "Invite pending"}
                </Badge>
                {inquiry.clientInvite.status === "PENDING" && (
                  <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                    Sign-up email: /client/sign-up?email={encodeURIComponent(inquiry.email)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <div className="field-label" style={{ marginBottom: 8 }}>Review note</div>
          <Textarea rows={4} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Optional internal note for this decision." />
          {actionError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 10 }}>{compactDevFlowError(actionError)}</div>}
          <div className="row gap-3" style={{ justifyContent: "flex-end", marginTop: 14 }}>
            <Button variant="danger" icon={<IconClose size={14} />} onClick={onReject} disabled={Boolean(busyAction)}>
              {busyAction === "reject" ? "Rejecting..." : "Reject"}
            </Button>
            <Button variant="primary" icon={<IconCheck size={14} />} onClick={onApprove} disabled={Boolean(busyAction)}>
              {busyAction === "approve" ? "Approving..." : "Approve and create project"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Info({ label, value, icon }) {
  return (
    <div style={{ padding: 12, borderRadius: 10, background: "rgba(8,14,32,.38)", border: "1px solid var(--border)", minWidth: 0 }}>
      <div className="row gap-2" style={{ color: "var(--text-3)", fontSize: 11.5, marginBottom: 6, textTransform: "uppercase", fontWeight: 650 }}>
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 13.5, color: "var(--text)", overflowWrap: "anywhere" }}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const tone = status === "APPROVED" ? "green" : status === "REJECTED" ? "red" : "blue";
  const label = status === "NEW" ? "New" : status[0] + status.slice(1).toLowerCase();
  return <Badge tone={tone}>{label}</Badge>;
}
