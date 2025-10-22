import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import QuizGame from "@/components/quiz-game"

export default async function QuizGamePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <QuizGame user={user} profile={profile} />
}
