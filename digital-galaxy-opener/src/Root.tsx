import React from 'react';
import { Composition } from 'remotion';
import { DigitalGalaxyOpener, type OpenerProps } from './DigitalGalaxyOpener';
import { DURATION, FPS, HEIGHT, WIDTH } from './timeline/timeline';

export const Root: React.FC = () => (
  <Composition
    id="DigitalGalaxyOpener"
    component={DigitalGalaxyOpener}
    durationInFrames={DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ validate: false, showSafeArea: false, muted: false } satisfies OpenerProps}
  />
);
