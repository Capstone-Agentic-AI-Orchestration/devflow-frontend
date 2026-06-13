// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, Field, Input, Select, Textarea } from "@/shared/components/ui";
import { IconCheck, IconFileText, IconRefresh, IconUpload } from "@/shared/components/icons";
import { useDevFlowCollaborationDocuments } from "@/shared/hooks/use-devflow-collaboration";
import { compactDevFlowError, formatDevFlowDate } from "@/shared/utils/devflow-projects";

export function ProjectDocumentsPanel({
  projectId,
  title = "Project documents",
  subtitle = "Project-scoped document records from the collaboration backend.",
  allowCreate = true,
  allowReview = false,
  defaultClientVisible = true,
  defaultKind = "GENERAL",
}) {
  const { documents, loading, error, refresh, createDocument, reviewDocument } = useDevFlowCollaborationDocuments(projectId);
  const [form, setForm] = useState({ title: "", description: "", fileName: "", externalUrl: "", kind: defaultKind, clientVisible: defaultClientVisible });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const visibleDocuments = useMemo(() => documents, [documents]);

  const submit = async () => {
    if (!form.title.trim()) return;
    setBusy(true);
    setActionError("");
    try {
      await createDocument({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        fileName: form.fileName.trim() || undefined,
        externalUrl: form.externalUrl.trim() || undefined,
        kind: form.kind,
        clientVisible: Boolean(form.clientVisible),
      });
      setForm({ title: "", description: "", fileName: "", externalUrl: "", kind: defaultKind, clientVisible: defaultClientVisible });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setBusy(false);
    }
  };

  const review = async (documentId, status) => {
    setBusy(true);
    setActionError("");
    try {
      await reviewDocument(documentId, { status });
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : String(nextError));
    } finally {
      setBusy(false);
    }
  };

  if (!projectId) {
    return <Card style={{ padding: 22, color: "var(--text-3)" }}>No backend project is selected.</Card>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: allowCreate ? "minmax(0, 1fr) 340px" : "1fr", gap: 16 }}>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
          <div className="row" style={{ justifyContent: "space-between", gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{title}</h3>
              <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 0" }}>{subtitle}</p>
            </div>
            <Button variant="ghost" size="sm" icon={<IconRefresh size={13} />} onClick={refresh} />
          </div>
          {actionError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginTop: 10 }}>{compactDevFlowError(actionError)}</div>}
        </div>

        {error ? (
          <div style={{ padding: 18, color: "#FCA5A5", fontSize: 13 }}>{compactDevFlowError(error)}</div>
        ) : visibleDocuments.length === 0 ? (
          <div style={{ padding: 24, color: "var(--text-3)", fontSize: 13 }}>{loading ? "Loading documents..." : "No collaboration documents yet."}</div>
        ) : (
          <div>
            {visibleDocuments.map((document) => (
              <div key={document.id} style={{ padding: 18, borderBottom: "1px solid var(--border)" }}>
                <div className="row" style={{ justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div className="row gap-3" style={{ alignItems: "flex-start", minWidth: 0 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(79,139,255,.14)", color: "#93C5FD", display: "grid", placeItems: "center", flexShrink: 0 }}><IconFileText size={17} /></div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{document.title}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 4 }}>
                        {document.fileName || document.externalUrl || "No file reference"} - {formatDevFlowDate(document.updatedAt)}
                      </div>
                      {document.description && <div style={{ color: "var(--text-2)", fontSize: 12.5, lineHeight: 1.5, marginTop: 8 }}>{document.description}</div>}
                      {document.reviewNote && <div style={{ color: "#FBBF24", fontSize: 12.5, lineHeight: 1.5, marginTop: 8 }}>{document.reviewNote}</div>}
                    </div>
                  </div>
                  <div className="row gap-2" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Badge tone={statusTone(document.status)}>{document.status.replaceAll("_", " ")}</Badge>
                    <Badge tone={document.clientVisible ? "green" : "gray"}>{document.clientVisible ? "Client-visible" : "Team-only"}</Badge>
                    <Badge tone="blue">{document.kind}</Badge>
                  </div>
                </div>
                {allowReview && ["APPROVAL_REQUESTED", "UPLOADED", "REVISION_REQUESTED"].includes(document.status) && (
                  <div className="row gap-2" style={{ justifyContent: "flex-end", marginTop: 12 }}>
                    <Button variant="ghost" size="sm" disabled={busy} onClick={() => review(document.id, "REVISION_REQUESTED")}>Request revision</Button>
                    <Button variant="primary" size="sm" icon={<IconCheck size={13} />} disabled={busy} onClick={() => review(document.id, "APPROVED")}>Approve</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {allowCreate && (
        <Card style={{ padding: 20, height: "fit-content" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Add document record</h3>
          <p style={{ color: "var(--text-3)", fontSize: 12, margin: "4px 0 16px" }}>This stores metadata now; file storage can attach later.</p>
          {actionError && <div style={{ color: "#FCA5A5", fontSize: 12.5, marginBottom: 12 }}>{compactDevFlowError(actionError)}</div>}
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Title"><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Document title" /></Field>
            <Field label="File name"><Input value={form.fileName} onChange={(event) => setForm({ ...form, fileName: event.target.value })} placeholder="scope.pdf" /></Field>
            <Field label="External URL"><Input value={form.externalUrl} onChange={(event) => setForm({ ...form, externalUrl: event.target.value })} placeholder="https://..." /></Field>
            <Field label="Kind">
              <Select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
                <option value="GENERAL">General</option>
                <option value="REQUIREMENT">Requirement</option>
                <option value="CONTRACT">Contract</option>
                <option value="DELIVERABLE">Deliverable</option>
              </Select>
            </Field>
            <label className="row gap-2" style={{ color: "var(--text-2)", fontSize: 13 }}>
              <input type="checkbox" checked={form.clientVisible} onChange={(event) => setForm({ ...form, clientVisible: event.target.checked })} />
              Client-visible
            </label>
            <Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" />
            <Button variant="primary" icon={<IconUpload size={14} />} disabled={busy || !form.title.trim()} onClick={submit}>Save document</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function statusTone(status) {
  if (status === "APPROVED") return "green";
  if (status === "REVISION_REQUESTED") return "amber";
  if (status === "APPROVAL_REQUESTED") return "blue";
  if (status === "ARCHIVED") return "gray";
  return "purple";
}
