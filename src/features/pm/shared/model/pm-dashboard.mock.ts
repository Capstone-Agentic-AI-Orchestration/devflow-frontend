// Legacy demo dataset retained only because the current Admin mock dashboard imports it.
// Do not use this as a source for PM, DEV, or CLIENT production flows.
export const PM_PERSONA = {
  initials: "AC",
  firstName: "Adrian",
  lastName: "Cruz",
  role: "Project Manager",
  email: "adrian@alphaexplora.com",
  color: "linear-gradient(135deg,#10B981,#14B8A6)",
};

export const ITIL_PHASES = [
  { key: "engage", label: "Engage & Plan", short: "Phase 1", color: "#4F8BFF" },
  { key: "build", label: "Obtain & Build", short: "Phase 2", color: "#8B5CF6" },
  { key: "refine", label: "Refinement Loop", short: "Loop", color: "#A78BFA" },
  { key: "deliver", label: "Deliver & Support", short: "Phase 3", color: "#10B981" },
] as const;

export type ProjectStage = (typeof ITIL_PHASES)[number]["key"];
export type ProjectStatus = "active" | "delivered" | "onhold" | "archived";

export const PROJECTS: Array<{
  id: string;
  name: string;
  client: { name: string; short: string; color: string };
  stage: ProjectStage;
  stageDays: number;
  progress: number;
  contractValue: string;
  lead: { initials: string; name: string; color: string };
  devs: Array<{ initials: string; name: string; color: string }>;
  lastUpdate: string;
  alerts: number;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  tokenSpend: { anthropic: number; openai: number; perplexity: number };
}> = [
  {
    id: "HH-2026-01",
    name: "Patient Onboarding Portal",
    client: { name: "Halo Health Philippines", short: "HH", color: "linear-gradient(135deg,#0ea5e9,#06b6d4)" },
    stage: "build",
    stageDays: 5,
    progress: 72,
    contractValue: "₱520,000",
    lead: { initials: "JT", name: "Jaye Tan", color: "linear-gradient(135deg,#A855F7,#EC4899)" },
    devs: [
      { initials: "MV", name: "Mike Villar", color: "linear-gradient(135deg,#F97316,#EF4444)" },
      { initials: "GP", name: "Grace Padilla", color: "linear-gradient(135deg,#EF4444,#F97316)" },
    ],
    lastUpdate: "2 hours ago",
    alerts: 2,
    status: "active",
    startDate: "Apr 28, 2026",
    targetDate: "May 31, 2026",
    tokenSpend: { anthropic: 1240000, openai: 420000, perplexity: 88000 },
  },
  {
    id: "BC-2026-02",
    name: "Cargo Tracking v2",
    client: { name: "Bayan Cargo", short: "BC", color: "linear-gradient(135deg,#F97316,#EF4444)" },
    stage: "engage",
    stageDays: 2,
    progress: 18,
    contractValue: "₱280,000",
    lead: { initials: "MV", name: "Mike Villar", color: "linear-gradient(135deg,#F97316,#EF4444)" },
    devs: [],
    lastUpdate: "4 hours ago",
    alerts: 1,
    status: "active",
    startDate: "May 10, 2026",
    targetDate: "Jun 15, 2026",
    tokenSpend: { anthropic: 140000, openai: 90000, perplexity: 22000 },
  },
  {
    id: "TP-2026-03",
    name: "Merchant Dashboard",
    client: { name: "Tindahan PH", short: "TP", color: "linear-gradient(135deg,#10B981,#14B8A6)" },
    stage: "refine",
    stageDays: 1,
    progress: 88,
    contractValue: "₱340,000",
    lead: { initials: "JT", name: "Jaye Tan", color: "linear-gradient(135deg,#A855F7,#EC4899)" },
    devs: [{ initials: "DS", name: "Diana Sy", color: "linear-gradient(135deg,#3B82F6,#6366F1)" }],
    lastUpdate: "Yesterday",
    alerts: 0,
    status: "active",
    startDate: "Apr 12, 2026",
    targetDate: "May 20, 2026",
    tokenSpend: { anthropic: 920000, openai: 380000, perplexity: 64000 },
  },
  {
    id: "KB-2026-04",
    name: "Community Loan App",
    client: { name: "Kapitbahay Co-op", short: "KB", color: "linear-gradient(135deg,#A855F7,#EC4899)" },
    stage: "deliver",
    stageDays: 2,
    progress: 96,
    contractValue: "₱420,000",
    lead: { initials: "GP", name: "Grace Padilla", color: "linear-gradient(135deg,#EF4444,#F97316)" },
    devs: [{ initials: "DS", name: "Diana Sy", color: "linear-gradient(135deg,#3B82F6,#6366F1)" }],
    lastUpdate: "3 hours ago",
    alerts: 1,
    status: "active",
    startDate: "Apr 5, 2026",
    targetDate: "May 12, 2026",
    tokenSpend: { anthropic: 1480000, openai: 510000, perplexity: 110000 },
  },
  {
    id: "IS-2026-05",
    name: "Student Records API",
    client: { name: "Iskolar Co-op", short: "IS", color: "linear-gradient(135deg,#3B82F6,#6366F1)" },
    stage: "build",
    stageDays: 3,
    progress: 54,
    contractValue: "₱180,000",
    lead: { initials: "MV", name: "Mike Villar", color: "linear-gradient(135deg,#F97316,#EF4444)" },
    devs: [],
    lastUpdate: "1 hour ago",
    alerts: 0,
    status: "active",
    startDate: "May 1, 2026",
    targetDate: "May 25, 2026",
    tokenSpend: { anthropic: 540000, openai: 180000, perplexity: 38000 },
  },
  {
    id: "LT-2025-22",
    name: "Booking Platform Migration",
    client: { name: "Lakbay Tech", short: "LT", color: "linear-gradient(135deg,#14B8A6,#10B981)" },
    stage: "deliver",
    stageDays: 0,
    progress: 100,
    contractValue: "₱720,000",
    lead: { initials: "JT", name: "Jaye Tan", color: "linear-gradient(135deg,#A855F7,#EC4899)" },
    devs: [{ initials: "MV", name: "Mike Villar", color: "linear-gradient(135deg,#F97316,#EF4444)" }],
    lastUpdate: "2 weeks ago",
    alerts: 0,
    status: "delivered",
    startDate: "Feb 10, 2026",
    targetDate: "Apr 24, 2026",
    tokenSpend: { anthropic: 2480000, openai: 880000, perplexity: 240000 },
  },
];

