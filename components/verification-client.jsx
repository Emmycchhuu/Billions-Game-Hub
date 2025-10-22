"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Circle, Clock, Loader2 } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"
import Image from "next/image"
import MathVerification from "@/components/verification/math-verification"
import QuizVerification from "@/components/verification/quiz-verification"
import TouchVerification from "@/components/verification/touch-verification"
import VoiceVerification from "@/components/verification/voice-verification"

export default function VerificationClient({ user, profile }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPending, setIsPending] = useState(false)
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

  const steps = [
    { id: "math", title: "Math Challenge", component: MathVerification },
    { id: "quiz", title: "Billions Quiz", component: QuizVerification },
    { id: "touch", title: "Touch & Hold", component: TouchVerification },
    { id: "voice", title: "Voice Verification", component: VoiceVerification },
  ]

  const handleStepComplete = async (stepId, data) => {
    const updatedData = { ...verificationData, ...data }
    setVerificationData(updatedData)
    playSound("win")

    // Move to next step or complete verification
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // All steps complete - save to database
      await completeVerification(updatedData)
    }
  }

  const completeVerification = async (data) => {
    const supabase = createClient()

    // Check if all tests passed
    const allPassed = data.mathPassed && data.quizPassed && data.touchPassed && data.voicePassed

    // Save verification session
    await supabase.from("verification_sessions").insert({
      user_id: user.id,
      math_score: data.mathScore,
      math_passed: data.mathPassed,
      quiz_score: data.quizScore,
      quiz_passed: data.quizPassed,
      touch_duration: data.touchDuration,
      touch_passed: data.touchPassed,
      voice_recorded: data.voiceRecorded,
      voice_passed: data.voicePassed,
      all_tests_passed: allPassed,
      completed_at: new Date().toISOString(),
    })

    if (allPassed) {
      setIsPending(true)

      // Calculate pending until time (2-3 minutes random)
      const pendingMinutes = Math.floor(Math.random() * 2) + 2 // 2-3 minutes
      const pendingUntil = new Date(Date.now() + pendingMinutes * 60 * 1000)

      // Update profile with pending state
      await supabase
        .from("profiles")
        .update({
          verification_pending: true,
          verification_pending_until: pendingUntil.toISOString(),
        })
        .eq("id", user.id)

      // Send pending notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "verification_pending",
        title: "Verification Pending ⏳",
        message: `Your verification is being processed. This usually takes ${pendingMinutes} minutes. You'll be notified once approved!`,
      })

      playSound("win")

      // Wait for the display message (show for 3 seconds)
      setTimeout(() => {
        router.push("/dashboard?verification=pending")
      }, 3000)
    } else {
      // Increment attempts
      await supabase
        .from("profiles")
        .update({
          verification_attempts: (profile?.verification_attempts || 0) + 1,
        })
        .eq("id", user.id)

      playSound("lose")
      router.push("/dashboard?verified=false")
    }
  }

  const CurrentStepComponent = steps[currentStep].component

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(236,72,153,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.15),transparent_50%)]" />

        <Card className="bg-slate-900/80 backdrop-blur-xl border-yellow-500/20 max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-400 animate-pulse" />
            </div>
            <CardTitle className="text-yellow-400 text-2xl">Verification Pending</CardTitle>
            <CardDescription className="text-slate-400">Your verification is being processed</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
              <p className="text-slate-300">Processing your verification...</p>
            </div>
            <p className="text-sm text-slate-400">
              This usually takes 2-3 minutes. You'll receive a notification once your verification is approved!
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(236,72,153,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.15),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 bg-transparent"
              onMouseEnter={() => playSound("hover")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="relative w-full max-w-2xl mx-auto mb-8 h-64 rounded-2xl overflow-hidden">
            <Image
              src="/images/verification-hero.jpeg"
              alt="Human Verification"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Human Verification
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Complete all verification challenges to earn your verified badge
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                        ? "bg-pink-500 text-white ring-4 ring-pink-500/30"
                        : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {index < currentStep ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </div>
                <p
                  className={`text-xs md:text-sm text-center ${
                    index <= currentStep ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="bg-slate-900/80 backdrop-blur-xl border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-pink-400 text-2xl">{steps[currentStep].title}</CardTitle>
              <CardDescription className="text-slate-400">
                Step {currentStep + 1} of {steps.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurrentStepComponent
                onComplete={(data) => handleStepComplete(steps[currentStep].id, data)}
                profile={profile}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
