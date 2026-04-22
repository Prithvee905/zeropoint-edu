'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import TodayTasks from "../components/TodayTasks"
import Streak from "../components/Streak"

export default function Dashboard() {
  const [roadmap, setRoadmap] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, completed: 0, quizzes: 0 })
  const [lastTopic, setLastTopic] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    const id = localStorage.getItem("activeRoadmapId")
    if (!id) { setLoading(false); return }
    
    const { data: rm } = await supabase.from("roadmaps").select("*").eq("id", id).single()
    setRoadmap(rm)
    
    const { data: t } = await supabase.from("topics").select("id,title,status,updated_at").eq("roadmap_id", id)
    const { data: q } = await supabase.from("quiz_attempts").select("id")
    
    if (t) {
      setStats({ 
        total: t.length, 
        completed: t.filter(x => x.status === "completed").length, 
        quizzes: q?.length || 0 
      })
      const sorted = [...t].sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      setLastTopic(sorted.find(x => x.status === "active") || sorted[0])
    }
    setLoading(false)
  }

  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  if (!roadmap && !loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", padding: "0 20px" }} className="fade-up">
       <div style={{ width: "80px", height: "80px", background: "rgba(255,255,255,0.02)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "24px" }}>🛰️</div>
       <h1 style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "-0.04em" }}>Ready to launch?</h1>
       <p style={{ color: "#6b6b78", fontSize: "14px", maxWidth: "340px", margin: "12px auto 32px", lineHeight: "1.6" }}>You haven't generated a study plan yet. Describe your goal or upload a syllabus to begin your journey.</p>
       <Link href="/onboarding" className="btn-primary" style={{ padding: "16px 32px", borderRadius: "14px", textDecoration: "none", fontWeight: "700" }}>Generate AI Roadmap</Link>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }} className="fade-up dashboard-container">

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }} className="mobile-stack">
        <div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.2rem)", fontWeight: "900", letterSpacing: "-0.04em" }}>Overview</h1>
          {roadmap && (
             <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <span className="badge badge-purple" style={{ padding: "4px 10px", fontSize: "11px" }}>{roadmap.subject}</span>
                <span style={{ fontSize: "13px", color: "#52525e", fontWeight: "500" }}>{roadmap.goal}</span>
             </div>
          )}
        </div>
        <Link href="/onboarding" style={{ color: "#7c3aed", fontSize: "13px", fontWeight: "800", textDecoration: "none", borderBottom: "2px solid rgba(124,58,237,0.2)", paddingBottom: "2px" }}>New Plan</Link>
      </div>

      {/* Resume Card */}
      {lastTopic && (
        <div className="card resume-card" style={{ padding: "32px", background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.06))", border: "1px solid rgba(124,58,237,0.25)", position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "100%", background: "radial-gradient(circle at center, rgba(124,58,237,0.15), transparent 70%)", pointerEvents: "none" }} />
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px" }} className="mobile-stack">
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "10px", fontWeight: "900", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "12px" }}>Resume Session</p>
                <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#fff", marginBottom: "8px", lineHeight: "1.2" }}>{lastTopic.title}</h2>
                <p style={{ fontSize: "14px", color: "#6b6b78", fontWeight: "500" }}>Pick up exactly where you left off.</p>
              </div>
              <Link href={`/topic/${lastTopic.id}`} className="btn-primary mobile-full-width" style={{ padding: "14px 28px", borderRadius: "14px", textDecoration: "none", fontWeight: "700", boxShadow: "0 10px 25px rgba(124,58,237,0.3)" }}>Continue Learning</Link>
           </div>
        </div>
      )}

      {/* Stats Section */}
      <div>
        <p style={{ fontSize: "11px", fontWeight: "900", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "16px" }}>Performance</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "16px" }} className="stagger">
          {[
            { label: "Lessons", value: stats.total, color: "#f0f0f4" },
            { label: "Mastered", value: stats.completed, color: "#4ade80" },
            { label: "Quizzes", value: stats.quizzes, color: "#a78bfa" },
            { label: "Progress", value: `${pct}%`, color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="card card-interactive" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#52525e", textTransform: "uppercase" }}>{s.label}</span>
              <span style={{ fontSize: "24px", fontWeight: "900", color: s.color, letterSpacing: "-0.04em" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px" }}>
        <TodayTasks />
        <Streak />
      </div>

    </div>
  )
}