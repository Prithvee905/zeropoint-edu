'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import TodayTasks from "../components/TodayTasks"
import Streak from "../components/Streak"

const S = {
  page: { display: "flex", flexDirection: "column" as const, gap: "28px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" },
  title: { fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.03em", color: "#f0f0f4" },
  subtitle: { fontSize: "13px", color: "#6b6b78", marginTop: "4px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" },
  statCard: { padding: "20px 22px", display: "flex", flexDirection: "column" as const, gap: "6px" },
  statLabel: { fontSize: "11px", fontWeight: "500", color: "#52525e", textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  statValue: { fontSize: "1.75rem", fontWeight: "700", letterSpacing: "-0.03em" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  sectionTitle: { fontSize: "11px", fontWeight: "600", color: "#52525e", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "10px" },
  featureLink: { textDecoration: "none", display: "block" },
  featureCard: { padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" },
  featureIcon: { width: "34px", height: "34px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  featureTitle: { fontSize: "13px", fontWeight: "600", color: "#e0e0e8" },
  featureDesc: { fontSize: "12px", color: "#52525e", marginTop: "2px" },
}

export default function Dashboard() {
  const [roadmap, setRoadmap] = useState<any>(null)
  const [stats, setStats] = useState({ total: 0, completed: 0, quizzes: 0 })

  useEffect(() => { load() }, [])

  const load = async () => {
    const id = localStorage.getItem("activeRoadmapId"); if (!id) return
    const { data: rm } = await supabase.from("roadmaps").select("*").eq("id", id).single()
    setRoadmap(rm)
    const { data: t } = await supabase.from("topics").select("id,status").eq("roadmap_id", id)
    const { data: q } = await supabase.from("quiz_attempts").select("id")
    if (t) setStats({ total: t.length, completed: t.filter(x => x.status === "completed").length, quizzes: q?.length || 0 })
  }

  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const statItems = [
    { label: "Topics", value: stats.total, color: "#f0f0f4" },
    { label: "Completed", value: stats.completed, color: "#4ade80" },
    { label: "Quizzes", value: stats.quizzes, color: "#a78bfa" },
    { label: "Progress", value: `${pct}%`, color: "#a78bfa" },
  ]

  const features = [
    { href: "/chat", label: "AI Tutor", desc: "Ask questions, get explanations", bg: "rgba(124,58,237,0.1)", color: "#a78bfa", icon: "✦" },
    { href: "/quiz", label: "Quizzes", desc: "Test what you've learned", bg: "rgba(22,163,74,0.1)", color: "#4ade80", icon: "◈" },
    { href: "/roadmap", label: "Roadmap", desc: "View all topics & days", bg: "rgba(79,70,229,0.1)", color: "#818cf8", icon: "⟐" },
    { href: "/progress", label: "Progress", desc: "Track scores & weak areas", bg: "rgba(245,158,11,0.1)", color: "#fbbf24", icon: "◱" },
  ]

  return (
    <div style={S.page} className="fade-up">

      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Dashboard</h1>
          {roadmap
            ? <p style={S.subtitle}>Studying <strong style={{ color: "#a78bfa", fontWeight: 500 }}>{roadmap.subject}</strong> — {roadmap.goal}</p>
            : <p style={S.subtitle}>No active plan yet.</p>
          }
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow} className="stagger">
        {statItems.map(s => (
          <div key={s.label} className="card card-interactive" style={S.statCard}>
            <span style={S.statLabel}>{s.label}</span>
            <span style={{ ...S.statValue, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={S.sectionTitle}>Roadmap Progress</span>
            <span style={{ fontSize: "11px", color: "#52525e" }}>{stats.completed} / {stats.total}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Tasks + Streak */}
      <div style={S.grid2}>
        <TodayTasks />
        <Streak />
      </div>

      {/* Quick links */}
      <div>
        <p style={S.sectionTitle}>Quick Access</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }} className="stagger">
          {features.map(f => (
            <Link key={f.href} href={f.href} style={S.featureLink}>
              <div className="card card-interactive fade-up" style={S.featureCard}>
                <div style={{ ...S.featureIcon, background: f.bg }}>
                  <span style={{ fontSize: "15px", color: f.color }}>{f.icon}</span>
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