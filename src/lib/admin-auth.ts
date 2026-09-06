import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AdminAuthContext = {
  supabase: Exclude<Awaited<ReturnType<typeof createServerSupabaseClient>>, null> | null;
  userId: string | null;
  isAdmin: boolean;
  email: string | null;
};

export async function getAdminAuthContext(): Promise<AdminAuthContext> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { supabase: null, userId: null, isAdmin: false, email: null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null, isAdmin: false, email: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    userId: user.id,
    isAdmin: profile?.role === "admin",
    email: user.email ?? null,
  };
}
