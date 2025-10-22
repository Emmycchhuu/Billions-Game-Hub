import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SpinGame from "@/components/spin-game"

export default async function SpinGamePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <SpinGame user={user} profile={profile} />
}
