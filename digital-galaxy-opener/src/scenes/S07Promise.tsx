import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, THEMES, type Theme } from '../brand/tokens';
import { PROMISE, SCENES } from '../timeline/timeline';
import { ease, lerp, prog } from '../lib/easing';
import { centeredBaseline, fitSize, stackBaselines } from '../lib/text-layout';
import { ClipPanels, rect } from '../components/fx/ClipPanels';
import { Stage } from '../components/fx/Stage';
import { Hud } from '../components/fx/Hud';
import { OrbitalRing } from '../components/brand/OrbitalRing';
import { StarPulse } from '../components/brand/StarPulse';
import { KineticText, resolveSize } from '../components/type/KineticText';
import { Mono } from '../components/type/Mono';

const W = 3840, H = 2160;
const LINES = ['SER VISTO.', 'SER LEMBRADO.', 'SER ESCOLHIDO.'];
const CARDS: Array<{ a: Theme; b: Theme; styles: [string, string] }> = [
  { a: THEMES.lilac, b: THEMES.space, styles: ['ooo', 'fff'] },
  { a: THEMES.space, b: THEMES.violet, styles: ['fff ooooooooo', 'ooo'] },
  { a: THEMES.white, b: THEMES.space, styles: ['ooo', 'fff bbbbbbbbbb'] },
];

/** 23–27s THE PROMISE — three full-frame type cards on the beat, then the full promise. */
export const S07Promise: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + SCENES.promise.from;

  if (f >= PROMISE.stack[0]) {
    const sizes = LINES.map((t) => fitSize(t, 3240, 360));
    const ys = stackBaselines(LINES.map((t, i) => ({ text: t, size: sizes[i] })), 1080, 0.2);
    const sc = lerp(0.96, 1, ease.outCubic(prog(f, PROMISE.stack[0], PROMISE.stack[0] + 60)));
    return (
      <ClipPanels panels={[{ clip: rect(0, 0, W, H), theme: THEMES.space }]}>
        {(t) => (
          <Stage>
            {[0, 1].map((k) => <OrbitalRing key={k} cx={1920} cy={1080} r={1250 + k * 380} width={4} color={COLORS.violet} dash={[20, 30]} dashOffset={-f * 6 * (k ? 1 : -1)} opacity={0.8} />)}
            <g transform={`translate(1920 1080) scale(${sc}) translate(-1920 -1080)`}>
              {LINES.map((line, i) => (
                <KineticText key={line} id={`s7-stack-${i}`} text={line} x={1920} y={ys[i]} size={sizes[i]} container={{ scale: sc }}
                  color={i === 2 ? COLORS.lilac : COLORS.white} styles={i === 2 ? 'fff bbbbbbbbbb' : i === 1 ? 'ooo' : ''} blockColor={COLORS.lilac} blockText={COLORS.space}
                  frame={f} start={PROMISE.stack[i]} stagger={1} dur={12} mode="rise" seed={90 + i} />
              ))}
            </g>
            <Hud frame={g} theme={t} scene="SC 07/08" sub="THE PROMISE" />
          </Stage>
        )}
      </ClipPanels>
    );
  }

  const j = f < PROMISE.cards[1] ? 0 : f < PROMISE.cards[2] ? 1 : 2;
  const c = CARDS[j], u = f - PROMISE.cards[j], half = u >= PROMISE.sub;
  const theme = half ? c.b : c.a;
  const text = LINES[j];
  // sized for the widest state: outlined letters + the 1.05 half-beat punch-in
  const size = resolveSize({ text, fit: { maxWidth: 3240 / 1.05, maxSize: 640 }, styles: 'ooo' });
  const y = centeredBaseline(text, size, 1080);
  const sc = half ? 1.05 : 1;
  return (
    <ClipPanels panels={[{ clip: rect(0, 0, W, H), theme }]}>
      {(t) => (
        <Stage>
          <OrbitalRing cx={1920} cy={1080} r={lerp(900, 1300, ease.outCubic(u / 60))} width={6} color={t.dark ? COLORS.violet : t.fg} opacity={0.5} start={u * 0.5} />
          {half && <StarPulse x={1920} y={1080} arm={90} t={u - PROMISE.sub} dur={26} color={t.dark ? COLORS.lilac : t.fg} />}
          <g transform={`translate(1920 1080) scale(${sc}) translate(-1920 -1080)`}>
            <KineticText id={`s7-card-${j}`} text={text} x={1920} y={y} size={size} color={t.fg} container={{ scale: sc }}
              styles={c.styles[half ? 1 : 0]} blockColor={t.dark ? COLORS.lilac : t.fg} blockText={t.bg}
              accent={t.dark ? { from: 4, color: COLORS.lilac } : undefined}
              frame={f} start={PROMISE.cards[j]} stagger={1.6} dur={13} mode={j === 1 ? 'drop' : 'rise'} seed={80 + j} />
          </g>
          <rect x={300} y={y + 110} width={560 * ease.outExpo(prog(u, 4, 22))} height={12} fill={t.fg} />
          <Mono x={3540} y={y + 140} color={t.fg} size={40} anchor="end">{`0${j + 1} / 03`}</Mono>
          <Hud frame={g} theme={t} scene="SC 07/08" sub="THE PROMISE" />
        </Stage>
      )}
    </ClipPanels>
  );
};
