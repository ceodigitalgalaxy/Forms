import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, FONTS, THEMES } from '../brand/tokens';
import { K, SCENES } from '../timeline/timeline';
import { ease, prog } from '../lib/easing';
import { fitSize, measureLine, stackBaselines } from '../lib/text-layout';
import { assertSafe } from '../lib/safe-area';
import { Stage } from '../components/fx/Stage';
import { Hud } from '../components/fx/Hud';
import { KineticText, type EntryMode } from '../components/type/KineticText';
import { Eyebrow } from '../components/type/Eyebrow';
import { Mono } from '../components/type/Mono';
import { BrandLogo } from '../components/brand/BrandLogo';
import { BrandStar } from '../components/brand/BrandStar';
import { AlignmentTicks, LensRing, Scrim, StarImpulse, lensAt, starOnScreen } from '../motion/cosmic';
import { FINAL_LOGO, projectAt } from '../world/cameraRig';
import { CHECKPOINT_ANGLES, PILLAR_NAMES, PLANE_NORMAL, orbitWorldPoint, planetPosition } from '../world/worldState';

const useG = (scene: keyof typeof SCENES) => useCurrentFrame() + SCENES[scene].from;

// ---------------------------------------------------------------------------
// 13–16 THE PROCESS — the method, checkpoint by checkpoint along the orbit
// ---------------------------------------------------------------------------
const STEPS = ['Diagnóstico', 'Plano', 'Execução', 'Resultado'];
export const O5Process: React.FC = () => {
  const f = useG('process');
  let cur = -1; K.checkpoints.forEach((t, i) => { if (f >= t) cur = i; });
  const word = cur >= 0 ? STEPS[cur] : '';
  const ws = word ? fitSize(word, 2400, 260) : 0;
  // flow bar in the site's eyebrow style
  const font = { family: FONTS.body, weight: 600, tracking: 0.12 };
  const fs = 54, items: Array<{ t: string; i: number }> = [];
  STEPS.forEach((t, i) => { items.push({ t: t.toUpperCase(), i }); if (i < 3) items.push({ t: '→', i: -1 }); });
  const gap = 40, widths = items.map((it) => measureLine(it.t, fs, font).width);
  const total = widths.reduce((a, b) => a + b, 0) + gap * (items.length - 1), by = 1870;
  assertSafe('s5-flow', { x0: 1920 - total / 2, y0: by - measureLine('Ç', fs, font).ascent - 20, x1: 1920 + total / 2, y1: by + 24 });
  let bx = 1920 - total / 2;
  return (
    <>
      <Scrim y0={160} y1={760} strength={0.45} />
      <Scrim y0={1680} y1={2160} strength={0.7} />
      <Stage>
        {CHECKPOINT_ANGLES.map((a, i) => {
          const p = projectAt(f, orbitWorldPoint(3, a, f).add(PLANE_NORMAL.clone().multiplyScalar(0.12)));
          if (!p.visible || p.x < 320 || p.x > 3300 || p.y < 820 || p.y > 1640) return null;
          const on = f >= K.checkpoints[i];
          return (
            <g key={i} opacity={on ? 1 : 0.55}>
              <line x1={p.x} y1={p.y - 70} x2={p.x} y2={p.y - 230} stroke={on ? COLORS.lilac : COLORS.white} strokeWidth={4} />
              <Mono x={p.x + 18} y={p.y - 248} color={on ? COLORS.lilac : COLORS.white} size={34}>{`CP.0${i + 1}`}</Mono>
              <Mono x={p.x + 18} y={p.y - 206} color={COLORS.white} size={26} weight={500}>{on ? '■ ATIVO' : '□ PRÓXIMO'}</Mono>
            </g>
          );
        })}
        <Eyebrow id="s5-eyebrow" text="Nosso método" x={300} y={330} frame={f} start={SCENES.process.from + 6} />
        {word && (
          <KineticText key={word} id={`s5-${word}`} text={word} x={300} align="left" y={420 + measureLine(word, ws).ascent} size={ws}
            color={cur === 3 ? COLORS.lilac : COLORS.white} frame={f} start={K.checkpoints[cur] - 4} stagger={1} dur={14} mode="orbital" seed={50 + cur} />
        )}
        {items.map((it, j) => {
          const x = bx; bx += widths[j] + gap;
          const done = it.i >= 0 ? cur >= it.i : true, active = it.i >= 0 && it.i === cur;
          return (
            <g key={j}>
              <text x={x} y={by} style={{ fontFamily: font.family, fontWeight: 600, fontSize: fs, letterSpacing: '0.12em' }} fill={active ? COLORS.lilac : COLORS.white} fillOpacity={done && (it.i >= 0 || cur >= 0) ? 1 : 0.32}>{it.t}</text>
              {active && <rect x={x} y={by + 20} width={widths[j] * ease.outExpo(prog(f, K.checkpoints[cur], K.checkpoints[cur] + 12))} height={7} fill={COLORS.lilac} />}
            </g>
          );
        })}
        <Hud frame={f} theme={THEMES.space} scene="SC 05/08" sub="ROTA: ÓRBITA 04" />
      </Stage>
    </>
  );
};

