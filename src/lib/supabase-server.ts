import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase'

const supabaseUrl = 'https://lvcyczjzgnofbzafihpz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Y3ljemp6Z25vZmJ6YWZpaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTU4MTgsImV4cCI6MjA3NDQzMTgxOH0.s-6ieMv2zAVJxf8Yb0JEYb-9__9t2C7G832kLq2JXhc'

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