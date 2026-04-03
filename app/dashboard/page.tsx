'use client'

import TodayTasks from "../components/TodayTasks"
import Streak from "../components/Streak"
import Link from "next/link"

export default function Dashboard() {
    return (

        <div className="space-y-8">

            {/* Dashboard Title */}
            <div>

                <h1 className="text-3xl font-bold text-white">
                    Dashboard
                </h1>

                <Link
                    href="/onboarding"
                    className="inline-block bg-purple-600 text-white px-5 py-2 rounded-lg mt-4 hover:bg-purple-700 transition"
                >
                    Create AI Study Plan
                </Link>

            </div>

            {/* Today's Study Tasks */}
            <TodayTasks />

            {/* Study Streak */}
            <Streak />

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-6">

                <Link href="/chat">
                    <div className="bg-white text-black p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition">

                        <h2 className="text-lg font-semibold mb-2">
                            AI Tutor
                        </h2>

                        <p className="text-gray-600">
                            Ask questions and get explanations
                        </p>

                    </div>
                </Link>

                <Link href="/quiz">
                    <div className="bg-white text-black p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition">

                        <h2 className="text-lg font-semibold mb-2">
                            Practice Quiz
                        </h2>

                        <p className="text-gray-600">
                            Test your knowledge
                        </p>

                    </div>
                </Link>

                <Link href="/progress">
                    <div className="bg-white text-black p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition">

                        <h2 className="text-lg font-semibold mb-2">
                            Progress
                        </h2>

                        <p className="text-gray-600">
                            Track your learning progress
                        </p>

                    </div>
                </Link>

            </div>

            {/* Progress Bar */}
            <div className="bg-white text-black p-6 rounded-xl shadow">

                <h2 className="text-xl font-semibold mb-3">
                    Today's Progress
                </h2>

                <div className="w-full bg-gray-200 h-4 rounded">

                    <div className="bg-black h-4 rounded w-[60%]"></div>

                </div>

                <p className="text-sm text-gray-600 mt-2">
                    60% completed today
                </p>

            </div>

        </div>

    )
}