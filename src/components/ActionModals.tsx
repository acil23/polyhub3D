'use client';

import React, { useState } from 'react';
import { AssetCategory } from '@/types/polycode';

interface ForkModalProps {
  defaultTitle: string;
  defaultCategory: AssetCategory;
  onConfirm: (data: {
    title: string;
    category: AssetCategory;
    authorName: string;
    authorUrl: string;
    adminPin?: string;
  }) => void;
  onClose: () => void;
}

export function ForkPublishModal({
  defaultTitle,
  defaultCategory,
  onConfirm,
  onClose
}: ForkModalProps) {
  const [title, setTitle] = useState(`${defaultTitle} (Remix)`);
  const [category, setCategory] = useState<AssetCategory>(defaultCategory);
  const [authorName, setAuthorName] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');
  const [adminPin, setAdminPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorName.trim()) return;
    onConfirm({
      title: title.trim(),
      category,
      authorName: authorName.trim().replace(/^@/, ''),
      authorUrl: authorUrl.trim(),
      adminPin: adminPin.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-950 border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Creator Attribution & Anti-Spam Queue
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">Publish / Fork Aset 3D</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Nama Aset 3D *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-blue-500 rounded-xl px-3 py-2.5 text-white outline-none"
              >
                <option value="Nature">Nature</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Weapons">Weapons</option>
                <option value="Architecture">Architecture</option>
                <option value="Primitives">Primitives</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Username Kreator *</label>
              <input
                type="text"
                required
                placeholder="misal: radit_3d"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Link GitHub / Portofolio (Kredit)</label>
              <input
                type="text"
                placeholder="https://github.com/username"
                value={authorUrl}
                onChange={(e) => setAuthorUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-2">
            <p className="text-[11px] text-blue-200 leading-relaxed">
              💡 <strong>Kredit Otomatis:</strong> Nama & link portofolio Anda akan ditampilkan sebagai <em>badge</em> aktif di kartu katalog serta ditanamkan otomatis di dalam setiap file <code>.OBJ</code> dan <code>.GLB</code> yang diunduh pengguna!
            </p>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <label className="text-amber-300 font-semibold flex items-center justify-between">
              <span>🔒 Owner PIN (Opsional - Khusus Admin/Owner)</span>
              <span className="text-[10px] text-zinc-400 font-normal">Kosongkan jika Anda Kontributor Publik</span>
            </label>
            <input
              type="password"
              placeholder="Kosongkan untuk masuk ke Community Sandbox..."
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full bg-zinc-900 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2 text-white outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30"
          >
            {adminPin ? 'Publish Langsung ke Featured' : 'Publish ke Community Sandbox'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface SubmitPRModalProps {
  targetAssetTitle: string;
  onConfirm: (data: { title: string; description: string; authorName: string; authorUrl: string }) => void;
  onClose: () => void;
}

export function SubmitPRModal({ targetAssetTitle, onConfirm, onClose }: SubmitPRModalProps) {
  const [title, setTitle] = useState(`Optimasi Geometri & Parameter pada ${targetAssetTitle}`);
  const [description, setDescription] = useState(
    'Menambahkan detail mesh prosedural serta merapikan rentang slider parameter.'
  );
  const [authorName, setAuthorName] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorName.trim()) return;
    onConfirm({
      title: title.trim(),
      description: description.trim(),
      authorName: authorName.trim().replace(/^@/, ''),
      authorUrl: authorUrl.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-950 border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Open-Source 3D Contribution
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Ajukan Pull Request ke {targetAssetTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold">Judul Pull Request *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Username Kontributor *</label>
              <input
                type="text"
                required
                placeholder="misal: maya_3d"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Link GitHub / Portofolio</label>
              <input
                type="text"
                placeholder="https://github.com/username"
                value={authorUrl}
                onChange={(e) => setAuthorUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold">Catatan Perubahan Teknis (Changelog)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/25"
          >
            Kirim Pull Request
          </button>
        </div>
      </form>
    </div>
  );
}
