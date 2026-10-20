'use client';

import React, { useState, useMemo } from 'react';
import Viewport3D from '@/components/Viewport3D';
import ParametricControls from '@/components/ParametricControls';
import MonacoCodeEditor from '@/components/MonacoCodeEditor';
import PullRequestModal from '@/components/PullRequestModal';
import { INITIAL_ASSETS, INITIAL_PULL_REQUESTS } from '@/lib/seedData';
import { compileProceduralCode } from '@/lib/compiler';
import { exportToOBJ, exportToGLB } from '@/lib/exporter';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Asset3D, PullRequest3D, ParamValues } from '@/types/polycode';

const CATEGORIES = ['All', 'Nature', 'Sci-Fi', 'Weapons', 'Architecture'] as const;

export default function PolyCodeHubApp() {
  const [activeTab, setActiveTab] = useState<'explore' | 'studio' | 'prs'>('explore');
  const [assets, setAssets] = useState<Asset3D[]>(INITIAL_ASSETS);
  const [pullRequests, setPullRequests] = useState<PullRequest3D[]>(INITIAL_PULL_REQUESTS);

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

  const compiled = useMemo(
    () => compileProceduralCode(editorCode, paramOverrides),
    [editorCode, paramOverrides]
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [assets, selectedCategory, searchQuery]);

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
    if (format === 'obj') exportToOBJ(res.group, asset.slug);
    else exportToGLB(res.group, asset.slug);
  };

  const handleForkAsset = () => {
    const title = prompt('Nama Aset Baru (Fork/Remix):', `${selectedAsset.title} (Remix)`);
    if (!title) return;
    const newAsset: Asset3D = {
      id: `asset-${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      category: selectedAsset.category,
      author_name: 'you_creator',
      version: '1.0.0',
      code: editorCode,
      downloads: 1,
      forked_from: selectedAsset.id,
      created_at: new Date().toISOString()
    };
    setAssets([newAsset, ...assets]);
    setSelectedAsset(newAsset);
    setActiveTab('explore');
  };

  const handleSubmitPR = () => {
    const title = prompt('Judul Pull Request:', `Optimasi Geometri pada ${selectedAsset.title}`);
    if (!title) return;
    const description = prompt('Deskripsi perubahan:', 'Menambahkan detail parameter dan merapikan mesh.') || '';
    const newPR: PullRequest3D = {
      id: `pr-${Date.now().toString().slice(-3)}`,
      asset_id: selectedAsset.id,
      asset_title: selectedAsset.title,
      author_name: 'you_contributor',
      title,
      description,
      proposed_code: editorCode,
      status: 'open',
      created_at: new Date().toISOString()
    };
    setPullRequests([newPR, ...pullRequests]);
    setActiveTab('prs');
  };

  const handleMergePR = (pr: PullRequest3D) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== pr.asset_id) return a;
        const parts = a.version.split('.').map(Number);
        const nextVer = `${parts[0]}.${(parts[1] || 0) + 1}.0`;
        return { ...a, code: pr.proposed_code, version: nextVer };
      })
    );
    setPullRequests((prev) => prev.map((item) => (item.id === pr.id ? { ...item, status: 'merged' } : item)));
    setInspectingPR(null);
  };

  const handleRejectPR = (prId: string) => {
    setPullRequests((prev) => prev.map((item) => (item.id === prId ? { ...item, status: 'rejected' } : item)));
    setInspectingPR(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050508] text-zinc-100 relative overflow-hidden">
      {/* Luxury Ambient Background Glows */}
      <div className="pointer-events-none fixed -top-40 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] z-0" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-purple-600/15 blur-[150px] z-0" />
      <div className="pointer-events-none fixed -bottom-40 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px] z-0" />

      {/* Glassmorphic Top Navbar */}
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
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono font-semibold">
                v0.2.0 Studio
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Procedural 3D Asset Engine • Zero Server Storage
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
            Explore Showcase ({assets.length})
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

        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-zinc-400">Engine:</span>
            <span className={isSupabaseConfigured ? 'text-emerald-300 font-semibold' : 'text-amber-300 font-semibold'}>
              {isSupabaseConfigured ? 'Supabase Cloud' : 'Local Hybrid'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto relative z-10">
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Luxury Hero Banner */}
            <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900/90 via-zinc-950/90 to-indigo-950/40 p-8 overflow-hidden shadow-2xl">
              <div className="max-w-3xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                  <span>✨ NEXT-GEN PROCEDURAL 3D REPOSITORY</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Infinite 3D Assets.{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    Zero File Storage.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                  Setiap objek 3D di bawah ini dibangun secara <em>real-time</em> dari skrip Three.js berukuran ~1.5 KB. Putar langsung di kartu katalog, kustomisasi bentuknya dengan <em>Parametric Sliders</em>, lalu unduh sebagai file <strong>.GLB</strong> atau <strong>.OBJ</strong> siap pakai untuk Blender, Unity, dan Unreal Engine.
                </p>

                <div className="pt-2 flex flex-wrap gap-6 text-xs text-zinc-300">
                  <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-blue-400 font-bold text-base">99.8%</span>
                    <span className="text-zinc-400">Hemat Storage Server</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-emerald-400 font-bold text-base">.GLB & .OBJ</span>
                    <span className="text-zinc-400">Instan Client-Side Export</span>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-purple-400 font-bold text-base">Git-Style PR</span>
                    <span className="text-zinc-400">Open-Source 3D Collaboration</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
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
                  placeholder="Cari nama aset 3D atau kreator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-white/15 focus:border-blue-500 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 outline-none transition"
                />
              </div>
            </div>

            {/* Luxury 3D Asset Cards Grid (Fixed Overflow & Z-Index) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredAssets.map((asset) => {
                const preview = compileProceduralCode(asset.code);
                return (
                  <div
                    key={asset.id}
                    className="group relative rounded-3xl border border-white/10 hover:border-blue-500/60 bg-zinc-900/50 backdrop-blur-md overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_20px_50px_rgba(37,99,235,0.2)]"
                  >
                    {/* 3D Viewport Container - Locked Height & Overflow Hidden */}
                    <div className="h-64 w-full relative overflow-hidden z-0 border-b border-white/10">
                      <Viewport3D modelGroup={preview.group} autoRotate={true} showGrid={true} />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
                        <span className="text-[11px] font-semibold bg-zinc-950/85 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-zinc-200">
                          {asset.category}
                        </span>
                        <span className="text-[11px] bg-blue-950/90 backdrop-blur-md border border-blue-400/40 px-2.5 py-1 rounded-full font-mono text-blue-300 font-semibold">
                          ⚡ {preview.stats.scriptSizeKB} KB
                        </span>
                      </div>

                      {/* Bottom Telemetry Pill inside Viewport */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
                        <span className="text-[10px] font-mono bg-black/70 backdrop-blur px-2.5 py-1 rounded-lg text-zinc-300 border border-white/10">
                          {preview.stats.vertices} Verts • {preview.stats.triangles} Tris
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-950/85 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                          Interactive 3D
                        </span>
                      </div>
                    </div>

                    {/* Card Footer & Action Buttons - Separated on z-10 so it is NEVER covered */}
                    <div className="p-5 bg-zinc-950/95 relative z-10 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-base text-white group-hover:text-blue-400 transition">
                            {asset.title}
                          </h3>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            v{asset.version}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
                          <span>
                            Kreator: <strong className="text-zinc-200">@{asset.author_name}</strong>
                          </span>
                          <span>{asset.downloads} unduhan</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSelectAsset(asset)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-1.5"
                        >
                          <span>Buka di 3D Studio</span>
                        </button>
                        <button
                          onClick={(e) => handleQuickExport(e, asset, 'glb')}
                          title="Unduh Langsung File .GLB"
                          className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 font-mono font-semibold text-xs transition"
                        >
                          .GLB
                        </button>
                        <button
                          onClick={(e) => handleQuickExport(e, asset, 'obj')}
                          title="Unduh Langsung File .OBJ"
                          className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 font-mono font-semibold text-xs transition"
                        >
                          .OBJ
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-125px)] min-h-[640px]">
            {/* 3D Viewport Column */}
            <div className="lg:col-span-5 flex flex-col border border-white/15 rounded-3xl bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs bg-zinc-950/60">
                <div>
                  <span className="font-bold text-white text-sm">{selectedAsset.title}</span>
                  <span className="ml-2 text-blue-400 font-mono">v{selectedAsset.version}</span>
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
                  <div className="absolute bottom-3 inset-x-3 bg-red-950/95 border border-red-500 text-red-200 p-3.5 rounded-xl text-xs font-mono z-20">
                    Compile Error: {compiled.error}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/10 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-zinc-400 font-mono">
                  <span className="text-zinc-200 font-semibold">{compiled.stats.vertices}</span> Verts •{' '}
                  <span className="text-zinc-200 font-semibold">{compiled.stats.triangles}</span> Tris •{' '}
                  <span className="text-blue-400">{compiled.stats.scriptSizeKB} KB</span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    disabled={!compiled.group}
                    onClick={() => compiled.group && exportToOBJ(compiled.group, selectedAsset.slug)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/15 text-white text-xs font-semibold transition"
                  >
                    Unduh .OBJ
                  </button>
                  <button
                    disabled={!compiled.group}
                    onClick={() => compiled.group && exportToGLB(compiled.group, selectedAsset.slug)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition"
                  >
                    Unduh .GLB (glTF)
                  </button>
                </div>
              </div>
            </div>

            {/* Parametric Sliders Column */}
            <div className="lg:col-span-3 border border-white/15 rounded-3xl bg-zinc-900/50 backdrop-blur-xl p-5 overflow-y-auto shadow-2xl">
              <ParametricControls
                schema={compiled.schema}
                values={compiled.values}
                onChange={(k, v) => setParamOverrides((prev) => ({ ...prev, [k]: v }))}
                onReset={() => setParamOverrides({})}
              />
            </div>

            {/* Live Code Editor Column */}
            <div className="lg:col-span-4 flex flex-col border border-white/15 rounded-3xl bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/60">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Procedural Three.js Code
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleForkAsset}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-zinc-100 transition"
                  >
                    Fork / Publish Baru
                  </button>
                  <button
                    onClick={handleSubmitPR}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-xs font-semibold text-zinc-950 transition"
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
                Bandingkan geometri lama vs geometri baru secara berdampingan (*Side-by-Side 3D Diff*) sebelum menyetujui perubahan kode.
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
                      <span className="text-zinc-200">@{pr.author_name}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setInspectingPR(pr)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition shrink-0"
                  >
                    Buka 3D Diff & Review
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
