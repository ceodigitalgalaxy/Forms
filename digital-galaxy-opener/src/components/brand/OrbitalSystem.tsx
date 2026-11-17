import React, { useId } from 'react';
import { COLORS, alpha } from '../../brand/tokens';
import { makeProjector, orbitPoint, type Camera, type V3 } from '../../lib/projection';
import { FPS } from '../../timeline/timeline';
import { BrandStar } from './BrandStar';

/** The five service planets. Radii in world units (brand view: 1 unit ≈ 1px at the core). */
export const PLANETS = [
  { r: 640, size: 40, kind: 'lilac', phase: 0.4, speed: 0.62 },
  { r: 860, size: 56, kind: 'white', phase: 2.5, speed: 0.48 },
  { r: 1080, size: 70, kind: 'ringed', phase: 4.4, speed: 0.38 },
  { r: 1300, size: 48, kind: 'outline', phase: 1.3, speed: 0.31 },
  { r: 1520, size: 60, kind: 'star', phase: 3.5, speed: 0.26 },
] as const;
export type PlanetKind = (typeof PLANETS)[number]['kind'];

/** Angle of planet i at global frame f (continuous across every scene). */
export const planetAngle = (i: number, f: number, extraSpin = 0) => PLANETS[i].phase + PLANETS[i].speed * (f / FPS + extraSpin * (1 + i * 0.12));

export const Planet: React.FC<{ x: number; y: number; r: number; kind: PlanetKind; glow?: number; color?: string; dark?: boolean }> = ({
  x, y, r, kind, glow = 1, color, dark = true,
}) => {
  const id = useId().replace(/:/g, '');
  const main = color ?? (kind === 'white' ? COLORS.white : kind === 'star' ? COLORS.white : COLORS.lilac);
  return (
    <g>
      {dark && glow > 0 && (
        <>
          <defs>
            <radialGradient id={`pg${id}`}>
              <stop offset="0.3" stopColor={alpha(COLORS.violet, 0.6 * glow)} />
              <stop offset="1" stopColor={alpha(COLORS.violet, 0)} />
            </radialGradient>
          </defs>
          <circle cx={x} cy={y} r={r * 3.4} fill={`url(#pg${id})`} />
        </>
      )}
      {kind === 'outline' ? (
        <>
          <circle cx={x} cy={y} r={r * 0.9} fill="none" stroke={main} strokeWidth={r * 0.2} />
          <circle cx={x} cy={y} r={r * 0.32} fill={main} />
        </>
      ) : kind === 'star' ? (
        <BrandStar x={x} y={y} arm={r * 1.25} color={main} />
      ) : (
        <circle cx={x} cy={y} r={r} fill={main} />
      )}
      {kind === 'ringed' && (
        <ellipse cx={x} cy={y} rx={r * 1.9} ry={r * 1.9 * 0.659} transform={`rotate(45 ${x} ${y})`} fill="none" stroke={color ?? COLORS.white} strokeWidth={r * 0.1} />
      )}
    </g>
  );
};

export type OrbitalSystemProps = {
  frame: number; // global frame
  cam: Camera;
  /** 0..1 per orbit: how much of the orbit line is drawn. */
  draw?: (i: number) => number;
  /** 0..1 per planet: radial position factor (0 = at the core). */
  planetReach?: (i: number) => number;
  planetOpacity?: number;
  orbitOpacity?: number;
  /** Shrinks every orbit toward `convergeTo` (world units). */
  converge?: number;
  convergeTo?: number;
  extraSpin?: number;
  trails?: number;
  highlight?: number;
  center?: React.ReactNode;
  overlay?: (proj: ReturnType<typeof makeProjector>) => React.ReactNode;
  lineWidth?: number;
  /** Draw the centre above the front orbit lines (hero logo never crossed by lines). */
  centerAbove?: boolean;
};

/** True-perspective orbital system; draws back half → core → front half for correct depth. */
export const OrbitalSystem: React.FC<OrbitalSystemProps> = (p) => {
  const proj = makeProjector(p.cam);
  const zRef = proj([0, 0, 0]).z;
  const conv = p.converge ?? 0;
  const lw = p.lineWidth ?? 3.2;
  const back: React.ReactNode[] = [], front: React.ReactNode[] = [];
  const bodies: Array<{ z: number; node: React.ReactNode; front: boolean }> = [];

  PLANETS.forEach((pl, i) => {
    const R = pl.r + ((p.convergeTo ?? 0) - pl.r) * conv;
    const drawP = p.draw ? p.draw(i) : 1;
    if (drawP > 0) {
      const N = 220, a0 = -Math.PI / 2 - i * 0.7;
      const runs: { pts: string[]; front: boolean }[] = [];
      for (let k = 0; k <= Math.round(N * drawP); k++) {
        const th = a0 + (k / N) * Math.PI * 2;
        const q = proj(orbitPoint(R, th));
        const isFront = q.z < zRef;
        if (!runs.length || runs[runs.length - 1].front !== isFront) {
          const prev = runs.length ? runs[runs.length - 1].pts[runs[runs.length - 1].pts.length - 1] : null;
          runs.push({ pts: prev ? [prev] : [], front: isFront });
        }
        runs[runs.length - 1].pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
      }
      const hl = p.highlight === i;
      runs.forEach((r, k) => {
        const el = (
          <polyline key={`o${i}-${k}`} points={r.pts.join(' ')} fill="none"
            stroke={hl ? COLORS.lilac : COLORS.violet}
            strokeOpacity={(p.orbitOpacity ?? 0.9) * (r.front ? 1 : 0.55)}
            strokeWidth={(hl ? lw * 1.8 : lw) * (r.front ? 1 : 0.8)} strokeLinejoin="round" />
        );
        (r.front ? front : back).push(el);
      });
    }
    const reach = p.planetReach ? p.planetReach(i) : 1;
    if (reach <= 0 || (p.planetOpacity ?? 1) <= 0) return;
    const th = planetAngle(i, p.frame, p.extraSpin ?? 0);
    const pos: V3 = orbitPoint(R * reach, th);
    const q = proj(pos);
    const trailNodes: React.ReactNode[] = [];
    if ((p.trails ?? 0) > 0 && reach >= 0.999) {
      const n = 16;
      for (let k = 1; k <= n; k++) {
        const a = proj(orbitPoint(R, th - k * 0.045)), b = proj(orbitPoint(R, th - (k - 1) * 0.045));
        trailNodes.push(
          <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={COLORS.lilac} strokeLinecap="round"
            strokeOpacity={0.55 * (1 - k / n) * (p.trails ?? 0)} strokeWidth={Math.max(2, pl.size * q.s * 0.5 * (1 - k / n))} />,
        );
      }
    }
    bodies.push({
      z: q.z,
      front: q.z < zRef,
      node: (
        <g key={`p${i}`} opacity={p.planetOpacity ?? 1}>
          {trailNodes}
          <Planet x={q.x} y={q.y} r={pl.size * q.s} kind={pl.kind} />
        </g>
      ),
    });
  });
  bodies.sort((a, b) => b.z - a.z);
  return (
    <g>
      {back}
      {bodies.filter((b) => !b.front).map((b) => b.node)}
      {!p.centerAbove && p.center}
      {front}
      {p.centerAbove && p.center}
      {bodies.filter((b) => b.front).map((b) => b.node)}
      {p.overlay?.(proj)}
    </g>
  );
};
