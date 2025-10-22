"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Sparkles } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Image from "next/image"
import PageNavigation from "@/components/page-navigation"

const symbols = [
  { id: "blue", image: "/images/toy-blue.png", value: 50, color: "text-blue-400", name: "Blue Buddy" },
  { id: "green", image: "/images/toy-green.jpeg", value: 100, color: "text-green-400", name: "Green Gem" },
  { id: "purple", image: "/images/toy-purple.jpeg", value: 150, color: "text-purple-400", name: "Purple Power" },
]

export default function SpinGame({ user, profile }) {
  const router = useRouter()
  const [gameState, setGameState] = useState("ready")
  const [reels, setReels] = useState([symbols[0], symbols[0], symbols[0]])
  const [isSpinning, setIsSpinning] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [lastWin, setLastWin] = useState(0)
  const [currentPoints, setCurrentPoints] = useState(profile?.total_points || 0)
  const spinCost = 50

  useEffect(() => {
    setCurrentPoints(profile?.total_points || 0)
  }, [profile])

  const spinReels = async () => {
    if (isSpinning || currentPoints < spinCost) return

    playSound("click")
    setIsSpinning(true)
    setGameState("spinning")

    const newPoints = currentPoints - spinCost
    setCurrentPoints(newPoints)

    const supabase = createClient()
    const { data, error } = await supabase.rpc("award_game_rewards", {
      p_user_id: user.id,
      p_game_type: "spin",
      p_points: -spinCost,
      p_exp: 0,
      p_game_data: { action: "spin_cost" },
    })

    if (error) {
      console.error("[v0] Error deducting spin cost:", error)
    }

    const spinDuration = 2000
    const spinInterval = 100
    let elapsed = 0

    const interval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ])
      elapsed += spinInterval

      if (elapsed >= spinDuration) {
        clearInterval(interval)
        finalizeSpin(newPoints)
      }
    }, spinInterval)
  }

  const finalizeSpin = async (pointsAfterSpin) => {
    const finalReels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ]

    setReels(finalReels)

    let winAmount = 0

    if (finalReels[0].id === finalReels[1].id && finalReels[1].id === finalReels[2].id) {
      winAmount = finalReels[0].value * 3
      playSound("win")
    } else if (finalReels[0].id === finalReels[1].id || finalReels[1].id === finalReels[2].id) {
      const matchedSymbol = finalReels[0].id === finalReels[1].id ? finalReels[0] : finalReels[1]
      winAmount = matchedSymbol.value
      playSound("win")
    } else {
      winAmount = 0
      playSound("lose")
    }

    setLastWin(winAmount)
    const netGain = winAmount - spinCost
    setTotalScore(totalScore + netGain)
    setIsSpinning(false)
    setGameState("result")

    const supabase = createClient()

    const expEarned = winAmount > 0 ? 20 : 5
    await supabase.rpc("award_game_rewards", {
      p_user_id: user.id,
      p_game_type: "spin",
      p_points: winAmount,
      p_exp: expEarned,
      p_game_data: { reels: finalReels.map((r) => r.id), spinCost, winAmount },
    })

    setTimeout(() => {
      if (currentPoints >= spinCost) {
        setGameState("ready")
      } else {
        setGameState("finished")
      }
    }, 2000)
  }

  const resetGame = () => {
    playSound("click")
    setTotalScore(0)
    setLastWin(0)
    setGameState("ready")
    setReels([symbols[0], symbols[0], symbols[0]])
    router.refresh()
  }

  const goToDashboard = () => {
    playSound("click")
    router.push("/dashboard")
  }

  const canSpin = currentPoints >= spinCost

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        <div className="flex justify-between items-center mb-4 md:mb-8 flex-wrap gap-4">
          <PageNavigation />
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-3 md:px-4 py-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-base md:text-lg font-bold text-cyan-400">{currentPoints}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Billions Spin
            </h1>
            <p className="text-slate-400 text-base md:text-lg">Match the Billions toys to win big rewards!</p>
            <p className="text-slate-500 text-sm mt-2">{spinCost} points per spin - Unlimited spins!</p>
          </div>

          <Card className="bg-slate-900/80 backdrop-blur-xl border-purple-500/20 mb-6 md:mb-8">
            <CardContent className="p-4 md:p-8">
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-4 md:p-8 border-2 border-purple-500/30 mb-6">
                <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
                  {reels.map((symbol, index) => (
                    <div
                      key={index}
                      className={`aspect-square bg-slate-800/50 rounded-2xl md:rounded-3xl border-4 border-purple-500/30 flex items-center justify-center p-4 md:p-6 ${
                        isSpinning ? "animate-pulse" : ""
                      }`}
                    >
                      <div className={`relative w-full h-full ${isSpinning ? "blur-sm" : ""}`}>
                        <Image
                          src={symbol.image || "/placeholder.svg"}
                          alt={symbol.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {gameState === "result" && (
                  <div className="text-center animate-in fade-in duration-500">
                    <div className="bg-slate-900/80 rounded-lg p-4 inline-block">
                      <p className="text-slate-400 text-sm mb-1">{lastWin > 0 ? "You won" : "No match - Lost"}</p>
                      <p className={`text-2xl md:text-4xl font-bold ${lastWin > 0 ? "text-cyan-400" : "text-red-400"}`}>
                        {lastWin > 0 ? `+${lastWin - spinCost}` : `-${spinCost}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={spinReels}
                  disabled={isSpinning || !canSpin}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 md:px-16 py-6 md:py-8 text-lg md:text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpinning ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 md:w-6 h-5 md:h-6 animate-spin" />
                      Spinning...
                    </span>
                  ) : !canSpin ? (
                    "Not Enough Points"
                  ) : (
                    `SPIN (${spinCost} pts)`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Prize Table</CardTitle>
              <CardDescription className="text-slate-400">Match toys to win points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {symbols.map((symbol) => (
                  <div key={symbol.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full bg-slate-700/50 p-2">
                        <Image
                          src={symbol.image || "/placeholder.svg"}
                          alt={symbol.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-slate-300">{symbol.name} x3</span>
                    </div>
                    <span className={`text-xl font-bold ${symbol.color}`}>{symbol.value * 3} pts</span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                  <span className="text-slate-400">Any 2 Match</span>
                  <span className="text-lg font-semibold text-slate-300">Toy Value</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-4 border border-red-700/50">
                  <span className="text-slate-400">No Match</span>
                  <span className="text-lg font-semibold text-red-400">-{spinCost} pts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {gameState === "finished" && (
            <Card className="bg-slate-900/80 backdrop-blur-xl border-green-500/20 mt-8">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-green-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-green-400 mb-2">Game Complete!</CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  Net result: {totalScore >= 0 ? `+${totalScore}` : totalScore} points
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={resetGame}
                    disabled={(profile?.total_points || 0) < spinCost}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 disabled:opacity-50"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={goToDashboard}
                    variant="outline"
                    className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent py-6"
                  >
                    Back to Hub
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
