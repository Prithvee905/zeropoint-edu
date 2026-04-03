'use client'

import { useState, useEffect } from "react"

export default function TodayTasks() {

    const [tasks, setTasks] = useState<any[]>([])

    useEffect(() => {

        const storedPlan = JSON.parse(localStorage.getItem("studyPlan") || "[]")

        const formatted = storedPlan.map((task: string, i: number) => ({
            id: i,
            text: task,
            done: false
        }))

        setTasks(formatted)

    }, [])


    const updateStreak = () => {

        const today = new Date().toDateString()

        const lastStudy = localStorage.getItem("lastStudyDate")
        let streak = Number(localStorage.getItem("studyStreak") || 0)

        if (lastStudy) {

            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)

            if (lastStudy === yesterday.toDateString()) {
                streak += 1
            }

            else if (lastStudy !== today) {
                streak = 1
            }

        }

        else {
            streak = 1
        }

        localStorage.setItem("studyStreak", String(streak))
        localStorage.setItem("lastStudyDate", today)

    }


    const toggleTask = (id: number) => {

        const updated = tasks.map(task =>
            task.id === id ? { ...task, done: !task.done } : task
        )

        setTasks(updated)

        const allDone = updated.every(t => t.done)

        if (allDone) {
            updateStreak()
        }

    }


    return (

        <div className="bg-white text-black p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">
                Today's Study Plan
            </h2>

            <ul className="space-y-3">

                {tasks.map(task => (

                    <li
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-3 rounded border cursor-pointer transition
            ${task.done ? "bg-green-100 line-through" : "bg-gray-50 hover:bg-gray-100"}`}
                    >
                        {task.text}
                    </li>

                ))}

            </ul>

        </div>

    )
}