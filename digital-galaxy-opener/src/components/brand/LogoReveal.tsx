import React, { useId } from 'react';
import { COLORS, alpha } from '../../brand/tokens';
import { HOLE, OUTER, RING_PATH, STAR_PATH, STAR_STROKE, logoTransform } from '../../brand/logoGeometry';
import { clamp, ease } from '../../lib/easing';
import { BrandLogo } from './BrandLogo';

/**
 * Builds the original mark around its star:
 *  draw  0→1 : outer circle + tilted inner ellipse are traced as orbit lines
 *  sweep 0→1 : the ring fills with an orbital (radar) sweep
 * At draw = sweep = 1 the component renders the exact original paths.
 */
export const LogoReveal: React.FC<{ x: number; y: number; r: number; draw: number; sweep: number; color?: string; starOpacity?: number }> = ({
  x, y, r, draw, sweep, color = COLORS.white, starOpacity = 1,
}) => {
  const id = useId().replace(/:/g, '');
  if (draw >= 1 && sweep >= 1) return <BrandLogo x={x} y={y} r={r} color={color} />;
  const t = logoTransform(x, y, r);
  const d = ease.inOutCubic(clamp(draw)), sw = ease.inOutCubic(clamp(sweep));
  // sweep wedge in logo units, rotating clockwise from the ring's 45° axis
  const a0 = (-135 * Math.PI) / 180, a1 = a0 + sw * Math.PI * 2;
  const pts: string[] = [`${OUTER.cx},${OUTER.cy}`];
  for (let i = 0; i <= 64; i++) { const a = a0 + ((a1 - a0) * i) / 64; pts.push(`${OUTER.cx + Math.cos(a) * 400},${OUTER.cy + Math.sin(a) * 400}`); }
  const lw = 3 / t.s;
  return (
    <g transform={t.attr}>
      <defs>
        <clipPath id={`lw${id}`}><polygon points={pts.join(' ')} /></clipPath>
      </defs>
      {/* traced construction lines */}
      <circle cx={OUTER.cx} cy={OUTER.cy} r={OUTER.r} fill="none" stroke={alpha(COLORS.lilac, 1 - sw * 0.9)} strokeWidth={lw}
        pathLength={1000} strokeDasharray={`${d * 1000} 1000`} transform={`rotate(-135 ${OUTER.cx} ${OUTER.cy})`} />
      <ellipse cx={HOLE.cx} cy={HOLE.cy} rx={HOLE.rx} ry={HOLE.ry} fill="none" stroke={alpha(COLORS.violet, 1 - sw * 0.9)} strokeWidth={lw * 1.4}
        pathLength={1000} strokeDasharray={`${d * 1000} 1000`} transform={`rotate(${HOLE.rot} ${HOLE.cx} ${HOLE.cy})`} />
      {sw > 0 && (
        <g clipPath={`url(#lw${id})`}>
          <path d={RING_PATH} fillRule="evenodd" fill={color} />
        </g>
      )}
      <path d={STAR_PATH} fill={color} stroke={color} strokeWidth={STAR_STROKE} strokeLinejoin="round" opacity={starOpacity} />
    </g>
  );
};
