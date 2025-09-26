import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
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
  // First, try bearer token authentication if present
  if (request) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      try {
        // Create a temporary client that doesn't interfere with cookies
        const tempSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        // Set the session with the bearer token
        const { data: sessionData, error: sessionError } = await tempSupabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        })
        
        if (!sessionError && sessionData.user) {
          return { user: sessionData.user, error: null }
        }
      } catch (error) {
        // Bearer token authentication failed, fall back to cookie-based auth
      }
    }
  }

  // Fall back to cookie-based session authentication
  const supabase = createSupabaseServerClient(cookieStore)
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error: error || (user ? null : new Error('No authentication found')) }
}