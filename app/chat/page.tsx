"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import ReactMarkdown from "react-markdown"

type Msg = { id?: string; role: "user" | "assistant"; content: string }
type Session = { id: string; title: string; updated_at: string; topic_id?: string }

// ── helpers ────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "Just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString()
}

function groupSessions(sessions: Session[]) {
  const today: Session[] = [], yesterday: Session[] = [], older: Session[] = []
  const now = Date.now()
  sessions.forEach(s => {
    const diff = now - new Date(s.updated_at).getTime()
    if (diff < 86400000) today.push(s)
    else if (diff < 172800000) yesterday.push(s)
    else older.push(s)
  })
  return { today, yesterday, older }
}

// ── component ──────────────────────────────────────────────────────
export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingSession, setLoadingSession] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { loadSessions() }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs, loading])
  useEffect(() => { inputRef.current?.focus() }, [activeId])

  const loadSessions = async () => {
    const r = await fetch("/api/chat-sessions")
    const d = await r.json()
    setSessions(d.sessions || [])
  }

  const openSession = async (id: string) => {
    if (id === activeId) return
    setLoadingSession(true)
    setActiveId(id)
    setMsgs([])
    const r = await fetch(`/api/chat-sessions/${id}`)
    const d = await r.json()
    setMsgs((d.messages || []).map((m: any) => ({ id: m.id, role: m.role, content: m.content })))
    setLoadingSession(false)
  }

  const newChat = async () => {
    const r = await fetch("/api/chat-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat", roadmapId: localStorage.getItem("activeRoadmapId") })
    })
    const d = await r.json()
    if (d.session) {
      setSessions(s => [d.session, ...s])
      setActiveId(d.session.id)
      setMsgs([])
      inputRef.current?.focus()
    }
  }

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`/api/chat-sessions/${id}`, { method: "DELETE" })
    setSessions(s => s.filter(x => x.id !== id))
    if (activeId === id) { setActiveId(null); setMsgs([]) }
  }

  const saveTitle = async (id: string) => {
    if (!editTitle.trim()) return
    await fetch(`/api/chat-sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim() })
    })
    setSessions(s => s.map(x => x.id === id ? { ...x, title: editTitle.trim() } : x))
    setEditingId(null)
  }

  const send = async () => {
    if (!input.trim() || loading || !activeId) return
    const text = input.trim()
    setInput("")

    const userMsg: Msg = { role: "user", content: text }
    setMsgs(m => [...m, userMsg])
    setLoading(true)

    // Save user message to DB
    await fetch(`/api/chat-sessions/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content: text })
    })

    // Auto-title if this is the first message
    const isFirst = msgs.length === 0
    if (isFirst) {
      const shortTitle = text.length > 50 ? text.substring(0, 47) + "..." : text
      fetch(`/api/chat-sessions/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: shortTitle })
      })
      setSessions(s => s.map(x => x.id === activeId ? { ...x, title: shortTitle, updated_at: new Date().toISOString() } : x))
    } else {
      setSessions(s => s.map(x => x.id === activeId ? { ...x, updated_at: new Date().toISOString() } : x))
    }

    try {
      const history = [...msgs, userMsg].map(m => ({ role: m.role, content: m.content }))
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      })
      const d = await r.json()
      const reply = d.reply || "No response."
      setMsgs(m => [...m, { role: "assistant", content: reply }])

      // Save AI reply to DB
      await fetch(`/api/chat-sessions/${activeId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "assistant", content: reply })
      })
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Connection error. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
  }

  const groups = groupSessions(sessions)

  // ── Sidebar Section ──────────────────────────────────────
  const SidebarSection = ({ label, items }: { label: string; items: Session[] }) => {
    if (!items.length) return null
    return (
      <div style={{ marginBottom: "4px" }}>
        <p style={{ fontSize: "10px", fontWeight: "600", color: "#3f3f48", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px 4px" }}>{label}</p>
        {items.map(s => (
          <div key={s.id}
            onClick={() => editingId !== s.id && openSession(s.id)}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px",
              borderRadius: "7px", cursor: "pointer", margin: "0 4px 1px",
              background: activeId === s.id ? "rgba(124,58,237,0.12)" : "transparent",
              border: activeId === s.id ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
              transition: "all 0.12s", position: "relative",
            }}
            onMouseEnter={e => { if (activeId !== s.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)" }}
            onMouseLeave={e => { if (activeId !== s.id) (e.currentTarget as HTMLElement).style.background = "transparent" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={activeId === s.id ? "#a78bfa" : "#52525e"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>

            {editingId === s.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveTitle(s.id); if (e.key === "Escape") setEditingId(null) }}
                onBlur={() => saveTitle(s.id)}
                onClick={e => e.stopPropagation()}
                style={{ flex: 1, background: "var(--bg-raised)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: "5px", padding: "2px 7px", fontSize: "12px", color: "#e0e0f0", outline: "none", fontFamily: "inherit" }}
              />
            ) : (
              <span style={{ flex: 1, fontSize: "12px", color: activeId === s.id ? "#e0e0f0" : "#8b8b99", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.title}
              </span>
            )}

            {activeId === s.id && editingId !== s.id && (
              <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title) }}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#52525e", borderRadius: "4px", transition: "color 0.12s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#a78bfa"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#52525e"}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button onClick={e => deleteSession(s.id, e)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: "#52525e", borderRadius: "4px", transition: "color 0.12s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#f87171"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#52525e"}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", minHeight: "600px", gap: "0", margin: "-40px -48px", overflow: "hidden" }}>

      {/* ── LEFT SIDEBAR ── */}
      <div style={{
        width: sidebarOpen ? "260px" : "0px",
        minWidth: sidebarOpen ? "260px" : "0px",
        background: "#0e0e11",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s cubic-bezier(0.16,1,0.3,1), min-width 0.25s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}>

        {/* New Chat button */}
        <div style={{ padding: "16px 12px 12px", flexShrink: 0 }}>
          <button onClick={newChat} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px",
            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: "8px", cursor: "pointer", color: "#a78bfa", fontSize: "13px", fontWeight: "500",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.18)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.1)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New chat
          </button>
        </div>

        {/* Sessions list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 4px 12px" }}>
          {sessions.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#3f3f48", padding: "16px 14px" }}>No conversations yet. Click "New chat" to start.</p>
          ) : (
            <>
              <SidebarSection label="Today" items={groups.today} />
              <SidebarSection label="Yesterday" items={groups.yesterday} />
              <SidebarSection label="Older" items={groups.older} />
            </>
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#52525e", padding: "6px", borderRadius: "6px", display: "flex", transition: "all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#e0e0f0"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)" }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#52525e"; (e.currentTarget as HTMLElement).style.background = "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#e0e0f0" }}>
            {activeId ? (sessions.find(s => s.id === activeId)?.title || "Chat") : "AI Tutor"}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s ease infinite" }} />
            <span style={{ fontSize: "11px", color: "#52525e" }}>Zeropoint AI</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>

          {/* No session selected */}
          {!activeId && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", textAlign: "center", padding: "40px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700", color: "#fff" }}>Z</div>
              <div>
                <h2 style={{ marginBottom: "6px" }}>How can I help you study?</h2>
                <p style={{ fontSize: "14px", color: "#52525e", maxWidth: "380px" }}>Your AI tutor — deep explanations, real examples, and personalized to your weak areas.</p>
              </div>
              <button onClick={newChat} style={{
                display: "flex", alignItems: "center", gap: "7px", padding: "10px 22px",
                background: "#7c3aed", border: "none", borderRadius: "8px", color: "#fff",
                fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#6d28d9"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#7c3aed"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Start new chat
              </button>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", maxWidth: "440px" }}>
                {["Explain this topic in depth", "Give me a step-by-step breakdown", "What are the key concepts I need to know?", "Can you give me real-world examples?"].map(q => (
                  <button key={q} onClick={async () => { await newChat(); setTimeout(() => setInput(q), 300) }}
                    style={{ fontSize: "12px", padding: "7px 14px", borderRadius: "8px", background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "#8b8b99", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", textAlign: "left" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.35)"; (e.currentTarget as HTMLElement).style.color = "#a78bfa" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "#8b8b99" }}
                  >{q}</button>
                ))}
              </div>
            </div>
          )}

          {/* Loading session messages */}
          {activeId && loadingSession && (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: "80px" }}>
              <div className="spinner" />
            </div>
          )}

          {/* Messages */}
          {activeId && !loadingSession && (
            <div style={{ maxWidth: "760px", margin: "0 auto", padding: "24px 24px 0" }}>
              {msgs.length === 0 && (
                <div style={{ textAlign: "center", paddingTop: "60px", color: "#3f3f48", fontSize: "13px" }}>
                  Start by asking a question below...
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} style={{ marginBottom: "28px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  {/* Avatar */}
                  <div style={{ flexShrink: 0, marginTop: "2px" }}>
                    {m.role === "assistant" ? (
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#fff" }}>Z</div>
                    ) : (
                      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "#27272a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: "#a0a0b0" }}>U</div>
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: m.role === "assistant" ? "#a78bfa" : "#6b6b78", marginBottom: "6px" }}>
                      {m.role === "assistant" ? "Zeropoint AI" : "You"}
                    </p>
                    {m.role === "user" ? (
                      <p style={{ fontSize: "15px", color: "#e0e0f0", lineHeight: "1.65" }}>{m.content}</p>
                    ) : (
                      <div style={{ fontSize: "14px", lineHeight: "1.75", color: "#a8a8b8" }}>
                        <ReactMarkdown components={{
                          h1: ({ children }) => <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#e8e8f0", margin: "0 0 12px", letterSpacing: "-0.02em" }}>{children}</h1>,
                          h2: ({ children }) => <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#d8d8e8", margin: "20px 0 10px" }}>{children}</h2>,
                          h3: ({ children }) => <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#c8c8d8", margin: "16px 0 8px" }}>{children}</h3>,
                          p: ({ children }) => <p style={{ margin: "0 0 14px", lineHeight: "1.8" }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ margin: "6px 0 14px", paddingLeft: "20px" }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ margin: "6px 0 14px", paddingLeft: "20px" }}>{children}</ol>,
                          li: ({ children }) => <li style={{ margin: "6px 0", lineHeight: "1.7" }}>{children}</li>,
                          strong: ({ children }) => <strong style={{ color: "#e0e0f0", fontWeight: "600" }}>{children}</strong>,
                          code: ({ children }) => <code style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "5px", padding: "2px 7px", fontSize: "12px", color: "#a78bfa", fontFamily: "monospace" }}>{children}</code>,
                          pre: ({ children }) => <pre style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "16px 18px", overflow: "auto", fontSize: "12px", margin: "12px 0", fontFamily: "monospace", lineHeight: "1.6" }}>{children}</pre>,
                          blockquote: ({ children }) => <blockquote style={{ borderLeft: "3px solid #7c3aed", paddingLeft: "16px", margin: "12px 0", color: "#8b8b99", fontStyle: "italic" }}>{children}</blockquote>,
                          hr: () => <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "20px 0" }} />,
                        }}>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ marginBottom: "28px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>Z</div>
                  <div style={{ paddingTop: "8px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "#a78bfa", marginBottom: "10px" }}>Zeropoint AI</p>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      {[0, 1, 2].map(i => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#7c3aed", animation: "bounce 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} style={{ height: "120px" }} />
            </div>
          )}
        </div>

        {/* ── INPUT BAR ── */}
        {activeId && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px 20px", background: "var(--bg)", flexShrink: 0 }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
              <div style={{
                display: "flex", gap: "10px", alignItems: "flex-end",
                background: "var(--bg-subtle)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "10px 14px",
                transition: "border-color 0.18s, box-shadow 0.18s",
                boxShadow: "0 0 0 0 rgba(124,58,237,0)",
              }}
                onFocusCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.4)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)" }}
                onBlurCapture={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 transparent" }}
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Message Zeropoint AI..."
                  value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    e.target.style.height = "auto"
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"
                  }}
                  onKeyDown={handleKey}
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "#e0e0f0", fontSize: "14px", lineHeight: "1.6", resize: "none",
                    fontFamily: "inherit", maxHeight: "160px", overflow: "auto",
                    padding: "2px 0",
                  }}
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  style={{
                    width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
                    background: input.trim() && !loading ? "#7c3aed" : "rgba(255,255,255,0.05)",
                    border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {loading
                    ? <div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#fff" : "#52525e"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  }
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "#2a2a32", textAlign: "center", marginTop: "8px" }}>
                Shift+Enter for new line · Context-aware: knows your syllabus & weak areas
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  )
}