import React, { useId } from 'react';
import { COLORS, alpha } from '../../brand/tokens';
import { STAR_PATH, STAR_STROKE, starTransform } from '../../brand/logoGeometry';

/** The logo's original four-point star. `arm` = centre→tip distance in px. */
export const BrandStar: React.FC<{ x: number; y: number; arm: number; color?: string; glow?: number; opacity?: number; outline?: number }> = ({
  x, y, arm, color = COLORS.white, glow = 0, opacity = 1, outline,
}) => {
  const id = useId().replace(/:/g, '');
  const t = starTransform(x, y, arm);
  return (
    <g opacity={opacity}>
      {glow > 0 && (
        <>
          <defs>
            <radialGradient id={`sg${id}`}>
              <stop offset="0" stopColor={alpha(COLORS.lilac, 0.75 * glow)} />
              <stop offset="0.25" stopColor={alpha(COLORS.violet, 0.45 * glow)} />
              <stop offset="1" stopColor={alpha(COLORS.violet, 0)} />
            </radialGradient>
          </defs>
          <circle cx={x} cy={y} r={arm * 4.2} fill={`url(#sg${id})`} />
        </>
      )}
      <g transform={t.attr}>
        {outline ? (
          <path d={STAR_PATH} fill="none" stroke={color} strokeWidth={outline / t.s} strokeLinejoin="round" />
        ) : (
          <path d={STAR_PATH} fill={color} stroke={color} strokeWidth={STAR_STROKE} strokeLinejoin="round" />
        )}
      </g>
    </g>
  );
};
