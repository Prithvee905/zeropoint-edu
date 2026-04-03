'use client'

import Link from "next/link"

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-black text-white p-6 border-r border-gray-800">

            <h1 className="text-2xl font-bold mb-10">
                Zeropoint
            </h1>

            <nav className="flex flex-col gap-4 text-gray-300">

                <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                </Link>

                <Link href="/chat" className="hover:text-white">
                    AI Chat
                </Link>

                <Link href="/quiz" className="hover:text-white">
                    Quiz
                </Link>

                <Link href="/progress" className="hover:text-white">
                    Progress
                </Link>

            </nav>

        </div>
    )
}