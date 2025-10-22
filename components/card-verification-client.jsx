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
  const [error, setError] = useState(null)

  // Add error boundary
  useEffect(() => {
    const handleError = (error) => {
      console.error('Card verification error:', error)
      setError('Something went wrong. Please try again.')
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

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
      // Create canvas to generate personalized card image
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 800
      canvas.height = 500

      // Load the base card image
      const baseImage = new Image()
      baseImage.crossOrigin = 'anonymous'
      
      const result = await new Promise((resolve, reject) => {
        baseImage.onload = () => {
          try {
            // Draw the base card image
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height)

            // Add personalized text overlay
            ctx.fillStyle = '#FFFFFF'
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 3

            // Add username (larger, more prominent)
            ctx.font = 'bold 36px Arial'
            ctx.textAlign = 'center'
            ctx.strokeText(profile.username, canvas.width / 2, 200)
            ctx.fillText(profile.username, canvas.width / 2, 200)

            // Add verification badge text
            ctx.font = 'bold 20px Arial'
            ctx.strokeText('✓ VERIFIED HUMAN', canvas.width / 2, 250)
            ctx.fillText('✓ VERIFIED HUMAN', canvas.width / 2, 250)

            // Add level
            ctx.font = 'bold 28px Arial'
            ctx.strokeText(`LEVEL ${cardData.level}`, canvas.width / 2, 300)
            ctx.fillText(`LEVEL ${cardData.level}`, canvas.width / 2, 300)

            // Add earned date
            ctx.font = '18px Arial'
            ctx.strokeText(`Earned: ${new Date().toLocaleDateString()}`, canvas.width / 2, 350)
            ctx.fillText(`Earned: ${new Date().toLocaleDateString()}`, canvas.width / 2, 350)

            // Convert canvas to blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to generate card image'))
              }
            }, 'image/png')
          } catch (error) {
            reject(error)
          }
        }
        
        baseImage.onerror = () => {
          reject(new Error('Failed to load card image'))
        }

        // Set the image source based on card type
        const imageName = cardData.type === 'blue' ? 'blue card.jpg' :
                         cardData.type === 'green' ? 'green card.jpg' :
                         cardData.type === 'purple' ? 'purple card.jpg' :
                         cardData.type === 'red' ? 'red card.jpg' :
                         'golden card.jpg'
        
        baseImage.src = `/images/${imageName}`
      })
      
      return result
    } catch (error) {
      console.error('Error generating card:', error)
      throw error
    } finally {
      setIsGeneratingCard(false)
    }
  }

  const downloadCard = async (cardData) => {
    try {
      setError(null)
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
      setError('Failed to download card. Please try again.')
      playSound('lose')
    }
  }

  const shareToTwitter = async (cardData) => {
    try {
      setError(null)
      const tweetText = `🎮 I just earned my Level ${cardData.level} ${cardData.name} from Billions Gaming Hub! 

Join me and play, connect, win, climb leaderboards and dominate! 

Use my referral code "${profile.referral_code}" to get 200 bonus points! 

@jgonzalenferrer @jazz_a_man @horkays @hizzy_tonlover @Tajudeen_10

#BillionsGamingHub #Gaming #Verification`

      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
      window.open(twitterUrl, '_blank')
      playSound('click')
    } catch (error) {
      console.error('Error sharing card:', error)
      setError('Failed to share card. Please try again.')
      playSound('lose')
    }
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
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl mb-6 animate-pulse">
              🎴
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Verification Cards
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
            Complete advanced verification challenges to earn exclusive Billions Gaming Hub cards
          </p>
          <div className="flex justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Progressive Difficulty
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Personalized Cards
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Social Sharing
            </span>
          </div>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cardTypes.map((cardData) => {
            const userCard = getUserCardLevel(cardData.level)
            const isUnlocked = isCardUnlocked(cardData.level)
            const canAttempt = canAttemptCard(cardData.level)
            const difficulty = difficultySettings?.find(s => s.card_level === cardData.level)

            return (
              <Card
                key={cardData.level}
                className={`bg-slate-900/80 backdrop-blur-xl border-2 transition-all duration-300 group ${
                  userCard 
                    ? 'border-green-500/50 hover:border-green-500 shadow-green-500/20 shadow-lg' 
                    : canAttempt 
                    ? 'border-purple-500/50 hover:border-purple-500 hover:scale-105 shadow-purple-500/20 shadow-lg' 
                    : 'border-slate-700/50 opacity-60'
                }`}
              >
                <CardHeader className="text-center">
                  <div className="relative mx-auto mb-4">
                    <div className="w-32 h-20 mx-auto rounded-lg overflow-hidden border-2 border-slate-700 shadow-lg relative">
                      {userCard ? (
                        <>
                          <Image
                            src={`/images/${cardData.type} card.jpg`}
                            alt={cardData.name}
                            width={128}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                          </div>
                        </>
                      ) : !isUnlocked ? (
                        <>
                          <Image
                            src={`/images/${cardData.type} card.jpg`}
                            alt={cardData.name}
                            width={128}
                            height={80}
                            className="w-full h-full object-cover opacity-30"
                          />
                          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-slate-500" />
                          </div>
                        </>
                      ) : (
                        <>
                          <Image
                            src={`/images/${cardData.type} card.jpg`}
                            alt={cardData.name}
                            width={128}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                            <span className="text-lg font-bold text-purple-400">START</span>
                          </div>
                        </>
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
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">Your Card Collection</h2>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-3xl font-bold text-green-400">{userCards.length}</div>
                <div className="text-slate-400">/ 5 cards earned</div>
                <div className="w-32 bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(userCards.length / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {cardTypes.map((cardData) => {
                const userCard = getUserCardLevel(cardData.level)
                return (
                  <div key={cardData.level} className="text-center">
                    <div className={`w-16 h-10 mx-auto rounded-lg overflow-hidden border-2 ${
                      userCard ? 'border-green-500' : 'border-slate-700'
                    }`}>
                      {userCard ? (
                        <Image
                          src={`/images/${cardData.type} card.jpg`}
                          alt={cardData.name}
                          width={64}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <span className="text-xs text-slate-500">{cardData.level}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {userCard ? 'Earned' : `Level ${cardData.level}`}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

