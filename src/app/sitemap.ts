import { MetadataRoute } from 'next';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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

  if (isSupabaseConfigured && supabase) {
    const { data: assets } = await supabase
      .from('assets')
      .select('slug, updated_at, created_at')
      .order('created_at', { ascending: false });

    if (assets && assets.length > 0) {
      for (const asset of assets) {
        routes.push({
          url: `${baseUrl}/?asset=${encodeURIComponent(asset.slug)}`,
          lastModified: new Date(asset.updated_at || asset.created_at || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  }

  return routes;
}