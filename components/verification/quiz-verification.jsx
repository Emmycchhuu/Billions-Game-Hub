"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { playSound } from "@/lib/sounds"

const allQuizQuestions = [
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
    question: "Billions uses decentralized identity to prevent which problem?",
    options: ["Sybil Attacks", "Inflation", "DDoS Attacks", "Gas Spikes"],
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
        const finalScore = correct ? score + 1 : score
        const passed = finalScore >= 3
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
        <p className="text-xl font-semibold text-slate-100 mb-6 leading-relaxed">
          {questions[currentQuestion].question}
        </p>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`w-full justify-start text-left h-auto py-4 px-6 whitespace-normal break-words text-white rounded-lg text-base leading-relaxed ${
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
