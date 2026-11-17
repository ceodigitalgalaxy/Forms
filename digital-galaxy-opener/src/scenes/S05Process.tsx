import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, THEMES } from '../brand/tokens';
import { PROCESS, SCENES } from '../timeline/timeline';
import { ease, keyframes, prog } from '../lib/easing';
import { makeProjector, orbitPoint, type Camera } from '../lib/projection';
import { fitSize, measureLine } from '../lib/text-layout';
import { assertSafe } from '../lib/safe-area';
import { SpaceBackground } from '../components/fx/Background';
import { Stage } from '../components/fx/Stage';
import { Dust } from '../components/fx/Dust';
import { Hud } from '../components/fx/Hud';
import { OrbitalSystem, PLANETS } from '../components/brand/OrbitalSystem';
import { GalaxyCore } from '../components/brand/GalaxyCore';
import { BrandStar } from '../components/brand/BrandStar';
import { StarPulse } from '../components/brand/StarPulse';
import { KineticText } from '../components/type/KineticText';
import { Mono } from '../components/type/Mono';

const ORBIT = 3;
const R = PLANETS[ORBIT].r;
const STEPS = ['DIAGNÓSTICO', 'PLANO', 'EXECUÇÃO', 'RESULTADO'];
const TH = [0.15, 0.6, 1.05, 1.5].map((a) => a - Math.PI / 2);

/** Stop-and-go travel along the orbit: hold, then move, arriving on each checkpoint. */
function cameraAngle(f: number) {
  const keys: Array<[number, number]> = [[0, TH[0] - 0.55]];
  PROCESS.checkpoints.forEach((cp, i) => { keys.push([cp - PROCESS.travel, keys[keys.length - 1][1]]); keys.push([cp, TH[i]]); });
  keys.push([SCENES.process.dur, TH[3] + 0.16]);
  return keyframes(f, keys, ease.inOutQuint);
}

const ring = (r: number, a: number, h: number): [number, number, number] => [r * Math.cos(a), h, r * Math.sin(a)];

