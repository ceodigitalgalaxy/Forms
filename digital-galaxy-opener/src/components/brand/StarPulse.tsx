import React from 'react';
import { COLORS } from '../../brand/tokens';
import { clamp, ease } from '../../lib/easing';
import { BrandStar } from './BrandStar';
import { OrbitalRing } from './OrbitalRing';

/** Energy pulse emitted by the star: expanding star outlines + a tilted shock ring. t = frames since pulse. */
export const StarPulse: React.FC<{ x: number; y: number; arm: number; t: number; dur?: number; strength?: number; color?: string }> = ({
  x, y, arm, t, dur = 40, strength = 1, color = COLORS.lilac,
}) => {
  if (t < 0 || t > dur) return null;
  const p = clamp(t / dur), e = ease.outCubic(p);
  return (
    <g>
      <BrandStar x={x} y={y} arm={arm * (1 + e * 3.2)} color={color} outline={5} opacity={(1 - p) * 0.9 * strength} />
      <BrandStar x={x} y={y} arm={arm * (1 + e * 1.6)} color={color} outline={3} opacity={(1 - p) * 0.6 * strength} />
      <OrbitalRing cx={x} cy={y} r={arm * (1.2 + e * 9)} color={COLORS.violet} width={6 * (1 - p) + 1} opacity={(1 - p) * strength} />
    </g>
  );
};
