import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      connected: false,
      mode: 'local_fallback',
      message: 'Kredensial Supabase belum terdeteksi.'
    });
  }

  const { error } = await supabase.from('assets').select('id').limit(1);
  if (error) {
    return NextResponse.json({
      connected: false,
      mode: 'schema_missing',
      message: `Terkoneksi ke Supabase, namun tabel belum dibuat (${error.message}). Jalankan SQL Migration di SQL Editor.`
    });
  }

  return NextResponse.json({
    connected: true,
    mode: 'supabase_cloud',
    message: 'Terhubung penuh ke PostgreSQL Supabase Cloud!'
  });
}