/** 13–16s THE PROCESS — the camera rides an orbit; four strategic checkpoints light up. */
export const S05Process: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + SCENES.process.from;
  const phi = cameraAngle(f);
  const vel = Math.abs(cameraAngle(f + 1) - cameraAngle(f - 1)) / 2;
  const intro = ease.outQuart(prog(f, 0, 30));
  // Camera outside the orbit looking in: the arc sweeps across the lower frame,
  // the brand core sits back-right, clear of the headline.
  const cam: Camera = {
    eye: ring(R * (2.05 + 0.5 * (1 - intro)), phi - 0.1, 620 + 400 * (1 - intro)),
    target: ring(R * 0.62, phi + 0.42, 120),
    focal: 2450,
    roll: -3 + 2 * Math.sin(f / 50),
    cx: 1920,
    cy: 1170,
  };
  const core = makeProjector(cam)([0, 0, 0]);
  let cur = -1;
  PROCESS.checkpoints.forEach((cp, i) => { if (f >= cp) cur = i; });

  // flow bar (essential text) — measured, then safe-checked as one block
  const fs = 64, items: Array<{ t: string; i: number }> = [];
  STEPS.forEach((t, i) => { items.push({ t, i }); if (i < 3) items.push({ t: '→', i: -1 - i }); });
  const gap = 34;
  const widths = items.map((it) => measureLine(it.t, fs, 800, 'Inter', 0.02).width);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
  const by = 1850;
  assertSafe('s5-flowbar', { x0: 1920 - total / 2, y0: by - measureLine('DIAGNÓSTICO', fs, 800).ascent, x1: 1920 + total / 2, y1: by + 30 });
  let bx = 1920 - total / 2;

  const word = cur >= 0 ? STEPS[cur] : '';
  const wsz = word ? fitSize(word, 2300, 300) : 0;

  return (
    <>
      <SpaceBackground glow={0.2} gx={70} gy={65} />
      <Stage>
        <Dust frame={g} dx={-phi * 2600} dy={0} stretch={vel * 9000} opacity={0.9} />
        <OrbitalSystem
          frame={g}
          cam={cam}
          trails={1}
          highlight={ORBIT}
          lineWidth={4}
          center={core.z > 50 ? <GalaxyCore x={core.x} y={core.y} r={260 * core.s} frame={g} intensity={1.1} /> : null}
          overlay={(proj) => {
            return (
              <g>
                {TH.map((th, i) => {
                  const q = proj(orbitPoint(R, th));
                  if (q.z < 60 || q.x < -400 || q.x > 4240) return null;
                  const on = f >= PROCESS.checkpoints[i];
                  const sz = Math.min(90, 26 * q.s + 18);
                  const nearCore = Math.hypot(q.x + 22 - core.x, q.y - 330 - core.y) < 260 * core.s * 1.5;
                  return (
                    <g key={i}>
                      <line x1={q.x} y1={q.y - sz * 1.3} x2={q.x} y2={nearCore ? q.y - sz * 1.3 : q.y - 330} stroke={on ? COLORS.lilac : COLORS.white} strokeOpacity={on ? 0.95 : 0.4} strokeWidth={4} />
                      {on && <StarPulse x={q.x} y={q.y} arm={sz} t={f - PROCESS.checkpoints[i]} dur={36} strength={0.8} />}
                      {on ? (
                        <BrandStar x={q.x} y={q.y} arm={sz} color={COLORS.lilac} glow={1.4} />
                      ) : (
                        <circle cx={q.x} cy={q.y} r={sz * 0.55} fill={COLORS.space} stroke={COLORS.white} strokeOpacity={0.7} strokeWidth={5} />
                      )}
                      {(on || i === cur + 1) && !nearCore && <Mono x={q.x + 22} y={q.y - 352} color={on ? COLORS.lilac : COLORS.white} size={36} opacity={on ? 1 : 0.6}>{`CP.0${i + 1}`}</Mono>}
                      {(on || i === cur + 1) && !nearCore && <Mono x={q.x + 22} y={q.y - 306} color={COLORS.white} size={26} weight={500} opacity={on ? 1 : 0.5}>{on ? '■ ATIVO' : '□ PRÓXIMO'}</Mono>}
                    </g>
                  );
                })}
              </g>
            );
          }}
        />
        <defs>
          <linearGradient id="barFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COLORS.space} stopOpacity={0} />
            <stop offset="0.45" stopColor={COLORS.space} stopOpacity={0.88} />
            <stop offset="1" stopColor={COLORS.space} stopOpacity={0.95} />
          </linearGradient>
        </defs>
        <rect x={0} y={1620} width={3840} height={540} fill="url(#barFade)" />
        {cur >= 0 && (
          <g>
            <Mono x={300} y={330} color={COLORS.lilac} size={44} spacing={0.3}>{`ETAPA 0${cur + 1} / 04`}</Mono>
            <KineticText key={word} id={`s5-${word}`} text={word} x={300} align="left" y={380 + measureLine(word, wsz).ascent} size={wsz}
              color={cur === 3 ? COLORS.lilac : COLORS.white} frame={f} start={PROCESS.checkpoints[cur]} stagger={1.4} dur={12} mode="rise" seed={50 + cur} />
          </g>
        )}
        <g>
          {items.map((it, j) => {
            const x = bx; bx += widths[j] + gap;
            const step = it.i >= 0 ? it.i : -it.i - 1;
            const done = it.i >= 0 ? cur >= it.i : cur > step;
            const active = it.i >= 0 && it.i === cur;
            return (
              <g key={j}>
                <text x={x} y={by} style={{ fontFamily: 'Inter', fontWeight: 800, fontSize: fs, letterSpacing: '0.02em' }}
                  fill={active ? COLORS.lilac : COLORS.white} fillOpacity={done ? 1 : 0.3}>{it.t}</text>
                {active && <rect x={x} y={by + 22} width={widths[j] * ease.outExpo(prog(f, PROCESS.checkpoints[cur], PROCESS.checkpoints[cur] + 12))} height={8} fill={COLORS.lilac} />}
              </g>
            );
          })}
        </g>
        <Hud frame={g} theme={THEMES.space} scene="SC 05/08" sub="ROTA: ÓRBITA 04" />
      </Stage>
    </>
  );
};
