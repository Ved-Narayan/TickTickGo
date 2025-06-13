"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, CheckCircle2, Clock, LayoutDashboard, List, Plus, Search, Settings, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TaskDialog } from "@/components/task-dialog"
import { TaskItem } from "@/components/task-item"
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

// Enhanced local storage management
const LOCAL_STORAGE_KEYS = {
  TASKS: "tasks",
  USER_PROFILE: "userProfile",
  USER_SETTINGS: "userSettings",
  USER_SESSION: "userSession",
  APP_STATE: "appState",
  ONBOARDING_COMPLETED: "hasCompletedOnboarding",
  LAST_VISIT: "lastVisit",
  TASK_STATS: "taskStats",
}

interface UserSession {
  lastActiveTab: string
  lastSearchQuery: string
  dashboardPreferences: {
    compactMode: boolean
    showCompletedTasks: boolean
  }
}

interface AppState {
  totalTasksCreated: number
  totalTasksCompleted: number
  streakDays: number
  lastCompletionDate: string | null
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [profileName, setProfileName] = useState("John Doe")
  const [profileEmail, setProfileEmail] = useState("john@example.com")
  const [profileAvatar, setProfileAvatar] = useState("/avatars/male-avatar-1.png")
  const [showCelebration, setShowCelebration] = useState(false)
  const [completedTaskTitle, setCompletedTaskTitle] = useState("")
  const [userSession, setUserSession] = useState<UserSession>({
    lastActiveTab: "all",
    lastSearchQuery: "",
    dashboardPreferences: {
      compactMode: false,
      showCompletedTasks: true,
    },
  })
  const [appState, setAppState] = useState<AppState>({
    totalTasksCreated: 0,
    totalTasksCompleted: 0,
    streakDays: 0,
    lastCompletionDate: null,
  })

