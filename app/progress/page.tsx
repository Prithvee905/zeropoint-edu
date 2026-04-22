'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

type T = { id: string; title: string; day_number: number; status: string; quizScore: number|null; quizTotal: number|null; weak: string[]; updated_at: string }

export default function ProgressPage() {
  const [topics, setTopics] = useState<T[]>([])
  const [rm, setRm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [engagement, setEngagement] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

  useEffect(() => { 
    load()
    setStreak(Number(localStorage.getItem("studyStreak") || 0))
  }, [])

  const load = async () => {
    const id = localStorage.getItem("activeRoadmapId"); 
    if (!id) { setLoading(false); return }
    
    const { data: r } = await supabase.from("roadmaps").select("*").eq("id", id).single()
    setRm(r)
    
    const { data: ts } = await supabase.from("topics").select("id,title,day_number,status,updated_at").eq("roadmap_id", id).order("day_number")
    if (!ts) { setLoading(false); return }
    
    const enriched = await Promise.all(ts.map(async t => {
      const { data: a } = await supabase.from("quiz_attempts").select("score,total_questions,weak_concepts,completed_at").eq("topic_id", t.id).order("completed_at", { ascending: false }).limit(1)
      const x = a?.[0]
      return { ...t, quizScore: x?.score ?? null, quizTotal: x?.total_questions ?? null, weak: x?.weak_concepts ?? [], completed_at: x?.completed_at }
    }))

    const eng = [0, 0, 0, 0, 0, 0, 0]
    enriched.forEach(t => {
        if (t.status === 'completed' || t.quizScore !== null) {
            const dayIdx = new Date(t.updated_at).getDay()
            const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1
            eng[mappedIdx] += 1
        }
    })
    
    const normalizedEng = eng.map(v => Math.min((v / 5) * 100, 100))
    setEngagement(normalizedEng)
    setTopics(enriched); setLoading(false)
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "40vh", gap: "10px" }}>
        <div className="spinner" />
        <p style={{ fontSize: "12px", color: "var(--text-3)" }}>Loading analytics...</p>
    </div>
  )

  if (!rm && !loading) return (
    <div style={{ textAlign: "center", padding: "100px 20px" }} className="fade-up">
        <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px" }}>No activity record</h1>
        <p style={{ color: "var(--text-3)", maxWidth: "320px", margin: "0 auto 32px" }}>We'll start mapping your performance as soon as you generate a study plan.</p>
        <Link href="/onboarding" className="btn-primary" style={{ padding: "12px 24px", borderRadius: "12px", textDecoration: "none" }}>Get Started</Link>
    </div>
  )

  const comp = topics.filter(t => t.status === "completed").length
  const pct = topics.length ? Math.round((comp / topics.length) * 100) : 0
  const allWeak = Array.from(new Set(topics.flatMap(t => t.weak))).filter(Boolean)

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* Hero Header */}
      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px" }} className="mobile-stack">
            <div style={{ flex: 1 }}>
                <span className="badge badge-purple" style={{ marginBottom: "12px", fontSize: "10px" }}>Performance Engine</span>
                <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.5rem)", fontWeight: "900", letterSpacing: "-0.04em", marginBottom: "6px" }}>Insights</h1>
                <p style={{ fontSize: "14px", color: "var(--text-3)", fontWeight: "500" }}>Analyzing: <strong style={{ color: "var(--purple-light)" }}>{rm.subject}</strong></p>
            </div>
            <div style={{ textAlign: "right" }} className="mobile-full-width-text">
                <span style={{ fontSize: "11px", fontWeight: "900", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Current Streak</span>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--text-1)", marginTop: "4px" }}>{streak > 0 ? "🔥" : "💤"} {streak} Days</div>
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
        
        {/* Left Column: Visual Charts & Topics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Completion Chart */}
            <div className="card" style={{ padding: "clamp(20px, 4vw, 32px)" }}>
                <div>
                    <h2 style={{ fontSize: "11px", fontWeight: "900", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "12px" }}>Overall Progress</h2>
                    <p style={{ fontSize: "clamp(2rem, 8vw, 3.2rem)", fontWeight: "900", color: "var(--text-1)", letterSpacing: "-0.04em", lineHeight: "1" }}>{pct}<span style={{ fontSize: "1.5rem", color: "var(--text-4)" }}>%</span></p>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "24px" }}>
                    <div style={{ height: "40px", background: "rgba(var(--invert-rgb),0.02)", borderRadius: "12px", border: "1px solid rgba(var(--invert-rgb),0.06)", overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--purple), #06b6d4)", boxShadow: "0 0 30px rgba(124,58,237,0.3)", borderRadius: "0 12px 12px 0", transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-3)", textTransform: "uppercase", textAlign: "center" }}>
                        {comp} of {topics.length} Segments Mastered
                    </p>
                </div>
            </div>

            {/* Weekly Activity */}
            <div className="card" style={{ padding: "clamp(20px, 4vw, 24px)" }}>
                <h2 style={{ fontSize: "11px", fontWeight: "900", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "28px" }}>Weekly Engagement</h2>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "100px", gap: "8px" }}>
                    {engagement.map((h, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", flex: 1 }}>
                            <div style={{ 
                                width: "100%", maxWidth: "16px",
                                height: `${Math.max(h, 6)}%`, 
                                background: h > 0 ? "linear-gradient(180deg, var(--purple-light), var(--purple))" : "rgba(var(--invert-rgb),0.04)", 
                                borderRadius: "4px", transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
                            }} />
                            <span style={{ fontSize: "10px", color: h > 0 ? "var(--text-1)" : "var(--text-3)", fontWeight: "900" }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mastery Feed */}
            <div>
                <p style={{ fontSize: "11px", fontWeight: "900", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}>Learning Feed</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {topics.filter(t => t.status !== 'pending').length === 0 ? (
                        <p style={{ fontSize: "13px", color: "var(--text-4)", textAlign: "center", padding: "20px" }}>No activity recorded yet for this plan.</p>
                    ) : (
                        topics.filter(t => t.status !== 'pending').map(t => (
                            <div key={t.id} className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "16px", background: "rgba(var(--invert-rgb),0.01)" }}>
                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.status === 'completed' ? 'var(--green-light)' : 'var(--purple)', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                                    <p style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: "500" }}>Day {t.day_number} • {t.status === 'completed' ? 'Mastered' : 'Active'}</p>
                                </div>
                                {t.quizScore !== null && (
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <p style={{ fontSize: "15px", fontWeight: "900", color: t.quizScore / t.quizTotal! > 0.8 ? 'var(--green-light)' : '#fbbf24' }}>{t.quizScore}/{t.quizTotal}</p>
                                        <p style={{ fontSize: "9px", color: "var(--text-3)", textTransform: "uppercase", fontWeight: "900" }}>Score</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

        {/* Right Column: AI Insights & Weak Areas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Weak Areas Indicator */}
            <div className="card" style={{ padding: "24px", border: allWeak.length > 0 ? "1px solid rgba(248,113,113,0.3)" : "1px solid var(--border)" }}>
                <h2 style={{ fontSize: "11px", fontWeight: "900", color: allWeak.length > 0 ? "#f87171" : "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}>Weak Area Alerts</h2>
                
                {allWeak.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "var(--text-3)", textAlign: "center", padding: "10px 0" }}>No structural weaknesses identified.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {allWeak.map((w, i) => (
                            <div key={i} style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ color: "#f87171", fontSize: "14px" }}>⚠️</span>
                                <span style={{ fontSize: "13px", fontWeight: "700", color: "#fca5a5" }}>{w}</span>
                            </div>
                        ))}
                        <Link href="/chat" style={{ marginTop: "12px", textAlign: "center", fontSize: "12px", color: "var(--purple-light)", textDecoration: "none", fontWeight: "800" }}>Consult AI Tutor →</Link>
                    </div>
                )}
            </div>

            {/* Next Objective Card */}
            <div className="card" style={{ padding: "24px", background: "rgba(124,58,237,0.04)" }}>
                <h2 style={{ fontSize: "11px", fontWeight: "900", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "20px" }}>Active Milestone</h2>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🏅</div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-1)" }}>Reach 25% Mastery</p>
                        <p style={{ fontSize: "12px", color: "var(--text-3)" }}>Only {topics.length > 0 ? (Math.ceil(topics.length * 0.25) - comp) : '...'} segments away</p>
                    </div>
                </div>
            </div>

        </div>

      </div>

    </div>
  )
}