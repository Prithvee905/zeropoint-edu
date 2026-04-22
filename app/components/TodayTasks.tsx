'use client'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function TodayTasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [title, setTitle] = useState("Today's Topic")
  const [topicId, setTopicId] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const id = localStorage.getItem("activeRoadmapId"); if (!id) { setLoading(false); return }
      const { data: topics } = await supabase.from("topics").select("*").eq("roadmap_id", id).order("day_number").limit(1)
      if (!topics?.length) { setLoading(false); return }
      const t = topics[0]
      setTitle(`Day ${t.day_number} — ${t.title}`)
      setTopicId(t.id)
      const { data: ts } = await supabase.from("tasks").select("*").eq("topic_id", t.id).order("created_at")
      if (ts) setTasks(ts.map(x => ({ id: x.id, text: x.description, done: x.is_completed })))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const updateStreak = () => {
    const today = new Date().toDateString()
    const last = localStorage.getItem("lastStudyDate")
    let s = Number(localStorage.getItem("studyStreak") || 0)
    if (last) {
      const y = new Date(); y.setDate(y.getDate() - 1)
      if (last === y.toDateString()) s++ ; else if (last !== today) s = 1
    } else s = 1
    localStorage.setItem("studyStreak", String(s)); localStorage.setItem("lastStudyDate", today)
  }

  const toggle = async (id: string, done: boolean) => {
    const next = tasks.map(t => t.id === id ? { ...t, done: !done } : t)
    setTasks(next)
    await supabase.from("tasks").update({ is_completed: !done }).eq("id", id)
    if (next.every(t => t.done)) updateStreak()
  }

  const done = tasks.filter(t => t.done).length
  const allDone = tasks.length > 0 && done === tasks.length

  if (loading) return (
    <div className="card" style={{ padding: "20px" }}>
      <div className="skeleton" style={{ height: "13px", width: "120px", marginBottom: "16px" }} />
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "40px", marginBottom: "8px", borderRadius: "8px" }} />)}
    </div>
  )

  return (
    <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Current Topic</div>
        {tasks.length > 0 && (
          <span style={{
            fontSize: "11px", fontWeight: "500", padding: "2px 9px", borderRadius: "99px",
            background: allDone ? "rgba(22,163,74,0.1)" : "rgba(var(--invert-rgb),0.04)",
            color: allDone ? "var(--green-light)" : "var(--text-3)", border: `1px solid ${allDone ? "rgba(22,163,74,0.2)" : "rgba(var(--invert-rgb),0.06)"}`
          }}>{done}/{tasks.length}</span>
        )}
      </div>

      <div style={{ fontSize: "14px", fontWeight: "600", color: "#e8e8f0", lineHeight: "1.3" }}>{title}</div>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--text-3)", padding: "8px 0" }}>No active plan. <a href="/onboarding" style={{ color: "var(--purple-light)" }}>Create one →</a></p>
      ) : (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
          {tasks.map(t => (
            <li key={t.id} onClick={() => toggle(t.id, t.done)}
              style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", cursor: "pointer",
                background: t.done ? "rgba(22,163,74,0.05)" : "rgba(var(--invert-rgb),0.02)",
                border: `1px solid ${t.done ? "rgba(22,163,74,0.1)" : "rgba(var(--invert-rgb),0.05)"}`,
                transition: "all 0.12s",
              }}
            >
              {/* Checkbox */}
              <div style={{
                width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0,
                border: `1.5px solid ${t.done ? "var(--green-light)" : "var(--text-4)"}`,
                background: t.done ? "rgba(22,163,74,0.2)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {t.done && <svg width="8" height="8" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="var(--green-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize: "13px", color: t.done ? "var(--text-3)" : "var(--text-2)", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
            </li>
          ))}
        </ul>
      )}

      {allDone && (
        <button className="btn-primary" onClick={() => router.push(`/topic/${topicId}`)} style={{ width: "100%", marginTop: "4px" }}>
          Continue to lesson →
        </button>
      )}
    </div>
  )
}