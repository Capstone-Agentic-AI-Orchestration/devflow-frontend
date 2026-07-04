"use client";

/**
 * HeroScene — particle morph field (three.js, no deps beyond `three`).
 *
 * ~3,600 white particles continuously assemble the product story beside the
 * "One prompt, build everything." tagline:
 *
 *   >_  (the prompt)  →  </>  (code)  →  app window  →  database
 *
 * Each shape is drawn on an offscreen 2D canvas, its filled pixels sampled
 * into 3D targets, and the particles morph between target sets with a
 * per-particle stagger so the swarm streams rather than snaps.
 *
 * Interaction:
 *  - cursor repels nearby particles (they flow around the pointer)
 *  - the whole field tilts subtly toward the cursor (bounded parallax)
 *  - click over the hero scatters the swarm; it reassembles in ~1.5s
 *
 * Robustness: static single frame under prefers-reduced-motion, survives
 * WebGL context loss, retries sizing until layout exists, fully disposes
 * (incl. forceContextLoss) on unmount so HMR/StrictMode remounts don't
 * exhaust GL contexts.
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

const PARTICLES = 3600;
const WORLD_W = 4.8; // world-units width the sampled canvas maps onto
const WORLD_H = 3.0;
const Z_JITTER = 0.22;
const HOLD_S = 3.2; // seconds a shape holds before morphing
const MORPH_S = 1.4; // seconds a morph takes (incl. stagger)
const STAGGER = 0.35; // fraction of morph spent staggering starts

const CANVAS_W = 480;
const CANVAS_H = 300;

type ShapePainter = (ctx: CanvasRenderingContext2D) => void;

const glyph =
  (text: string, size = 190): ShapePainter =>
  (ctx) => {
    ctx.font = `700 ${size}px ui-monospace, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2);
  };

const appWindow: ShapePainter = (ctx) => {
  ctx.lineWidth = 7;
  const x = 70, y = 40, w = 340, h = 220;
  ctx.strokeRect(x, y, w, h);
  // title bar + traffic dots
  ctx.beginPath();
  ctx.moveTo(x, y + 42);
  ctx.lineTo(x + w, y + 42);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + 24 + i * 26, y + 21, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // sidebar
  ctx.fillRect(x + 16, y + 60, 70, 12);
  ctx.fillRect(x + 16, y + 86, 70, 12);
  ctx.fillRect(x + 16, y + 112, 70, 12);
  // content blocks
  ctx.fillRect(x + 110, y + 60, 210, 40);
  ctx.fillRect(x + 110, y + 116, 96, 84);
  ctx.fillRect(x + 224, y + 116, 96, 84);
};

const database: ShapePainter = (ctx) => {
  ctx.lineWidth = 7;
  const cx = CANVAS_W / 2, top = 62, bot = 238, rx = 118, ry = 34;
  ctx.beginPath();
  ctx.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, (top + bot) / 2, rx, ry, 0, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, bot, rx, ry, 0, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - rx, top);
  ctx.lineTo(cx - rx, bot);
  ctx.moveTo(cx + rx, top);
  ctx.lineTo(cx + rx, bot);
  ctx.stroke();
};

const SHAPES: ShapePainter[] = [glyph(">_"), glyph("</>", 170), appWindow, database];

/** Sample a painter's filled pixels into PARTICLES 3D target positions. */
function sampleShape(painter: ShapePainter, seed: number): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  painter(ctx);

  const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
  const candidates: number[] = [];
  for (let py = 0; py < CANVAS_H; py += 2) {
    for (let px = 0; px < CANVAS_W; px += 2) {
      if (data[(py * CANVAS_W + px) * 4 + 3] > 128) candidates.push(px, py);
    }
  }

  const out = new Float32Array(PARTICLES * 3);
  const n = candidates.length / 2;
  // deterministic-ish PRNG so shapes are stable across renders
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < PARTICLES; i++) {
    const k = Math.floor(rand() * n);
    const px = candidates[k * 2] + (rand() - 0.5) * 2;
    const py = candidates[k * 2 + 1] + (rand() - 0.5) * 2;
    out[i * 3] = (px / CANVAS_W - 0.5) * WORLD_W;
    out[i * 3 + 1] = -(py / CANVAS_H - 0.5) * WORLD_H;
    out[i * 3 + 2] = (rand() - 0.5) * Z_JITTER;
  }
  return out;
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5.6);

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0a);
    const canvas = renderer.domElement;
    container.appendChild(canvas);

    const onContextLost = (e: Event) => e.preventDefault();
    canvas.addEventListener("webglcontextlost", onContextLost, false);

    const group = new THREE.Group();
    scene.add(group);

    // Shape targets (sampled once; reduced motion shows the app window).
    const targets = SHAPES.map((p, i) => sampleShape(p, 1013904223 + i * 69069));
    let shapeIdx = reduced ? 2 : 0;

    const from = new Float32Array(targets[shapeIdx]);
    const to = new Float32Array(targets[shapeIdx]);
    const positions = new Float32Array(targets[shapeIdx]);

    // Per-particle character: stagger delay, idle-float phase & amplitude.
    const delay = new Float32Array(PARTICLES);
    const phase = new Float32Array(PARTICLES);
    const amp = new Float32Array(PARTICLES);
    const burstVel = new Float32Array(PARTICLES * 3);
    const offset = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      delay[i] = Math.random() * STAGGER;
      phase[i] = Math.random() * Math.PI * 2;
      amp[i] = 0.012 + Math.random() * 0.03;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xfafafa,
      size: 0.04,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    group.add(new THREE.Points(geo, mat));

    const render = () => renderer.render(scene, camera);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return false;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const aspect = w / h;
      group.scale.setScalar(aspect < 0.85 ? 0.62 : aspect < 1.1 ? 0.8 : 1);
      render();
      return true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Pointer: parallax tilt + world-space repulsion point.
    const tilt = { x: 0, y: 0 };
    const mouse = new THREE.Vector3(999, 999, 0);
    const onPointer = (e: PointerEvent) => {
      tilt.x = (e.clientX / window.innerWidth - 0.5) * 2;
      tilt.y = (e.clientY / window.innerHeight - 0.5) * 2;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0) return;
      // Unproject the cursor onto the z=0 plane the particles live near.
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      mouse.set((ndcX * halfH * camera.aspect) / group.scale.x, (ndcY * halfH) / group.scale.x, 0);
    };
    window.addEventListener("pointermove", onPointer);

    // Click over the hero: scatter the swarm, then it reassembles.
    const onPointerDown = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      for (let i = 0; i < PARTICLES; i++) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const sp = 1.2 + Math.random() * 2.2;
        burstVel[i * 3] = Math.sin(ph) * Math.cos(th) * sp;
        burstVel[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * sp;
        burstVel[i * 3 + 2] = Math.cos(ph) * sp * 0.4;
      }
    };
    window.addEventListener("pointerdown", onPointerDown);

    // Morph scheduling.
    let morphT = 1; // 1 = settled on `to`
    let holdT = 0;
    let clock = 0;

    const startMorph = () => {
      from.set(positionsBase); // morph from wherever particles settled
      shapeIdx = (shapeIdx + 1) % targets.length;
      to.set(targets[shapeIdx]);
      morphT = 0;
    };

    // Base (pre-offset) positions, kept separate so repulsion/burst/float
    // never corrupt the morph interpolation.
    const positionsBase = new Float32Array(targets[shapeIdx]);

    const step = (dt: number) => {
      clock += dt;

      if (morphT >= 1) {
        holdT += dt;
        if (holdT >= HOLD_S) {
          holdT = 0;
          startMorph();
        }
      } else {
        morphT = Math.min(morphT + dt / MORPH_S, 1);
      }

      for (let i = 0; i < PARTICLES; i++) {
        const i3 = i * 3;
        // staggered per-particle morph progress
        const tp = Math.min(Math.max((morphT - delay[i]) / (1 - STAGGER), 0), 1);
        const e = easeInOutCubic(tp);
        let bx = from[i3] + (to[i3] - from[i3]) * e;
        let by = from[i3 + 1] + (to[i3 + 1] - from[i3 + 1]) * e;
        const bz = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * e;
        positionsBase[i3] = bx;
        positionsBase[i3 + 1] = by;
        positionsBase[i3 + 2] = bz;

        // idle float
        by += Math.sin(clock * 1.4 + phase[i]) * amp[i];
        bx += Math.cos(clock * 1.1 + phase[i]) * amp[i] * 0.6;

        // burst velocity (decaying) accumulates into an offset that relaxes home
        offset[i3] += burstVel[i3] * dt;
        offset[i3 + 1] += burstVel[i3 + 1] * dt;
        offset[i3 + 2] += burstVel[i3 + 2] * dt;
        burstVel[i3] *= Math.exp(-2.6 * dt);
        burstVel[i3 + 1] *= Math.exp(-2.6 * dt);
        burstVel[i3 + 2] *= Math.exp(-2.6 * dt);
        offset[i3] *= Math.exp(-2.2 * dt);
        offset[i3 + 1] *= Math.exp(-2.2 * dt);
        offset[i3 + 2] *= Math.exp(-2.2 * dt);

        let px = bx + offset[i3];
        let py = by + offset[i3 + 1];
        const pz = bz + offset[i3 + 2];

        // cursor repulsion — particles part around the pointer
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 0.55) {
          const d = Math.sqrt(d2) || 0.001;
          const push = ((0.742 - d) / 0.742) * 0.34;
          px += (dx / d) * push;
          py += (dy / d) * push;
        }

        positions[i3] = px;
        positions[i3 + 1] = py;
        positions[i3 + 2] = pz;
      }
      geo.attributes.position.needsUpdate = true;

      // bounded parallax tilt
      group.rotation.y += (tilt.x * 0.22 - group.rotation.y) * 0.05;
      group.rotation.x += (-tilt.y * 0.14 - group.rotation.x) * 0.05;
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      step(dt);
      render();
      raf = requestAnimationFrame(loop);
    };

    // Wait for layout, then start.
    let started = false;
    const start = () => {
      if (started) return;
      if (!resize()) {
        raf = requestAnimationFrame(start);
        return;
      }
      started = true;
      if (reduced) render();
      else {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  return <div ref={containerRef} className="hero-scene" aria-hidden="true" />;
}

export default HeroScene;
