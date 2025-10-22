"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, CheckCircle2 } from "lucide-react"
import { playSound } from "@/lib/sounds"

export default function VoiceVerification({ onComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const requiredDuration = 3000 // 3 seconds minimum

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      playSound("click")

      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime
        setRecordingTime(elapsed)

        // Auto-stop at 3 seconds
        if (elapsed >= requiredDuration) {
          clearInterval(timerRef.current)
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setCompleted(true)
            playSound("win")
            setTimeout(() => {
              onComplete({
                voicePassed: true,
                voiceRecorded: true,
              })
            }, 1000)
          }
        }
      }, 100)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Please allow microphone access to continue")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      clearInterval(timerRef.current)

      if (recordingTime >= requiredDuration) {
        setCompleted(true)
        playSound("win")
        setTimeout(() => {
          onComplete({
            voicePassed: true,
            voiceRecorded: true,
          })
        }, 1000)
      } else {
        playSound("lose")
        setRecordingTime(0)
        setAudioBlob(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-slate-400 mb-4">Record your voice for 3 seconds</p>
        <p className="text-sm text-slate-500">Say anything - this verifies you're a real human</p>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-8">
        <div className="flex flex-col items-center gap-6">
          {/* Recording Button */}
          <div className="relative">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={completed}
              className={`w-32 h-32 rounded-full text-white font-bold transition-all duration-200 ${
                completed
                  ? "bg-green-500 hover:bg-green-600"
                  : isRecording
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              }`}
            >
              {completed ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : isRecording ? (
                <MicOff className="w-12 h-12" />
              ) : (
                <Mic className="w-12 h-12" />
              )}
            </Button>

            {/* Pulsing ring when recording */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
            )}
          </div>

          {/* Status Text */}
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-100 mb-2">
              {completed
                ? "Voice Verified!"
                : isRecording
                  ? "Recording..."
                  : audioBlob
                    ? "Too short! Try again"
                    : "Tap to Start"}
            </p>
            <p className="text-slate-400">
              {completed
                ? "Voice verification complete!"
                : isRecording
                  ? `${(recordingTime / 1000).toFixed(1)}s / 3.0s`
                  : "Hold and speak for at least 3 seconds"}
            </p>
          </div>

          {/* Progress Bar */}
          {isRecording && !completed && (
            <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-pink-500 h-full transition-all duration-100"
                style={{ width: `${Math.min((recordingTime / requiredDuration) * 100, 100)}%` }}
              />
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-slate-500 space-y-1">
            <p>• Click the microphone to start recording</p>
            <p>• Recording will automatically stop after 3 seconds</p>
            <p>• Speak clearly during the recording</p>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Note */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
        <p className="text-blue-400 text-sm">
          📱 This works on mobile devices too! Just allow microphone access when prompted.
        </p>
      </div>
    </div>
  )
}
