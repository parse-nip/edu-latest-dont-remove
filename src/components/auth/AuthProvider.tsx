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
    console.log('[AUTH PROVIDER] Starting initialization')
    
    const initAuth = async () => {
      try {
        console.log('[AUTH PROVIDER] Getting initial session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[AUTH PROVIDER] Initial session:', session ? 'present' : 'null')
        
        if (session?.user) {
          console.log('[AUTH PROVIDER] Session user found, getting current user...')
          const authUser = await getCurrentUser()
          console.log('[AUTH PROVIDER] getCurrentUser result:', authUser)
          setUser(authUser)
        } else {
          console.log('[AUTH PROVIDER] No session, setting user to null')
          setUser(null)
        }
      } catch (error) {
        console.error('[AUTH PROVIDER] Error in initAuth:', error)
        setUser(null)
      } finally {
        console.log('[AUTH PROVIDER] Setting loading to false')
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH PROVIDER] Auth state change:', { event, session: session ? 'present' : 'null' })
      
      try {
        if (session?.user) {
          console.log('[AUTH PROVIDER] Session user found in state change, getting current user...')
          const authUser = await getCurrentUser()
          console.log('[AUTH PROVIDER] getCurrentUser result in state change:', authUser)
          setUser(authUser)
        } else {
          console.log('[AUTH PROVIDER] No session in state change, setting user to null')
          setUser(null)
        }
      } catch (error) {
        console.error('[AUTH PROVIDER] Error in auth state change:', error)
        setUser(null)
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        setLoading(false)
      }
    })

    return () => {
      console.log('[AUTH PROVIDER] Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    console.log('[AUTH PROVIDER] handleSignOut called')
    try {
      await supabase.auth.signOut()
      setUser(null)
      console.log('[AUTH PROVIDER] Sign out successful')
    } catch (error) {
      console.error('[AUTH PROVIDER] Sign out error:', error)
    }
  }

  console.log('[AUTH PROVIDER] Render - user:', user ? `${user.email} (${user.role})` : 'null', 'loading:', loading)

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