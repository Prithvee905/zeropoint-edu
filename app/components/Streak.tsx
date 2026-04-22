'use client'

import { useState, useEffect } from "react"

export default function Streak() {
  const [streak, setStreak] = useState(0)
  useEffect(() => { setStreak(Number(localStorage.getItem("studyStreak") || 0)) }, [])

  return (
    <div className="card" style={{ padding: "20px" }}>
      <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Study Streak</div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: "2.5rem", fontWeight: "700", color: streak > 0 ? "var(--text-1)" : "var(--text-4)", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {streak}
          </span>
          <span style={{ fontSize: "14px", color: "var(--text-3)", marginLeft: "6px" }}>days</span>
        </div>

        {/* Bars */}
        <div style={{ display: "flex", gap: "4px", alignItems: "flex-end" }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const lit = i < Math.min(streak, 7)
            return (
              <div key={i} style={{
                width: "6px", borderRadius: "3px",
                height: `${16 + i * 4}px`,
                background: lit ? `rgba(167,139,250,${0.4 + i * 0.08})` : "rgba(var(--invert-rgb),0.05)",
                transition: "background 0.3s",
              }} />
            )
          })}
        </div>
      </div>

      <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "12px" }}>
        {streak === 0 ? "Start studying to build your streak." : streak >= 7 ? "🔥 7-day streak achieved!" : `${7 - streak} more day${7 - streak !== 1 ? "s" : ""} to a 7-day streak.`}
      </p>
    </div>
  )
}