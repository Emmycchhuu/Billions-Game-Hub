"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BellOff, Trophy, Gift, TrendingUp, Award, Info, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { playSound } from "@/lib/sounds"

export default function NotificationsClient({ user, profile, notifications: initialNotifications }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isMarkingRead, setIsMarkingRead] = useState(false)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case "referral":
        return <Gift className="w-5 h-5 text-green-400" />
      case "level_up":
        return <Award className="w-5 h-5 text-purple-400" />
      case "leaderboard":
        return <Trophy className="w-5 h-5 text-yellow-400" />
      case "achievement":
        return <TrendingUp className="w-5 h-5 text-cyan-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "referral":
        return "border-green-500/20 bg-green-500/5"
      case "level_up":
        return "border-purple-500/20 bg-purple-500/5"
      case "leaderboard":
        return "border-yellow-500/20 bg-yellow-500/5"
      case "achievement":
        return "border-cyan-500/20 bg-cyan-500/5"
      default:
        return "border-blue-500/20 bg-blue-500/5"
    }
  }

  const markAllAsRead = async () => {
    setIsMarkingRead(true)
    const supabase = createClient()

    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)

    if (unreadIds.length > 0) {
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)

      setNotifications(notifications.map((n) => ({ ...n, is_read: true })))
      playSound("click")
    }

    setIsMarkingRead(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]" />

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
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={isMarkingRead}
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 bg-transparent"
              onMouseEnter={() => playSound("hover")}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Notifications
          </h1>
          <p className="text-slate-400 text-lg">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`${getNotificationColor(notification.type)} backdrop-blur-xl ${
                  !notification.is_read ? "border-2" : "border opacity-70"
                } transition-all hover:scale-[1.02]`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-slate-100 mb-1">{notification.title}</h3>
                          <p className="text-slate-400 text-sm">{notification.message}</p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{formatDate(notification.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/20">
              <CardContent className="p-12 text-center">
                <BellOff className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-400 mb-2">No notifications yet</h3>
                <p className="text-slate-500">Play games and interact to receive notifications</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
