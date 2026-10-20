import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/health', '/api/pull-requests/'],
      },
    ],
    sitemap: 'https://polyhub3d.aklein.tech/sitemap.xml',
    host: 'https://polyhub3d.aklein.tech',
  };
}