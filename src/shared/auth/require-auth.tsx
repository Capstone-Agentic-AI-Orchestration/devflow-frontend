"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { DevFlowUserRole } from "@/shared/api/devflow-api";
import { compactDevFlowError } from "@/shared/utils/devflow-projects";
import { useAuth } from "./auth-provider";
import { homePathForRole } from "./role-routing";

export function RequireAuth({
  allowedRoles,
  children,
}: {
  allowedRoles?: DevFlowUserRole[];
  children: ReactNode;
}) {
  const { devFlowUser, devFlowUserError, initialized, signOut, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || user) return;
    router.replace(`/client/sign-in?next=${encodeURIComponent(pathname)}`);
  }, [initialized, pathname, router, user]);

  useEffect(() => {
    if (!devFlowUser || !allowedRoles?.length) return;
    if (allowedRoles.includes(devFlowUser.role)) return;
    router.replace(homePathForRole(devFlowUser.role));
  }, [allowedRoles, devFlowUser, router]);

  const returnToSignIn = async () => {
    await signOut().catch(() => null);
    router.replace(`/client/sign-in?next=${encodeURIComponent(pathname)}`);
  };

  if (!initialized) {
    return <AuthRouteState title="Checking session" body="Verifying your Supabase session before loading this workspace." />;
  }

  if (!user) {
    return <AuthRouteState title="Redirecting to sign in" body="A valid session is required for this workspace." />;
  }

  if (devFlowUserError) {
    return (
      <AuthRouteState
        title="Unable to load backend role"
        body={compactDevFlowError(devFlowUserError)}
        actionLabel="Sign in again"
        onAction={returnToSignIn}
      />
    );
  }

  if (!devFlowUser) {
    return <AuthRouteState title="Loading role" body="Resolving your DevFlow role from the backend." />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(devFlowUser.role)) {
    return (
      <AuthRouteState
        title="Wrong workspace"
        body={`Your current role is ${devFlowUser.role}. Redirecting to your assigned workspace.`}
      />
    );
  }

  return children;
}

function AuthRouteState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="auth-route-state">
      <div className="auth-route-card">
        <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{title}</div>
        <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, marginTop: 6 }}>{body}</div>
        {actionLabel && onAction && (
          <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
