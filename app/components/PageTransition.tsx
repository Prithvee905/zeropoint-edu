'use client'

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [render, setRender] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Quick fade out then back in on route change
    setVisible(false)
    const t = setTimeout(() => {
      setVisible(true)
    }, 80)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(6px)",
      transition: "opacity 0.28s cubic-bezier(0.16,1,0.3,1), transform 0.28s cubic-bezier(0.16,1,0.3,1)",
      willChange: "opacity, transform",
    }}>
      {children}
    </div>
  )
}
