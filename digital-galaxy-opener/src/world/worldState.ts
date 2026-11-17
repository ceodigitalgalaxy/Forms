// ============================================================================
// WORLD STATE — one continuous universe. Every object's position/state is a
// pure function of the GLOBAL frame, so nothing pops between scenes.
// Units: world units. The logo's outer ring has radius R_LOGO.
// ============================================================================
import * as THREE from 'three';
import { HOLE, OUTER } from '../brand/logoGeometry';
import { AV_EVENTS, K } from '../timeline/timeline';
import { clamp, ease, lerp, prog } from '../lib/easing';
import { rnd, rndRange } from '../lib/random';

export const R_LOGO = 1.6;
export const LOGO_S = R_LOGO / OUTER.r; // logo units → world units
export const HOLE_R = HOLE.rx * LOGO_S; // 1.4248 — orbits converge to this radius

/** Orbit plane = the logo's tilted ring: circle tilted to aspect 0.659, rolled 45° on screen. */
export const PLANE_TILT = Math.acos(HOLE.ry / HOLE.rx); // 0.8517 rad
export const PLANE_ROLL = -Math.PI / 4;
export const planeQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(PLANE_TILT, 0, 0, 'XYZ')).premultiply(
  new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), PLANE_ROLL),
);
export const PLANE_NORMAL = new THREE.Vector3(0, 0, 1).applyQuaternion(planeQuat);
/** In-plane (x,y) → world. */
export const planeToWorld = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z).applyQuaternion(planeQuat);

// ---------------------------------------------------------------------------
// The five pillars (planets) and their orbits
// ---------------------------------------------------------------------------
export const PILLAR_NAMES = ['Estratégia', 'Marca', 'Conteúdo', 'Performance', 'Presença digital'];
// phases solved so no planet occludes the featured one during its pillar shot
// (min separation 0.95 rad) and orbit 4's planet stays off the process route.
export const ORBITS = [
  { r: 3.0, size: 0.34, phase: 0.362, speed: 0.55 },
  { r: 4.1, size: 0.42, phase: 3.421, speed: 0.44 },
  { r: 5.2, size: 0.5, phase: 2.314, speed: 0.36 },
  { r: 6.3, size: 0.4, phase: 2.488, speed: 0.3 },
  { r: 7.4, size: 0.46, phase: 2.433, speed: 0.25 },
];
/** Per-orbit misalignment axes (chaos) — orbits live in different planes until aligned. */
const MIS = ORBITS.map((_, i) => ({ ax: rndRange(i * 7 + 1, -0.9, 0.9), ay: rndRange(i * 7 + 2, -0.9, 0.9), az: rndRange(i * 7 + 3, -1.2, 1.2) }));

/** 0 = perfectly aligned to the logo plane, 1 = chaos. Subtle 0.16 "different planes" in between. */
export function misalignment(f: number) {
  if (f < K.chaosPhrases[0]) return 0.16;
  if (f < K.expansion) return 1;
  if (f < K.align[0]) return lerp(1, 0.16, ease.outExpo(prog(f, K.expansion, K.expansion + 70)));
  return 0.16 * (1 - ease.inOutQuint(prog(f, K.align[0], K.align[1] - 6)));
}
export function orbitQuat(i: number, f: number) {
  const m = misalignment(f), a = MIS[i];
  const extra = new THREE.Quaternion().setFromEuler(new THREE.Euler(a.ax * m, a.ay * m, a.az * m));
  return planeQuat.clone().multiply(extra);
}

/** Orbit radius factor: collapsed during contraction, expands with the star impulse, converges at the end. */
export function orbitRadius(i: number, f: number) {
  const R = ORBITS[i].r;
  const pull = ease.inExpo(prog(f, K.contraction[0] + 20 + (4 - i) * 0, K.contraction[1]));
  const expand = ease.outBack(prog(f, K.expansion + i * 3, K.expansion + 40 + i * 3), 1.4);
  const conv = ease.inOutQuint(prog(f, K.align[0] + i * 4, K.align[1] - 8 + i * 1.5));
  let r = R;
  if (f >= K.contraction[0] && f < K.expansion) r = R * (1 - pull * 0.98);
  else if (f >= K.expansion && f < K.expansion + 60) r = R * Math.max(0.02, expand);
  const promisePull = ease.inExpo(prog(f, K.promisePull[0], K.promisePull[1])) * (1 - ease.outExpo(prog(f, K.pullback[0], K.pullback[0] + 40)));
  r *= 1 - 0.75 * promisePull;
  return lerp(r, HOLE_R, conv);
}

