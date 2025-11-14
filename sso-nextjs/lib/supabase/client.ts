// lib/supabase/client.ts
// 출처: Supabase 공식 문서 (MIT 라이선스)
// https://supabase.com/docs/guides/auth/server-side/nextjs

import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export const createClient = () => {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
