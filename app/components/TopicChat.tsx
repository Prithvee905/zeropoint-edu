"use client"

import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { useAuth } from "@/app/components/AuthProvider"

type Msg = { role: "user" | "assistant"; content: string }

interface Props {
  topicId: string
  topicTitle: string
}

export default function TopicChat({ topicId, topicTitle }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [init, setInit] = useState(true)
  const { user } = useAuth()
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Initialize session and load history
  useEffect(() => {
    if (topicId && user?.id) {
      initSession()
    }
  }, [topicId, user?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    if (msgs.length > 0 || loading) {
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [msgs, loading])

  const initSession = async () => {
    if (!user?.id) return;
    setInit(true)
    try {
      // 1. Find existing session for this topic
      const r = await fetch(`/api/chat-sessions?topicId=${topicId}&userId=${user.id}`)
      const d = await r.json()
      
      // Look for a session specifically linked to this topic_id
      const existing = d.sessions?.find((s: any) => s.topic_id === topicId)

      if (existing) {
        setSessionId(existing.id)
        // 2. Load messages for this session
        const mr = await fetch(`/api/chat-sessions/${existing.id}`)
        const md = await mr.json()
        if (md.messages) {
          setMsgs(md.messages.map((m: any) => ({ 
            role: m.role, 
            content: m.content 
          })))
        }
      } else {
        // 3. Create a new session if none exists
        const cr = await fetch("/api/chat-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${topicTitle} — Tutor Chat`,
            topicId,
            userId: user.id
          })
        })
        const cd = await cr.json()
        if (cd.session) {
          setSessionId(cd.session.id)
          setMsgs([])
        }
      }
    } catch (e) {
      console.error("TopicChat init error:", e)
    } finally {
      setInit(false)
    }
  }

  const send = async () => {
    if (!input.trim() || loading || !sessionId) return
    
    const text = input.trim()
    setInput("")
    
    // Optimistic update
    const userMsg: Msg = { role: "user", content: text }
    setMsgs(prev => [...prev, userMsg])
    setLoading(true)

    try {
      // Save user message to DB
      await fetch(`/api/chat-sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user", content: text })
      })

      // Get AI response
      const history = [...msgs, userMsg].map(m => ({ role: m.role, content: m.content }))
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, topicId })
      })
      
      const d = await r.json()
      const reply = d.reply || "I'm sorry, I couldn't generate a response."
      
      const assistantMsg: Msg = { role: "assistant", content: reply }
      setMsgs(prev => [...prev, assistantMsg])

      // Save AI reply to DB
      await fetch(`/api/chat-sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "assistant", content: reply })
      })
    } catch (error) {
      console.error("Chat error:", error)
      setMsgs(prev => [...prev, { role: "assistant", content: "Connection error. Your message was saved, but I couldn't respond right now." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "420px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg,var(--purple),#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "var(--text-1)" }}>Z</div>
          <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Ask the Tutor</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--green-light)" }} />
          <span style={{ fontSize: "10px", color: "var(--text-3)" }}>History Persistent</span>
        </div>
      </div>

      {/* Message Area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "16px" }}>
        {init ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-3)", fontSize: "12px", padding: "20px 0" }}>
            <div className="spinner" style={{ width: "14px", height: "14px" }} />
            Loading study history...
          </div>
        ) : msgs.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: "32px" }}>
            <p style={{ color: "var(--text-3)", fontSize: "13px", marginBottom: "14px" }}>
              Ask any question about <strong style={{ color: "var(--text-2)" }}>{topicTitle}</strong>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
              {[
                "Can you explain this simply?",
                "Give me a real-world example",
                "What are the core concepts?",
                "Common interview questions on this?"
              ].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  style={{ fontSize: "12px", padding: "6px 13px", borderRadius: "8px", background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer", transition: "all 0.15s" }}
                >{q}</button>
              ))}
            </div>
          </div>
        ) : (
          msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, marginTop: "2px" }}>
                {m.role === "assistant"
                  ? <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "linear-gradient(135deg,var(--purple),#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "var(--text-1)" }}>Z</div>
                  : <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "var(--bg-raised)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "600", color: "var(--text-2)" }}>U</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "11px", fontWeight: "600", color: m.role === "assistant" ? "var(--purple-light)" : "var(--text-3)", marginBottom: "5px" }}>
                  {m.role === "assistant" ? "Zeropoint AI" : "You"}
                </p>
                <div style={{ fontSize: "14px", lineHeight: "1.8", color: "var(--text-1)" }}>
                  <ReactMarkdown components={{
                    h1: ({ children }) => <h2 style={{ fontSize: "17px", fontWeight: "700", color: "var(--purple-light)", margin: "24px 0 12px", letterSpacing: "-0.01em" }}>{children}</h2>,
                    h2: ({ children }) => <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-1)", margin: "20px 0 10px" }}>{children}</h3>,
                    h3: ({ children }) => <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#d0d0e0", margin: "16px 0 8px" }}>{children}</h4>,
                    p: ({ children }) => <p style={{ margin: "0 0 16px", color: "var(--text-2)" }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ margin: "8px 0 16px", paddingLeft: "18px" }}>{children}</ul>,
                    li: ({ children }) => <li style={{ margin: "6px 0", color: "var(--text-2)" }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ color: "var(--text-1)", fontWeight: "600" }}>{children}</strong>,
                    code: ({ children }) => <code style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "6px", padding: "2px 6px", fontSize: "12px", color: "var(--purple-light)", fontFamily: "monospace" }}>{children}</code>,
                    blockquote: ({ children }) => (
                      <div style={{ 
                        borderLeft: "3px solid var(--purple)", 
                        background: "rgba(124,58,237,0.04)",
                        borderRadius: "0 8px 8px 0",
                        padding: "12px 16px",
                        margin: "16px 0",
                        fontStyle: "italic",
                        color: "var(--text-1)"
                      }}>{children}</div>
                    ),
                    hr: () => <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />,
                  }}>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "linear-gradient(135deg,var(--purple),#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "var(--text-1)" }}>Z</div>
            <div style={{ paddingTop: "6px" }}>
              <div className="spinner" style={{ width: "12px", height: "12px" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Field */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
        <div style={{
          display: "flex", gap: "8px", alignItems: "flex-end",
          background: "var(--bg-raised)", border: "1px solid var(--border)",
          borderRadius: "10px", padding: "10px 12px"
        }}>
          <textarea
            ref={inputRef}
            rows={1}
            disabled={init}
            placeholder="Ask a doubt..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "var(--text-1)", fontSize: "13px", lineHeight: "1.6", resize: "none",
              fontFamily: "inherit"
            }}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{
              background: input.trim() ? "var(--purple)" : "transparent",
              border: "none", borderRadius: "6px", width: "28px", height: "28px",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
