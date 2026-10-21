'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Viewport3D from '@/components/Viewport3D';
import CatalogCard3D from '@/components/CatalogCard3D';
import ParametricControls from '@/components/ParametricControls';
import MonacoCodeEditor from '@/components/MonacoCodeEditor';
import PullRequestModal from '@/components/PullRequestModal';
import PolyCodeLogo from '@/components/PolyCodeLogo';
import { ForkPublishModal, SubmitPRModal } from '@/components/ActionModals';
import { INITIAL_ASSETS, INITIAL_PULL_REQUESTS } from '@/lib/seedData';
import { compileProceduralCode } from '@/lib/compiler';
import { exportToOBJ, exportToGLB } from '@/lib/exporter';
import {
  checkBackendHealth,
  BackendStatus,
  fetchAllAssets,
  fetchAllPullRequests,
  saveNewAsset,
  moderateAssetRepo,
  createNewPullRequest,
  mergePullRequestRepo,
  rejectPullRequestRepo
} from '@/lib/repository';
import { Asset3D, AssetCategory, PullRequest3D, ParamValues } from '@/types/polycode';
import { DICT, Language } from '@/lib/i18n';

const CATEGORIES = ['All', 'Nature', 'Sci-Fi', 'Weapons', 'Architecture', 'Primitives'] as const;
const LS_LANG_KEY = 'polycode_hub_lang';