// ---------------------------------------------------------------------------
// 16–23 THE FIVE PILLARS — each service owns a planet and a framing
// ---------------------------------------------------------------------------
export const O6Pillars: React.FC = () => {
  const f = useG('pillars');
  let i = 0; K.pillar.forEach((t, j) => { if (f >= t) i = j; });
  const t0 = K.pillar[i], next = K.pillar[i + 1] ?? K.lens[1];
  const planet = projectAt(f, planetPosition(i, f));
  const left = planet.x > 1920; // type sits opposite the planet
  const colX = left ? 300 : 2040, colW = 1500;
  const name = PILLAR_NAMES[i];
  // smart line break: keep titles large; break before shrinking too far
  const one = fitSize(name, colW, 250);
  const lines = one < 190 && name.includes(' ') ? name.split(' ') : [name];
  const ls = Math.min(...lines.map((l) => fitSize(l, colW, 250)));
  const idxFont = { family: FONTS.brand, weight: 700, tracking: 0.04 };
  const idx = String(i + 1).padStart(2, '0');
  const is = fitSize(idx, 900, 520, idxFont);
  const iy = 520 + measureLine(idx, is, idxFont).ascent;
  const ys = stackBaselines(lines.map((l) => ({ text: l, size: ls })), iy + 120 + (lines.length * ls * 1.12) / 2);
  const slingshot = f >= (K.pillar[i + 1] ?? 99999) - K.slingshot;
  const exit = i < 4 ? ease.inCubic(prog(f, next - K.slingshot, next - 2)) : ease.inCubic(prog(f, K.lens[0], K.lens[1]));
  const lens = i === 4 ? { ...{ x: starOnScreen(f)[0], y: starOnScreen(f)[1] }, radius: 1100, strength: lensAt(f) * 1.4 } : undefined;
  const origin: [number, number] = [planet.x, planet.y];
  return (
    <>
      <Scrim y0={260} y1={ys[ys.length - 1] + 200} strength={0.5} />
      <Stage>
        <Eyebrow id={`s6-eyebrow-${i}`} text="Serviços" x={colX} y={340} frame={f} start={t0} />
        <Mono x={colX + colW} y={340} anchor="end" color={COLORS.white} size={30} weight={500} opacity={0.8}>{`PILAR ${idx} / 05`}</Mono>
        <KineticText key={`n${i}`} id={`s6-num-${i}`} text={idx} x={colX} align="left" y={iy} size={is} font={idxFont} color={COLORS.lilac} styles="oo" outlineWidth={0.012}
          frame={f} start={t0} stagger={3} dur={16} mode="depth" exit={exit} origin={origin} seed={60 + i} />
        {lines.map((l, j) => (
          <KineticText key={`l${i}-${j}`} id={`s6-label-${i}-${j}`} text={l} x={colX} align="left" y={ys[j]} size={ls} color={j === lines.length - 1 && lines.length > 1 ? COLORS.lilac : COLORS.white}
            frame={f} start={t0 + 6 + j * 4} stagger={1.1} dur={16} mode="gravity" origin={origin} exit={exit} lens={lens} seed={70 + i * 3 + j} />
        ))}
        {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={colX + k * 92} y={ys[ys.length - 1] + 90} width={78} height={8} fill={k <= i ? COLORS.lilac : COLORS.white} opacity={k <= i ? 1 : 0.25} />)}
        {planet.visible && !slingshot && (
          <g opacity={prog(f, t0 + 10, t0 + 20)}>
            <path d={`M${planet.x + (left ? -1 : 1) * 210} ${planet.y - 210}l${(left ? -1 : 1) * 120} -120h${(left ? -1 : 1) * 220}`} stroke={COLORS.lilac} strokeWidth={4} fill="none" />
            <Mono x={planet.x + (left ? -1 : 1) * 350} y={planet.y - 350} anchor={left ? 'end' : 'start'} color={COLORS.lilac} size={30}>{`ÓRBITA 0${i + 1}`}</Mono>
          </g>
        )}
        <LensRing f={f} />
        <Hud frame={f} theme={THEMES.space} scene={`${idx}/05`} sub="OS CINCO PILARES" />
      </Stage>
    </>
  );
};

