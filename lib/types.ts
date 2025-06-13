export type TaskStatus = "todo" | "in-progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  completedAt?: string
  tags: string[]
  createdAt: string
}
