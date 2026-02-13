
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build/prerender, env vars may not be real URLs — use fallback
  const safeUrl = url && url.startsWith('http') ? url : 'https://placeholder.supabase.co'
  const safeKey = key && key.length > 10 ? key : 'placeholder-key'

  return createBrowserClient<Database>(safeUrl, safeKey)
}
