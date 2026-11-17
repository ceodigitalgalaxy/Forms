import React from 'react';
import { COLORS, alpha } from '../../brand/tokens';
import { rnd } from '../../lib/random';
import { WIDTH, HEIGHT } from '../../timeline/timeline';

const P = Array.from({ length: 160 }, (_, i) => ({
  x: rnd(i * 3 + 1) * WIDTH, y: rnd(i * 3 + 2) * HEIGHT, r: 1.4 + rnd(i * 3 + 3) * 3.2,
  a: 0.1 + rnd(i * 5 + 9) * 0.45, f: 0.6 + rnd(i * 7 + 4) * 1.8, z: 0.25 + rnd(i * 11 + 2) * 1.1,
}));

/** Controlled particle field with parallax (dx, dy scaled by depth). */
export const Dust: React.FC<{ frame: number; dx?: number; dy?: number; opacity?: number; stretch?: number }> = ({ frame, dx = 0, dy = 0, opacity = 1, stretch = 0 }) => (
  <g>
    {P.map((p, i) => {
      const a = p.a * (0.55 + 0.45 * Math.sin(frame / 30 * p.f + i)) * opacity;
      const x = (((p.x + dx * p.z) % WIDTH) + WIDTH) % WIDTH, y = (((p.y + dy * p.z) % HEIGHT) + HEIGHT) % HEIGHT;
      return stretch > 0.5
        ? <rect key={i} x={x} y={y - p.r / 2} width={stretch * p.z} height={p.r * 0.8} fill={alpha(COLORS.lilac, a * 0.8)} />
        : <circle key={i} cx={x} cy={y} r={p.r} fill={alpha(COLORS.white, a)} />;
    })}
  </g>
);
