"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Clock, LayoutDashboard, List, Plus, Search, Settings, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskDialog } from "@/components/task-dialog"
import { TaskItem } from "@/components/task-item"
import { TaskList } from "@/components/task-list"
import { useToast } from "@/hooks/use-toast"
import type { Task, TaskStatus } from "@/lib/types"
import { generateId } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CelebrationPopup } from "@/components/celebration-popup"
import { NotificationCenter } from "@/components/notification-center"
import { OnboardingDialog } from "@/components/onboarding-dialog"
import { ClockIcon } from "@/components/clock-icon"

export default function TasksPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get("status")
  const tagFilter = searchParams.get("tag")

  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [profileName, setProfileName] = useState("John Doe")
  const [profileEmail, setProfileEmail] = useState("john@example.com")
  const [profileAvatar, setProfileAvatar] = useState("/avatars/male-avatar-1.png")
  const [showCelebration, setShowCelebration] = useState(false)
  const [completedTaskTitle, setCompletedTaskTitle] = useState("")

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 600))

      try {
        const savedTasks = localStorage.getItem("tasks")
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks))
        } else {
          // Initialize with empty tasks array instead of demo tasks
          setTasks([])
          localStorage.setItem("tasks", JSON.stringify([]))
        }
      } catch (error) {
        console.error("Failed to parse saved tasks:", error)
        setTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks, isLoading])

  // Apply filters based on URL parameters
  useEffect(() => {
    if (statusFilter) {
      setActiveTab(statusFilter)
    }
  }, [statusFilter])

  // Apply default view preference from settings
  useEffect(() => {
    const defaultView = localStorage.getItem("defaultTaskView")
    if (defaultView === "list" || defaultView === "board") {
      setActiveTab(defaultView === "board" ? "all" : defaultView)
    }
  }, [])

  // Load profile information
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setProfileName(profile.name || "John Doe")
        setProfileEmail(profile.email || "john@example.com")
        setProfileAvatar(profile.avatar || "/avatars/male-avatar-1.png")
      } catch (error) {
        console.error("Failed to parse saved profile:", error)
      }
    }
  }, [])

  // Show loading screen while data is being loaded
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-6">
          <ClockIcon size={96} className="text-primary" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">TickTickGo</h2>
            <p className="text-muted-foreground animate-pulse">Loading your tasks...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleCreateTask = (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }

    setTasks((prevTasks) => [...prevTasks, newTask])
    setIsTaskDialogOpen(false)
    toast({
      title: "Task created",
      description: "Your task has been created successfully.",
    })
  }

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? { ...updatedTask } : task)))
    setEditingTask(null)
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    })
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
    })
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    // Find the task being updated
    const taskToUpdate = tasks.find((task) => task.id === taskId)

    // Check if the task is being marked as completed
    const isBeingCompleted = taskToUpdate && taskToUpdate.status !== "completed" && newStatus === "completed"

    // Update the task status
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            status: newStatus,
          }

          // Add completedAt timestamp if the task is marked as completed
          if (newStatus === "completed" && !task.completedAt) {
            updatedTask.completedAt = new Date().toISOString()
          }

          // Remove completedAt timestamp if the task is moved from completed
          if (newStatus !== "completed" && task.completedAt) {
            delete updatedTask.completedAt
          }

          return updatedTask
        }
        return task
      }),
    )

    // Show celebration popup if the task is being marked as completed
    if (isBeingCompleted && taskToUpdate) {
      setCompletedTaskTitle(taskToUpdate.title)
      setShowCelebration(true)
    }

    toast({
      title: "Status updated",
      description: `Task moved to ${newStatus.replace("-", " ")}.`,
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const handleNotificationTaskClick = (taskId: string) => {
    // Find the task
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // Navigate to the appropriate tab based on task status
    if (task.status === "todo") {
      setActiveTab("todo")
    } else if (task.status === "in-progress") {
      setActiveTab("in-progress")
    } else if (task.status === "completed") {
      setActiveTab("completed")
    } else {
      setActiveTab("all")
    }

    // Open the task for editing
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  const filteredTasks = tasks.filter((task) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    // Filter by status tab
    const matchesStatus = activeTab === "all" || task.status === activeTab

    // Filter by tag if specified in URL
    const matchesTag = !tagFilter || (task.tags && task.tags.includes(tagFilter))

    return matchesSearch && matchesStatus && matchesTag
  })

  // Group tasks by status for the board view
  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  // Get all unique tags from tasks
  const allTags = Array.from(new Set(tasks.flatMap((task) => task.tags || [])))

  // Calculate completion rate for progress bar
  const totalTasks = tasks.length
  const completedTasksCount = tasks.filter((task) => task.status === "completed").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0

  // Fix the overdue tasks logic in the tasks page as well
  const overdueTasks = tasks.filter((task) => {
    if (task.status === "completed") return false

    const dueDate = new Date(task.dueDate)
    const now = new Date()

    // Set both dates to midnight for proper comparison
    dueDate.setHours(0, 0, 0, 0)
    const todayMidnight = new Date(now)
    todayMidnight.setHours(0, 0, 0, 0)

    return dueDate < todayMidnight
  })

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ClockIcon size={28} className="text-primary" />
          <span className="font-bold text-xl">TickTickGo</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <form className="hidden md:flex">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="w-[200px] pl-8 md:w-[240px] lg:w-[320px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
          <NotificationCenter tasks={tasks} onTaskClick={handleNotificationTaskClick} />
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
                  <span>Total Tasks</span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>Completed</span>
                  <span className="font-medium">{tasks.filter((t) => t.status === "completed").length}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>In Progress</span>
                  <span className="font-medium">{tasks.filter((t) => t.status === "in-progress").length}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>To Do</span>
                  <span className="font-medium">{tasks.filter((t) => t.status === "todo").length}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
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
                  className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-accent-foreground"
                >
                  <List className="h-4 w-4" />
                  Tasks
                </Link>
                <Link
                  href="/tasks?status=todo"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  To Do
                </Link>
                <Link
                  href="/tasks?status=in-progress"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Clock className="h-4 w-4" />
                  In Progress
                </Link>
                <Link
                  href="/tasks?status=completed"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </Link>
                <div className="mt-6">
                  <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground">Tags</h3>
                  <div className="space-y-1">
                    {allTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/tasks?tag=${encodeURIComponent(tag)}`}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground ${
                          tagFilter === tag ? "bg-accent text-accent-foreground" : ""
                        }`}
                      >
                        <Tag className="h-4 w-4" />
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-lg md:text-2xl">Tasks</h1>
              <div className="ml-auto flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">Completion:</div>
                  <div className="h-2 w-40 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${completionRate}%` }}></div>
                  </div>
                  <div className="text-sm font-medium">{completionRate}%</div>
                </div>
                <Button
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => {
                    setEditingTask(null)
                    setIsTaskDialogOpen(true)
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Task</span>
                </Button>
              </div>
            </div>
            <Tabs defaultValue="all" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="todo">To Do</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">To Do</CardTitle>
                      <CardDescription className="text-xs">Tasks that need to be started</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <TaskList
                        tasks={todoTasks}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        status="todo"
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs"
                        onClick={() => {
                          setEditingTask(null)
                          setIsTaskDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Task
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                      <CardDescription className="text-xs">Tasks currently being worked on</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <TaskList
                        tasks={inProgressTasks}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        status="in-progress"
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs"
                        onClick={() => {
                          setEditingTask(null)
                          setIsTaskDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Task
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Completed</CardTitle>
                      <CardDescription className="text-xs">Tasks that have been finished</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <TaskList
                        tasks={completedTasks}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        status="completed"
                      />
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs"
                        onClick={() => {
                          setEditingTask(null)
                          setIsTaskDialogOpen(true)
                        }}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Task
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="todo" className="space-y-4">
                <div className="space-y-2">
                  {todoTasks.length > 0 ? (
                    todoTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-lg font-medium">No tasks to do</h3>
                        <p className="text-sm text-muted-foreground">Create a new task to get started.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setEditingTask(null)
                            setIsTaskDialogOpen(true)
                          }}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          New Task
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="in-progress" className="space-y-4">
                <div className="space-y-2">
                  {inProgressTasks.length > 0 ? (
                    inProgressTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-lg font-medium">No tasks in progress</h3>
                        <p className="text-sm text-muted-foreground">Move a task to in progress or create a new one.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setEditingTask(null)
                            setIsTaskDialogOpen(true)
                          }}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          New Task
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <div className="space-y-2">
                  {completedTasks.length > 0 ? (
                    completedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  ) : (
                    <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-lg font-medium">No completed tasks</h3>
                        <p className="text-sm text-muted-foreground">Complete a task to see it here.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setEditingTask(null)
                            setIsTaskDialogOpen(true)
                          }}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          New Task
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={editingTask}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
      />
      <CelebrationPopup open={showCelebration} onOpenChange={setShowCelebration} taskTitle={completedTaskTitle} />
      <OnboardingDialog />
    </div>
  )
}
