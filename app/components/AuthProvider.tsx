'use client'

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AuthModal from "./AuthModal"
import { User } from "@supabase/supabase-js"

type AuthContextType = {
    user: User | null
    loading: boolean
    openLogin: () => void
    requireAuth: (callback: () => void) => void
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        // Initial check
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
            setLoading(false)
        })

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
            if (session?.user) setIsModalOpen(false) // Close modal on successful auth
        })

        return () => subscription.unsubscribe()
    }, [])

    const openLogin = () => setIsModalOpen(true)
    
    const requireAuth = (callback: () => void) => {
        if (user) {
            callback()
        } else {
            setIsModalOpen(true)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        window.location.reload()
    }

    return (
        <AuthContext.Provider value={{ user, loading, openLogin, requireAuth, signOut }}>
            {children}
            <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within AuthProvider")
    return context
}