/** Orbit line draw progress (orbits are "born" in depth during the signal). */
export const orbitDraw = (i: number, f: number) => (f >= K.expansion ? 1 : f >= K.chaosPhrases[0] ? 0.42 + 0.2 * rnd(i * 3 + 11) : ease.inOutCubic(prog(f, 34 + i * 12, 110 + i * 12)));

export const planetAngle = (i: number, f: number) => ORBITS[i].phase + ORBITS[i].speed * (f / 60) + 1.6 * ease.inOutCubic(prog(f, K.pullback[0], K.align[0]));

// ---------------------------------------------------------------------------
// Chaos debris: the five planets + fragments drift without direction
// ---------------------------------------------------------------------------
const DRIFT = Array.from({ length: 5 }, (_, i) => {
  const p = new THREE.Vector3(rndRange(i * 13 + 1, -8, 8), rndRange(i * 13 + 2, -3.5, 3.5), rndRange(i * 13 + 3, -6, 6));
  const v = new THREE.Vector3(rndRange(i * 13 + 4, -1, 1), rndRange(i * 13 + 5, -0.5, 0.5), rndRange(i * 13 + 6, -1, 1)).multiplyScalar(0.9);
  return { p, v };
});
export const FRAGMENTS = Array.from({ length: 12 }, (_, i) => ({
  p: new THREE.Vector3(rndRange(i * 17 + 1, -10, 10), rndRange(i * 17 + 2, -4, 4), rndRange(i * 17 + 3, -8, 6)),
  r: rndRange(i * 17 + 4, 0.8, 2.6),
  arc: rndRange(i * 17 + 5, 0.8, 2.2),
  rot: new THREE.Euler(rnd(i * 17 + 6) * 6.28, rnd(i * 17 + 7) * 6.28, rnd(i * 17 + 8) * 6.28),
  spin: rndRange(i * 17 + 9, -0.8, 0.8),
}));
const chaosT = (f: number) => (Math.min(f, K.freeze) - K.chaosPhrases[0]) / 60;
const driftPos = (i: number, f: number) => DRIFT[i].p.clone().addScaledVector(DRIFT[i].v, chaosT(f));

/** Gravitational lag: farther objects start falling later (depth = delay). */
const gravityPull = (dist: number, f: number) => ease.inExpo(prog(f, K.contraction[0] + 8 + dist * 4, K.contraction[1]));

/** World position of pillar planet i. */
export function planetPosition(i: number, f: number): THREE.Vector3 {
  const onOrbit = () => {
    const r = orbitRadius(i, f), a = planetAngle(i, f);
    return new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0).applyQuaternion(orbitQuat(i, f));
  };
  if (f < K.chaosPhrases[0]) return onOrbit();
  if (f < K.contraction[0]) return driftPos(i, f); // chaos + freeze (frozen at K.freeze)
  if (f < K.expansion) {
    const p = driftPos(i, K.freeze), d = p.length(), g = gravityPull(d, f);
    // curved fall: spiral around the plane normal while compressing
    const q = new THREE.Quaternion().setFromAxisAngle(PLANE_NORMAL, g * 2.4);
    return p.applyQuaternion(q).multiplyScalar(1 - g);
  }
  return onOrbit();
}
/** Scale factor of planet i (compressed during the fall, born again with the expansion). */
export function planetScale(i: number, f: number) {
  if (f >= K.contraction[0] && f < K.expansion) return Math.pow(1 - gravityPull(driftPos(i, K.freeze).length(), f), 1.5); // swallowed by the star
  if (f >= K.expansion && f < K.expansion + 50) return ease.outBack(prog(f, K.expansion + i * 3, K.expansion + 34 + i * 3), 1.8);
  const absorb = ease.inExpo(prog(f, K.align[1] - 16, K.logoLock));
  return 1 - absorb;
}
export function fragmentState(j: number, f: number) {
  const fr = FRAGMENTS[j];
  const t = chaosT(f);
  const rot = new THREE.Euler(fr.rot.x + fr.spin * t, fr.rot.y + fr.spin * 0.7 * t, fr.rot.z);
  let p = fr.p.clone(), s = 1, vis = f >= K.chaosPhrases[0] && f < K.expansion ? 1 : 0;
  if (f >= K.contraction[0]) { const g = gravityPull(p.length(), f); p = p.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(PLANE_NORMAL, g * 3)).multiplyScalar(1 - g); s = 1 - g; }
  return { p, rot, s, vis };
}

