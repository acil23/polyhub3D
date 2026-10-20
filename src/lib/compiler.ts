import * as THREE from 'three';
import { ParamSchema, ParamValues, TelemetryStats } from '@/types/polycode';
import { validateProceduralScript } from './validator';
import { extractAssetMeta } from './metadata';

export interface CompileResult {
  group: THREE.Group | null;
  schema: ParamSchema;
  values: ParamValues;
  stats: TelemetryStats;
  error: string | null;
}

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
  rawCode: string,
  overrideValues?: ParamValues
): CompileResult {
  const start = performance.now();
  try {
    const { cleanCode: code } = extractAssetMeta(rawCode, '');
    const check = validateProceduralScript(code);
    if (!check.valid) {
      throw new Error(check.reason);
    }

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
