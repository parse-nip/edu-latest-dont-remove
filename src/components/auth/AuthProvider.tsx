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
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) {
      console.log('[AUTH PROVIDER] Already initialized, skipping')
      return
    }
    
    console.log('[AUTH PROVIDER] Starting initialization')
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('[AUTH PROVIDER] Loading timeout reached, forcing loading to false')
      setLoading(false)
      setInitialized(true)
    }, 10000) // 10 second timeout
    
    const initAuth = async () => {
      try {
        // Check if we already have a session in storage to avoid unnecessary API calls
        const existingSession = localStorage.getItem('supabase.auth.token')
        console.log('[AUTH PROVIDER] Existing session in storage:', !!existingSession)
        
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
        console.log('[AUTH PROVIDER] Setting loading to false and initialized to true')
        clearTimeout(loadingTimeout)
        setLoading(false)
        setInitialized(true)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH PROVIDER] Auth state change:', { event, session: session ? 'present' : 'null' })
      
      // Skip if we're already initialized and this is just a token refresh
      if (initialized && event === 'TOKEN_REFRESHED') {
        console.log('[AUTH PROVIDER] Skipping token refresh, already initialized')
        return
      }
      
      try {
        if (session?.user) {
          console.log('[AUTH PROVIDER] Session user found in state change, getting current user...')
          const authUser = await getCurrentUser()
          console.log('[AUTH PROVIDER] getCurrentUser result in state change:', authUser)
          setUser(authUser)
          
          // If this is a sign in event and we're on the auth page, redirect to hackathons
          if (event === 'SIGNED_IN' && typeof window !== 'undefined' && window.location.pathname === '/auth') {
            console.log('[AUTH PROVIDER] User signed in, redirecting to hackathons...')
            window.location.href = '/hackathons'
          }
        } else {
          console.log('[AUTH PROVIDER] No session in state change, setting user to null')
          setUser(null)
        }
      } catch (error) {
        console.error('[AUTH PROVIDER] Error in auth state change:', error)
        setUser(null)
      } finally {
        // Always set loading to false after processing any auth state change
        console.log('[AUTH PROVIDER] Setting loading to false after auth state change')
        setLoading(false)
        setInitialized(true)
      }
    })

    return () => {
      console.log('[AUTH PROVIDER] Cleaning up subscription and timeout')
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [initialized])

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