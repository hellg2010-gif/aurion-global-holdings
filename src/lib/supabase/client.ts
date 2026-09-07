import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";

export function createClientSupabaseClient() {
  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }
  const { url, anonKey } = env;
  return createBrowserClient(url, anonKey);
}
