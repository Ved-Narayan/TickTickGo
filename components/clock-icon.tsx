"use client"

import { useEffect, useState } from "react"

interface ClockIconProps {
  size?: number
  className?: string
}

export function ClockIcon({ size = 24, className = "" }: ClockIconProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const secondAngle = time.getSeconds() * 6 - 90 // 6 degrees per second, -90 to start at 12
  const minuteAngle = time.getMinutes() * 6 - 90 // 6 degrees per minute
  const hourAngle = (time.getHours() % 12) * 30 + time.getMinutes() * 0.5 - 90 // 30 degrees per hour + minute adjustment

  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" className="text-primary">
        {/* Clock face */}
        <circle cx="12" cy="12" r="10" fill="currentColor" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />

        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30 - 90
          const x1 = 12 + 8 * Math.cos((angle * Math.PI) / 180)
          const y1 = 12 + 8 * Math.sin((angle * Math.PI) / 180)
          const x2 = 12 + 9 * Math.cos((angle * Math.PI) / 180)
          const y2 = 12 + 9 * Math.sin((angle * Math.PI) / 180)

          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.6" />
        })}

        {/* Hour hand */}
        <line
          x1="12"
          y1="12"
          x2={12 + 5 * Math.cos((hourAngle * Math.PI) / 180)}
          y2={12 + 5 * Math.sin((hourAngle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Minute hand */}
        <line
          x1="12"
          y1="12"
          x2={12 + 7 * Math.cos((minuteAngle * Math.PI) / 180)}
          y2={12 + 7 * Math.sin((minuteAngle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Second hand */}
        <line
          x1="12"
          y1="12"
          x2={12 + 8 * Math.cos((secondAngle * Math.PI) / 180)}
          y2={12 + 8 * Math.sin((secondAngle * Math.PI) / 180)}
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Center dot */}
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </div>
  )
}
