"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

const BANNED_WORDS = [
  "fuck",
  "bitch",
  "stupid",
  "idiot",
  "damn",
  "shit",
  "ass",
  "bastard",
  "crap",
  "hell",
  "asshole",
  "dick",
  "pussy",
  "cock",
]

const containsBannedWord = (text) => {
  const lowerText = text.toLowerCase()
  return BANNED_WORDS.some((word) => lowerText.includes(word))
}

const containsInvalidLink = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = text.match(urlRegex) || []

  for (const url of urls) {
    if (!url.includes("twitter.com") && !url.includes("x.com")) {
      return true
    }
  }
  return false
}

export default function CommunityChatClient({ user, profile, activeBan }) {
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [canSendMessage, setCanSendMessage] = useState(true)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (cooldownSeconds === 0 && !canSendMessage) {
      setCanSendMessage(true)
    }
  }, [cooldownSeconds, canSendMessage])

  const fetchMessages = async () => {
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("chat_messages")
        .select(`*`)
        .order("created_at", { ascending: true })
        .limit(100)

      if (fetchError) throw fetchError

      setMessages(data || [])
    } catch (err) {
      console.error("[v0] Error fetching messages:", err)
      setError("Failed to load messages. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          try {
            const newMsg = payload.new
            console.log("[v0] New message received:", newMsg)
            setMessages((current) => {
              // Check if message already exists to avoid duplicates
              const exists = current.some(msg => msg.id === newMsg.id)
              if (exists) return current
              return [...current, newMsg]
            })
            playSound("click")
            setTimeout(() => scrollToBottom(), 100)
          } catch (err) {
            console.error("[v0] Error handling new message:", err)
          }
        },
      )
      .subscribe((status) => {
        console.log("[v0] Subscription status:", status)
      })

    return () => {
      console.log("[v0] Unsubscribing from chat channel")
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || isSending || !canSendMessage) return

    if (containsBannedWord(newMessage)) {
      playSound("lose")
      setError("Your message contains inappropriate language. Please keep the chat respectful.")

      const bannedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await supabase.from("chat_bans").insert({
        user_id: user.id,
        reason: "Use of inappropriate language",
        banned_until: bannedUntil.toISOString(),
      })

      await supabase.from("notifications").insert({
        user_id: user.id,
        type: "chat_ban",
        title: "Chat Ban - 24 Hours",
        message: "You have been banned from the community chat for 24 hours due to inappropriate language.",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
      return
    }

    if (containsInvalidLink(newMessage)) {
      playSound("lose")
      setError("Only Twitter/X links are allowed. Other links are not permitted.")
      return
    }

    setIsSending(true)
    setError(null)

    try {
      const { error: sendError } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        username: profile?.username || "Unknown",
        display_name: profile?.display_name || profile?.username || "Unknown",
        avatar_url: profile?.avatar_url || "/images/avatar-1.jpeg",
        is_verified: profile?.is_verified || false,
        message: newMessage.trim(),
      })

      if (sendError) throw sendError

      // Update rate limit
      await supabase.from("chat_rate_limits").upsert({
        user_id: user.id,
        last_message_at: new Date().toISOString(),
      })

      setNewMessage("")
      playSound("click")

      setCanSendMessage(false)
      setCooldownSeconds(60)
    } catch (err) {
      console.error("[v0] Error sending message:", err)
      setError("Failed to send message. Please try again.")
      playSound("lose")
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  if (activeBan) {
    const bannedUntil = new Date(activeBan.banned_until)
    const timeLeft = Math.ceil((bannedUntil - new Date()) / (1000 * 60 * 60))

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_50%)]" />

        <Card className="bg-slate-900/80 backdrop-blur-xl border-red-500/20 max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <CardTitle className="text-red-400 text-2xl">Chat Ban Active</CardTitle>
            <CardDescription className="text-slate-400">
              You are temporarily banned from the community chat
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-300">Reason: {activeBan.reason}</p>
            <p className="text-sm text-slate-400">
              Time remaining: approximately {timeLeft} hour{timeLeft !== 1 ? "s" : ""}
            </p>
            <Link href="/dashboard">
              <Button className="w-full bg-slate-700 hover:bg-slate-600">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(168,85,247,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
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

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Community Chat
          </h1>
          <p className="text-slate-400 text-lg">Connect with the Billions community</p>
          <p className="text-slate-500 text-sm mt-2">
            Keep it respectful • Only Twitter/X links allowed • 1 message per minute
          </p>
        </div>

        <Card className="bg-slate-900/80 backdrop-blur-xl border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-cyan-400">Live Chat</CardTitle>
            <CardDescription className="text-slate-400">
              {messages.length} messages • Messages auto-clear after 1 hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-y-auto mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-400">{error}</p>
                    <Button onClick={fetchMessages} className="mt-4 bg-cyan-500 hover:bg-cyan-600">
                      Retry
                    </Button>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">No messages yet. Be the first to chat!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 p-3 rounded-lg transition-all hover:bg-slate-800/50 ${
                      msg.user_id === user.id ? "bg-cyan-500/10" : "bg-slate-800/30"
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700">
                        <Image
                          src={msg.avatar_url || "/images/avatar-1.jpeg"}
                          alt={msg.username || "User"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {msg.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-100">{msg.username || "Unknown"}</span>
                        <span className="text-xs text-slate-500">{formatTime(msg.created_at)}</span>
                      </div>
                      <p className="text-slate-300 break-words">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && !isLoading && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  !canSendMessage
                    ? `Wait ${cooldownSeconds}s before sending another message...`
                    : "Type your message..."
                }
                disabled={isSending || !canSendMessage}
                className="flex-1 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                maxLength={500}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || isSending || !canSendMessage}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
            {!canSendMessage && (
              <p className="text-xs text-slate-500 mt-2 text-center">Cooldown: {cooldownSeconds} seconds remaining</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
