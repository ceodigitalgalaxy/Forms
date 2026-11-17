// ============================================================================
// GALAXY CAMERA RIG — every shot is a pure function of the global frame.
// Close-ups, medium shots and wide reveals, cut or blended on the beat.
// ============================================================================
import * as THREE from 'three';
import { K, SCENES, WIDTH, HEIGHT } from '../timeline/timeline';
import { ease, keyframes, lerp, prog } from '../lib/easing';
import { CHECKPOINT_ANGLES, ORBITS, PLANE_NORMAL, R_LOGO, orbitQuat, orbitWorldPoint, planeQuat, planetPosition } from './worldState';

export type Cam = { pos: THREE.Vector3; target: THREE.Vector3; fov: number; up: THREE.Vector3; roll: number };
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const cam = (pos: THREE.Vector3, target: THREE.Vector3, fov = 30, roll = 0, up = UP): Cam => ({ pos, target, fov, roll, up });

/** Catmull-Rom path through key positions with eased time. */
function path(f: number, from: number, to: number, pts: THREE.Vector3[], e = ease.inOutCubic) {
  const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  return c.getPoint(e(prog(f, from, to)));
}

/** Aligned "brand view": camera looks straight at the logo, logo radius = rPx, logo centre at screen y = cy. */
export function alignedCamera(rPx: number, cy: number, fov = 30): Cam {
  const t = Math.tan(((fov / 2) * Math.PI) / 180);
  const D = (R_LOGO * (HEIGHT / 2)) / (rPx * t);
  const dy = ((HEIGHT / 2 - cy) * D * t) / (HEIGHT / 2);
  return cam(V(0, -dy, D), V(0, -dy, 0), fov);
}
export const REVEAL_LOGO = { r: 380, cy: 800 };
export const FINAL_LOGO = { r: 300, cy: 760 };

// ---- scene shots ------------------------------------------------------------
function signal(f: number): Cam {
  const p = path(f, 0, SCENES.signal.dur, [V(0.9, 0.7, 52), V(0.5, 0.5, 26), V(0.15, 0.35, 13.5), V(0, 0.3, 10.2)], ease.inOutCubic);
  return cam(p, V(0, 0, 0), 30, lerp(-5, 0, ease.outCubic(prog(f, 0, 150))));
}

const CHAOS_SHOTS: Array<(u: number, f: number) => Cam> = [
  (u) => cam(V(lerp(7, 6, u), 0.7, lerp(7, 6, u)), V(0, 0.4, 0), 34, -6),
  (u) => cam(V(0.5, 15, 3), V(0, 0, 0), 32, lerp(18, 26, u)),
  (u) => cam(V(lerp(3, -2.5, u), 0.9, 4.2), V(lerp(1, -1, u), 0.2, 0), 38, 8),
  (u) => cam(V(-13, 3.2, -8 + u), V(0, 0, 0), 28, 4),
  (u) => cam(V(3.4, -2.2, lerp(9.5, 8.6, u)), V(0, 0.5, 0), 34, -18),
  (_u, f) => { const p = planetPosition(3, f); return cam(p.clone().add(V(1.4, 0.5, 1.9)), p, 36, 10); },
  (u) => cam(V(lerp(-6, 6, u), 1.1, 7.2), V(lerp(-1.5, 1.5, u), 0, 0), 36, -4),
  (u) => cam(V(8.5, 7.2, lerp(11, 10, u)), V(0, -0.5, 0), 30, 14),
  (u) => cam(V(0, 2, lerp(15, 12, u)), V(0, 0, 0), 30, 0),
];
function chaos(f: number): Cam {
  const k = Math.min(8, Math.floor((f - SCENES.chaos.from) / 28));
  return CHAOS_SHOTS[k](((f - SCENES.chaos.from) % 28) / 28, f);
}

function center(f: number): Cam {
  if (f < K.starActivate) return cam(V(0, 1.4, 17), V(0, 0, 0), 30, 0); // frozen tableau — a held breath
  const g = ease.inExpo(prog(f, K.contraction[0], K.contraction[1]));
  const reveal = ease.outCubic(prog(f, K.starActivate, K.starActivate + 24));
  const z = lerp(17, 2.5, g * 0.85 + reveal * 0.15);
  return cam(V(0, lerp(1.4, 0.12, g), z), V(0, 0, 0), lerp(30, 34, g), g * 28);
}

