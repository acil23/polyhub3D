import { Asset3D, PullRequest3D } from '@/types/polycode';

export const INITIAL_ASSETS: Asset3D[] = [
  {
    id: 'asset-1',
    slug: 'low-poly-pine-tree',
    title: 'Low-Poly Pine Tree',
    category: 'Nature',
    author_name: 'radit_dev',
    version: '1.2.0',
    downloads: 842,
    created_at: '2026-10-18T10:00:00Z',
    code: `const params = {
  tiers: { type: 'number', label: 'Jumlah Tingkat Daun', default: 5, min: 2, max: 8, step: 1 },
  height: { type: 'number', label: 'Tinggi Pohon', default: 3.4, min: 1.5, max: 5.5, step: 0.2 },
  radius: { type: 'number', label: 'Lebar Kanopi', default: 1.35, min: 0.6, max: 2.5, step: 0.05 },
  leafColor: { type: 'color', label: 'Warna Daun', default: '#10b981' },
  trunkColor: { type: 'color', label: 'Warna Batang', default: '#78350f' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(p.radius * 0.14, p.radius * 0.22, p.height * 0.35, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: p.trunkColor, roughness: 0.85 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = (p.height * 0.35) / 2 - 1.1;
  group.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({
    color: p.leafColor,
    flatShading: true,
    roughness: 0.45,
    metalness: 0.1
  });
  for (let i = 0; i < p.tiers; i++) {
    const ratio = 1 - i / (p.tiers * 1.15);
    const coneGeo = new THREE.ConeGeometry(p.radius * ratio, (p.height / p.tiers) * 1.4, 7);
    const cone = new THREE.Mesh(coneGeo, leafMat);
    cone.rotation.y = i * 0.5;
    cone.position.y = (p.height * 0.22) + i * (p.height * 0.17) - 0.6;
    group.add(cone);
  }
  return group;
}`
  },
  {
    id: 'asset-2',
    slug: 'cyberpunk-energy-crate',
    title: 'Cyberpunk Energy Reactor',
    category: 'Sci-Fi',
    author_name: 'neo_synth',
    version: '1.1.0',
    downloads: 619,
    created_at: '2026-10-19T08:30:00Z',
    code: `const params = {
  size: { type: 'number', label: 'Ukuran Kontainer', default: 1.75, min: 1.0, max: 2.8, step: 0.05 },
  bevel: { type: 'number', label: 'Tebal Rangka Baja', default: 0.18, min: 0.06, max: 0.35, step: 0.01 },
  bodyColor: { type: 'color', label: 'Warna Armor Baja', default: '#334155' },
  glowColor: { type: 'color', label: 'Warna Inti Plasma', default: '#06b6d4' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const coreGeo = new THREE.OctahedronGeometry(p.size * 0.52, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: p.glowColor,
    emissive: p.glowColor,
    emissiveIntensity: 0.75,
    flatShading: true,
    roughness: 0.15
  });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  const frameMat = new THREE.MeshStandardMaterial({
    color: p.bodyColor,
    metalness: 0.85,
    roughness: 0.22
  });
  const half = p.size / 2;
  const offsets = [-1, 1];

  for (let x of offsets) {
    for (let z of offsets) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(p.bevel, p.size, p.bevel), frameMat);
      col.position.set(x * half, 0, z * half);
      group.add(col);
    }
    for (let y of offsets) {
      const beamX = new THREE.Mesh(new THREE.BoxGeometry(p.size + p.bevel, p.bevel, p.bevel), frameMat);
      beamX.position.set(0, y * half, x * half);
      group.add(beamX);

      const beamZ = new THREE.Mesh(new THREE.BoxGeometry(p.bevel, p.bevel, p.size + p.bevel), frameMat);
      beamZ.position.set(x * half, y * half, 0);
      group.add(beamZ);
    }
  }
  return group;
}`
  },
  {
    id: 'asset-3',
    slug: 'procedural-rune-sword',
    title: 'Valhalla Rune Greatsword',
    category: 'Weapons',
    author_name: 'blade_smith',
    version: '1.3.0',
    downloads: 1290,
    created_at: '2026-10-19T14:20:00Z',
    code: `const params = {
  bladeLength: { type: 'number', label: 'Panjang Bilah', default: 2.5, min: 1.4, max: 3.6, step: 0.1 },
  bladeWidth: { type: 'number', label: 'Lebar Bilah', default: 0.32, min: 0.16, max: 0.6, step: 0.02 },
  guardWidth: { type: 'number', label: 'Lebar Crossguard', default: 1.25, min: 0.6, max: 2.0, step: 0.05 },
  bladeColor: { type: 'color', label: 'Warna Baja Bilah', default: '#e2e8f0' },
  hiltColor: { type: 'color', label: 'Warna Emas Guard', default: '#f59e0b' },
  gemColor: { type: 'color', label: 'Warna Permata Rune', default: '#3b82f6' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({ color: p.bladeColor, metalness: 0.9, roughness: 0.15 });
  const hiltMat = new THREE.MeshStandardMaterial({ color: p.hiltColor, metalness: 0.75, roughness: 0.25 });
  const gemMat = new THREE.MeshStandardMaterial({ color: p.gemColor, emissive: p.gemColor, emissiveIntensity: 0.6 });

  const blade = new THREE.Mesh(new THREE.BoxGeometry(p.bladeWidth, p.bladeLength, 0.06), bladeMat);
  blade.position.y = p.bladeLength / 2;
  group.add(blade);

  const tip = new THREE.Mesh(new THREE.ConeGeometry(p.bladeWidth * 0.72, 0.48, 4), bladeMat);
  tip.rotation.y = Math.PI / 4;
  tip.position.y = p.bladeLength + 0.24;
  group.add(tip);

  const guard = new THREE.Mesh(new THREE.BoxGeometry(p.guardWidth, 0.18, 0.24), hiltMat);
  group.add(guard);

  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), gemMat);
  gem.position.set(0, 0, 0.12);
  group.add(gem);

  const grip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 0.68, 12),
    new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.8 })
  );
  grip.position.y = -0.4;
  group.add(grip);

  const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 1), hiltMat);
  pommel.position.y = -0.82;
  group.add(pommel);

  group.position.y = -p.bladeLength * 0.35;
  group.rotation.z = -0.22;
  return group;
}`
  },
  {
    id: 'asset-4',
    slug: 'neo-tokyo-spire-tower',
    title: 'Neo-Tokyo Citadel Tower',
    category: 'Architecture',
    author_name: 'arch_procedural',
    version: '1.0.0',
    downloads: 530,
    created_at: '2026-10-19T18:10:00Z',
    code: `const params = {
  floors: { type: 'number', label: 'Tingkat Menara', default: 5, min: 2, max: 9, step: 1 },
  baseWidth: { type: 'number', label: 'Lebar Pondasi', default: 1.8, min: 1.0, max: 2.8, step: 0.1 },
  wallColor: { type: 'color', label: 'Warna Fasad Beton', default: '#334155' },
  neonColor: { type: 'color', label: 'Warna Sabuk Neon', default: '#a855f7' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: p.wallColor, metalness: 0.6, roughness: 0.35 });
  const neonMat = new THREE.MeshStandardMaterial({ color: p.neonColor, emissive: p.neonColor, emissiveIntensity: 0.85 });

  let currentY = -1.1;
  for (let i = 0; i < p.floors; i++) {
    const scale = 1 - i * (0.65 / p.floors);
    const w = p.baseWidth * scale;
    const h = 0.55;

    const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), wallMat);
    block.position.y = currentY + h / 2;
    group.add(block);

    const neonRing = new THREE.Mesh(new THREE.BoxGeometry(w * 1.03, 0.06, w * 1.03), neonMat);
    neonRing.position.y = currentY + h - 0.05;
    group.add(neonRing);

    currentY += h;
  }

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.12, 0.9, 8), neonMat);
  spire.position.y = currentY + 0.45;
  group.add(spire);
  return group;
}`
  },
  {
    id: 'asset-5',
    slug: 'arcane-crystal-cluster',
    title: 'Arcane Crystal Formation',
    category: 'Nature',
    author_name: 'vfx_sorcerer',
    version: '1.1.2',
    downloads: 715,
    created_at: '2026-10-19T20:45:00Z',
    code: `const params = {
  shards: { type: 'number', label: 'Jumlah Kristal', default: 7, min: 3, max: 14, step: 1 },
  height: { type: 'number', label: 'Tinggi Puncak Utama', default: 2.6, min: 1.5, max: 4.0, step: 0.1 },
  spread: { type: 'number', label: 'Radius Sebaran', default: 0.75, min: 0.3, max: 1.5, step: 0.05 },
  crystalColor: { type: 'color', label: 'Warna Kristal', default: '#8b5cf6' },
  coreGlow: { type: 'color', label: 'Pendaran Energi', default: '#38bdf8' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: p.crystalColor,
    emissive: p.coreGlow,
    emissiveIntensity: 0.35,
    flatShading: true,
    metalness: 0.3,
    roughness: 0.15
  });

  for (let i = 0; i < p.shards; i++) {
    const isCenter = i === 0;
    const h = isCenter ? p.height : p.height * (0.45 + ((i * 37) % 45) / 100);
    const r = isCenter ? 0.36 : 0.22;
    const geom = new THREE.CylinderGeometry(0.02, r, h, 6);
    const mesh = new THREE.Mesh(geom, mat);

    if (!isCenter) {
      const angle = (i / (p.shards - 1)) * Math.PI * 2;
      mesh.position.x = Math.cos(angle) * (p.spread * 0.65);
      mesh.position.z = Math.sin(angle) * (p.spread * 0.65);
      mesh.rotation.z = Math.cos(angle) * -0.32;
      mesh.rotation.x = Math.sin(angle) * 0.32;
    }
    mesh.position.y = h / 2 - 1.05;
    group.add(mesh);
  }
  return group;
}`
  },
  {
    id: 'asset-6',
    slug: 'orbital-mecha-drone',
    title: 'Orbital Sentinel Drone',
    category: 'Sci-Fi',
    author_name: 'mecha_works',
    version: '1.0.4',
    downloads: 490,
    created_at: '2026-10-20T01:00:00Z',
    code: `const params = {
  coreRadius: { type: 'number', label: 'Radius Inti Drone', default: 0.85, min: 0.5, max: 1.5, step: 0.05 },
  ringSize: { type: 'number', label: 'Radius Cincin Gyro', default: 1.45, min: 1.0, max: 2.4, step: 0.05 },
  hullColor: { type: 'color', label: 'Warna Pelindung', default: '#f8fafc' },
  eyeColor: { type: 'color', label: 'Warna Sensor Optik', default: '#f43f5e' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: p.hullColor, metalness: 0.7, roughness: 0.2 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8, roughness: 0.3 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: p.eyeColor, emissive: p.eyeColor, emissiveIntensity: 0.9 });

  const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(p.coreRadius, 2), hullMat);
  group.add(sphere);

  const eye = new THREE.Mesh(new THREE.CylinderGeometry(p.coreRadius * 0.35, p.coreRadius * 0.35, 0.3, 16), eyeMat);
  eye.rotation.x = Math.PI / 2;
  eye.position.z = p.coreRadius * 0.88;
  group.add(eye);

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(p.ringSize, 0.07, 12, 36), darkMat);
  ring1.rotation.x = Math.PI / 3;
  group.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(p.ringSize * 1.15, 0.05, 12, 36), hullMat);
  ring2.rotation.y = Math.PI / 4;
  ring2.rotation.x = -Math.PI / 4;
  group.add(ring2);

  return group;
}`
  }
];

