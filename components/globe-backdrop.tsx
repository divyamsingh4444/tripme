'use client';

/**
 * WebGL hero backdrop: a slowly turning point-cloud globe with marigold flight
 * arcs rising off its surface.
 *
 * Deliberately restrained — it sits behind the headline, so it must never fight
 * the type. Bails out to a plain gradient when WebGL is unavailable or the user
 * prefers reduced motion, and pauses entirely when scrolled out of view so it
 * costs nothing while you are reading the rest of the page.
 */

import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';

const INK = 0x0e1f1a;
const MIST = 0xcfe6e0;
const MARIGOLD = 0xffb52e;

export default function GlobeBackdrop() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    /*
     * Gate before importing anything. three.js is ~178KB gzipped, so we only
     * pay for it where it actually earns its place: a motion-tolerant user, on
     * a screen big enough to see the globe, with cores to spare. Phones and
     * low-power devices get the CSS gradient, which is the same composition
     * minus the motion — and costs nothing.
     */
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tooNarrow = window.innerWidth < 768;
    const weakDevice = (navigator.hardwareConcurrency ?? 8) < 4;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

    if (reduced || tooNarrow || weakDevice || saveData) {
      setFailed(true);
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Dynamically imported so three.js never blocks first paint.
    import('three')
      .then((THREE) => {
        if (disposed || !mountRef.current) return;

        let renderer: THREE.WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
        } catch {
          setFailed(true);
          return;
        }

        const width = el.clientWidth;
        const height = el.clientHeight;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(INK, 0.055);

        const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
        camera.position.set(0, 0.6, 11);

        const world = new THREE.Group();
        world.rotation.z = -0.22; // gentle axial tilt
        scene.add(world);

        /* ---- globe surface as a fibonacci point cloud ---- */
        const R = 4;
        const COUNT = 2600;
        const positions = new Float32Array(COUNT * 3);
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < COUNT; i++) {
          const y = 1 - (i / (COUNT - 1)) * 2;
          const radius = Math.sqrt(Math.max(0, 1 - y * y));
          const theta = golden * i;
          positions[i * 3] = Math.cos(theta) * radius * R;
          positions[i * 3 + 1] = y * R;
          positions[i * 3 + 2] = Math.sin(theta) * radius * R;
        }
        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const dots = new THREE.Points(
          dotGeo,
          new THREE.PointsMaterial({ color: MIST, size: 0.055, transparent: true, opacity: 0.72, sizeAttenuation: true }),
        );
        world.add(dots);

        /* ---- a faint wire shell for depth ---- */
        const shell = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(R * 1.001, 3)),
          new THREE.LineBasicMaterial({ color: MIST, transparent: true, opacity: 0.09 }),
        );
        world.add(shell);

        /* ---- flight arcs between random surface points ---- */
        const onSphere = (): THREE.Vector3 => {
          const u = Math.random() * 2 - 1;
          const t = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.max(0, 1 - u * u));
          return new THREE.Vector3(Math.cos(t) * r, u, Math.sin(t) * r).multiplyScalar(R);
        };

        const arcs: { line: THREE.Line; mat: THREE.LineBasicMaterial; offset: number }[] = [];
        for (let i = 0; i < 7; i++) {
          const a = onSphere();
          const b = onSphere();
          const mid = a.clone().add(b).multiplyScalar(0.5).setLength(R * (1.28 + Math.random() * 0.22));
          const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          const mat = new THREE.LineBasicMaterial({ color: MARIGOLD, transparent: true, opacity: 0.3 });
          const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), mat);
          world.add(line);
          arcs.push({ line, mat, offset: Math.random() * Math.PI * 2 });
        }

        /* ---- drifting motes for atmosphere ---- */
        const moteCount = 260;
        const motePos = new Float32Array(moteCount * 3);
        for (let i = 0; i < moteCount; i++) {
          motePos[i * 3] = (Math.random() - 0.5) * 26;
          motePos[i * 3 + 1] = (Math.random() - 0.5) * 16;
          motePos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
        }
        const moteGeo = new THREE.BufferGeometry();
        moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
        const motes = new THREE.Points(
          moteGeo,
          new THREE.PointsMaterial({ color: MIST, size: 0.035, transparent: true, opacity: 0.4 }),
        );
        scene.add(motes);

        /* ---- pointer parallax ---- */
        const target = { x: 0, y: 0 };
        const current = { x: 0, y: 0 };
        const onPointer = (e: PointerEvent) => {
          target.x = (e.clientX / window.innerWidth - 0.5) * 0.28;
          target.y = (e.clientY / window.innerHeight - 0.5) * 0.18;
        };
        window.addEventListener('pointermove', onPointer, { passive: true });

        /* ---- pause when off-screen ---- */
        let visible = true;
        const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 });
        io.observe(el);

        const onResize = () => {
          if (!mountRef.current) return;
          const w = mountRef.current.clientWidth;
          const h = mountRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', onResize);

        let raf = 0;
        const clock = new THREE.Clock();
        const tick = () => {
          raf = requestAnimationFrame(tick);
          if (!visible) return;
          const t = clock.getElapsedTime();

          world.rotation.y += 0.0016;
          motes.rotation.y -= 0.0004;

          // ease toward the pointer rather than snapping
          current.x += (target.x - current.x) * 0.04;
          current.y += (target.y - current.y) * 0.04;
          world.rotation.x = current.y;
          camera.position.x = current.x * 3;
          camera.lookAt(0, 0, 0);

          arcs.forEach((a, i) => {
            a.mat.opacity = 0.16 + Math.sin(t * 0.55 + a.offset) * 0.16 + (i % 2) * 0.04;
          });

          renderer.render(scene, camera);
        };
        tick();

        cleanup = () => {
          cancelAnimationFrame(raf);
          io.disconnect();
          window.removeEventListener('pointermove', onPointer);
          window.removeEventListener('resize', onResize);
          dotGeo.dispose();
          moteGeo.dispose();
          shell.geometry.dispose();
          (shell.material as THREE.Material).dispose();
          arcs.forEach((a) => {
            a.line.geometry.dispose();
            a.mat.dispose();
          });
          (dots.material as THREE.Material).dispose();
          (motes.material as THREE.Material).dispose();
          renderer.dispose();
          if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        };
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Always-present base so the hero reads correctly before/without WebGL */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#1d5449_0%,#14453d_45%,#0e1f1a_100%)]" />
      {!failed && <div ref={mountRef} className="absolute inset-0" />}
      {/* Vignette + bottom fade so type always has contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_45%,transparent_0%,rgba(14,31,26,0.55)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
