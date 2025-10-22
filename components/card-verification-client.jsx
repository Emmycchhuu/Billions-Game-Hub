"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lock, CheckCircle2, Download, Share2, Twitter } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"
import Image from "next/image"

export default function CardVerificationClient({ user, profile, userCards, difficultySettings }) {
  const router = useRouter()
  const [selectedCard, setSelectedCard] = useState(null)
  const [isGeneratingCard, setIsGeneratingCard] = useState(false)

  const cardTypes = [
    { level: 1, type: 'blue', name: 'Billions Blue Card', color: 'from-blue-500 to-cyan-500' },
    { level: 2, type: 'green', name: 'Billions Green Card', color: 'from-green-500 to-emerald-500' },
    { level: 3, type: 'purple', name: 'Billions Purple Card', color: 'from-purple-500 to-violet-500' },
    { level: 4, type: 'red', name: 'Billions Red Card', color: 'from-red-500 to-rose-500' },
    { level: 5, type: 'golden', name: 'Billions Golden Card', color: 'from-yellow-500 to-orange-500' },
  ]

  const getUserCardLevel = (level) => {
    return userCards?.find(card => card.card_level === level)
  }

  const isCardUnlocked = (level) => {
    if (level === 1) return true // Blue card is always unlocked
    return getUserCardLevel(level - 1) !== undefined
  }

  const canAttemptCard = (level) => {
    return isCardUnlocked(level) && !getUserCardLevel(level)
  }

  const generateCardImage = async (cardData) => {
    setIsGeneratingCard(true)
    
    try {
      // Create canvas to generate card image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 800
      canvas.height = 500

      // Card background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, cardData.type === 'blue' ? '#3B82F6' : 
                          cardData.type === 'green' ? '#10B981' :
                          cardData.type === 'purple' ? '#8B5CF6' :
                          cardData.type === 'red' ? '#EF4444' : '#F59E0B')
      gradient.addColorStop(1, cardData.type === 'blue' ? '#06B6D4' : 
                          cardData.type === 'green' ? '#059669' :
                          cardData.type === 'purple' ? '#7C3AED' :
                          cardData.type === 'red' ? '#DC2626' : '#D97706')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add card border
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 8
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)

      // Add card title
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(cardData.name, canvas.width / 2, 80)

      // Add username
      ctx.font = 'bold 32px Arial'
      ctx.fillText(profile.username, canvas.width / 2, 150)

      // Add verification badge
      ctx.font = 'bold 24px Arial'
      ctx.fillText('✓ VERIFIED HUMAN', canvas.width / 2, 200)

      // Add level
      ctx.font = 'bold 36px Arial'
      ctx.fillText(`LEVEL ${cardData.level}`, canvas.width / 2, 280)

      // Add Billions Gaming Hub logo/text
      ctx.font = 'bold 28px Arial'
      ctx.fillText('BILLIONS GAMING HUB', canvas.width / 2, 350)

      // Add earned date
      ctx.font = '20px Arial'
      ctx.fillText(`Earned: ${new Date().toLocaleDateString()}`, canvas.width / 2, 400)

      // Convert canvas to blob
      return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })
    } catch (error) {
      console.error('Error generating card:', error)
      throw error
    } finally {
      setIsGeneratingCard(false)
    }
  }

  const downloadCard = async (cardData) => {
    try {
      const blob = await generateCardImage(cardData)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cardData.name.replace(/\s+/g, '_')}_${profile.username}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      playSound('win')
    } catch (error) {
      console.error('Error downloading card:', error)
      playSound('lose')
    }
  }

  const shareToTwitter = async (cardData) => {
    const tweetText = `🎮 I just earned my Level ${cardData.level} ${cardData.name} from Billions Gaming Hub! 

Join me and play, connect, win, climb leaderboards and dominate! 

Use my referral code "${profile.referral_code}" to get 200 bonus points! 

@jgonzalenferrer @jazz_a_man @horkays @hizzy_tonlover @Tajudeen_10

#BillionsGamingHub #Gaming #Verification`

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(twitterUrl, '_blank')
    playSound('click')
  }

  const startCardVerification = (cardData) => {
    playSound('click')
    router.push(`/verification/card/${cardData.level}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
              onMouseEnter={() => playSound("hover")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Verification Cards
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Complete verification challenges to earn exclusive Billions Gaming Hub cards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cardTypes.map((cardData) => {
            const userCard = getUserCardLevel(cardData.level)
            const isUnlocked = isCardUnlocked(cardData.level)
            const canAttempt = canAttemptCard(cardData.level)
            const difficulty = difficultySettings?.find(s => s.card_level === cardData.level)

            return (
              <Card
                key={cardData.level}
                className={`bg-slate-900/80 backdrop-blur-xl border-2 transition-all duration-300 ${
                  userCard 
                    ? 'border-green-500/50 hover:border-green-500' 
                    : canAttempt 
                    ? 'border-purple-500/50 hover:border-purple-500 hover:scale-105' 
                    : 'border-slate-700/50 opacity-60'
                }`}
              >
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <div className={`w-24 h-24 mx-auto rounded-xl bg-gradient-to-br ${cardData.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                      {userCard ? (
                        <CheckCircle2 className="w-12 h-12" />
                      ) : !isUnlocked ? (
                        <Lock className="w-12 h-12" />
                      ) : (
                        cardData.level
                      )}
                    </div>
                    {userCard && (
                      <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                        <Image
                          src="/images/verified.png"
                          alt="Verified"
                          width={16}
                          height={16}
                          className="w-4 h-4"
                        />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl text-slate-100">{cardData.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    Level {cardData.level} Verification
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {difficulty && (
                    <div className="text-sm text-slate-400 space-y-1">
                      <p>• {difficulty.math_questions} Math Questions</p>
                      <p>• {difficulty.quiz_questions} Quiz Questions</p>
                      <p>• {difficulty.touch_duration_seconds}s Touch & Hold</p>
                      <p>• {difficulty.voice_phrases.length} Voice Phrases</p>
                    </div>
                  )}

                  {userCard ? (
                    <div className="space-y-2">
                      <p className="text-green-400 text-sm font-semibold">✓ Card Earned!</p>
                      <p className="text-xs text-slate-500">
                        Earned: {new Date(userCard.earned_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => downloadCard(cardData)}
                          disabled={isGeneratingCard}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          onClick={() => shareToTwitter(cardData)}
                          className="flex-1 bg-blue-400 hover:bg-blue-500 text-white"
                          size="sm"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ) : canAttempt ? (
                    <Button
                      onClick={() => startCardVerification(cardData)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Start Verification
                    </Button>
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-500 text-sm mb-2">
                        Complete Level {cardData.level - 1} to unlock
                      </p>
                      <Button disabled className="w-full bg-slate-700 text-slate-500">
                        <Lock className="w-4 h-4 mr-2" />
                        Locked
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {userCards && userCards.length > 0 && (
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Your Card Collection</h2>
            <p className="text-slate-400">
              You have earned {userCards.length} out of 5 verification cards!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
