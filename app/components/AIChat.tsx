"use client";

import { useState } from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function AIChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await res.json();

            const aiMessage: Message = {
                role: "assistant",
                content: data.reply,
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "AI tutor failed to respond." },
            ]);
        }

        setInput("");
    };

    return (
        <div className="flex flex-col w-full max-w-3xl mx-auto mt-10">

            {/* Chat Messages */}
            <div className="space-y-4 mb-6">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg max-w-xl ${msg.role === "user"
                                ? "bg-purple-600 text-white ml-auto"
                                : "bg-gray-200 text-black"
                            }`}
                    >
                        {msg.content}
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Ask anything..."
                    className="flex-1 p-3 border rounded-lg bg-black text-white"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />

                <button
                    onClick={sendMessage}
                    className="bg-purple-600 px-6 py-3 rounded-lg text-white"
                >
                    Send
                </button>
            </div>

        </div>
    );
}