export function stageBits(key: string) {
  const map: Record<string, { tone: "gray" | "blue" | "purple" | "green" | "amber" | "red"; label: string }> = {
    inquiry: { tone: "gray", label: "Inquiry" },
    engage: { tone: "blue", label: "Engage & Plan" },
    build: { tone: "purple", label: "Obtain & Build" },
    refine: { tone: "purple", label: "Refinement Loop" },
    deliver: { tone: "green", label: "Deliver & Support" },
    closed: { tone: "gray", label: "Closed" },
    active: { tone: "blue", label: "Active" },
    delivered: { tone: "green", label: "Delivered" },
    onhold: { tone: "amber", label: "On Hold" },
    archived: { tone: "gray", label: "Archived" },
  };
  return map[key] || { tone: "gray", label: key };
}

export type InquiryStatus = "new" | "reviewing" | "approved" | "rejected";

export const INQUIRIES: Array<{
  id: string;
  name: string;
  company: string;
  email: string;
  date: string;
  status: InquiryStatus;
  phone: string;
  preview: string;
  fullDetails: string;
  budget: string;
  timeline: string;
  platform: string;
  rejectionReason?: string;
}> = [
  {
    id: "INQ-0142",
    name: "Roy Manuel",
    company: "MariCity Logistics",
    email: "roy@maricity.ph",
    date: "May 15, 2026",
    status: "new",
    phone: "+63 917 880 4419",
    preview: "Need a last-mile logistics dashboard for 12 delivery hubs across Metro Manila. Currently using spreadsheets.",
    fullDetails: "We've been operating last-mile delivery across 12 hubs in Metro Manila using a mix of spreadsheets, group chats, and an outdated kiosk system. We need a unified dashboard for dispatchers to assign jobs in real time, plus a driver mobile app. Web + Android primarily. Budget around ₱400-500k.",
    budget: "₱400-500k",
    timeline: "3 months",
    platform: "Web + Android",
  },
  {
    id: "INQ-0141",
    name: "Janelle Sy",
    company: "Haribon BPO",
    email: "janelle@haribon.ph",
    date: "May 13, 2026",
    status: "reviewing",
    phone: "+63 917 222 1140",
    preview: "Internal workforce management tool - shift scheduling, payroll integration, and attendance tracking for 240 agents.",
    fullDetails: "Looking to replace our 6-year-old workforce tool. Need shift scheduling, biometric attendance integration, leave management, and Sprout HR payroll handoff. 240 BPO agents across 2 sites. Strict SOC2 compliance required.",
    budget: "₱600-800k",
    timeline: "4 months",
    platform: "Web",
  },
  {
    id: "INQ-0140",
    name: "Marco Tiu",
    company: "Bayan Cargo",
    email: "marco@bayancargo.ph",
    date: "May 11, 2026",
    status: "approved",
    phone: "+63 917 555 3322",
    preview: "Updates to existing Cargo Tracking system - v2 with carrier handoff integrations.",
    fullDetails: "We launched v1 with Alphaexplora last year. Now we need v2: add carrier handoff (LBC, J&T, Ninja Van), customer notifications via Viber, and a partner portal.",
    budget: "₱280k",
    timeline: "5 weeks",
    platform: "Web",
  },
  {
    id: "INQ-0139",
    name: "Eric Velasco",
    company: "Iskolar Co-op",
    email: "eric@iskolar.org",
    date: "May 9, 2026",
    status: "approved",
    phone: "+63 917 901 1101",
    preview: "Student records API for educational co-op - needs to expose data to partner schools securely.",
    fullDetails: "We track 14k students. Member schools (15 of them) need read access via API. Need OAuth2, fine-grained scopes, and audit logs.",
    budget: "₱180k",
    timeline: "6 weeks",
    platform: "API only",
  },
  {
    id: "INQ-0138",
    name: "Annika Reyes",
    company: "Café Lola",
    email: "annika@cafelola.ph",
    date: "May 7, 2026",
    status: "rejected",
    phone: "+63 917 444 2200",
    preview: "Wants a simple Shopify-like store front for 2 cafés.",
    fullDetails: "Two café locations. Wants online ordering, loyalty points, and same-day delivery.",
    budget: "₱60k",
    timeline: "1 month",
    platform: "Web",
    rejectionReason: "Out of scope - recommended Shopify + a local courier partner.",
  },
];

