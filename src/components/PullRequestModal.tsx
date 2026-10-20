'use client';

import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import Viewport3D from './Viewport3D';
import { compileProceduralCode } from '@/lib/compiler';
import { Asset3D, PullRequest3D } from '@/types/polycode';

interface PullRequestModalProps {
  pr: PullRequest3D;
  baseAsset: Asset3D;
  onMerge: (pr: PullRequest3D, adminPin: string) => Promise<void>;
  onReject: (prId: string, adminPin: string) => Promise<void>;
  onClose: () => void;
}

export default function PullRequestModal({
  pr,
  baseAsset,
  onMerge,
  onReject,
  onClose
}: PullRequestModalProps) {
  const [adminPin, setAdminPin] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseCompiled = compileProceduralCode(baseAsset.code);
  const proposedCompiled = compileProceduralCode(pr.proposed_code);

  const vertDiff = proposedCompiled.stats.vertices - baseCompiled.stats.vertices;
  const triDiff = proposedCompiled.stats.triangles - baseCompiled.stats.triangles;

  const handleAction = async (type: 'merge' | 'reject') => {
    if (!adminPin.trim()) {
      setAuthError('Masukkan PIN Owner terlebih dahulu untuk memproses Pull Request ini.');
      return;
    }
    setAuthError(null);
    setIsSubmitting(true);
    try {
      if (type === 'merge') {
        await onMerge(pr, adminPin.trim());
      } else {
        await onReject(pr.id, adminPin.trim());
      }
    } catch (err: any) {
      setAuthError(err?.message || 'PIN Owner salah atau terjadi kesalahan server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-zinc-950 border border-white/15 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Visual 3D & Monaco Diff Review #{pr.id}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                Delta: {vertDiff >= 0 ? `+${vertDiff}` : vertDiff} verts / {triDiff >= 0 ? `+${triDiff}` : triDiff} tris
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{pr.title}</h2>
            <p className="text-xs text-zinc-400">
              Diajukan oleh <strong className="text-zinc-200">@{pr.author_name}</strong> untuk memperbarui{' '}
              <strong className="text-blue-400">{baseAsset.title} (v{baseAsset.version})</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-sm px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition"
          >
            Tutup ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <p className="text-xs sm:text-sm text-zinc-300 bg-zinc-900/80 p-3.5 rounded-xl border border-white/10">
            {pr.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-white/10 rounded-2xl p-3 bg-zinc-900/40">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold text-zinc-400">BASE MODEL (v{baseAsset.version})</span>
                <span className="font-mono text-zinc-400">
                  {baseCompiled.stats.vertices} verts • {baseCompiled.stats.triangles} tris
                </span>
              </div>
              <div className="h-56 rounded-xl overflow-hidden border border-white/5">
                <Viewport3D modelGroup={baseCompiled.group} />
              </div>
            </div>

            <div className="border border-emerald-500/40 rounded-2xl p-3 bg-emerald-950/15">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold text-emerald-400">PROPOSED PR UPDATE</span>
                <span className="font-mono text-emerald-300">
                  {proposedCompiled.stats.vertices} verts • {proposedCompiled.stats.triangles} tris
                </span>
              </div>
              <div className="h-56 rounded-xl overflow-hidden border border-emerald-500/30">
                <Viewport3D modelGroup={proposedCompiled.group} />
              </div>
            </div>
          </div>

          <div className="border border-white/15 rounded-2xl overflow-hidden bg-zinc-900/60">
            <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/80">
              <span className="font-semibold text-zinc-200">Monaco Side-by-Side Code Diff Inspector</span>
              <span className="font-mono text-[11px]">Merah: Kode Lama • Hijau: Usulan PR</span>
            </div>
            <div className="h-72 w-full">
              <DiffEditor
                height="100%"
                language="javascript"
                theme="vs-dark"
                original={baseAsset.code}
                modified={pr.proposed_code}
                options={{
                  readOnly: true,
                  renderSideBySide: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>
          </div>
        </div>

        {pr.status === 'open' && (
          <div className="p-4 border-t border-white/10 bg-zinc-900/80 space-y-3">
            {authError && (
              <div className="bg-red-950/90 border border-red-500/60 text-red-200 px-3.5 py-2 rounded-xl text-xs font-medium">
                ⚠️ {authError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 max-w-md">
                <span className="text-xs font-semibold text-amber-300 whitespace-nowrap">
                  🔒 Owner PIN:
                </span>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Masukkan ADMIN_MERGE_PIN..."
                  className="w-full bg-zinc-950 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleAction('reject')}
                  className="px-4 py-2 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 disabled:opacity-40 text-xs sm:text-sm font-medium transition"
                >
                  Tolak PR
                </button>
                <button
                  disabled={Boolean(proposedCompiled.error) || isSubmitting}
                  onClick={() => handleAction('merge')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-600/30 transition"
                >
                  {isSubmitting ? 'Memverifikasi...' : 'Approve & Merge ke Katalog Utama'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
