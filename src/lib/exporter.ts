import * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { Asset3D } from '@/types/polycode';

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToOBJ(object3D: THREE.Object3D, asset: Pick<Asset3D, 'slug' | 'title' | 'author_name' | 'author_url' | 'version'>) {
  const clone = object3D.clone(true);
  clone.rotation.set(0, 0, 0);
  clone.updateMatrixWorld(true);

  const exporter = new OBJExporter();
  const rawObj = exporter.parse(clone);

  const creditHeader = [
    '# ====================================================================',
    '# PolyCode Hub - Open-Source Procedural 3D Asset',
    `# Asset Title   : ${asset.title} (v${asset.version})`,
    `# Creator       : @${asset.author_name}`,
    `# Creator Link  : ${asset.author_url || 'https://github.com/' + asset.author_name}`,
    '# License       : MIT / CC-BY 4.0 (Free for commercial & personal use)',
    '# ====================================================================',
    ''
  ].join('\n');

  const blob = new Blob([creditHeader + rawObj], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${asset.slug}.obj`);
}

export function exportToGLB(object3D: THREE.Object3D, asset: Pick<Asset3D, 'slug' | 'title' | 'author_name' | 'author_url' | 'version'>) {
  const clone = object3D.clone(true);
  clone.rotation.set(0, 0, 0);
  clone.userData = {
    generator: 'PolyCode Hub v1.1.0',
    title: asset.title,
    version: asset.version,
    creator: `@${asset.author_name}`,
    creatorProfile: asset.author_url || `https://github.com/${asset.author_name}`,
    license: 'MIT'
  };
  clone.updateMatrixWorld(true);

  const exporter = new GLTFExporter();
  exporter.parse(
    clone,
    (result) => {
      const blob = new Blob([result as ArrayBuffer], { type: 'application/octet-stream' });
      triggerDownload(blob, `${asset.slug}.glb`);
    },
    (err) => console.error('GLB Export Error:', err),
    { binary: true }
  );
}