export type ClientStatus = "active" | "dormant" | "churned";
export type ClientTier = "starter" | "growth" | "enterprise";

export const CLIENTS: Array<{
  id: string;
  short: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  region: string;
  tier: ClientTier;
  status: ClientStatus;
  projects: number;
  ltv: string;
  lastEngagement: string;
  color: string;
}> = [
  {
    id: "halohealth",
    short: "HH",
    name: "Halo Health Philippines",
    contact: "Maria Santos",
    email: "maria@halohealth.ph",
    phone: "+63 917 555 0142",
    address: "Quezon City, PH",
    industry: "Healthcare",
    region: "Metro Manila",
    tier: "growth",
    status: "active",
    projects: 1,
    ltv: "₱520,000",
    lastEngagement: "May 12, 2026",
    color: "linear-gradient(135deg,#0ea5e9,#06b6d4)",
  },
  {
    id: "bayancargo",
    short: "BC",
    name: "Bayan Cargo",
    contact: "Marco Tiu",
    email: "marco@bayancargo.ph",
    phone: "+63 917 555 3322",
    address: "Pasig, PH",
    industry: "Logistics",
    region: "Metro Manila",
    tier: "starter",
    status: "active",
    projects: 2,
    ltv: "₱460,000",
    lastEngagement: "May 14, 2026",
    color: "linear-gradient(135deg,#F97316,#EF4444)",
  },
  {
    id: "tindahanph",
    short: "TP",
    name: "Tindahan PH",
    contact: "Aileen Velasquez",
    email: "aileen@tindahan.ph",
    phone: "+63 917 999 8800",
    address: "Cebu City, PH",
    industry: "Retail",
    region: "Visayas",
    tier: "growth",
    status: "active",
    projects: 1,
    ltv: "₱340,000",
    lastEngagement: "Yesterday",
    color: "linear-gradient(135deg,#10B981,#14B8A6)",
  },
  {
    id: "kapitbahay",
    short: "KB",
    name: "Kapitbahay Co-op",
    contact: "Ramon Diaz",
    email: "ramon@kapitbahay.org",
    phone: "+63 917 220 1100",
    address: "Iloilo, PH",
    industry: "Finance",
    region: "Visayas",
    tier: "growth",
    status: "active",
    projects: 1,
    ltv: "₱420,000",
    lastEngagement: "3 hours ago",
    color: "linear-gradient(135deg,#A855F7,#EC4899)",
  },
  {
    id: "iskolar",
    short: "IS",
    name: "Iskolar Co-op",
    contact: "Eric Velasco",
    email: "eric@iskolar.org",
    phone: "+63 917 901 1101",
    address: "Manila, PH",
    industry: "Education",
    region: "Metro Manila",
    tier: "starter",
    status: "active",
    projects: 1,
    ltv: "₱180,000",
    lastEngagement: "1 hour ago",
    color: "linear-gradient(135deg,#3B82F6,#6366F1)",
  },
  {
    id: "lakbaytech",
    short: "LT",
    name: "Lakbay Tech",
    contact: "Jasmine Cruz",
    email: "jasmine@lakbay.tech",
    phone: "+63 917 412 7700",
    address: "Davao, PH",
    industry: "Travel",
    region: "Mindanao",
    tier: "enterprise",
    status: "dormant",
    projects: 1,
    ltv: "₱720,000",
    lastEngagement: "2 weeks ago",
    color: "linear-gradient(135deg,#14B8A6,#10B981)",
  },
  {
    id: "haribon",
    short: "HB",
    name: "Haribon BPO",
    contact: "Janelle Sy",
    email: "janelle@haribon.ph",
    phone: "+63 917 222 1140",
    address: "Makati, PH",
    industry: "BPO",
    region: "Metro Manila",
    tier: "enterprise",
    status: "active",
    projects: 0,
    ltv: "—",
    lastEngagement: "May 13, 2026 (inquiry)",
    color: "linear-gradient(135deg,#6366F1,#8B5CF6)",
  },
];

