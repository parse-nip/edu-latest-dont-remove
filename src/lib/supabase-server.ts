import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export function createSupabaseServerClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getAuthenticatedUser(cookieStore: ReadonlyRequestCookies, request?: NextRequest) {
  // Always create the supabase client using the cookieStore
  const supabase = createSupabaseServerClient(cookieStore)
  
  // If request is provided, try to get token from Authorization header
  if (request) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      // Set the session using the token
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      })
      
      if (sessionError) {
        return { user: null, error: sessionError }
      }
      
      // Get the user from the session
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    }
  }

  // Fallback to getting user from existing session
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error: error || (user ? null : new Error('No authentication token provided')) }
}