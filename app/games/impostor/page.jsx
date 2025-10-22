import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ImpostorGame from "@/components/impostor-game"

export default async function ImpostorGamePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <ImpostorGame user={user} profile={profile} />
}
