// Admin pages have not been migrated to the live DevFlow backend yet.
// Keep this data isolated to the admin workspace; PM, DEV, and CLIENT pages must not import it.
import { AGENT_DEFS, AGENT_KEYS, PROJECTS } from "@/features/pm/shared/model/pm-dashboard.mock";

export { AGENT_DEFS, AGENT_KEYS, PROJECTS };

export const ADMIN = {
  initials: "RL",
  firstName: "Renz",
  lastName: "Lopez",
  role: "Platform Administrator",
  email: "renz@alphaexplora.com",
  color: "linear-gradient(135deg,#6366F1,#8B5CF6)",
};

export const LIVE_PIPELINES = [
  { id: "OR-HH-2026-01-r42", project: "Patient Onboarding Portal", projectId: "HH-2026-01", client: "Halo Health", phase: "Phase 2 - Build", activeAgents: ["frontend", "backend"], status: "processing", elapsed: "14m" },
  { id: "OR-IS-2026-05-r18", project: "Student Records API", projectId: "IS-2026-05", client: "Iskolar Co-op", phase: "Phase 1 - Plan", activeAgents: ["research", "architect"], status: "processing", elapsed: "3m" },
  { id: "OR-BC-2026-02-r09", project: "Cargo Tracking v2", projectId: "BC-2026-02", client: "Bayan Cargo", phase: "Phase 1 - Plan", activeAgents: ["research"], status: "processing", elapsed: "1m" },
  { id: "OR-TP-2026-03-r24", project: "Merchant Dashboard", projectId: "TP-2026-03", client: "Tindahan PH", phase: "Phase 3 - Refine", activeAgents: ["copilot", "validator"], status: "processing", elapsed: "22m" },
  { id: "OR-KB-2026-04-r31", project: "Community Loan App", projectId: "KB-2026-04", client: "Kapitbahay", phase: "Phase 3 - Refine", activeAgents: ["validator"], status: "processing", elapsed: "8m" },
  { id: "OR-HB-2026-09-r02", project: "BPO Workforce Tool", projectId: "HB-2026-09", client: "Haribon BPO", phase: "Phase 2 - Build", activeAgents: ["backend", "database", "frontend"], status: "processing", elapsed: "18m" },
];

export const PROVIDER_HEALTH = [
  { name: "Anthropic Claude", status: "operational", latency: "412ms", errorRate: "0.04%", quota: 64, color: "#A78BFA", models: ["claude-sonnet-4.5", "claude-haiku-4.5", "claude-opus-4"] },
  { name: "OpenAI", status: "operational", latency: "298ms", errorRate: "0.08%", quota: 48, color: "#10B981", models: ["gpt-5", "gpt-5-mini", "gpt-4o"] },
  { name: "Google Gemini", status: "degraded", latency: "1.4s", errorRate: "1.2%", quota: 32, color: "#3B82F6", models: ["gemini-1.5-pro", "gemini-1.5-flash"] },
  { name: "GitHub Copilot", status: "operational", latency: "180ms", errorRate: "0.02%", quota: 22, color: "#94A3B8", models: ["copilot-x"] },
];

export const ADMIN_ALERTS = [
  { severity: "high", text: "Gemini latency degraded - fallback to OpenAI engaged", time: "12m ago", kind: "provider" },
  { severity: "high", text: "Project HH-2026-01 token spend at 84% of budget", time: "2h ago", kind: "budget" },
  { severity: "medium", text: "Failed pipeline run OR-IS-2026-05-r17 - validator timed out", time: "4h ago", kind: "pipeline" },
  { severity: "medium", text: "3 PMs not yet on 2FA", time: "Today", kind: "security" },
  { severity: "low", text: "Weekly executive report scheduled - Friday 5pm", time: "Today", kind: "system" },
];

export const AGENT_AGGREGATE = {
  ceo: { active: 8, today: 142, week: 892, month: 3640, latency: "1.2s", success: 99.4, cost: "$0.18" },
  research: { active: 3, today: 96, week: 604, month: 2480, latency: "3.4s", success: 98.8, cost: "$0.42" },
  architect: { active: 2, today: 88, week: 556, month: 2240, latency: "2.8s", success: 99.1, cost: "$0.36" },
  backend: { active: 4, today: 124, week: 780, month: 3120, latency: "2.1s", success: 99.2, cost: "$0.28" },
  frontend: { active: 3, today: 132, week: 830, month: 3340, latency: "2.4s", success: 98.6, cost: "$0.31" },
  database: { active: 1, today: 64, week: 402, month: 1620, latency: "1.6s", success: 99.6, cost: "$0.14" },
  mobile: { active: 1, today: 22, week: 142, month: 580, latency: "2.3s", success: 98.4, cost: "$0.29" },
  copilot: { active: 1, today: 88, week: 548, month: 2200, latency: "1.4s", success: 98.9, cost: "$0.12" },
  validator: { active: 1, today: 76, week: 478, month: 1920, latency: "4.1s", success: 97.8, cost: "$0.22" },
};

export const WORKFLOW_VERSIONS = [
  { v: "v4.1", date: "May 18, 2026", by: "Renz Lopez", note: "Upgrade Frontend agent to Claude Sonnet 4.5", current: true },
  { v: "v4.0", date: "Apr 28, 2026", by: "Renz Lopez", note: "Add Mobile agent (Phase 2)" },
  { v: "v3.4", date: "Mar 12, 2026", by: "Maria Cruz", note: "Increase Validator retry budget" },
];

