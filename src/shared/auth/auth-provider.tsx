"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { acceptDevFlowClientInvites, getCurrentDevFlowUser, type DevFlowAuthUser } from "@/shared/api/devflow-api";
import { supabase } from "./supabase-client";

interface AuthContextValue {
  initialized: boolean;
  session: Session | null;
  user: User | null;
  devFlowUser: DevFlowAuthUser | null;
  devFlowUserError: string | null;
  signIn: (email: string, password: string) => Promise<DevFlowAuthUser>;
  signUp: (email: string, password: string) => Promise<DevFlowAuthUser | null>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [devFlowUser, setDevFlowUser] = useState<DevFlowAuthUser | null>(null);
  const [devFlowUserError, setDevFlowUserError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setInitialized(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setInitialized(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!session) {
      setDevFlowUser(null);
      setDevFlowUserError(null);
      return;
    }

    getCurrentDevFlowUser()
      .then((user) => {
        if (!mounted) return;
        setDevFlowUser(user);
        setDevFlowUserError(null);
      })
      .catch((error) => {
        if (!mounted) return;
        setDevFlowUser(null);
        setDevFlowUserError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      mounted = false;
    };
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const user = await getCurrentDevFlowUser();
    await acceptDevFlowClientInvites().catch(() => null);
    setDevFlowUser(user);
    setDevFlowUserError(null);
    return user;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.session) return null;

    setSession(data.session);
    const user = await getCurrentDevFlowUser();
    await acceptDevFlowClientInvites().catch(() => null);
    setDevFlowUser(user);
    setDevFlowUserError(null);
    return user;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const redirectTo = `${window.location.origin}/client/reset`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setDevFlowUser(null);
    setDevFlowUserError(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      session,
      user: session?.user ?? null,
      devFlowUser,
      devFlowUserError,
      signIn,
      signUp,
      resetPassword,
      updatePassword,
      signOut,
    }),
    [devFlowUser, devFlowUserError, initialized, resetPassword, session, signIn, signOut, signUp, updatePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
