"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { PartyPopper } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CelebrationPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskTitle: string
}

export function CelebrationPopup({ open, onOpenChange, taskTitle }: CelebrationPopupProps) {
  const [message, setMessage] = useState("")

  // Random motivational messages
  const messages = [
    "Great job! You're making excellent progress!",
    "Task crushed! Keep up the momentum!",
    "Another one bites the dust! You're on fire!",
    "Achievement unlocked! You're unstoppable!",
    "Fantastic work! Your productivity is soaring!",
    "Mission accomplished! What's next on your conquest?",
    "You're on a roll! Nothing can stop you now!",
    "Success! Your dedication is paying off!",
  ]

  useEffect(() => {
    if (open) {
      // Select a random message
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setMessage(randomMessage)

      // Trigger confetti effect
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // Burst confetti from both sides
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"],
        })
      }, 250)
    }
  }, [open, messages])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] text-center">
        <DialogHeader className="flex flex-col items-center">
          <PartyPopper className="h-16 w-16 text-primary mb-2 animate-bounce" />
          <DialogTitle className="text-2xl">Hurray! Task Completed!</DialogTitle>
          <DialogDescription className="text-lg">{message}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            You've completed: <span className="text-primary">{taskTitle}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Keep up the great work! Your productivity is inspiring.</p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Continue Being Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
