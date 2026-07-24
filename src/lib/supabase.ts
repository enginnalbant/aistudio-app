import { createClient } from '@supabase/supabase-js';

// Read from environment variables, fallback to empty or dummy keys to prevent runtime crash
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dummy-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'dummy-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log status on initialization
if (supabaseUrl === 'https://dummy-supabase-url.supabase.co' || supabaseAnonKey === 'dummy-anon-key') {
  console.warn('[Supabase] Supabase url or anon key is missing. Sync operations will run in Offline-Local fallback mode.');
} else {
  console.log('[Supabase] Client initialized successfully.');
}

/**
 * Checks if Supabase credentials are properly configured.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    supabaseUrl !== 'https://dummy-supabase-url.supabase.co' &&
    supabaseAnonKey !== 'dummy-anon-key'
  );
};
