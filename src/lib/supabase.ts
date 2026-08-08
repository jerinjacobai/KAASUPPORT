import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pqiboqctyzvjdxqtxilp.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaWJvcWN0eXp2amR4cXR4aWxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5OTY2NjYsImV4cCI6MjEwMTU3MjY2Nn0.FfD8Jr3jo7z1vrVAHS6Lo8BlxkYbCuah7MLYO0py1-Y'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
