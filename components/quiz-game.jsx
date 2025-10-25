"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Timer, Brain, CheckCircle2, XCircle } from "lucide-react"
import { playSound } from "@/lib/sounds"
import PageNavigation from "@/components/page-navigation"

const quizQuestions = [
  {
    id: 1,
    question: "What is Billions Network all about?",
    options: ["A TV show", "A decentralized Human & AI Network", "A crypto exchange", "A social media app"],
    correct: 1,
    points: 30,
  },
  {
    id: 2,
    question: "What makes Billions Network unique?",
    options: [
      "It uses face scans",
      "It focuses on privacy-preserving identity and reputation",
      "It sells user data",
      "It's only for AI agents",
    ],
    correct: 1,
    points: 30,
  },
  {
    id: 3,
    question: "Who launched Billions Network?",
    options: ["OpenAI", "Privado ID (formerly Polygon ID)", "Meta", "Google"],
    correct: 1,
    points: 30,
  },
  {
    id: 4,
    question: "What is the Billions Network's method for verifying human identity without storing personal data?",
    options: ["Zero-Knowledge Proofs", "Face Scanning", "Manual KYC", "Centralized Database"],
    correct: 0,
    points: 30,
  },
  {
    id: 5,
    question: "Which layer of Web3 infrastructure does Billions strengthen through attestations?",
    options: ["Consensus", "Trust", "Network", "Identity"],
    correct: 3,
    points: 30,
  },
  {
    id: 6,
    question: "Billions uses decentralized identity to prevent which problem?",
    options: ["Sybil Attacks", "Inflation", "DDoS Attacks", "Gas Spikes"],
    correct: 0,
    points: 30,
  },
  {
    id: 7,
    question: "What form of governance could allow token holders to propose upgrades in Billions?",
    options: ["DAO Governance", "Central Council", "Private Voting", "Automated Scripts"],
    correct: 0,
    points: 30,
  },
  {
    id: 8,
    question: "The Billions Network integrates Sign Protocol to build what type of ecosystem?",
    options: ["Trust-based Reputation Network", "Payment-only Gateway", "NFT Marketplace", "File Storage Network"],
    correct: 0,
    points: 30,
  },
  {
    id: 9,
    question: "Billions' identity model supports which emerging concept in AI interaction?",
    options: ["Proof-of-Personhood", "Facial Recognition", "Password Hashing", "Token Gating"],
    correct: 0,
    points: 30,
  },
  {
    id: 10,
    question: "How does Billions ensure each AI agent has verifiable activity?",
    options: ["Attestation Records", "Smart Wallet Seeds", "Cloud Logs", "API Keys"],
    correct: 0,
    points: 30,
  },
  {
    id: 11,
    question: "Which metric defines a participant's reliability within Billions?",
    options: ["Reputation Score", "Gas Fee Ratio", "Node Stake", "Voting Frequency"],
    correct: 0,
    points: 30,
  },
  {
    id: 12,
    question: "Billions is helping build the foundation for what kind of economy?",
    options: ["Human-AI Economy", "Gig Economy", "Real Estate Market", "Token Economy"],
    correct: 0,
    points: 30,
  },
  {
    id: 13,
    question: "What consensus ensures fairness in Billions' ecosystem verification?",
    options: ["Proof-of-Honesty", "Proof-of-Work", "Proof-of-Stake", "Proof-of-Participation"],
    correct: 3,
    points: 30,
  },
  {
    id: 14,
    question: "What is the key privacy advantage of using Sign Protocol with Billions?",
    options: ["Zero data leakage", "Faster block time", "Lower gas fees", "Full identity disclosure"],
    correct: 0,
    points: 30,
  },
  {
    id: 15,
    question: "Which underlying principle ensures decentralization in Billions Network?",
    options: ["Distributed Attestation", "Node Centralization", "Consensus Reuse", "API Mirroring"],
    correct: 0,
    points: 30,
  },
  {
    id: 16,
    question: "What role does Sentient play in Billions' AI infrastructure?",
    options: ["AI Alignment Partner", "Liquidity Provider", "Cross-chain Bridge", "Storage Manager"],
    correct: 0,
    points: 30,
  },
  {
    id: 17,
    question: "The 'Playground' under Billions primarily serves what purpose?",
    options: ["User Experimentation and Interaction", "Gaming Hub", "Token Trading", "Data Indexing"],
    correct: 0,
    points: 30,
  },
  {
    id: 18,
    question: "Billions is sometimes described as a 'network of networks.' What does this mean?",
    options: [
      "It integrates multiple trust layers and protocols",
      "It runs on multiple CPUs",
      "It has several game servers",
      "It manages IoT devices",
    ],
    correct: 0,
    points: 30,
  },
  {
    id: 19,
    question: "What type of wallet interaction does Billions recommend for attestations?",
    options: ["Signer Wallets", "Hardware Wallets", "Multisig Wallets", "Paper Wallets"],
    correct: 0,
    points: 30,
  },
  {
    id: 20,
    question: "Billions' reputation model enables users to do what across dApps?",
    options: ["Carry verified trust history", "Swap tokens", "Mine blocks", "Rent data"],
    correct: 0,
    points: 30,
  },
]

