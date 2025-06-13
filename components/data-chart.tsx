"use client"

import { useEffect, useRef } from "react"

interface DataChartProps {
  type: "line" | "bar" | "pie"
  height?: number
  className?: string
}

export function DataChart({ type, height = 400, className }: DataChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvasRef.current.getBoundingClientRect()
    canvasRef.current.width = rect.width * dpr
    canvasRef.current.height = height * dpr
    ctx.scale(dpr, dpr)

    // Draw based on chart type
    if (type === "line") {
      drawLineChart(ctx, rect.width, height)
    } else if (type === "bar") {
      drawBarChart(ctx, rect.width, height)
    } else if (type === "pie") {
      drawPieChart(ctx, rect.width, height)
    }
  }, [type, height])

  const drawLineChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Generate random data
    const dataPoints = 12
    const data = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * (chartHeight - 50) + 50))
    const secondData = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * (chartHeight - 50) + 50))

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw grid lines
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.setLineDash([5, 5])

    for (let i = 1; i < 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
    }

    for (let i = 1; i < dataPoints; i++) {
      const x = padding + (chartWidth / dataPoints) * i
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
    }

    ctx.stroke()
    ctx.setLineDash([])

    // Draw first line
    ctx.beginPath()
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3

    for (let i = 0; i < dataPoints; i++) {
      const x = padding + (chartWidth / (dataPoints - 1)) * i
      const y = height - padding - data[i]

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Add gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)")
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(padding, height - padding)

    for (let i = 0; i < dataPoints; i++) {
      const x = padding + (chartWidth / (dataPoints - 1)) * i
      const y = height - padding - data[i]

      if (i === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.lineTo(width - padding, height - padding)
    ctx.closePath()
    ctx.fill()

    // Draw second line
    ctx.beginPath()
    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 3

    for (let i = 0; i < dataPoints; i++) {
      const x = padding + (chartWidth / (dataPoints - 1)) * i
      const y = height - padding - secondData[i]

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Draw data points
    for (let i = 0; i < dataPoints; i++) {
      const x = padding + (chartWidth / (dataPoints - 1)) * i

      // First line points
      const y1 = height - padding - data[i]
      ctx.beginPath()
      ctx.fillStyle = "#ffffff"
      ctx.arc(x, y1, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.arc(x, y1, 5, 0, Math.PI * 2)
      ctx.stroke()

      // Second line points
      const y2 = height - padding - secondData[i]
      ctx.beginPath()
      ctx.fillStyle = "#ffffff"
      ctx.arc(x, y2, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.arc(x, y2, 5, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw labels
    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    for (let i = 0; i < dataPoints; i++) {
      const x = padding + (chartWidth / (dataPoints - 1)) * i
      ctx.fillText(months[i], x, height - padding + 20)
    }

    // Draw legend
    const legendX = width - padding - 150
    const legendY = padding + 20

    ctx.fillStyle = "#3b82f6"
    ctx.fillRect(legendX, legendY, 15, 3)
    ctx.fillStyle = "#64748b"
    ctx.textAlign = "left"
    ctx.fillText("Revenue", legendX + 20, legendY + 5)

    ctx.fillStyle = "#10b981"
    ctx.fillRect(legendX, legendY + 20, 15, 3)
    ctx.fillStyle = "#64748b"
    ctx.fillText("Users", legendX + 20, legendY + 25)
  }

  const drawBarChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Generate random data
    const stages = ["Visitors", "Leads", "Qualified", "Proposals", "Negotiation", "Closed"]
    const data = [
      Math.floor(Math.random() * 100) + 80,
      Math.floor(Math.random() * 60) + 50,
      Math.floor(Math.random() * 40) + 30,
      Math.floor(Math.random() * 30) + 20,
      Math.floor(Math.random() * 20) + 10,
      Math.floor(Math.random() * 15) + 5,
    ]

    // Normalize data to fit chart height
    const maxValue = Math.max(...data)
    const normalizedData = data.map((value) => (value / maxValue) * (chartHeight - 50))

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw grid lines
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.setLineDash([5, 5])

    for (let i = 1; i < 5; i++) {
      const y = padding + (chartHeight / 5) * i
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
    }

    ctx.stroke()
    ctx.setLineDash([])

    // Draw bars
    const barWidth = (chartWidth / stages.length) * 0.6
    const barSpacing = (chartWidth / stages.length) * 0.4

    for (let i = 0; i < stages.length; i++) {
      const x = padding + i * (barWidth + barSpacing) + barSpacing / 2
      const barHeight = normalizedData[i]
      const y = height - padding - barHeight

      // Create gradient for bar
      const gradient = ctx.createLinearGradient(0, y, 0, height - padding)
      gradient.addColorStop(0, "#3b82f6")
      gradient.addColorStop(1, "#93c5fd")

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add value on top of bar
      ctx.fillStyle = "#64748b"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(data[i].toString(), x + barWidth / 2, y - 10)

      // Add label below bar
      ctx.fillText(stages[i], x + barWidth / 2, height - padding + 20)
    }

    // Draw y-axis labels
    ctx.fillStyle = "#64748b"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "right"

    for (let i = 0; i <= 5; i++) {
      const y = height - padding - i * (chartHeight / 5)
      const value = Math.round((i / 5) * maxValue)
      ctx.fillText(value.toString(), padding - 10, y + 5)
    }
  }

  const drawPieChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 60

    // Generate random data
    const sources = ["Organic Search", "Direct", "Social", "Referral", "Email"]
    const data = [
      Math.floor(Math.random() * 30) + 20,
      Math.floor(Math.random() * 20) + 15,
      Math.floor(Math.random() * 15) + 10,
      Math.floor(Math.random() * 10) + 5,
      Math.floor(Math.random() * 10) + 5,
    ]

    const total = data.reduce((sum, value) => sum + value, 0)

    // Colors for pie segments
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

    // Draw pie segments
    let startAngle = 0

    for (let i = 0; i < data.length; i++) {
      const sliceAngle = (2 * Math.PI * data[i]) / total

      ctx.beginPath()
      ctx.fillStyle = colors[i]
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.fill()

      // Draw segment border
      ctx.beginPath()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.closePath()
      ctx.stroke()

      // Calculate position for labels
      const midAngle = startAngle + sliceAngle / 2
      const labelRadius = radius * 0.7
      const labelX = centerX + labelRadius * Math.cos(midAngle)
      const labelY = centerY + labelRadius * Math.sin(midAngle)

      // Draw percentage labels
      const percentage = Math.round((data[i] / total) * 100)
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${percentage}%`, labelX, labelY)

      startAngle += sliceAngle
    }

    // Draw center circle (donut style)
    ctx.beginPath()
    ctx.fillStyle = "#ffffff"
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
    ctx.fill()

    // Draw legend
    const legendX = width - 150
    const legendY = height - 180

    ctx.font = "14px sans-serif"
    ctx.textAlign = "left"

    for (let i = 0; i < sources.length; i++) {
      const y = legendY + i * 25

      // Draw color box
      ctx.fillStyle = colors[i]
      ctx.fillRect(legendX, y, 15, 15)

      // Draw border
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 1
      ctx.strokeRect(legendX, y, 15, 15)

      // Draw label
      ctx.fillStyle = "#64748b"
      ctx.fillText(`${sources[i]} (${data[i]})`, legendX + 25, y + 12)
    }
  }

  return (
    <div className={className}>
      <canvas ref={canvasRef} style={{ width: "100%", height: `${height}px` }} />
    </div>
  )
}
