"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, User, ShieldCheck } from "lucide-react"
import { playSound } from "@/lib/sounds"
import Link from "next/link"
import Image from "next/image"

const avatarOptions = [
  "/images/avatar-1.jpeg",
  "/images/avatar-2.jpeg",
  "/images/avatar-3.jpeg",
  "/images/avatar-4.jpeg",
  "/images/avatar-5.jpeg",
  "/images/toy-blue.png",
  "/images/toy-green.jpeg",
]

export default function ProfileEditClient({ user, profile }) {
  const router = useRouter()
  const [username, setUsername] = useState(profile?.username || "")
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || avatarOptions[0])
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file")
      playSound("lose")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be less than 5MB")
      playSound("lose")
      return
    }

    setIsUploading(true)
    setMessage("")

    try {
      const supabase = createClient()

      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      if (bucketError) {
        console.error("Error checking buckets:", bucketError)
        throw new Error("Storage not accessible")
      }

      const profileBucket = buckets?.find(b => b.name === "profile-pictures")
      if (!profileBucket) {
        throw new Error("Profile pictures bucket not found. Please create it in Supabase Storage.")
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log("Uploading file:", { fileName, filePath, fileType: file.type, fileSize: file.size })

      const { data, error } = await supabase.storage.from("profile-pictures").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      })

      if (error) {
        console.error("Upload error:", error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile-pictures").getPublicUrl(filePath)

      console.log("Image uploaded successfully:", publicUrl)
      setUploadedImage(publicUrl)
      setSelectedAvatar(publicUrl)
      playSound("win")
      setMessage("Image uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      setMessage(`Error uploading image: ${error.message}`)
      playSound("lose")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    if (!username.trim()) {
      setMessage("Username cannot be empty")
      playSound("lose")
      return
    }

    setIsSaving(true)
    setMessage("")

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        username: username.trim(),
        avatar_url: selectedAvatar,
      })
      .eq("id", user.id)

    if (error) {
      console.error("[v0] Update error:", error)
      setMessage("Error updating profile: " + error.message)
      playSound("lose")
    } else {
      setMessage("Profile updated successfully!")
      playSound("win")

      window.location.reload()
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    }

    setIsSaving(false)
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

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Edit Profile
            </h1>
            <p className="text-slate-400 text-lg">Customize your gaming identity</p>
          </div>

          <Card className="bg-slate-900/80 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
                {profile?.is_verified && (
                  <span className="ml-auto flex items-center gap-1 text-sm text-green-400">
                    <ShieldCheck className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Update your username and profile picture
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-slate-800/50 border-slate-700 text-slate-100 focus:border-purple-500"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-slate-300">Profile Picture</Label>

                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50">
                    <Image
                      src={selectedAvatar || "/images/avatar-1.jpeg"}
                      alt="Profile picture"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.log("Image failed to load, using fallback")
                        e.target.src = "/images/avatar-1.jpeg"
                      }}
                    />
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="text-slate-400 text-sm"
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Choose a preset avatar:</Label>
                  <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
                    {avatarOptions.map((avatar, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedAvatar(avatar)
                          playSound("click")
                        }}
                        onMouseEnter={() => playSound("hover")}
                        className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                          selectedAvatar === avatar
                            ? "ring-4 ring-purple-500 ring-offset-4 ring-offset-slate-950 scale-110"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Image src={avatar} alt={`Avatar ${index + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-center ${
                    message.includes("Error") || message.includes("must")
                      ? "bg-red-500/20 border border-red-500/50 text-red-400"
                      : "bg-green-500/20 border border-green-500/50 text-green-400"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
