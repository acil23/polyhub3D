import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_PULL_REQUESTS } from '@/lib/seedData';
import { validateProceduralScript } from '@/lib/validator';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('pull_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (data.length === 0) {
        const { data: seeded, error: seedErr } = await supabase
          .from('pull_requests')
          .upsert(INITIAL_PULL_REQUESTS)
          .select();
        if (!seedErr && seeded) {
          return NextResponse.json({ source: 'supabase_seeded', pullRequests: seeded });
        }
      }
      return NextResponse.json({ source: 'supabase_cloud', pullRequests: data });
    }
  }

  return NextResponse.json({ source: 'local_fallback', pullRequests: INITIAL_PULL_REQUESTS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { asset_id, asset_title, author_name, title, description, proposed_code } = body;

    const validation = validateProceduralScript(proposed_code);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const newPR = {
      id: `pr-${Date.now().toString().slice(-4)}`,
      asset_id,
      asset_title: asset_title || '3D Asset',
      author_name: (author_name || 'contributor').trim(),
      title: (title || 'Proposed Geometry Optimization').trim(),
      description: (description || '').trim(),
      proposed_code,
      status: 'open' as const,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('pull_requests')
        .insert([newPR])
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ source: 'supabase_cloud', pullRequest: data }, { status: 201 });
      }
    }

    return NextResponse.json({ source: 'local_fallback', pullRequest: newPR }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
