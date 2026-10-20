import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PolyCode Hub v0.4.1 | Full-Stack Procedural 3D Asset Platform',
  description: 'Next.js 14 API Routes + Supabase PostgreSQL + Owner PIN Guard + Three.js Studio.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
