import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_ASSETS } from '@/lib/seedData';
import { validateProceduralScript } from '@/lib/validator';
import {
  hydrateAssetRow,
  injectAssetMeta,
  normalizeAuthorUrl,
  normalizeCodeSignature
} from '@/lib/metadata';
import { checkRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      if (data.length === 0) {
        const dbRows = INITIAL_ASSETS.map(({ author_url, curation_status, ...rest }) => ({
          ...rest,
          code: injectAssetMeta(rest.code, {
            status: curation_status || 'verified',
            authorUrl: author_url || `https://github.com/${rest.author_name}`
          })
        }));
        const { data: seeded, error: seedErr } = await supabase
          .from('assets')
          .upsert(dbRows)
          .select();
        if (!seedErr && seeded) {
          const hydrated = seeded.map(hydrateAssetRow).filter((a) => a.curation_status !== 'rejected');
          return NextResponse.json({ source: 'supabase_seeded', assets: hydrated });
        }
      }
      const hydrated = data.map(hydrateAssetRow).filter((a) => a.curation_status !== 'rejected');
      return NextResponse.json({ source: 'supabase_cloud', assets: hydrated });
    }
  }

  return NextResponse.json({ source: 'local_fallback', assets: INITIAL_ASSETS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, author_name, author_url, code, forked_from, admin_pin } = body;

    const expectedPin = (process.env.ADMIN_MERGE_PIN || 'admin123').trim();
    const isOwnerFastTrack = Boolean(admin_pin && String(admin_pin).trim() === expectedPin);

    // 1. Jika user mengisi Owner PIN tapi salah, tolak langsung
    if (admin_pin && String(admin_pin).trim() !== '' && !isOwnerFastTrack) {
      return NextResponse.json(
        { error: 'PIN Owner salah! Kosongkan kolom PIN jika Anda ingin mempublikasikan sebagai Kontributor Komunitas.' },
        { status: 401 }
      );
    }

    // 2. IP Rate Limiting untuk pengunjung publik (Maks 3 upload per 10 menit)
    const clientIp = request.headers.get('x-forwarded-for') || 'local-ip';
    if (!isOwnerFastTrack) {
      const rate = checkRateLimit(clientIp, 3, 10 * 60 * 1000);
      if (!rate.allowed) {
        return NextResponse.json(
          { error: `Anti-Spam Cooldown: Terlalu banyak kiriman dalam waktu singkat. Coba lagi dalam ${rate.retryAfterSec} detik.` },
          { status: 429 }
        );
      }
    }

    // 3. Validasi Keamanan Skrip 3D
    const validation = validateProceduralScript(code);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    // 4. Anti-Duplicate Code Check (Mencegah Fork kosong tanpa modifikasi geometri)
    const incomingSig = normalizeCodeSignature(code);
    let existingList = INITIAL_ASSETS;
    if (isSupabaseConfigured && supabase) {
      const { data: existingRows } = await supabase.from('assets').select('code, title');
      if (existingRows && existingRows.length > 0) {
        existingList = existingRows as any;
      }
    }
    const duplicate = existingList.find((item) => normalizeCodeSignature(item.code) === incomingSig);
    if (duplicate) {
      return NextResponse.json(
        {
          error: `Duplikat Terdeteksi: Kode geometri 3D ini 100% identik dengan aset "${duplicate.title}". Silakan modifikasi bentuk atau parameter 3D terlebih dahulu sebelum mempublikasikan Fork!`
        },
        { status: 400 }
      );
    }

    const cleanAuthor = (author_name || 'anonymous').trim().replace(/^@/, '');
    const resolvedUrl = normalizeAuthorUrl(author_url, cleanAuthor);
    const curationStatus = isOwnerFastTrack ? 'verified' : 'community';

    const codeWithMeta = injectAssetMeta(code, {
      status: curationStatus,
      authorUrl: resolvedUrl
    });

    const dbRow = {
      id: `asset-${Date.now()}`,
      slug: `${(title || 'model').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      title: (title || 'Untitled 3D Asset').trim(),
      category: category || 'Sci-Fi',
      author_name: cleanAuthor,
      version: '1.0.0',
      code: codeWithMeta,
      downloads: 1,
      forked_from: forked_from || null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('assets')
        .insert([dbRow])
        .select()
        .single();

      if (!error && data) {
        await supabase.from('asset_versions').insert([
          {
            asset_id: data.id,
            version: '1.0.0',
            code: data.code,
            changelog: `Initial release by @${cleanAuthor} (${resolvedUrl})`
          }
        ]);
        return NextResponse.json(
          { source: 'supabase_cloud', asset: hydrateAssetRow(data) },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      { source: 'local_fallback', asset: hydrateAssetRow(dbRow) },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
