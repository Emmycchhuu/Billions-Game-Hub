import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import CommunityChatClient from "@/components/community-chat-client"

export default async function ChatPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is banned
  const { data: activeBan } = await supabase
    .from("chat_bans")
    .select("*")
    .eq("user_id", user.id)
    .gt("banned_until", new Date().toISOString())
    .single()

  return <CommunityChatClient user={user} profile={profile} activeBan={activeBan} />
}
