import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_PULL_REQUESTS } from '@/lib/seedData';
import { validateProceduralScript } from '@/lib/validator';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('pull_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (data.length === 0) {
        const dbRows = INITIAL_PULL_REQUESTS.map(({ author_url, ...rest }) => rest);
        const { data: seeded, error: seedErr } = await supabase
          .from('pull_requests')
          .upsert(dbRows)
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
    const clientIp = request.headers.get('x-forwarded-for') || 'local-ip';
    const rate = checkRateLimit(`pr-${clientIp}`, 4, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Anti-Spam Cooldown: Tunggu ${rate.retryAfterSec} detik sebelum mengirim PR baru.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { asset_id, asset_title, author_name, author_url, title, description, proposed_code } = body;

    const validation = validateProceduralScript(proposed_code);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const cleanAuthor = (author_name || 'contributor').trim().replace(/^@/, '');
    const descWithCredit = author_url
      ? `${(description || '').trim()} [Contributor Profile: ${author_url.trim()}]`
      : (description || '').trim();

    const newPR = {
      id: `pr-${Date.now().toString().slice(-4)}`,
      asset_id,
      asset_title: asset_title || '3D Asset',
      author_name: cleanAuthor,
      title: (title || 'Proposed Geometry Optimization').trim(),
      description: descWithCredit,
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
