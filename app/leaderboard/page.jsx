import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LeaderboardClient from "@/components/leaderboard-client"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch leaderboard data
  const { data: leaderboard } = await supabase
    .from("profiles")
    .select("id, username, total_points, created_at")
    .order("total_points", { ascending: false })
    .limit(100)

  // Fetch user's game sessions
  const { data: gameSessions } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <LeaderboardClient user={user} profile={profile} leaderboard={leaderboard} gameSessions={gameSessions} />
}
