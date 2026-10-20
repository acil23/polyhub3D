'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Viewport3D from '@/components/Viewport3D';
import CatalogCard3D from '@/components/CatalogCard3D';
import ParametricControls from '@/components/ParametricControls';
import MonacoCodeEditor from '@/components/MonacoCodeEditor';
import PullRequestModal from '@/components/PullRequestModal';
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

const CATEGORIES = ['All', 'Nature', 'Sci-Fi', 'Weapons', 'Architecture', 'Primitives'] as const;

export default function PolyCodeHubApp() {
  const [activeTab, setActiveTab] = useState<'explore' | 'studio' | 'prs'>('explore');
  const [catalogMode, setCatalogMode] = useState<'verified' | 'community'>('verified');
  const [assets, setAssets] = useState<Asset3D[]>(INITIAL_ASSETS);
  const [pullRequests, setPullRequests] = useState<PullRequest3D[]>(INITIAL_PULL_REQUESTS);
  const [dbHealth, setDbHealth] = useState<BackendStatus>({
    connected: false,
    mode: 'local_fallback',
    message: 'Memeriksa koneksi API & Supabase...'
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    setTimeout(() => setToastMsg(null), 4500);
  };

  useEffect(() => {
    checkBackendHealth().then(setDbHealth);
    fetchAllAssets().then((loaded) => {
      setAssets(loaded);
      if (loaded.length > 0) {
        setSelectedAsset(loaded[0]);
        setEditorCode(loaded[0].code);
      }
    });
    fetchAllPullRequests().then(setPullRequests);
  }, []);

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
    triggerToast(`Mengunduh ${asset.slug}.${format.toUpperCase()} (Lengkap dengan Kredit @${asset.author_name})`);
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
        triggerToast(`Aset "${created.title}" langsung terbit di Featured Showcase!`);
      } else {
        setCatalogMode('community');
        triggerToast(`Aset "${created.title}" terbit di Community Sandbox (Menunggu kurasi Owner ke Featured)!`);
      }
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message}`);
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
        triggerToast('✓ Aset berhasil disetujui dan dipindahkan ke Featured Showcase!');
      } else {
        triggerToast('🗑️ Aset / Spam berhasil dihapus dari katalog.');
      }
    } catch (err: any) {
      triggerToast(`⚠️ Gagal Moderasi: ${err.message}`);
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
      triggerToast(`Pull Request #${created.id} oleh @${data.authorName} berhasil diajukan!`);
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message}`);
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
    triggerToast(`PR #${pr.id} berhasil di-merge oleh Owner!`);
  };

  const handleRejectPR = async (prId: string, adminPin: string) => {
    const updatedPRs = await rejectPullRequestRepo(prId, adminPin, pullRequests);
    setPullRequests(updatedPRs);
    setInspectingPR(null);
    triggerToast(`Pull Request #${prId} ditolak oleh Owner.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-zinc-100 relative overflow-hidden">
      <div className="pointer-events-none fixed -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-purple-600/15 blur-[150px] z-0" />
      <div className="pointer-events-none fixed -bottom-40 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] z-0" />

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 border border-blue-500/40 text-blue-200 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl text-xs font-semibold flex items-center gap-2 max-w-md">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <header className="border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between bg-zinc-950/75 sticky top-0 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-blue-500/30 border border-white/20">
            P3D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                PolyCode Hub
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-semibold">
                v0.4.2 Ready
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Creator Attribution • Anti-Spam Queue • Zero File Storage
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
            Explore Catalog ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            3D Studio & Exporter
          </button>
          <button
            onClick={() => setActiveTab('prs')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'prs'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Pull Requests
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
              {pullRequests.filter((p) => p.status === 'open').length}
            </span>
          </button>
        </nav>

        <div className="flex items-center gap-2.5">
          <div
            title={dbHealth.message}
            className="text-xs px-3.5 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center gap-2"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dbHealth.connected ? 'bg-emerald-400' : 'bg-blue-400 animate-pulse'
              }`}
            />
            <span className="text-zinc-400">Backend:</span>
            <span className={dbHealth.connected ? 'text-emerald-300 font-semibold' : 'text-blue-300 font-semibold'}>
              {dbHealth.connected ? 'Supabase Cloud Connected' : 'Local Hybrid API'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto relative z-10">
        {activeTab === 'explore' && (
          <div className="space-y-8">
            <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900/90 via-zinc-950/90 to-indigo-950/40 p-8 overflow-hidden shadow-2xl">
              <div className="max-w-3xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <span>✨ v0.4.2 CREATOR ATTRIBUTION & MODERATED SHOWCASE</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Infinite 3D Assets.{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    Full Creator Credit.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                  Bagikan aset 3D prosedural Anda tanpa perlu membuat akun. Nama & link portofolio/GitHub Anda tampil sebagai <em>badge</em> aktif di katalog dan tertanam otomatis di dalam setiap file <code>.OBJ</code> & <code>.GLB</code> yang diunduh!
                </p>
              </div>
            </div>

            {/* Curation Mode Switcher (Featured Showcase vs Community Sandbox) */}
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
                  <span>🌟 Featured Showcase</span>
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
                  <span>🧪 Community Sandbox (Unverified Queue)</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/20 text-[11px]">{communityCount}</span>
                </button>
              </div>

              <p className="text-xs text-zinc-400 px-2">
                {catalogMode === 'verified'
                  ? 'Menampilkan aset 3D pilihan yang telah diverifikasi oleh Owner.'
                  : 'Kiriman komunitas publik. Klik ikon 🛡️ pada kartu untuk Approve ke Featured atau Hapus Spam dengan PIN Owner.'}
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
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[260px]">
                <input
                  type="text"
                  placeholder="Cari nama aset 3D atau @kreator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-white/15 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none transition"
                />
              </div>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/15 rounded-3xl bg-zinc-900/30 space-y-2">
                <p className="text-sm font-semibold text-zinc-300">
                  {catalogMode === 'community'
                    ? 'Belum ada kiriman baru di antrean Community Sandbox.'
                    : 'Tidak ada aset yang cocok dengan filter pencarian.'}
                </p>
                <p className="text-xs text-zinc-500">
                  Buka 3D Studio untuk memodifikasi model dan klik &ldquo;Fork / Publish Baru&rdquo;!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                {filteredAssets.map((asset) => (
                  <CatalogCard3D
                    key={`${asset.id}-${asset.version}-${asset.curation_status}`}
                    asset={asset}
                    onSelect={handleSelectAsset}
                    onQuickExport={handleQuickExport}
                    onModerate={handleModerateAsset}
                  />
                ))}
              </div>
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
                    <option value="cyber">Lighting: Cyber Neon</option>
                    <option value="studio">Lighting: Warm Gold</option>
                    <option value="emerald">Lighting: Emerald Lab</option>
                  </select>
                  <button
                    onClick={() => setWireframe(!wireframe)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      wireframe ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    Wireframe
                  </button>
                  <button
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      autoRotate ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    Turntable
                  </button>
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-2.5 py-1 rounded-lg border transition ${
                      showGrid ? 'border-blue-500 bg-blue-500/20 text-blue-300' : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    Stage
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
                        triggerToast(`Mengunduh ${selectedAsset.slug}.obj (Embedded Credit @${selectedAsset.author_name})`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/15 text-white text-xs font-semibold transition"
                  >
                    Unduh .OBJ
                  </button>
                  <button
                    disabled={!compiled.group}
                    onClick={() => {
                      if (compiled.group) {
                        exportToGLB(compiled.group, selectedAsset);
                        triggerToast(`Mengunduh ${selectedAsset.slug}.glb (Embedded Credit @${selectedAsset.author_name})`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition"
                  >
                    Unduh .GLB (glTF)
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 border border-white/15 rounded-3xl bg-zinc-900/50 backdrop-blur-xl p-5 overflow-y-auto shadow-2xl">
              <ParametricControls
                schema={compiled.schema}
                values={compiled.values}
                onChange={(k, v) => setParamOverrides((prev) => ({ ...prev, [k]: v }))}
                onReset={() => setParamOverrides({})}
              />
            </div>

            <div className="lg:col-span-4 flex flex-col border border-white/15 rounded-3xl bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/60">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 block">
                    Sandboxed Three.js Script
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✓ Anti-Duplicate & Rate Limiter Active
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={Boolean(compiled.error)}
                    onClick={() => setShowForkModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 border border-white/10 text-xs font-semibold text-zinc-100 transition"
                  >
                    Fork / Publish Baru
                  </button>
                  <button
                    disabled={Boolean(compiled.error)}
                    onClick={() => setShowPRModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-xs font-semibold text-zinc-950 transition"
                  >
                    Ajukan Pull Request
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
              <h2 className="text-2xl font-bold text-white">Open-Source 3D Pull Requests</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Semua orang dapat mengajukan PR beserta link kredit portofolionya, namun persetujuan <strong>Approve & Merge</strong> dilindungi oleh <strong>Owner PIN Guard</strong>.
              </p>
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
                      Target Aset: <strong className="text-blue-400">{target.title} (v{target.version})</strong> • Kontributor:{' '}
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
                    Buka 3D & Code Diff
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
          onConfirm={handleConfirmFork}
          onClose={() => setShowForkModal(false)}
        />
      )}

      {showPRModal && (
        <SubmitPRModal
          targetAssetTitle={selectedAsset.title}
          onConfirm={handleConfirmPR}
          onClose={() => setShowPRModal(false)}
        />
      )}

      {inspectingPR && (
        <PullRequestModal
          pr={inspectingPR}
          baseAsset={assets.find((a) => a.id === inspectingPR.asset_id) || assets[0]}
          onMerge={handleMergePR}
          onReject={handleRejectPR}
          onClose={() => setInspectingPR(null)}
        />
      )}
    </div>
  );
}
