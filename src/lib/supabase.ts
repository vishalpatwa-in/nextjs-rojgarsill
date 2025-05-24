import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for client components
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server client for server components and API routes
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
            set(name: string, value: string, options: { path?: string; domain?: string; expires?: Date; httpOnly?: boolean; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none' }) {        cookieStore.set({ name, value, ...options })      },      remove(name: string, options: { path?: string; domain?: string }) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}

// Service role client for admin operations
export const createSupabaseServiceClient = () => {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
} 