// ---------------------------------------------------------------------------
// 23–27 THE PROMISE — three accents, then the full promise
// ---------------------------------------------------------------------------
const PROMISE = [
  { s: 'Ser', w: 'visto.', mode: 'gravity' as EntryMode },
  { s: 'Ser', w: 'lembrado.', mode: 'orbital' as EntryMode },
  { s: 'Ser', w: 'escolhido.', mode: 'depth' as EntryMode },
];
export const O7Promise: React.FC = () => {
  const f = useG('promise');
  const origin = starOnScreen(f);
  const lens = { x: origin[0], y: origin[1], radius: 1300, strength: lensAt(f) * 1.3 };
  if (f >= K.promiseStack[0]) {
    const lines = PROMISE.map((p) => `${p.s} ${p.w}`);
    const sz = Math.min(...lines.map((l) => fitSize(l, 3240, 270)));
    const ys = stackBaselines(lines.map((l) => ({ text: l, size: sz })), 1080, 1.18);
    const exit = ease.inCubic(prog(f, K.promisePull[0] + 4, K.promisePull[1] - 2));
    return (
      <>
        <Scrim y0={ys[0] - sz * 1.4} y1={ys[2] + sz * 0.7} strength={0.6} />
        <Stage>
          {lines.map((l, i) => (
            <KineticText key={l} id={`s7-stack-${i}`} text={l} x={1920} y={ys[i]} size={sz} color={COLORS.white} accent={{ from: 4, color: COLORS.lilac }}
              frame={f} start={K.promiseStack[i]} stagger={0.7} dur={12} mode="depth" exit={exit} origin={origin} seed={90 + i} />
          ))}
          <Hud frame={f} theme={THEMES.space} scene="SC 07/08" sub="A PROMESSA" />
        </Stage>
      </>
    );
  }
  const j = f < K.promise[1] ? 0 : f < K.promise[2] ? 1 : 2;
  const p = PROMISE[j], text = `${p.s} ${p.w}`;
  const sz = fitSize(text, 3240, 420);
  const y = 1080 + measureLine(text, sz).capHeight / 2;
  const t0 = K.promise[j], nextT = j < 2 ? K.promise[j + 1] : K.promiseStack[0];
  const exit = ease.inCubic(prog(f, nextT - 8, nextT));
  return (
    <>
      <Scrim y0={y - sz * 1.5} y1={y + sz * 0.9} strength={0.6} />
      <Stage>
        <StarImpulse f={f} />
        <KineticText key={j} id={`s7-card-${j}`} text={text} x={1920} y={y} size={sz} color={COLORS.white} accent={{ from: 4, color: COLORS.lilac }}
          frame={f} start={t0 - 4} stagger={1.2} dur={14} mode={p.mode} origin={origin} exit={exit} lens={j === 0 ? lens : undefined} seed={80 + j} />
        <Mono x={3540} y={y + 170} anchor="end" color={COLORS.lilac} size={40}>{`0${j + 1} / 03`}</Mono>
        <rect x={300} y={y + 130} width={520 * ease.outExpo(prog(f, t0, t0 + 16))} height={9} fill={COLORS.lilac} />
        <LensRing f={f} />
        <Hud frame={f} theme={THEMES.space} scene="SC 07/08" sub="A PROMESSA" />
      </Stage>
    </>
  );
};

