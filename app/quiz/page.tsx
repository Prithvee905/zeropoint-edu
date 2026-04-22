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

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "40vh", gap: "12px" }}>
        <div className="spinner" />
        <p style={{ fontSize: "12px", color: "#52525e" }}>Preparing knowledge checks...</p>
    </div>
  )

  return (
    <div className="fade-up">
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-0.04em", marginBottom: "8px" }}>Knowledge Checks</h1>
        <p style={{ fontSize: "15px", color: "#6b6b78" }}>Validate your mastery through adaptive, syllabus-aware assessments.</p>
      </div>

      {topics.length === 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            
            {/* Guided Empty State */}
            <div className="card" style={{ padding: "48px 32px", textAlign: "center", borderStyle: "dashed", borderColor: "rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.02)" }}>
                <div style={{ width: "64px", height: "64px", background: "rgba(124,58,237,0.1)", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 24px" }}>🎯</div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "12px" }}>No active assessments</h3>
                <p style={{ color: "#6b6b78", fontSize: "14px", maxWidth: "300px", margin: "0 auto 32px", lineHeight: "1.6" }}>
                    Complete topic deep-dives to unlock personalized quizzes for your roadmap.
                </p>
                <button className="btn-primary" onClick={() => router.push("/onboarding")} style={{ padding: "14px 28px", borderRadius: "14px" }}>Setup Roadmap</button>
            </div>

            {/* Visual Demo (Mock Quiz Card) */}
            <div style={{ opacity: 0.5, pointerEvents: "none" }}>
                <p style={{ fontSize: "10px", fontWeight: "800", color: "#52525e", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>Assessment Preview</p>
                <div className="card" style={{ padding: "32px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🧠</div>
                        <div>
                            <p style={{ fontSize: "11px", fontWeight: "800", color: "#a78bfa", textTransform: "uppercase" }}>SAMPLE QUIZ</p>
                            <h4 style={{ fontSize: "15px", fontWeight: "800" }}>Logic & Problem Patterns</h4>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ height: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "4px", width: i === 1 ? "100%" : i === 2 ? "85%" : "60%" }}></div>
                        ))}
                    </div>
                    <div style={{ marginTop: "24px", height: "40px", borderRadius: "10px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}></div>
                </div>
                <p style={{ fontSize: "11px", color: "#3f3f48", marginTop: "12px", textAlign: "center" }}>Real quizzes are generated from your unique syllabus data</p>
            </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }} className="stagger">
          {topics.map(t => {
            const hasLesson = !!t.ai_summary
            const done = t.status === "completed"
            
            return (
              <div key={t.id} className="card card-interactive fade-up" style={{ 
                padding: "24px", 
                border: hasLesson ? "1px solid var(--border)" : "1px solid rgba(255,255,255,0.03)",
                opacity: hasLesson ? 1 : 0.6
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: "800", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>Day {t.day_number} Assessment</div>
                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#fff", lineHeight: "1.4", maxWidth: "200px" }}>{t.title}</div>
                  </div>
                  {done ? (
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(74,222,128,0.15)", color: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>✓</div>
                  ) : (
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", color: "#3f3f48", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{hasLesson ? "🔓" : "🔒"}</div>
                  )}
                </div>

                {!hasLesson ? (
                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.02)" }}>
                        <p style={{ fontSize: "12px", color: "#52525e", lineHeight: "1.5", marginBottom: "12px" }}>This assessment is locked until you complete the day's deep-dive lesson.</p>
                        <button onClick={() => router.push(`/topic/${t.id}`)} style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "8px", color: "#8b8b99", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Go to Lesson</button>
                    </div>
                ) : (
                    <button 
                        className={done ? "btn-secondary" : "btn-primary"} 
                        onClick={() => router.push(`/quiz/${t.id}`)} 
                        style={{ width: "100%", padding: "12px", borderRadius: "12px", fontSize: "13px", fontWeight: "800", boxShadow: done ? "none" : "0 10px 20px rgba(124,58,237,0.2)" }}
                    >
                        {done ? "Retake Mastery Check" : "Start Recall Quiz"}
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
