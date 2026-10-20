import * as THREE from 'three';

const snapshotCache = new Map<string, string>();
let sharedRenderer: THREE.WebGLRenderer | null = null;

function getSharedSnapshotRenderer(): THREE.WebGLRenderer | null {
  if (typeof window === 'undefined') return null;
  if (!sharedRenderer) {
    sharedRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    sharedRenderer.setSize(480, 360);
    sharedRenderer.setPixelRatio(1.5);
    sharedRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    sharedRenderer.toneMappingExposure = 1.25;
  }
  return sharedRenderer;
}

/**
 * Merender model 3D satu kali menggunakan Singleton Offscreen WebGLRenderer
 * menjadi gambar DataURL (.webp) ringan agar halaman katalog bebas dari batas WebGL Context!
 */
export function getOrCreateAssetThumbnail(cacheKey: string, modelGroup: THREE.Group | null): string | null {
  if (typeof window === 'undefined' || !modelGroup) return null;
  if (snapshotCache.has(cacheKey)) {
    return snapshotCache.get(cacheKey)!;
  }

  const renderer = getSharedSnapshotRenderer();
  if (!renderer) return null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 480 / 360, 0.1, 100);
  camera.position.set(3.7, 2.6, 4.3);
  camera.lookAt(0, 0.1, 0);

  // Studio 4-Point Lighting
  scene.add(new THREE.HemisphereLight(0xffffff, 0x1e1b4b, 1.15));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(5, 9, 6);
  scene.add(keyLight);

  const rim1 = new THREE.DirectionalLight(0x38bdf8, 1.7);
  rim1.position.set(-6, 3, -5);
  scene.add(rim1);

  const rim2 = new THREE.DirectionalLight(0xa855f7, 1.3);
  rim2.position.set(4, -5, -4);
  scene.add(rim2);

  // Subtle Polar Pedestal
  const polarGrid = new THREE.PolarGridHelper(4.2, 12, 5, 48, 0x3b82f6, 0x27272a);
  polarGrid.position.y = -1.15;
  scene.add(polarGrid);

  const clone = modelGroup.clone(true);
  clone.rotation.y = 0.45;
  scene.add(clone);

  renderer.clear();
  renderer.render(scene, camera);

  const dataUrl = renderer.domElement.toDataURL('image/webp', 0.88);
  snapshotCache.set(cacheKey, dataUrl);
  return dataUrl;
}
