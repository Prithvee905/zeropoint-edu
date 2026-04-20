'use client'

import "./globals.css"
import Sidebar from "./components/Sidebar"
import NavProgress from "./components/NavProgress"
import PageTransition from "./components/PageTransition"
import { AuthProvider } from "./components/AuthProvider"
import { useState } from "react"
import Link from "next/link"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/> 
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "var(--bg)" }}>
        <AuthProvider>
          <NavProgress />
          
          <div style={{ display: "flex", minHeight: "100vh", position: "relative" }}>
            
            {/* Mobile Header (Only visible on small screens) */}
            <header style={{
              position: "fixed", top: 0, left: 0, right: 0, height: "64px",
              background: "rgba(12,12,14,0.8)", backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 20px", zIndex: 100,
              visibility: "hidden" // Will be overridden in media query below
            }} className="mobile-header">
               <button 
                onClick={() => setIsSidebarOpen(true)}
                style={{ background: "none", border: "none", color: "#fff", padding: "8px", cursor: "pointer" }}
               >
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
               </button>
               <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#fff" }}>Z</div>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#fff", letterSpacing: "-0.02em" }}>Zeropoint</span>
               </Link>
               <div style={{ width: "40px" }} /> {/* Spacer */}
            </header>

            {/* Sidebar / Drawer */}
            <div 
              style={{
                position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 1000,
                transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: "translateX(0)" 
              }}
              className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}
            >
              {/* Overlay for mobile drawer */}
              <div 
                className="sidebar-overlay"
                onClick={() => setIsSidebarOpen(false)}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", opacity: isSidebarOpen ? 1 : 0, pointerEvents: isSidebarOpen ? 'auto' : 'none', transition: "opacity 0.3s", zIndex: -1 }}
              />
              <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            <main style={{ flex: 1, overflowY: "auto", position: "relative" }} className="main-content">
              <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 60px 80px" }} className="content-inner">
                <PageTransition>
                  {children}
                </PageTransition>
              </div>
            </main>
          </div>
        </AuthProvider>

        <style>{`
          @media (max-width: 768px) {
            .mobile-header { visibility: visible !important; }
            .sidebar-container { 
              transform: translateX(-100%); 
            }
            .sidebar-container.open { transform: translateX(0); }
            .content-inner { padding: 100px 20px 60px !important; }
            .main-content { padding-top: 0 !important; }
          }
          @media (min-width: 769px) {
            .sidebar-container { position: sticky !important; transform: none !important; }
            .sidebar-overlay { display: none !important; }
          }
        `}</style>
      </body>
    </html>
  )
}