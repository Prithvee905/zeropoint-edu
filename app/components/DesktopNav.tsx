'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"

const nav = [
  { href: "/dashboard", label: "Dashboard",  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg> },
  { href: "/roadmap",   label: "Roadmap",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: "/chat",      label: "AI Tutor",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: "/quiz",      label: "Quizzes",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 10 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { href: "/progress",  label: "Progress",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
]

export default function DesktopNav() {
  const path = usePathname()
  const router = useRouter()
  const { user, requireAuth, signOut, openLogin } = useAuth()

  const handleNav = (href: string) => {
    requireAuth(() => router.push(href))
  }

  return (
    <header className="desktop-only-flex" style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "72px",
      background: "rgba(12,12,14,0.85)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      zIndex: 900, display: "flex", justifyContent: "center"
    }}>
      <div style={{
          width: "100%", maxWidth: "1280px", padding: "0 60px",
          display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: "700", color: "#fff",
            }}>Z</div>
            <span style={{ fontSize: "18px", fontWeight: "900", color: "#f0f0f4", letterSpacing: "-0.02em" }}>
              Zeropoint
            </span>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {nav.map(item => {
              const active = path === item.href || path?.startsWith(item.href + "/")
              return (
                <button key={item.href} onClick={() => handleNav(item.href)} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "8px 16px", borderRadius: "99px",
                    fontSize: "13px", fontWeight: active ? "700" : "600",
                    color: active ? "#fff" : "#8b8b99",
                    background: active ? "rgba(124,58,237,0.15)" : "transparent",
                    border: "none", cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.04)" } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "#8b8b99"; e.currentTarget.style.background = "transparent" } }}
                >
                    <span style={{ color: active ? "#a78bfa" : "currentColor" }}>{item.icon}</span>
                    {item.label}
                </button>
              )
            })}
          </nav>

          {/* User Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {user ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "900", color: "#fff" }}>
                              {user.email?.[0].toUpperCase()}
                          </div>
                          <div>
                              <p style={{ fontSize: "12px", fontWeight: "800", color: "#f0f0f4" }}>{user.email?.split('@')[0]}</p>
                          </div>
                      </div>
                      <button onClick={signOut} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "12px" }}>Sign Out</button>
                  </div>
              ) : (
                  <button className="btn-primary" onClick={openLogin} style={{ padding: "10px 24px", borderRadius: "99px", fontSize: "13px" }}>
                      Access Study Hub
                  </button>
              )}
          </div>
      </div>
    </header>
  )
}
