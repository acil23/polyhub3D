import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://polyhub3d.aklein.tech'),
  title: {
    default: 'PolyCode Hub — Open-Source Procedural 3D Assets & Three.js Studio',
    template: '%s | PolyCode Hub',
  },
  description:
    'Free open-source procedural 3D assets powered by Three.js. Customize geometry in real time with parametric sliders and export directly to .GLB (glTF) and .OBJ for Blender, Unity, and Unreal Engine.',
  keywords: [
    'free 3d assets',
    'procedural 3d models',
    'three.js assets',
    'download glb models',
    'download obj models',
    'open source 3d repository',
    'low poly 3d generator',
    'parametric 3d studio',
    'polycode hub',
  ],
  authors: [{ name: 'aklein', url: 'https://aklein.tech' }],
  creator: 'aklein',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://polyhub3d.aklein.tech',
    siteName: 'PolyCode Hub',
    title: 'PolyCode Hub — Infinite Procedural 3D Assets (.GLB & .OBJ)',
    description:
      'Explore, customize with parametric sliders, and export lightweight procedural Three.js 3D assets to .GLB & .OBJ right in your browser.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PolyCode Hub — Open-Source Procedural 3D Assets',
    description:
      'Infinite procedural 3D assets powered by Three.js with real-time parametric sliders and instant .GLB / .OBJ export.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PolyCode Hub',
    url: 'https://polyhub3d.aklein.tech',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Open-source procedural 3D asset platform powered by Three.js with real-time parametric customization and client-side .GLB / .OBJ export.',
    author: {
      '@type': 'Person',
      name: 'aklein',
      url: 'https://aklein.tech',
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
