"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser, type AuthUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[AUTH PROVIDER] Initial useEffect running')
    // Get initial session
    getCurrentUser()
      .then(user => {
        console.log('[AUTH PROVIDER] Initial getCurrentUser result:', user)
        setUser(user)
      })
      .finally(() => {
        console.log('[AUTH PROVIDER] Initial loading complete')
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH PROVIDER] Auth state change:', { event, session: session ? 'present' : 'null' })
      if (session?.user) {
        const authUser = await getCurrentUser()
        console.log('[AUTH PROVIDER] Session user found, authUser:', authUser)
        setUser(authUser)
      } else {
        console.log('[AUTH PROVIDER] No session, setting user to null')
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}