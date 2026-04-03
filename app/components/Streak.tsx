'use client'

import { useEffect, useState } from "react"

export default function Streak() {

    const [streak, setStreak] = useState(0)

    useEffect(() => {

        const stored = Number(localStorage.getItem("studyStreak") || 0)

        setStreak(stored)

    }, [])

    return (

        <div className="bg-white text-black p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-3">
                Study Streak
            </h2>

            <p className="text-lg font-bold">
                🔥 {streak} Day Study Streak
            </p>

            <p className="text-sm text-gray-600 mt-2">
                Complete today's tasks to maintain your streak
            </p>

        </div>

    )
}