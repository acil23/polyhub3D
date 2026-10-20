import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PolyCode Hub v0.3 | Production Procedural 3D Asset Platform',
  description: 'Zero-storage procedural 3D asset studio with WebGL Hover Limiter, AST Loop Protection, & Monaco DiffEditor.'
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
