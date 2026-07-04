"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconRefresh,
  IconSparkles,
  IconAlertTriangle,
} from "@/shared/components/icons";
import {
  autoAnalyzeDevFlowBrief,
  createDevFlowProject,
  type DevFlowAutoAnalyzeResult,
} from "@/shared/api/devflow-api";

const STACKS: Array<{ key: string; name: string; desc: string }> = [
  {
    key: "nextjs-nestjs-supabase",
    name: "Next.js + NestJS + Supabase",
    desc: "Full-stack app with hosted Postgres, auth, and storage. The default.",
  },
  {
    key: "nextjs-nestjs-postgres",
    name: "Next.js + NestJS + PostgreSQL",
    desc: "Full-stack app with a self-managed Postgres database.",
  },
  {
    key: "nextjs-only",
    name: "Next.js only",
    desc: "Frontend-only app. No API server or database.",
  },
];

export function PMNewProjectView() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [stackKey, setStackKey] = useState(STACKS[0].key);
  const [brief, setBrief] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<DevFlowAutoAnalyzeResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState("");

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const canCreate = companyName.trim().length > 0 && brief.trim().length >= 10;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeError("");
    setAnalyzeResult(null);
    try {
      const result = await autoAnalyzeDevFlowBrief({
        companyName: companyName.trim() || "Unknown company",
        brief: brief.trim(),
        stackKey,
      });
      setAnalyzeResult(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const details = String((error as { details?: unknown })?.details ?? "");
      setAnalyzeError(
        `${msg} ${details}`.includes("API key") || `${msg} ${details}`.includes("not configured")
          ? "Expanding the brief needs an LLM provider. Ask an admin to add one, then retry."
          : msg,
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    try {
      const result = await createDevFlowProject({
        companyName: companyName.trim(),
        brief: brief.trim(),
        stackKey,
      });
      router.push(result?.id ? `/pm/project/${result.id}` : "/pm/projects");
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : String(error));
      setCreating(false);
    }
  };

  return (
    <div data-screen-label="PM - New project" className="pmx-new">
      <button
        type="button"
        className="pmx-new-back"
        onClick={() => router.push("/pm/projects")}
        disabled={creating}
      >
        <IconArrowLeft size={14} />
        Projects
      </button>

      <div className="pmx-step">
        <h1 className="pmx-step-title">What should the agents build?</h1>
        <p className="pmx-step-desc">
          Name the client, pick a stack, and describe the product in plain language. A rough idea is
          fine — you can expand it with AI.
        </p>

        <div className="pmx-step-body">
          <label className="pmx-field">
            <span className="pmx-field-label">Company</span>
            <input
              className="pmx-input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Logistics"
              autoFocus
            />
          </label>

          <div className="pmx-field">
            <span className="pmx-field-label">Stack</span>
            <div className="pmx-stack-grid" role="radiogroup" aria-label="Tech stack">
              {STACKS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  role="radio"
                  aria-checked={stackKey === s.key}
                  className={`pmx-stack ${stackKey === s.key ? "is-selected" : ""}`}
                  style={{ "--i": i } as CSSProperties}
                  onClick={() => setStackKey(s.key)}
                >
                  <span className="pmx-stack-name">{s.name}</span>
                  <span className="pmx-stack-desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="pmx-field">
            <span className="pmx-field-label">
              Brief
              <span className="pmx-field-hint">at least 10 characters</span>
            </span>
            <textarea
              className="pmx-input pmx-textarea"
              rows={6}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Build a dashboard for tracking deliveries, drivers, customer notifications, and admin reporting."
            />
          </label>

          <button
            type="button"
            className="pmx-ai-btn"
            onClick={handleAnalyze}
            disabled={analyzing || brief.trim().length < 3}
          >
            {analyzing ? (
              <><IconRefresh size={14} className="spin" /> Expanding…</>
            ) : (
              <><IconSparkles size={14} /> Expand with AI</>
            )}
          </button>

          {analyzeError && (
            <div className="pmx-error">
              <IconAlertTriangle size={14} /> {analyzeError}
            </div>
          )}

          {analyzeResult && (
            <div className="pmx-ai-result pmx-rise">
              <div className="pmx-ai-head">Expanded brief</div>
              <p className="pmx-ai-brief">{analyzeResult.enhancedBrief}</p>
              {analyzeResult.suggestedFeatures.length > 0 && (
                <div className="pmx-ai-chips">
                  {analyzeResult.suggestedFeatures.slice(0, 8).map((feature) => (
                    <span key={feature} className="pmx-ai-chip">{feature}</span>
                  ))}
                </div>
              )}
              <div className="pmx-ai-foot">
                <span className="mono">
                  complexity {analyzeResult.complexity} · ~{analyzeResult.estimatedFiles} files
                </span>
                <button
                  type="button"
                  className="pmx-ai-apply"
                  onClick={() => setBrief(analyzeResult.enhancedBrief)}
                >
                  <IconCheck size={13} /> Use this brief
                </button>
              </div>
            </div>
          )}

          <div className="pmx-next-steps">
            <div className="pmx-section-label">What happens next</div>
            <ol>
              <li>Agents parse your brief and draft an architecture contract.</li>
              <li>You approve the architecture at Gate 1.</li>
              <li>Agents generate the code — you watch their output stream live.</li>
              <li>You approve the code at Gate 2, and it ships to GitHub.</li>
            </ol>
          </div>

          {createError && (
            <div className="pmx-error">
              <IconAlertTriangle size={14} /> {createError}
            </div>
          )}
        </div>
      </div>

      <footer className="pmx-new-nav">
        <Button variant="ghost" size="md" onClick={() => router.push("/pm/projects")} disabled={creating}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          icon={<IconArrowRight size={14} />}
          onClick={handleCreate}
          disabled={!canCreate || creating}
        >
          {creating ? "Creating…" : "Create project"}
        </Button>
      </footer>
    </div>
  );
}
