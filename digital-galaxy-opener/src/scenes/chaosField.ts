// Disconnected "chaos" elements shared by CHAOS (moving) and THE CENTER (frozen, then attracted).
import { rnd, rndRange } from '../lib/random';
import { PLANETS, type PlanetKind } from '../components/brand/OrbitalSystem';

export const FREEZE_FRAME = 239; // last chaos frame (local)

export const ARCS = Array.from({ length: 12 }, (_, i) => ({
  cx: rndRange(i * 17 + 1, 260, 3580), cy: rndRange(i * 17 + 2, 240, 1920), r: rndRange(i * 17 + 3, 160, 560),
  rot: rndRange(i * 17 + 4, 0, 360), span: rndRange(i * 17 + 5, 0.12, 0.38), speed: (rnd(i * 17 + 6) < 0.5 ? -1 : 1) * rndRange(i * 17 + 7, 14, 42),
  width: rndRange(i * 17 + 8, 4, 9), aspect: rndRange(i * 17 + 9, 0.35, 0.9),
}));

export const BODIES = Array.from({ length: 10 }, (_, i) => {
  const ex = rndRange(i * 29 + 1, 420, 3420), ey = rndRange(i * 29 + 2, 360, 1800);
  const a = rnd(i * 29 + 3) * Math.PI * 2, sp = rndRange(i * 29 + 4, 70, 230);
  return { ex, ey, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, kind: PLANETS[i % 5].kind as PlanetKind, size: rndRange(i * 29 + 5, 24, 58), tagged: i < 3 };
});

/** Position of body i at chaos-local frame f (clamped to the freeze frame). */
export function bodyPos(i: number, f: number) {
  const b = BODIES[i], t = (Math.min(f, FREEZE_FRAME) - FREEZE_FRAME) / 60;
  return { x: b.ex + b.vx * t + 18 * Math.sin(f / 37 + i), y: b.ey + b.vy * t + 18 * Math.cos(f / 29 + i * 2) };
}
export const arcAngle = (i: number, f: number) => ARCS[i].rot + (ARCS[i].speed * Math.min(f, FREEZE_FRAME)) / 60;
