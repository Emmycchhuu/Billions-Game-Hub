"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { playSound } from "@/lib/sounds"

const allQuizQuestions = [
  // Original questions
  {
    question: "What is the primary goal of Billions Network?",
    options: [
      "To create a decentralized social media platform",
      "To build a global community of verified humans",
      "To develop AI technology",
      "To create a gaming platform",
    ],
    correct: 1,
  },
  {
    question: "What does the verification badge represent?",
    options: ["Premium membership", "Human verification", "High score", "Admin status"],
    correct: 1,
  },
  // New questions from file 1
  {
    question: "What is the Billions Network's method for verifying human identity without storing personal data?",
    options: ["Zero-Knowledge Proofs", "Face Scanning", "Manual KYC", "Centralized Database"],
    correct: 0,
  },
  {
    question: "Which layer of Web3 infrastructure does Billions strengthen through attestations?",
    options: ["Consensus", "Trust", "Network", "Identity"],
    correct: 3,
  },
  {
    question: "Billions uses decentralized identity to prevent which problem?",
    options: ["Sybil Attacks", "Inflation", "DDoS Attacks", "Gas Spikes"],
    correct: 0,
  },
  {
    question: "The Billions Network integrates Sign Protocol to build what type of ecosystem?",
    options: ["Trust-based Reputation Network", "Payment-only Gateway", "NFT Marketplace", "File Storage Network"],
    correct: 0,
  },
  {
    question: "Billions' identity model supports which emerging concept in AI interaction?",
    options: ["Proof-of-Personhood", "Facial Recognition", "Password Hashing", "Token Gating"],
    correct: 0,
  },
  {
    question: "Which metric defines a participant's reliability within Billions?",
    options: ["Reputation Score", "Gas Fee Ratio", "Node Stake", "Voting Frequency"],
    correct: 0,
  },
  {
    question: "Billions is helping build the foundation for what kind of economy?",
    options: ["Human-AI Economy", "Gig Economy", "Real Estate Market", "Token Economy"],
    correct: 0,
  },
  {
    question: "What role does Sentient play in Billions' AI infrastructure?",
    options: ["AI Alignment Partner", "Liquidity Provider", "Cross-chain Bridge", "Storage Manager"],
    correct: 0,
  },
  {
    question: "Billions is sometimes described as a 'network of networks.' What does this mean?",
    options: [
      "It integrates multiple trust layers and protocols",
      "It runs on multiple CPUs",
      "It has several game servers",
      "It manages IoT devices",
    ],
    correct: 0,
  },
  {
    question: "Which of the following is a long-term vision of Billions?",
    options: [
      "To unify human and AI identity under one verifiable system",
      "To replace traditional currencies",
      "To launch a social media app",
      "To mine Bitcoin",
    ],
    correct: 0,
  },
  {
    question: "How does Billions prevent duplicate or fake accounts?",
    options: ["Attestation uniqueness", "Multi-device login", "Password reset limits", "IP matching"],
    correct: 0,
  },
  {
    question: "Billions is expected to evolve into a core component of what future Web3 model?",
    options: ["Reputation-based Internet", "Energy-efficient Blockchain", "NFT Gaming World", "DeFi Layer"],
    correct: 0,
  },
  {
    question: "Which data principle governs how Billions handles personal information?",
    options: ["Self-sovereign data", "Custodial management", "Encrypted cloud storage", "Public data sharing"],
    correct: 0,
  },
  // New questions from file 2
  {
    question: "What does Billions Network aim to build across humans and AI?",
    options: [
      "A decentralized trust infrastructure",
      "A global social media system",
      "A centralized verification model",
      "A digital ad network",
    ],
    correct: 0,
  },
  {
    question: "Which layer is responsible for storing verified reputations on Billions?",
    options: ["Privacy Mesh", "Token Layer", "Social Graph", "Reputation Layer"],
    correct: 3,
  },
  {
    question: "What gives Billions its identity verification advantage?",
    options: [
      "It uses decentralized attestations from Sign Protocol",
      "It relies on government-issued IDs",
      "It uses centralized face scanning",
      "It integrates KYC APIs",
    ],
    correct: 0,
  },
  {
    question: "How does Billions protect user data during verification?",
    options: [
      "Using distributed hashes",
      "Through ZK-Encryption",
      "Through Zero-Knowledge Proofs",
      "Through cloud encryption",
    ],
    correct: 2,
  },
  {
    question: "What makes Billions sybil-resistant?",
    options: [
      "Each verified user has a unique attestation identity",
      "It limits wallet creation",
      "It uses 2FA login",
      "It verifies social followers",
    ],
    correct: 0,
  },
  {
    question: "What's the function of Zero-Knowledge Proofs in Billions?",
    options: [
      "They allow truth verification without revealing private data",
      "They increase blockchain speed",
      "They replace tokens with NFTs",
      "They automate staking",
    ],
    correct: 0,
  },
  {
    question: "What key feature links humans and AI within Billions?",
    options: ["Unified Reputation Ledger", "Neural Token Stream", "Social Reputation Rank", "Layer-2 Graph"],
    correct: 0,
  },
  {
    question: "What does 'Proof of Humanity' establish in Billions?",
    options: [
      "That an entity is human without exposing private data",
      "That a user owns tokens",
      "That a wallet is verified by banks",
      "That an address is whitelisted",
    ],
    correct: 0,
  },
  {
    question: "What role does Sign Protocol play in Billions' system?",
    options: [
      "It powers decentralized attestations for identity",
      "It handles storage encryption",
      "It maintains off-chain user data",
      "It provides token liquidity",
    ],
    correct: 0,
  },
  {
    question: "What prevents data tampering in Billions' reputation logs?",
    options: ["Blockchain immutability", "Manual validation", "IP tracking", "Smart contract pausing"],
    correct: 0,
  },
  {
    question: "What makes Billions ideal for AI-human collaboration?",
    options: [
      "It creates a common layer of verifiable trust",
      "It replaces humans in verification",
      "It uses centralized dashboards",
      "It removes data privacy",
    ],
    correct: 0,
  },
  {
    question: "How does Billions fight deepfake-based impersonation?",
    options: [
      "By linking attestations to verified human proofs",
      "By deleting fake media",
      "By scanning all uploads",
      "By banning new users",
    ],
    correct: 0,
  },
]

