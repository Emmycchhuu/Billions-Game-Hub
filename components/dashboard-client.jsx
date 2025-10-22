"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Trophy, User, Bell, Users, Gift } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Image from "next/image"

export default function DashboardClient({ user, profile: initialProfile, topPlayers }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showVerificationMessage, setShowVerificationMessage] = useState(false)
  const [profile, setProfile] = useState(initialProfile)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to profile changes
    const subscription = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log("[v0] Profile updated:", payload.new)
          setProfile(payload.new)
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user.id])

  useEffect(() => {
    const verified = searchParams.get("verified")
    if (verified === "true") {
      setShowVerificationMessage(true)
      playSound("win")
      setTimeout(() => setShowVerificationMessage(false), 5000)
    } else if (verified === "false") {
      setShowVerificationMessage(true)
      setTimeout(() => setShowVerificationMessage(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user.id])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const expForNextLevel = (level) => {
    const levels = [100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]
    return levels[level - 1] || 4500
  }

  const expForCurrentLevel = (level) => {
    const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600]
    return levels[level - 1] || 0
  }

  const currentLevelExp = expForCurrentLevel(profile?.level || 1)
  const nextLevelExp = expForNextLevel(profile?.level || 1)
  const expProgress =
    profile?.level >= 10 ? 100 : ((profile?.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100

  const games = [
    {
      id: "impostor",
      title: "Find the Impostor",
      description: "Identify the AI impostor among verified humans",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2350-jWSnwdRwsggurXEbBbS4RMnKf6u8bS.png",
      color: "cyan",
      points: "50-100 pts",
      href: "/games/impostor",
    },
    {
      id: "spin",
      title: "Billions Spin",
      description: "Spin the futuristic slot machine for rewards",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2345-aECh5wiLMPLbpkNwF8qcHzgtjob5s2.png",
      color: "purple",
      points: "10-500 pts",
      href: "/games/spin",
    },
    {
      id: "quiz",
      title: "Billions Quiz",
      description: "Test your knowledge in rapid-fire questions",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2346-u8L0SLhfElJSie0Jf6YNRhcAbmDVDb.png",
      color: "pink",
      points: "20-200 pts",
      href: "/games/quiz",
    },
    {
      id: "verification",
      title: "Human Verification",
      description: "Complete challenges to earn your verified badge",
      image: "/images/verification-hero.jpeg",
      color: "green",
      points: "Verification",
      href: "/verification",
    },
    {
      id: "chat",
      title: "Community Chat",
      description: "Feature coming soon - In development",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_3154-oQWDjI2J9wZ0Lk8YA55i9nz0MaQPzU.png",
      color: "blue",
      points: "Social",
      href: "/chat",
    },
    {
      id: "acknowledgement",
      title: "Acknowledgements",
      description: "Meet the team behind Billions Gaming Hub",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_3153-WDxjHZINmtUhupY3FBT6HYQu7uH21Y.png",
      color: "orange",
      points: "Credits",
      href: "/acknowledgements",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div className="flex items-center gap-4">
            <Image
              src="/images/billions-logo.png"
              alt="Billions Gaming Hub"
              width={60}
              height={60}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Gaming Hub
              </h1>
              <p className="text-slate-400 text-sm md:text-base">Welcome back, {profile?.username || "Agent"}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-4 md:px-6 py-2 md:py-3 flex-1 md:flex-none">
              <div className="flex items-center gap-2 justify-center">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                <span className="text-xl md:text-2xl font-bold text-cyan-400">{profile?.total_points || 0}</span>
                <span className="text-slate-400 text-xs md:text-sm">points</span>
              </div>
            </div>
            <Link href="/notifications">
              <Button
                variant="outline"
                className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent relative"
                onMouseEnter={() => playSound("hover")}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent flex-1 md:flex-none"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        {showVerificationMessage && (
          <div
            className={`p-4 rounded-lg text-center font-semibold animate-in slide-in-from-top mb-8 ${
              searchParams.get("verified") === "true"
                ? "bg-green-500/20 border border-green-500/50 text-green-400"
                : "bg-red-500/20 border border-red-500/50 text-red-400"
            }`}
          >
            {searchParams.get("verified") === "true"
              ? "Congratulations! You are now a verified human!"
              : "Verification failed. Please try again and pass all challenges."}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {profile?.avatar_url && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500/50">
                    <Image
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-2xl font-bold text-slate-100">{profile?.username || "Agent"}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                  onMouseEnter={() => playSound("hover")}
                >
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-100">{profile?.total_points || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 backdrop-blur-xl border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Level {profile?.level || 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-100 mb-2">{profile?.exp || 0} EXP</p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-full transition-all duration-500"
                  style={{ width: `${expProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {profile?.level >= 10
                  ? "Max Level!"
                  : `${nextLevelExp - (profile?.exp || 0)} EXP to Level ${(profile?.level || 1) + 1}`}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 backdrop-blur-xl border-green-500/20">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-100 mb-2">{profile?.referral_count || 0}</p>
              <p className="text-xs text-slate-400">Code: {profile?.referral_code || "Loading..."}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(profile?.referral_code || "")
                  playSound("click")
                }}
              >
                <Gift className="w-3 h-3 mr-1" />
                Copy Code
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Choose Your Game</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {games.map((game) => (
              <Link
                key={game.id}
                href={game.href}
                onMouseEnter={() => playSound("hover")}
                onClick={() => playSound("click")}
              >
                <Card
                  className={`bg-slate-900/50 backdrop-blur-xl border-${game.color}-500/20 hover:border-${game.color}-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group overflow-hidden`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={game.image || "/placeholder.svg"}
                      alt={game.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  </div>
                  <CardHeader>
                    <CardTitle className={`text-${game.color}-400 text-xl`}>{game.title}</CardTitle>
                    <CardDescription className="text-slate-400">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Earn:</span>
                      <span className={`text-${game.color}-400 font-semibold`}>{game.points}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Card Verification Section */}
        {profile?.is_verified && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-100">Verification Cards</h2>
              <Link href="/verification/cards">
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
                  onMouseEnter={() => playSound("hover")}
                >
                  View All Cards
                </Button>
              </Link>
            </div>
            <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    🎴
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">Earn Verification Cards</h3>
                  <p className="text-slate-400 mb-4">
                    Complete advanced verification challenges to earn exclusive Billions Gaming Hub cards
                  </p>
                  <Link href="/verification/cards">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      Start Card Verification
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Top Players</h2>
            <Link href="/leaderboard">
              <Button
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
                onMouseEnter={() => playSound("hover")}
              >
                View Full Leaderboard
              </Button>
            </Link>
          </div>
          <Card className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/20">
            <CardContent className="p-6">
              {topPlayers && topPlayers.length > 0 ? (
                <div className="space-y-3">
                  {topPlayers.map((player, index) => (
                    <div
                      key={player.user_id}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index < 3
                              ? "bg-gradient-to-br from-cyan-500 to-purple-500 text-white"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700">
                          <Image
                            src={player.avatar_url || "/images/avatar-1.jpeg"}
                            alt={player.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{player.username}</p>
                          <p className="text-xs text-slate-400">Level {player.level || 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-cyan-400">{player.total_points}</p>
                        <p className="text-xs text-slate-400">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center">Play games to see rankings!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
