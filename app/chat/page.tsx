'use client'

import { useState } from "react"

export default function ChatPage() {

    const [message, setMessage] = useState("")
    const [chat, setChat] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const sendMessage = async () => {

        if (!message.trim()) return

        const userMessage = {
            role: "user",
            text: message
        }

        setChat(prev => [...prev, userMessage])
        setMessage("")
        setLoading(true)

        try {

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message })
            })

            const data = await res.json()

            const aiMessage = {
                role: "ai",
                text: data.reply
            }

            setChat(prev => [...prev, aiMessage])

        } catch (error) {

            setChat(prev => [
                ...prev,
                { role: "ai", text: "Error contacting AI tutor." }
            ])

        }

        setLoading(false)
    }

    return (

        <div className="max-w-3xl mx-auto text-white">

            <h1 className="text-3xl font-bold mb-6">
                AI Tutor
            </h1>

            {/* Chat Messages */}
            <div className="space-y-4 mb-6">

                {chat.map((msg, i) => (

                    <div
                        key={i}
                        className={`p-3 rounded-lg max-w-[80%] ${msg.role === "user"
                                ? "bg-purple-600 ml-auto text-white"
                                : "bg-white text-black"
                            }`}
                    >
                        {msg.text}
                    </div>

                ))}

                {loading && (
                    <div className="bg-white text-black p-3 rounded-lg max-w-[80%]">
                        AI is thinking...
                    </div>
                )}

            </div>

            {/* Input Area */}
            <div className="flex gap-2">

                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 p-3 rounded text-black"
                />

                <button
                    onClick={sendMessage}
                    className="bg-purple-600 px-5 rounded hover:bg-purple-700"
                >
                    Send
                </button>

            </div>

        </div>
    )
}