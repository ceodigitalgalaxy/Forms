import React, { useId } from 'react';
import { COLORS, alpha } from '../../brand/tokens';
import { BrandLogo } from './BrandLogo';

/** The brand at the centre of the system: halo + the original mark. */
export const GalaxyCore: React.FC<{ x: number; y: number; r: number; frame: number; intensity?: number; logoOpacity?: number }> = ({
  x, y, r, frame, intensity = 1, logoOpacity = 1,
}) => {
  const id = useId().replace(/:/g, '');
  const breathe = 1 + 0.04 * Math.sin(frame / 18);
  return (
    <g>
      <defs>
        <radialGradient id={`cg${id}`}>
          <stop offset="0.28" stopColor={alpha(COLORS.violet, 0.55 * intensity)} />
          <stop offset="0.55" stopColor={alpha(COLORS.violet, 0.16 * intensity)} />
          <stop offset="1" stopColor={alpha(COLORS.violet, 0)} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 3.1 * breathe} fill={`url(#cg${id})`} />
      <circle cx={x} cy={y} r={r * 1.2} fill="none" stroke={alpha(COLORS.lilac, 0.35 * intensity)} strokeWidth={r * 0.012}
        strokeDasharray={`${r * 0.03} ${r * 0.06}`} strokeDashoffset={-frame * r * 0.004} />
      <BrandLogo x={x} y={y} r={r} opacity={logoOpacity} />
    </g>
  );
};