export function clientStatusBits(status: string) {
  const map: Record<string, { tone: "gray" | "green" | "amber"; label: string; dot: string; bg: string; fg: string; border: string }> = {
    active: { tone: "green", label: "Active", dot: "#10B981", bg: "rgba(16,185,129,.15)", fg: "#6EE7B7", border: "rgba(16,185,129,.35)" },
    dormant: { tone: "amber", label: "Dormant", dot: "#F59E0B", bg: "rgba(245,158,11,.15)", fg: "#FBBF24", border: "rgba(245,158,11,.35)" },
    churned: { tone: "gray", label: "Churned", dot: "#64748B", bg: "rgba(148,163,184,.10)", fg: "#94A3B8", border: "rgba(148,163,184,.25)" },
  };
  return map[status] || { tone: "gray", label: status, dot: "#64748B", bg: "rgba(148,163,184,.10)", fg: "#94A3B8", border: "rgba(148,163,184,.25)" };
}

export const DEVS: Array<{
  initials: string;
  name: string;
  role: string;
  load: number;
  skills: string[];
  available: boolean;
  online: boolean;
  color: string;
  projects: number;
}> = [
  { initials: "JT", name: "Jaye Tan", role: "Lead Engineer", load: 80, skills: ["TypeScript", "React", "Postgres", "AWS"], available: true, online: true, color: "linear-gradient(135deg,#A855F7,#EC4899)", projects: 2 },
  { initials: "MV", name: "Mike Villar", role: "Senior Backend", load: 90, skills: ["Go", "Python", "gRPC", "K8s"], available: false, online: true, color: "linear-gradient(135deg,#F97316,#EF4444)", projects: 2 },
  { initials: "DS", name: "Diana Sy", role: "Senior Frontend", load: 50, skills: ["React", "Tailwind", "Vue", "Design"], available: true, online: false, color: "linear-gradient(135deg,#3B82F6,#6366F1)", projects: 1 },
  { initials: "GP", name: "Grace Padilla", role: "Mobile + Security", load: 60, skills: ["Flutter", "Swift", "SOC2", "Pen-test"], available: true, online: true, color: "linear-gradient(135deg,#EF4444,#F97316)", projects: 1 },
  { initials: "RB", name: "Renz Bautista", role: "Junior Engineer", load: 20, skills: ["React", "Node", "Tailwind"], available: true, online: true, color: "linear-gradient(135deg,#10B981,#14B8A6)", projects: 0 },
  { initials: "KR", name: "Kyla Ramos", role: "QA & Test Eng.", load: 40, skills: ["Playwright", "Jest", "Detox"], available: true, online: false, color: "linear-gradient(135deg,#6366F1,#8B5CF6)", projects: 1 },
];

export const EVENT_TYPES = {
  client: { c: "#4F8BFF", label: "Client" },
  standup: { c: "#10B981", label: "Standup" },
  milestone: { c: "#8B5CF6", label: "Milestone" },
  deadline: { c: "#EF4444", label: "Deadline" },
  personal: { c: "#94A3B8", label: "Personal" },
} as const;

export type EventType = keyof typeof EVENT_TYPES;

