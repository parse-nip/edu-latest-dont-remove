import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvcyczjzgnofbzafihpz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Y3ljemp6Z25vZmJ6YWZpaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NTU4MTgsImV4cCI6MjA3NDQzMTgxOH0.s-6ieMv2zAVJxf8Yb0JEYb-9__9t2C7G832kLq2JXhc'

console.log('[SUPABASE] Initializing client with:', { supabaseUrl, hasAnonKey: !!supabaseAnonKey })

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: true,
    debug: false,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token'
  }
})

console.log('[SUPABASE] Client created successfully')