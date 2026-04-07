import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseEnv } from "@/lib/supabase";

export function createBrowserSupabaseClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return createBrowserClient(getSupabaseUrl()!, getSupabasePublishableKey()!);
}
