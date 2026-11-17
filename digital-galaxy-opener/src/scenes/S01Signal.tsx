import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, THEMES } from '../brand/tokens';
import { SCENES, SIGNAL } from '../timeline/timeline';
import { ease, lerp, prog } from '../lib/easing';
import { brandCamera } from '../lib/projection';
import { centeredBaseline, fitSizeAll, stackBaselines } from '../lib/text-layout';
import { SpaceBackground } from '../components/fx/Background';
import { Stage } from '../components/fx/Stage';
import { Dust } from '../components/fx/Dust';
import { Hud } from '../components/fx/Hud';
import { OrbitalSystem } from '../components/brand/OrbitalSystem';
import { BrandStar } from '../components/brand/BrandStar';
import { StarPulse } from '../components/brand/StarPulse';
import { KineticText, resolveSize } from '../components/type/KineticText';
import { Mono } from '../components/type/Mono';

export const STAR_ARM = 129; // matches the star of the 380px-radius logo in the reveal

const LINES = ['SUA MARCA', 'NO CENTRO', 'DO UNIVERSO.'];

/** 00–03s THE SIGNAL — a single star pulses, orbits trace themselves, the thesis slams in. */
export const S01Signal: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + SCENES.signal.from;
  const [l1, l2, l3] = SIGNAL.lines;
  const line = f < l1 ? -1 : f < l2 ? 0 : f < l3 ? 1 : f < SIGNAL.stack ? 2 : 3;
  const hits = [SIGNAL.star, ...SIGNAL.lines, SIGNAL.stack].filter((h) => h <= f);
  const lastHit = hits.length ? hits[hits.length - 1] : -100;
  const punch = Math.exp(-(f - lastHit) / 7);

  // camera: centred → slides right for the final lock-up
  const st = ease.inOutQuint(prog(f, SIGNAL.stack - 8, SIGNAL.stack + 16));
  const cx = lerp(1920, 2840, st);
  const zoom = lerp(0.62, 0.4, st) * (1 + 0.035 * punch) * lerp(1.12, 1, ease.outCubic(prog(f, 0, 90)));
  const cam = brandCamera(cx, 1080, 14000, zoom, 45 + f * 0.04);
  const textOn = line >= 0 && line <= 2;
  const starScale = ease.outBack(prog(f, SIGNAL.star, SIGNAL.star + 20), 2.2) * lerp(1, 0.78, st);
  const arm = STAR_ARM * starScale * (1 + 0.08 * punch);

  const STY = ['', 'ooobbbbbb', 'oofffffffff'];
  const lineSize = (t: string) => resolveSize({ text: t, fit: { maxWidth: 3240, maxSize: 560 }, styles: STY[LINES.indexOf(t)] });
  const stackSize = fitSizeAll(LINES, 1840, 300);
  const stackYs = stackBaselines(LINES.map((t) => ({ text: t, size: stackSize })), 1080, 0.14);

  return (
    <>
      <SpaceBackground gx={(cx / 3840) * 100} glow={0.18 + 0.1 * punch} />
      <Stage>
        <Dust frame={g} dy={-f * 2} opacity={0.8} />
        <g opacity={textOn ? 0.42 : 1}>
          <OrbitalSystem
            frame={g}
            cam={cam}
            draw={(i) => ease.inOutCubic(prog(f, SIGNAL.rings + i * 7, SIGNAL.rings + 52 + i * 7))}
            planetReach={() => 0}
            orbitOpacity={0.85}
            lineWidth={3}
            centerAbove
            center={
              <g>
                {[SIGNAL.star, ...SIGNAL.lines].map((h) => (
                  <StarPulse key={h} x={cx} y={1080} arm={STAR_ARM * 0.9} t={f - h} dur={44} strength={h === SIGNAL.star ? 1 : 0.7} />
                ))}
                <BrandStar x={cx} y={1080} arm={arm} color={COLORS.white} glow={starScale > 0 ? 1 + punch : 0} />
              </g>
            }
          />
        </g>
        {/* target callout on the star before the type arrives */}
        {f > 16 && f < l1 && (
          <g opacity={prog(f, 16, 24)}>
            <path d={`M${cx - 200} ${1080 - 200}h80M${cx - 200} ${1080 - 200}v80M${cx + 200} ${1080 + 200}h-80M${cx + 200} ${1080 + 200}v-80`} stroke={COLORS.lilac} strokeWidth={5} fill="none" />
            <Mono x={cx + 240} y={1080 - 150} color={COLORS.lilac} size={36}>SIGNAL · 0.0.0</Mono>
            <Mono x={cx + 240} y={1080 - 100} color={COLORS.white} size={30} weight={500}>ORIGEM DETECTADA</Mono>
          </g>
        )}
        {line === 0 && (
          <KineticText id="s1-l1" text={LINES[0]} x={1920} y={centeredBaseline(LINES[0], lineSize(LINES[0]), 1080)} size={lineSize(LINES[0])}
            color={COLORS.white} frame={f} start={l1} stagger={2.2} dur={14} mode="rise" seed={1} />
        )}
        {line === 1 && (
          <KineticText id="s1-l2" text={LINES[1]} x={1920} y={centeredBaseline(LINES[1], lineSize(LINES[1]), 1080)} size={lineSize(LINES[1])}
            color={COLORS.lilac} styles="ooobbbbbb" blockColor={COLORS.lilac} blockText={COLORS.space} frame={f} start={l2} stagger={2.2} dur={14} mode="drop" seed={2} />
        )}
        {line === 2 && (
          <KineticText id="s1-l3" text={LINES[2]} x={1920} y={centeredBaseline(LINES[2], lineSize(LINES[2]), 1080)} size={lineSize(LINES[2])}
            color={COLORS.white} styles="oofffffffff" frame={f} start={l3} stagger={1.8} dur={14} mode="mixed" seed={3} />
        )}
        {line === 3 && LINES.map((t, i) => (
          <KineticText key={t} id={`s1-stack-${i}`} text={t} x={300} align="left" y={stackYs[i]} size={stackSize}
            color={i === 1 ? COLORS.lilac : COLORS.white} styles={i === 1 ? 'ooobbbbbb' : i === 2 ? 'oofffffffff' : ''} blockColor={COLORS.lilac} blockText={COLORS.space}
            frame={f} start={SIGNAL.stack + i * 3} stagger={0.8} dur={12} mode="rise" seed={10 + i} />
        ))}
        <Hud frame={g} theme={THEMES.space} scene="SC 01/08" sub="THE SIGNAL" opacity={prog(f, 6, 20)} />
      </Stage>
    </>
  );
};
