"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Gift } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            username: username,
          },
        },
      })
      if (error) throw error

      if (referralCode && data.user) {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
          const { data: referralResult, error: referralError } = await supabase.rpc("apply_referral_bonus", {
            referee_id: data.user.id,
            referrer_code: referralCode.toUpperCase(),
          })

          if (referralError) {
            console.error("[v0] Referral error:", referralError)
          } else {
            console.log("[v0] Referral bonus applied:", referralResult)
          }
        } catch (err) {
          console.error("[v0] Referral processing error:", err)
        }
      }

      router.push("/auth/sign-up-success")
    } catch (error) {
      console.error("[v0] Signup error:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
      <div className="w-full max-w-sm relative z-10">
        <Card className="border-purple-500/20 bg-slate-900/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Join Billions
            </CardTitle>
            <CardDescription className="text-slate-400">Create your agent account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-slate-200">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Agent Nova"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@billions.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-slate-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-slate-200">
                    Repeat Password
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="bg-slate-800/50 border-purple-500/30 text-slate-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referral-code" className="text-slate-200 flex items-center gap-2">
                    Referral Code (Optional)
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      +200 pts bonus
                    </span>
                  </Label>
                  <Input
                    id="referral-code"
                    type="text"
                    placeholder="Enter code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="bg-slate-800/50 border-green-500/30 text-slate-100 placeholder:text-slate-500 uppercase"
                    maxLength={8}
                  />
                  <p className="text-xs text-slate-500">
                    Have a referral code? Both you and your friend get 200 bonus points!
                  </p>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign up"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-slate-400">
                {"Already have an account? "}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