export const ALL_USERS = [
  { initials: "AC", name: "Adrian Cruz", role: "PM", email: "adrian@alphaexplora.com", status: "active", last: "5m ago", projects: 4, color: "linear-gradient(135deg,#10B981,#14B8A6)" },
  { initials: "JT", name: "Jaye Tan", role: "Dev", email: "jaye@alphaexplora.com", status: "active", last: "12m ago", projects: 3, color: "linear-gradient(135deg,#A855F7,#EC4899)" },
  { initials: "MV", name: "Mike Villar", role: "Dev", email: "mike@alphaexplora.com", status: "active", last: "1h ago", projects: 2, color: "linear-gradient(135deg,#F97316,#EF4444)" },
  { initials: "MS", name: "Maria Santos", role: "Client", email: "maria@halohealth.ph", status: "active", last: "30m ago", projects: 1, color: "linear-gradient(135deg,#0ea5e9,#06b6d4)" },
  { initials: "MT", name: "Marco Tiu", role: "Client", email: "marco@bayancargo.ph", status: "active", last: "5h ago", projects: 1, color: "linear-gradient(135deg,#F97316,#EF4444)" },
  { initials: "JS", name: "Janelle Sy", role: "Client", email: "janelle@haribon.ph", status: "pending", last: "-", projects: 0, color: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
  { initials: "RL", name: "Renz Lopez", role: "Admin", email: "renz@alphaexplora.com", status: "active", last: "Active now", projects: 12, color: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
];

export const AUDIT_LOG = [
  { time: "14:24:11", actor: "Renz Lopez", action: "key.reveal", target: "Anthropic API", ip: "203.177.18.42", result: true, details: "Revealed Anthropic key for rotation prep" },
  { time: "14:11:08", actor: "Adrian Cruz", action: "project.approve", target: "OR-HH-2026-01 Phase 2", ip: "120.28.110.5", result: true, details: "Advanced to Build phase" },
  { time: "13:48:22", actor: "Jaye Tan", action: "login.success", target: "Developer Console", ip: "120.28.110.18", result: true, details: "Session token issued" },
  { time: "12:30:00", actor: "system", action: "workflow.publish", target: "Pipeline v4.1", ip: "-", result: true, details: "Renz Lopez published new workflow version" },
  { time: "08:42:01", actor: "Renz Lopez", action: "impersonate.start", target: "Adrian Cruz", ip: "203.177.18.42", result: true, details: "Diagnostic - investigating PM inbox bug" },
  { time: "08:58:14", actor: "Renz Lopez", action: "impersonate.end", target: "Adrian Cruz", ip: "203.177.18.42", result: true, details: "16m session" },
];

export const EXECS = [
  { initials: "RM", name: "Roy Manuel", role: "CEO - Founder", email: "roy@alphaexplora.com", color: "linear-gradient(135deg,#4F8BFF,#8B5CF6)", last: "Today", unread: 2 },
  { initials: "AC", name: "Anna Cabrera", role: "CTO", email: "anna@alphaexplora.com", color: "linear-gradient(135deg,#10B981,#14B8A6)", last: "Yesterday", unread: 1 },
  { initials: "PL", name: "Paolo Limjap", role: "Board - Chair", email: "paolo@board.alphaexplora", color: "linear-gradient(135deg,#A855F7,#EC4899)", last: "2 days", unread: 0 },
  { initials: "GR", name: "Grace Roman", role: "Board - Audit", email: "grace@board.alphaexplora", color: "linear-gradient(135deg,#EF4444,#F97316)", last: "Last week", unread: 0 },
];

export const SERVICES = [
  { name: "NestJS API gateway", status: "operational", latency: "82ms", err: "0.02%", lastIncident: "-", tint: "#4F8BFF" },
  { name: "LangGraph orchestration", status: "operational", latency: "240ms", err: "0.04%", lastIncident: "12d ago", tint: "#8B5CF6" },
  { name: "PostgreSQL (workflow state)", status: "operational", latency: "6ms", err: "0.00%", lastIncident: "-", tint: "#10B981" },
  { name: "Redis (queue)", status: "operational", latency: "1ms", err: "0.00%", lastIncident: "-", tint: "#EF4444" },
  { name: "Google Gemini API", status: "degraded", latency: "1.4s", err: "1.20%", lastIncident: "now", tint: "#3B82F6" },
];

export const INCIDENTS = [
  { time: "May 20 - 12:14", severity: "minor", service: "Google Gemini", text: "Elevated latency observed. Auto-fallback to OpenAI engaged." },
  { time: "May 14 - 03:22", severity: "minor", service: "CORE MEMORY", text: "Snapshot job took longer than expected." },
  { time: "May 8 - 18:09", severity: "major", service: "Anthropic API", text: "Anthropic returned 503 for 18 minutes. Pipelines paused and resumed." },
];

export const PROJECT_COSTS = [
  { id: "HH-2026-01", project: "Patient Onboarding Portal", client: "Halo Health", phase: "Phase 2", tokens: "1.75M", cost: "$182.40", efficiency: "$0.10/Ktok", profitable: true, sla: "on track" },
  { id: "BC-2026-02", project: "Cargo Tracking v2", client: "Bayan Cargo", phase: "Phase 1", tokens: "0.25M", cost: "$26.10", efficiency: "$0.10/Ktok", profitable: true, sla: "on track" },
  { id: "TP-2026-03", project: "Merchant Dashboard", client: "Tindahan PH", phase: "Phase 3", tokens: "1.36M", cost: "$140.20", efficiency: "$0.10/Ktok", profitable: true, sla: "at risk" },
  { id: "KB-2026-04", project: "Community Loan App", client: "Kapitbahay", phase: "Phase 3", tokens: "2.07M", cost: "$214.80", efficiency: "$0.10/Ktok", profitable: false, sla: "breached" },
];
