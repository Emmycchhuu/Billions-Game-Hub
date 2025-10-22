"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"
import { playSound } from "@/lib/sounds"

export default function PageNavigation({ backUrl = "/dashboard", showHome = true }) {
  const router = useRouter()

  const handleBack = () => {
    playSound("click")
    router.back()
  }

  const handleHome = () => {
    playSound("click")
    router.push("/dashboard")
  }

  const handleNavigate = (url) => {
    playSound("click")
    router.push(url)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        onClick={handleBack}
        variant="outline"
        size="sm"
        className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
        onMouseEnter={() => playSound("hover")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      {showHome && (
        <Button
          onClick={handleHome}
          variant="outline"
          size="sm"
          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
          onMouseEnter={() => playSound("hover")}
        >
          <Home className="w-4 h-4 mr-2" />
          Hub
        </Button>
      )}
    </div>
  )
}
