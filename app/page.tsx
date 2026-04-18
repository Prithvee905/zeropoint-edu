'use client'

import Link from "next/link"

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center" }}>

      <span className="badge badge-purple" style={{ marginBottom: "24px" }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
        AI-Powered Study Engine
      </span>

      <h1 style={{ fontSize: "3.25rem", fontWeight: "700", letterSpacing: "-0.04em", lineHeight: "1.1", marginBottom: "20px", maxWidth: "680px", color: "#f0f0f4" }}>
        The smarter way to<br />
        <span style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          study anything
        </span>
      </h1>

      <p style={{ fontSize: "16px", color: "#8b8b99", maxWidth: "480px", lineHeight: "1.7", marginBottom: "36px" }}>
        Upload a syllabus or describe your goal. Zeropoint builds your daily study plan, tutors you through every topic, and adapts to your weak areas.
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "64px" }}>
        <Link href="/onboarding" className="btn-primary" style={{ padding: "11px 24px", fontSize: "14px", fontWeight: "500", textDecoration: "none" }}>
          Get started
        </Link>
        <Link href="/dashboard" className="btn-secondary" style={{ padding: "11px 24px", fontSize: "14px", textDecoration: "none" }}>
          View dashboard
        </Link>
      </div>

      {/* Feature grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", maxWidth: "640px", width: "100%" }}>
        {[
          { icon: "↗", title: "AI Roadmap", desc: "Day-by-day study plan built from your goal" },
          { icon: "◎", title: "Smart Quizzes", desc: "Questions generated from your actual lesson" },
          { icon: "⟳", title: "Weak Area Focus", desc: "AI adapts based on what you get wrong" },
        ].map(f => (
          <div key={f.title} className="card" style={{ padding: "20px", textAlign: "left" }}>
            <span style={{ fontSize: "18px", display: "block", marginBottom: "10px", color: "#6d28d9" }}>{f.icon}</span>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#e0e0e8", marginBottom: "4px" }}>{f.title}</div>
            <div style={{ fontSize: "12px", color: "#6b6b78", lineHeight: "1.5" }}>{f.desc}</div>
          </div>
        ))}
      </div>

    </div>
  )
}