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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "65vh", textAlign: "center", gap: "24px", padding: "0 24px" }}>
      <div className="spinner" style={{ width: "40px", height: "40px", borderTopColor: "#7c3aed" }} />
      <div className="fade-up">
        <h2 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: "900", marginBottom: "8px" }}>Building your future...</h2>
        <p style={{ color: "#6b6b78", fontSize: "14px", maxWidth: "320px", margin: "0 auto", lineHeight: "1.6" }}>
          Our AI is analyzing your goals and planning your daily study segments.
        </p>
      </div>
    </div>
  )

  return (
    <div className="fade-up" style={{ maxWidth: "560px", margin: "0 auto", paddingBottom: "100px" }}>

      {/* Header */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "900", marginBottom: "12px", letterSpacing: "-0.04em" }}>Customize your path</h1>
        <p style={{ fontSize: "clamp(14px, 2vw, 15px)", color: "#6b6b78", lineHeight: "1.6", maxWidth: "380px", margin: "0 auto" }}>Explain your mission. ZEROPOINT will builder the engine to get you there.</p>
      </div>

      {/* Form */}
      <div className="card onboarding-form-card" style={{ padding: "clamp(24px, 5vw, 40px)", display: "flex", flexDirection: "column", gap: "28px", position: "relative", background: "rgba(255,255,255,0.01)" }}>
        
        {/* Step Indicator */}
        <div style={{ 
            position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", 
            background: "#7c3aed", color: "#fff", padding: "6px 16px", borderRadius: "0 0 10px 10px", 
            fontSize: "10px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" 
        }}>Plan Configuration</div>

        <div className="form-section">
          <label style={{ display: "block", fontSize: "11px", fontWeight: "900", color: "#52525e", marginBottom: "10px", textTransform: "uppercase" }}>Primary Subject *</label>
          <input className="input" placeholder="e.g. Modern Web Development" value={form.subject} onChange={set("subject")} style={{ fontSize: "16px", padding: "16px", borderRadius: "12px" }} />
        </div>

        <div className="form-section">
          <label style={{ display: "block", fontSize: "11px", fontWeight: "900", color: "#52525e", marginBottom: "10px", textTransform: "uppercase" }}>Learning Mission *</label>
          <input className="input" placeholder="e.g. Master React and Next.js" value={form.goal} onChange={set("goal")} style={{ fontSize: "16px", padding: "16px", borderRadius: "12px" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "900", color: "#52525e", marginBottom: "10px", textTransform: "uppercase" }}>Deadline</label>
            <input className="input" type="date" value={form.examDate} onChange={set("examDate")} style={{ height: "52px", borderRadius: "12px", fontSize: "14px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "900", color: "#52525e", marginBottom: "10px", textTransform: "uppercase" }}>Daily Intensity (Hrs) *</label>
            <input className="input" type="number" placeholder="4" value={form.hours} onChange={set("hours")} style={{ height: "52px", borderRadius: "12px", fontSize: "14px" }} />
          </div>
        </div>

        {/* Upload Container */}
        <div style={{ background: "rgba(124,58,237,0.03)", padding: "24px", borderRadius: "16px", border: "1px solid rgba(124,58,237,0.1)" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "900", color: "#8b8b99", marginBottom: "12px", textTransform: "uppercase" }}>Boost with Syllabus PDF <span style={{ color: "#3f3f48" }}>(Recommended)</span></label>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", padding: "32px 18px",
            background: "rgba(124,58,237,0.02)", border: "2px dashed rgba(124,58,237,0.2)",
            borderRadius: "14px", cursor: "pointer", fontSize: "13px", color: file ? "#a78bfa" : "#52525e",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "32px", marginBottom: "4px" }}>{file ? "📄" : "☁️"}</span>
            <span style={{ fontWeight: "800", color: file ? "#fff" : "currentColor" }}>{file ? file.name : "Tap to select your file"}</span>
            <span style={{ fontSize: "11px", opacity: 0.6 }}>{file ? "File linked successfully" : "Analyzing your PDF generates 3x better results"}</span>
            <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        {/* Action Section */}
        <div style={{ paddingTop: "12px" }}>
          <button className="btn-primary" onClick={submit} disabled={loading || !valid} style={{ width: "100%", padding: "18px", borderRadius: "14px", fontSize: "16px", fontWeight: "900", boxShadow: valid ? "0 12px 24px rgba(124,58,237,0.3)" : "none" }}>
            Initialize AI Study System
          </button>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#3f3f48", marginTop: "18px", lineHeight: "1.5" }}>Zeropoint handles your data with privacy priority.</p>
        </div>

        {/* Error Handle */}
        {error && <p className="scale-pop" style={{ fontSize: "13px", color: "#f87171", padding: "14px", background: "rgba(248,113,113,0.06)", borderRadius: "12px", border: "1px solid rgba(248,113,113,0.15)", textAlign: "center" }}>⚠️ {error}</p>}

      </div>

      <style>{`
        @media (max-width: 480px) {
            .onboarding-form-card { padding: 32px 20px !important; }
        }
      `}</style>
    </div>
  )
}