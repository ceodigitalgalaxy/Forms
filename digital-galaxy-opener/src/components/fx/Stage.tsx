import React from 'react';
import { AbsoluteFill } from 'remotion';
import { WIDTH, HEIGHT } from '../../timeline/timeline';

/** Full-frame SVG layer in composition pixels. */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={style}>
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      {children}
    </svg>
  </AbsoluteFill>
);
