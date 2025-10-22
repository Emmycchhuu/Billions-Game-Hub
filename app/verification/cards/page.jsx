import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import CardVerificationClient from "@/components/card-verification-client"

export default async function CardVerificationPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's verification cards
  const { data: userCards } = await supabase
    .from("verification_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("card_level", { ascending: true })

  // Get difficulty settings
  const { data: difficultySettings } = await supabase
    .from("card_difficulty_settings")
    .select("*")
    .order("card_level", { ascending: true })

  return (
    <CardVerificationClient 
      user={user} 
      profile={profile} 
      userCards={userCards}
      difficultySettings={difficultySettings}
    />
  )
}

