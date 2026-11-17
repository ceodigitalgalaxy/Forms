import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, THEMES, alpha } from '../brand/tokens';
import { REVEAL, SCENES } from '../timeline/timeline';
import { ease, lerp, prog } from '../lib/easing';
import { brandCamera } from '../lib/projection';
import { fitSize, measureLine } from '../lib/text-layout';
import { SpaceBackground } from '../components/fx/Background';
import { Stage } from '../components/fx/Stage';
import { Dust } from '../components/fx/Dust';
import { Hud } from '../components/fx/Hud';
import { OrbitalSystem } from '../components/brand/OrbitalSystem';
import { LogoReveal } from '../components/brand/LogoReveal';
import { StarPulse } from '../components/brand/StarPulse';
import { OrbitalRing } from '../components/brand/OrbitalRing';
import { KineticText } from '../components/type/KineticText';
import { Mono } from '../components/type/Mono';
import { STAR_ARM } from './S01Signal';

export const REVEAL_R = 380; // logo outer radius — its star equals STAR_ARM
const WORD = 'DIGITAL GALAXY';
const SUB = 'Estratégia e execução no mesmo lugar.';

/** 10–13s LOGO REVEAL — the tilted ring forms around the star; the system locks into orbit. */
export const S04LogoReveal: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + SCENES.reveal.from;
  const lift = ease.inOutQuint(prog(f, REVEAL.lift[0], REVEAL.lift[1]));
  const ly = lerp(1080, 800, lift);
  const draw = prog(f, REVEAL.ring[0], REVEAL.ring[1] - 6);
  const sweep = prog(f, REVEAL.hole[0] + 8, REVEAL.hole[1]);
  const zoom = lerp(1.25, 0.8, ease.outQuart(prog(f, 0, 100)));
  const cam = brandCamera(1920, ly, 14000, zoom, 45 + f * 0.03);

  const ws = fitSize(WORD, 3000, 280);
  const wm = measureLine(WORD, ws);
  const wy = ly + REVEAL_R + 110 + wm.ascent;
  const ss = fitSize(SUB, 2600, 92, 500, 'Inter', -0.01);
  const sy = wy + 70 + measureLine(SUB, ss, 500, 'Inter', -0.01).ascent;

  return (
    <>
      <SpaceBackground glow={0.32} gy={(ly / 2160) * 100} />
      <Stage>
        <Dust frame={g} dy={-g * 2} opacity={0.7} />
        {[0, 8, 16].map((d) => {
          const p = prog(f, d, d + 46);
          if (p <= 0 || p >= 1) return null;
          return <OrbitalRing key={d} cx={1920} cy={1080} r={lerp(REVEAL_R, 3400, ease.outCubic(p))} color={COLORS.violet} width={10 * (1 - p) + 2} opacity={1 - p} />;
        })}
        <OrbitalSystem
          frame={g}
          cam={cam}
          draw={(i) => ease.inOutCubic(prog(f, REVEAL.planets[0] - 14 + i * 5, REVEAL.planets[0] + 26 + i * 5))}
          planetReach={(i) => ease.outBack(prog(f, REVEAL.planets[0] + i * 4, REVEAL.planets[0] + 30 + i * 4), 1.6)}
          orbitOpacity={0.6}
          trails={1}
          centerAbove
          center={
            <g>
              <circle cx={1920} cy={ly} r={REVEAL_R * 2.8} fill="url(#revealHalo)" />
              <defs>
                <radialGradient id="revealHalo">
                  <stop offset="0.3" stopColor={alpha(COLORS.violet, 0.5)} />
                  <stop offset="1" stopColor={alpha(COLORS.violet, 0)} />
                </radialGradient>
              </defs>
              <StarPulse x={1920} y={ly} arm={STAR_ARM} t={f} dur={50} strength={1.3} />
              <LogoReveal x={1920} y={ly} r={REVEAL_R} draw={draw} sweep={sweep} />
            </g>
          }
        />
        {f > REVEAL.lift[1] - 6 && (
          <g opacity={prog(f, REVEAL.lift[1] - 6, REVEAL.lift[1] + 4)}>
            <path d={`M${1920 + 300} ${ly - 300}L${2560} ${ly - 560}H${3000}`} stroke={COLORS.lilac} strokeWidth={4} fill="none" />
            <Mono x={2580} y={ly - 590} color={COLORS.lilac} size={36}>CORE.01 — ONLINE</Mono>
            <Mono x={2580} y={ly - 510} color={COLORS.white} size={30} weight={500}>SUA MARCA · 0.0.0</Mono>
          </g>
        )}
        <KineticText id="s4-word" text={WORD} x={1920} y={wy} size={ws} color={COLORS.white} accent={{ from: 8, color: COLORS.lilac }} frame={f} start={REVEAL.word[0]} stagger={1.6} dur={14} mode="rise" seed={40} />
        <KineticText id="s4-sub" text={SUB} x={1920} y={sy} size={ss} weight={500} tracking={-0.01} color={COLORS.white} frame={f} start={REVEAL.sub} stagger={0.5} dur={12} mode="rise" stepWeights={false} seed={42} />
        <Hud frame={g} theme={THEMES.space} scene="SC 04/08" sub="CORE: LOCKED" />
      </Stage>
      {f < 10 && <AbsoluteFill style={{ backgroundColor: COLORS.lilac, opacity: 0.85 * (1 - f / 10) }} />}
    </>
  );
};
