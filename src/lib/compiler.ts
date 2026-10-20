import * as THREE from 'three';
import { ParamSchema, ParamValues, TelemetryStats } from '@/types/polycode';

export interface CompileResult {
  group: THREE.Group | null;
  schema: ParamSchema;
  values: ParamValues;
  stats: TelemetryStats;
  error: string | null;
}

const FORBIDDEN_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /\bwindow\b/, name: 'window' },
  { pattern: /\bdocument\b/, name: 'document' },
  { pattern: /\bfetch\b/, name: 'fetch()' },
  { pattern: /\bXMLHttpRequest\b/, name: 'XMLHttpRequest' },
  { pattern: /\blocalStorage\b/, name: 'localStorage' },
  { pattern: /\bsessionStorage\b/, name: 'sessionStorage' },
  { pattern: /\bindexedDB\b/, name: 'indexedDB' },
  { pattern: /\beval\b/, name: 'eval()' },
  { pattern: /\bFunction\b/, name: 'Function constructor' },
  { pattern: /\bWebSocket\b/, name: 'WebSocket' },
  { pattern: /\bnavigator\b/, name: 'navigator' },
  { pattern: /\blocation\b/, name: 'location' },
  { pattern: /\bcookie\b/, name: 'cookie' },
];

/**
 * Menyuntikkan pengaman iterasi & batas waktu (350ms) ke dalam loop for/while/do
 * untuk mencegah browser hang akibat infinite loop.
 */
function injectLoopGuards(rawCode: string): string {
  let guarded = rawCode;
  guarded = guarded.replace(
    /\b(for|while)\s*\(([^)]*)\)\s*\{/g,
    '$1 ($2) { __guard();'
  );
  guarded = guarded.replace(
    /\bdo\s*\{/g,
    'do { __guard();'
  );
  return guarded;
}

export function compileProceduralCode(
  code: string,
  overrideValues?: ParamValues
): CompileResult {
  const start = performance.now();
  try {
    // 1. Static Sandbox Security Inspection
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(code)) {
        throw new Error(
          `Security Sandbox Violation: Penggunaan API '${rule.name}' dilarang di dalam skrip 3D.`
        );
      }
    }

    // 2. Inject Anti-Infinite Loop Guard
    const safeCode = injectLoopGuards(code);

    const wrappedBody = `
      "use strict";
      let __iters = 0;
      const __startMs = performance.now();
      function __guard() {
        if (++__iters > 100000 || (performance.now() - __startMs) > 350) {
          throw new Error("Execution Timeout: Loop melebihi batas aman (100.000 iterasi atau >350ms).");
        }
      }
      ${safeCode}
      return {
        params: typeof params !== 'undefined' ? params : {},
        createAsset: typeof createAsset === 'function' ? createAsset : null
      };
    `;

    const factory = new Function('THREE', wrappedBody);
    const exported = factory(THREE);

    if (!exported.createAsset) {
      throw new Error("Fungsi 'createAsset(THREE, p)' wajib didefinisikan.");
    }

    const schema: ParamSchema = exported.params || {};
    const resolvedValues: ParamValues = {};

    for (const key of Object.keys(schema)) {
      resolvedValues[key] =
        overrideValues && overrideValues[key] !== undefined
          ? overrideValues[key]
          : schema[key].default;
    }

    const resultGroup = exported.createAsset(THREE, resolvedValues);
    if (!(resultGroup instanceof THREE.Object3D)) {
      throw new Error("createAsset() harus mengembalikan instance THREE.Group atau THREE.Mesh.");
    }

    let group: THREE.Group;
    if (resultGroup instanceof THREE.Group) {
      group = resultGroup;
    } else {
      group = new THREE.Group();
      group.add(resultGroup);
    }

    let vertices = 0;
    let triangles = 0;
    group.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const geom = mesh.geometry;
        if (geom && geom.attributes.position) {
          const posCount = geom.attributes.position.count;
          vertices += posCount;
          triangles += geom.index ? geom.index.count / 3 : posCount / 3;
        }
      }
    });

    if (vertices > 250000) {
      throw new Error(`Mesh terlalu padat (${vertices} vertices). Batas maksimum adalah 250.000 vertices.`);
    }

    const compileTimeMs = Math.round((performance.now() - start) * 10) / 10;
    const scriptSizeKB = (new Blob([code]).size / 1024).toFixed(2);

    return {
      group,
      schema,
      values: resolvedValues,
      stats: { vertices, triangles: Math.round(triangles), scriptSizeKB, compileTimeMs },
      error: null
    };
  } catch (err: any) {
    return {
      group: null,
      schema: {},
      values: {},
      stats: { vertices: 0, triangles: 0, scriptSizeKB: '0.00', compileTimeMs: 0 },
      error: err?.message || 'Unknown compilation error'
    };
  }
}
