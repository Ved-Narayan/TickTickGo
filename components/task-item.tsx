"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CheckCircle2, Clock, Edit, Flag, MoreHorizontal, Trash2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task, TaskStatus } from "@/lib/types"

interface TaskItemProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  compact?: boolean
}

export function TaskItem({ task, onStatusChange, onEdit, onDelete, compact = false }: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-green-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "todo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isDueSoon = () => {
    if (task.status === "completed") return false

    const dueDate = new Date(task.dueDate)
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays <= 1 && diffDays >= 0
  }

  const isOverdue = () => {
    if (task.status === "completed") return false

    const dueDate = new Date(task.dueDate)
    const now = new Date()

    return dueDate < now
  }

  return (
    <div
      className={`group relative rounded-md border p-3 ${
        task.status === "completed" ? "bg-muted/50" : "bg-card"
      } ${compact ? "py-2" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-5 w-5 rounded-full ${
              task.status === "completed" ? "text-green-500" : "text-muted-foreground"
            }`}
            onClick={() => {
              onStatusChange(task.id, task.status === "completed" ? "todo" : "completed")
            }}
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="sr-only">Toggle completion</span>
          </Button>
          <div className="flex-1">
            <h3 className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </h3>
            {!compact && task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {task.status !== "todo" && (
              <DropdownMenuItem onClick={() => onStatusChange(task.id, "todo")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as To Do
              </DropdownMenuItem>
            )}
            {task.status !== "in-progress" && (
              <DropdownMenuItem onClick={() => onStatusChange(task.id, "in-progress")}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as In Progress
              </DropdownMenuItem>
            )}
            {task.status !== "completed" && (
              <DropdownMenuItem onClick={() => onStatusChange(task.id, "completed")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => onDelete(task.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap items-center gap-2 ml-10">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          <span
            className={`${isOverdue() ? "text-red-500 font-medium" : ""} ${
              isDueSoon() ? "text-amber-500 font-medium" : ""
            }`}
          >
            {format(new Date(task.dueDate), "MMM d, h:mm a")}
            {isOverdue() && " (Overdue)"}
            {isDueSoon() && !isOverdue() && " (Due Soon)"}
          </span>
        </div>
        <Badge variant="outline" className={getStatusColor(task.status)}>
          {task.status === "in-progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </Badge>
        <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
        {!compact &&
          task.tags &&
          task.tags.map((tag) => (
            <Link key={tag} href={`/tasks?tag=${encodeURIComponent(tag)}`} passHref>
              <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
                {tag}
              </Badge>
            </Link>
          ))}
      </div>
    </div>
  )
}
