'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

const nav = [
  { href: "/dashboard", label: "Dashboard",  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg> },
  { href: "/roadmap",   label: "Roadmap",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: "/chat",      label: "AI Tutor",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: "/quiz",      label: "Quizzes",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { href: "/progress",  label: "Progress",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside style={{
      width: "220px", minHeight: "100vh", flexShrink: 0,
      background: "#0c0c0e",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
      padding: "0",
    }}>

      {/* Logo */}
      <div style={{ padding: "24px 20px 16px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: "700", color: "#fff",
          }}>Z</div>
          <span style={{ fontSize: "15px", fontWeight: "600", color: "#f0f0f4", letterSpacing: "-0.02em" }}>
            Zeropoint
          </span>
        </Link>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 20px 12px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 10px" }}>
        {nav.map(item => {
          const active = path === item.href || path?.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none", display: "block", marginBottom: "2px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "9px",
                padding: "8px 10px", borderRadius: "7px",
                fontSize: "13px", fontWeight: active ? "500" : "400",
                color: active ? "#f0f0f4" : "#6b6b78",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                transition: "all 0.12s",
                cursor: "pointer",
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.color = "#c0c0cc"; }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6b6b78"; } }}
              >
                <span style={{ color: active ? "#a78bfa" : "currentColor", flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "16px 20px 24px" }}>
        <Link href="/onboarding" style={{ textDecoration: "none" }}>
          <div style={{
            padding: "9px 14px", borderRadius: "8px",
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.2)",
            fontSize: "13px", fontWeight: "500", color: "#a78bfa",
            textAlign: "center", cursor: "pointer",
            transition: "background 0.15s",
          }}>+ New Study Plan</div>
        </Link>
      </div>

    </aside>
  )
}