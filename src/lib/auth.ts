import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl.length > 0 && supabaseAnonKey.length > 0
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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