export const CALENDAR_EVENTS: Array<{
  day: number;
  hour: number;
  duration: number;
  title: string;
  type: EventType;
  attendees?: number;
  project?: string;
}> = [
  { day: 18, hour: 9, duration: 0.5, title: "Daily team standup", type: "standup", attendees: 6 },
  { day: 18, hour: 11, duration: 1, title: "Halo Health - Discovery follow-up", type: "client", project: "HH-2026-01" },
  { day: 18, hour: 14, duration: 1, title: "Internal - Phase 2 build review", type: "standup" },
  { day: 19, hour: 9, duration: 0.5, title: "Daily team standup", type: "standup", attendees: 6 },
  { day: 19, hour: 13, duration: 0.5, title: "Bayan Cargo - Kickoff", type: "client", project: "BC-2026-02" },
  { day: 19, hour: 16, duration: 1, title: "Iskolar - Architecture review", type: "client", project: "IS-2026-05" },
  { day: 20, hour: 9, duration: 0.5, title: "Daily team standup", type: "standup" },
  { day: 20, hour: 10, duration: 2, title: "Patient Portal Phase 2 review", type: "milestone", project: "HH-2026-01" },
  { day: 21, hour: 9, duration: 0.5, title: "Daily team standup", type: "standup" },
  { day: 21, hour: 14, duration: 1, title: "Cargo v2 kickoff", type: "client", project: "BC-2026-02" },
  { day: 22, hour: 9, duration: 0.5, title: "Daily team standup", type: "standup" },
  { day: 22, hour: 11, duration: 0.5, title: "Tindahan - Demo prep", type: "milestone", project: "TP-2026-03" },
  { day: 23, hour: 16, duration: 1, title: "Tindahan - Client demo", type: "client", project: "TP-2026-03" },
  { day: 24, hour: 12, duration: 1, title: "Lunch w/ Diana", type: "personal" },
  { day: 28, hour: 17, duration: 0.5, title: "HH delivery deadline", type: "deadline", project: "HH-2026-01" },
  { day: 31, hour: 18, duration: 0.5, title: "Patient Portal production deploy", type: "milestone", project: "HH-2026-01" },
];

export const MESSAGE_THREADS = [
  { id: "th-1", name: "Maria Santos", company: "Halo Health", kind: "client", project: "HH-2026-01", initials: "MS", color: "linear-gradient(135deg,#0ea5e9,#06b6d4)", lastMsg: "Looking forward to it. One question about multi-language support...", time: "2h ago", unread: 1, online: true, pinned: true },
  { id: "th-2", name: "Jaye Tan", role: "Lead Engineer", kind: "developer", project: "HH-2026-01", initials: "JT", color: "linear-gradient(135deg,#A855F7,#EC4899)", lastMsg: "Pushed schema migration v3 - ready for review.", time: "1h ago", unread: 2, online: true, pinned: true },
  { id: "th-3", name: "Marco Tiu", company: "Bayan Cargo", kind: "client", project: "BC-2026-02", initials: "MT", color: "linear-gradient(135deg,#F97316,#EF4444)", lastMsg: "Calendar invite received. See you Wednesday!", time: "Yesterday", unread: 0, online: false },
  { id: "th-4", name: "Mike Villar", role: "Senior Backend", kind: "developer", project: "BC-2026-02", initials: "MV", color: "linear-gradient(135deg,#F97316,#EF4444)", lastMsg: "Will hop on the kickoff. Need anything before?", time: "Yesterday", unread: 0, online: true },
  { id: "th-5", name: "Internal - PM Lead", role: "Director", kind: "internal", initials: "RL", color: "linear-gradient(135deg,#6366F1,#8B5CF6)", lastMsg: "Approve the Tindahan deliverable when ready.", time: "Yesterday", unread: 1, online: true },
  { id: "th-6", name: "Aileen Velasquez", company: "Tindahan PH", kind: "client", project: "TP-2026-03", initials: "AV", color: "linear-gradient(135deg,#10B981,#14B8A6)", lastMsg: "Saw the preview - looks great! Couple of notes inside.", time: "2 days ago", unread: 0, online: false },
] as const;

