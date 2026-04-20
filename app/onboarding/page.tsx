'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Onboarding() {
  const router = useRouter()
  const [form, setForm] = useState({ subject: "", goal: "", examDate: "", hours: "" })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0) // 0: input, 1: generating
  const [error, setError] = useState("")

  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }))
  const valid = form.subject && form.goal && form.hours

  const submit = async () => {
    if (!valid) return
    setLoading(true); setError(""); setStep(1)
    
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (file) fd.append("file", file)
    
    try {
      const r = await fetch("/api/roadmap/generate", { method: "POST", body: fd })
      const d = await r.json()
      if (d.success) { 
        localStorage.setItem("activeRoadmapId", d.roadmapId)
        // Artificial delay for high-end feel
        setTimeout(() => router.push("/dashboard"), 1500)
      }
      else {
        setError(d.error || "Generation failed")
        setStep(0)
      }
    } catch { 
      setError("Connection failed. Please try again.") 
      setStep(0)
    } finally { 
      setLoading(false) 
    }
  }

  // --- GENERATING VIEW ---
  if (step === 1) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center", gap: "24px" }}>
      <div className="spinner" style={{ width: "40px", height: "40px", borderTopColor: "#7c3aed" }} />
      <div className="fade-up">
        <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px" }}>Building your future...</h2>
        <p style={{ color: "#6b6b78", fontSize: "14px", maxWidth: "320px", margin: "0 auto" }}>
          Our AI is analyzing your goals and planning your daily study segments. Sit tight.
        </p>
      </div>
      <div className="card" style={{ padding: "16px 20px", background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)", borderRadius: "12px", fontSize: "12px", color: "#a78bfa" }}>
        ✨ Preparing modules for <strong>{form.subject}</strong>
      </div>
    </div>
  )

  return (
    <div className="fade-up" style={{ maxWidth: "480px", margin: "0 auto", paddingBottom: "100px" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "12px", letterSpacing: "-0.04em" }}>Let's customize your path</h1>
        <p style={{ fontSize: "15px", color: "#6b6b78", lineHeight: "1.5" }}>Tell ZEROPOINT what you're working toward. We'll handle the logistics of your study schedule.</p>
      </div>

      {/* Form */}
      <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px", position: "relative" }}>
        
        {/* Step Indicator */}
        <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", background: "#7c3aed", color: "#fff", padding: "4px 12px", borderRadius: "0 0 8px 8px", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>Step 1: The Goal</div>

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#8b8b99", marginBottom: "8px" }}>What are you studying? *</label>
          <input className="input" placeholder="e.g. Modern Web Development" value={form.subject} onChange={set("subject")} style={{ fontSize: "15px", padding: "14px" }} />
          <p style={{ fontSize: "11px", color: "#3f3f48", marginTop: "6px" }}>Example: Data Structures, Physics 101, MCAT Prep</p>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#8b8b99", marginBottom: "8px" }}>What is your end goal? *</label>
          <input className="input" placeholder="e.g. Master React and Next.js" value={form.goal} onChange={set("goal")} style={{ fontSize: "15px", padding: "14px" }} />
          <p style={{ fontSize: "11px", color: "#3f3f48", marginTop: "6px" }}>Example: Crack a tech interview, A+ in Finals</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#8b8b99", marginBottom: "8px" }}>Target Exam/Deadline</label>
            <input className="input" type="date" value={form.examDate} onChange={set("examDate")} style={{ height: "48px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#8b8b99", marginBottom: "8px" }}>Intensity (Hrs) *</label>
            <input className="input" type="number" placeholder="4" value={form.hours} onChange={set("hours")} style={{ height: "48px" }} />
          </div>
        </div>

        {/* Upload */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#8b8b99", marginBottom: "10px" }}>Precision Boost: Syllabus PDF <span style={{ color: "#3f3f48", fontWeight: "400" }}>(Recommended)</span></label>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", padding: "24px 14px",
            background: "rgba(124,58,237,0.03)", border: "2px dashed rgba(124,58,237,0.15)",
            borderRadius: "12px", cursor: "pointer", fontSize: "13px", color: file ? "#a78bfa" : "#52525e",
            transition: "all 0.2s",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "24px" }}>{file ? "📄" : "☁️"}</span>
            <span style={{ fontWeight: "600" }}>{file ? file.name : "Drop your syllabus here"}</span>
            <span style={{ fontSize: "11px", opacity: 0.7 }}>{file ? "File ready to be analyzed" : "We'll build your Roadmap exactly from this PDF"}</span>
            <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        {/* Error */}
        {error && <p style={{ fontSize: "13px", color: "#f87171", padding: "12px", background: "rgba(239,68,68,0.08)", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.1)" }}>⚠️ {error}</p>}

        {/* Button */}
        <div style={{ paddingTop: "8px" }}>
          <button className="btn-primary" onClick={submit} disabled={loading || !valid} style={{ width: "100%", padding: "16px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", boxShadow: valid ? "0 10px 30px rgba(124,58,237,0.3)" : "none" }}>
            Generate AI Roadmap
          </button>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#3f3f48", marginTop: "14px" }}>By proceeding, you agree to let ZEROPOINT handle your study data.</p>
        </div>

      </div>
    </div>
  )
}