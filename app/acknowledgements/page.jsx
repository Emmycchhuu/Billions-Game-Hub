import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import AcknowledgementsClient from "@/components/acknowledgements-client"

export default async function AcknowledgementsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <AcknowledgementsClient user={user} />
}
