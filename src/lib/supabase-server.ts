import { cookies as nextCookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

/**
 * Create a Supabase server client that reads/writes to Next's cookie store.
 *
 * Accepts either:
 *  - an already-awaited RequestCookies object (the usual case: `const cs = await cookies()`),
 *  - OR nothing — it will `await cookies()` internally.
 *
 * This avoids the "cookies() should be awaited" error.
 */
export async function createSupabaseServerClient(
  cookieStore?: ReadonlyRequestCookies | Promise<ReadonlyRequestCookies> | null
) {
  // Accept a promise or value and normalize it. If nothing provided, await next/headers
  let store: ReadonlyRequestCookies
  if (cookieStore) {
    // if caller passed cookies() without awaiting (a Promise-like), await it
    // detect promise by checking for `.then`
    const maybePromise = cookieStore as any
    store = typeof maybePromise.then === 'function' ? await maybePromise : (cookieStore as ReadonlyRequestCookies)
  } else {
    store = await nextCookies()
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            // Note: this will throw if called from a Server Component; we keep the try/catch as in your original.
            store.set({ name, value, ...options })
          } catch (err) {
            // ignore writes from Server Components (use middleware if you need to refresh sessions)
          }
        },
        remove(name: string, options) {
          try {
            store.set({ name, value: '', ...options })
          } catch (err) {
            // ignore writes from Server Components
          }
        },
      },
    }
  )
}

/**
 * Get the authenticated user, supporting:
 *  - bearer token in the Authorization header (server-to-server / API-to-API)
 *  - cookie-based session (typical browser session)
 *
 * Returns { user, error } where user is null if not found.
 */
export async function getAuthenticatedUser(
  cookieStore?: ReadonlyRequestCookies | Promise<ReadonlyRequestCookies> | null,
  request?: NextRequest
) {
  // 1) If request includes Authorization: Bearer <token>, try that first.
  if (request) {
    const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7)

      // Create a temporary supabase client that uses the Authorization header
      // and does not try to persist session into cookies.
      const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false, // important: don't attempt to save cookies
            autoRefreshToken: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )

      try {
        // This call uses the Authorization header to fetch the user
        const { data, error } = await tempSupabase.auth.getUser()
        if (!error && data?.user) {
          return { user: data.user, error: null }
        }
        // if error, fall back to cookie-based flow
      } catch (err) {
        // swallow and fallback to cookie-based
      }
    }
  }

  // 2) Fallback: cookie-based session (typical)
  const supabase = await createSupabaseServerClient(cookieStore)
  const { data, error } = await supabase.auth.getUser()
  // data.user may be null if no session
  return { user: data?.user ?? null, error: error || (data?.user ? null : new Error('No authentication found')) }
}
