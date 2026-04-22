'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

type Flashcard = { front: string; back: string }

export default function FlashcardsPage() {
    const { topicId } = useParams()
    const router = useRouter()

    const [flashcards, setFlashcards] = useState<Flashcard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [known, setKnown] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)
    const [sessionComplete, setSessionComplete] = useState(false)

    useEffect(() => { if (topicId) fetchFlashcards() }, [topicId])

    const fetchFlashcards = async () => {
        try {
            const res = await fetch("/api/flashcards/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topicId })
            })
            const data = await res.json()
            if (data.flashcards) setFlashcards(data.flashcards)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const markKnown = () => {
        setKnown(prev => new Set([...prev, currentIndex]))
        next()
    }

    const next = () => {
        setIsFlipped(false)
        setTimeout(() => {
            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(prev => prev + 1)
            } else {
                setSessionComplete(true)
            }
        }, 300)
    }

    // ── LOADING STATE ──────────────────────────────────────
    if (loading) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
            <div className="spinner" />
            <p style={{ color: "var(--text-3)", fontSize: "13px" }}>Generating flashcards...</p>
        </div>
    )

    // ── SESSION COMPLETE ───────────────────────────────────
    if (sessionComplete) {
        const knownCount = known.size
        const percent = Math.round((knownCount / flashcards.length) * 100)
        return (
            <div className="fade-up" style={{ maxWidth: "480px", margin: "60px auto", textAlign: "center" }}>
                <div className="card" style={{ padding: "48px 40px", position: "relative", overflow: "hidden" }}>
                    
                    {/* Background glow */}
                    <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
                    
                    <div style={{ position: "relative" }}>
                        {/* Icon */}
                        <div style={{ width: "72px", height: "72px", margin: "0 auto 24px", borderRadius: "20px", background: "linear-gradient(135deg, var(--purple), #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" }}>
                            🎉
                        </div>
                        
                        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-1)", marginBottom: "8px" }}>Session Complete!</h2>
                        <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "32px" }}>
                            Great work! You mastered {knownCount} out of {flashcards.length} cards.
                        </p>

                        {/* Score ring */}
                        <div style={{ width: "120px", height: "120px", margin: "0 auto 32px", position: "relative" }}>
                            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(var(--invert-rgb),0.06)" strokeWidth="8" />
                                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${percent * 3.27} ${327 - percent * 3.27}`}
                                    style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1)" }}
                                />
                                <defs>
                                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="var(--purple)" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-1)" }}>{percent}%</span>
                                <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em" }}>Score</span>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button className="btn-primary" onClick={() => router.push(`/topic/${topicId}`)}
                                style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: "700" }}>
                                ← Back to Lesson
                            </button>
                            <button className="btn-secondary" onClick={() => { setCurrentIndex(0); setIsFlipped(false); setKnown(new Set()); setSessionComplete(false) }}
                                style={{ width: "100%", padding: "14px", fontSize: "13px" }}>
                                Practice Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── NO CARDS ───────────────────────────────────────────
    if (flashcards.length === 0) return (
        <div style={{ textAlign: "center", paddingTop: "80px", color: "var(--text-3)" }}>No flashcards generated.</div>
    )

    const card = flashcards[currentIndex]

    // ── MAIN FLASHCARD VIEW ────────────────────────────────
    return (
        <div className="fade-up" style={{ maxWidth: "560px", margin: "0 auto" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "4px" }}>Flashcards</h1>
                    <p style={{ fontSize: "12px", color: "var(--text-3)" }}>Tap the card to flip it</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "22px", fontWeight: "800", color: "var(--purple-light)" }}>{currentIndex + 1}</span>
                    <span style={{ fontSize: "14px", color: "var(--text-4)" }}>/</span>
                    <span style={{ fontSize: "14px", color: "var(--text-3)" }}>{flashcards.length}</span>
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: "3px", background: "rgba(var(--invert-rgb),0.06)", borderRadius: "4px", marginBottom: "32px", overflow: "hidden" }}>
                <div style={{
                    height: "100%",
                    width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                    background: "linear-gradient(90deg, var(--purple), #06b6d4)",
                    borderRadius: "4px",
                    transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
                    boxShadow: "0 0 12px rgba(124,58,237,0.4)",
                }} />
            </div>

            {/* Card */}
            <div
                onClick={() => setIsFlipped(f => !f)}
                style={{ perspective: "1200px", cursor: "pointer", marginBottom: "24px" }}
            >
                <div style={{
                    position: "relative",
                    width: "100%",
                    height: "320px",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}>
                    {/* FRONT */}
                    <div style={{
                        position: "absolute", inset: 0,
                        backfaceVisibility: "hidden",
                        borderRadius: "20px",
                        background: "linear-gradient(145deg, var(--bg-raised) 0%, #16162a 100%)",
                        border: "1px solid rgba(124,58,237,0.15)",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        padding: "40px 32px",
                        textAlign: "center",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(var(--invert-rgb),0.05)",
                    }}>
                        <span style={{
                            fontSize: "10px", fontWeight: "700", color: "var(--purple)",
                            textTransform: "uppercase", letterSpacing: "0.15em",
                            marginBottom: "20px",
                            padding: "5px 14px", borderRadius: "6px",
                            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.15)",
                        }}>Question</span>
                        <p style={{ fontSize: "20px", fontWeight: "600", color: "#e0e0f0", lineHeight: "1.5" }}>
                            {card.front}
                        </p>
                        <p style={{ position: "absolute", bottom: "20px", fontSize: "11px", color: "var(--text-4)" }}>
                            Click to reveal →
                        </p>
                    </div>

                    {/* BACK */}
                    <div style={{
                        position: "absolute", inset: 0,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        borderRadius: "20px",
                        background: "linear-gradient(145deg, #1e1035 0%, #0f0f1a 100%)",
                        border: "1px solid rgba(124,58,237,0.25)",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        padding: "40px 32px",
                        textAlign: "center",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(124,58,237,0.08)",
                        overflow: "hidden",
                    }}>
                        {/* Subtle top glow */}
                        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "60%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)" }} />
                        
                        <span style={{
                            fontSize: "10px", fontWeight: "700", color: "#06b6d4",
                            textTransform: "uppercase", letterSpacing: "0.15em",
                            marginBottom: "20px",
                            padding: "5px 14px", borderRadius: "6px",
                            background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)",
                        }}>Answer</span>
                        <p style={{ fontSize: "17px", fontWeight: "500", color: "#c8c8d8", lineHeight: "1.7" }}>
                            {card.back}
                        </p>
                    </div>
                </div>
            </div>

            {/* Action buttons — only show when flipped */}
            {isFlipped && (
                <div className="fade-up" style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); next() }}
                        style={{
                            flex: 1, padding: "16px", borderRadius: "14px",
                            background: "rgba(var(--invert-rgb),0.04)",
                            border: "1px solid rgba(var(--invert-rgb),0.08)",
                            color: "var(--text-2)", fontSize: "14px", fontWeight: "600",
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 0.2s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        }}
                        onMouseEnter={e => { const t = e.currentTarget; t.style.background = "rgba(239,68,68,0.06)"; t.style.borderColor = "rgba(239,68,68,0.2)"; t.style.color = "#f87171" }}
                        onMouseLeave={e => { const t = e.currentTarget; t.style.background = "rgba(var(--invert-rgb),0.04)"; t.style.borderColor = "rgba(var(--invert-rgb),0.08)"; t.style.color = "var(--text-2)" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                        </svg>
                        Review Again
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); markKnown() }}
                        style={{
                            flex: 1, padding: "16px", borderRadius: "14px",
                            background: "linear-gradient(135deg, var(--purple), #4f46e5)",
                            border: "none",
                            color: "var(--text-1)", fontSize: "14px", fontWeight: "700",
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 0.2s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(124,58,237,0.5)"; e.currentTarget.style.transform = "translateY(-1px)" }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(124,58,237,0.3)"; e.currentTarget.style.transform = "translateY(0)" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Got It
                    </button>
                </div>
            )}

            {/* Dot indicators */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "28px" }}>
                {flashcards.map((_, i) => (
                    <div key={i} style={{
                        width: i === currentIndex ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background: known.has(i)
                            ? "var(--green-light)"
                            : i === currentIndex
                                ? "linear-gradient(90deg, var(--purple), #06b6d4)"
                                : "rgba(var(--invert-rgb),0.08)",
                        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                        ...(i === currentIndex ? { boxShadow: "0 0 10px rgba(124,58,237,0.4)" } : {}),
                    }} />
                ))}
            </div>
        </div>
    )
}
