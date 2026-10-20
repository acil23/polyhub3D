import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PolyCode Hub v0.4.2 | Open-Source Procedural 3D Asset Platform',
  description: 'Zero-storage procedural 3D asset studio with Creator Attribution, Anti-Spam Sandbox, and Git-style Pull Requests.'
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
