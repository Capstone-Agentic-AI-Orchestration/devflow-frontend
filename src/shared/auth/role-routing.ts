import type { DevFlowUserRole } from "@/shared/api/devflow-api";

export function homePathForRole(role: DevFlowUserRole): string {
  const paths: Record<DevFlowUserRole, string> = {
    CLIENT: "/client/dashboard",
    PM: "/pm/dashboard",
    DEV: "/dev/dashboard",
    ADMIN: "/admin/overview",
  };

  return paths[role];
}
