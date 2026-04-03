'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Onboarding() {

    const router = useRouter()

    const [subject, setSubject] = useState("")
    const [goal, setGoal] = useState("")
    const [examDate, setExamDate] = useState("")
    const [hours, setHours] = useState("")

    const handleSubmit = () => {

        const data = {
            subject,
            goal,
            examDate,
            hours
        }

        localStorage.setItem("studyPlanInput", JSON.stringify(data))

        router.push("/generate-plan")
    }

    return (

        <div className="max-w-xl mx-auto text-white space-y-6">

            <h1 className="text-4xl font-bold text-center mb-8">
                Create Your Study Plan
            </h1>

            {/* Subject */}
            <div>
                <label className="block mb-2 text-sm">Subject</label>

                <input
                    placeholder="DSA, Math, Physics"
                    className="w-full p-3 rounded-lg bg-white text-black border"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
            </div>

            {/* Goal */}
            <div>
                <label className="block mb-2 text-sm">Goal</label>

                <input
                    placeholder="Crack coding interview"
                    className="w-full p-3 rounded-lg bg-white text-black border"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                />
            </div>

            {/* Exam Date */}
            <div>
                <label className="block mb-2 text-sm">Exam Date</label>

                <input
                    type="date"
                    className="w-full p-3 rounded-lg bg-white text-black border"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                />
            </div>

            {/* Study Hours */}
            <div>
                <label className="block mb-2 text-sm">Study Hours per Day</label>

                <input
                    placeholder="2"
                    className="w-full p-3 rounded-lg bg-white text-black border"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                />
            </div>

            <button
                onClick={handleSubmit}
                className="w-full bg-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
                Generate AI Plan
            </button>

        </div>
    )
}