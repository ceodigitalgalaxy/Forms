import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';

/** Subtle film grain: 4 pre-baked noise plates, switched every 2 frames (deterministic). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.075 }) => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2) % 4;
  return (
    <AbsoluteFill style={{ mixBlendMode: 'overlay', opacity, pointerEvents: 'none' }}>
      {[0, 1, 2, 3].map((i) => (
        <Img key={i} src={staticFile(`textures/grain-${i}.png`)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: i === k ? 1 : 0, imageRendering: 'pixelated' }} />
      ))}
    </AbsoluteFill>
  );
};
