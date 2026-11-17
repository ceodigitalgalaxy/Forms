import React, { useLayoutEffect } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCurrentFrame } from 'remotion';
import { HEIGHT, WIDTH } from '../timeline/timeline';
import { applyCam, cameraAt, type Cam } from './cameraRig';
import { galaxyCollapse, energyWave } from './worldState';
import { GalaxyParticles, useGalaxy } from './GalaxyParticles';
import { Universe } from './Universe';
import { K } from '../timeline/timeline';
import { lerp, prog } from '../lib/easing';

const CameraDriver: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  // applied during render AND layout so the frame Remotion captures is always in sync
  applyCam(camera, cam);
  useLayoutEffect(() => { applyCam(camera, cam); });
  return null;
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = cameraAt(f);
  const prev = cameraAt(Math.max(0, f - 1));
  const vel = cam.pos.clone().sub(prev.pos);
  const g = useGalaxy();
  const proj = (HEIGHT / 2) / Math.tan(((cam.fov / 2) * Math.PI) / 180);
  // ring hands over to the exact SVG mark while the camera is aligned
  const ringOpacity = 1;
  const diskBright = lerp(0.25, 1, prog(f, 20, 120)) * (f >= K.logoLock ? lerp(1, 0.55, prog(f, K.logoLock, K.logoLock + 40)) : 1);
  return (
    <>
      <CameraDriver cam={cam} />
      <fog attach="fog" args={['#13073B', 22, 90]} />
      <GalaxyParticles g={g} time={f / 60} collapse={galaxyCollapse(f)} wave={energyWave(f)} proj={proj} bright={diskBright} fieldBright={0.9} />
      <Universe f={f} cam={cam} vel={vel} ringOpacity={ringOpacity} />
    </>
  );
};

/** GALAXY ENVIRONMENT — the one continuous 3D universe behind every scene. */
export const GalaxyEnvironment: React.FC = () => (
  <ThreeCanvas width={WIDTH} height={HEIGHT} flat gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    camera={{ fov: 30, near: 0.05, far: 400, position: [0, 0, 30] }} style={{ position: 'absolute', inset: 0 }}>
    <Scene />
  </ThreeCanvas>
);
