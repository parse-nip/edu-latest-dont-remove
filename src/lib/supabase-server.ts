import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client for server-side operations
export function createServerClient(authToken?: string) {
  if (authToken) {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    })
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Helper to extract auth token from request
export function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

// Helper to get authenticated user from request
export async function getAuthenticatedUser(request: Request) {
  const token = getAuthToken(request)
  if (!token) {
    return { user: null, error: 'No auth token provided' }
  }

  const supabase = createServerClient(token)
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, error: 'Invalid or expired token' }
  }

  return { user, error: null }
}