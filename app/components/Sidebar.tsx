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
      width: "100%", height: "100%", flexShrink: 0,
      background: "var(--bg)",
      borderRight: "1px solid rgba(var(--invert-rgb),0.06)",
      display: "flex", flexDirection: "column",
      padding: "0",
    }}>

      {/* Logo & Close */}
      <div style={{ 
          padding: "24px 20px 16px", 
          display: "flex", justifyContent: "space-between", alignItems: "center",
          height: "calc(64px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)"
      }}>
        <Link href="/" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, var(--purple), #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: "700", color: "var(--text-1)",
          }}>Z</div>
          <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-1)", letterSpacing: "-0.02em" }}>
            Zeropoint
          </span>
        </Link>
        
        {/* Mobile close button (Always on top layer) */}
        <button 
            className="mobile-close-btn" 
            onClick={onClose} 
            style={{ 
                background: "rgba(var(--invert-rgb),0.03)", border: "1px solid rgba(var(--invert-rgb),0.06)", 
                color: "var(--text-2)", cursor: "pointer", display: "none",
                width: "36px", height: "36px", borderRadius: "50%",
                alignItems: "center", justifyContent: "center"
            }}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px", marginLeft: "10px" }}>Study Hub</p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {nav.map(item => {
            const active = path === item.href || path?.startsWith(item.href + "/")
            return (
                <div key={item.href} onClick={() => handleNav(item.href)} style={{ textDecoration: "none", display: "block", cursor: "pointer" }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", borderRadius: "12px",
                    fontSize: "14px", fontWeight: active ? "700" : "500",
                    color: active ? "var(--text-1)" : "var(--text-3)",
                    background: active ? "rgba(124,58,237,0.15)" : "transparent",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                className="nav-item"
                >
                    <span style={{ color: active ? "var(--purple-light)" : "currentColor", flexShrink: 0, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                    {item.label}
                </div>
                </div>
            )
            })}
        </nav>
      </div>

      {/* User Section / Auth */}
      <div style={{ 
          padding: "20px 20px calc(24px + env(safe-area-inset-bottom))", 
          marginTop: "auto", borderTop: "1px solid rgba(var(--invert-rgb),0.05)", 
          background: "rgba(124,58,237,0.02)" 
      }}>
        {user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <Link href="/settings" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, var(--purple), #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "900", color: "#fff" }}>
                {user.email?.[0].toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                  <p style={{ fontSize: "13px", fontWeight: "800", color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email?.split('@')[0]}</p>
                  <p style={{ fontSize: "10px", color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              </div>
            </Link>
            <button 
              onClick={() => { signOut(); if (onClose) onClose(); }}
              style={{ width: "100%", padding: "12px", borderRadius: "14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)", color: "#f87171", fontSize: "13px", fontWeight: "800", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
            >
              Disconnect Session
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { openLogin(); if (onClose) onClose(); }}
            style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "var(--purple)", border: "none", color: "var(--text-1)", fontSize: "14px", fontWeight: "900", cursor: "pointer", boxShadow: "0 10px 20px rgba(124,58,237,0.3)", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            Access Study Hub
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
            .mobile-close-btn { display: flex !important; }
            .nav-item { padding: 14px 20px !important; font-size: 15px !important; }
        }
      `}</style>
    </aside>
  )
}