export default function PolyCodeHubApp() {
  const [lang, setLang] = useState<Language>('en');
  const t = DICT[lang];

  const [activeTab, setActiveTab] = useState<'explore' | 'studio' | 'prs'>('explore');
  const [catalogMode, setCatalogMode] = useState<'verified' | 'community'>('verified');
  const [assets, setAssets] = useState<Asset3D[]>(INITIAL_ASSETS);
  const [pullRequests, setPullRequests] = useState<PullRequest3D[]>(INITIAL_PULL_REQUESTS);
  const [dbHealth, setDbHealth] = useState<BackendStatus>({
    connected: false,
    mode: 'local_fallback',
    message: 'Checking API & Supabase connection...'
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(6);
  const catalogTopRef = useRef<HTMLDivElement | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<Asset3D>(INITIAL_ASSETS[0]);
  const [editorCode, setEditorCode] = useState<string>(INITIAL_ASSETS[0].code);
  const [paramOverrides, setParamOverrides] = useState<ParamValues>({});

  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [lightingPreset, setLightingPreset] = useState<'cyber' | 'studio' | 'emerald'>('cyber');

  const [inspectingPR, setInspectingPR] = useState<PullRequest3D | null>(null);
  const [showForkModal, setShowForkModal] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4800);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LS_LANG_KEY) as Language | null;
      if (savedLang === 'en' || savedLang === 'id') {
        setLang(savedLang);
      }
    }
    checkBackendHealth().then(setDbHealth);
    fetchAllAssets().then((loaded) => {
      setAssets(loaded);
      if (loaded.length > 0) {
        const params = new URLSearchParams(window.location.search);
        const slugParam = params.get('asset');
        const matched = slugParam ? loaded.find((a) => a.slug === slugParam) : null;
        const initial = matched || loaded[0];

        setSelectedAsset(initial);
        setEditorCode(initial.code);
        if (matched) {
          setActiveTab('studio');
        }
      }
    });
    fetchAllPullRequests().then(setPullRequests);
  }, []);

  // Reset pagination to Page 1 whenever filter, search, or curation mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, catalogMode, itemsPerPage]);

  const handleToggleLanguage = (nextLang: Language) => {
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_LANG_KEY, nextLang);
    }
  };

  const compiled = useMemo(
    () => compileProceduralCode(editorCode, paramOverrides),
    [editorCode, paramOverrides]
  );

  const verifiedCount = useMemo(
    () => assets.filter((a) => (a.curation_status || 'verified') === 'verified').length,
    [assets]
  );
  const communityCount = useMemo(
    () => assets.filter((a) => a.curation_status === 'community').length,
    [assets]
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const status = item.curation_status || 'verified';
      if (status !== catalogMode) return false;
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [assets, catalogMode, selectedCategory, searchQuery]);

  // Pagination Slice Calculation
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedAssets = useMemo(
    () => filteredAssets.slice(startIndex, startIndex + itemsPerPage),
    [filteredAssets, startIndex, itemsPerPage]
  );

  const handlePageChange = (newPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages, newPage));
    setCurrentPage(clamped);
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectAsset = (asset: Asset3D) => {
    setSelectedAsset(asset);
    setEditorCode(asset.code);
    setParamOverrides({});
    setActiveTab('studio');
  };

  const handleQuickExport = (e: React.MouseEvent, asset: Asset3D, format: 'obj' | 'glb') => {
    e.stopPropagation();
    const res = compileProceduralCode(asset.code);
    if (!res.group) return;
    if (format === 'obj') exportToOBJ(res.group, asset);
    else exportToGLB(res.group, asset);
    triggerToast(`${t.toast.downloading} ${asset.slug}.${format.toUpperCase()} (${t.toast.withCredit} @${asset.author_name})`);
  };

  const handleConfirmFork = async (data: {
    title: string;
    category: AssetCategory;
    authorName: string;
    authorUrl: string;
    adminPin?: string;
  }) => {
    try {
      const { assets: updated, created } = await saveNewAsset(
        {
          title: data.title,
          category: data.category,
          author_name: data.authorName,
          author_url: data.authorUrl,
          code: editorCode,
          forked_from: selectedAsset.id,
          admin_pin: data.adminPin
        },
        assets
      );
      setAssets(updated);
      setSelectedAsset(created);
      setShowForkModal(false);
      setActiveTab('explore');
      if (created.curation_status === 'verified') {
        setCatalogMode('verified');
        triggerToast(`✓ "${created.title}" ${t.toast.publishedFeatured}`);
      } else {
        setCatalogMode('community');
        triggerToast(`✓ "${created.title}" ${t.toast.publishedCommunity}`);
      }
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message}`);
      throw err;
    }
  };

  const handleModerateAsset = async (
    assetId: string,
    action: 'approve' | 'delete',
    pin: string
  ) => {
    try {
      const updated = await moderateAssetRepo(assetId, action, pin, assets);
      setAssets(updated);
      if (action === 'approve') {
        triggerToast(t.toast.approvedAsset);
      } else {
        triggerToast(t.toast.deletedAsset);
      }
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message}`);
      throw err;
    }
  };

  const handleConfirmPR = async (data: {
    title: string;
    description: string;
    authorName: string;
    authorUrl: string;
  }) => {
    try {
      const { prs: updated, created } = await createNewPullRequest(
        {
          asset_id: selectedAsset.id,
          asset_title: selectedAsset.title,
          author_name: data.authorName,
          author_url: data.authorUrl,
          title: data.title,
          description: data.description,
          proposed_code: editorCode
        },
        pullRequests
      );
      setPullRequests(updated);
      setShowPRModal(false);
      setActiveTab('prs');
      triggerToast(`✓ Pull Request #${created.id} (@${data.authorName}) ${t.toast.prSubmitted}`);
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message}`);
      throw err;
    }
  };

  const handleMergePR = async (pr: PullRequest3D, adminPin: string) => {
    const { assets: updatedAssets, prs: updatedPRs } = await mergePullRequestRepo(
      pr,
      adminPin,
      assets,
      pullRequests
    );
    setAssets(updatedAssets);
    setPullRequests(updatedPRs);
    setInspectingPR(null);
    triggerToast(`✓ PR #${pr.id} ${t.toast.prMerged}`);
  };

  const handleRejectPR = async (prId: string, adminPin: string) => {
    const updatedPRs = await rejectPullRequestRepo(prId, adminPin, pullRequests);
    setPullRequests(updatedPRs);
    setInspectingPR(null);
    triggerToast(`PR #${prId} ${t.toast.prRejected}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-zinc-100 relative overflow-hidden">
      <div className="pointer-events-none fixed -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-purple-600/15 blur-[150px] z-0" />
      <div className="pointer-events-none fixed -bottom-40 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] z-0" />

      {toastMsg && (
        <div
          className={`fixed top-20 right-6 z-[100] px-4 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl text-xs font-semibold flex items-center gap-2.5 max-w-md border transition-all ${
            toastMsg.includes('⚠️')
              ? 'bg-red-950/95 border-red-500/60 text-red-200 shadow-red-950/50'
              : 'bg-zinc-900/95 border-blue-500/50 text-blue-100 shadow-blue-950/50'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toastMsg.includes('⚠️') ? 'bg-red-400 animate-ping' : 'bg-blue-400 animate-ping'
            }`}
          />
          <span className="leading-relaxed">{toastMsg}</span>
        </div>
      )}

      <header className="border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-zinc-950/75 sticky top-0 z-30 backdrop-blur-xl">
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <PolyCodeLogo className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                PolyCode Hub
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono font-semibold uppercase tracking-wider">
                3D Studio
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              {t.nav.subtitle}
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 bg-zinc-900/80 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.nav.explore} ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.nav.studio}
          </button>
          <button
            onClick={() => setActiveTab('prs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'prs'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.nav.prs}
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
              {pullRequests.filter((p) => p.status === 'open').length}
            </span>
          </button>
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => handleToggleLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                lang === 'en'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => handleToggleLanguage('id')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                lang === 'id'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Ganti ke Bahasa Indonesia"
            >
              ID
            </button>
          </div>

          <div
            title={dbHealth.message}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center gap-2"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbHealth.connected ? 'bg-emerald-400' : 'bg-blue-400 animate-pulse'
              }`}
            />
            <span className="text-zinc-400 hidden md:inline">{t.nav.cloudLabel}</span>
            <span className={dbHealth.connected ? 'text-emerald-300 font-semibold' : 'text-blue-300 font-semibold'}>
              {dbHealth.connected ? t.nav.supabaseConnected : t.nav.hybridMode}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto relative z-10">
        {activeTab === 'explore' && (
          <div className="space-y-8" ref={catalogTopRef}>
            <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900/90 via-zinc-950/90 to-indigo-950/40 p-8 overflow-hidden shadow-2xl">
              <div className="max-w-3xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <span>{t.hero.badge}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  {t.hero.title1}{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    {t.hero.titleHighlight}
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                  {t.hero.desc}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 p-3 rounded-2xl border border-white/10">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCatalogMode('verified')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    catalogMode === 'verified'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                      : 'text-zinc-400 hover:text-white bg-white/5'
                  }`}
                >
                  <span>{t.curation.featured}</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/30 text-[11px]">{verifiedCount}</span>
                </button>
                <button
                  onClick={() => setCatalogMode('community')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    catalogMode === 'community'
                      ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/25'
                      : 'text-zinc-400 hover:text-white bg-white/5'
                  }`}
                >
                  <span>{t.curation.community}</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/20 text-[11px]">{communityCount}</span>
                </button>
              </div>

              <p className="text-xs text-zinc-400 px-2">
                {catalogMode === 'verified' ? t.curation.featuredDesc : t.curation.communityDesc}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                      selectedCategory === cat
                        ? 'bg-white text-zinc-950 border-white shadow-md'
                        : 'bg-zinc-900/70 text-zinc-400 border-white/10 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {t.filter.categories[cat] || cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/80 border border-white/15 rounded-xl px-3 py-1.5">
                  <span>{t.pagination.perPage}</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                  >
                    <option value={6} className="bg-zinc-900">6</option>
                    <option value={9} className="bg-zinc-900">9</option>
                    <option value={12} className="bg-zinc-900">12</option>
                  </select>
                </div>

                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    placeholder={t.filter.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-white/15 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/15 rounded-3xl bg-zinc-900/30 space-y-2">
                <p className="text-sm font-semibold text-zinc-300">
                  {catalogMode === 'community' ? t.filter.emptyCommunity : t.filter.emptySearch}
                </p>
                <p className="text-xs text-zinc-500">{t.filter.emptySub}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                  {paginatedAssets.map((asset) => (
                    <CatalogCard3D
                      key={`${asset.id}-${asset.version}-${asset.curation_status}`}
                      asset={asset}
                      lang={lang}
                      onSelect={handleSelectAsset}
                      onQuickExport={handleQuickExport}
                      onModerate={handleModerateAsset}
                    />
                  ))}
                </div>

                {/* Luxury Glassmorphic Pagination Bar */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
                  <div className="text-xs text-zinc-400">
                    {t.pagination.showing}{' '}
                    <strong className="text-white">{startIndex + 1}</strong>–
                    <strong className="text-white">
                      {Math.min(startIndex + itemsPerPage, filteredAssets.length)}
                    </strong>{' '}
                    {t.pagination.of}{' '}
                    <strong className="text-blue-400">{filteredAssets.length}</strong>{' '}
                    {t.pagination.assets}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1.5 rounded-2xl border border-white/10">
                      <button
                        disabled={safePage <= 1}
                        onClick={() => handlePageChange(safePage - 1)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-35 disabled:pointer-events-none transition"
                      >
                        {t.pagination.prev}
                      </button>

                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                            pageNum === safePage
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        disabled={safePage >= totalPages}
                        onClick={() => handlePageChange(safePage + 1)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-35 disabled:pointer-events-none transition"
                      >
                        {t.pagination.next}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-125px)] min-h-[640px]">
            <div className="lg:col-span-5 flex flex-col border border-white/15 rounded-3xl bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs bg-zinc-950/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{selectedAsset.title}</span>
                  <span className="text-blue-400 font-mono">v{selectedAsset.version}</span>
                  <a
                    href={selectedAsset.author_url || `https://github.com/${selectedAsset.author_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] px-2 py-0.5 rounded bg-white/5 hover:bg-blue-500/20 text-zinc-300 hover:text-blue-300 border border-white/10 transition"
                  >
                    @{selectedAsset.author_name} ↗
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={lightingPreset}
                    onChange={(e) => setLightingPreset(e.target.value as any)}
                    className="bg-zinc-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-zinc-200 outline-none"
                  >
                    <option value="cyber">{t.studio.lightingCyber}</option>
                    <option value="studio">{t.studio.lightingStudio}</option>
                    <option value="emerald">{t.studio.lightingEmerald}</option>
                  </select>
                  <button
                    onClick={() => setWireframe(!wireframe)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      wireframe ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    {t.studio.wireframe}
                  </button>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      autoRotate ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    {t.studio.turntable}
                  </button>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      showGrid ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    {t.studio.stage}
                  </button>
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden">
                <Viewport3D
                  modelGroup={compiled.group}
                  wireframe={wireframe}
                  autoRotate={autoRotate}
                  showGrid={showGrid}
                  lightingPreset={lightingPreset}
                />
                {compiled.error && (
                  <div className="absolute bottom-3 inset-x-3 bg-red-950/95 border border-red-500 text-red-200 p-3.5 rounded-xl text-xs font-mono z-20 shadow-xl">
                    🛡️ {compiled.error}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-zinc-400 font-mono">
                  <span className="text-zinc-200 font-semibold">{compiled.stats.vertices}</span> Verts •{' '}
                  <span className="text-zinc-200 font-semibold">{compiled.stats.triangles}</span> Tris •{' '}
                  <span className="text-emerald-400">{compiled.stats.compileTimeMs}ms</span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    disabled={!compiled.group}
                    onClick={() => {
                      if (compiled.group) {
                        exportToOBJ(compiled.group, selectedAsset);
                        triggerToast(`${t.toast.downloading} ${selectedAsset.slug}.obj (${t.toast.withCredit} @${selectedAsset.author_name})`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/15 text-white text-xs font-semibold transition"
                  >
                    {t.studio.downloadObj}
                  </button>
                  <button
                    disabled={!compiled.group}
                    onClick={() => {
                      if (compiled.group) {
                        exportToGLB(compiled.group, selectedAsset);
                        triggerToast(`${t.toast.downloading} ${selectedAsset.slug}.glb (${t.toast.withCredit} @${selectedAsset.author_name})`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition"
                  >
                    {t.studio.downloadGlb}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 border border-white/15 rounded-3xl bg-zinc-900/50 backdrop-blur-xl p-5 overflow-y-auto shadow-2xl">
              <ParametricControls
                schema={compiled.schema}
                values={compiled.values}
                lang={lang}
                onChange={(k, v) => setParamOverrides((prev) => ({ ...prev, [k]: v }))}
                onReset={() => setParamOverrides({})}
              />
            </div>

            <div className="lg:col-span-4 flex flex-col border border-white/15 rounded-3xl bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/60">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 block">
                    {t.studio.scriptHeader}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {t.studio.scriptGuard}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={Boolean(compiled.error)}
                    onClick={() => setShowForkModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 border border-white/10 text-xs font-semibold text-zinc-100 transition"
                  >
                    {t.studio.forkBtn}
                  </button>
                  <button
                    disabled={Boolean(compiled.error)}
                    onClick={() => setShowPRModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-xs font-semibold text-zinc-950 transition"
                  >
                    {t.studio.prBtn}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <MonacoCodeEditor code={editorCode} onChange={setEditorCode} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prs' && (
          <div className="space-y-5 max-w-4xl mx-auto">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">{t.prs.title}</h2>
              <p className="text-sm text-zinc-400 mt-1">{t.prs.subtitle}</p>
            </div>

            {pullRequests.map((pr) => {
              const target = assets.find((a) => a.id === pr.asset_id) || assets[0];
              return (
                <div
                  key={pr.id}
                  className="p-6 rounded-3xl border border-white/15 bg-zinc-900/50 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-500/40 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs px-3 py-0.5 rounded-full font-bold ${
                          pr.status === 'open'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : pr.status === 'merged'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {pr.status.toUpperCase()}
                      </span>
                      <h3 className="font-bold text-base text-white">{pr.title}</h3>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {t.prs.targetAsset} <strong className="text-blue-400">{target.title} (v{target.version})</strong> • {t.prs.contributor}{' '}
                      <a
                        href={`https://github.com/${pr.author_name.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-200 hover:text-blue-400 underline"
                      >
                        @{pr.author_name} ↗
                      </a>
                    </p>
                  </div>

                  <button
                    onClick={() => setInspectingPR(pr)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition shrink-0"
                  >
                    {t.prs.openDiffBtn}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showForkModal && (
        <ForkPublishModal
          defaultTitle={selectedAsset.title}
          defaultCategory={selectedAsset.category}
          lang={lang}
          onConfirm={handleConfirmFork}
          onClose={() => setShowForkModal(false)}
        />
      )}

      {showPRModal && (
        <SubmitPRModal
          targetAssetTitle={selectedAsset.title}
          lang={lang}
          onConfirm={handleConfirmPR}
          onClose={() => setShowPRModal(false)}
        />
      )}

      {inspectingPR && (
        <PullRequestModal
          pr={inspectingPR}
          baseAsset={assets.find((a) => a.id === inspectingPR.asset_id) || assets[0]}
          lang={lang}
          onMerge={handleMergePR}
          onReject={handleRejectPR}
          onClose={() => setInspectingPR(null)}
        />
      )}
    </div>
  );
}
