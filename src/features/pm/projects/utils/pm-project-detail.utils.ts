/**
 * Pure utility functions for PM project detail views.
 * No React dependencies — safe to import anywhere.
 */

export function projectManagerIds(detail: { createdById?: string; members: Array<{ userId: string; role: string }> }): Set<string> {
  return new Set([
    detail.createdById,
    ...detail.members
      .filter((member) => ["PM", "ADMIN"].includes(member.role))
      .map((member) => member.userId),
  ].filter(Boolean) as string[]);
}

export function workOrderDispatchBlocker(workOrder: { status: string; instructions?: string }): string {
  if (workOrder.status !== "READY") return "Only READY work orders can dispatch.";
  if (!workOrder.instructions?.trim()) return "Instructions are required before dispatch.";
  return "";
}

export function compactBackendError(message?: string): string {
  if (!message) return "";
  try {
    const parsed = JSON.parse(message);
    if (Array.isArray(parsed.message)) return parsed.message.join(" ");
    if (typeof parsed.message === "string") return parsed.message;
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    // Plain text API errors are already suitable for display.
  }
  return message;
}

export function formatBackendDate(value?: string | Date | null): string {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
