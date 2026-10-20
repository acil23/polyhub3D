import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { extractAssetMeta, injectAssetMeta } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id;
    const body = await request.json();
    const { action, admin_pin } = body;

    const expectedPin = (process.env.ADMIN_MERGE_PIN || 'admin123').trim();
    if (!admin_pin || String(admin_pin).trim() !== expectedPin) {
      return NextResponse.json(
        { error: 'Akses Ditolak: PIN Owner tidak valid!' },
        { status: 401 }
      );
    }

    if (action === 'approve') {
      if (isSupabaseConfigured && supabase) {
        const { data: existing } = await supabase
          .from('assets')
          .select('*')
          .eq('id', assetId)
          .single();

        if (existing) {
          const meta = extractAssetMeta(existing.code, existing.author_name);
          const updatedCode = injectAssetMeta(meta.cleanCode, {
            status: 'verified',
            authorUrl: meta.authorUrl
          });
          await supabase
            .from('assets')
            .update({ code: updatedCode, updated_at: new Date().toISOString() })
            .eq('id', assetId);
        }
      }
      return NextResponse.json({ status: 'verified', assetId });
    }

    if (action === 'delete') {
      if (isSupabaseConfigured && supabase) {
        const { data: existing } = await supabase
          .from('assets')
          .select('*')
          .eq('id', assetId)
          .single();

        if (existing) {
          const meta = extractAssetMeta(existing.code, existing.author_name);
          const rejectedCode = injectAssetMeta(meta.cleanCode, {
            status: 'rejected',
            authorUrl: meta.authorUrl
          });
          // Soft-delete terlebih dahulu agar tetap hilang meskipun RLS DELETE belum diaktifkan
          await supabase.from('assets').update({ code: rejectedCode }).eq('id', assetId);
          // Lalu coba hard-delete
          await supabase.from('assets').delete().eq('id', assetId);
        }
      }
      return NextResponse.json({ status: 'deleted', assetId });
    }

    return NextResponse.json({ error: 'Invalid moderation action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
