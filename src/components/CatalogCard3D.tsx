'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Viewport3D from './Viewport3D';
import { compileProceduralCode } from '@/lib/compiler';
import { getOrCreateAssetThumbnail } from '@/lib/thumbnail';
import { Asset3D } from '@/types/polycode';

interface CatalogCard3DProps {
  asset: Asset3D;
  onSelect: (asset: Asset3D) => void;
  onQuickExport: (e: React.MouseEvent, asset: Asset3D, format: 'obj' | 'glb') => void;
  onModerate?: (assetId: string, action: 'approve' | 'delete', pin: string) => Promise<void>;
}

export default function CatalogCard3D({
  asset,
  onSelect,
  onQuickExport,
  onModerate
}: CatalogCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [showModBox, setShowModBox] = useState(false);
  const [modPin, setModPin] = useState('');
  const [modBusy, setModBusy] = useState(false);

  const preview = useMemo(() => compileProceduralCode(asset.code), [asset.code]);

  useEffect(() => {
    const snap = getOrCreateAssetThumbnail(`${asset.id}-${asset.version}`, preview.group);
    setThumbnailUrl(snap);
  }, [asset.id, asset.version, preview.group]);

  const profileHref =
    asset.author_url || `https://github.com/${asset.author_name.replace(/^@/, '')}`;

  const handleModAction = async (action: 'approve' | 'delete') => {
    if (!onModerate || !modPin.trim()) return;
    setModBusy(true);
    try {
      await onModerate(asset.id, action, modPin.trim());
      setShowModBox(false);
      setModPin('');
    } finally {
      setModBusy(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-3xl border border-white/10 hover:border-blue-500/60 bg-zinc-900/50 backdrop-blur-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_20px_50px_rgba(37,99,235,0.22)]"
    >
      <div className="h-64 w-full relative overflow-hidden z-0 border-b border-white/10">
        {isHovered ? (
          <Viewport3D modelGroup={preview.group} autoRotate={true} showGrid={true} />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center relative select-none"
            style={{
              background:
                'radial-gradient(circle at 50% 38%, rgba(30, 58, 138, 0.38) 0%, rgba(15, 23, 42, 0.65) 48%, rgba(9, 9, 11, 0.96) 100%)'
            }}
          >
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={asset.title}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-xs text-zinc-500 font-mono animate-pulse">Generating 3D Snapshot...</div>
            )}
          </div>
        )}

        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold bg-zinc-950/85 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-zinc-200">
              {asset.category}
            </span>
            {asset.curation_status === 'community' ? (
              <span className="text-[10px] font-bold bg-amber-500/20 border border-amber-400/40 text-amber-300 px-2.5 py-0.5 rounded-full">
                ⏳ Community Sandbox
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-2.5 py-0.5 rounded-full">
                ✓ Featured
              </span>
            )}
          </div>
          <span className="text-[11px] bg-blue-950/90 backdrop-blur-md border border-blue-400/40 px-2.5 py-1 rounded-full font-mono text-blue-300 font-semibold">
            ⚡ {preview.stats.scriptSizeKB} KB
          </span>
        </div>

        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          <span className="text-[10px] font-mono bg-black/75 backdrop-blur px-2.5 py-1 rounded-lg text-zinc-300 border border-white/10">
            {preview.stats.vertices} Verts • {preview.stats.triangles} Tris
          </span>
          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
              isHovered
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                : 'bg-zinc-950/80 text-zinc-400 border-white/10'
            }`}
          >
            {isHovered ? '● Live WebGL Active' : 'Hover for 3D Orbit'}
          </span>
        </div>
      </div>

      <div className="p-5 bg-zinc-950/95 relative z-10 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base text-white group-hover:text-blue-400 transition">
              {asset.title}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                v{asset.version}
              </span>
              {onModerate && (
                <button
                  onClick={() => setShowModBox(!showModBox)}
                  title="Moderasi Owner (Approve / Hapus Spam)"
                  className="text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-400 hover:text-amber-300 transition"
                >
                  🛡️
                </button>
              )}
            </div>
          </div>

          {/* Clickable Creator Attribution Badge */}
          <div className="text-xs text-zinc-400 mt-2 flex items-center justify-between">
            <a
              href={profileHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-400/40 text-zinc-200 hover:text-blue-300 font-medium transition"
              title={`Buka Profil Kreator: ${profileHref}`}
            >
              <span>@{asset.author_name}</span>
              <span className="text-[10px] text-blue-400">↗</span>
            </a>
            <span className="text-[11px] text-zinc-500">{asset.downloads} unduhan</span>
          </div>
        </div>

        {/* Owner Moderation Drawer */}
        {showModBox && (
          <div className="p-3 rounded-2xl bg-zinc-900 border border-amber-500/40 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-semibold">
              <span>🔒 Moderasi Owner (PIN)</span>
              <button onClick={() => setShowModBox(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <input
              type="password"
              value={modPin}
              onChange={(e) => setModPin(e.target.value)}
              placeholder="Masukkan ADMIN_MERGE_PIN..."
              className="w-full bg-zinc-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
            />
            <div className="flex gap-2">
              {asset.curation_status === 'community' && (
                <button
                  disabled={modBusy}
                  onClick={() => handleModAction('approve')}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                >
                  ✓ Approve ke Featured
                </button>
              )}
              <button
                disabled={modBusy}
                onClick={() => handleModAction('delete')}
                className="flex-1 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 text-[11px] font-semibold"
              >
                🗑️ Hapus Aset / Spam
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onSelect(asset)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-1.5"
          >
            <span>Buka di 3D Studio</span>
          </button>
          <button
            onClick={(e) => onQuickExport(e, asset, 'glb')}
            title="Unduh Langsung File .GLB (Termasuk Kredit Kreator)"
            className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 font-mono font-semibold text-xs transition"
          >
            .GLB
          </button>
          <button
            onClick={(e) => onQuickExport(e, asset, 'obj')}
            title="Unduh Langsung File .OBJ (Termasuk Kredit Kreator)"
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 font-mono font-semibold text-xs transition"
          >
            .OBJ
          </button>
        </div>
      </div>
    </div>
  );
}
