'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import TodayTasks from "../components/TodayTasks"
import Streak from "../components/Streak"

const S = {
  page: { display: "flex", flexDirection: "column" as const, gap: "28px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" },
  title: { fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.04em", color: "#f0f0f4" },
  subtitle: { fontSize: "14px", color: "#6b6b78", marginTop: "4px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px" },
  statCard: { padding: "24px", display: "flex", flexDirection: "column" as const, gap: "8px" },
  statLabel: { fontSize: "11px", fontWeight: "700", color: "#52525e", textTransform: "uppercase" as const, letterSpacing: "0.1em" },
  statValue: { fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.04em" },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" },
  sectionTitle: { fontSize: "11px", fontWeight: "800", color: "#52525e", textTransform: "uppercase" as const, letterSpacing: "0.12em", marginBottom: "12px" },
  featureLink: { textDecoration: "none", display: "block" },
  featureCard: { padding: "20px 24px", display: "flex", alignItems: "center", gap: "18px" },
  featureIcon: { width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  featureTitle: { fontSize: "14px", fontWeight: "700", color: "#e0e0e8" },
  featureDesc: { fontSize: "12px", color: "#52525e", marginTop: "4px" },
}

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
      // Find last updated topic that isn't completed yet
      const sorted = [...t].sort((a,b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      setLastTopic(sorted.find(x => x.status === "active") || sorted[0])
    }
    setLoading(false)
  }

  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const statItems = [
    { label: "Lessons", value: stats.total, color: "#f0f0f4" },
    { label: "Mastered", value: stats.completed, color: "#4ade80" },
    { label: "Quizzes", value: stats.quizzes, color: "#a78bfa" },
    { label: "Overall", value: `${pct}%`, color: "#a78bfa" },
  ]

  const features = [
    { href: "/chat", label: "AI Tutor Hub", desc: "Deeper concept explanations", bg: "rgba(124,58,237,0.1)", color: "#a78bfa", icon: "✦" },
    { href: "/quiz", label: "Knowledge Check", desc: "Validate your daily progress", bg: "rgba(22,163,74,0.1)", color: "#4ade80", icon: "◈" },
    { href: "/roadmap", label: "Full Roadmap", desc: "View upcoming study days", bg: "rgba(79,70,229,0.1)", color: "#818cf8", icon: "⟐" },
    { href: "/progress", label: "Performance", desc: "Weak areas & score trends", bg: "rgba(245,158,11,0.1)", color: "#fbbf24", icon: "◱" },
  ]

  if (!roadmap && !loading) return (
    <div style={{ ...S.page, alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }} className="fade-up">
       <div style={{ width: "80px", height: "80px", background: "rgba(255,255,255,0.02)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "24px" }}>🛰️</div>
       <h1 style={S.title}>Ready to launch?</h1>
       <p style={{ ...S.subtitle, maxWidth: "340px", margin: "12px auto 32px" }}>You haven't generated a study plan yet. Describe your goal or upload a syllabus to begin your journey.</p>
       <Link href="/onboarding" className="btn-primary" style={{ padding: "14px 28px", borderRadius: "14px", textDecoration: "none" }}>Generate AI Roadmap</Link>
    </div>
  )

  return (
    <div style={S.page} className="fade-up">

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Overview</h1>
          {roadmap && (
             <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <span className="badge badge-purple" style={{ padding: "4px 10px", fontSize: "11px" }}>{roadmap.subject}</span>
                <span style={{ fontSize: "13px", color: "#52525e" }}>{roadmap.goal}</span>
             </div>
          )}
        </div>
        <Link href="/onboarding" style={{ color: "#7c3aed", fontSize: "12px", fontWeight: "700", textDecoration: "none", borderBottom: "1px solid rgba(124,58,237,0.3)", paddingBottom: "2px" }}>+ New Plan</Link>
      </div>

      {/* Resume Card (Intelligent) */}
      {lastTopic && (
        <div className="card" style={{ padding: "28px", background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.05))", border: "1px solid rgba(124,58,237,0.2)", position: "relative", overflow: "hidden" }}>
           <div style={{ position: "absolute", top: 0, right: 0, width: "150px", height: "100%", background: "radial-gradient(circle at center, rgba(124,58,237,0.12), transparent 70%)", pointerEvents: "none" }} />
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: "10px", fontWeight: "800", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "8px" }}>Resume Learning</p>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>{lastTopic.title}</h2>
                <p style={{ fontSize: "13px", color: "#6b6b78" }}>Next up: Concept deep-dive and knowledge check.</p>
              </div>
              <Link href={`/topic/${lastTopic.id}`} className="btn-primary" style={{ padding: "12px 24px", borderRadius: "12px", textDecoration: "none", boxShadow: "0 10px 20px rgba(124,58,237,0.2)" }}>Continue →</Link>
           </div>
        </div>
      )}

      {/* Stats Row */}
      <div>
        <p style={S.sectionTitle}>Performance Stats</p>
        <div style={S.statsRow} className="stagger">
          {statItems.map(s => (
            <div key={s.label} className="card card-interactive" style={S.statCard}>
              <span style={S.statLabel}>{s.label}</span>
              <span style={{ ...S.statValue, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks + Streak */}
      <div style={S.grid2}>
        <TodayTasks />
        <Streak />
      </div>

      {/* Quick links */}
      <div>
        <p style={S.sectionTitle}>Learning Modules</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }} className="stagger">
          {features.map(f => (
            <Link key={f.href} href={f.href} style={S.featureLink}>
              <div className="card card-interactive fade-up" style={S.featureCard}>
                <div style={{ ...S.featureIcon, background: f.bg }}>
                  <span style={{ fontSize: "18px", color: f.color }}>{f.icon}</span>
                </div>
                <div>
                  <div style={S.featureTitle}>{f.label}</div>
                  <div style={S.featureDesc}>{f.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}