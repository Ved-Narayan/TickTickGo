import { ArrowDown, ArrowUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string
  description: string
  trend: "up" | "down" | "neutral"
}

export function MetricCard({ title, value, description, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === "up" && <ArrowUp className="mr-1 h-4 w-4 text-green-500" />}
          {trend === "down" && <ArrowDown className="mr-1 h-4 w-4 text-red-500" />}
          <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""}>
            {description}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