export const MESSAGE_THREAD_BODIES: Record<string, Array<{
  from: "them" | "me";
  time: string;
  text: string;
  attachments?: Array<{ name: string; size: string }>;
}>> = {
  "th-1": [
    { from: "them", time: "Wed 10:14", text: "Good morning Adrian! Quick check on the discovery summary - got time for a 15-min call this afternoon?" },
    { from: "me", time: "Wed 10:32", text: "2pm works for me. Sending the invite." },
    { from: "them", time: "Today 09:30", text: "Looking forward to the first preview Friday. One question - can we add multi-language support down the line? Tagalog and Cebuano?" },
  ],
  "th-2": [
    { from: "them", time: "Today 11:02", text: "Pushed schema migration v3 - ready for review. Added column-level encryption for SSN/insurance fields per the DPA notes." },
    { from: "them", time: "Today 11:04", text: "Validator agent is clean. Will rebase against main before merge.", attachments: [{ name: "migration-v3.sql", size: "8 KB" }] },
  ],
  "th-3": [{ from: "them", time: "Yesterday", text: "Calendar invite received. See you Wednesday!" }],
  "th-4": [{ from: "them", time: "Yesterday", text: "Will hop on the kickoff. Need anything before?" }],
  "th-5": [{ from: "them", time: "Yesterday", text: "Approve the Tindahan deliverable when ready. @Adrian please review by EOD." }],
  "th-6": [{ from: "them", time: "2 days ago", text: "Saw the preview - looks great! Couple of notes inside. Mostly copy changes, nothing structural." }],
};

export const PM_DOCUMENTS = [
  { name: "MSA_2026_Counter-signed.pdf", project: "HH-2026-01", client: "Halo Health", type: "Contract", status: "approved", size: "1.4 MB", date: "May 2, 2026", by: "AC", ext: "pdf" },
  { name: "Business_Profile.pdf", project: "HH-2026-01", client: "Halo Health", type: "Business", status: "approved", size: "1.8 MB", date: "May 5, 2026", by: "MS", ext: "pdf" },
  { name: "Discovery_Summary_v3.pdf", project: "HH-2026-01", client: "Halo Health", type: "Requirements", status: "approved", size: "2.4 MB", date: "May 5, 2026", by: "AC", ext: "pdf" },
  { name: "BrandGuidelines_2025.pdf", project: "HH-2026-01", client: "Halo Health", type: "Brand", status: "approved", size: "12.4 MB", date: "May 6, 2026", by: "MS", ext: "pdf" },
  { name: "Workflow_Screenshots_v2.zip", project: "HH-2026-01", client: "Halo Health", type: "Requirements", status: "revision", size: "24.7 MB", date: "May 11, 2026", by: "MS", ext: "zip" },
  { name: "Architecture_Proposal_v2.pdf", project: "HH-2026-01", client: "Halo Health", type: "Architecture", status: "pending", size: "8.2 MB", date: "May 9, 2026", by: "JT", ext: "pdf" },
  { name: "BC_SOW_v1.pdf", project: "BC-2026-02", client: "Bayan Cargo", type: "Contract", status: "approved", size: "0.9 MB", date: "May 10, 2026", by: "AC", ext: "pdf" },
  { name: "Carrier_Integrations_Spec.docx", project: "BC-2026-02", client: "Bayan Cargo", type: "Requirements", status: "pending", size: "0.5 MB", date: "May 11, 2026", by: "AC", ext: "doc" },
  { name: "Tindahan_Logo.svg", project: "TP-2026-03", client: "Tindahan PH", type: "Brand", status: "approved", size: "12 KB", date: "Apr 14, 2026", by: "TP", ext: "img" },
  { name: "Tindahan_Demo_Notes.pdf", project: "TP-2026-03", client: "Tindahan PH", type: "Other", status: "approved", size: "0.3 MB", date: "May 14, 2026", by: "AC", ext: "pdf" },
  { name: "KB_LoanApp_Specs_v2.pdf", project: "KB-2026-04", client: "Kapitbahay", type: "Requirements", status: "approved", size: "1.1 MB", date: "Apr 10, 2026", by: "AC", ext: "pdf" },
  { name: "IS_OAuth_Scopes.md", project: "IS-2026-05", client: "Iskolar Co-op", type: "Requirements", status: "approved", size: "8 KB", date: "May 3, 2026", by: "AC", ext: "doc" },
] as const;

export const DOCUMENT_EXT_COLORS = { pdf: "#EF4444", doc: "#3B82F6", zip: "#F59E0B", img: "#10B981" } as const;

export function documentStatusBits(status: string) {
  const map: Record<string, { c: string; bg: string; border: string; label: string }> = {
    approved: { c: "#6EE7B7", bg: "rgba(16,185,129,.15)", border: "rgba(16,185,129,.35)", label: "Approved" },
    pending: { c: "#FBBF24", bg: "rgba(245,158,11,.15)", border: "rgba(245,158,11,.35)", label: "Pending" },
    revision: { c: "#FCA5A5", bg: "rgba(239,68,68,.15)", border: "rgba(239,68,68,.35)", label: "Needs revision" },
  };
  return map[status] || map.pending;
}

