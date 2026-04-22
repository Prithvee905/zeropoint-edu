'use client'

import { useTheme } from "next-themes"
import { useAuth } from "../components/AuthProvider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
    const { theme, setTheme, systemTheme } = useTheme()
    const { user, signOut, requireAuth } = useAuth()
    const [mounted, setMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        requireAuth(() => {})
    }, [])

    if (!user || !mounted) return (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "20vh" }}>
            <div className="spinner" />
        </div>
    )

    return (
        <div className="fade-up" style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "60px" }}>
            <div style={{ marginBottom: "40px" }} className="mobile-header-spacing">
                <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: "900", letterSpacing: "-0.04em", marginBottom: "12px", color: "var(--text-1)" }}>Profile & Settings</h1>
                <p style={{ fontSize: "15px", color: "var(--text-3)", fontWeight: "500" }}>Manage your account, appearance, and study preferences.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="stagger">
                
                {/* Profile Card */}
                <section className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "18px", background: "linear-gradient(135deg, var(--purple), #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "900", color: "#ffffff", boxShadow: "0 10px 30px rgba(124,58,237,0.3)" }}>
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-1)", marginBottom: "4px" }}>{user.email?.split('@')[0]}</h2>
                            <p style={{ fontSize: "14px", color: "var(--text-3)" }}>{user.email}</p>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px", borderTop: "1px solid rgba(var(--invert-rgb),0.06)", paddingTop: "24px" }}>
                        <div style={{ flex: 1, padding: "16px", background: "rgba(var(--invert-rgb),0.02)", borderRadius: "14px" }}>
                            <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Account Type</p>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-1)" }}>Pro Student</p>
                        </div>
                        <div style={{ flex: 1, padding: "16px", background: "rgba(var(--invert-rgb),0.02)", borderRadius: "14px" }}>
                            <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Status</p>
                            <p style={{ fontSize: "15px", fontWeight: "700", color: "var(--green-light)" }}>Active</p>
                        </div>
                    </div>
                </section>

                {/* Appearance Settings */}
                <section className="card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-1)", marginBottom: "20px" }}>Appearance</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(var(--invert-rgb),0.02)", borderRadius: "14px", border: "1px solid rgba(var(--invert-rgb),0.04)" }}>
                            <div>
                                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-1)", marginBottom: "4px" }}>Color Theme</h4>
                                <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Select your preferred interface aesthetic.</p>
                            </div>
                            <div style={{ display: "flex", background: "rgba(var(--invert-rgb),0.04)", padding: "4px", borderRadius: "12px" }}>
                                {['system', 'light', 'dark'].map((t) => (
                                    <button 
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        style={{ 
                                            padding: "8px 16px", 
                                            borderRadius: "8px", 
                                            fontSize: "13px", 
                                            fontWeight: theme === t ? "800" : "600",
                                            background: theme === t ? "var(--bg-raised)" : "transparent",
                                            color: theme === t ? "var(--text-1)" : "var(--text-3)",
                                            boxShadow: theme === t ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                                            border: "none", cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s"
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </label>

                        <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(var(--invert-rgb),0.02)", borderRadius: "14px", border: "1px solid rgba(var(--invert-rgb),0.04)" }}>
                            <div>
                                <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-1)", marginBottom: "4px" }}>Animations</h4>
                                <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Reduce motion for accessibility.</p>
                            </div>
                            <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", accentColor: "var(--purple)" }} />
                        </label>
                    </div>
                </section>

                {/* Notifications & Preferences */}
                <section className="card" style={{ padding: "32px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-1)", marginBottom: "20px" }}>Study Preferences</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {[
                            { title: "Daily Reminders", desc: "Get notified when you have pending study segments." },
                            { title: "AI Tutor Proactivity", desc: "Allow AI tutor to suggest quizzes spontaneously." },
                            { title: "Weekly Insights", desc: "Receive a progress digest via email every Sunday." },
                        ].map((pref, i) => (
                            <label key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(var(--invert-rgb),0.02)", borderRadius: "14px", border: "1px solid rgba(var(--invert-rgb),0.04)" }}>
                                <div>
                                    <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-1)", marginBottom: "4px" }}>{pref.title}</h4>
                                    <p style={{ fontSize: "13px", color: "var(--text-3)" }}>{pref.desc}</p>
                                </div>
                                <input type="checkbox" defaultChecked={i !== 2} style={{ width: "20px", height: "20px", accentColor: "var(--purple)" }} />
                            </label>
                        ))}
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="card" style={{ padding: "32px", border: "1px solid rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.02)" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#f87171", marginBottom: "20px" }}>Session Management</h3>
                    <p style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "24px" }}>Securely terminate your active session across all tabs.</p>
                    
                    <button 
                        onClick={() => { signOut(); router.push("/") }}
                        style={{ padding: "14px 24px", background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "12px", fontSize: "14px", fontWeight: "800", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.15)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
                    >
                        Sign Out Completely
                    </button>
                </section>

            </div>
        </div>
    )
}
