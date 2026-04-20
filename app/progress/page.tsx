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

    // Calculate real Engagement (Activity per day of the week)
    const eng = [0, 0, 0, 0, 0, 0, 0] // M, T, W, T, F, S, S
    const today = new Date()
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(today.getDate() - i)
        return d.toISOString().split('T')[0]
    })

    enriched.forEach(t => {
        if (t.status === 'completed' || t.quizScore !== null) {
            const date = new Date(t.updated_at).toISOString().split('T')[0]
            const dayIdx = new Date(t.updated_at).getDay() // 0 is Sunday, 1 is Monday
            const mappedIdx = dayIdx === 0 ? 6 : dayIdx - 1
            eng[mappedIdx] += 1
        }
    })
    
    // Normalize to percentages (max 5 topics per day for visualization)
    const normalizedEng = eng.map(v => Math.min((v / 5) * 100, 100))
    setEngagement(normalizedEng)

    setTopics(enriched); setLoading(false)
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "40vh", gap: "10px" }}>
        <div className="spinner" />
        <p style={{ fontSize: "12px", color: "#52525e" }}>Loading analytics...</p>
    </div>
  )

  if (!rm && !loading) return (
    <div style={{ textAlign: "center", padding: "100px 20px" }} className="fade-up">
        <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px" }}>No activity record</h1>
        <p style={{ color: "#6b6b78", maxWidth: "320px", margin: "0 auto 32px" }}>We'll start mapping your performance as soon as you generate a study plan.</p>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
                <span className="badge badge-purple" style={{ marginBottom: "12px" }}>Performance Engine</span>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-0.04em", marginBottom: "4px" }}>Insights</h1>
                <p style={{ fontSize: "14px", color: "#6b6b78" }}>Analyzing your path: <strong style={{ color: "#a78bfa" }}>{rm.subject}</strong></p>
            </div>
            <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.1em" }}>Global Streak</span>
                <div style={{ fontSize: "24px", fontWeight: "900", color: "#fff" }}>{streak > 0 ? "🔥" : "💤"} {streak} Days</div>
            </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        {/* Left Column: Visual Charts & Topics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Completion Chart (Visual Artifact) */}
            <div className="card" style={{ padding: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
                    <div>
                        <h2 style={{ fontSize: "11px", fontWeight: "800", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>Overall Progress</h2>
                        <p style={{ fontSize: "2.5rem", fontWeight: "900", color: "#fff", letterSpacing: "-0.04em" }}>{pct}<span style={{ fontSize: "1.5rem", color: "#3f3f48" }}>%</span></p>
                    </div>
                </div>
                
                {/* Horizontal Bar Visual */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ height: "48px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)", overflow: "hidden", position: "relative" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4)", boxShadow: "0 0 30px rgba(124,58,237,0.3)", borderRadius: "0 12px 12px 0", transition: "width 1s ease-out" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "700", color: "#3f3f48", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        <span>Baseline</span>
                        <span>{comp} / {topics.length} Segments Complete</span>
                        <span>Target: 100%</span>
                    </div>
                </div>
            </div>

            {/* Weekly Activity (Visual Bar Chart) */}
            <div className="card" style={{ padding: "28px" }}>
                <h2 style={{ fontSize: "11px", fontWeight: "800", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "24px" }}>Engagement Level</h2>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "120px", padding: "0 10px" }}>
                    {engagement.map((h, i) => (
                        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", flex: 1 }}>
                            <div style={{ 
                                width: "20px", 
                                height: `${Math.max(h, 5)}%`, 
                                background: h > 0 ? "linear-gradient(180deg, #a78bfa, #7c3aed)" : "rgba(255,255,255,0.05)", 
                                borderRadius: "6px", 
                                transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
                                boxShadow: h > 0 ? "0 0 15px rgba(124,58,237,0.3)" : "none"
                            }} />
                            <span style={{ fontSize: "10px", color: h > 0 ? "#fff" : "#3f3f48", fontWeight: "800" }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mastery Feed */}
            <div>
                <h2 style={{ fontSize: "11px", fontWeight: "800", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>Learning Feed</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {topics.filter(t => t.status !== 'pending').length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#3f3f48", textAlign: "center", padding: "20px" }}>No activity recorded yet for this plan.</p>
                    ) : (
                        topics.filter(t => t.status !== 'pending').map(t => (
                            <div key={t.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.status === 'completed' ? '#4ade80' : '#7c3aed' }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#fff" }}>{t.title}</p>
                                    <p style={{ fontSize: "11px", color: "#52525e" }}>Day {t.day_number} • {t.status === 'completed' ? 'Mastery Verified' : 'In Discussion'}</p>
                                </div>
                                {t.quizScore !== null && (
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontSize: "14px", fontWeight: "800", color: t.quizScore / t.quizTotal! > 0.8 ? '#4ade80' : '#fbbf24' }}>{t.quizScore}/{t.quizTotal}</p>
                                        <p style={{ fontSize: "9px", color: "#3f3f48", textTransform: "uppercase", fontWeight: "900" }}>Score</p>
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
            <div className="card" style={{ padding: "28px", border: allWeak.length > 0 ? "1px solid rgba(248,113,113,0.2)" : "1px solid var(--border)" }}>
                <h2 style={{ fontSize: "11px", fontWeight: "800", color: allWeak.length > 0 ? "#f87171" : "#52525e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>Weak Area Alerts</h2>
                
                {allWeak.length === 0 ? (
                    <div style={{ padding: "20px 0", textAlign: "center" }}>
                        <p style={{ fontSize: "13px", color: "#3f3f48" }}>No structural weaknesses identified in your recent quizzes. Keep it up!</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <p style={{ fontSize: "13px", color: "#8b8b99", marginBottom: "6px", lineHeight: "1.5" }}>Our AI detected difficulties in these specific areas. We've prioritized them in your Tutor Hub.</p>
                        {allWeak.map((w, i) => (
                            <div key={i} style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.1)", display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ color: "#f87171" }}>⚠️</span>
                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#fca5a5" }}>{w}</span>
                            </div>
                        ))}
                        <Link href="/chat" style={{ marginTop: "12px", textAlign: "center", fontSize: "12px", color: "#7c3aed", textDecoration: "none", fontWeight: "700" }}>Resolve with AI Tutor →</Link>
                    </div>
                )}
            </div>

            {/* Achievement Badge (Next Objective) */}
            <div className="card" style={{ padding: "28px", background: "rgba(124,58,237,0.05)" }}>
                <h2 style={{ fontSize: "11px", fontWeight: "800", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "20px" }}>Next Objective</h2>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "16px", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🎖️</div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "14px", fontWeight: "800", color: "#fff" }}>Reach 25% Mastery</p>
                        <p style={{ fontSize: "12px", color: "#6b6b78" }}>Finish {topics.length > 0 ? (Math.ceil(topics.length * 0.25) - comp) : '...'} more lessons</p>
                    </div>
                </div>
            </div>

            {/* Memory Matrix Note */}
            <div className="card" style={{ padding: "24px", background: "transparent", borderStyle: "dashed", borderColor: "rgba(255,255,255,0.06)" }}>
                <h2 style={{ fontSize: "15px", fontWeight: "800", color: "#f0f0f4", marginBottom: "12px" }}>Why this logic?</h2>
                <p style={{ fontSize: "12px", color: "#52525e", lineHeight: "1.7" }}>
                    Zeropoint doesn't just track scores. We analyze the <strong>semantic depth</strong> of your interactions. Every weak area is a node in your personalized memory graph that we help you bridge.
                </p>
            </div>

        </div>

      </div>

    </div>
  )
}