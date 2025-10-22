"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"
import Image from "next/image"

const contributors = [
  {
    name: "Big_D",
    role: "Project Core Contributor Advisor and Contributor",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/36469ee8-e098-417f-9e15-4c7f6c09e4b2-Q0Qwd5qbpEWlTMD6a2EKUxZGfld9we.jpeg",
    color: "from-blue-500 to-cyan-500",
    badge: "💙",
  },
  {
    name: "Dvm",
    role: "Project Core Contributor",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d8c58153-5645-453f-a756-506ae8aad3a5-UJPiEcaMoBYmRrB8Tkw0WKmLroZyg8.jpeg",
    color: "from-pink-500 to-rose-500",
    badge: "💙",
  },
  {
    name: "Hizzy",
    role: "Project Advisor and Contributo",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8537d420-23af-4338-b703-34b7661427e1-qRsR2JNpJhjEiiErJ8WxMdLeM4023U.jpeg",
    color: "from-orange-500 to-amber-500",
    badge: "💙",
  },
]

export default function AcknowledgementsClient({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
              onMouseEnter={() => playSound("hover")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Acknowledgements
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Meet the amazing team behind Billions Gaming Hub</p>
          <p className="text-slate-500 text-sm mt-2">
            Special thanks to our contributors who made this project possible
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {contributors.map((contributor, index) => (
            <Card
              key={index}
              className="bg-slate-900/80 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 group overflow-hidden"
            >
              <div
                className={`h-32 bg-gradient-to-r ${contributor.color} opacity-20 group-hover:opacity-30 transition-opacity`}
              />

              <CardContent className="p-6 -mt-16 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-slate-900 mb-4 shadow-lg">
                    <Image
                      src={contributor.image || "/placeholder.svg"}
                      alt={contributor.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold text-slate-100">{contributor.name}</h3>
                      <span className="text-2xl">{contributor.badge}</span>
                    </div>
                    <p className="text-sm text-slate-400">{contributor.role}</p>
                  </div>

                  <div className="flex items-center justify-center gap-1 text-yellow-400">
                    <Heart className="w-4 h-4 fill-current" />
                    <span className="text-xs font-semibold">Project Champion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Thank You
            </CardTitle>
            <CardDescription className="text-slate-400">
              A message of gratitude to our amazing contributors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              The Billions Gaming Hub would not be possible without the dedication and hard work of our incredible team.
              Each contributor has brought their unique skills and passion to make this project a reality.
            </p>
            <p className="text-slate-300">
              From strategic guidance to core development, every contribution has been invaluable in creating an
              engaging and innovative gaming platform for the Billions community.
            </p>
            <p className="text-slate-400 text-sm italic">Thank you for being part of this amazing journey!</p>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Link href="/dashboard">
            <Button
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-8 py-6"
              onMouseEnter={() => playSound("hover")}
            >
              Return to Gaming Hub
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
