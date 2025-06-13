"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Task } from "@/lib/types"

interface NotificationCenterProps {
  tasks: Task[]
  onTaskClick: (taskId: string) => void
}

// Update the NotificationCenter component to implement "Mark all as read" functionality
export function NotificationCenter({ tasks, onTaskClick }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Array<{ task: Task; type: string }>>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Check for notifications whenever tasks change
  useEffect(() => {
    const newNotifications: Array<{ task: Task; type: string }> = []

    // Get today's date (without time)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get tomorrow's date
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check for tasks due today
    tasks.forEach((task) => {
      if (task.status === "completed") return

      const dueDate = new Date(task.dueDate)
      const dueDay = new Date(dueDate)
      dueDay.setHours(0, 0, 0, 0)

      // Task is due today
      if (dueDay.getTime() === today.getTime()) {
        newNotifications.push({ task, type: "due-today" })
      }
      // Task is overdue
      else if (dueDay.getTime() < today.getTime()) {
        newNotifications.push({ task, type: "overdue" })
      }
      // Task is due tomorrow
      else if (dueDay.getTime() === tomorrow.getTime()) {
        newNotifications.push({ task, type: "due-tomorrow" })
      }
      // High priority tasks due within 3 days
      else if (task.priority === "high" && dueDay.getTime() <= today.getTime() + 3 * 24 * 60 * 60 * 1000) {
        newNotifications.push({ task, type: "high-priority" })
      }
    })

    setNotifications(newNotifications)
    setUnreadCount(newNotifications.length)
  }, [tasks])

  const getNotificationMessage = (type: string, task: Task) => {
    switch (type) {
      case "due-today":
        return `Due today: "${task.title}"`
      case "overdue":
        return `Overdue: "${task.title}"`
      case "due-tomorrow":
        return `Due tomorrow: "${task.title}"`
      case "high-priority":
        return `High priority: "${task.title}"`
      default:
        return `Task: "${task.title}"`
    }
  }

  const getNotificationTime = (task: Task) => {
    const dueDate = new Date(task.dueDate)
    return format(dueDate, "MMM d, h:mm a")
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "due-today":
        return "bg-amber-100 text-amber-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "due-tomorrow":
        return "bg-blue-100 text-blue-800"
      case "high-priority":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleNotificationClick = (taskId: string) => {
    onTaskClick(taskId)
    setIsOpen(false)
  }

  const handleMarkAllAsRead = () => {
    setUnreadCount(0)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {notifications.length > 0
                ? `You have ${notifications.length} unread notification${notifications.length !== 1 ? "s" : ""}`
                : "No new notifications"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {notifications.length > 0 ? (
              notifications.map(({ task, type }, index) => (
                <DropdownMenuItem
                  key={`${task.id}-${index}`}
                  className="cursor-pointer"
                  onClick={() => handleNotificationClick(task.id)}
                >
                  <div className="flex flex-col space-y-1 py-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{getNotificationMessage(type, task)}</p>
                      <Badge variant="outline" className={getNotificationColor(type)}>
                        {type.replace("-", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Due: {getNotificationTime(task)}</p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="flex h-[100px] items-center justify-center">
                <p className="text-sm text-muted-foreground">All caught up! No pending notifications.</p>
              </div>
            )}
          </DropdownMenuGroup>
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer justify-center" onClick={handleMarkAllAsRead}>
          Mark all as read
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
