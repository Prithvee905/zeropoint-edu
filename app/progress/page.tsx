'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type T = { id: string; title: string; day_number: number; status: string; quizScore: number|null; quizTotal: number|null; weak: string[] }

export default function ProgressPage() {
  const [topics, setTopics] = useState<T[]>([])
  const [rm, setRm] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    const id = localStorage.getItem("activeRoadmapId"); if (!id) { setLoading(false); return }
    const { data: r } = await supabase.from("roadmaps").select("*").eq("id", id).single(); setRm(r)
    const { data: ts } = await supabase.from("topics").select("id,title,day_number,status").eq("roadmap_id", id).order("day_number")
    if (!ts) { setLoading(false); return }
    const enriched = await Promise.all(ts.map(async t => {
      const { data: a } = await supabase.from("quiz_attempts").select("score,total_questions,weak_concepts").eq("topic_id", t.id).order("completed_at", { ascending: false }).limit(1)
      const x = a?.[0]
      return { ...t, quizScore: x?.score ?? null, quizTotal: x?.total_questions ?? null, weak: x?.weak_concepts ?? [] }
    }))
    setTopics(enriched); setLoading(false)
  }

  if (loading) return <div style={{ color: "#52525e" }}>Loading...</div>

  const comp = topics.filter(t => t.status === "completed").length
  const pct = topics.length ? Math.round((comp / topics.length) * 100) : 0
  const allWeak = topics.flatMap(t => t.weak).filter(Boolean)

  const statusLabel: Record<string, string> = { completed: "Completed", in_progress: "In progress", pending: "Pending" }
  const statusColor: Record<string, string> = { completed: "#4ade80", in_progress: "#fbbf24", pending: "#52525e" }

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      <div>
        <h1 style={{ marginBottom: "6px" }}>Progress</h1>
        {rm && <p style={{ fontSize: "14px", color: "#6b6b78" }}>{rm.subject} — {rm.goal}</p>}
      </div>

      {/* Overview */}
      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "16px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>Completion</p>
            <p style={{ fontSize: "14px", color: "#8b8b99" }}>{comp} of {topics.length} topics done</p>
          </div>
          <span style={{ fontSize: "2.5rem", fontWeight: "700", color: "#a78bfa", letterSpacing: "-0.04em" }}>{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Topic List */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Topics</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }} className="stagger">
          {topics.map(t => (
            <div key={t.id} className="card card-interactive fade-up" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.07em" }}>Day {t.day_number}</span>
                <p style={{ fontSize: "13px", fontWeight: "500", color: "#d0d0dc", marginTop: "2px" }}>{t.title}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                {t.quizScore !== null && (
                  <span style={{ fontSize: "12px", color: t.quizScore === t.quizTotal ? "#4ade80" : "#fbbf24", fontWeight: "500" }}>
                    {t.quizScore}/{t.quizTotal}
                  </span>
                )}
                <span style={{ fontSize: "12px", color: statusColor[t.status], fontWeight: "500" }}>{statusLabel[t.status]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Areas */}
      {allWeak.length > 0 && (
        <div className="card" style={{ padding: "20px 24px", borderColor: "rgba(248,113,113,0.15)" }}>
          <p style={{ fontSize: "11px", fontWeight: "600", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>Weak areas</p>
          <p style={{ fontSize: "12px", color: "#52525e", marginBottom: "12px" }}>The AI tutor will focus on these automatically.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {allWeak.map((c, i) => (
              <div key={i} style={{ fontSize: "13px", color: "#c0a0a0", padding: "9px 12px", background: "rgba(248,113,113,0.04)", borderRadius: "7px", border: "1px solid rgba(248,113,113,0.08)" }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}