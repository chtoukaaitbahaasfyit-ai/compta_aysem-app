/** AYSM Supabase configuration. Publishable key only; RLS is mandatory. */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://ljnalwipbkwdmnapbdei.supabase.co').replace(/\/$/, '');
// Publishable key only. It is designed for browser use and is protected by database RLS.
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_2VujNL41_Q4Hc3hOq7N-EQ_2qs9ykwH';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured) throw new Error('لم يتم إعداد اتصال Supabase بعد. أضف VITE_SUPABASE_URL و VITE_SUPABASE_PUBLISHABLE_KEY.');
}
