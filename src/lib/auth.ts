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
    console.log('[AUTH] signUp called with:', { email, displayName, role })
    
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
    
    console.log('[AUTH] signUp result:', { data, error })
    
    if (error) {
      console.error('[AUTH] signUp error:', error)
      return { user: null, error: error.message }
    }
    
    return { user: data.user, error: null }
  } catch (error) {
    console.error('[AUTH] signUp catch error:', error)
    return { user: null, error: String(error) }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    console.log('[AUTH] signIn called with:', { email })
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    console.log('[AUTH] signIn result:', { data, error })
    
    if (error) {
      console.error('[AUTH] signIn error:', error)
      return { user: null, error: error.message }
    }
    
    return { user: data.user, error: null }
  } catch (error) {
    console.error('[AUTH] signIn catch error:', error)
    return { user: null, error: String(error) }
  }
}

export const signOut = async () => {
  try {
    console.log('[AUTH] signOut called')
    const { error } = await supabase.auth.signOut()
    console.log('[AUTH] signOut result:', { error })
    return { error: error?.message || null }
  } catch (error) {
    console.error('[AUTH] signOut catch error:', error)
    return { error: String(error) }
  }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    console.log('[AUTH] getCurrentUser called')
    
    const { data: { user } } = await supabase.auth.getUser()
    
    console.log('[AUTH] Raw user from supabase:', user)
    
    if (!user) {
      console.log('[AUTH] No user found')
      return null
    }
    
    const authUser = {
      id: user.id,
      email: user.email!,
      displayName: user.user_metadata?.display_name || user.email!,
      role: (user.user_metadata?.role as UserRole) || 'participant'
    }
    
    console.log('[AUTH] Returning authUser:', authUser)
    return authUser
  } catch (error) {
    console.error('[AUTH] Error getting current user:', error)
    return null
  }
}