import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // 빌드 시에는 더미 클라이언트 반환
    client = createClient("https://placeholder.supabase.co", "placeholder");
    return client;
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
