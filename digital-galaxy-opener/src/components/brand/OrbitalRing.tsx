import React from 'react';
import { COLORS } from '../../brand/tokens';
import { ORBIT_ANGLE, ORBIT_ASPECT } from '../../brand/logoGeometry';

/** Flat orbit drawn in the logo's tilted-ring language (aspect 0.659, 45°). */
export const OrbitalRing: React.FC<{
  cx: number; cy: number; r: number; progress?: number; aspect?: number; angle?: number;
  color?: string; width?: number; opacity?: number; dash?: [number, number]; dashOffset?: number; start?: number;
}> = ({ cx, cy, r, progress = 1, aspect = ORBIT_ASPECT, angle = ORBIT_ANGLE, color = COLORS.violet, width = 4, opacity = 1, dash, dashOffset = 0, start = 0 }) => {
  if (progress <= 0) return null;
  const da = dash ? `${dash[0]} ${dash[1]}` : `${progress * 1000} 1000`;
  return (
    <ellipse
      cx={cx} cy={cy} rx={r} ry={r * aspect}
      transform={`rotate(${angle + start} ${cx} ${cy})`}
      fill="none" stroke={color} strokeWidth={width} opacity={opacity}
      pathLength={dash ? undefined : 1000} strokeDasharray={da} strokeDashoffset={dashOffset} strokeLinecap="round"
    />
  );
};
