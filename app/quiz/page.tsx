'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function QuizHub() {
  const [topics, setTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { load() }, [])

  const load = async () => {
    const id = localStorage.getItem("activeRoadmapId")
    if (!id) { setLoading(false); return }
    const { data } = await supabase.from("topics").select("id,title,day_number,ai_summary,status").eq("roadmap_id", id).order("day_number")
    if (data) setTopics(data)
    setLoading(false)
  }

  if (loading) return <div style={{ color: "#52525e", fontSize: "14px" }}>Loading...</div>

  return (
    <div className="fade-up">
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ marginBottom: "6px" }}>Quizzes</h1>
        <p style={{ fontSize: "14px", color: "#6b6b78" }}>AI-generated questions based on your lesson content.</p>
      </div>

      {topics.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "#52525e", fontSize: "14px", marginBottom: "16px" }}>No topics found.</p>
          <button className="btn-primary" onClick={() => router.push("/onboarding")}>Create study plan</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }} className="stagger">
          {topics.map(t => {
            const hasLesson = !!t.ai_summary
            const done = t.status === "completed"
            return (
              <div key={t.id} className="card card-interactive fade-up" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Day {t.day_number}</div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#e0e0e8", lineHeight: "1.4" }}>{t.title}</div>
                  </div>
                  {done && <span className="badge badge-green">Passed</span>}
                </div>

                {done ? (
                  <button className="btn-ghost" onClick={() => router.push(`/quiz/${t.id}`)} style={{ width: "100%", justifyContent: "center", fontSize: "12px", border: "1px solid var(--border)" }}>
                    Retake quiz
                  </button>
                ) : hasLesson ? (
                  <button className="btn-primary" onClick={() => router.push(`/quiz/${t.id}`)} style={{ width: "100%", fontSize: "13px", padding: "8px" }}>
                    Start quiz
                  </button>
                ) : (
                  <button className="btn-ghost" onClick={() => router.push(`/topic/${t.id}`)} style={{ width: "100%", justifyContent: "center", fontSize: "12px", border: "1px solid var(--border)", color: "#52525e" }}>
                    Complete lesson first
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
