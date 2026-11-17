import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SpaceBackground } from '../components/fx/Background';
import { GalaxyEnvironment } from '../world/GalaxyEnvironment';

/** 3D-only preview composition (no typography) for look-dev. */
export const Spike: React.FC = () => (
  <AbsoluteFill>
    <SpaceBackground glow={0.16} />
    <GalaxyEnvironment />
  </AbsoluteFill>
);
