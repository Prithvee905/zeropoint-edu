"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"

type Msg = { role: "user" | "assistant"; content: string }

export default function AIChat({ topicId }: { topicId?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs, loading])

  const send = async () => {
    if (!input.trim() || loading) return
    const next: Msg[] = [...msgs, { role: "user", content: input }]
    setMsgs(next); setInput(""); setLoading(true)
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, topicId })
      })
      const d = await r.json()
      setMsgs(m => [...m, { role: "assistant", content: d.reply || "No response." }])
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Connection error. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "480px" }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", padding: "4px 0 16px" }}>

        {/* Empty State */}
        {msgs.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", paddingTop: "60px", gap: "10px" }}>
            <span style={{ fontSize: "28px", opacity: 0.3 }}>✦</span>
            <p style={{ color: "var(--text-3)", fontSize: "14px" }}>Ask anything — I'll explain it in depth</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", marginTop: "8px", maxWidth: "420px" }}>
              {["What is this topic?", "Give me examples", "Explain step by step", "What are the key concepts?"].map(q => (
                <button key={q} onClick={() => setInput(q)} style={{
                  fontSize: "12px", padding: "5px 12px", borderRadius: "99px",
                  background: "var(--bg-raised)", border: "1px solid var(--border)",
                  color: "var(--text-2)", cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.4)"; (e.currentTarget as HTMLElement).style.color = "var(--purple-light)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)" }}
                >{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: "10px", alignItems: "flex-start" }}>

            {/* AI Avatar */}
            {m.role === "assistant" && (
              <div style={{
                width: "26px", height: "26px", borderRadius: "7px", flexShrink: 0, marginTop: "2px",
                background: "linear-gradient(135deg, var(--purple), #4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: "700", color: "var(--text-1)",
              }}>Z</div>
            )}

            {/* Bubble */}
            <div style={{
              maxWidth: m.role === "user" ? "70%" : "85%",
              padding: m.role === "user" ? "10px 14px" : "16px 18px",
              borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
              background: m.role === "user" ? "var(--purple)" : "var(--bg-raised)",
              color: m.role === "user" ? "var(--text-1)" : "var(--text-2)",
              border: m.role === "assistant" ? "1px solid var(--border)" : "none",
              fontSize: "14px", lineHeight: "1.7", fontFamily: "inherit",
            }}>
              {m.role === "user" ? (
                <span>{m.content}</span>
              ) : (
                <div className="ai-response">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 style={{ fontSize: "17px", fontWeight: "700", color: "#e8e8f0", margin: "0 0 10px", letterSpacing: "-0.02em" }}>{children}</h1>,
                      h2: ({ children }) => <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#d8d8e8", margin: "18px 0 8px", letterSpacing: "-0.01em" }}>{children}</h2>,
                      h3: ({ children }) => <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-2)", margin: "14px 0 6px" }}>{children}</h3>,
                      p: ({ children }) => <p style={{ margin: "0 0 12px", color: "#a8a8b8", lineHeight: "1.75" }}>{children}</p>,
                      ul: ({ children }) => <ul style={{ margin: "4px 0 12px", paddingLeft: "18px" }}>{children}</ul>,
                      ol: ({ children }) => <ol style={{ margin: "4px 0 12px", paddingLeft: "18px" }}>{children}</ol>,
                      li: ({ children }) => <li style={{ margin: "4px 0", color: "#a8a8b8", lineHeight: "1.65" }}>{children}</li>,
                      strong: ({ children }) => <strong style={{ color: "var(--text-1)", fontWeight: "600" }}>{children}</strong>,
                      em: ({ children }) => <em style={{ color: "#b8b8d0", fontStyle: "italic" }}>{children}</em>,
                      code: ({ children }) => (
                        <code style={{
                          background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)",
                          borderRadius: "5px", padding: "2px 7px", fontSize: "12px",
                          color: "var(--purple-light)", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        }}>{children}</code>
                      ),
                      pre: ({ children }) => (
                        <pre style={{
                          background: "rgba(0,0,0,0.3)", border: "1px solid rgba(var(--invert-rgb),0.08)",
                          borderRadius: "8px", padding: "14px 16px", overflow: "auto",
                          fontSize: "12px", margin: "10px 0", lineHeight: "1.6",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>{children}</pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote style={{
                          borderLeft: "3px solid var(--purple)", paddingLeft: "14px",
                          margin: "10px 0", color: "var(--text-2)", fontStyle: "italic",
                        }}>{children}</blockquote>
                      ),
                      hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />,
                    }}
                  >{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "7px", flexShrink: 0,
              background: "linear-gradient(135deg, var(--purple), #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: "700", color: "var(--text-1)",
            }}>Z</div>
            <div style={{
              background: "var(--bg-raised)", border: "1px solid var(--border)",
              borderRadius: "4px 12px 12px 12px", padding: "14px 18px",
              display: "flex", gap: "5px", alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: "6px", height: "6px", borderRadius: "50%", background: "var(--text-3)",
                  animation: "bounce 1.2s ease infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            className="input"
            placeholder="Ask a question... (press Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
            style={{ flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ flexShrink: 0, padding: "10px 20px" }}
          >
            {loading ? <span className="spinner" style={{ width: "14px", height: "14px" }} /> : "Send"}
          </button>
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-4)", marginTop: "8px" }}>
          Shift+Enter for a new line · Context-aware: knows your syllabus & weak areas
        </p>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        .ai-response > *:first-child { margin-top: 0 !important; }
        .ai-response > *:last-child { margin-bottom: 0 !important; }
      `}</style>
    </div>
  )
}