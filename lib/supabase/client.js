import { createBrowserClient } from "@supabase/ssr"

let client = null

export function createClient() {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Supabase credentials missing. Please check your environment variables.")
    throw new Error("Supabase URL and Anon Key are required")
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return client
}
