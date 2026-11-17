import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { COLORS } from './brand/tokens';
import { SCENES } from './timeline/timeline';
import { FontGate } from './components/fx/FontGate';
import { Grain } from './components/fx/Grain';
import { Stage } from './components/fx/Stage';
import { SAFE } from './lib/safe-area';
import { S01Signal } from './scenes/S01Signal';
import { S02Chaos } from './scenes/S02Chaos';
import { S03Center } from './scenes/S03Center';
import { S04LogoReveal } from './scenes/S04LogoReveal';
import { S05Process } from './scenes/S05Process';
import { S06Pillars } from './scenes/S06Pillars';
import { S07Promise } from './scenes/S07Promise';
import { S08FinalOrbit } from './scenes/S08FinalOrbit';

export type OpenerProps = { validate?: boolean; showSafeArea?: boolean; muted?: boolean };

const ORDER: Array<[keyof typeof SCENES, React.FC]> = [
  ['signal', S01Signal], ['chaos', S02Chaos], ['center', S03Center], ['reveal', S04LogoReveal],
  ['process', S05Process], ['pillars', S06Pillars], ['promise', S07Promise], ['final', S08FinalOrbit],
];

/** Digital Galaxy — "The Center of Everything". 3840×2160 · 60fps · 1800 frames. */
export const DigitalGalaxyOpener: React.FC<OpenerProps> = ({ showSafeArea, muted }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.space }}>
    <FontGate>
      {ORDER.map(([id, Scene]) => (
        <Sequence key={id} name={id} from={SCENES[id].from} durationInFrames={SCENES[id].dur}>
          <Scene />
        </Sequence>
      ))}
      <Grain />
      {showSafeArea && (
        <Stage>
          <rect x={SAFE.x0} y={SAFE.y0} width={SAFE.x1 - SAFE.x0} height={SAFE.y1 - SAFE.y0} fill="none" stroke={COLORS.lilac} strokeWidth={4} strokeDasharray="24 16" />
        </Stage>
      )}
    </FontGate>
    {!muted && <Audio src={staticFile('audio/score.wav')} />}
  </AbsoluteFill>
);