// ---------------------------------------------------------------------------
// The star, the logo ring, energy
// ---------------------------------------------------------------------------
const PULSES = AV_EVENTS.filter((e) => e.motion === 'stellarPulse' || e.motion === 'expansion' || e.motion === 'checkpoint' || e.motion === 'logoLock');
/** Star brightness 0..2 (pulses on every stellar event). */
export function starEnergy(f: number) {
  let e = 0;
  for (const p of PULSES) { const d = f - p.frame; if (d >= -2 && d < 40) e += p.intensity * Math.exp(-Math.max(0, d) / 9); }
  const charge = Math.pow(prog(f, K.contraction[0], K.contraction[1]), 3) * 1.6;
  return Math.min(2.4, e + charge);
}
/** Star scale: a point of light, then the star itself. */
export function starScale(f: number) {
  const born = lerp(0.06, 1, ease.outBack(prog(f, K.starReveal - 6, K.starReveal + 22), 1.6));
  return born * (1 + 0.08 * Math.min(1, starEnergy(f)));
}
/** Logo ring formation 0..1 (forms around the star with the star impulse). */
export const ringFormation = (f: number) => ease.outQuart(prog(f, K.expansion + 2, K.expansion + 44));

/** Galaxy particle collapse 0..1 (shader applies per-particle lag by radius). */
export function galaxyCollapse(f: number) {
  const a = ease.inExpo(prog(f, K.contraction[0], K.contraction[1]));
  const b = 1 - ease.outExpo(prog(f, K.expansion, K.expansion + 80));
  const c = 0.8 * ease.inExpo(prog(f, K.promisePull[0], K.promisePull[1])) * (1 - ease.outExpo(prog(f, K.pullback[0], K.pullback[0] + 70)));
  if (f < K.contraction[0]) return 0;
  if (f < K.expansion) return a;
  return Math.max(f < K.expansion + 80 ? b : 0, c);
}
/** Energy waves (STAR IMPULSE): radius & amplitude of the most recent wave. */
const WAVES = AV_EVENTS.filter((e) => (e.motion === 'stellarPulse' && e.intensity >= 0.7) || e.motion === 'expansion' || e.motion === 'lens' || e.motion === 'logoLock');
export function energyWave(f: number) {
  let best = { r: 0, a: 0 };
  for (const w of WAVES) {
    const d = f - w.frame; if (d < 0 || d > 70) continue;
    const r = 0.5 + ease.outCubic(d / 70) * 26 * Math.min(1.3, w.intensity), a = w.intensity * (1 - d / 70);
    if (a > best.a) best = { r, a };
  }
  return best;
}

/** Fly-through tunnel rings along orbit 4 (process scene). */
export const TUNNEL = Array.from({ length: 14 }, (_, k) => ({ angle: -2.15 + k * 0.17 }));
export const CHECKPOINT_ANGLES = [-1.85, -1.4, -0.95, -0.5];
export const orbitWorldPoint = (i: number, a: number, f: number, r = orbitRadius(i, f)) => new THREE.Vector3(r * Math.cos(a), r * Math.sin(a), 0).applyQuaternion(orbitQuat(i, f));
export const clamp01 = clamp;

/** 0..1 — how much the star's glare must step back so the logo (and type over it) reads crisply. */
export function logoCalm(f: number) {
  const reveal = prog(f, K.logoAligned - 14, K.logoAligned) * (1 - prog(f, K.orbitalWipe[0], K.orbitalWipe[0] + 6));
  const promise = 0.6 * prog(f, K.promise[0] - 4, K.promise[0]) * (1 - prog(f, K.promisePull[0], K.promisePull[0] + 10));
  const end = prog(f, K.align[1] - 20, K.logoLock);
  const pillars = 0.5 * prog(f, K.pillar[0], K.pillar[0] + 8) * (1 - prog(f, K.lens[0], K.lens[1]));
  return Math.max(reveal, promise, end, pillars);
}
