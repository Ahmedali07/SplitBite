"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import {
  createProfileForAuthUser,
  getProfileByAuthId,
} from "@/lib/services/users";
import type { User } from "@/types/database";

type AuthContextValue = {
  authUser: AuthUser | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveProfile(authUser: AuthUser): Promise<User> {
  const existing = await getProfileByAuthId(authUser.id);
  if (existing) return existing;
  return createProfileForAuthUser(authUser);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAuthUser(null);
      setProfile(null);
      return;
    }
    setAuthUser(user);
    const nextProfile = await resolveProfile(user);
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!mounted) return;

        if (user) {
          setAuthUser(user);
          const nextProfile = await resolveProfile(user);
          if (mounted) setProfile(nextProfile);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      const user = session?.user ?? null;
      setAuthUser(user);

      if (user) {
        const nextProfile = await resolveProfile(user);
        if (mounted) setProfile(nextProfile);
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setProfile(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({ authUser, profile, loading, signOut, refreshProfile }),
    [authUser, profile, loading, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
