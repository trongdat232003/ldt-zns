import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { env } from '@zns-auto/shared/config';

// Polyfill WebSocket for Node.js < 22
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket;
}

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
