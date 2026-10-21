import { MetadataRoute } from 'next';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_ASSETS } from '@/lib/seedData';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://polyhub3d.aklein.tech';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  let slugList: { slug: string; updated_at?: string; created_at?: string }[] = INITIAL_ASSETS;

  if (isSupabaseConfigured && supabase) {
    const { data: assets } = await supabase
      .from('assets')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: false });

    if (assets && assets.length > 0) {
      slugList = assets;
    }
  }

  for (const asset of slugList) {
    routes.push({
      url: `${baseUrl}/?asset=${encodeURIComponent(asset.slug)}`,
      lastModified: new Date(asset.updated_at || asset.created_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return routes;
}
