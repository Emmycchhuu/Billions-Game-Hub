"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Circle, Clock, Loader2 } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"
import MathVerification from "@/components/verification/math-verification"
import QuizVerification from "@/components/verification/quiz-verification"
import TouchVerification from "@/components/verification/touch-verification"
import VoiceVerification from "@/components/verification/voice-verification"

export default function CardVerificationLevelClient({ user, profile, cardLevel, difficultySettings }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)
  const [verificationData, setVerificationData] = useState({
    mathPassed: false,
    mathScore: 0,
    quizPassed: false,
    quizScore: 0,
    touchPassed: false,
    touchDuration: 0,
    voicePassed: false,
    voiceRecorded: false,
  })

  // Add error boundary
  useEffect(() => {
    const handleError = (error) => {
      console.error('Card verification level error:', error)
      setError('Something went wrong. Please try again.')
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  const cardData = {
    1: { type: 'blue', name: 'Billions Blue Card', color: 'from-blue-500 to-cyan-500' },
    2: { type: 'green', name: 'Billions Green Card', color: 'from-green-500 to-emerald-500' },
    3: { type: 'purple', name: 'Billions Purple Card', color: 'from-purple-500 to-violet-500' },
    4: { type: 'red', name: 'Billions Red Card', color: 'from-red-500 to-rose-500' },
    5: { type: 'golden', name: 'Billions Golden Card', color: 'from-yellow-500 to-orange-500' },
  }

  const currentCard = cardData[cardLevel]
  const difficulty = difficultySettings?.find(s => s.card_level === cardLevel)

  const steps = [
    { 
      id: "math", 
      title: "Math Challenge", 
      component: MathVerification,
      questions: difficulty?.math_questions || 5
    },
    { 
      id: "quiz", 
      title: "Billions Quiz", 
      component: QuizVerification,
      questions: difficulty?.quiz_questions || 5
    },
    { 
      id: "touch", 
      title: "Touch & Hold", 
      component: TouchVerification,
      duration: difficulty?.touch_duration_seconds || 3
    },
    { 
      id: "voice", 
      title: "Voice Verification", 
      component: VoiceVerification,
      phrases: difficulty?.voice_phrases || ['Say: I am a verified human']
    },
  ]

  const handleStepComplete = async (stepId, data) => {
    try {
      setError(null)
      const updatedData = { ...verificationData, ...data }
      setVerificationData(updatedData)
      playSound("win")

      // Move to next step or complete verification
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        // All steps complete - save card to database
        await completeCardVerification(updatedData)
      }
    } catch (error) {
      console.error('Error in step completion:', error)
      setError('Failed to complete step. Please try again.')
      playSound('lose')
    }
  }

  const completeCardVerification = async (data) => {
    try {
      setError(null)
      const supabase = createClient()

      // Check if all tests passed
      const allPassed = data.mathPassed && data.quizPassed && data.touchPassed && data.voicePassed

      if (allPassed) {
        setIsPending(true)

        // Save verification card
        const { error: cardError } = await supabase.from("verification_cards").insert({
          user_id: user.id,
          card_level: cardLevel,
          card_type: currentCard.type,
          card_name: currentCard.name,
          verification_data: {
            math_score: data.mathScore,
            quiz_score: data.quizScore,
            touch_duration: data.touchDuration,
            voice_recorded: data.voiceRecorded,
            completed_at: new Date().toISOString(),
          },
        })

        if (cardError) {
          console.error("Error saving card:", cardError)
          setError('Failed to save card. Please try again.')
          setIsPending(false)
          return
        }

        // Send notification
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "card_earned",
          title: `🎉 ${currentCard.name} Earned!`,
          message: `Congratulations! You've successfully earned your Level ${cardLevel} verification card!`,
        })

        playSound("win")

        // Redirect to cards page after 3 seconds
        setTimeout(() => {
          router.push("/verification/cards")
        }, 3000)
      } else {
        playSound("lose")
        setError('Verification failed. Please complete all steps.')
        setIsPending(false)
      
        // Send failure notification
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "card_failed",
          title: "Verification Failed",
          message: `You didn't pass all the challenges for ${currentCard.name}. Try again!`,
        })

        setTimeout(() => {
          router.push("/verification/cards")
        }, 3000)
      }
    } catch (error) {
      console.error('Error completing card verification:', error)
      setError('Failed to complete verification. Please try again.')
      setIsPending(false)
    }
  }

  const goBack = () => {
    playSound("click")
    router.push("/verification/cards")
  }

  const CurrentStepComponent = steps[currentStep]?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={goBack}
            variant="outline"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
            onMouseEnter={() => playSound("hover")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cards
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="w-48 h-32 mx-auto rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl mb-6">
            <Image
              src={`/images/${currentCard.type} card.jpg`}
              alt={currentCard.name}
              width={192}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            {currentCard.name}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Complete all verification challenges to earn your Level {cardLevel} card
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex justify-center mb-8">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const StepIcon = step.id === "math" ? "🧮" : 
                             step.id === "quiz" ? "🧠" : 
                             step.id === "touch" ? "👆" : "🎤"

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                      ? 'bg-purple-500 border-purple-500 text-white' 
                      : 'bg-slate-700 border-slate-600 text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span className="text-lg">{StepIcon}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-6">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                <p className="text-red-400">{error}</p>
                <Button 
                  onClick={() => setError(null)} 
                  variant="outline" 
                  className="mt-2 border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          <Card className="bg-slate-900/80 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-400 text-center">
                Step {currentStep + 1}: {steps[currentStep]?.title}
              </CardTitle>
              <CardDescription className="text-center text-slate-400">
                {steps[currentStep]?.id === "math" && `${difficulty?.math_questions || 5} Math Questions`}
                {steps[currentStep]?.id === "quiz" && `${difficulty?.quiz_questions || 5} Quiz Questions`}
                {steps[currentStep]?.id === "touch" && `Hold for ${difficulty?.touch_duration_seconds || 3} seconds`}
                {steps[currentStep]?.id === "voice" && `${difficulty?.voice_phrases?.length || 1} Voice Phrases`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    {verificationData.mathPassed && verificationData.quizPassed && verificationData.touchPassed && verificationData.voicePassed
                      ? "🎉 Card Earned!"
                      : "Verification Failed"
                    }
                  </h3>
                  <p className="text-slate-400">
                    {verificationData.mathPassed && verificationData.quizPassed && verificationData.touchPassed && verificationData.voicePassed
                      ? "Redirecting to your card collection..."
                      : "Redirecting back to cards..."
                    }
                  </p>
                </div>
              ) : (
                CurrentStepComponent && (
                  <CurrentStepComponent
                    onComplete={(data) => handleStepComplete(steps[currentStep].id, data)}
                    difficulty={difficulty}
                    stepData={steps[currentStep]}
                  />
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