  // Enhanced local storage functions
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error)
    }
  }

  const loadFromLocalStorage = (key: string, defaultValue: any = null) => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : defaultValue
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  // Load all data from localStorage on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 800))

      try {
        // Load tasks
        const savedTasks = loadFromLocalStorage(LOCAL_STORAGE_KEYS.TASKS, [])
        setTasks(savedTasks)

        // Load user profile
        const savedProfile = loadFromLocalStorage(LOCAL_STORAGE_KEYS.USER_PROFILE, {})
        if (savedProfile.name) setProfileName(savedProfile.name)
        if (savedProfile.email) setProfileEmail(savedProfile.email)
        if (savedProfile.avatar) setProfileAvatar(savedProfile.avatar)

        // Load user session
        const savedSession = loadFromLocalStorage(LOCAL_STORAGE_KEYS.USER_SESSION, {
          lastActiveTab: "all",
          lastSearchQuery: "",
          dashboardPreferences: {
            compactMode: false,
            showCompletedTasks: true,
          },
        })
        setUserSession(savedSession)

        // Load app state
        const savedAppState = loadFromLocalStorage(LOCAL_STORAGE_KEYS.APP_STATE, {
          totalTasksCreated: 0,
          totalTasksCompleted: 0,
          streakDays: 0,
          lastCompletionDate: null,
        })
        setAppState(savedAppState)

        // Update last visit timestamp
        saveToLocalStorage(LOCAL_STORAGE_KEYS.LAST_VISIT, new Date().toISOString())

        // Apply user preferences
        const savedSettings = loadFromLocalStorage(LOCAL_STORAGE_KEYS.USER_SETTINGS, {})
        if (savedSettings.appearance?.compactMode) {
          document.body.classList.add("compact-mode")
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && tasks.length >= 0) {
      // Save even empty array, but only after initial load
      saveToLocalStorage(LOCAL_STORAGE_KEYS.TASKS, tasks)
    }
  }, [tasks, isLoading])

  // Save user session whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(LOCAL_STORAGE_KEYS.USER_SESSION, userSession)
    }
  }, [userSession, isLoading])

  // Save app state whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(LOCAL_STORAGE_KEYS.APP_STATE, appState)
    }
  }, [appState, isLoading])

  // Update app statistics when tasks change
  useEffect(() => {
    if (!isLoading) {
      const totalCreated = tasks.length
      const totalCompleted = tasks.filter((task) => task.status === "completed").length

      setAppState((prev) => ({
        ...prev,
        totalTasksCreated: totalCreated,
        totalTasksCompleted: totalCompleted,
      }))
    }
  }, [tasks, isLoading])

  // Show loading screen while data is being loaded
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-6">
          <ClockIcon size={96} className="text-primary" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">TickTickGo</h2>
            <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
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

    // Update app state
    setAppState((prev) => ({
      ...prev,
      totalTasksCreated: prev.totalTasksCreated + 1,
    }))

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

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status: newStatus }

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

    // Update app state for completion
    if (isBeingCompleted) {
      setAppState((prev) => ({
        ...prev,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
        lastCompletionDate: new Date().toISOString(),
      }))
    }

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

    // Open the task for editing
    setEditingTask(task)
    setIsTaskDialogOpen(true)
  }

  // Calculate task statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length
  const todoTasks = tasks.filter((task) => task.status === "todo").length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Get tasks due today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tasksDueToday = tasks.filter((task) => {
    if (task.status === "completed") return false

    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    return dueDate.getTime() === today.getTime()
  })

  // Get overdue tasks
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

  // Get high priority tasks
  const highPriorityTasks = tasks.filter((task) => task.priority === "high" && task.status !== "completed")

  // Get recently completed tasks (last 7 days)
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 7)

  const recentlyCompletedTasks = tasks
    .filter((task) => task.status === "completed" && task.completedAt && new Date(task.completedAt) > lastWeek)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5)

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
              <Input type="search" placeholder="Search tasks..." className="w-[200px] pl-8 md:w-[240px] lg:w-[320px]" />
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
                  <span className="font-medium">{totalTasks}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>Completed</span>
                  <span className="font-medium">{completedTasks}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>In Progress</span>
                  <span className="font-medium">{inProgressTasks}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>To Do</span>
                  <span className="font-medium">{todoTasks}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>All Time Created</span>
                  <span className="font-medium">{appState.totalTasksCreated}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex justify-between w-full">
                  <span>All Time Completed</span>
                  <span className="font-medium">{appState.totalTasksCompleted}</span>
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
                  className="flex items-center gap-3 rounded-lg bg-accent px-3 py-2 text-accent-foreground"
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
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
              <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {todoTasks} to do, {inProgressTasks} in progress, {completedTasks} completed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-primary" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tasksDueToday.length}</div>
                  <p className="text-xs text-muted-foreground">{overdueTasks.length} overdue tasks</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">All Time Stats</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{appState.totalTasksCompleted}</div>
                  <p className="text-xs text-muted-foreground">{appState.totalTasksCreated} total created</p>
                </CardContent>
              </Card>
            </div>

            {/* Conditional layout based on whether there are tasks */}
            {totalTasks > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Due Today</CardTitle>
                    <CardDescription>Tasks that need your attention today</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      {tasksDueToday.length > 0 ? (
                        tasksDueToday.map((task) => (
                          <TaskItem
                            key={task.id}
                            task={task}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                            compact
                          />
                        ))
                      ) : (
                        <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                          <p className="text-sm text-muted-foreground">No tasks due today</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/tasks">View All Tasks</Link>
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>High Priority</CardTitle>
                    <CardDescription>Important tasks requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      {highPriorityTasks.length > 0 ? (
                        highPriorityTasks
                          .slice(0, 3)
                          .map((task) => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onStatusChange={handleStatusChange}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              compact
                            />
                          ))
                      ) : (
                        <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                          <p className="text-sm text-muted-foreground">No high priority tasks</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/tasks">View All Tasks</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <List className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Welcome to TickTickGo!</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  You don't have any tasks yet. Create your first task to get started with managing your productivity.
                </p>
                <Button
                  onClick={() => {
                    setEditingTask(null)
                    setIsTaskDialogOpen(true)
                  }}
                  className="mb-8"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Task
                </Button>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Overdue Tasks</CardTitle>
                  <CardDescription>Tasks that are past their due date</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    {overdueTasks.length > 0 ? (
                      overdueTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          compact
                        />
                      ))
                    ) : (
                      <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm text-muted-foreground">No overdue tasks</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/tasks">View All Tasks</Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recently Completed</CardTitle>
                  <CardDescription>Tasks you've completed in the last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    {recentlyCompletedTasks.length > 0 ? (
                      recentlyCompletedTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onEdit={handleEditTask}
                          onDelete={handleDeleteTask}
                          compact
                        />
                      ))
                    ) : (
                      <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed">
                        <p className="text-sm text-muted-foreground">No recently completed tasks</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/tasks?status=completed">View All Completed</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
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