export const AI_PROVIDER_USAGE = [
  { name: "Anthropic Claude", phase: "Phase 1 - Planning", tokens: 6780000, cost: "$2,890", costPhp: "₱164,730", rate: "82 tok/s avg", percent: 72, models: ["claude-sonnet-4.5", "claude-haiku-4.5", "claude-opus-4"], color: "#A78BFA" },
  { name: "OpenAI", phase: "Phase 2 - Development", tokens: 2640000, cost: "$1,420", costPhp: "₱80,940", rate: "64 tok/s avg", percent: 48, models: ["gpt-5", "gpt-5-mini"], color: "#10B981" },
  { name: "Google Gemini", phase: "Phase 3 - Validation", tokens: 980000, cost: "$310", costPhp: "₱17,670", rate: "48 tok/s avg", percent: 22, models: ["gemini-2.5-pro"], color: "#3B82F6" },
  { name: "GitHub Copilot", phase: "Pair Review", tokens: 1180000, cost: "$200", costPhp: "₱11,400", rate: "-", percent: 18, models: ["copilot-x"], color: "#94A3B8" },
] as const;

export const PM_REPORTS = [
  { id: "sla", title: "SLA Compliance", tint: "#10B981", kpis: [{ k: "On-time delivery", v: "98%" }, { k: "Phase 2 SLA", v: "95%" }], chart: "ringbar", chartData: 98, desc: "% of projects delivered within SLA, broken down by phase." },
  { id: "delivery", title: "Average Delivery Time", tint: "#4F8BFF", kpis: [{ k: "Avg (this month)", v: "13.4d" }, { k: "Trend", v: "-18% vs Q1" }], chart: "line", chartData: [22, 20, 18, 17, 15, 13.4], desc: "Trend over last 6 months, by project type." },
  { id: "refinement", title: "Refinement Loop Frequency", tint: "#A78BFA", kpis: [{ k: "Avg loops/project", v: "0.6" }, { k: "Best dev", v: "JT (0.2)" }], chart: "bar", chartData: [3, 5, 8, 5, 4, 2, 1, 2], desc: "How often projects bounce back to dev refinement, by dev." },
  { id: "nps", title: "Client Satisfaction (NPS)", tint: "#EC4899", kpis: [{ k: "Current NPS", v: "68" }, { k: "Promoters", v: "82%" }], chart: "line", chartData: [54, 58, 60, 63, 66, 68], desc: "NPS over time, by client segment." },
  { id: "utilization", title: "Developer Utilization", tint: "#F59E0B", kpis: [{ k: "Team avg load", v: "62%" }, { k: "At risk", v: "1 dev > 90%" }], chart: "bar", chartData: [80, 90, 50, 60, 20, 40], desc: "Load % across the team - identify over / under-utilization." },
  { id: "roi", title: "AI ROI per Project", tint: "#14B8A6", kpis: [{ k: "Avg savings", v: "₱312k" }, { k: "ROI multiple", v: "8.4x" }], chart: "stack", chartData: null, desc: "Cost vs. delivery time savings vs. manual baseline." },
  { id: "funnel", title: "Project Pipeline Health", tint: "#6366F1", kpis: [{ k: "Conversion", v: "42%" }, { k: "Inquiries (mo)", v: "18" }], chart: "funnel", chartData: [18, 12, 9, 7, 6], desc: "Inquiry to engaged to planned to built to delivered." },
  { id: "tokeneff", title: "Token Cost Efficiency", tint: "#8B5CF6", kpis: [{ k: "$ / feature", v: "$28" }, { k: "Most efficient", v: "Anthropic" }], chart: "bar", chartData: [60, 38, 28, 22, 20], desc: "Cost per delivered feature, by provider." },
] as const;

export const AGENT_DEFS = {
  ceo: { name: "CEO Orchestrator", model: "claude-sonnet-4.5", color: "#4F8BFF", iconKey: "compass" },
  research: { name: "Research", model: "perplexity/sonar", color: "#A855F7", iconKey: "brain" },
  architect: { name: "Architect", model: "gpt-5", color: "#6366F1", iconKey: "layers" },
  backend: { name: "Backend", model: "claude-sonnet-4.5", color: "#10B981", iconKey: "code" },
  frontend: { name: "Frontend", model: "claude-sonnet-4.5", color: "#F97316", iconKey: "layout" },
  database: { name: "Database", model: "gpt-5-mini", color: "#14B8A6", iconKey: "database" },
  mobile: { name: "Mobile", model: "claude-sonnet-4.5", color: "#EC4899", iconKey: "smartphone" },
  copilot: { name: "Copilot", model: "gpt-5-mini", color: "#94A3B8", iconKey: "bot" },
  validator: { name: "Validator", model: "claude-haiku-4.5", color: "#EF4444", iconKey: "shield" },
} as const;

