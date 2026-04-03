'use client'

import { useRouter } from "next/navigation"

export default function LoginPage() {

    const router = useRouter()

    const handleLogin = () => {
        router.push("/dashboard")
    }

    return (
        <main className="flex min-h-screen items-center justify-center">

            <div className="bg-white text-black p-8 rounded-xl shadow-md w-96">

                <h1 className="text-2xl font-bold mb-6 text-center">
                    Zeropoint Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-3 mb-4 border rounded-lg"
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full p-3 mb-4 border rounded-lg"
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-black text-white p-3 rounded-lg"
                >
                    Login
                </button>

            </div>

        </main>
    )
}