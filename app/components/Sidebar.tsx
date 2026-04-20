'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"

const nav = [
  { href: "/dashboard", label: "Dashboard",  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg> },
  { href: "/roadmap",   label: "Roadmap",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { href: "/chat",      label: "AI Tutor",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  { href: "/quiz",      label: "Quizzes",    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { href: "/progress",  label: "Progress",   icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
]

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const path = usePathname()
  const router = useRouter()
  const { user, requireAuth, signOut, openLogin } = useAuth()

  const handleNav = (href: string) => {
    requireAuth(() => {
        router.push(href)
        if (onClose) onClose()
    })
  }

  return (
    <aside style={{
      width: "240px", height: "100%", flexShrink: 0,
      background: "#0c0c0e",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex", flexDirection: "column",
      padding: "0",
    }}>

      {/* Logo & Close */}
      <div style={{ padding: "24px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
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
        
        {/* Mobile close button */}
        <button className="mobile-only-flex" onClick={onClose} style={{ background: "none", border: "none", color: "#52525e", cursor: "pointer", display: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 20px 12px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px" }}>
        {nav.map(item => {
          const active = path === item.href || path?.startsWith(item.href + "/")
          return (
            <div key={item.href} onClick={() => handleNav(item.href)} style={{ textDecoration: "none", display: "block", marginBottom: "4px", cursor: "pointer" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "10px",
                fontSize: "13.5px", fontWeight: active ? "600" : "500",
                color: active ? "#fff" : "#6b6b78",
                background: active ? "rgba(124,58,237,0.12)" : "transparent",
                border: active ? "1px solid rgba(124,58,237,0.15)" : "1px solid transparent",
                transition: "all 0.15s",
              }}
              className="nav-item"
              >
                <span style={{ color: active ? "#a78bfa" : "currentColor", flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </div>
            </div>
          )
        })}
      </nav>

      {/* User Section / Auth */}
      <div style={{ padding: "20px 16px 32px", marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.1)" }}>
        {user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "4px 8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#a78bfa" }}>
                {user.email?.[0].toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "#f0f0f4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email?.split('@')[0]}</p>
                  <p style={{ fontSize: "10px", color: "#52525e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => { signOut(); if (onClose) onClose(); }}
              style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.1)", color: "#f87171", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { openLogin(); if (onClose) onClose(); }}
            style={{ width: "100%", padding: "12px", borderRadius: "12px", background: "#7c3aed", border: "none", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 16px rgba(124,58,237,0.25)" }}
          >
            Sign In to Start
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
            .mobile-only-flex { display: flex !important; }
            .nav-item { padding: 14px 16px !important; font-size: 15px !important; }
        }
      `}</style>
    </aside>
  )
}