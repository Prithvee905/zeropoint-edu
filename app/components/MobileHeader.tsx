'use client'

import Link from "next/link"
import { useAuth } from "./AuthProvider"

export default function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
    const { user, openLogin } = useAuth()

    return (
        <header style={{
            position: "fixed", top: 0, left: 0, right: 0, 
            height: "calc(64px + env(safe-area-inset-top))",
            paddingTop: "env(safe-area-inset-top)",
            background: "rgba(var(--bg-rgb),0.85)", backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(var(--invert-rgb),0.08)",
            display: "none", alignItems: "center", justifyContent: "space-between",
            paddingLeft: "20px", paddingRight: "20px", zIndex: 100,
        }} className="mobile-only-flex">
            <button 
                onClick={onMenuClick}
                style={{ 
                    background: "rgba(var(--invert-rgb),0.05)", border: "none", color: "var(--text-1)", 
                    width: "42px", height: "42px", borderRadius: "12px",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                    zIndex: 10
                }}
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            
            <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "linear-gradient(135deg, var(--purple), #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#fff" }}>Z</div>
                    <span style={{ fontSize: "14px", fontWeight: "900", color: "var(--text-1)", letterSpacing: "-0.03em" }}>Zeropoint</span>
                </Link>
            </div>

            <div style={{ zIndex: 10 }}>
                {user ? (
                    <Link href="/settings" style={{ textDecoration: "none" }}>
                        <div style={{ 
                            width: "38px", height: "38px", borderRadius: "12px", 
                            background: "linear-gradient(135deg, var(--purple), #4f46e5)", 
                            display: "flex", alignItems: "center", justifyContent: "center", 
                            fontSize: "13px", fontWeight: "900", color: "#fff",
                            boxShadow: "0 4px 12px rgba(124,58,237,0.2)"
                        }}>
                            {user.email?.[0].toUpperCase()}
                        </div>
                    </Link>
                ) : (
                    <button 
                        onClick={openLogin}
                        style={{ 
                            background: "rgba(var(--invert-rgb),0.05)", border: "none", color: "var(--text-1)", 
                            width: "42px", height: "42px", borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" 
                        }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </button>
                )}
            </div>
        </header>
    )
}
