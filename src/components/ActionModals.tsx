'use client';

import React, { useState } from 'react';
import { AssetCategory } from '@/types/polycode';
import { DICT, Language } from '@/lib/i18n';

interface ForkModalProps {
  defaultTitle: string;
  defaultCategory: AssetCategory;
  lang: Language;
  onConfirm: (data: {
    title: string;
    category: AssetCategory;
    authorName: string;
    authorUrl: string;
    adminPin?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function ForkPublishModal({
  defaultTitle,
  defaultCategory,
  lang,
  onConfirm,
  onClose
}: ForkModalProps) {
  const t = DICT[lang].forkModal;
  const [title, setTitle] = useState(`${defaultTitle} (Remix)`);
  const [category, setCategory] = useState<AssetCategory>(defaultCategory);
  const [authorName, setAuthorName] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorName.trim()) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onConfirm({
        title: title.trim(),
        category,
        authorName: authorName.trim().replace(/^@/, ''),
        authorUrl: authorUrl.trim(),
        adminPin: adminPin.trim() || undefined
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to publish 3D asset.');
    } finally {
      setIsSubmitting(false);
    }
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
              {t.badge}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{t.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs leading-relaxed font-medium shadow-lg">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">{t.assetName}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">{t.category}</label>
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
              <label className="text-zinc-300 font-semibold">{t.creatorUser}</label>
              <input
                type="text"
                required
                placeholder={t.creatorUserPlaceholder}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">{t.creatorLink}</label>
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
            <p className="text-[11px] text-blue-200 leading-relaxed">{t.creditInfo}</p>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-white/10">
            <label className="text-amber-300 font-semibold flex items-center justify-between">
              <span>{t.ownerPinLabel}</span>
              <span className="text-[10px] text-zinc-400 font-normal">{t.ownerPinHint}</span>
            </label>
            <input
              type="password"
              placeholder={t.ownerPinPlaceholder}
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
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-blue-600/30"
          >
            {isSubmitting
              ? t.processing
              : adminPin
              ? t.publishFeatured
              : t.publishCommunity}
          </button>
        </div>
      </form>
    </div>
  );
}

interface SubmitPRModalProps {
  targetAssetTitle: string;
  lang: Language;
  onConfirm: (data: { title: string; description: string; authorName: string; authorUrl: string }) => Promise<void>;
  onClose: () => void;
}

export function SubmitPRModal({ targetAssetTitle, lang, onConfirm, onClose }: SubmitPRModalProps) {
  const t = DICT[lang].prModal;
  const [title, setTitle] = useState(`${t.defaultTitlePrefix} ${targetAssetTitle}`);
  const [description, setDescription] = useState(t.defaultDesc);
  const [authorName, setAuthorName] = useState('');
  const [authorUrl, setAuthorUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorName.trim()) return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onConfirm({
        title: title.trim(),
        description: description.trim(),
        authorName: authorName.trim().replace(/^@/, ''),
        authorUrl: authorUrl.trim()
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit Pull Request.');
    } finally {
      setIsSubmitting(false);
    }
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
              {t.badge}
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {t.titlePrefix} {targetAssetTitle}
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

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/90 border border-red-500/60 text-red-200 text-xs leading-relaxed font-medium shadow-lg">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-semibold">{t.prTitle}</label>
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
              <label className="text-zinc-300 font-semibold">{t.contributorUser}</label>
              <input
                type="text"
                required
                placeholder={t.contributorUserPlaceholder}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">{t.contributorLink}</label>
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
            <label className="text-zinc-300 font-semibold">{t.changelog}</label>
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
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/25"
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </div>
      </form>
    </div>
  );
}
