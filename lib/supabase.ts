import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yegsmfnxpqgjjohqsscx.supabase.co'

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZ3NtZm54cHFnampvaHFzc2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MTU5MDYsImV4cCI6MjEwNDM5MTkwNn0.oy8gBzGF6eCrBTmLM65VGbVgIILuAOF4J_6-NnJyyRQ'

export const isSupabaseConfigured = () => {
  return (
    SUPABASE_URL !== undefined &&
    SUPABASE_ANON_KEY !== undefined &&
    !SUPABASE_URL.includes('placeholder')
  )
}

// Client singleton for browser and client-side queries
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
