import type { User } from "@/types/database";

export async function ensureProfileViaApi(): Promise<User | null> {
  const res = await fetch("/api/auth/ensure-profile", { method: "POST" });
  const body = (await res.json()) as { profile?: User; error?: string };

  if (!res.ok) {
    throw new Error(body.error ?? "Failed to set up your profile");
  }

  return body.profile ?? null;
}
