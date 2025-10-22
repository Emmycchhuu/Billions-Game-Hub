"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { playSound } from "@/lib/sounds"

export default function MathVerification({ onComplete }) {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    // Generate 5 random math questions
    const newQuestions = []
    for (let i = 0; i < 5; i++) {
      const num1 = Math.floor(Math.random() * 20) + 1
      const num2 = Math.floor(Math.random() * 20) + 1
      const operations = ["+", "-", "*"]
      const operation = operations[Math.floor(Math.random() * operations.length)]

      let correctAnswer
      let question

      switch (operation) {
        case "+":
          correctAnswer = num1 + num2
          question = `${num1} + ${num2}`
          break
        case "-":
          correctAnswer = num1 - num2
          question = `${num1} - ${num2}`
          break
        case "*":
          correctAnswer = num1 * num2
          question = `${num1} × ${num2}`
          break
      }

      newQuestions.push({ question, answer: correctAnswer })
    }
    setQuestions(newQuestions)
  }, [])

  const handleSubmit = () => {
    const userAnswer = Number.parseInt(answer)
    const correct = userAnswer === questions[currentQuestion].answer

    if (correct) {
      setScore(score + 1)
      playSound("win")
      setFeedback("Correct!")
    } else {
      playSound("lose")
      setFeedback(`Wrong! The answer was ${questions[currentQuestion].answer}`)
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setAnswer("")
        setFeedback("")
      } else {
        // All questions answered
        const finalScore = correct ? score + 1 : score
        const passed = finalScore >= 3 // Need 3/5 to pass
        onComplete({
          mathPassed: passed,
          mathScore: finalScore,
        })
      }
    }, 1500)
  }

  if (questions.length === 0) {
    return <div className="text-center text-slate-400">Loading questions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-slate-400 mb-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
        <p className="text-sm text-slate-500">Score: {score}/5 (Need 3 to pass)</p>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-8 text-center">
        <p className="text-4xl font-bold text-slate-100 mb-6">{questions[currentQuestion].question} = ?</p>
        <Input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && answer && handleSubmit()}
          placeholder="Enter your answer"
          className="text-center text-2xl h-16 bg-slate-900 border-slate-700 text-slate-100"
          autoFocus
        />
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

      <Button
        onClick={handleSubmit}
        disabled={!answer || feedback !== ""}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-6 text-lg"
      >
        Submit Answer
      </Button>
    </div>
  )
}
