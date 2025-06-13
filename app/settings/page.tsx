"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, LayoutDashboard, List, Save, Settings, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ClockIcon } from "@/components/clock-icon"

// Update the avatar options to use the uploaded images
const avatarOptions = [
  "/avatars/male-avatar-1.png",
  "/avatars/male-avatar-2.png",
  "/avatars/female-avatar-1.png",
  "/avatars/female-avatar-2.png",
]

interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    dueDateReminders: boolean
  }
  appearance: {
    theme: "light" | "dark" | "system"
    compactMode: boolean
  }
  defaultView: "board" | "list"
  defaultDueTime: string
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    push: true,
    dueDateReminders: true,
  },
  appearance: {
    theme: "system",
    compactMode: false,
  },
  defaultView: "board",
  defaultDueTime: "17:00",
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [profileName, setProfileName] = useState("John Doe")
  const [profileEmail, setProfileEmail] = useState("john@example.com")
  const [profileBio, setProfileBio] = useState("Task management enthusiast and productivity geek.")
  const [profileAvatar, setProfileAvatar] = useState(avatarOptions[0])
  const [activeTab, setActiveTab] = useState("account")
  const [emailError, setEmailError] = useState("")

  // Load settings from localStorage on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      try {
        const savedSettings = localStorage.getItem("userSettings")
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }

        // Load profile information
        const savedProfile = localStorage.getItem("userProfile")
        if (savedProfile) {
          const profile = JSON.parse(savedProfile)
          setProfileName(profile.name || "John Doe")
          setProfileEmail(profile.email || "john@example.com")
          setProfileBio(profile.bio || "Task management enthusiast and productivity geek.")
          setProfileAvatar(profile.avatar || avatarOptions[0])
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Show loading screen while data is being loaded
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-6">
          <ClockIcon size={96} className="text-primary" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">TickTickGo</h2>
            <p className="text-muted-foreground animate-pulse">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setProfileEmail(newEmail)

    if (newEmail && !validateEmail(newEmail)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("")
    }
  }

  const handleSaveSettings = () => {
    if (!profileName.trim()) {
      toast({
        title: "Name is required",
        description: "Please provide your name to continue.",
        variant: "destructive",
      })
      return
    }

    if (!profileEmail.trim() || !validateEmail(profileEmail)) {
      toast({
        title: "Valid email is required",
        description: "Please provide a valid email address to continue.",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem("userSettings", JSON.stringify(settings))

    // Save profile information
    const profileData = {
      name: profileName,
      email: profileEmail,
      bio: profileBio,
      avatar: profileAvatar,
    }
    localStorage.setItem("userProfile", JSON.stringify(profileData))

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })

    // Force a reload to update the profile information in the header
    window.location.reload()
  }

  const handleResetSettings = () => {
    setSettings(defaultSettings)
    localStorage.setItem("userSettings", JSON.stringify(defaultSettings))
    toast({
      title: "Settings reset",
      description: "Your preferences have been reset to default values.",
    })
  }

  const handleClearAllTasks = () => {
    if (window.confirm("Are you sure you want to delete all tasks? This action cannot be undone.")) {
      localStorage.removeItem("tasks")
      toast({
        title: "All tasks deleted",
        description: "All your tasks have been permanently deleted.",
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ClockIcon size={28} className="text-primary" />
          <span className="font-bold text-xl">TickTickGo</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <img
                    src={profileAvatar || "/placeholder.svg"}
                    width={32}
                    height={32}
                    alt="User Avatar"
                    className="aspect-square h-full w-full"
                  />
                </span>
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{profileName}</span>
                  <span className="text-xs text-muted-foreground">{profileEmail}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>Profile Settings</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <List className="h-4 w-4" />
                  Tasks
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-accent-foreground"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-lg md:text-2xl">Settings</h1>
              <Button size="sm" className="ml-auto h-8 gap-1" onClick={handleSaveSettings}>
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </Button>
            </div>
            <Tabs defaultValue="account" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your account details and preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={profileEmail}
                        onChange={handleEmailChange}
                        className={emailError ? "border-red-500" : ""}
                      />
                      {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about yourself"
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profile Picture</Label>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {avatarOptions.map((avatar, index) => (
                          <div
                            key={index}
                            className={`relative cursor-pointer rounded-full overflow-hidden border-2 ${
                              profileAvatar === avatar ? "border-primary" : "border-transparent"
                            }`}
                            onClick={() => setProfileAvatar(avatar)}
                          >
                            <img
                              src={avatar || "/placeholder.svg"}
                              alt={`Avatar option ${index + 1}`}
                              className="h-16 w-16 object-cover"
                            />
                            {profileAvatar === avatar && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <Check className="h-6 w-6 text-primary" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={!profileName.trim() || !profileEmail.trim() || !!emailError}
                    >
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Configure how you want to receive notifications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                        <span>Email Notifications</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Receive notifications via email
                        </span>
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={settings.notifications.email}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, email: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                        <span>Push Notifications</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Receive notifications in your browser
                        </span>
                      </Label>
                      <Switch
                        id="push-notifications"
                        checked={settings.notifications.push}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, push: checked },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="due-date-reminders" className="flex flex-col space-y-1">
                        <span>Due Date Reminders</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Get reminded before tasks are due
                        </span>
                      </Label>
                      <Switch
                        id="due-date-reminders"
                        checked={settings.notifications.dueDateReminders}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, dueDateReminders: checked },
                          })
                        }
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} className="w-full">
                      Save Notification Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="appearance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>Customize how TickTickGo looks and feels.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="compact-mode" className="flex flex-col space-y-1">
                        <span>Compact Mode</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          Display more content with less spacing
                        </span>
                      </Label>
                      <Switch
                        id="compact-mode"
                        checked={settings.appearance.compactMode}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            appearance: { ...settings.appearance, compactMode: checked },
                          })
                          // Apply compact mode immediately
                          document.body.classList.toggle("compact-mode", checked)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-view">Default Task View</Label>
                      <Select
                        value={settings.defaultView}
                        onValueChange={(value: "board" | "list") => {
                          setSettings({
                            ...settings,
                            defaultView: value,
                          })
                          // Store the preference for use in the tasks page
                          localStorage.setItem("defaultTaskView", value)
                        }}
                      >
                        <SelectTrigger id="default-view">
                          <SelectValue placeholder="Select default view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="board">Board View</SelectItem>
                          <SelectItem value="list">List View</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} className="w-full">
                      Save Appearance Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Configure advanced options and manage your data.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="default-due-time">Default Due Time</Label>
                      <Input
                        id="default-due-time"
                        type="time"
                        value={settings.defaultDueTime}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            defaultDueTime: e.target.value,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Set the default time for task due dates when only a date is specified.
                      </p>
                    </div>
                    <div className="pt-4">
                      <h3 className="mb-4 text-sm font-medium">Data Management</h3>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full" onClick={handleResetSettings}>
                          Reset All Settings
                        </Button>
                        <Button variant="destructive" className="w-full" onClick={handleClearAllTasks}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete All Tasks
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveSettings} className="w-full">
                      Save Advanced Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}
