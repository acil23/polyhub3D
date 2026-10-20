'use client';

import React from 'react';
import Viewport3D from './Viewport3D';
import { compileProceduralCode } from '@/lib/compiler';
import { Asset3D, PullRequest3D } from '@/types/polycode';

interface PullRequestModalProps {
  pr: PullRequest3D;
  baseAsset: Asset3D;
  onMerge: (pr: PullRequest3D) => void;
  onReject: (prId: string) => void;
  onClose: () => void;
}

export default function PullRequestModal({
  pr,
  baseAsset,
  onMerge,
  onReject,
  onClose
}: PullRequestModalProps) {
  const baseCompiled = compileProceduralCode(baseAsset.code);
  const proposedCompiled = compileProceduralCode(pr.proposed_code);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-zinc-950 border border-white/15 rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
          <div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Visual 3D Pull Request #{pr.id}
            </span>
            <h2 className="text-lg font-bold text-white mt-1.5">{pr.title}</h2>
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

        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <p className="text-sm text-zinc-300 bg-zinc-900/80 p-4 rounded-xl border border-white/10">
            {pr.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-white/10 rounded-2xl p-3.5 bg-zinc-900/40">
              <div className="flex justify-between text-xs mb-2.5">
                <span className="font-bold text-zinc-400">MODEL SAAT INI (v{baseAsset.version})</span>
                <span className="font-mono text-zinc-400">
                  {baseCompiled.stats.vertices} verts • {baseCompiled.stats.triangles} tris
                </span>
              </div>
              <div className="h-64 rounded-xl overflow-hidden border border-white/5">
                <Viewport3D modelGroup={baseCompiled.group} />
              </div>
            </div>

            <div className="border border-emerald-500/40 rounded-2xl p-3.5 bg-emerald-950/15">
              <div className="flex justify-between text-xs mb-2.5">
                <span className="font-bold text-emerald-400">USULAN PERUBAHAN (PR)</span>
                <span className="font-mono text-emerald-300">
                  {proposedCompiled.stats.vertices} verts • {proposedCompiled.stats.triangles} tris
                </span>
              </div>
              <div className="h-64 rounded-xl overflow-hidden border border-emerald-500/30">
                <Viewport3D modelGroup={proposedCompiled.group} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            <pre className="p-4 rounded-xl bg-zinc-900/90 border border-white/10 overflow-x-auto text-zinc-400 max-h-56">
              {baseAsset.code}
            </pre>
            <pre className="p-4 rounded-xl bg-emerald-950/25 border border-emerald-500/30 overflow-x-auto text-emerald-200 max-h-56">
              {pr.proposed_code}
            </pre>
          </div>
        </div>

        {pr.status === 'open' && (
          <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-zinc-900/60">
            <button
              onClick={() => onReject(pr.id)}
              className="px-4 py-2 rounded-xl bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 text-sm font-medium transition"
            >
              Tolak PR
            </button>
            <button
              onClick={() => onMerge(pr)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition"
            >
              Approve & Merge ke Katalog Utama
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
