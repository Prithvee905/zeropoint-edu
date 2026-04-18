'use client'

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function NavProgress() {
  const bar = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const timer = useRef<any>(null)

  useEffect(() => {
    const el = bar.current
    if (!el) return

    // Reset
    el.style.transition = "none"
    el.style.width = "0%"
    el.style.opacity = "1"

    // Start fill
    requestAnimationFrame(() => {
      el.style.transition = "width 0.4s cubic-bezier(0.16,1,0.3,1)"
      el.style.width = "80%"
    })

    // Complete
    timer.current = setTimeout(() => {
      el.style.transition = "width 0.2s ease"
      el.style.width = "100%"
      setTimeout(() => {
        el.style.transition = "opacity 0.3s ease"
        el.style.opacity = "0"
      }, 200)
    }, 350)

    return () => clearTimeout(timer.current)
  }, [pathname])

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, pointerEvents: "none" }}>
      <div
        ref={bar}
        style={{
          height: "2px",
          width: "0%",
          opacity: 0,
          background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
          boxShadow: "0 0 8px rgba(124,58,237,0.6)",
          borderRadius: "0 2px 2px 0",
        }}
      />
    </div>
  )
}
