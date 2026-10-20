import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();

function resolveSupabaseKey(): string {
  const publishable = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();
  const anon = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (serviceRole && !serviceRole.includes('key_anda')) return serviceRole;
  if (publishable && !publishable.includes('key_anda')) return publishable;
  if (anon && anon !== 'anonymous_key_anda' && !anon.includes('key_anda')) return anon;
  return '';
}

const resolvedKey = resolveSupabaseKey();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('project-id-anda') &&
  resolvedKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, resolvedKey, {
      auth: { persistSession: false }
    })
  : null;
