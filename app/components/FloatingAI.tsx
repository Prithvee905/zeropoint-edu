'use client'

import { useRouter } from "next/navigation"

export default function FloatingAI() {

    const router = useRouter()

    return (
        <button
            onClick={() => router.push("/chat")}
            className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white w-16 h-16 rounded-full shadow-lg text-xl flex items-center justify-center transition"
        >
            AI
        </button>
    )
}