import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sparkles, Trophy, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(6,182,212,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[url('/grid.jpg')] opacity-10" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-16 pt-8">
          <div className="inline-block mb-6 animate-float">
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden animate-glow">
              <Image src="/images/billions-logo.png" alt="Billions Gaming Hub" fill className="object-cover" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse-glow">
            BILLIONS
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 font-mono">Gaming Hub</p>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Enter the future of gaming. Test your skills, earn points, and climb the leaderboard in our collection of
            AI-powered games.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/sign-up">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-8 py-6 text-lg hover-glow">
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg bg-transparent"
              >
                Enter Hub
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 card-shine animate-slide-up">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">Fast-Paced Action</h3>
            <p className="text-slate-400 leading-relaxed">Quick games designed for maximum excitement and engagement</p>
          </div>
          <div
            className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 card-shine animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Earn Rewards</h3>
            <p className="text-slate-400 leading-relaxed">
              Collect points and compete for the top spot on the leaderboard
            </p>
          </div>
          <div
            className="bg-slate-900/50 backdrop-blur-xl border border-pink-500/20 rounded-lg p-6 hover:border-pink-500/50 transition-all duration-300 hover:scale-105 card-shine animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-pink-400 mb-2">AI-Powered</h3>
            <p className="text-slate-400 leading-relaxed">Experience next-gen gaming with intelligent challenges</p>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 rounded-2xl p-12 animate-scale-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Ready to Play?
          </h2>
          <p className="text-slate-300 mb-8 max-w-xl mx-auto leading-relaxed">
            Join thousands of players in the most exciting gaming hub. Create your account and start earning points
            today.
          </p>
          <Link href="/auth/sign-up">
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-10 py-6 text-lg hover-glow">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
