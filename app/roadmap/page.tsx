'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function RoadmapPage() {
  const [topics, setTopics] = useState<any[]>([])
  const [rm, setRm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { load() }, [])

  const load = async () => {
    const id = localStorage.getItem("activeRoadmapId"); 
    if (!id) { setLoading(false); return }
    const { data: r } = await supabase.from("roadmaps").select("*").eq("id", id).single(); setRm(r)
    const { data: t } = await supabase.from("topics").select("id,title,day_number,status,ai_summary").eq("roadmap_id", id).order("day_number")
    if (t) setTopics(t); setLoading(false)
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "40vh", gap: "12px" }}>
        <div className="spinner" />
        <p style={{ fontSize: "12px", color: "var(--text-3)" }}>Loading your path...</p>
    </div>
  )

  const statusColor: Record<string, string> = { completed: "var(--green-light)", in_progress: "var(--purple)", pending: "var(--text-4)" }
  const statusLabel: Record<string, string> = { completed: "Mastered", in_progress: "Active", pending: "Waiting" }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: "40px" }} className="mobile-header-spacing">
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: "900", letterSpacing: "-0.04em", marginBottom: "12px" }}>Roadmap</h1>
        {rm ? (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                <span className="badge badge-purple" style={{ padding: "6px 14px", fontSize: "11px" }}>{rm.subject}</span>
                <p style={{ fontSize: "14px", color: "var(--text-3)", fontWeight: "500" }}>{rm.goal}</p>
            </div>
        ) : (
            <p style={{ fontSize: "14px", color: "var(--text-3)" }}>Explore the architecture of your study plan.</p>
        )}
      </div>

      {topics.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {/* Guided Empty State */}
            <div className="card" style={{ padding: "64px 24px", textAlign: "center", borderStyle: "dashed", borderColor: "rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.02)" }}>
                <div style={{ width: "64px", height: "64px", background: "rgba(124,58,237,0.1)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 24px" }}>🗺️</div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>Your roadmap starts here</h3>
                <p style={{ color: "var(--text-3)", fontSize: "14px", maxWidth: "340px", margin: "0 auto 32px", lineHeight: "1.6" }}>
                    Once you define your goal, we'll break it down into daily segments.
                </p>
                <button className="btn-primary" onClick={() => router.push("/onboarding")} style={{ padding: "14px 28px", borderRadius: "14px" }}>Generate AI Roadmap</button>
            </div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", left: "12px", top: "20px", bottom: "20px", width: "2px", background: "rgba(var(--invert-rgb),0.05)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="stagger">
            {topics.map(t => (
              <div key={t.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }} className="fade-up">
                {/* Dot */}
                <div style={{ flexShrink: 0, paddingTop: "20px", position: "relative", zIndex: 1, height: "100%" }}>
                  <div style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    background: statusColor[t.status],
                    border: "3px solid var(--bg)",
                    boxShadow: t.status === "in_progress" ? "0 0 20px rgba(124,58,237,0.5)" : "none",
                    transition: "all 0.4s ease",
                  }} />
                </div>
                {/* Card */}
                <div className="card card-interactive roadmap-card" style={{ 
                    flex: 1, padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px",
                    border: t.status === 'in_progress' ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border)',
                    background: t.status === 'in_progress' ? 'rgba(124,58,237,0.03)' : 'rgba(var(--invert-rgb),0.01)'
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "10px", fontWeight: "900", color: "var(--purple-light)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Day {t.day_number}</span>
                    <h3 style={{ fontSize: "16px", fontWeight: "800", color: t.status === 'pending' ? 'var(--text-3)' : '#fff', marginTop: "6px", lineHeight: "1.4" }}>{t.title}</h3>
                  </div>
                  
                  <div className="card-actions" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ textAlign: "right", marginRight: "4px" }} className="mobile-hide">
                        <span style={{ fontSize: "10px", fontWeight: "800", color: statusColor[t.status], textTransform: "uppercase", letterSpacing: "0.1em" }}>{statusLabel[t.status]}</span>
                    </div>
                    <button
                      className={t.status === 'in_progress' ? "btn-primary" : "btn-ghost"}
                      onClick={() => router.push(`/topic/${t.id}`)}
                      style={{ fontSize: "12px", padding: "10px 18px", borderRadius: "12px", whiteSpace: "nowrap" }}
                    >
                      {t.ai_summary ? "Review" : "Study"}
                    </button>
                    {t.status === "completed" && (
                      <button className="btn-secondary" onClick={() => router.push(`/quiz/${t.id}`)} style={{ fontSize: "12px", padding: "10px 18px", borderRadius: "12px", border: "1px solid rgba(124,58,237,0.2)" }}>
                        Quiz
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
