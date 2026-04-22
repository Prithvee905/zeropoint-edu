'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import ReactMarkdown from "react-markdown"
import TopicChat from "@/app/components/TopicChat"

export default function TopicPage() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (id) load() }, [id])

  const load = async () => {
    const r = await fetch("/api/topic/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId: id })
    })
    const d = await r.json()
    setTitle(d.title || "Topic")
    setSummary(d.summary || "")
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh", gap: "14px" }}>
      <div className="spinner" style={{ width: "32px", height: "32px" }} />
      <p style={{ color: "var(--text-3)", fontSize: "14px", fontWeight: "600" }}>Generating your lesson...</p>
    </div>
  )

  return (
    <div className="fade-up topic-page-container" style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "800px", margin: "0 auto" }}>

      {/* Back Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/dashboard")}
            style={{ 
                background: "rgba(var(--invert-rgb),0.03)", border: "1px solid rgba(var(--invert-rgb),0.06)", 
                cursor: "pointer", color: "var(--text-2)", fontSize: "12px", fontWeight: "700",
                display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "10px",
                transition: "all 0.2s"
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--purple-light)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-2)"}
        >
            ← Back
        </button>
        <span className="badge badge-purple" style={{ padding: "6px 12px", fontSize: "10px" }}>Active Lesson</span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: "900", letterSpacing: "-0.04em", color: "var(--text-1)", lineHeight: "1.2" }}>{title}</h1>

      {/* Lesson content container */}
      <div className="card lesson-content-card" style={{ padding: "clamp(24px, 5vw, 40px)", borderRadius: "24px" }}>
        <div style={{ color: "#a0a0b0", fontSize: "15px", lineHeight: "1.8" }}>
          <ReactMarkdown components={{
            h1: ({ children }) => <h2 style={{ fontSize: "18px", fontWeight: "900", color: "var(--text-1)", marginTop: "32px", marginBottom: "16px" }}>{children}</h2>,
            h2: ({ children }) => <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--text-1)", marginTop: "24px", marginBottom: "12px" }}>{children}</h3>,
            h3: ({ children }) => <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#d0d0dc", marginTop: "20px", marginBottom: "10px" }}>{children}</h4>,
            p: ({ children }) => <p style={{ marginBottom: "14px", color: "#9b9ba8" }}>{children}</p>,
            ul: ({ children }) => <ul style={{ paddingLeft: "20px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>{children}</ul>,
            li: ({ children }) => <li style={{ color: "#9b9ba8" }}>{children}</li>,
            strong: ({ children }) => <strong style={{ color: "var(--text-1)", fontWeight: "700" }}>{children}</strong>,
            code: ({ children }) => <code style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "6px", padding: "3px 8px", fontSize: "13px", color: "var(--purple-light)", fontFamily: "monospace" }}>{children}</code>,
            pre: ({ children }) => <pre style={{ background: "var(--bg)", border: "1px solid rgba(var(--invert-rgb),0.06)", borderRadius: "14px", padding: "18px", overflow: "auto", fontSize: "13px", margin: "20px 0", fontFamily: "monospace" }}>{children}</pre>,
            blockquote: ({ children }) => <blockquote style={{ borderLeft: "4px solid var(--purple)", paddingLeft: "18px", margin: "20px 0", color: "var(--text-2)", fontStyle: "italic", background: "rgba(124,58,237,0.02)", padding: "12px 18px", borderRadius: "0 12px 12px 0" }}>{children}</blockquote>,
          }}>{summary}</ReactMarkdown>
        </div>
      </div>

      {/* AI Tutor Integration */}
      <div className="card" style={{ padding: "clamp(16px, 4vw, 24px)", borderRadius: "24px" }}>
        <TopicChat topicId={id as string} topicTitle={title} />
      </div>

      {/* Responsive Control Bar */}
      <div style={{ display: "flex", gap: "12px", paddingTop: "12px", marginBottom: "80px" }} className="mobile-stack">
        <button 
            className="btn-secondary mobile-full-width" 
            onClick={() => router.push(`/flashcards/${id}`)} 
            style={{ flex: 1, padding: "14px", borderRadius: "14px", fontWeight: "700" }}
        >
            Recall Cards
        </button>
        <button 
            className="btn-primary mobile-full-width" 
            onClick={() => router.push(`/quiz/${id}`)} 
            style={{ flex: 1, padding: "14px", borderRadius: "14px", fontWeight: "800", boxShadow: "0 10px 25px rgba(124,58,237,0.3)" }}
        >
            Take Mastery Quiz
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
            .mobile-stack { flex-direction: column !important; }
            .mobile-full-width { width: 100% !important; }
            .lesson-content-card { padding: 24px 20px !important; border-radius: 18px !important; }
        }
      `}</style>
    </div>
  )
}
