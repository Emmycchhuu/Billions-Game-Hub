import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import CardVerificationLevelClient from "@/components/card-verification-level-client"

export default async function CardVerificationLevelPage({ params }) {
  const supabase = await createServerClient()
  const cardLevel = parseInt(params.level)

  if (!cardLevel || cardLevel < 1 || cardLevel > 5) {
    redirect("/verification/cards")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get difficulty settings
  const { data: difficultySettings } = await supabase
    .from("card_difficulty_settings")
    .select("*")
    .order("card_level", { ascending: true })

  // Check if user already has this card
  const { data: existingCard } = await supabase
    .from("verification_cards")
    .select("*")
    .eq("user_id", user.id)
    .eq("card_level", cardLevel)
    .single()

  if (existingCard) {
    redirect("/verification/cards")
  }

  // Check if user can attempt this card (has previous card or is level 1)
  if (cardLevel > 1) {
    const { data: previousCard } = await supabase
      .from("verification_cards")
      .select("*")
      .eq("user_id", user.id)
      .eq("card_level", cardLevel - 1)
      .single()

    if (!previousCard) {
      redirect("/verification/cards")
    }
  }

  return (
    <CardVerificationLevelClient 
      user={user} 
      profile={profile} 
      cardLevel={cardLevel}
      difficultySettings={difficultySettings}
    />
  )
}
