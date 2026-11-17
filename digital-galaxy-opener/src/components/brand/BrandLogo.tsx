import React from 'react';
import { COLORS } from '../../brand/tokens';
import { RING_PATH, STAR_PATH, STAR_STROKE, logoTransform } from '../../brand/logoGeometry';

/** The official Digital Galaxy mark, drawn from its original paths. r = outer-ring radius in px. */
export const BrandLogo: React.FC<{ x: number; y: number; r: number; color?: string; starColor?: string; opacity?: number }> = ({
  x, y, r, color = COLORS.white, starColor, opacity = 1,
}) => (
  <g transform={logoTransform(x, y, r).attr} opacity={opacity}>
    <path d={RING_PATH} fillRule="evenodd" fill={color} />
    <path d={STAR_PATH} fill={starColor ?? color} stroke={starColor ?? color} strokeWidth={STAR_STROKE} strokeLinejoin="round" />
  </g>
);
