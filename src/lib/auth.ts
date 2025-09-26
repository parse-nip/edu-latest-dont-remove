import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://lvcyczjzgnofbzafiihpz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Y3ljemp6Z25vZmJ6YWZpaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTU4MTgsImV4cCI6MjA3NDQzMTgxOH0.s-6ieMv2zAVJxf8Yb0JEYb-9__9t2C7G832kLq2JXhc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined,
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
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured. Please add environment variables.' } }
  }
  
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
}

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase not configured. Please add environment variables.' } }
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) {
    return { error: { message: 'Supabase not configured.' } }
  }
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (!supabase) {
    return null
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email!,
    role: user.user_metadata.role || 'participant',
    displayName: user.user_metadata.display_name || user.email!,
    joinCode: user.user_metadata.join_code
  }
}