"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

// Update the avatar options to use the uploaded images
const avatarOptions = [
  "/avatars/male-avatar-1.png",
  "/avatars/male-avatar-2.png",
  "/avatars/female-avatar-1.png",
  "/avatars/female-avatar-2.png",
]

export function OnboardingDialog() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0])
  const [emailError, setEmailError] = useState("")

  // Check if this is the first time the user is visiting
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding")
    if (!hasCompletedOnboarding) {
      setOpen(true)
    } else {
      // Load existing profile data
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile)
          setName(profile.name || "")
          setEmail(profile.email || "")
          setBio(profile.bio || "")
          setSelectedAvatar(profile.avatar || avatarOptions[0])
        } catch (error) {
          console.error("Failed to parse saved profile:", error)
        }
      }
    }
  }, [])

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name is required",
        description: "Please provide your name to continue.",
        variant: "destructive",
      })
      return
    }

    if (!email.trim() || !validateEmail(email)) {
      toast({
        title: "Valid email is required",
        description: "Please provide a valid email address to continue.",
        variant: "destructive",
      })
      return
    }

    // Save profile information
    const profileData = {
      name,
      email,
      bio,
      avatar: selectedAvatar,
    }
    localStorage.setItem("userProfile", JSON.stringify(profileData))
    localStorage.setItem("hasCompletedOnboarding", "true")

    setOpen(false)
    toast({
      title: "Profile saved",
      description: "Your profile has been set up successfully.",
    })

    // Force a reload to update the profile information in the header
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Welcome to TickTickGo!</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started. This information helps personalize your TickTickGo experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={handleEmailChange}
              required
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Choose a profile picture</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {avatarOptions.map((avatar, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-full overflow-hidden border-2 ${
                    selectedAvatar === avatar ? "border-primary" : "border-transparent"
                  }`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  <img
                    src={avatar || "/placeholder.svg"}
                    alt={`Avatar option ${index + 1}`}
                    className="h-16 w-16 object-cover"
                  />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!name.trim() || !email.trim() || !!emailError}>
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
