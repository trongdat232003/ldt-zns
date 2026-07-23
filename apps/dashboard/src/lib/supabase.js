import { createClient } from '@supabase/supabase-js'

// We will use environment variables for this.
// For Vite, they are prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