export default function QuizVerification({ onComplete }) {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    const shuffled = [...allQuizQuestions].sort(() => Math.random() - 0.5)
    setQuestions(shuffled.slice(0, 5))
  }, [])

  if (questions.length === 0) {
    return <div className="text-center text-slate-400">Loading questions...</div>
  }

  const handleAnswer = (index) => {
    setSelectedAnswer(index)
    const correct = index === questions[currentQuestion].correct

    if (correct) {
      setScore(score + 1)
      playSound("win")
      setFeedback("Correct!")
    } else {
      playSound("lose")
      setFeedback("Wrong answer!")
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setFeedback("")
      } else {
        // All questions answered
        const finalScore = correct ? score + 1 : score
        const passed = finalScore >= 3 // Need 3/5 to pass
        onComplete({
          quizPassed: passed,
          quizScore: finalScore,
        })
      }
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-slate-400 mb-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <p className="text-sm text-slate-500">Score: {score}/5 (Need 3 to pass)</p>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-6">
        <p className="text-xl font-semibold text-slate-100 mb-6">{questions[currentQuestion].question}</p>
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`w-full justify-start text-left h-auto py-4 px-6 ${
                selectedAnswer === index
                  ? index === questions[currentQuestion].correct
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                  : "bg-slate-700 hover:bg-slate-600"
              }`}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-center font-semibold ${
            feedback.includes("Correct")
              ? "bg-green-500/20 border border-green-500/50 text-green-400"
              : "bg-red-500/20 border border-red-500/50 text-red-400"
          }`}
        >
          {feedback}
        </div>
      )}
    </div>
  )
}
