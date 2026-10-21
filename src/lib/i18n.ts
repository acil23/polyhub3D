export type Language = 'en' | 'id';

export const DICT = {
  en: {
    nav: {
      subtitle: 'Open-Source Procedural 3D Assets',
      explore: 'Explore Catalog',
      studio: '3D Studio & Exporter',
      prs: 'Pull Requests',
      cloudLabel: 'Cloud:',
      supabaseConnected: 'Supabase Connected',
      hybridMode: 'Hybrid Mode'
    },
    hero: {
      badge: '✨ 18+ PRO PROCEDURAL 3D ASSETS • ZERO BINARY STORAGE',
      title1: 'Infinite 3D Assets.',
      titleHighlight: 'Full Creator Credit.',
      desc: 'Share procedural 3D assets without creating an account. Your username & GitHub/portfolio link are displayed as an active badge on the catalog and permanently embedded inside every downloaded .OBJ & .GLB file!'
    },
    curation: {
      featured: '🌟 Featured Showcase',
      community: '🧪 Community Sandbox (Unverified Queue)',
      featuredDesc: 'Displaying official 3D assets curated and verified by the Owner.',
      communityDesc: 'Public community submissions. Click the 🛡️ icon on any card to Approve to Featured or Delete Spam using the Owner PIN.'
    },
    filter: {
      searchPlaceholder: 'Search 3D asset title or @creator...',
      emptyCommunity: 'No new submissions in the Community Sandbox queue yet.',
      emptySearch: 'No 3D assets match your current search filter.',
      emptySub: 'Open the 3D Studio to customize a model and click "Fork / Publish New"!',
      categories: {
        All: 'All',
        Nature: 'Nature',
        'Sci-Fi': 'Sci-Fi',
        Weapons: 'Weapons',
        Architecture: 'Architecture',
        Primitives: 'Primitives'
      } as Record<string, string>
    },
    pagination: {
      showing: 'Showing',
      of: 'of',
      assets: '3D assets',
      perPage: 'Per page:',
      prev: '← Prev',
      next: 'Next →',
      page: 'Page'
    },
    card: {
      featuredBadge: '✓ Featured',
      communityBadge: '⏳ Community Sandbox',
      liveWebgl: '● Live WebGL Active',
      hoverOrbit: 'Hover for 3D Orbit',
      downloads: 'downloads',
      modTooltip: 'Owner Moderation (Approve / Delete Spam)',
      modTitle: '🔒 Owner Moderation (PIN)',
      pinPlaceholder: 'Enter ADMIN_MERGE_PIN...',
      approveBtn: '✓ Approve to Featured',
      deleteBtn: '🗑️ Delete Asset / Spam',
      openStudio: 'Open in 3D Studio',
      generatingSnap: 'Generating 3D Snapshot...',
      profileTooltip: 'Open Creator Profile:'
    },
    studio: {
      lightingCyber: 'Lighting: Cyber Neon',
      lightingStudio: 'Lighting: Warm Gold',
      lightingEmerald: 'Lighting: Emerald Lab',
      wireframe: 'Wireframe',
      turntable: 'Turntable',
      stage: 'Stage',
      downloadObj: 'Download .OBJ',
      downloadGlb: 'Download .GLB (glTF)',
      paramTitle: 'Parametric Controls',
      paramSub: 'Real-time customization before export',
      reset: 'Reset',
      noParams: 'This script does not declare a params object.',
      scriptHeader: 'Sandboxed Three.js Script',
      scriptGuard: '✓ Anti-Duplicate & Rate Limiter Active',
      forkBtn: 'Fork / Publish New',
      prBtn: 'Submit Pull Request'
    },
    prs: {
      title: 'Open-Source 3D Pull Requests',
      subtitle: 'Anyone can submit a PR with their portfolio credit link, while Approve & Merge actions are protected by the Owner PIN Guard.',
      targetAsset: 'Target Asset:',
      contributor: 'Contributor:',
      openDiffBtn: 'Open 3D & Code Diff'
    },
    forkModal: {
      badge: 'Creator Attribution & Anti-Spam Queue',
      title: 'Publish / Fork 3D Asset',
      assetName: '3D Asset Title *',
      category: 'Category *',
      creatorUser: 'Creator Username *',
      creatorUserPlaceholder: 'e.g. radit_3d',
      creatorLink: 'GitHub / Portfolio Link (Credit)',
      creditInfo: '💡 Automatic Attribution: Your username & portfolio link will be displayed as an active badge on the catalog card and embedded inside every downloaded .OBJ and .GLB file!',
      ownerPinLabel: '🔒 Owner PIN (Optional - Admin Only)',
      ownerPinHint: 'Leave blank if you are a Public Contributor',
      ownerPinPlaceholder: 'Leave blank to publish to Community Sandbox...',
      cancel: 'Cancel',
      publishFeatured: 'Publish Directly to Featured',
      publishCommunity: 'Publish to Community Sandbox',
      processing: 'Publishing...'
    },
    prModal: {
      badge: 'Open-Source 3D Contribution',
      titlePrefix: 'Submit Pull Request to',
      defaultTitlePrefix: 'Geometry & Parameter Optimization on',
      defaultDesc: 'Added procedural mesh details and refined parameter slider ranges.',
      prTitle: 'Pull Request Title *',
      contributorUser: 'Contributor Username *',
      contributorUserPlaceholder: 'e.g. maya_3d',
      contributorLink: 'GitHub / Portfolio Link',
      changelog: 'Technical Changelog / Notes',
      cancel: 'Cancel',
      submit: 'Submit Pull Request',
      submitting: 'Submitting...'
    },
    diffModal: {
      reviewBadge: 'Visual 3D & Monaco Diff Review',
      submittedBy: 'Submitted by',
      toUpdate: 'to update',
      close: 'Close ✕',
      baseModel: 'BASE MODEL',
      proposedUpdate: 'PROPOSED PR UPDATE',
      diffHeader: 'Monaco Side-by-Side Code Diff Inspector',
      diffLegend: 'Red: Original Code • Green: Proposed PR',
      ownerPin: '🔒 Owner PIN:',
      pinPlaceholder: 'Enter ADMIN_MERGE_PIN...',
      rejectBtn: 'Reject PR',
      mergeBtn: 'Approve & Merge to Main Catalog',
      verifying: 'Verifying...',
      pinRequiredError: 'Please enter the Owner PIN first to process this Pull Request.'
    },
    toast: {
      downloading: 'Downloading',
      withCredit: 'with embedded credit',
      publishedFeatured: 'published directly to Featured Showcase!',
      publishedCommunity: 'published to Community Sandbox (Awaiting Owner curation)!',
      approvedAsset: '✓ Asset approved and moved to the Featured Showcase!',
      deletedAsset: '🗑️ Asset / Spam removed from the catalog.',
      prSubmitted: 'submitted successfully!',
      prMerged: 'merged by Owner!',
      prRejected: 'rejected by Owner.'
    }
  },
  id: {
    nav: {
      subtitle: 'Aset 3D Prosedural Open-Source',
      explore: 'Jelajahi Katalog',
      studio: 'Studio 3D & Ekspor',
      prs: 'Pull Requests',
      cloudLabel: 'Cloud:',
      supabaseConnected: 'Supabase Terhubung',
      hybridMode: 'Mode Hibrida'
    },
    hero: {
      badge: '✨ 18+ ASET 3D PROSEDURAL • TANPA PENYIMPANAN FILE BINER',
      title1: 'Aset 3D Tanpa Batas.',
      titleHighlight: 'Kredit Penuh Kreator.',
      desc: 'Bagikan aset 3D prosedural Anda tanpa perlu membuat akun. Nama & link portofolio/GitHub Anda tampil sebagai badge aktif di katalog dan tertanam otomatis di dalam setiap file .OBJ & .GLB yang diunduh!'
    },
    curation: {
      featured: '🌟 Featured Showcase',
      community: '🧪 Community Sandbox (Antrean Publik)',
      featuredDesc: 'Menampilkan aset 3D resmi yang telah diverifikasi oleh Owner.',
      communityDesc: 'Kiriman komunitas publik. Klik ikon 🛡️ pada kartu untuk Approve ke Featured atau Hapus Spam dengan PIN Owner.'
    },
    filter: {
      searchPlaceholder: 'Cari nama aset 3D atau @kreator...',
      emptyCommunity: 'Belum ada kiriman baru di antrean Community Sandbox.',
      emptySearch: 'Tidak ada aset 3D yang cocok dengan filter pencarian.',
      emptySub: 'Buka Studio 3D untuk memodifikasi model dan klik "Fork / Publish Baru"!',
      categories: {
        All: 'Semua',
        Nature: 'Alam (Nature)',
        'Sci-Fi': 'Sci-Fi',
        Weapons: 'Senjata (Weapons)',
        Architecture: 'Arsitektur',
        Primitives: 'Primitif'
      } as Record<string, string>
    },
    pagination: {
      showing: 'Menampilkan',
      of: 'dari',
      assets: 'aset 3D',
      perPage: 'Per halaman:',
      prev: '← Seblm',
      next: 'Lanjut →',
      page: 'Hal'
    },
    card: {
      featuredBadge: '✓ Featured',
      communityBadge: '⏳ Community Sandbox',
      liveWebgl: '● WebGL Interaktif Aktif',
      hoverOrbit: 'Arahkan Kursor untuk 3D',
      downloads: 'unduhan',
      modTooltip: 'Moderasi Owner (Approve / Hapus Spam)',
      modTitle: '🔒 Moderasi Owner (PIN)',
      pinPlaceholder: 'Masukkan ADMIN_MERGE_PIN...',
      approveBtn: '✓ Approve ke Featured',
      deleteBtn: '🗑️ Hapus Aset / Spam',
      openStudio: 'Buka di Studio 3D',
      generatingSnap: 'Membuat Snapshot 3D...',
      profileTooltip: 'Buka Profil Kreator:'
    },
    studio: {
      lightingCyber: 'Cahaya: Cyber Neon',
      lightingStudio: 'Cahaya: Warm Gold',
      lightingEmerald: 'Cahaya: Emerald Lab',
      wireframe: 'Wireframe',
      turntable: 'Putar Otomatis',
      stage: 'Panggung',
      downloadObj: 'Unduh .OBJ',
      downloadGlb: 'Unduh .GLB (glTF)',
      paramTitle: 'Kontrol Parametrik',
      paramSub: 'Kustomisasi real-time sebelum ekspor',
      reset: 'Reset',
      noParams: 'Skrip ini tidak mendeklarasikan objek params.',
      scriptHeader: 'Skrip Three.js Terisolasi',
      scriptGuard: '✓ Anti-Duplikat & Rate Limiter Aktif',
      forkBtn: 'Fork / Publish Baru',
      prBtn: 'Ajukan Pull Request'
    },
    prs: {
      title: 'Pull Request 3D Open-Source',
      subtitle: 'Semua orang dapat mengajukan PR beserta link kredit portofolionya, namun persetujuan Approve & Merge dilindungi oleh Owner PIN Guard.',
      targetAsset: 'Target Aset:',
      contributor: 'Kontributor:',
      openDiffBtn: 'Buka 3D & Code Diff'
    },
    forkModal: {
      badge: 'Atribusi Kreator & Antrean Anti-Spam',
      title: 'Publish / Fork Aset 3D',
      assetName: 'Nama Aset 3D *',
      category: 'Kategori *',
      creatorUser: 'Username Kreator *',
      creatorUserPlaceholder: 'misal: radit_3d',
      creatorLink: 'Link GitHub / Portofolio (Kredit)',
      creditInfo: '💡 Kredit Otomatis: Nama & link portofolio Anda akan ditampilkan sebagai badge aktif di kartu katalog serta ditanamkan otomatis di dalam setiap file .OBJ dan .GLB yang diunduh pengguna!',
      ownerPinLabel: '🔒 Owner PIN (Opsional - Khusus Admin/Owner)',
      ownerPinHint: 'Kosongkan jika Anda Kontributor Publik',
      ownerPinPlaceholder: 'Kosongkan untuk masuk ke Community Sandbox...',
      cancel: 'Batal',
      publishFeatured: 'Publish Langsung ke Featured',
      publishCommunity: 'Publish ke Community Sandbox',
      processing: 'Memproses...'
    },
    prModal: {
      badge: 'Kontribusi 3D Open-Source',
      titlePrefix: 'Ajukan Pull Request ke',
      defaultTitlePrefix: 'Optimasi Geometri & Parameter pada',
      defaultDesc: 'Menambahkan detail mesh prosedural serta merapikan rentang slider parameter.',
      prTitle: 'Judul Pull Request *',
      contributorUser: 'Username Kontributor *',
      contributorUserPlaceholder: 'misal: maya_3d',
      contributorLink: 'Link GitHub / Portofolio',
      changelog: 'Catatan Perubahan Teknis (Changelog)',
      cancel: 'Batal',
      submit: 'Kirim Pull Request',
      submitting: 'Mengirim...'
    },
    diffModal: {
      reviewBadge: 'Tinjauan Visual 3D & Monaco Diff',
      submittedBy: 'Diajukan oleh',
      toUpdate: 'untuk memperbarui',
      close: 'Tutup ✕',
      baseModel: 'MODEL SAAT INI',
      proposedUpdate: 'USULAN PERUBAHAN (PR)',
      diffHeader: 'Inspektur Perbandingan Kode Monaco',
      diffLegend: 'Merah: Kode Lama • Hijau: Usulan PR',
      ownerPin: '🔒 Owner PIN:',
      pinPlaceholder: 'Masukkan ADMIN_MERGE_PIN...',
      rejectBtn: 'Tolak PR',
      mergeBtn: 'Approve & Merge ke Katalog Utama',
      verifying: 'Memverifikasi...',
      pinRequiredError: 'Masukkan PIN Owner terlebih dahulu untuk memproses Pull Request ini.'
    },
    toast: {
      downloading: 'Mengunduh',
      withCredit: 'dengan kredit',
      publishedFeatured: 'langsung terbit di Featured Showcase!',
      publishedCommunity: 'terbit di Community Sandbox (Menunggu kurasi Owner)!',
      approvedAsset: '✓ Aset berhasil disetujui dan dipindahkan ke Featured Showcase!',
      deletedAsset: '🗑️ Aset / Spam berhasil dihapus dari katalog.',
      prSubmitted: 'berhasil diajukan!',
      prMerged: 'berhasil di-merge oleh Owner!',
      prRejected: 'ditolak oleh Owner.'
    }
  }
};

