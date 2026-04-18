import "./globals.css"
import Sidebar from "./components/Sidebar"
import NavProgress from "./components/NavProgress"
import PageTransition from "./components/PageTransition"

export const metadata = {
  title: "Zeropoint — AI Study System",
  description: "Transform any syllabus or goal into a complete, structured learning experience.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <NavProgress />
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px 80px" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}