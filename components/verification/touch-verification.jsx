"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { playSound } from "@/lib/sounds"

export default function TouchVerification({ onComplete }) {
  const [isHolding, setIsHolding] = useState(false)
  const [holdDuration, setHoldDuration] = useState(0)
  const [completed, setCompleted] = useState(false)
  const startTimeRef = useRef(null)
  const intervalRef = useRef(null)

  const requiredDuration = 3000 // 3 seconds

  const handleTouchStart = () => {
    setIsHolding(true)
    startTimeRef.current = Date.now()
    playSound("click")

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      setHoldDuration(elapsed)

      if (elapsed >= requiredDuration) {
        handleSuccess()
      }
    }, 50)
  }

  const handleTouchEnd = () => {
    setIsHolding(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (holdDuration < requiredDuration) {
      playSound("lose")
      setHoldDuration(0)
    }
  }

  const handleSuccess = () => {
    setIsHolding(false)
    setCompleted(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    playSound("win")

    setTimeout(() => {
      onComplete({
        touchPassed: true,
        touchDuration: requiredDuration,
      })
    }, 1000)
  }

  const progress = Math.min((holdDuration / requiredDuration) * 100, 100)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-slate-400 mb-4">Press and hold the button for 3 seconds</p>
        <p className="text-sm text-slate-500">This verifies you're a human with touch capability</p>
      </div>

      <div className="relative">
        <div className="bg-slate-800/50 rounded-lg p-8 text-center">
          <Button
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            disabled={completed}
            className={`w-full h-48 text-2xl font-bold transition-all duration-200 ${
              completed
                ? "bg-green-500 hover:bg-green-600"
                : isHolding
                  ? "bg-pink-600 scale-95"
                  : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            }`}
          >
            {completed ? "✓ Verified!" : isHolding ? "Keep Holding..." : "Press & Hold"}
          </Button>

          {/* Progress bar */}
          {!completed && (
            <div className="mt-4 bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <p className="mt-4 text-slate-400">
            {completed ? "Touch verification complete!" : `${(holdDuration / 1000).toFixed(1)}s / 3.0s`}
          </p>
        </div>
      </div>
    </div>
  )
}
