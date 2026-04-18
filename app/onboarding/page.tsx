'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Onboarding() {
  const router = useRouter()
  const [form, setForm] = useState({ subject: "", goal: "", examDate: "", hours: "" })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))
  const valid = form.subject && form.goal && form.hours

  const submit = async () => {
    if (!valid) return
    setLoading(true); setError("")
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (file) fd.append("file", file)
    try {
      const r = await fetch("/api/roadmap/generate", { method: "POST", body: fd })
      const d = await r.json()
      if (d.success) { localStorage.setItem("activeRoadmapId", d.roadmapId); router.push("/dashboard") }
      else setError(d.error || "Generation failed")
    } catch { setError("Connection failed. Please try again.") }
    finally { setLoading(false) }
  }

  return (
    <div className="fade-up" style={{ maxWidth: "480px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ marginBottom: "8px" }}>Create study plan</h1>
        <p style={{ fontSize: "14px", color: "#6b6b78" }}>Tell us your goal and we'll build a personalized daily roadmap.</p>
      </div>

      {/* Form */}
      <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#8b8b99", marginBottom: "7px" }}>Subject *</label>
          <input className="input" placeholder="e.g. Machine Learning, DSA, Physics" value={form.subject} onChange={set("subject")} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#8b8b99", marginBottom: "7px" }}>Goal *</label>
          <input className="input" placeholder="e.g. Crack GATE, prep for interview" value={form.goal} onChange={set("goal")} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#8b8b99", marginBottom: "7px" }}>Exam Date</label>
            <input className="input" type="date" value={form.examDate} onChange={set("examDate")} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#8b8b99", marginBottom: "7px" }}>Hours / Day *</label>
            <input className="input" placeholder="e.g. 3" value={form.hours} onChange={set("hours")} />
          </div>
        </div>

        {/* Upload */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "500", color: "#8b8b99", marginBottom: "7px" }}>Upload Syllabus PDF <span style={{ color: "#3f3f48" }}>(optional)</span></label>
          <label style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
            background: "var(--bg-raised)", border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: file ? "#a78bfa" : "#52525e",
            transition: "border-color 0.15s",
          }}>
            <span>📎</span>
            <span>{file ? file.name : "Click to upload PDF"}</span>
            <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        {/* Error */}
        {error && <p style={{ fontSize: "13px", color: "#f87171", padding: "10px 12px", background: "rgba(248,113,113,0.08)", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.15)" }}>{error}</p>}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "4px" }}>
          <button className="btn-primary" onClick={submit} disabled={loading || !valid} style={{ width: "100%", padding: "11px" }}>
            {loading
              ? <><span className="spinner" style={{ width: "14px", height: "14px" }} /> Generating plan...</>
              : "Generate AI study plan"
            }
          </button>
        </div>

      </div>
    </div>
  )
}