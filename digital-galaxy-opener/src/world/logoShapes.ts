// 3D solids built from the OFFICIAL logo geometry (src/brand/logoGeometry.ts).
// Seen head-on, both silhouettes equal the original mark.
import * as THREE from 'three';
import { HOLE, OUTER, STAR, STAR_STROKE } from '../brand/logoGeometry';
import { LOGO_S } from './worldState';

/** Logo units (SVG, y-down) → world (y-up), centred on the outer circle. */
const W = (x: number, y: number) => new THREE.Vector2((x - OUTER.cx) * LOGO_S, -(y - OUTER.cy) * LOGO_S);

/** Ring = outer circle minus the 45° ellipse, exactly as RING_PATH. */
export function ringShape() {
  const s = new THREE.Shape();
  s.absarc(0, 0, OUTER.r * LOGO_S, 0, Math.PI * 2, false);
  const h = new THREE.Path();
  const c = W(HOLE.cx, HOLE.cy);
  // SVG rotate(+45°) in y-down space = -45° in y-up space
  h.absellipse(c.x, c.y, HOLE.rx * LOGO_S, HOLE.ry * LOGO_S, 0, Math.PI * 2, true, -Math.PI / 4);
  s.holes.push(h);
  return s;
}

/**
 * Star = STAR_PATH filled + stroked 16 with round joins. Reproduced by offsetting the
 * four cubic sides outward by half the stroke and closing each tip with a round arc.
 */
export function starShape() {
  const segs = [
    [[0, -36.5], [0, -12.78], [12.78, 0], [36.5, 0]],
    [[36.5, 0], [12.78, 0], [0, 12.78], [0, 36.5]],
    [[0, 36.5], [0, 12.78], [-12.78, 0], [-36.5, 0]],
    [[-36.5, 0], [-12.78, 0], [0, -12.78], [0, -36.5]],
  ];
  const off = STAR_STROKE / 2;
  const bez = (s: number[][], t: number) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]);
  };
  const tan = (s: number[][], t: number) => {
    const u = 1 - t;
    return [0, 1].map((k) => 3 * u * u * (s[1][k] - s[0][k]) + 6 * u * t * (s[2][k] - s[1][k]) + 3 * t * t * (s[3][k] - s[2][k]));
  };
  // path runs clockwise in y-down space → outward normal = (ty, -tx)
  const nrm = (tx: number, ty: number) => { const l = Math.hypot(tx, ty) || 1; return [ty / l, -tx / l]; };
  const pts: number[][] = [];
  const N = 40;
  segs.forEach((s, si) => {
    for (let k = 1; k < N; k++) {
      const t = k / N, p = bez(s, t), d = tan(s, t), n = nrm(d[0], d[1]);
      pts.push([p[0] + n[0] * off, p[1] + n[1] * off]);
    }
    // round tip at the end of this side
    const tip = s[3], d0 = tan(s, 0.999), d1 = tan(segs[(si + 1) % 4], 0.001);
    const n0 = nrm(d0[0], d0[1]), n1 = nrm(d1[0], d1[1]);
    const a0 = Math.atan2(n0[1], n0[0]);
    let a1 = Math.atan2(n1[1], n1[0]);
    while (a1 < a0) a1 += Math.PI * 2;
    if (a1 - a0 > Math.PI) a1 -= Math.PI * 2;
    for (let k = 0; k <= 10; k++) { const a = a0 + ((a1 - a0) * k) / 10; pts.push([tip[0] + Math.cos(a) * off, tip[1] + Math.sin(a) * off]); }
  });
  const shape = new THREE.Shape(pts.map(([x, y]) => W(STAR.cx + x, STAR.cy + y)));
  return shape;
}

export const extrude = (shape: THREE.Shape, depth: number, bevel: number) =>
  new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 4, curveSegments: 96 }).translate(0, 0, -depth / 2);

/** Soft radial glow texture (white → transparent), tinted by sprite colour. */
let glowTex: THREE.CanvasTexture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  gr.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

/** Star sprite texture: the brand star, soft-edged — used for 4-point flares. */
let starTex: THREE.CanvasTexture | null = null;
export function starFlareTexture() {
  if (starTex) return starTex;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.translate(256, 256);
  for (const [len, w, a] of [[250, 10, 0.35], [180, 5, 0.7]] as const) {
    for (const rot of [0, Math.PI / 2]) {
      g.save(); g.rotate(rot);
      const gr = g.createLinearGradient(-len, 0, len, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, len, w, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
  }
  starTex = new THREE.CanvasTexture(c);
  starTex.colorSpace = THREE.SRGBColorSpace;
  return starTex;
}
