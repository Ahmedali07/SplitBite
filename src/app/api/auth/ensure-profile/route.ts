import { NextResponse } from "next/server";
import type { User as AuthUser } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function profileNameFromAuthUser(user: AuthUser): string {
  return (
    (user.user_metadata?.name as string | undefined) ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "User"
  );
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();

    const { data: existing, error: fetchError } = await admin
      .from("users")
      .select("*")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ profile: existing });
    }

    const { data: created, error: insertError } = await admin
      .from("users")
      .insert({
        auth_id: user.id,
        name: profileNameFromAuthUser(user),
        avatar_url:
          (user.user_metadata?.avatar_url as string | undefined) ?? null,
      })
      .select()
      .single();

    if (insertError) {
      // Race: trigger created profile between fetch and insert
      if (insertError.code === "23505") {
        const { data: raced } = await admin
          .from("users")
          .select("*")
          .eq("auth_id", user.id)
          .maybeSingle();
        if (raced) return NextResponse.json({ profile: raced });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ profile: created });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to ensure profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
