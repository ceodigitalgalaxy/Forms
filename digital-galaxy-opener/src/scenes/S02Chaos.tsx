import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, THEMES, type Theme } from '../brand/tokens';
import { CHAOS, SCENES } from '../timeline/timeline';
import { ease, prog } from '../lib/easing';
import { fitSize, measureLine } from '../lib/text-layout';
import { ClipPanels, poly, rect, type Panel } from '../components/fx/ClipPanels';
import { Stage } from '../components/fx/Stage';
import { Hud } from '../components/fx/Hud';
import { Planet } from '../components/brand/OrbitalSystem';
import { KineticText } from '../components/type/KineticText';
import { Mono } from '../components/type/Mono';
import { ARCS, BODIES, arcAngle, bodyPos } from './chaosField';

const W = 3840, H = 2160;
const { space: S, lilac: L, violet: V } = THEMES;

/** Eight hard-cut layouts (every 30 frames), several on the logo's 45° axis. u = 0..1 drift within the cut. */
const LAYOUTS: Array<(u: number) => Panel[]> = [
  (u) => [{ clip: rect(0, 0, W, H), theme: S }, { clip: poly([[0, 0], [2500 + u * 120, 0], [340 + u * 120, H], [0, H]]), theme: L }],
  (u) => [{ clip: rect(0, 0, 1500 + u * 80, H), theme: S }, { clip: rect(1500 + u * 80, 0, W, H), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: S }, { clip: rect(0, 760 - u * 40, W, 1420 - u * 40), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: L }, { clip: poly([[1500 + u * 100, 0], [2400 + u * 100, 0], [240 + u * 100, H], [-660 + u * 100, H]]), theme: S }],
  (u) => [{ clip: rect(0, 0, W, 1320 + u * 60), theme: S }, { clip: rect(0, 1320 + u * 60, W, H), theme: L }],
  (u) => [{ clip: rect(0, 0, 2440 - u * 80, H), theme: L }, { clip: rect(2440 - u * 80, 0, W, H), theme: S }],
  (u) => [{ clip: rect(0, 0, W, H), theme: S }, { clip: poly([[W, 0], [W, 1500 - u * 80], [1300 - u * 80, 0]]), theme: V }, { clip: rect(0, 1880, W, H), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: S }, { clip: rect(0, 0, 560 + u * 60, H), theme: L }],
];

/** Fragmented orbital debris + drifting bodies, drawn in a panel's theme. */
export const ChaosField: React.FC<{ f: number; theme: Theme; tags?: boolean }> = ({ f, theme, tags = true }) => (
  <g>
    {ARCS.map((a, i) => (
      <ellipse key={i} cx={a.cx} cy={a.cy} rx={a.r} ry={a.r * a.aspect} transform={`rotate(${arcAngle(i, f)} ${a.cx} ${a.cy})`}
        fill="none" stroke={theme.dark ? COLORS.violet : theme.fg} strokeOpacity={theme.dark ? 0.9 : 0.55} strokeWidth={a.width}
        pathLength={1000} strokeDasharray={`${a.span * 1000} 1000`} strokeLinecap="round" />
    ))}
    {BODIES.map((b, i) => {
      const p = bodyPos(i, f);
      return (
        <g key={i}>
          <Planet x={p.x} y={p.y} r={b.size} kind={b.kind} dark={theme.dark} color={theme.dark ? undefined : theme.fg} glow={0.8} />
          {tags && b.tagged && (
            <g>
              <path d={`M${p.x - 90} ${p.y - 60}v-30h30M${p.x + 90} ${p.y + 60}v30h-30`} stroke={theme.fg} strokeWidth={4} fill="none" />
              <Mono x={p.x + 110} y={p.y - 40} color={theme.fg} size={32}>SEM ÓRBITA</Mono>
              <Mono x={p.x + 110} y={p.y + 4} color={theme.fg} size={26} weight={500} opacity={0.8}>{`VEC ${b.vx.toFixed(0)} / ${b.vy.toFixed(0)}`}</Mono>
            </g>
          )}
        </g>
      );
    })}
  </g>
);

/** 03–07s CHAOS — posting and advertising without a centre. */
export const S02Chaos: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + SCENES.chaos.from;
  const k = Math.min(7, Math.floor(f / CHAOS.cut));
  const u = ease.outCubic((f % CHAOS.cut) / CHAOS.cut);
  const B = f >= CHAOS.phrase[1];
  const t0 = B ? CHAOS.phrase[1] : CHAOS.phrase[0];
  const w1 = B ? 'ANUNCIAR' : 'POSTAR';
  const s1 = fitSize(w1, 2600, 500), s2 = 360, s3 = fitSize('ESTRATÉGIA.', 3240, 470);
  // stack from the top of the safe area with real ascents (accents included)
  const m1 = measureLine(w1, s1), m2 = measureLine('NÃO É', s2), m3 = measureLine('ESTRATÉGIA.', s3);
  const y1 = 250 + m1.ascent;
  const y2 = y1 + 0.13 * s1 + m2.ascent;
  const y3 = y2 + 0.13 * s2 + m3.ascent;
  const shift = Math.exp(-(f % CHAOS.cut) / 6) * 26 * (k % 2 ? 1 : -1); // jolt on each cut

  return (
    <ClipPanels panels={LAYOUTS[k](u)}>
      {(th) => (
        <Stage>
          <g transform={`translate(${shift} 0)`}>
            <ChaosField f={f} theme={th} />
          </g>
          <KineticText id={`s2-l1-${w1}`} text={w1} x={300} align="left" y={y1} size={s1} color={th.fg} frame={f} start={t0 + CHAOS.line[0]} stagger={2} dur={13} mode="rise" seed={B ? 21 : 20} />
          <KineticText id="s2-l2" text="NÃO É" x={300} align="left" y={y2} size={s2} color={th.fg} styles="ooooo" frame={f} start={t0 + CHAOS.line[1]} stagger={2.6} dur={13} mode="grow" seed={B ? 23 : 22} />
          <KineticText id="s2-l3" text="ESTRATÉGIA." x={300} align="left" y={y3} size={s3} color={th.fg} styles="bbbbbffffff" blockColor={th.fg} blockText={th.bg}
            frame={f} start={t0 + CHAOS.line[2]} stagger={1.6} dur={13} mode="rise" seed={B ? 25 : 24} />
          {f >= t0 + CHAOS.line[2] + 10 && (
            <Mono x={300} y={Math.min(1900, y3 + 120)} color={th.fg} size={40} spacing={0.25} opacity={prog(f, t0 + CHAOS.line[2] + 10, t0 + CHAOS.line[2] + 16)}>
              {B ? 'MÍDIA  //  SEM DIREÇÃO' : 'FEED  //  SEM DIREÇÃO'}
            </Mono>
          )}
          <Hud frame={g} theme={th} scene="SC 02/08" sub={B ? 'SINAL: DISPERSO' : 'SINAL: RUÍDO'} />
        </Stage>
      )}
    </ClipPanels>
  );
};
