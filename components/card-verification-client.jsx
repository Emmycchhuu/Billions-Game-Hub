"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"
import Image from "next/image"

export default function CardShowcaseClient() {
  const [error, setError] = useState(null)

  const cardTypes = [
    { type: "blue", name: "Common Card", color: "from-blue-500 to-cyan-500" },
    { type: "green", name: "Rare Card", color: "from-green-500 to-emerald-500" },
    { type: "purple", name: "Epic Card", color: "from-purple-500 to-violet-500" },
    { type: "red", name: "Mythic Card", color: "from-red-500 to-rose-500" },
    { type: "golden", name: "Legendary Card", color: "from-yellow-500 to-orange-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back Button */}
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

        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl mb-6 animate-pulse">
            🎴
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Billions Game Hub Verification ID Coming Soon
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Collect and showcase your rank in the Billions Game Hub. Each card represents your status, growth, and achievements in the gaming community. Earn higher-tier cards as you climb the ranks.
          </p>
        </div>

        {/* Card Showcase */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cardTypes.map((card, index) => (
            <Card
              key={index}
              className={`bg-slate-900/80 backdrop-blur-xl border-2 border-${card.color} shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-purple-400`}
            >
              <CardHeader className="text-center">
                <div className="relative w-full flex justify-center mb-6">
                  <div className="relative w-72 h-44 rounded-xl overflow-hidden border-4 border-purple-500/30 shadow-2xl">
                    <Image
                      src={`/images/${card.type} card.jpg`}
                      alt={card.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <CardTitle className="text-2xl text-slate-100">{card.name}</CardTitle>
                <CardDescription className="text-slate-400 mt-2">
                  A symbol of recognition for dedicated players
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-slate-400 text-sm">
                <p>
                  The <span className="text-purple-400 font-semibold">{card.name}</span> represents your
                  progression in the Billions universe. Unlock your legacy and stand out among players.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Section */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>Stay tuned for the full Verification ID system — launching soon on Billions Game Hub 🚀</p>
        </div>
      </div>
    </div>
  )
}
