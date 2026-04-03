import "./globals.css"
import Sidebar from "./components/Sidebar"
import FloatingAI from "./components/FloatingAI"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">

        <div className="flex min-h-screen relative overflow-hidden">

          {/* Stripe-style gradient background */}
          <div className="absolute inset-0 -z-10">

            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600 opacity-20 blur-3xl rounded-full"></div>

            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500 opacity-20 blur-3xl rounded-full"></div>

          </div>

          {/* Sidebar */}
          <Sidebar />

          {/* Page Content */}
          <main className="flex-1 p-10">
            {children}
          </main>

        </div>

        {/* Floating AI Button */}
        <FloatingAI />

      </body>
    </html>
  )
}