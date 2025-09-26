import { supabase } from './supabase'

export type UserRole = 'participant' | 'judge' | 'organizer'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: UserRole
}

export const signUp = async (email: string, password: string, displayName: string, role: UserRole = 'participant') => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role
        }
      }
    })
    
    return { user: data.user, error }
  } catch (error) {
    return { user: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    return { user: data.user, error }
  } catch (error) {
    return { user: null, error }
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
    console.log('[AUTH] getCurrentUser called')
    const { data: { user } } = await supabase.auth.getUser()
    
    console.log('[AUTH] Raw user from supabase:', user)
    
    if (!user) return null
    
    const authUser = {
      id: user.id,
      email: user.email!,
      displayName: user.user_metadata?.display_name || user.email!,
      role: user.user_metadata?.role || 'participant'
    }
    
    console.log('[AUTH] Returning authUser:', authUser)
    return authUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}