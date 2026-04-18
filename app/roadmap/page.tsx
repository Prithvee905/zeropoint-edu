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
    const id = localStorage.getItem("activeRoadmapId"); if (!id) { setLoading(false); return }
    const { data: r } = await supabase.from("roadmaps").select("*").eq("id", id).single(); setRm(r)
    const { data: t } = await supabase.from("topics").select("id,title,day_number,status,ai_summary").eq("roadmap_id", id).order("day_number")
    if (t) setTopics(t); setLoading(false)
  }

  if (loading) return <div style={{ color: "#52525e" }}>Loading...</div>

  const statusColor: Record<string, string> = { completed: "#4ade80", in_progress: "#fbbf24", pending: "#3f3f48" }
  const statusLabel: Record<string, string> = { completed: "Done", in_progress: "In progress", pending: "Pending" }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ marginBottom: "6px" }}>Roadmap</h1>
        {rm && <p style={{ fontSize: "14px", color: "#6b6b78" }}><strong style={{ color: "#a78bfa", fontWeight: 500 }}>{rm.subject}</strong> — {rm.goal}</p>}
      </div>

      {topics.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "#52525e", fontSize: "14px", marginBottom: "14px" }}>No roadmap created yet.</p>
          <button className="btn-primary" onClick={() => router.push("/onboarding")}>Create study plan</button>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", left: "15px", top: "20px", bottom: "20px", width: "1px", background: "rgba(255,255,255,0.06)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }} className="stagger">
            {topics.map(t => (
              <div key={t.id} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }} className="fade-up">
                {/* Dot */}
                <div style={{ flexShrink: 0, paddingTop: "17px", position: "relative", zIndex: 1 }}>
                  <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: statusColor[t.status],
                    border: "2px solid var(--bg)",
                    boxShadow: t.status === "completed" ? "0 0 0 2px rgba(74,222,128,0.2)" : "none",
                    transition: "box-shadow 0.3s",
                  }} />
                </div>
                {/* Card */}
                <div className="card card-interactive" style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "600", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em" }}>Day {t.day_number}</span>
                    <p style={{ fontSize: "13px", fontWeight: "500", color: "#d0d0dc", marginTop: "3px", lineHeight: "1.4" }}>{t.title}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span style={{ fontSize: "11px", color: statusColor[t.status], fontWeight: "500" }}>{statusLabel[t.status]}</span>
                    <button
                      className="btn-ghost"
                      onClick={() => router.push(`/topic/${t.id}`)}
                      style={{ fontSize: "12px", padding: "5px 12px", border: "1px solid var(--border)" }}
                    >
                      {t.ai_summary ? "Review" : "Study"}
                    </button>
                    {t.status === "completed" && (
                      <button className="btn-ghost" onClick={() => router.push(`/quiz/${t.id}`)} style={{ fontSize: "12px", padding: "5px 12px", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
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
