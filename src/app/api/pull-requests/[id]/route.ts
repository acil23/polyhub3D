import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { validateProceduralScript } from '@/lib/validator';
import { extractAssetMeta, injectAssetMeta } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prId = params.id;
    const body = await request.json();
    const { action, asset_id, current_version, proposed_code, title, admin_pin } = body;

    const expectedPin = (process.env.ADMIN_MERGE_PIN || 'admin123').trim();
    if (!admin_pin || String(admin_pin).trim() !== expectedPin) {
      return NextResponse.json(
        { error: 'Access Denied: Invalid Owner PIN! Only the Owner can approve or reject Pull Requests.' },
        { status: 401 }
      );
    }

    if (action === 'reject') {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('pull_requests').update({ status: 'rejected' }).eq('id', prId);
      }
      return NextResponse.json({ status: 'rejected', prId });
    }

    if (action === 'merge') {
      const validation = validateProceduralScript(proposed_code);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.reason }, { status: 400 });
      }

      const parts = (current_version || '1.0.0').split('.').map(Number);
      const nextVersion = `${parts[0] || 1}.${(parts[1] || 0) + 1}.0`;

      if (isSupabaseConfigured && supabase) {
        const { data: existing } = await supabase
          .from('assets')
          .select('code, author_name')
          .eq('id', asset_id)
          .single();

        const oldMeta = existing
          ? extractAssetMeta(existing.code, existing.author_name)
          : { status: 'verified' as const, authorUrl: '' };

        const mergedWithMeta = injectAssetMeta(proposed_code, {
          status: 'verified',
          authorUrl: oldMeta.authorUrl
        });

        await supabase
          .from('assets')
          .update({
            code: mergedWithMeta,
            version: nextVersion,
            updated_at: new Date().toISOString()
          })
          .eq('id', asset_id);

        await supabase
          .from('pull_requests')
          .update({ status: 'merged' })
          .eq('id', prId);

        await supabase.from('asset_versions').insert([
          {
            asset_id,
            version: nextVersion,
            code: mergedWithMeta,
            changelog: `Merged PR #${prId}: ${title || 'Community contribution'}`
          }
        ]);
      }

      return NextResponse.json({
        status: 'merged',
        prId,
        asset_id,
        nextVersion
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
