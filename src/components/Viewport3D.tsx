'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Viewport3DProps {
  modelGroup: THREE.Group | null;
  wireframe?: boolean;
  autoRotate?: boolean;
  showGrid?: boolean;
  lightingPreset?: 'cyber' | 'studio' | 'emerald';
}

export default function Viewport3D({
  modelGroup,
  wireframe = false,
  autoRotate = true,
  showGrid = true,
  lightingPreset = 'cyber'
}: Viewport3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const meshHolderRef = useRef<THREE.Group | null>(null);
  const gridRef = useRef<THREE.Object3D | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const lightsRef = useRef<{ rim1: THREE.DirectionalLight; rim2: THREE.DirectionalLight } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 240;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3.8, 2.7, 4.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e1b4b, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(5, 9, 6);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight1.position.set(-6, 3, -5);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xa855f7, 1.2);
    rimLight2.position.set(4, -5, -4);
    scene.add(rimLight2);

    lightsRef.current = { rim1: rimLight1, rim2: rimLight2 };

    const stageGroup = new THREE.Group();
    const polarGrid = new THREE.PolarGridHelper(4.5, 12, 6, 64, 0x3b82f6, 0x27272a);
    polarGrid.position.y = -1.15;
    stageGroup.add(polarGrid);

    const ringGeo = new THREE.RingGeometry(1.55, 1.62, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.14;
    stageGroup.add(ringMesh);

    stageGroup.visible = showGrid;
    scene.add(stageGroup);
    gridRef.current = stageGroup;

    const holder = new THREE.Group();
    scene.add(holder);
    meshHolderRef.current = holder;

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(reqId);
      resizeObserver.disconnect();
      renderer.dispose();
      renderer.forceContextLoss();
      container.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (gridRef.current) gridRef.current.visible = showGrid;
  }, [showGrid]);

  useEffect(() => {
    if (!lightsRef.current) return;
    if (lightingPreset === 'cyber') {
      lightsRef.current.rim1.color.setHex(0x38bdf8);
      lightsRef.current.rim2.color.setHex(0xa855f7);
    } else if (lightingPreset === 'studio') {
      lightsRef.current.rim1.color.setHex(0xfbbf24);
      lightsRef.current.rim2.color.setHex(0x94a3b8);
    } else if (lightingPreset === 'emerald') {
      lightsRef.current.rim1.color.setHex(0x10b981);
      lightsRef.current.rim2.color.setHex(0x06b6d4);
    }
  }, [lightingPreset]);

  useEffect(() => {
    const holder = meshHolderRef.current;
    if (!holder) return;
    holder.clear();

    if (modelGroup) {
      const clone = modelGroup.clone(true);
      clone.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat) mat.wireframe = wireframe;
        }
      });
      holder.add(clone);
    }
  }, [modelGroup, wireframe]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative overflow-hidden select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 38%, rgba(30, 58, 138, 0.38) 0%, rgba(15, 23, 42, 0.65) 48%, rgba(9, 9, 11, 0.96) 100%)'
      }}
    />
  );
}