export const AGENT_KEYS = [
  "ceo",
  "research",
  "architect",
  "backend",
  "frontend",
  "database",
  "mobile",
  "copilot",
  "validator",
] as const;

export type AgentKey = (typeof AGENT_KEYS)[number];

export const PIPELINE_COLUMNS = [
  { key: "inquiry", label: "Inquiry", color: "#94A3B8" },
  { key: "engaged", label: "Engaged", color: "#4F8BFF" },
  { key: "phase1", label: "Phase 1 - Plan", color: "#4F8BFF" },
  { key: "phase2", label: "Phase 2 - Build", color: "#8B5CF6" },
  { key: "phase3", label: "Phase 3 - Refine", color: "#A78BFA" },
  { key: "deliver", label: "Deliver & Support", color: "#10B981" },
  { key: "closed", label: "Closed", color: "#64748B" },
] as const;

export type PipelineKey = (typeof PIPELINE_COLUMNS)[number]["key"];

export const PIPELINE: Record<PipelineKey, Array<{
  id: string;
  project: string;
  client: string;
  days: number;
  lead: null | { initials: string; color: string };
}>> = {
  inquiry: [
    { id: "MariCity-2026-pending", project: "Last-mile Logistics", client: "MariCity Logistics", days: 1, lead: null },
    { id: "Haribon-2026-pending", project: "BPO Workforce Tool", client: "Haribon BPO", days: 3, lead: null },
  ],
  engaged: [
    { id: "BC-2026-02", project: "Cargo Tracking v2", client: "Bayan Cargo", days: 2, lead: { initials: "MV", color: "linear-gradient(135deg,#F97316,#EF4444)" } },
  ],
  phase1: [],
  phase2: [
    { id: "HH-2026-01", project: "Patient Onboarding Portal", client: "Halo Health", days: 5, lead: { initials: "JT", color: "linear-gradient(135deg,#A855F7,#EC4899)" } },
    { id: "IS-2026-05", project: "Student Records API", client: "Iskolar Co-op", days: 3, lead: { initials: "MV", color: "linear-gradient(135deg,#F97316,#EF4444)" } },
  ],
  phase3: [
    { id: "TP-2026-03", project: "Merchant Dashboard", client: "Tindahan PH", days: 1, lead: { initials: "JT", color: "linear-gradient(135deg,#A855F7,#EC4899)" } },
  ],
  deliver: [
    { id: "KB-2026-04", project: "Community Loan App", client: "Kapitbahay Co-op", days: 2, lead: { initials: "GP", color: "linear-gradient(135deg,#EF4444,#F97316)" } },
  ],
  closed: [
    { id: "LT-2025-22", project: "Booking Platform Migration", client: "Lakbay Tech", days: 12, lead: { initials: "JT", color: "linear-gradient(135deg,#A855F7,#EC4899)" } },
  ],
};

export const SCHEDULE = [
  { time: "09:00", title: "Daily team standup", type: "standup", duration: "15m" },
  { time: "10:30", title: "Halo Health - Discovery follow-up", type: "client", duration: "45m", project: "HH-2026-01" },
  { time: "13:00", title: "Bayan Cargo - Kickoff", type: "client", duration: "30m", project: "BC-2026-02" },
  { time: "15:00", title: "Internal - Phase 2 build review", type: "internal", duration: "1h" },
  { time: "16:30", title: "Iskolar - Architecture review", type: "client", duration: "30m", project: "IS-2026-05" },
];

export const ACTIONS_REQUIRED = [
  { project: "Halo Health - Patient Portal", text: "Client uploaded new branding assets - needs review", priority: "high", route: "project/HH-2026-01" },
  { project: "Bayan Cargo - v2", text: "Phase 1 needs developer assignment", priority: "high", route: "project/BC-2026-02" },
  { project: "Tindahan PH - Merchant", text: "Dev team lead approval pending on Phase 3 deliverable", priority: "medium", route: "project/TP-2026-03" },
  { project: "Kapitbahay - Loan App", text: "Client signature pending on final acceptance", priority: "medium", route: "project/KB-2026-04" },
] as const;

export const TOKEN_SPEND = {
  total: "$4,820",
  anthropic: { tokens: "6.7M", cost: "$2,890", percent: 60 },
  openai: { tokens: "2.6M", cost: "$1,420", percent: 29 },
  perplexity: { tokens: "0.5M", cost: "$510", percent: 11 },
};