// ---------------------------------------------------------------------------
// 27–30 FINAL ORBIT — pullback, stellar alignment, the original mark
// ---------------------------------------------------------------------------
export const O8Final: React.FC = () => {
  const f = useG('final');
  const logo = prog(f, K.logoLock - 6, K.logoLock);
  const cta = 'Coloque sua marca em órbita.';
  const cs = fitSize(cta, 3000, 170);
  const cy = FINAL_LOGO.cy + FINAL_LOGO.r + 170 + measureLine(cta, cs).ascent;
  const handleFont = { family: FONTS.body, weight: 500, tracking: 0.02 };
  const hs = 60, h1 = '@digitalgalaxymkt', h2 = 'digitalgalaxy.com.br';
  const w1 = measureLine(h1, hs, handleFont).width, w2 = measureLine(h2, hs, handleFont).width, gap = 150;
  const tot = w1 + w2 + gap, hy = cy + 180, hp = ease.outExpo(prog(f, K.handles, K.handles + 18));
  if (f >= K.handles) assertSafe('s8-handles', { x0: 1920 - tot / 2, y0: hy - hs, x1: 1920 + tot / 2, y1: hy + hs * 0.3 });
  return (
    <>
      <Stage>
        <StarImpulse f={f} />
        {f < K.logoLock + 20 && <AlignmentTicks f={f} frames={K.alignTicks} y={1940} />}
        {logo > 0 && <BrandLogo x={1920} y={FINAL_LOGO.cy} r={FINAL_LOGO.r} opacity={logo} />}
        <KineticText id="s8-cta" text={cta} x={1920} y={cy} size={cs} color={COLORS.white} accent={{ from: 18, color: COLORS.lilac }}
          frame={f} start={K.cta} stagger={0.7} dur={16} mode="gravity" origin={[1920, FINAL_LOGO.cy]} seed={99} />
        {f >= K.handles && (
          <g opacity={hp} transform={`translate(0 ${(1 - hp) * 24})`}>
            <text x={1920 - tot / 2} y={hy} style={{ fontFamily: handleFont.family, fontWeight: 500, fontSize: hs, letterSpacing: '0.02em' }} fill={COLORS.lilac}>{h1}</text>
            <BrandStar x={1920 - tot / 2 + w1 + gap / 2} y={hy - hs * 0.35} arm={20} color={COLORS.white} />
            <text x={1920 - tot / 2 + w1 + gap} y={hy} style={{ fontFamily: handleFont.family, fontWeight: 500, fontSize: hs, letterSpacing: '0.02em' }} fill={COLORS.white}>{h2}</text>
          </g>
        )}
        <Hud frame={f} theme={THEMES.space} scene="SC 08/08" sub="ÓRBITA FINAL" minimal={f >= K.cta} />
      </Stage>
    </>
  );
};
