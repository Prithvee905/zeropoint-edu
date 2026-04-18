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
      <div className="spinner" />
      <p style={{ color: "#52525e", fontSize: "13px" }}>Generating your lesson...</p>
    </div>
  )

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "740px" }}>

      {/* Back */}
      <button onClick={() => router.push("/dashboard")}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#52525e", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px", fontFamily: "inherit", padding: 0, transition: "color 0.15s" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#a78bfa"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#52525e"}
      >
        ← Dashboard
      </button>

      {/* Title */}
      <div>
        <span className="badge badge-purple" style={{ marginBottom: "10px" }}>AI Lesson</span>
        <h1>{title}</h1>
      </div>

      {/* Lesson content */}
      <div className="card" style={{ padding: "28px 32px" }}>
        <div style={{ color: "#a0a0b0", fontSize: "14px", lineHeight: "1.75" }}>
          <ReactMarkdown components={{
            h1: ({ children }) => <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#e8e8f0", marginTop: "24px", marginBottom: "10px" }}>{children}</h2>,
            h2: ({ children }) => <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#d0d0dc", marginTop: "20px", marginBottom: "8px" }}>{children}</h3>,
            h3: ({ children }) => <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#c0c0cc", marginTop: "16px", marginBottom: "6px" }}>{children}</h4>,
            p: ({ children }) => <p style={{ marginBottom: "12px", lineHeight: "1.75", color: "#9090a0" }}>{children}</p>,
            ul: ({ children }) => <ul style={{ paddingLeft: "18px", marginBottom: "12px" }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ paddingLeft: "18px", marginBottom: "12px" }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: "5px", color: "#9090a0" }}>{children}</li>,
            strong: ({ children }) => <strong style={{ color: "#d0d0dc", fontWeight: "600" }}>{children}</strong>,
            code: ({ children }) => <code style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", padding: "2px 7px", fontSize: "12px", color: "#a78bfa", fontFamily: "monospace" }}>{children}</code>,
            pre: ({ children }) => <pre style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "16px", overflow: "auto", fontSize: "12px", margin: "12px 0", fontFamily: "monospace" }}>{children}</pre>,
            blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid #7c3aed", paddingLeft: "14px", margin: "10px 0", color: "#7070808", fontStyle: "italic" }}>{children}</blockquote>,
          }}>{summary}</ReactMarkdown>
        </div>
      </div>

      {/* Persistent topic chat */}
      <div>
        <div className="card card-interactive" style={{ padding: "24px" }}>
          <TopicChat topicId={id as string} topicTitle={title} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button className="btn-secondary" onClick={() => router.push(`/flashcards/${id}`)} style={{ flex: 1 }}>Flashcards</button>
        <button className="btn-primary" onClick={() => router.push(`/quiz/${id}`)} style={{ flex: 1 }}>Take quiz</button>
      </div>

    </div>
  )
}
