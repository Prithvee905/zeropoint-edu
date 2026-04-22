'use client'

import { useAuth } from "./components/AuthProvider"
import { useRouter } from "next/navigation"

export default function Home() {
  const { requireAuth } = useAuth()
  const router = useRouter()

  const handleAction = (target: string) => {
    requireAuth(() => router.push(target))
  }

  return (
    <div style={{ paddingBottom: "100px" }}>
      {/* Hero Section */}
      <div style={{ 
          display: "flex", flexDirection: "column", alignItems: "center", 
          minHeight: "calc(100vh - 72px)", textAlign: "center", position: "relative",
          padding: "10vh 0"
      }}>
        
        {/* Abstract shapes for premium feel */}
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: "300px", height: "300px", background: "rgba(124,58,237,0.1)", filter: "blur(100px)", borderRadius: "50%", zIndex: -1 }}></div>

        <span className="badge badge-purple" style={{ marginBottom: "24px", padding: "8px 18px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--purple-light)", display: "inline-block", marginRight: "8px" }} />
          AI-Powered Study Engine
        </span>

        <h1 style={{ 
            fontSize: "clamp(2.5rem, 8vw, 4.2rem)", 
            fontWeight: "900", letterSpacing: "-0.05em", lineHeight: "1.1", 
            marginBottom: "24px", maxWidth: "880px", color: "var(--text-1)" 
        }} className="hero-title">
          Forget random study.<br />
          <span style={{ background: "linear-gradient(135deg, var(--purple-light), #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Master your future.
          </span>
        </h1>

        <p style={{ fontSize: "clamp(16px, 2vw, 18px)", color: "var(--text-2)", maxWidth: "540px", lineHeight: "1.7", marginBottom: "40px", fontWeight: "400" }}>
          Upload your syllabus or goal. Zeropoint builds a custom roadmap, tutors you through every concept, and prepares you for mastery.
        </p>

        <div style={{ display: "flex", gap: "16px", marginBottom: "80px" }} className="mobile-stack mobile-full-width">
          <button 
            onClick={() => handleAction("/onboarding")} 
            className="btn-primary" 
            style={{ padding: "16px 32px", fontSize: "15px", fontWeight: "700", border: "none", cursor: "pointer", borderRadius: "14px", boxShadow: "0 20px 40px rgba(124,58,237,0.2)" }}
          >
            Build your plan now
          </button>
          <button 
            onClick={() => handleAction("/dashboard")} 
            className="btn-secondary" 
            style={{ padding: "16px 32px", fontSize: "15px", fontWeight: "600", border: "1px solid var(--border)", cursor: "pointer", borderRadius: "14px" }}
          >
            Resume dashboard
          </button>
        </div>

        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", maxWidth: "1100px", width: "100%", margin: "0 auto" }}>
          {[
            { icon: "✨", title: "Precision Roadmap", desc: "Day-by-day segments generated from your specific PDF or goal." },
            { icon: "🎓", title: "Personal AI Tutor", desc: "Stuck on a concept? Your tutor knows your syllabus inside out." },
            { icon: "⚡", title: "Adaptive Quizzes", desc: "Questions focus on exactly where you showed weakness today." },
          ].map(f => (
            <div key={f.title} className="card" style={{ padding: "28px", textAlign: "left", background: "rgba(var(--invert-rgb),0.02)", border: "1px solid rgba(var(--invert-rgb),0.04)" }}>
              <div style={{ fontSize: "28px", marginBottom: "16px" }}>{f.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--text-1)", marginBottom: "8px" }}>{f.title}</div>
              <div style={{ fontSize: "13px", color: "var(--text-3)", lineHeight: "1.6" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: Tangible Product Demo Artifact */}
      <div className="fade-up" style={{ maxWidth: "1280px", margin: "100px auto 0" }}>
        <div style={{ textAlign: "center", marginBottom: "48px", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "800", marginBottom: "12px" }}>See it in action</h2>
          <p style={{ color: "var(--text-3)" }}>This is how Zeropoint transforms a messy syllabus into a clear path.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", padding: "0 20px" }}>
          
          {/* Sample Roadmap Preview */}
          <div className="card" style={{ padding: "0", overflow: "hidden", border: "1px solid rgba(124,58,237,0.15)" }}>
            <div style={{ background: "rgba(124,58,237,0.06)", padding: "16px 24px", borderBottom: "1px solid rgba(124,58,237,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--purple-light)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Generated: Physics 101</span>
              <div className="pulse-dot" />
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { day: "D1", title: "Newtonian Mechanics", status: "completed" },
                { day: "D2", title: "Energy Dynamics", status: "active" },
                { day: "D3", title: "Circular Motion", status: "pending" },
              ].map((item, i) => (
                <div key={i} style={{ 
                  display: "flex", alignItems: "center", gap: "16px", padding: "12px 14px", 
                  background: item.status === 'active' ? 'rgba(var(--invert-rgb),0.04)' : 'transparent',
                  borderRadius: "10px", border: item.status === 'active' ? '1px solid rgba(var(--invert-rgb),0.06)' : '1px solid transparent'
                }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: item.status === 'completed' ? 'var(--green-light)' : 'var(--text-3)' }}>{item.day}</span>
                  <span style={{ fontSize: "13px", fontWeight: "600", flex: 1, color: item.status === 'pending' ? 'var(--text-4)' : '#fff' }}>{item.title}</span>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: item.status === 'completed' ? "none" : "2px solid rgba(var(--invert-rgb),0.04)", background: item.status === 'completed' ? "var(--green-light)" : "transparent" }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Sample AI Tutor Chat */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="card" style={{ padding: "20px", background: "linear-gradient(135deg, var(--bg-raised), var(--bg))" }}>
               <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--purple)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" }}>Z</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "10px", fontWeight: "800", color: "var(--purple-light)", marginBottom: "4px" }}>AI TUTOR</p>
                    <p style={{ fontSize: "13px", color: "#e0e0e8", lineHeight: "1.5" }}>Think of <strong>Potential Energy</strong> like a stretched rubber band. The energy is "stored" because of its position.</p>
                  </div>
               </div>
            </div>
            
            <div className="card" style={{ padding: "24px" }}>
               <h3 style={{ fontSize: "14px", fontWeight: "800", marginBottom: "8px" }}>Why it works?</h3>
               <p style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: "1.6" }}>
                 We break your goal into <strong>Learning Segments</strong> and build a <strong>Memory Map</strong> that ensures you never forget.
               </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}