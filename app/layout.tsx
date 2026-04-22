'use client'

import "./globals.css"
import Sidebar from "./components/Sidebar"
import DesktopNav from "./components/DesktopNav"
import NavProgress from "./components/NavProgress"
import PageTransition from "./components/PageTransition"
import { AuthProvider } from "./components/AuthProvider"
import { ThemeProvider } from "./components/ThemeProvider"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Auto-close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover"/> 
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "var(--bg)", margin: 0, padding: 0, overflowX: "hidden" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
          <NavProgress />
          <DesktopNav />
          
          <div style={{ display: "flex", minHeight: "100vh", position: "relative", flexDirection: "column" }}>
            
            {/* MOBILE NAVIGATION BAR (iOS Native Style) */}
            <header style={{
              position: "fixed", top: 0, left: 0, right: 0, 
              height: "calc(64px + env(safe-area-inset-top))",
              paddingTop: "env(safe-area-inset-top)",
              background: "rgba(var(--bg-rgb),0.85)", backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(var(--invert-rgb),0.08)",
              display: "none", alignItems: "center", justifyContent: "space-between",
              paddingLeft: "20px", paddingRight: "20px", zIndex: 100,
            }} className="mobile-only-flex">
               <button 
                onClick={() => setIsSidebarOpen(true)}
                style={{ 
                    background: "rgba(var(--invert-rgb),0.05)", border: "none", color: "var(--text-1)", 
                    width: "40px", height: "40px", borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" 
                }}
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
               </button>
               <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "7px", background: "linear-gradient(135deg, var(--purple), #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "var(--text-1)" }}>Z</div>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--text-1)", letterSpacing: "-0.02em" }}>Zeropoint</span>
               </Link>
               <div style={{ width: "40px" }} />
            </header>

            <div style={{ display: "flex", flex: 1, position: "relative" }}>
                
                {/* SIDEBAR DRAWER SYSTEM */}
                <div 
                    className={`sidebar-root ${isSidebarOpen ? 'is-open' : ''}`}
                    style={{ zIndex: 1000 }}
                >
                    {/* Backdrop / Overlay */}
                    <div 
                        className="sidebar-backdrop"
                        onClick={() => setIsSidebarOpen(false)}
                        style={{
                            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(4px)", pointerEvents: isSidebarOpen ? 'auto' : 'none',
                            opacity: isSidebarOpen ? 1 : 0, transition: "opacity 0.4s",
                        }}
                    />
                    
                    {/* Sidebar Body */}
                    <div 
                        className="sidebar-body"
                        style={{
                            position: "fixed", top: 0, left: 0, bottom: 0, width: "280px",
                            background: "var(--bg)", zIndex: 1001,
                            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                            paddingTop: "env(safe-area-inset-top)",
                        }}
                    >
                        <Sidebar onClose={() => setIsSidebarOpen(false)} />
                    </div>
                </div>

                <main style={{ flex: 1, minHeight: "100vh" }} className="main-content-area">
                    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 60px 80px" }} className="responsive-container">
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </div>
                </main>
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </body>
  </html>
  )
}