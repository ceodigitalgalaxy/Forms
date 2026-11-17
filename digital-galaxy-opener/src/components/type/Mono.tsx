import React from 'react';
import { FONTS } from '../../brand/tokens';

/** Monospaced HUD / code label (decorative, small). */
export const Mono: React.FC<{
  x: number; y: number; children: React.ReactNode; size?: number; color: string;
  weight?: number; anchor?: 'start' | 'middle' | 'end'; spacing?: number; opacity?: number;
}> = ({ x, y, children, size = 34, color, weight = 700, anchor = 'start', spacing = 0.12, opacity = 1 }) => (
  <text x={x} y={y} textAnchor={anchor} fill={color} opacity={opacity}
    style={{ fontFamily: FONTS.mono, fontWeight: weight, fontSize: size, letterSpacing: `${spacing}em` }}>
    {children}
  </text>
);
