import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PolyCode Hub — Open-Source Procedural 3D Assets',
  description: 'Infinite procedural 3D assets powered by Three.js with real-time parametric customization and instant .GLB / .OBJ client-side export.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
