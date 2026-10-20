import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      connected: false,
      mode: 'local_fallback',
      message: 'Supabase credentials not configured.'
    });
  }

  const { error } = await supabase.from('assets').select('id').limit(1);
  if (error) {
    return NextResponse.json({
      connected: false,
      mode: 'schema_missing',
      message: `Connected to Supabase, but schema tables are missing (${error.message}). Run SQL Migration in SQL Editor.`
    });
  }

  return NextResponse.json({
    connected: true,
    mode: 'supabase_cloud',
    message: 'Connected to Supabase PostgreSQL Cloud!'
  });
}
