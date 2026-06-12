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
import { ensureProfileViaApi } from "@/lib/auth/ensureProfile";
import {
  createProfileForAuthUser,
  getProfileByAuthId,
} from "@/lib/services/users";
import type { User } from "@/types/database";

type AuthContextValue = {
  authUser: AuthUser | null;
  profile: User | null;
  profileError: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveProfileClient(authUser: AuthUser): Promise<User> {
  const existing = await getProfileByAuthId(authUser.id);
  if (existing) return existing;

  try {
    return await createProfileForAuthUser(authUser);
  } catch (err) {
    if (err instanceof Error && err.message.includes("duplicate")) {
      const raced = await getProfileByAuthId(authUser.id);
      if (raced) return raced;
    }
    throw err;
  }
}

async function resolveProfile(authUser: AuthUser): Promise<User> {
  try {
    const fromApi = await ensureProfileViaApi();
    if (fromApi) return fromApi;
  } catch {
    // Service role key may be unset locally — fall back to client insert
  }

  return resolveProfileClient(authUser);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAuthUser(null);
      setProfile(null);
      setProfileError(null);
      return;
    }

    setAuthUser(user);
    setProfileError(null);

    try {
      const nextProfile = await resolveProfile(user);
      setProfile(nextProfile);
    } catch (err) {
      setProfile(null);
      setProfileError(
        err instanceof Error
          ? err.message
          : "Could not load your profile. Run supabase/migrations/002_auth.sql."
      );
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!mounted || !user) return;

        setAuthUser(user);
        setProfileError(null);
        const nextProfile = await resolveProfile(user);
        if (mounted) setProfile(nextProfile);
      } catch (err) {
        if (mounted) {
          setProfileError(
            err instanceof Error
              ? err.message
              : "Could not load your profile. Run supabase/migrations/002_auth.sql."
          );
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
        setProfileError(null);
        try {
          const nextProfile = await resolveProfile(user);
          if (mounted) setProfile(nextProfile);
        } catch (err) {
          if (mounted) {
            setProfile(null);
            setProfileError(
              err instanceof Error ? err.message : "Could not load your profile."
            );
          }
        }
      } else {
        setProfile(null);
        setProfileError(null);
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
    setProfileError(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({
      authUser,
      profile,
      profileError,
      loading,
      signOut,
      refreshProfile,
    }),
    [authUser, profile, profileError, loading, signOut, refreshProfile]
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
