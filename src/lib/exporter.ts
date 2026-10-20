import * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

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

export function exportToOBJ(object3D: THREE.Object3D, slug: string) {
  const clone = object3D.clone(true);
  clone.rotation.set(0, 0, 0);
  clone.updateMatrixWorld(true);

  const exporter = new OBJExporter();
  const objString = exporter.parse(clone);
  const blob = new Blob([objString], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${slug}.obj`);
}

export function exportToGLB(object3D: THREE.Object3D, slug: string) {
  const clone = object3D.clone(true);
  clone.rotation.set(0, 0, 0);
  clone.updateMatrixWorld(true);

  const exporter = new GLTFExporter();
  exporter.parse(
    clone,
    (result) => {
      const blob = new Blob([result as ArrayBuffer], { type: 'application/octet-stream' });
      triggerDownload(blob, `${slug}.glb`);
    },
    (err) => console.error('GLB Export Error:', err),
    { binary: true }
  );
}
