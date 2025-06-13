import { ClockIcon } from "@/components/clock-icon"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-6">
        <ClockIcon className="w-24 h-24 text-primary" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">TickTickGo</h2>
          <p className="text-muted-foreground animate-pulse">Loading settings...</p>
        </div>
      </div>
    </div>
  )
}
