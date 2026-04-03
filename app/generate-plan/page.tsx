'use client'

import { useEffect, useState } from "react"
import Link from "next/link"

export default function GeneratePlan() {

    const [plan, setPlan] = useState<string[]>([])

    useEffect(() => {

        const data = JSON.parse(localStorage.getItem("studyPlanInput") || "{}")

        const generatedPlan = [
            `Learn fundamentals of ${data.subject}`,
            "Solve 5 practice problems",
            "Take a quick quiz",
            "Review mistakes"
        ]

        setPlan(generatedPlan)

        localStorage.setItem("studyPlan", JSON.stringify(generatedPlan))

    }, [])

    return (

        <div className="max-w-xl mx-auto text-white space-y-6">

            <h1 className="text-4xl font-bold text-center">
                Your AI Study Plan
            </h1>

            <div className="space-y-3">

                {plan.map((task, i) => (
                    <div
                        key={i}
                        className="bg-white text-black p-4 rounded-lg shadow"
                    >
                        Day {i + 1} — {task}
                    </div>
                ))}

            </div>

            <Link
                href="/dashboard"
                className="block text-center bg-purple-600 py-3 rounded-lg mt-6 hover:bg-purple-700 transition"
            >
                Start Studying
            </Link>

        </div>
    )
}