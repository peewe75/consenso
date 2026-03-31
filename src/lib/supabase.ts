import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Variabili Supabase mancanti nel file .env.local')
}

let accessTokenGetter: (() => Promise<string | null>) | null = null

export function setSupabaseAccessTokenGetter(getter: (() => Promise<string | null>) | null) {
  accessTokenGetter = getter
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  accessToken: async () => {
    if (!accessTokenGetter) return null
    return accessTokenGetter()
  },
})
