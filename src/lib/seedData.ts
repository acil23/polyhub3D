import { Asset3D, PullRequest3D } from '@/types/polycode';

export const INITIAL_ASSETS: Asset3D[] = [
  {
    id: 'asset-1',
    slug: 'low-poly-pine-tree',
    title: 'Low-Poly Pine Tree',
    category: 'Nature',
    author_name: 'radit_dev',
    author_url: 'https://github.com/acil23',
    curation_status: 'verified',
    version: '1.2.0',
    downloads: 842,
    created_at: '2026-10-18T10:00:00Z',
    code: `const params = {
  tiers: { type: 'number', label: 'Foliage Tiers', default: 5, min: 2, max: 8, step: 1 },
  height: { type: 'number', label: 'Tree Height', default: 3.4, min: 1.5, max: 5.5, step: 0.2 },
  radius: { type: 'number', label: 'Canopy Radius', default: 1.35, min: 0.6, max: 2.5, step: 0.05 },
  leafColor: { type: 'color', label: 'Foliage Color', default: '#10b981' },
  trunkColor: { type: 'color', label: 'Trunk Color', default: '#78350f' }
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
    author_url: 'https://github.com/acil23',
    curation_status: 'verified',
    version: '1.1.0',
    downloads: 619,
    created_at: '2026-10-19T08:30:00Z',
    code: `const params = {
  size: { type: 'number', label: 'Reactor Size', default: 1.75, min: 1.0, max: 2.8, step: 0.05 },
  bevel: { type: 'number', label: 'Steel Frame Thickness', default: 0.18, min: 0.06, max: 0.35, step: 0.01 },
  bodyColor: { type: 'color', label: 'Steel Armor Color', default: '#334155' },
  glowColor: { type: 'color', label: 'Plasma Core Glow', default: '#06b6d4' }
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
    author_url: 'https://github.com/acil23',
    curation_status: 'verified',
    version: '1.3.0',
    downloads: 1290,
    created_at: '2026-10-19T14:20:00Z',
    code: `const params = {
  bladeLength: { type: 'number', label: 'Blade Length', default: 2.5, min: 1.4, max: 3.6, step: 0.1 },
  bladeWidth: { type: 'number', label: 'Blade Width', default: 0.32, min: 0.16, max: 0.6, step: 0.02 },
  guardWidth: { type: 'number', label: 'Crossguard Width', default: 1.25, min: 0.6, max: 2.0, step: 0.05 },
  bladeColor: { type: 'color', label: 'Blade Steel Color', default: '#e2e8f0' },
  hiltColor: { type: 'color', label: 'Hilt Gold Color', default: '#f59e0b' },
  gemColor: { type: 'color', label: 'Rune Gem Color', default: '#3b82f6' }
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
    author_url: 'https://github.com/acil23',
    curation_status: 'verified',
    version: '1.0.0',
    downloads: 530,
    created_at: '2026-10-19T18:10:00Z',
    code: `const params = {
  floors: { type: 'number', label: 'Tower Floors', default: 5, min: 2, max: 9, step: 1 },
  baseWidth: { type: 'number', label: 'Base Foundation Width', default: 1.8, min: 1.0, max: 2.8, step: 0.1 },
  wallColor: { type: 'color', label: 'Concrete Facade Color', default: '#334155' },
  neonColor: { type: 'color', label: 'Neon Belt Glow', default: '#a855f7' }
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
    author_url: 'https://github.com/acil23',
    curation_status: 'verified',
    version: '1.1.2',
    downloads: 715,
    created_at: '2026-10-19T20:45:00Z',
    code: `const params = {
  shards: { type: 'number', label: 'Crystal Shards', default: 7, min: 3, max: 14, step: 1 },
  height: { type: 'number', label: 'Main Spire Height', default: 2.6, min: 1.5, max: 4.0, step: 0.1 },
  spread: { type: 'number', label: 'Cluster Spread Radius', default: 0.75, min: 0.3, max: 1.5, step: 0.05 },
  crystalColor: { type: 'color', label: 'Crystal Color', default: '#8b5cf6' },
  coreGlow: { type: 'color', label: 'Energy Emission Glow', default: '#38bdf8' }
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
    author_url: 'https://github.com/acil23',
    curation_status: 'verified',
    version: '1.0.4',
    downloads: 490,
    created_at: '2026-10-20T01:00:00Z',
    code: `const params = {
  coreRadius: { type: 'number', label: 'Drone Core Radius', default: 0.85, min: 0.5, max: 1.5, step: 0.05 },
  ringSize: { type: 'number', label: 'Gyro Ring Radius', default: 1.45, min: 1.0, max: 2.4, step: 0.05 },
  hullColor: { type: 'color', label: 'Hull Armor Color', default: '#f8fafc' },
  eyeColor: { type: 'color', label: 'Optic Sensor Glow', default: '#f43f5e' }
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
  },
  {
    id: 'asset-7',
    slug: 'astral-stargate-portal',
    title: 'Astral Stargate Portal',
    category: 'Architecture',
    author_name: 'aklein_studio',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.0.0',
    downloads: 945,
    created_at: '2026-10-20T04:00:00Z',
    code: `const params = {
  ringRadius: { type: 'number', label: 'Portal Ring Radius', default: 1.55, min: 1.0, max: 2.3, step: 0.05 },
  chevrons: { type: 'number', label: 'Rune Chevrons', default: 9, min: 5, max: 16, step: 1 },
  stoneColor: { type: 'color', label: 'Ancient Stone Color', default: '#475569' },
  vortexColor: { type: 'color', label: 'Vortex Portal Glow', default: '#38bdf8' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: p.stoneColor, roughness: 0.65, metalness: 0.4, flatShading: true });
  const glowMat = new THREE.MeshStandardMaterial({
    color: p.vortexColor,
    emissive: p.vortexColor,
    emissiveIntensity: 0.85,
    roughness: 0.15,
    transparent: true,
    opacity: 0.82
  });

  // Stepped Ancient Base
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(p.ringRadius * 1.8, 0.22, 1.1), stoneMat);
  step1.position.y = -1.05;
  group.add(step1);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(p.ringRadius * 1.4, 0.22, 0.85), stoneMat);
  step2.position.y = -0.85;
  group.add(step2);

  // Outer & Inner Portal Rings
  const mainRing = new THREE.Mesh(new THREE.TorusGeometry(p.ringRadius, 0.18, 10, 36), stoneMat);
  mainRing.position.y = p.ringRadius * 0.35;
  group.add(mainRing);

  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(p.ringRadius * 0.86, 0.05, 8, 36), glowMat);
  innerRing.position.y = p.ringRadius * 0.35;
  group.add(innerRing);

  // Event Horizon Disc
  const horizon = new THREE.Mesh(new THREE.CylinderGeometry(p.ringRadius * 0.84, p.ringRadius * 0.84, 0.04, 32), glowMat);
  horizon.rotation.x = Math.PI / 2;
  horizon.position.y = p.ringRadius * 0.35;
  group.add(horizon);

  // Radial Chevron Runes
  for (let i = 0; i < p.chevrons; i++) {
    const angle = (i / p.chevrons) * Math.PI * 2;
    const chev = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.26), glowMat);
    chev.position.x = Math.cos(angle) * p.ringRadius;
    chev.position.y = p.ringRadius * 0.35 + Math.sin(angle) * p.ringRadius;
    chev.rotation.z = angle - Math.PI / 2;
    group.add(chev);
  }
  return group;
}`
  },
  {
    id: 'asset-8',
    slug: 'cyberpunk-plasma-katana',
    title: 'Cyberpunk Plasma Katana',
    category: 'Weapons',
    author_name: 'ronin_mesh',
    author_url: 'https://github.com/acil23',
    curation_status: 'verified',
    version: '1.1.0',
    downloads: 1120,
    created_at: '2026-10-20T05:10:00Z',
    code: `const params = {
  bladeLength: { type: 'number', label: 'Blade Length', default: 2.7, min: 1.8, max: 3.6, step: 0.1 },
  curve: { type: 'number', label: 'Blade Curvature', default: 0.28, min: 0.05, max: 0.6, step: 0.02 },
  bladeColor: { type: 'color', label: 'Blade Steel Color', default: '#1e293b' },
  plasmaColor: { type: 'color', label: 'Plasma Edge Glow', default: '#f43f5e' },
  gripColor: { type: 'color', label: 'Tsuka Grip Color', default: '#0f172a' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({ color: p.bladeColor, metalness: 0.9, roughness: 0.2 });
  const plasmaMat = new THREE.MeshStandardMaterial({ color: p.plasmaColor, emissive: p.plasmaColor, emissiveIntensity: 0.95 });
  const gripMat = new THREE.MeshStandardMaterial({ color: p.gripColor, roughness: 0.7 });

  // Segmented Curved Katana Blade + Plasma Edge
  const segments = 10;
  const segLen = p.bladeLength / segments;
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const taper = 1 - t * 0.35;
    const yPos = i * segLen * 0.96 + 0.15;
    const xOffset = Math.pow(t, 2) * p.curve;
    const rotZ = -t * p.curve * 0.55;

    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.14 * taper, segLen * 1.05, 0.045), steelMat);
    spine.position.set(xOffset, yPos, 0);
    spine.rotation.z = rotZ;
    group.add(spine);

    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.045 * taper, segLen * 1.06, 0.02), plasmaMat);
    edge.position.set(xOffset + 0.08 * taper, yPos, 0);
    edge.rotation.z = rotZ;
    group.add(edge);
  }

  // Hexagonal Tsuba (Guard)
  const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 6), steelMat);
  tsuba.add(new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.025, 8, 6), plasmaMat));
  group.add(tsuba);

  // Tsuka Handle with Menuki Wraps
  const tsuka = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.85, 8), gripMat);
  tsuka.position.y = -0.45;
  group.add(tsuka);

  for (let j = 0; j < 5; j++) {
    const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.076, 0.015, 6, 8), plasmaMat);
    wrap.rotation.x = Math.PI / 2;
    wrap.position.y = -0.15 - j * 0.15;
    group.add(wrap);
  }

  group.position.y = -p.bladeLength * 0.32;
  group.rotation.z = 0.25;
  return group;
}`
  },
  {
    id: 'asset-9',
    slug: 'celestial-mechanical-orrery',
    title: 'Celestial Mechanical Orrery',
    category: 'Primitives',
    author_name: 'astro_forge',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.0.2',
    downloads: 680,
    created_at: '2026-10-20T06:15:00Z',
    code: `const params = {
  rings: { type: 'number', label: 'Orbital Rings', default: 4, min: 2, max: 6, step: 1 },
  sunRadius: { type: 'number', label: 'Solar Core Radius', default: 0.48, min: 0.25, max: 0.85, step: 0.05 },
  brassColor: { type: 'color', label: 'Brass Frame Color', default: '#f59e0b' },
  sunColor: { type: 'color', label: 'Sun Core Glow', default: '#38bdf8' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const brassMat = new THREE.MeshStandardMaterial({ color: p.brassColor, metalness: 0.88, roughness: 0.22 });
  const sunMat = new THREE.MeshStandardMaterial({ color: p.sunColor, emissive: p.sunColor, emissiveIntensity: 0.9, flatShading: true });

  // Glowing Solar Core
  const sun = new THREE.Mesh(new THREE.IcosahedronGeometry(p.sunRadius, 2), sunMat);
  sun.position.y = 0.35;
  group.add(sun);

  // Gimbal Rings & Orbiting Planets
  for (let i = 0; i < p.rings; i++) {
    const r = p.sunRadius + 0.35 + i * 0.28;
    const gimbal = new THREE.Mesh(new THREE.TorusGeometry(r, 0.032, 12, 48), brassMat);
    gimbal.position.y = 0.35;
    gimbal.rotation.x = (i * 0.55) + 0.4;
    gimbal.rotation.y = i * 0.75;
    group.add(gimbal);

    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), sunMat);
    const angle = i * 1.4;
    planet.position.set(Math.cos(angle) * r, 0.35 + Math.sin(angle) * r * 0.4, Math.sin(angle) * r * 0.8);
    group.add(planet);
  }

  // Clockwork Pedestal Base
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 0.9, 12), brassMat);
  pillar.position.y = -0.65;
  group.add(pillar);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 0.2, 16), brassMat);
  base.position.y = -1.05;
  group.add(base);

  return group;
}`
  },
  {
    id: 'asset-10',
    slug: 'floating-bonsai-sanctuary',
    title: 'Floating Bonsai Sanctuary',
    category: 'Nature',
    author_name: 'zen_poly',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.2.1',
    downloads: 1040,
    created_at: '2026-10-20T07:00:00Z',
    code: `const params = {
  islandWidth: { type: 'number', label: 'Floating Cliff Width', default: 1.65, min: 1.0, max: 2.4, step: 0.05 },
  clusters: { type: 'number', label: 'Sakura Canopy Clusters', default: 6, min: 3, max: 10, step: 1 },
  sakuraColor: { type: 'color', label: 'Sakura Blossom Color', default: '#f472b6' },
  rockColor: { type: 'color', label: 'Cliff Stone Color', default: '#475569' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({ color: p.rockColor, flatShading: true, roughness: 0.85 });
  const woodMat = new THREE.MeshStandardMaterial({ color: '#5c2d16', flatShading: true, roughness: 0.9 });
  const leafMat = new THREE.MeshStandardMaterial({ color: p.sakuraColor, flatShading: true, roughness: 0.5 });
  const waterMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.4 });

  // Inverted Floating Island Cliff
  const cliff = new THREE.Mesh(new THREE.ConeGeometry(p.islandWidth, 1.65, 7), rockMat);
  cliff.rotation.x = Math.PI;
  cliff.position.y = -0.45;
  group.add(cliff);

  // Top Grass/Moss Plataforma
  const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(p.islandWidth * 0.95, p.islandWidth * 0.88, 0.18, 7), new THREE.MeshStandardMaterial({ color: '#10b981', flatShading: true }));
  topPlate.position.y = 0.38;
  group.add(topPlate);

  // Waterfall Stream
  const waterfall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.4, 0.08), waterMat);
  waterfall.position.set(0, -0.25, p.islandWidth * 0.72);
  waterfall.rotation.x = 0.25;
  group.add(waterfall);

  // Twisted Bonsai Trunk
  const trunk1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 0.95, 7), woodMat);
  trunk1.position.set(-0.15, 0.8, 0);
  trunk1.rotation.z = -0.25;
  group.add(trunk1);

  const trunk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 0.85, 7), woodMat);
  trunk2.position.set(0.15, 1.35, 0.1);
  trunk2.rotation.z = 0.35;
  group.add(trunk2);

  // Sakura Blossom Clouds
  for (let i = 0; i < p.clusters; i++) {
    const angle = (i / p.clusters) * Math.PI * 2;
    const rad = i === 0 ? 0.55 : 0.42;
    const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), leafMat);
    puff.scale.y = 0.62;
    puff.position.set(
      Math.cos(angle) * 0.55 + 0.1,
      1.65 + (i % 2) * 0.22,
      Math.sin(angle) * 0.55
    );
    group.add(puff);
  }
  return group;
}`
  },
  {
    id: 'asset-11',
    slug: 'aegis-valkyrie-warhammer',
    title: 'Aegis Valkyrie Warhammer',
    category: 'Weapons',
    author_name: 'forge_titan',
    author_url: 'https://github.com/acil23',
    curation_status: 'verified',
    version: '1.0.0',
    downloads: 790,
    created_at: '2026-10-20T08:00:00Z',
    code: `const params = {
  headScale: { type: 'number', label: 'Hammer Head Scale', default: 1.25, min: 0.8, max: 1.8, step: 0.05 },
  shaftLength: { type: 'number', label: 'Shaft Length', default: 2.7, min: 1.8, max: 3.6, step: 0.1 },
  steelColor: { type: 'color', label: 'Forged Steel Color', default: '#94a3b8' },
  runeGlow: { type: 'color', label: 'Thunder Rune Glow', default: '#38bdf8' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({ color: p.steelColor, metalness: 0.88, roughness: 0.22, flatShading: true });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.8, roughness: 0.25 });
  const glowMat = new THREE.MeshStandardMaterial({ color: p.runeGlow, emissive: p.runeGlow, emissiveIntensity: 0.9 });

  // Long Reinforced Shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, p.shaftLength, 10), new THREE.MeshStandardMaterial({ color: '#3f2e21', roughness: 0.8 }));
  group.add(shaft);

  // Dual Heavy Beveled Hammer Head
  const headY = p.shaftLength / 2 - 0.25;
  const centerBlock = new THREE.Mesh(new THREE.BoxGeometry(p.headScale * 1.15, 0.58, 0.58), steelMat);
  centerBlock.position.y = headY;
  group.add(centerBlock);

  const coreRune = new THREE.Mesh(new THREE.BoxGeometry(p.headScale * 1.18, 0.18, 0.62), glowMat);
  coreRune.position.y = headY;
  group.add(coreRune);

  for (let side of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.28, 8), steelMat);
    face.rotation.z = Math.PI / 2;
    face.position.set(side * (p.headScale * 0.65), headY, 0);
    group.add(face);

    const trim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 8, 8), goldMat);
    trim.rotation.y = Math.PI / 2;
    trim.position.set(side * (p.headScale * 0.55), headY, 0);
    group.add(trim);
  }

  // Top Spike & Pommel
  const topSpike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 6), steelMat);
  topSpike.position.y = headY + 0.52;
  group.add(topSpike);

  const pommel = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), goldMat);
  pommel.position.y = -p.shaftLength / 2 - 0.12;
  group.add(pommel);

  group.rotation.z = -0.28;
  return group;
}`
  },
  {
    id: 'asset-12',
    slug: 'eastern-sky-pagoda',
    title: 'Eastern Sky Pagoda Temple',
    category: 'Architecture',
    author_name: 'kyoto_voxel',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.1.0',
    downloads: 640,
    created_at: '2026-10-20T09:00:00Z',
    code: `const params = {
  tiers: { type: 'number', label: 'Pagoda Roof Tiers', default: 4, min: 2, max: 6, step: 1 },
  eaveSpan: { type: 'number', label: 'Roof Eave Span', default: 1.9, min: 1.2, max: 2.6, step: 0.1 },
  pillarColor: { type: 'color', label: 'Temple Pillar Color', default: '#dc2626' },
  roofColor: { type: 'color', label: 'Roof Tile Color', default: '#1e293b' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: p.pillarColor, roughness: 0.55 });
  const roofMat = new THREE.MeshStandardMaterial({ color: p.roofColor, metalness: 0.4, roughness: 0.45, flatShading: true });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.85, roughness: 0.2 });

  // Stone Foundation
  const base = new THREE.Mesh(new THREE.BoxGeometry(p.eaveSpan * 1.1, 0.3, p.eaveSpan * 1.1), new THREE.MeshStandardMaterial({ color: '#64748b' }));
  base.position.y = -1.0;
  group.add(base);

  let yPos = -0.85;
  for (let i = 0; i < p.tiers; i++) {
    const scale = 1 - i * (0.52 / p.tiers);
    const span = p.eaveSpan * scale;
    const roomW = span * 0.58;
    const roomH = 0.52;

    const room = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, roomW), wallMat);
    room.position.y = yPos + roomH / 2;
    group.add(room);

    //Four Corner Pillars
    for (let x of [-1, 1]) {
      for (let z of [-1, 1]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, roomH, 8), goldMat);
        col.position.set(x * (roomW * 0.52), yPos + roomH / 2, z * (roomW * 0.52));
        group.add(col);
      }
    }

    // Pyramid Roof Eave
    const roof = new THREE.Mesh(new THREE.ConeGeometry(span * 0.78, 0.34, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = yPos + roomH + 0.14;
    group.add(roof);

    yPos += roomH + 0.24;
  }

  // Golden Sorin Finial Spire
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.09, 0.85, 8), goldMat);
  spire.position.y = yPos + 0.4;
  group.add(spire);

  return group;
}`
  },
  {
    id: 'asset-13',
    slug: 'hyperdrive-ion-thruster',
    title: 'Hyperdrive Ion Thruster',
    category: 'Sci-Fi',
    author_name: 'starship_lab',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.0.0',
    downloads: 810,
    created_at: '2026-10-20T10:00:00Z',
    code: `const params = {
  blades: { type: 'number', label: 'Turbine Blades', default: 12, min: 6, max: 20, step: 1 },
  length: { type: 'number', label: 'Thruster Length', default: 2.2, min: 1.4, max: 3.2, step: 0.1 },
  cowlingColor: { type: 'color', label: 'Titanium Cowling Color', default: '#334155' },
  ionColor: { type: 'color', label: 'Ion Exhaust Glow', default: '#38bdf8' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: p.cowlingColor, metalness: 0.82, roughness: 0.25 });
  const darkMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.9, roughness: 0.2 });
  const ionMat = new THREE.MeshStandardMaterial({ color: p.ionColor, emissive: p.ionColor, emissiveIntensity: 0.95 });

  // Main Engine Barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, p.length, 24, 1, true), hullMat);
  barrel.rotation.x = Math.PI / 2;
  group.add(barrel);

  // Inner Ion Core & Plume
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.35, p.length * 1.1, 16), ionMat);
  core.rotation.x = Math.PI / 2;
  group.add(core);

  // Radial Turbine Blades & Exterior Cooling Fins
  for (let i = 0; i < p.blades; i++) {
    const angle = (i / p.blades) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, p.length * 0.85), hullMat);
    fin.position.set(Math.cos(angle) * 1.12, Math.sin(angle) * 1.12, 0);
    fin.rotation.z = angle;
    group.add(fin);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.78, 0.14), darkMat);
    blade.position.set(Math.cos(angle) * 0.5, Math.sin(angle) * 0.5, p.length * 0.42);
    blade.rotation.z = angle + 0.4;
    group.add(blade);
  }

  // Glowing Rear Nozzle Ring
  const nozzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.08, 12, 32), ionMat);
  nozzleRing.position.z = -p.length / 2;
  group.add(nozzleRing);

  return group;
}`
  },
  {
    id: 'asset-14',
    slug: 'bioluminescent-mushroom-grove',
    title: 'Bioluminescent Mushroom Grove',
    category: 'Nature',
    author_name: 'myco_shader',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.0.3',
    downloads: 745,
    created_at: '2026-10-20T11:00:00Z',
    code: `const params = {
  count: { type: 'number', label: 'Mushroom Stems', default: 5, min: 2, max: 9, step: 1 },
  capRadius: { type: 'number', label: 'Cap Umbrella Radius', default: 0.85, min: 0.4, max: 1.4, step: 0.05 },
  glowColor: { type: 'color', label: 'Bioluminescent Glow', default: '#2dd4bf' },
  stemColor: { type: 'color', label: 'Mushroom Stem Color', default: '#e2e8f0' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const capMat = new THREE.MeshStandardMaterial({
    color: p.glowColor,
    emissive: p.glowColor,
    emissiveIntensity: 0.55,
    flatShading: true,
    roughness: 0.3
  });
  const stemMat = new THREE.MeshStandardMaterial({ color: p.stemColor, roughness: 0.7 });
  const rockMat = new THREE.MeshStandardMaterial({ color: '#1e293b', flatShading: true, roughness: 0.9 });

  // Mossy Base Rock
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35, 1), rockMat);
  rock.scale.y = 0.35;
  rock.position.y = -0.95;
  group.add(rock);

  for (let i = 0; i < p.count; i++) {
    const isMain = i === 0;
    const scale = isMain ? 1.0 : 0.48 + ((i * 29) % 40) / 100;
    const angle = (i / p.count) * Math.PI * 2;
    const dist = isMain ? 0 : 0.65;

    const mushGroup = new THREE.Group();
    const h = 1.65 * scale;

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * scale, 0.18 * scale, h, 8), stemMat);
    stem.position.y = h / 2;
    mushGroup.add(stem);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(p.capRadius * scale, 0.65 * scale, 10), capMat);
    cap.position.y = h + 0.15 * scale;
    mushGroup.add(cap);

    const gillRing = new THREE.Mesh(new THREE.TorusGeometry(p.capRadius * scale * 0.65, 0.04 * scale, 6, 12), capMat);
    gillRing.rotation.x = Math.PI / 2;
    gillRing.position.y = h - 0.1 * scale;
    mushGroup.add(gillRing);

    mushGroup.position.set(Math.cos(angle) * dist, -0.75, Math.sin(angle) * dist);
    if (!isMain) {
      mushGroup.rotation.z = Math.cos(angle) * -0.22;
      mushGroup.rotation.x = Math.sin(angle) * 0.22;
    }
    group.add(mushGroup);
  }
  return group;
}`
  },
  {
    id: 'asset-15',
    slug: 'alchemist-floating-tome-altar',
    title: 'Alchemist Floating Tome Altar',
    category: 'Architecture',
    author_name: 'arcane_craft',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.0.0',
    downloads: 590,
    created_at: '2026-10-20T12:00:00Z',
    code: `const params = {
  pillarHeight: { type: 'number', label: 'Altar Pillar Height', default: 1.5, min: 0.9, max: 2.2, step: 0.1 },
  bookSpan: { type: 'number', label: 'Spellbook Span', default: 0.95, min: 0.6, max: 1.5, step: 0.05 },
  marbleColor: { type: 'color', label: 'Marble Pillar Color', default: '#cbd5e1' },
  magicColor: { type: 'color', label: 'Arcane Seal Glow', default: '#a855f7' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const marbleMat = new THREE.MeshStandardMaterial({ color: p.marbleColor, roughness: 0.35, metalness: 0.2 });
  const coverMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.6 });
  const magicMat = new THREE.MeshStandardMaterial({ color: p.magicColor, emissive: p.magicColor, emissiveIntensity: 0.9 });

  // Fluted Altar Column & Pedestal
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 1.4), marbleMat);
  base.position.y = -1.0;
  group.add(base);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, p.pillarHeight, 10), marbleMat);
  column.position.y = -1.0 + p.pillarHeight / 2;
  group.add(column);

  const topY = -1.0 + p.pillarHeight;
  const capital = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.2, 1.25), marbleMat);
  capital.position.y = topY;
  group.add(capital);

  // Floating Open Spellbook
  const bookGroup = new THREE.Group();
  for (let side of [-1, 1]) {
    const cover = new THREE.Mesh(new THREE.BoxGeometry(p.bookSpan * 0.5, 0.06, 0.72), coverMat);
    cover.position.x = side * (p.bookSpan * 0.24);
    cover.rotation.z = side * -0.28;
    bookGroup.add(cover);

    const page = new THREE.Mesh(new THREE.BoxGeometry(p.bookSpan * 0.46, 0.07, 0.66), new THREE.MeshStandardMaterial({ color: '#fef3c7' }));
    page.position.set(side * (p.bookSpan * 0.22), 0.04, 0);
    page.rotation.z = side * -0.25;
    bookGroup.add(page);
  }
  bookGroup.position.y = topY + 0.55;
  bookGroup.rotation.x = 0.35;
  group.add(bookGroup);

  // Floating Magic Seal Ring
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.025, 8, 32), magicMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = topY + 0.25;
  group.add(halo);

  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), magicMat);
  crystal.position.y = topY + 1.05;
  group.add(crystal);

  return group;
}`
  },
  {
    id: 'asset-16',
    slug: 'gauss-railgun-sniper',
    title: 'Gauss Railgun Sniper Rifle',
    category: 'Weapons',
    author_name: 'armory_x',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.0.1',
    downloads: 1180,
    created_at: '2026-10-20T13:00:00Z',
    code: `const params = {
  barrelLen: { type: 'number', label: 'Rail Barrel Length', default: 2.6, min: 1.6, max: 3.6, step: 0.1 },
  coils: { type: 'number', label: 'Induction Coils', default: 6, min: 3, max: 10, step: 1 },
  bodyColor: { type: 'color', label: 'Tactical Receiver Color', default: '#1e293b' },
  coilGlow: { type: 'color', label: 'Gauss Coil Glow', default: '#10b981' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: p.bodyColor, metalness: 0.85, roughness: 0.25 });
  const glowMat = new THREE.MeshStandardMaterial({ color: p.coilGlow, emissive: p.coilGlow, emissiveIntensity: 0.9 });

  // Receiver Body & Stock
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.34, 0.22), bodyMat);
  receiver.position.x = -0.5;
  group.add(receiver);

  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.24, 0.16), bodyMat);
  stock.position.set(-1.35, -0.06, 0);
  group.add(stock);

  // Dual Magnetic Rail Barrels
  for (let yOffset of [-0.08, 0.08]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(p.barrelLen, 0.06, 0.12), bodyMat);
    rail.position.set(p.barrelLen / 2 - 0.1, yOffset, 0);
    group.add(rail);
  }

  // Glowing Induction Coils along Barrel
  for (let i = 0; i < p.coils; i++) {
    const xPos = 0.25 + (i / p.coils) * (p.barrelLen - 0.45);
    const coil = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.24), glowMat);
    coil.position.set(xPos, 0, 0);
    group.add(coil);
  }

  // Tactical Optic Scope
  const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.75, 12), bodyMat);
  scope.rotation.z = Math.PI / 2;
  scope.position.set(-0.35, 0.32, 0);
  group.add(scope);

  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.77, 12), glowMat);
  lens.rotation.z = Math.PI / 2;
  lens.position.set(-0.35, 0.32, 0);
  group.add(lens);

  group.position.x = -0.35;
  return group;
}`
  },
  {
    id: 'asset-17',
    slug: 'quantum-hypercube-tesseract',
    title: 'Quantum Hypercube Tesseract',
    category: 'Primitives',
    author_name: 'math_art',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.0.0',
    downloads: 920,
    created_at: '2026-10-20T14:00:00Z',
    code: `const params = {
  outerScale: { type: 'number', label: 'Outer Cube Scale', default: 2.1, min: 1.4, max: 2.8, step: 0.05 },
  innerScale: { type: 'number', label: 'Inner Cube Scale', default: 1.0, min: 0.5, max: 1.5, step: 0.05 },
  frameColor: { type: 'color', label: 'Hypercube Frame Color', default: '#e2e8f0' },
  coreColor: { type: 'color', label: 'Singularity Core Glow', default: '#6366f1' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: p.frameColor, metalness: 0.9, roughness: 0.15 });
  const glowMat = new THREE.MeshStandardMaterial({ color: p.coreColor, emissive: p.coreColor, emissiveIntensity: 0.85, flatShading: true });

  function buildWireCube(size, thickness, mat) {
    const cubeGroup = new THREE.Group();
    const half = size / 2;
    const signs = [-1, 1];
    for (let i of signs) {
      for (let j of signs) {
        const bx = new THREE.Mesh(new THREE.BoxGeometry(size, thickness, thickness), mat);
        bx.position.set(0, i * half, j * half);
        cubeGroup.add(bx);

        const by = new THREE.Mesh(new THREE.BoxGeometry(thickness, size, thickness), mat);
        by.position.set(i * half, 0, j * half);
        cubeGroup.add(by);

        const bz = new THREE.Mesh(new THREE.BoxGeometry(thickness, thickness, size), mat);
        bz.position.set(i * half, j * half, 0);
        cubeGroup.add(bz);
      }
    }
    return cubeGroup;
  }

  group.add(buildWireCube(p.outerScale, 0.07, frameMat));
  group.add(buildWireCube(p.innerScale, 0.06, glowMat));

  // Singularity Octahedron Core
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(p.innerScale * 0.38, 1), glowMat);
  group.add(core);

  group.rotation.x = 0.45;
  group.rotation.z = 0.35;
  return group;
}`
  },
  {
    id: 'asset-18',
    slug: 'deep-space-comms-array',
    title: 'Deep Space Parabolic Array',
    category: 'Sci-Fi',
    author_name: 'orbital_ops',
    author_url: 'https://aklein.tech',
    curation_status: 'verified',
    version: '1.0.0',
    downloads: 675,
    created_at: '2026-10-20T15:00:00Z',
    code: `const params = {
  dishRadius: { type: 'number', label: 'Dish Reflector Radius', default: 1.45, min: 0.9, max: 2.2, step: 0.05 },
  tilt: { type: 'number', label: 'Dish Elevation Tilt', default: 0.55, min: 0.1, max: 1.1, step: 0.05 },
  alloyColor: { type: 'color', label: 'Dish Alloy Color', default: '#f1f5f9' },
  beaconColor: { type: 'color', label: 'Beacon Signal Glow', default: '#ef4444' }
};

function createAsset(THREE, p) {
  const group = new THREE.Group();
  const alloyMat = new THREE.MeshStandardMaterial({ color: p.alloyColor, metalness: 0.65, roughness: 0.3, flatShading: true });
  const baseMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 });
  const beaconMat = new THREE.MeshStandardMaterial({ color: p.beaconColor, emissive: p.beaconColor, emissiveIntensity: 0.95 });

  // Heavy Octagonal Base & Mast
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.9, 0.4, 8), baseMat);
  base.position.y = -0.95;
  group.add(base);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 1.1, 8), baseMat);
  mast.position.y = -0.35;
  group.add(mast);

  // Tilted Parabolic Dish Assembly
  const dishGroup = new THREE.Group();
  const dish = new THREE.Mesh(new THREE.ConeGeometry(p.dishRadius, p.dishRadius * 0.45, 16, 1, true), alloyMat);
  dish.Material = alloyMat;
  dish.material.side = THREE.DoubleSide;
  dish.rotation.x = Math.PI;
  dishGroup.add(dish);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(p.dishRadius, 0.05, 8, 24), baseMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = p.dishRadius * 0.22;
  dishGroup.add(rim);

  const feedHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, p.dishRadius * 0.85, 8), baseMat);
  feedHorn.position.y = p.dishRadius * 0.35;
  dishGroup.add(feedHorn);

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), beaconMat);
  beacon.position.y = p.dishRadius * 0.8;
  dishGroup.add(beacon);

  dishGroup.position.y = 0.25;
  dishGroup.rotation.z = -p.tilt;
  group.add(dishGroup);

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
    author_url: 'https://github.com/maya_3d',
    title: 'Add Spiral Foliage Rotation & Denser Canopy Tiers',
    description: 'Adjusted spiral rotation between foliage tiers and increased default tier count from 5 to 6 for a fuller low-poly silhouette from all camera angles.',
    status: 'open',
    created_at: '2026-10-20T01:15:00Z',
    proposed_code: `const params = {
  tiers: { type: 'number', label: 'Foliage Tiers', default: 6, min: 2, max: 8, step: 1 },
  height: { type: 'number', label: 'Tree Height', default: 3.8, min: 1.5, max: 6.0, step: 0.2 },
  radius: { type: 'number', label: 'Canopy Radius', default: 1.45, min: 0.6, max: 2.5, step: 0.1 },
  leafColor: { type: 'color', label: 'Foliage Color', default: '#34d399' },
  trunkColor: { type: 'color', label: 'Trunk Color', default: '#78350f' }
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