export default function QuizGame({ user, profile }) {
  const router = useRouter()
  const [gameState, setGameState] = useState("ready")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [shuffledQuestions, setShuffledQuestions] = useState([])

  useEffect(() => {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10)
    setShuffledQuestions(shuffled)
  }, [])

  useEffect(() => {
    if (gameState === "playing" && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "playing" && !showResult && timeLeft === 0) {
      handleTimeout()
    }
  }, [gameState, timeLeft, showResult])

  const startGame = () => {
    playSound("click")
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10)
    setShuffledQuestions(shuffled)
    setGameState("playing")
    setCurrentQuestion(0)
    setScore(0)
    setCorrectAnswers(0)
    setTimeLeft(15)
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const handleTimeout = () => {
    playSound("lose")
    setShowResult(true)
    setIsCorrect(false)
    setTimeout(() => moveToNextQuestion(), 2000)
  }

  const handleAnswerSelect = (answerIndex) => {
    if (showResult || selectedAnswer !== null) return
    playSound("click")
    setSelectedAnswer(answerIndex)
    const question = shuffledQuestions[currentQuestion]
    const correct = answerIndex === question.correct
    setIsCorrect(correct)
    setShowResult(true)
    if (correct) {
      playSound("win")
      const pointsEarned = question.points + timeLeft * 2
      setScore(score + pointsEarned)
      setCorrectAnswers(correctAnswers + 1)
    } else playSound("lose")
    setTimeout(() => moveToNextQuestion(), 2000)
  }

  const moveToNextQuestion = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
      setTimeLeft(15)
    } else finishGame()
  }

  const finishGame = async () => {
    setGameState("finished")
    const expEarned = correctAnswers * 10
    const supabase = createClient()
    await supabase.rpc("award_game_rewards", {
      p_user_id: user.id,
      p_game_type: "quiz",
      p_points: score,
      p_exp: expEarned,
      p_game_data: { correctAnswers, totalQuestions: shuffledQuestions.length },
    })
  }

  const goToDashboard = () => {
    playSound("click")
    router.push("/dashboard")
  }

  if (shuffledQuestions.length === 0)
    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

  const question = shuffledQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        <div className="flex justify-between items-center mb-4 md:mb-8 flex-wrap gap-4">
          <PageNavigation />
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-pink-500/20 rounded-lg px-3 md:px-4 py-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-pink-400" />
                <span className="text-xs md:text-sm text-slate-400">Q:</span>
                <span className="text-base md:text-lg font-bold text-pink-400">
                  {currentQuestion + 1}/{shuffledQuestions.length}
                </span>
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg px-3 md:px-4 py-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-base md:text-lg font-bold text-cyan-400">{score}</span>
              </div>
            </div>
          </div>
        </div>

        {gameState === "ready" && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-pink-500/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  Billions Quiz
                </CardTitle>
                <CardDescription className="text-slate-300 text-base md:text-lg leading-relaxed">
                  Test your knowledge about Billions Network. Answer quickly to earn bonus points!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-4 md:p-6 space-y-4">
                  <h3 className="text-pink-400 font-semibold text-base md:text-lg">How to Play:</h3>
                  <ul className="space-y-2 text-sm md:text-base text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      <span>Answer {shuffledQuestions.length} questions about Billions Network</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      <span>You have 15 seconds per question</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      <span>Faster answers earn more bonus points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-400 mt-1">•</span>
                      <span>Earn 30-60 points per correct answer + EXP</span>
                    </li>
                  </ul>
                </div>
                <Button
                  onClick={startGame}
                  className="w-full bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-semibold py-4 md:py-6 text-base md:text-lg"
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === "playing" && (
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-8">
            <div className="flex justify-center">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-pink-500/20 rounded-lg px-6 md:px-8 py-3 md:py-4">
                <div className="flex items-center gap-3">
                  <Timer
                    className={`w-5 md:w-6 h-5 md:h-6 ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-pink-400"}`}
                  />
                  <span className="text-2xl md:text-3xl font-bold text-pink-400">{timeLeft}s</span>
                </div>
              </div>
            </div>

            <Card className="bg-slate-900/80 backdrop-blur-xl border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-lg md:text-2xl text-slate-100 leading-relaxed text-balance">
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                {question.options.map((option, index) => {
                  let buttonClass =
                    "bg-slate-800/50 hover:bg-slate-700/50 text-slate-100 border-slate-700/50"

                  if (showResult) {
                    if (index === question.correct)
                      buttonClass = "bg-green-500/20 border-green-500 text-green-400"
                    else if (index === selectedAnswer)
                      buttonClass = "bg-red-500/20 border-red-500 text-red-400"
                  } else if (selectedAnswer === index)
                    buttonClass = "bg-pink-500/20 border-pink-500 text-pink-400"

                  return (
                    <Button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult || selectedAnswer !== null}
                      variant="outline"
                      onMouseEnter={() => playSound("hover")}
                      className={`w-full text-left px-4 py-3 md:py-5 rounded-lg border ${buttonClass} 
                        transition-all duration-300 flex items-start gap-3 break-words whitespace-normal
                        leading-relaxed text-sm sm:text-base md:text-lg h-auto min-h-[56px] sm:min-h-[64px]`}
                    >
                      <span className="font-semibold shrink-0">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1 break-words">{option}</span>

                      {showResult && index === question.correct && (
                        <CheckCircle2 className="w-4 md:w-5 h-4 md:h-5 ml-auto flex-shrink-0 text-green-400" />
                      )}
                      {showResult && index === selectedAnswer && index !== question.correct && (
                        <XCircle className="w-4 md:w-5 h-4 md:h-5 ml-auto flex-shrink-0 text-red-400" />
                      )}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>

            {showResult && (
              <div className="text-center animate-in fade-in duration-500">
                <Card
                  className={`inline-block ${
                    isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <CardContent className="p-4 md:p-6">
                    <p
                      className={`text-xl md:text-2xl font-bold ${
                        isCorrect ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isCorrect
                        ? `+${question.points + timeLeft * 2} Points!`
                        : "Incorrect"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {gameState === "finished" && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 md:w-20 h-16 md:h-20 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Trophy className="w-10 md:w-12 h-10 md:h-12 text-cyan-400" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">
                  Quiz Complete!
                </CardTitle>
                <CardDescription className="text-slate-300 text-base md:text-lg">
                  You answered {correctAnswers} out of {shuffledQuestions.length} questions correctly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-800/50 rounded-lg p-6 md:p-8 text-center space-y-4">
                  <div>
                    <p className="text-slate-400 mb-2">Total Score</p>
                    <p className="text-4xl md:text-5xl font-bold text-cyan-400">{score}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Accuracy</p>
                      <p className="text-xl md:text-2xl font-bold text-pink-400">
                        {Math.round((correctAnswers / shuffledQuestions.length) * 100)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">Correct</p>
                      <p className="text-xl md:text-2xl font-bold text-green-400">
                        {correctAnswers}/{shuffledQuestions.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={startGame}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-semibold py-4 md:py-6"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={goToDashboard}
                    variant="outline"
                    className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent py-4 md:py-6"
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