const PARAM_LABEL_MAP_ID_TO_EN: Record<string, string> = {
  'Jumlah Tingkat Daun': 'Foliage Tiers',
  'Tinggi Pohon': 'Tree Height',
  'Lebar Kanopi': 'Canopy Radius',
  'Warna Daun': 'Foliage Color',
  'Warna Batang': 'Trunk Color',
  'Ukuran Kontainer': 'Reactor Size',
  'Tebal Rangka Baja': 'Steel Frame Thickness',
  'Warna Armor Baja': 'Steel Armor Color',
  'Warna Inti Plasma': 'Plasma Core Glow',
  'Panjang Bilah': 'Blade Length',
  'Lebar Bilah': 'Blade Width',
  'Lebar Crossguard': 'Crossguard Width',
  'Warna Baja Bilah': 'Blade Steel Color',
  'Warna Emas Guard': 'Hilt Gold Color',
  'Warna Permata Rune': 'Rune Gem Color',
  'Tingkat Menara': 'Tower Floors',
  'Lebar Pondasi': 'Base Foundation Width',
  'Warna Fasad Beton': 'Concrete Facade Color',
  'Warna Sabuk Neon': 'Neon Belt Glow',
  'Jumlah Kristal': 'Crystal Shards',
  'Tinggi Puncak Utama': 'Main Spire Height',
  'Radius Sebaran': 'Cluster Spread Radius',
  'Warna Kristal': 'Crystal Color',
  'Pendaran Energi': 'Energy Emission Glow',
  'Radius Inti Drone': 'Drone Core Radius',
  'Radius Cincin Gyro': 'Gyro Ring Radius',
  'Warna Pelindung': 'Hull Armor Color',
  'Warna Sensor Optik': 'Optic Sensor Glow',
  'Radius Gerbang': 'Portal Ring Radius',
  'Jumlah Chevron Rune': 'Rune Chevrons',
  'Warna Batu Kuno': 'Ancient Stone Color',
  'Warna Pusaran Portal': 'Vortex Portal Glow',
  'Lengkungan Bilah': 'Blade Curvature',
  'Warna Tepi Plasma': 'Plasma Edge Glow',
  'Warna Gagang Katana': 'Tsuka Grip Color',
  'Jumlah Cincin Orbit': 'Orbital Rings',
  'Radius Inti Matahari': 'Solar Core Radius',
  'Warna Kuningan Emas': 'Brass Frame Color',
  'Warna Matahari': 'Sun Core Glow',
  'Lebar Pulau Batu': 'Floating Cliff Width',
  'Kepadatan Sakura': 'Sakura Canopy Clusters',
  'Warna Bunga Sakura': 'Sakura Blossom Color',
  'Warna Batu Tebing': 'Cliff Stone Color',
  'Ukuran Kepala Palu': 'Hammer Head Scale',
  'Panjang Tangkai': 'Shaft Length',
  'Warna Baja Palu': 'Forged Steel Color',
  'Warna Energi Petir': 'Thunder Rune Glow',
  'Tingkat Atap Pagoda': 'Pagoda Roof Tiers',
  'Lebar Atap': 'Roof Eave Span',
  'Warna Pilar Kuil': 'Temple Pillar Color',
  'Warna Genteng Atap': 'Roof Tile Color',
  'Jumlah Bilah Turbin': 'Turbine Blades',
  'Panjang Mesin': 'Thruster Length',
  'Warna Casing Titanium': 'Titanium Cowling Color',
  'Warna Api Ion': 'Ion Exhaust Glow',
  'Jumlah Jamur': 'Mushroom Stems',
  'Lebar Tudung Jamur': 'Cap Umbrella Radius',
  'Warna Bioluminesensi': 'Bioluminescent Glow',
  'Warna Batang Jamur': 'Mushroom Stem Color',
  'Tinggi Pilar Altar': 'Altar Pillar Height',
  'Lebar Buku Sihir': 'Spellbook Span',
  'Warna Marmer Altar': 'Marble Pillar Color',
  'Warna Segel Sihir': 'Arcane Seal Glow',
  'Panjang Laras Rel': 'Rail Barrel Length',
  'Jumlah Koil Plasma': 'Induction Coils',
  'Warna Bodi Taktis': 'Tactical Receiver Color',
  'Warna Energi Koil': 'Gauss Coil Glow',
  'Ukuran Kubus Luar': 'Outer Cube Scale',
  'Ukuran Kubus Dalam': 'Inner Cube Scale',
  'Warna Rangka Hypercube': 'Hypercube Frame Color',
  'Warna Inti Singularitas': 'Singularity Core Glow',
  'Radius Parabola': 'Dish Reflector Radius',
  'Kemiringan Antena': 'Dish Elevation Tilt',
  'Warna Reflektor': 'Dish Alloy Color',
  'Warna Sinyal Suar': 'Beacon Signal Glow'
};

const PARAM_LABEL_MAP_EN_TO_ID: Record<string, string> = Object.entries(
  PARAM_LABEL_MAP_ID_TO_EN
).reduce((acc, [idLabel, enLabel]) => {
  acc[enLabel] = idLabel;
  return acc;
}, {} as Record<string, string>);

export function translateParamLabel(rawLabel: string, lang: Language): string {
  if (lang === 'en') {
    return PARAM_LABEL_MAP_ID_TO_EN[rawLabel] || rawLabel;
  }
  return PARAM_LABEL_MAP_EN_TO_ID[rawLabel] || rawLabel;
}
