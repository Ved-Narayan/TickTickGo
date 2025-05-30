"use client"
import type { Task, TaskStatus } from "@/lib/types"
import { TaskItem } from "@/components/task-item"

interface TaskListProps {
  tasks: Task[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  status: TaskStatus
}

export function TaskList({ tasks, onStatusChange, onEdit, onDelete, status }: TaskListProps) {
  // Filter tasks by status
  const filteredTasks = tasks.filter((task) => task.status === status)

  return (
    <div className="space-y-2 min-h-[100px]">
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <TaskItem key={task.id} task={task} onStatusChange={onStatusChange} onEdit={onEdit} onDelete={onDelete} />
        ))
      ) : (
        <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">No tasks</p>
        </div>
      )}
    </div>
  )
}
