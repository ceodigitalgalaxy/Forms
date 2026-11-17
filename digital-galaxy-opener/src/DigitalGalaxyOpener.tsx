import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { COLORS } from './brand/tokens';
import { SCENES } from './timeline/timeline';
import { FontGate } from './components/fx/FontGate';
import { Grain } from './components/fx/Grain';
import { Stage } from './components/fx/Stage';
import { SpaceBackground } from './components/fx/Background';
import { SAFE } from './lib/safe-area';
import { GalaxyEnvironment } from './world/GalaxyEnvironment';
import { EnergyLine, compressionTransform } from './motion/cosmic';
import { O1Signal, O2Chaos, O3Center, O4Reveal } from './scenes/Overlay1to4';
import { O5Process, O6Pillars, O7Promise, O8Final } from './scenes/Overlay5to8';

export type OpenerProps = { validate?: boolean; showSafeArea?: boolean; muted?: boolean };

const ORDER: Array<[keyof typeof SCENES, React.FC]> = [
  ['signal', O1Signal], ['chaos', O2Chaos], ['center', O3Center], ['reveal', O4Reveal],
  ['process', O5Process], ['pillars', O6Pillars], ['promise', O7Promise], ['final', O8Final],
];

/**
 * Digital Galaxy — "The Center of Everything". 3840×2160 · 60fps · 1800 frames.
 * Layers: deep-space base → ONE continuous 3D universe → editorial typography → grain.
 */
export const DigitalGalaxyOpener: React.FC<OpenerProps> = ({ showSafeArea, muted }) => {
  const f = useCurrentFrame();
  const comp = compressionTransform(f);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.space }}>
      <FontGate>
        <AbsoluteFill style={{ transform: comp.transform, transformOrigin: '50% 50%' }}>
          <SpaceBackground glow={0.16} vignette={0.5} />
          <GalaxyEnvironment />
          <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 90% at 50% 50%, rgba(9,3,30,0) 60%, rgba(9,3,30,0.55) 100%)' }} />
          {ORDER.map(([id, Scene]) => (
            <Sequence key={id} name={id} from={SCENES[id].from} durationInFrames={SCENES[id].dur}>
              <Scene />
            </Sequence>
          ))}
        </AbsoluteFill>
        <EnergyLine k={comp.line} />
        <Grain opacity={0.06} />
        {showSafeArea && (
          <Stage>
            <rect x={SAFE.x0} y={SAFE.y0} width={SAFE.x1 - SAFE.x0} height={SAFE.y1 - SAFE.y0} fill="none" stroke={COLORS.lilac} strokeWidth={4} strokeDasharray="24 16" />
          </Stage>
        )}
      </FontGate>
      {!muted && <Audio src={staticFile('audio/score.wav')} />}
    </AbsoluteFill>
  );
};
