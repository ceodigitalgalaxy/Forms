// ============================================================================
// COSMIC GRAVITY — transition library (2D halves; 3D halves live in world/).
//   A GRAVITY PULL        world/worldState (contraction) + camera push
//   B ORBITAL WIPE        camera dives through the 3D logo ring (cameraRig.reveal)
//   C STAR IMPULSE        <StarImpulse/> here + energy wave in the galaxy shader
//   D GRAVITATIONAL LENS  lensAt() bends type + <LensRing/>
//   E ORBITAL SLINGSHOT   cameraRig.pillars (curve around the planet + streaks)
//   F COSMIC COMPRESSION  compressionTransform() squeezes the frame to a line
//   G STELLAR ALIGNMENT   worldState.misalignment + <AlignmentTicks/>
// Every transition is born from the star or the logo's tilted ring.
// ============================================================================
import React from 'react';
import { AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { COLORS, alpha } from '../brand/tokens';
import { AV_EVENTS, K, WIDTH, HEIGHT } from '../timeline/timeline';
import { clamp, ease, prog } from '../lib/easing';
import { projectAt } from '../world/cameraRig';
import { BrandStar } from '../components/brand/BrandStar';
import { OrbitalRing } from '../components/brand/OrbitalRing';

/** Screen position of the star (gravity centre) at frame f. */
export const starOnScreen = (f: number): [number, number] => {
  const p = projectAt(f, new THREE.Vector3(0, 0, 0));
  return [p.x, p.y];
};

/** F — COSMIC COMPRESSION: squeeze to an energy line, then expand into the next scene. */
export function compressionTransform(f: number) {
  const [a, b] = K.compress;
  const squeeze = ease.inExpo(prog(f, a, b));
  const open = ease.outExpo(prog(f, b, b + 12));
  const sy = f < b ? Math.max(0.002, 1 - squeeze) : Math.max(0.002, open);
  const sx = f < b ? 1 + squeeze * 0.15 : 1.15 - 0.15 * open;
  const line = f < b ? squeeze : 1 - open;
  return { transform: `scale(${sx}, ${sy})`, line: clamp(line) };
}
export const EnergyLine: React.FC<{ k: number }> = ({ k }) =>
  k <= 0.02 ? null : (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: HEIGHT / 2 - 3, height: 6, background: COLORS.white, opacity: k, boxShadow: `0 0 40px 12px ${alpha(COLORS.violet, 0.8 * k)}` }} />
    </AbsoluteFill>
  );

/** C — STAR IMPULSE: a shock of brand-star outlines and tilted rings from the star. */
const IMPULSES = AV_EVENTS.filter((e) => e.motion === 'expansion' || (e.motion === 'stellarPulse' && e.intensity >= 0.7) || e.motion === 'logoLock');
export const StarImpulse: React.FC<{ f: number }> = ({ f }) => {
  const [x, y] = starOnScreen(f);
  return (
    <g>
      {IMPULSES.map((e) => {
        const d = f - e.frame, dur = 46;
        if (d < 0 || d > dur) return null;
        const p = d / dur, k = ease.outCubic(p), I = Math.min(1.4, e.intensity);
        return (
          <g key={e.id} opacity={(1 - p) * Math.min(1, I)}>
            <BrandStar x={x} y={y} arm={120 + k * 1400 * I} color={COLORS.lilac} outline={6} />
            <OrbitalRing cx={x} cy={y} r={150 + k * 2600 * I} color={COLORS.violet} width={10 * (1 - p) + 2} />
            <OrbitalRing cx={x} cy={y} r={100 + k * 1700 * I} color={COLORS.lilac} width={4} />
          </g>
        );
      })}
    </g>
  );
};
/** Flash of light on the monumental impulses (kept short and brand-coloured). */
export const impulseFlash = (f: number) => {
  let a = 0;
  for (const e of IMPULSES) { const d = f - e.frame; if (d >= 0 && d < 12 && e.intensity >= 1.2) a = Math.max(a, (1 - d / 12) * 0.4); }
  return a;
};

/** D — GRAVITATIONAL LENS strength around the lens transition. */
export function lensAt(f: number) {
  const [a, b] = K.lens;
  const up = ease.inCubic(prog(f, a, b)), down = 1 - ease.outCubic(prog(f, b, b + 18));
  return f < b ? up : down;
}
export const LensRing: React.FC<{ f: number }> = ({ f }) => {
  const s = lensAt(f);
  if (s <= 0.01) return null;
  const [x, y] = starOnScreen(f);
  return (
    <g opacity={s}>
      {[0, 1, 2].map((k) => <OrbitalRing key={k} cx={x} cy={y} r={300 + k * 140 + s * 500} color={k === 1 ? COLORS.lilac : COLORS.violet} width={6 - k * 1.5} />)}
    </g>
  );
};

/** G — STELLAR ALIGNMENT: HUD ticks lighting in sequence as orbits lock. */
export const AlignmentTicks: React.FC<{ f: number; frames: number[]; x?: number; y?: number }> = ({ f, frames, x = WIDTH / 2, y = HEIGHT - 150 }) => (
  <g>
    {frames.map((t, i) => {
      const on = f >= t, k = on ? Math.exp(-(f - t) / 8) : 0;
      const cx = x + (i - (frames.length - 1) / 2) * 70;
      return <BrandStar key={i} x={cx} y={y} arm={14 + 10 * k} color={on ? COLORS.lilac : COLORS.white} opacity={on ? 1 : 0.3} />;
    })}
  </g>
);

/** Soft scrim of Deep Space Purple behind editorial type (legibility over the 3D). */
export const Scrim: React.FC<{ y0: number; y1: number; strength?: number }> = ({ y0, y1, strength = 0.6 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: y0, height: y1 - y0, background: `linear-gradient(180deg, ${alpha(COLORS.space, 0)} 0%, ${alpha(COLORS.space, strength)} 30%, ${alpha(COLORS.space, strength)} 70%, ${alpha(COLORS.space, 0)} 100%)` }} />
  </AbsoluteFill>
);