function reveal(f: number): Cam {
  const al = alignedCamera(REVEAL_LOGO.r, REVEAL_LOGO.cy);
  if (f < 640) {
    // STAR IMPULSE: dramatic dolly-out from the macro close-up
    const e = ease.outExpo(prog(f, K.expansion, 640));
    return cam(V(lerp(0, 3.4, e), lerp(0.12, 2.4, e), lerp(2.5, 14.5, e)), V(0, 0, 0), lerp(34, 30, e), lerp(28, 6, e));
  }
  if (f < K.logoAligned) {
    // thread the outer orbit ring, then find the logo dead centre
    const ringPt = orbitWorldPoint(4, 0.55, K.ringThrough).add(PLANE_NORMAL.clone().multiplyScalar(0.35));
    const p = path(f, 640, K.logoAligned, [V(3.4, 2.4, 14.5), ringPt.clone().multiplyScalar(1.25), ringPt, V(1.2, -0.6, 14.5), al.pos], ease.inOutQuint);
    const tgt = new THREE.Vector3().lerpVectors(V(0, 0, 0), al.target, ease.inOutCubic(prog(f, 680, K.logoAligned)));
    return cam(p, tgt, 30, lerp(6, 0, ease.inOutCubic(prog(f, 650, K.logoAligned))));
  }
  if (f < K.orbitalWipe[0]) return al; // held, perfectly aligned: the exact mark
  // ORBITAL WIPE: dolly into the ring and through its hole (beside the star)
  const e = ease.inExpo(prog(f, K.orbitalWipe[0], K.orbitalWipe[1]));
  const aim = V(0.7, -0.7, 0);
  return cam(new THREE.Vector3().lerpVectors(al.pos, aim.clone().add(V(0, 0, 0.25)), e), new THREE.Vector3().lerpVectors(al.target, aim.clone().add(V(0, 0, -4)), e), lerp(30, 44, e), 0);
}

/** Stop-and-go travel along orbit 4 through the tunnel; horizon banks with the orbit plane. */
function processAngle(f: number) {
  const keys: Array<[number, number]> = [[SCENES.process.from, CHECKPOINT_ANGLES[0] - 0.75]];
  K.checkpoints.forEach((cp, i) => { keys.push([cp - 26, keys[keys.length - 1][1]]); keys.push([cp, CHECKPOINT_ANGLES[i] - 0.3]); });
  keys.push([SCENES.process.from + SCENES.process.dur, CHECKPOINT_ANGLES[3] - 0.1]);
  return keyframes(f, keys, ease.inOutQuint);
}
function processShot(f: number): Cam {
  const i = 3, a = processAngle(f), q = orbitQuat(i, f), n = V(0, 0, 1).applyQuaternion(q);
  const R = ORBITS[i].r;
  const pos = orbitWorldPoint(i, a, f, R + 0.55).add(n.clone().multiplyScalar(0.55));
  const tgt = orbitWorldPoint(i, a + 0.42, f, R - 0.25).add(n.clone().multiplyScalar(0.05));
  return cam(pos, tgt, 42, 6 * Math.sin(f / 40), n);
}

/** Pillar framing: medium shot on planet i, slowly orbiting it; planet on the left or right third. */
function pillarShot(i: number, f: number): Cam {
  // Medium shot, elevated above the orbit plane. The planet is placed exactly on a third
  // (NDC x = ±0.42) at ~30% of frame height; type sits on the opposite third.
  const P = planetPosition(i, f), u = P.clone().normalize(), n = PLANE_NORMAL.clone();
  const t = new THREE.Vector3().crossVectors(n, u).normalize();
  const local = (f - K.pillar[i]) / K.pillarLen, side = i % 2 ? -1 : 1;
  const size = ORBITS[i].size, d = 12 * size;
  const az = lerp(-0.22, 0.22, local) * side; // slow orbital tracking around the planet
  const dir = n.clone().multiplyScalar(0.95).add(u.clone().multiplyScalar(Math.cos(az) * 0.8)).add(t.clone().multiplyScalar(Math.sin(az) * 0.8)).normalize();
  const pos = P.clone().add(dir.multiplyScalar(d));
  const fwd = P.clone().sub(pos).normalize();
  const right = new THREE.Vector3().crossVectors(fwd, n).normalize();
  const tgt = P.clone().add(right.multiplyScalar(side * 0.2 * d));
  return cam(pos, tgt, 30, side * 2, n);
}
function pillars(f: number): Cam {
  let i = 0; K.pillar.forEach((p, j) => { if (f >= p) i = j; });
  const next = K.pillar[i + 1];
  const a = pillarShot(i, f);
  if (next === undefined || f < next - K.slingshot) return a;
  // ORBITAL SLINGSHOT: curve around the planet and whip to the next framing
  const e = ease.inOutExpo(prog(f, next - K.slingshot, next));
  const b = pillarShot(i + 1, next);
  const swing = Math.sin(Math.PI * e) * 2.2;
  const pos = new THREE.Vector3().lerpVectors(a.pos, b.pos, e).add(PLANE_NORMAL.clone().multiplyScalar(swing));
  return cam(pos, new THREE.Vector3().lerpVectors(a.target, b.target, e), lerp(a.fov, b.fov, e) + Math.sin(Math.PI * e) * 10, lerp(a.roll, b.roll, e), b.up);
}

