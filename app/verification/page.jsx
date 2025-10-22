import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import VerificationClient from "@/components/verification-client"

export default async function VerificationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // If already verified, redirect to dashboard
  if (profile?.is_verified) {
    redirect("/dashboard")
  }

  return <VerificationClient user={user} profile={profile} />
}
