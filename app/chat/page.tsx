"use client"

import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import ReactMarkdown from "react-markdown"

type Msg = { id?: string; role: "user" | "assistant"; content: string }
type Session = { id: string; title: string; updated_at: string; topic_id?: string }

// ── helpers ────────────────────────────────────────────────────────
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
  const [roadmap, setRoadmap] = useState<any>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { loadSessions(); loadRoadmap() }, [])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs, loading])
  useEffect(() => { inputRef.current?.focus() }, [activeId])

  const loadRoadmap = async () => {
    const id = localStorage.getItem("activeRoadmapId")
    if (id) {
        const { data } = await supabase.from("roadmaps").select("*").eq("id", id).single()
        setRoadmap(data)
    }
  }

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

    await fetch(`/api/chat-sessions/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content: text })
    })

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

  // ── Sidebar Section Overlay ──
  const SidebarSection = ({ label, items }: { label: string; items: Session[] }) => {
    if (!items.length) return null
    return (
      <div style={{ marginBottom: "4px" }}>
        <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.12em", padding: "12px 14px 4px" }}>{label}</p>
        {items.map(s => (
          <div key={s.id}
            onClick={() => editingId !== s.id && openSession(s.id)}
            style={{
              display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
              borderRadius: "10px", cursor: "pointer", margin: "2px 8px",
              background: activeId === s.id ? "rgba(124,58,237,0.15)" : "transparent",
              border: activeId === s.id ? "1px solid rgba(124,58,237,0.2)" : "1px solid transparent",
              transition: "all 0.2s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <span style={{ fontSize: "12px", color: activeId === s.id ? "var(--text-1)" : "var(--text-3)" }}>#</span>
            {editingId === s.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") saveTitle(s.id); if (e.key === "Escape") setEditingId(null) }}
                onBlur={() => saveTitle(s.id)}
                onClick={e => e.stopPropagation()}
                style={{ flex: 1, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: "6px", padding: "2px 8px", fontSize: "12px", color: "var(--text-1)", outline: "none", fontFamily: "inherit" }}
              />
            ) : (
              <span style={{ flex: 1, fontSize: "12px", color: activeId === s.id ? "var(--text-1)" : "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: activeId === s.id ? "600" : "400" }}>
                {s.title}
              </span>
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
        width: sidebarOpen ? "280px" : "0px",
        minWidth: sidebarOpen ? "280px" : "0px",
        background: "var(--bg)",
        borderRight: "1px solid rgba(var(--invert-rgb),0.06)",
        display: "flex", flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}>
        <div style={{ padding: "20px 16px 12px", flexShrink: 0 }}>
          <button onClick={newChat} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px",
            background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.1))", border: "1px solid rgba(124,58,237,0.2)",
            borderRadius: "12px", cursor: "pointer", color: "var(--purple-light)", fontSize: "13px", fontWeight: "700",
            fontFamily: "inherit", transition: "all 0.2s",
          }}>
            <span style={{ fontSize: "18px" }}>+</span>
            New Discussion
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          <SidebarSection label="Today" items={groups.today} />
          <SidebarSection label="Past Sessions" items={[...groups.yesterday, ...groups.older]} />
        </div>
        
        {/* Dynamic Grounding Context (Vercel Artifact Request) */}
        {roadmap && (
          <div style={{ padding: "20px", borderTop: "1px solid rgba(var(--invert-rgb),0.04)", background: "rgba(124,58,237,0.02)" }}>
              <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Active Grounding</p>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--green-light) shadow-[0_0_10px_rgba(74,222,128,0.5)]" }}></div>
                  <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{roadmap.subject}</span>
              </div>
          </div>
        )}
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
        
        {/* Grounded Top Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 32px", borderBottom: "1px solid rgba(var(--invert-rgb),0.06)", background: "rgba(0,0,0,0.1)", backdropFilter: "blur(10px)", zIndex: 10 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "8px", borderRadius: "8px", display: "flex", transition: "all 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color="var(--text-1)")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-1)" }}>{activeId ? sessions.find(s => s.id === activeId)?.title : "Tutor Hub"}</span>
            {roadmap && !activeId && <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>Grounded in your goals for <strong style={{ color: "var(--purple-light)" }}>{roadmap.subject}</strong></p>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 14px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "10px" }}>
             <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green-light)" }} />
             <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--purple-light)" }}>ZEROPOINT AI ONLINE</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
          {!activeId ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "32px", textAlign: "center", padding: "40px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "linear-gradient(135deg,var(--purple),#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "800", color: "var(--text-1)", boxShadow: "0 20px 50px rgba(124,58,237,0.3)" }}>Z</div>
              <div>
                <h1 style={{ fontSize: "32px", fontWeight: "900", marginBottom: "12px", letterSpacing: "-0.04em" }}>Insight Hub</h1>
                <p style={{ fontSize: "15px", color: "var(--text-3)", maxWidth: "420px", lineHeight: "1.6" }}>Your context-aware study partner. Ask anything about your roadmap, concepts, or problem-solving approaches.</p>
              </div>
              <button onClick={newChat} className="btn-primary" style={{ padding: "14px 32px", borderRadius: "14px", fontWeight: "800" }}>Start New Discussion</button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "540px" }}>
                {[ "Explain the core mechanics of my last topic", "What are common pitfalls in this subject?", "Can you design a practice problem for me?", "Summarize my progress so far" ].map(q => (
                  <button key={q} onClick={async () => { await newChat(); setTimeout(() => setInput(q), 300) }} style={{ fontSize: "13px", padding: "16px", borderRadius: "12px", background: "rgba(var(--invert-rgb),0.02)", border: "1px solid rgba(var(--invert-rgb),0.04)", color: "var(--text-2)", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(124,58,237,0.3)"; e.currentTarget.style.background="rgba(124,58,237,0.02)"; }}>{q}</button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 32px" }}>
                {msgs.map((m, i) => (
                    <div key={i} style={{ marginBottom: "40px", display: "flex", gap: "20px" }}>
                        <div style={{ flexShrink: 0, width: "36px", height: "36px", borderRadius: "12px", background: m.role === 'assistant' ? 'linear-gradient(135deg,var(--purple),#4f46e5)' : 'var(--bg-raised)', display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "var(--text-1)", fontSize: "13px" }}>{m.role === 'assistant' ? 'Z' : 'U'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "12px", fontWeight: "800", color: m.role === 'assistant' ? 'var(--purple-light)' : 'var(--text-3)', marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{m.role === 'assistant' ? 'Zeropoint Intelligence' : 'You'}</p>
                            <div style={{ fontSize: "15px", lineHeight: "1.8", color: m.role === 'assistant' ? 'var(--text-2)' : 'var(--text-1)' }}>
                                <ReactMarkdown components={{
                                    h1: ({ children }) => <h2 style={{ fontSize: "20px", fontWeight: "900", color: "var(--text-1)", margin: "32px 0 16px" }}>{children}</h2>,
                                    blockquote: ({ children }) => <div style={{ borderLeft: "4px solid var(--purple)", background: "rgba(124,58,237,0.03)", padding: "16px 20px", borderRadius: "0 12px 12px 0", margin: "24px 0", color: "var(--text-1)", fontStyle: "italic" }}>{children}</div>,
                                    code: ({ children }) => <code style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "6px", padding: "2px 6px", fontSize: "13px", color: "var(--purple-light)", fontFamily: "monospace" }}>{children}</code>,
                                    pre: ({ children }) => <pre style={{ background: "var(--bg)", border: "1px solid rgba(var(--invert-rgb),0.06)", borderRadius: "12px", padding: "20px", overflow: "auto", margin: "20px 0" }}>{children}</pre>
                                }}>{m.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}><div style={{ width: "36px", height: "36px", borderRadius: "12px", background: "linear-gradient(135deg,var(--purple),#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "var(--text-1)" }}>Z</div><div style={{ alignSelf: "center" }}><div className="spinner" style={{ width: "16px", height: "16px" }} /></div></div>}
                <div ref={endRef} style={{ height: "160px" }} />
            </div>
          )}
        </div>

        {/* Input Grounded */}
        {activeId && (
            <div style={{ padding: "0 32px 32px", position: "relative" }}>
                <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
                    <div style={{ position: "absolute", top: "-24px", left: "20px", display: "flex", gap: "8px" }}>
                       <div style={{ padding: "4px 10px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "8px 8px 0 0", fontSize: "10px", fontWeight: "800", color: "var(--purple-light)", textTransform: "uppercase" }}>Context: {roadmap?.subject || 'Global'}</div>
                    </div>
                    <div style={{ background: "var(--bg-subtle)", border: "1px solid rgba(var(--invert-rgb),0.06)", borderRadius: "20px", padding: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                        <textarea ref={inputRef} rows={1} placeholder="Inquire with AI..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} style={{ width: "100%", background: "none", border: "none", outline: "none", color: "var(--text-1)", fontSize: "15px", padding: "12px", resize: "none", fontFamily: "inherit" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px 4px", borderTop: "1px solid rgba(var(--invert-rgb),0.03)" }}>
                            <span style={{ fontSize: "11px", color: "var(--text-4)" }}>ZERPOINT v1.2 • Semantic Grounding Active</span>
                            <button onClick={send} disabled={loading || !input.trim()} style={{ background: input.trim() ? "var(--purple)" : "rgba(var(--invert-rgb),0.03)", border: "none", borderRadius: "10px", padding: "8px 16px", color: "var(--text-1)", cursor: "pointer", fontSize: "12px", fontWeight: "800", transition: "all 0.2s" }}>SEND →</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}