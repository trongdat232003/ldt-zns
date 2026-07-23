import { createClient } from '@supabase/supabase-js';
import { env } from '@zns-auto/shared/config';

// Anon client (RLS applies)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

// Service Role client (bypasses RLS) - USE WITH CAUTION
export function createServiceRoleClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to create a service role client.');
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
