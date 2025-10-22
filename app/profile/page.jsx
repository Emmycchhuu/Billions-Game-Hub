import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProfileEditClient from "@/components/profile-edit-client"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <ProfileEditClient user={user} profile={profile} />
}
