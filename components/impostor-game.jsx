"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Timer, Target } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Image from "next/image"
import Link from "next/link"

const characters = [
  {
    id: 1,
    name: "ZARA-09 AGENT D",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2337-jpaN3C1CeL8a4IlOsF3TtkDhwFlOu0.jpeg",
    isImpostor: false,
  },
  {
    id: 2,
    name: "AGENT Nova-01",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2347-d2uWI6arIGEfLJkTFDwpJDvx9fOK1s.png",
    isImpostor: false,
  },
  {
    id: 3,
    name: "Dr. Liara Ver",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2334-YhRXBxuwHg0XbGOiq98C335CKISNeH.jpeg",
    isImpostor: false,
  },
  {
    id: 4,
    name: "Agent Chen",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2339-XBuKvUADRUntaqRB6tgSMGD94CFBe4.jpeg",
    isImpostor: false,
  },
  {
    id: 5,
    name: "Lila Moreno",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2349-RS7xliuGkSUUm3B2Ks2RGjge4kUK1D.png",
    isImpostor: false,
  },
  {
    id: 6,
    name: "Dr. Liara Ver",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_2348-iDH0C5cRnuOl3mfaEQpXSCy6lNy8gj.png",
    isImpostor: false,
  },
]

export default function ImpostorGame({ user, profile }) {
  const router = useRouter()
  const [gameState, setGameState] = useState("ready") // ready, playing, won, lost
  const [selectedCards, setSelectedCards] = useState([])
  const [impostorId, setImpostorId] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "playing" && timeLeft === 0) {
      handleGameOver(false)
    }
  }, [gameState, timeLeft])

  const startGame = () => {
    playSound("click")
    // Randomly select impostor
    const randomIndex = Math.floor(Math.random() * characters.length)
    setImpostorId(characters[randomIndex].id)
    setGameState("playing")
    setTimeLeft(30)
    setSelectedCards([])
  }

  const handleCardClick = (cardId) => {
    if (gameState !== "playing" || selectedCards.includes(cardId)) return

    playSound("click")
    setSelectedCards([...selectedCards, cardId])
  }

  const handleSubmit = async () => {
    if (selectedCards.length === 0 || gameState !== "playing") return

    playSound("click")
    setIsSubmitting(true)

    // Check if user selected the impostor
    const isCorrect = selectedCards.includes(impostorId)

    if (isCorrect) {
      const pointsEarned = Math.floor(50 + timeLeft * 2)
      setScore(score + pointsEarned)
      playSound("win")
      setGameState("won")

      // Award points and EXP using the database function
      const supabase = createClient()
      await supabase.rpc("award_game_rewards", {
        p_user_id: user.id,
        p_game_type: "impostor",
        p_points: pointsEarned,
        p_exp: 20, // 20 EXP for winning
        p_game_data: { round, timeLeft, correct: true },
      })
    } else {
      playSound("lose")
      handleGameOver(false)
    }

    setIsSubmitting(false)
  }

  const handleGameOver = async (won) => {
    setGameState(won ? "won" : "lost")
    if (!won) {
      playSound("lose")
      
      // Award small EXP for losing
      const supabase = createClient()
      await supabase.rpc("award_game_rewards", {
        p_user_id: user.id,
        p_game_type: "impostor",
        p_points: 0,
        p_exp: 5, // 5 EXP for losing
        p_game_data: { round, timeLeft, correct: false },
      })
    }
  }

  const playAgain = () => {
    playSound("click")
    setRound(round + 1)
    startGame()
  }

  const goToDashboard = () => {
    playSound("click")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
              onMouseEnter={() => playSound("hover")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-400">Round:</span>
                <span className="text-lg font-bold text-purple-400">{round}</span>
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-lg font-bold text-cyan-400">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {gameState === "ready" && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  Find the Impostor
                </CardTitle>
                <CardDescription className="text-slate-300 text-lg leading-relaxed">
                  One of these agents is an AI impostor. Study the verification cards carefully and identify the fake
                  before time runs out!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                  <h3 className="text-cyan-400 font-semibold text-lg">How to Play:</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>You have 30 seconds to identify the impostor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Click on the card you think is the impostor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Submit your answer before time runs out</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>Earn 50-100 points based on your speed</span>
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-6 text-lg"
                >
                  Start Game
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "playing" && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-8 py-4">
                <div className="flex items-center gap-3">
                  <Timer className={`w-6 h-6 ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-cyan-400"}`} />
                  <span className="text-3xl font-bold text-cyan-400">{timeLeft}s</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {characters.map((character) => (
                <div
                  key={character.id}
                  onClick={() => handleCardClick(character.id)}
                  onMouseEnter={() => playSound("hover")}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedCards.includes(character.id)
                      ? "scale-95 ring-4 ring-cyan-500 ring-offset-4 ring-offset-slate-950"
                      : "hover:scale-105"
                  }`}
                >
                  <Card
                    className={`bg-slate-900/80 backdrop-blur-xl border-2 overflow-hidden ${
                      selectedCards.includes(character.id) ? "border-cyan-500" : "border-slate-700/50"
                    }`}
                  >
                    <div className="relative aspect-[3/2]">
                      <Image
                        src={character.image || "/placeholder.svg"}
                        alt={character.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={selectedCards.length === 0 || isSubmitting}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-12 py-6 text-lg disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </div>
          </div>
        )}

        {gameState === "won" && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-green-500/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                  <Trophy className="w-12 h-12 text-green-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-green-400 mb-2">Impostor Found!</CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  You successfully identified the AI impostor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                  <p className="text-slate-400 mb-2">Points Earned</p>
                  <p className="text-5xl font-bold text-cyan-400">+{Math.floor(50 + timeLeft * 2)}</p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={playAgain}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-6"
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
          </div>
        )}

        {gameState === "lost" && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-red-500/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Target className="w-12 h-12 text-red-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-red-400 mb-2">Mission Failed</CardTitle>
                <CardDescription className="text-slate-300 text-lg">
                  {timeLeft === 0 ? "Time ran out!" : "Wrong impostor identified"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-6">
                  <p className="text-slate-300 text-center leading-relaxed">
                    The impostor was{" "}
                    <span className="text-cyan-400 font-semibold">
                      {characters.find((c) => c.id === impostorId)?.name}
                    </span>
                    . Better luck next time!
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={playAgain}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-6"
                  >
                    Try Again
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
          </div>
        )}
      </div>
    </div>
  )
}