function promise(f: number): Cam {
  if (f < K.promise[0]) return pillars(f);
  if (f < K.promise[1]) { const u = prog(f, K.promise[0], K.promise[1]); return cam(V(lerp(5.2, 3.8, u), lerp(-2.6, -2.2, u), lerp(7.5, 8.4, u)), V(-1.4, -2.6, 0), 30, -8); }
  if (f < K.promise[2]) { const u = prog(f, K.promise[1], K.promise[2]); return cam(V(lerp(-6.5, -5, u), 4.2, 11), V(3.2, 3.4, 0), 30, 6); }
  if (f < K.promiseStack[0]) { const u = prog(f, K.promise[2], K.promiseStack[0]); return cam(PLANE_NORMAL.clone().multiplyScalar(24).add(V(0.01, 0, 0)), V(0, 0, 0), 34, 20 + u * 25); }
  if (f < K.promisePull[0]) { const u = prog(f, K.promiseStack[0], K.promisePull[0]); const a = lerp(0.3, 0.6, u); return cam(V(Math.sin(a) * 16, 4, Math.cos(a) * 16), V(0, 0, 0), 30, 0); }
  const g = ease.inExpo(prog(f, K.promisePull[0], K.promisePull[1]));
  return cam(new THREE.Vector3().lerpVectors(V(Math.sin(0.6) * 16, 4, Math.cos(0.6) * 16), V(0.3, 0.25, 2.6), g), V(0, 0, 0), lerp(30, 34, g), g * 20);
}

function final(f: number): Cam {
  const al = alignedCamera(FINAL_LOGO.r, FINAL_LOGO.cy);
  if (f < K.pullback[1]) {
    // GREAT PULLBACK: from the core to the whole galaxy
    const e = ease.outExpo(prog(f, K.pullback[0], K.pullback[1]));
    return cam(path(f, K.pullback[0], K.pullback[1], [V(0.3, 0.25, 2.6), V(2.5, 4, 10), V(6, 13, 30), V(5, 15, 36)], ease.outExpo), V(0, 0, 0), lerp(34, 32, e), lerp(20, -6, e));
  }
  if (f < K.align[1]) {
    // find the brand alignment
    const e = ease.inOutQuint(prog(f, K.pullback[1], K.align[1]));
    const p = path(f, K.pullback[1], K.align[1], [V(5, 15, 36), V(3, 6, 30), al.pos], ease.inOutQuint);
    return cam(p, new THREE.Vector3().lerpVectors(V(0, 0, 0), al.target, e), lerp(32, 30, e), lerp(-6, 0, e));
  }
  return al;
}

export function cameraAt(f: number): Cam {
  if (f < SCENES.chaos.from) return signal(f);
  if (f < SCENES.center.from) return chaos(f);
  if (f < SCENES.reveal.from) return center(f);
  if (f < SCENES.process.from) return reveal(f);
  if (f < SCENES.pillars.from) return processShot(f);
  if (f < K.lens[0]) return pillars(f);
  if (f < SCENES.final.from) return promise(f);
  return final(f);
}

/** Camera velocity (world units / frame) — drives speed streaks and motion audio. */
export const cameraSpeed = (f: number) => (f <= 0 ? 0 : cameraAt(f).pos.distanceTo(cameraAt(f - 1).pos));

/** Project a world point to composition pixels with the camera at frame f. */
export function projectAt(f: number, p: THREE.Vector3) {
  const c = cameraAt(f);
  const pc = new THREE.PerspectiveCamera(c.fov, WIDTH / HEIGHT, 0.05, 400);
  applyCam(pc, c);
  const v = p.clone().project(pc);
  return { x: (v.x + 1) * WIDTH / 2, y: (1 - v.y) * HEIGHT / 2, visible: v.z < 1 && v.z > -1 };
}
export function applyCam(pc: THREE.PerspectiveCamera, c: Cam) {
  pc.position.copy(c.pos);
  pc.up.copy(c.up);
  pc.lookAt(c.target);
  pc.rotateZ((c.roll * Math.PI) / 180);
  pc.fov = c.fov;
  pc.updateProjectionMatrix();
  pc.updateMatrixWorld(true);
}
export { planeQuat };
