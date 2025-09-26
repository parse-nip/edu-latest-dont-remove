import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = 'https://lvcyczjzgnofbzafihpz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Y3ljemp6Z25vZmJ6YWZpaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTU4MTgsImV4cCI6MjA3NDQzMTgxOH0.s-6ieMv2zAVJxf8Yb0JEYb-9__9t2C7G832kLq2JXhc'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/hackathons` : undefined,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type UserRole = 'participant' | 'judge' | 'organizer'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  displayName: string
  joinCode?: string
}

export const signUp = async (email: string, password: string, displayName: string, role: UserRole, joinCode?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role,
          join_code: joinCode,
        }
      }
    })
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error }
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email!,
      role: user.user_metadata.role || 'participant',
      displayName: user.user_metadata.display_name || user.email!,
      joinCode: user.user_metadata.join_code
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}