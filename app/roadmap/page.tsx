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
        <p style={{ fontSize: "12px", color: "#52525e" }}>Loading your path...</p>
    </div>
  )

  const statusColor: Record<string, string> = { completed: "#4ade80", in_progress: "#7c3aed", pending: "#3f3f48" }
  const statusLabel: Record<string, string> = { completed: "Mastered", in_progress: "Active", pending: "Waiting" }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-0.04em", marginBottom: "8px" }}>Roadmap</h1>
        {rm ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="badge badge-purple" style={{ padding: "4px 12px" }}>{rm.subject}</span>
                <p style={{ fontSize: "14px", color: "#6b6b78" }}>{rm.goal}</p>
            </div>
        ) : (
            <p style={{ fontSize: "14px", color: "#6b6b78" }}>Explore the architecture of your study plan.</p>
        )}
      </div>

      {topics.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {/* Guided Empty State */}
            <div className="card" style={{ padding: "64px 32px", textAlign: "center", borderStyle: "dashed", borderColor: "rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.02)" }}>
                <div style={{ width: "64px", height: "64px", background: "rgba(124,58,237,0.1)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 24px" }}>🗺️</div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>Your roadmap starts here</h3>
                <p style={{ color: "#6b6b78", fontSize: "14px", maxWidth: "340px", margin: "0 auto 32px", lineHeight: "1.6" }}>
                    Once you define your goal, we'll break it down into daily segments like the preview below.
                </p>
                <button className="btn-primary" onClick={() => router.push("/onboarding")} style={{ padding: "14px 28px", borderRadius: "14px" }}>Generate AI Roadmap</button>
            </div>

            {/* Visual Demo Artifact (Ghost Roadmap) */}
            <div style={{ opacity: 0.4, pointerEvents: "none" }}>
                <p style={{ fontSize: "11px", fontWeight: "800", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px", textAlign: "center" }}>Example Architecture</p>
                <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto" }}>
                    <div style={{ position: "absolute", left: "15px", top: "20px", bottom: "20px", width: "1px", background: "rgba(255,255,255,0.06)" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                            { day: 1, title: "Fundamentals of Neural Networks", status: "completed" },
                            { day: 2, title: "Backpropagation Logic & Optimization", status: "in_progress" },
                            { day: 3, title: "Convolutional Layers & Spatial Processing", status: "pending" },
                            { day: 4, title: "Recurrent Units and Time-Series Flow", status: "pending" },
                        ].map(t => (
                            <div key={t.day} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                                <div style={{ flexShrink: 0, paddingTop: "17px", position: "relative", zIndex: 1 }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: statusColor[t.status], border: "2px solid var(--bg)" }} />
                                </div>
                                <div className="card" style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div>
                                        <span style={{ fontSize: "10px", fontWeight: "800", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em" }}>Day {t.day}</span>
                                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginTop: "4px" }}>{t.title}</p>
                                    </div>
                                    <span style={{ fontSize: "11px", fontWeight: "700", color: statusColor[t.status] }}>{statusLabel[t.status]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", left: "19px", top: "30px", bottom: "30px", width: "1px", background: "rgba(124,58,237,0.15)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="stagger">
            {topics.map(t => (
              <div key={t.id} style={{ display: "flex", gap: "24px", alignItems: "flex-start" }} className="fade-up">
                {/* Dot */}
                <div style={{ flexShrink: 0, paddingTop: "23px", position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: "12px", height: "12px", borderRadius: "50%",
                    background: statusColor[t.status],
                    border: "3px solid var(--bg)",
                    boxShadow: t.status === "in_progress" ? "0 0 20px rgba(124,58,237,0.5)" : "none",
                    transition: "all 0.4s ease",
                  }} />
                </div>
                {/* Card */}
                <div className="card card-interactive" style={{ 
                    flex: 1, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
                    border: t.status === 'in_progress' ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border)',
                    background: t.status === 'in_progress' ? 'rgba(124,58,237,0.03)' : 'var(--bg-card)'
                }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em" }}>Day {t.day_number}</span>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: t.status === 'pending' ? '#52525e' : '#fff', marginTop: "6px", lineHeight: "1.5" }}>{t.title}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <div style={{ textAlign: "right", marginRight: "12px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "800", color: statusColor[t.status], textTransform: "uppercase", letterSpacing: "0.1em" }}>{statusLabel[t.status]}</span>
                    </div>
                    <button
                      className={t.status === 'in_progress' ? "btn-primary" : "btn-ghost"}
                      onClick={() => router.push(`/topic/${t.id}`)}
                      style={{ fontSize: "12px", padding: "8px 16px", borderRadius: "10px" }}
                    >
                      {t.ai_summary ? "Review Concept" : "Deep Dive"}
                    </button>
                    {t.status === "completed" && (
                      <button className="btn-secondary" onClick={() => router.push(`/quiz/${t.id}`)} style={{ fontSize: "12px", padding: "8px 16px", borderRadius: "10px", border: "1px solid rgba(124,58,237,0.2)" }}>
                        Recall Quiz
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