export const INITIAL_PULL_REQUESTS: PullRequest3D[] = [
  {
    id: 'pr-101',
    asset_id: 'asset-1',
    asset_title: 'Low-Poly Pine Tree',
    author_name: 'maya_3d',
    title: 'Tambah Variasi Rotasi Spiral & Kanopi Rapat',
    description: 'Mengatur rotasi spiral antar tingkat daun serta menaikkan jumlah tingkat default agar siluet low-poly lebih penuh dari segala sudut kamera.',
    status: 'open',
    created_at: '2026-10-20T01:15:00Z',
    proposed_code: `const params = {
  tiers: { type: 'number', label: 'Jumlah Tingkat Daun', default: 6, min: 2, max: 8, step: 1 },
  height: { type: 'number', label: 'Tinggi Pohon', default: 3.8, min: 1.5, max: 6.0, step: 0.2 },
  radius: { type: 'number', label: 'Lebar Kanopi', default: 1.45, min: 0.6, max: 2.5, step: 0.1 },
  leafColor: { type: 'color', label: 'Warna Daun', default: '#34d399' },
  trunkColor: { type: 'color', label: 'Warna Batang', default: '#78350f' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const trunkGeo = new THREE.CylinderGeometry(p.radius * 0.14, p.radius * 0.24, p.height * 0.4, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: p.trunkColor, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = (p.height * 0.4) / 2 - 1.1;
  group.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({ color: p.leafColor, flatShading: true, roughness: 0.45 });
  for (let i = 0; i < p.tiers; i++) {
    const ratio = 1 - i / (p.tiers * 1.12);
    const coneGeo = new THREE.ConeGeometry(p.radius * ratio, (p.height / p.tiers) * 1.45, 7);
    const cone = new THREE.Mesh(coneGeo, leafMat);
    cone.rotation.y = i * 0.45;
    cone.position.y = (p.height * 0.25) + i * (p.height * 0.16) - 0.6;
    group.add(cone);
  }
  return group;
}`
  }
];
