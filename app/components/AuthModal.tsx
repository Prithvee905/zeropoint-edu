'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const router = useRouter()

    if (!isOpen) return null

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                onClose()
                router.refresh()
            } else {
                const { error } = await supabase.auth.signUp({ 
                    email, 
                    password,
                    options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
                })
                if (error) throw error
                setMessage("Success! Check your email for the confirmation link.")
            }
        } catch (err: any) {
            setMessage(err.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.7)",
            animation: "fadeIn 0.2s ease-out"
        }} onClick={onClose}>
            
            <div 
                style={{
                    width: "100%", maxWidth: "440px",
                    background: "linear-gradient(145deg, #16161e 0%, var(--bg) 100%)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: "28px", 
                    boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 40px rgba(124,58,237,0.15)",
                    position: "relative", overflow: "hidden",
                    animation: "scalePop 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
                className="auth-modal-card"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button for touch */}
                <button 
                    onClick={onClose}
                    style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(var(--invert-rgb),0.05)", border: "none", color: "var(--text-3)", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                <div style={{ padding: "48px 40px" }} className="auth-modal-content">
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <div style={{ inlineSize: "52px", height: "52px", background: "linear-gradient(135deg, var(--purple), #4f46e5)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "22px", fontWeight: "900", color: "var(--text-1)", boxShadow: "0 12px 24px rgba(124,58,237,0.35)" }}>Z</div>
                        <h2 style={{ fontSize: "26px", fontWeight: "900", color: "var(--text-1)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                            {isLogin ? "Welcome Back" : "Start Journey"}
                        </h2>
                        <p style={{ fontSize: "14px", color: "var(--text-3)", lineHeight: "1.5" }}>
                            {isLogin ? "Continue where you left off" : "Create your account to save progress"}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Email Address</label>
                            <input 
                                type="email" required
                                className="input" placeholder="name@example.com"
                                value={email} onChange={e => setEmail(e.target.value)}
                                style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "rgba(var(--invert-rgb),0.02)", border: "1px solid rgba(var(--invert-rgb),0.06)", fontSize: "15px" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "var(--text-3)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Password</label>
                            <input 
                                type="password" required
                                className="input" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                style={{ width: "100%", padding: "16px", borderRadius: "14px", background: "rgba(var(--invert-rgb),0.02)", border: "1px solid rgba(var(--invert-rgb),0.06)", fontSize: "15px" }}
                            />
                        </div>

                        {message && (
                            <p style={{
                                fontSize: "13px", color: message.includes("Success") ? "var(--green-light)" : "#f87171",
                                padding: "14px", background: message.includes("Success") ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                                borderRadius: "12px", textAlign: "center", border: "1px solid" + (message.includes("Success") ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"),
                                animation: "fadeIn 0.3s"
                            }}>
                                {message}
                            </p>
                        )}

                        <button 
                            type="submit" disabled={loading}
                            className="btn-primary" 
                            style={{ width: "100%", padding: "16px", borderRadius: "16px", fontSize: "15px", fontWeight: "800", marginTop: "8px", boxShadow: "0 12px 24px rgba(124,58,237,0.3)" }}
                        >
                            {loading ? <span className="spinner" style={{ width: "16px", height: "16px" }} /> : (isLogin ? "Sign In" : "Create Account")}
                        </button>
                    </form>

                    {/* Footer Toggle */}
                    <div style={{ textAlign: "center", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(var(--invert-rgb),0.04)" }}>
                        <p style={{ fontSize: "14px", color: "var(--text-3)" }}>
                            {isLogin ? "New to Zeropoint?" : "Member already?"}{" "}
                            <button 
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setMessage("") }}
                                style={{ background: "none", border: "none", color: "var(--purple-light)", fontWeight: "800", cursor: "pointer", padding: "0 4px" }}
                            >
                                {isLogin ? "Sign Up" : "Log In"}
                            </button>
                        </p>
                    </div>
                </div>

                <style>{`
                    @media (max-width: 480px) {
                        .auth-modal-content { padding: 40px 24px !important; }
                        .auth-modal-card { border-radius: 24px !important; }
                    }
                `}</style>
            </div>
        </div>
    )
}
