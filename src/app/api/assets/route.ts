import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_ASSETS } from '@/lib/seedData';
import { validateProceduralScript } from '@/lib/validator';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (data.length === 0) {
        const { data: seeded, error: seedErr } = await supabase
          .from('assets')
          .upsert(INITIAL_ASSETS)
          .select();
        if (!seedErr && seeded) {
          return NextResponse.json({ source: 'supabase_seeded', assets: seeded });
        }
      }
      return NextResponse.json({ source: 'supabase_cloud', assets: data });
    }
  }

  return NextResponse.json({ source: 'local_fallback', assets: INITIAL_ASSETS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, author_name, code, forked_from } = body;

    const validation = validateProceduralScript(code);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const newAsset = {
      id: `asset-${Date.now()}`,
      slug: `${(title || 'model').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      title: (title || 'Untitled 3D Asset').trim(),
      category: category || 'Sci-Fi',
      author_name: (author_name || 'anonymous').trim(),
      version: '1.0.0',
      code,
      downloads: 1,
      forked_from: forked_from || null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assets')
        .insert([newAsset])
        .select()
        .single();

      if (!error && data) {
        await supabase.from('asset_versions').insert([
          {
            asset_id: data.id,
            version: '1.0.0',
            code: data.code,
            changelog: 'Initial procedural 3D release'
          }
        ]);
        return NextResponse.json({ source: 'supabase_cloud', asset: data }, { status: 201 });
      }
    }

    return NextResponse.json({ source: 'local_fallback', asset: newAsset }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
