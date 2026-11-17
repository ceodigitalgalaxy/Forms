import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, alpha } from '../../brand/tokens';

/** Deep-space base: flat #13073B, a soft violet atmosphere and a vignette (a darker tone of the same purple). */
export const SpaceBackground: React.FC<{ glow?: number; gx?: number; gy?: number; vignette?: number }> = ({ glow = 0.22, gx = 50, gy = 50, vignette = 0.6 }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.space }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 60% at ${gx}% ${gy}%, ${alpha(COLORS.violet, glow)} 0%, ${alpha(COLORS.violet, 0)} 70%)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 85% at 50% 50%, rgba(9,3,30,0) 55%, rgba(9,3,30,${vignette}) 100%)` }} />
  </AbsoluteFill>
);
