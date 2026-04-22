'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Q = { question: string; options: string[]; correctAnswer: number; explanation: string }

export default function QuizPage() {
  const { topicId } = useParams()
  const router = useRouter()
  const [qs, setQs] = useState<Q[]>([])
  const [idx, setIdx] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [wrong, setWrong] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (topicId) load() }, [topicId])

  const load = async () => {
    const r = await fetch("/api/quiz/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topicId }) })
    const d = await r.json()
    if (d.questions) setQs(d.questions)
    setLoading(false)
  }

  const check = () => {
    if (sel === null) return
    setChecked(true)
    if (sel === qs[idx].correctAnswer) setScore(s => s + 1)
    else setWrong(w => [...w, qs[idx].question])
  }

  const next = () => {
    if (idx < qs.length - 1) { setIdx(i => i + 1); setSel(null); setChecked(false) }
    else finish()
  }

  const finish = async () => {
    setDone(true)
    await supabase.from("quiz_attempts").insert([{ topic_id: topicId, score, total_questions: qs.length, weak_concepts: wrong }])
    await supabase.from("topics").update({ status: "completed" }).eq("id", topicId)
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", flexDirection: "column", gap: "14px" }}>
      <div className="spinner" />
      <p style={{ color: "var(--text-3)", fontSize: "13px" }}>Generating quiz...</p>
    </div>
  )

  if (done) {
    const pct = Math.round((score / qs.length) * 100)
    return (
      <div className="fade-up" style={{ maxWidth: "440px", margin: "60px auto", textAlign: "center" }}>
        <div className="card" style={{ padding: "40px 36px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>{pct === 100 ? "🎉" : "📊"}</div>
          <h2 style={{ marginBottom: "4px" }}>Quiz complete</h2>
          <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "24px" }}>
            You scored <strong style={{ color: pct >= 70 ? "var(--green-light)" : "#fbbf24" }}>{score}/{qs.length}</strong> ({pct}%)
          </p>
          {wrong.length > 0 && (
            <div style={{ textAlign: "left", marginBottom: "24px", padding: "14px", background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.12)", borderRadius: "8px" }}>
              <p style={{ fontSize: "11px", fontWeight: "600", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Needs review</p>
              {wrong.map((w, i) => <p key={i} style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "4px" }}>• {w}</p>)}
            </div>
          )}
          <button className="btn-primary" onClick={() => router.push("/dashboard")} style={{ width: "100%" }}>Back to dashboard</button>
        </div>
      </div>
    )
  }

  if (!qs.length) return <p style={{ color: "var(--text-3)" }}>No questions generated.</p>

  const q = qs[idx]

  return (
    <div className="fade-up" style={{ maxWidth: "600px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.25rem" }}>Quiz</h1>
        <div style={{ display: "flex", gap: "6px" }}>
          {qs.map((_, i) => (
            <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: i < idx ? "var(--purple)" : i === idx ? "var(--text-1)" : "rgba(var(--invert-rgb),0.1)", transition: "background 0.2s" }} />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="card" style={{ padding: "28px" }}>
        <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--purple)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
          Question {idx + 1} of {qs.length}
        </p>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#e8e8f0", lineHeight: "1.5", marginBottom: "24px" }}>{q.question}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {q.options.map((opt, i) => {
            let bg = "rgba(var(--invert-rgb),0.02)", border = "var(--border)", color = "#b0b0c0"
            if (checked) {
              if (i === q.correctAnswer) { bg = "rgba(22,163,74,0.08)"; border = "rgba(22,163,74,0.25)"; color = "var(--green-light)" }
              else if (i === sel) { bg = "rgba(248,113,113,0.08)"; border = "rgba(248,113,113,0.25)"; color = "#f87171" }
              else color = "var(--text-4)"
            } else if (sel === i) {
              bg = "rgba(124,58,237,0.1)"; border = "rgba(124,58,237,0.3)"; color = "#c4b5fd"
            }
            return (
              <button key={i} disabled={checked} onClick={() => setSel(i)} style={{
                textAlign: "left", padding: "12px 14px", borderRadius: "8px",
                background: bg, border: `1px solid ${border}`, color, fontSize: "13px",
                cursor: checked ? "default" : "pointer", transition: "all 0.12s", fontFamily: "inherit",
              }}>
                <span style={{ fontWeight: "600", marginRight: "8px", opacity: 0.6 }}>{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            )
          })}
        </div>

        {checked && (
          <div style={{
            marginTop: "20px", padding: "14px", borderRadius: "8px",
            background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)",
          }}>
            <p style={{ fontSize: "11px", fontWeight: "600", color: "var(--purple-light)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Explanation</p>
            <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: "1.6" }}>{q.explanation}</p>
          </div>
        )}

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
          {!checked
            ? <button className="btn-primary" onClick={check} disabled={sel === null} style={{ padding: "9px 22px" }}>Check answer</button>
            : <button className="btn-secondary" onClick={next} style={{ padding: "9px 22px" }}>{idx < qs.length - 1 ? "Next →" : "Finish"}</button>
          }
        </div>
      </div>
    </div>
  )
}
