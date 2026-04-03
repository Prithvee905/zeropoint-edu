'use client'

import AIBrainBackground from "./components/AIBrainBackground"
import Link from "next/link"

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">

      {/* animated background */}
      <AIBrainBackground />

      {/* UI content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">

        <h1 className="text-5xl font-bold mb-6">
          Zeropoint AI Study System
        </h1>

        <p className="text-xl mb-6">
          Your daily AI powered study plan
        </p>

        <Link
          href="/dashboard"
          className="bg-white text-black px-6 py-3 rounded-lg"
        >
          Start Studying
        </Link>

      </div>

    </div>
  )
}