import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONTS, THEMES, type Theme } from '../brand/tokens';
import { K, SCENES } from '../timeline/timeline';
import { ease, prog } from '../lib/easing';
import { fitSize, fitSizeAll, measureLine, stackBaselines } from '../lib/text-layout';
import { Stage } from '../components/fx/Stage';
import { Hud } from '../components/fx/Hud';
import { ClipPanels, poly, rect, type Panel } from '../components/fx/ClipPanels';
import { KineticText } from '../components/type/KineticText';
import { Eyebrow } from '../components/type/Eyebrow';
import { Mono } from '../components/type/Mono';
import { BrandLogo } from '../components/brand/BrandLogo';
import { Scrim, StarImpulse, impulseFlash, starOnScreen } from '../motion/cosmic';
import { projectAt, REVEAL_LOGO } from '../world/cameraRig';
import { planetPosition } from '../world/worldState';

const W = 3840, H = 2160;
const useG = (scene: keyof typeof SCENES) => useCurrentFrame() + SCENES[scene].from;

// ---------------------------------------------------------------------------
// 00–03 THE SIGNAL — the hero line of the site, born from the star
// ---------------------------------------------------------------------------
export const O1Signal: React.FC = () => {
  const f = useG('signal');
  const origin = starOnScreen(f);
  const lines = ['Sua marca', 'no centro', 'do universo.'];
  let cur = -1; K.signalLines.forEach((t, i) => { if (f >= t) cur = i; });
  const stack = f >= K.signalStack;
  const single = cur >= 0 && !stack ? lines[cur] : '';
  const sz = single ? fitSize(single, 3240, 360) : 0;
  const hero = ['Sua marca no centro', 'do universo.'];
  const hs = fitSizeAll(hero, 3240, 250);
  const hy = stackBaselines(hero.map((t) => ({ text: t, size: hs })), 1560);
  return (
    <>
      <Scrim y0={1180} y1={2060} strength={0.55} />
      <Stage>
        <Eyebrow id="s1-eyebrow" text="Estratégia, marca e performance" x={300} y={330} frame={f} start={K.starReveal} />
        {single && (
          <KineticText key={single} id={`s1-${cur}`} text={single} x={1920} y={1560 + measureLine(single, sz).capHeight / 2} size={sz}
            color={cur === 2 ? COLORS.lilac : COLORS.white} frame={f} start={K.signalLines[cur] - 6} stagger={1.2} dur={18} mode="gravity" origin={origin} seed={cur + 1} />
        )}
        {stack && hero.map((t, i) => (
          <KineticText key={t} id={`s1-hero-${i}`} text={t} x={1920} y={hy[i]} size={hs} color={i ? COLORS.lilac : COLORS.white}
            frame={f} start={K.signalStack + i * 3} stagger={0.6} dur={12} mode="depth" seed={9 + i} />
        ))}
        <Hud frame={f} theme={THEMES.space} scene="SC 01/08" sub="THE SIGNAL" opacity={prog(f, 10, 30)} />
      </Stage>
    </>
  );
};

// ---------------------------------------------------------------------------
// 03–07 CHAOS — split panels over a directionless universe (dark panels are windows onto the 3D)
// ---------------------------------------------------------------------------
const CLEAR: Theme = { ...THEMES.space, bg: 'transparent' };
const L = THEMES.lilac, V = THEMES.violet;
const LAYOUTS: Array<(u: number) => Panel[]> = [
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: poly([[0, 0], [1500 + u * 120, 0], [0, 1500 + u * 120]]), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: rect(0, 0, 1240 + u * 80, H), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: poly([[W, 0], [W, H], [W - 1200 - u * 100, H], [W - 1200 - 1080 - u * 100, 0]]), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: rect(0, 1500 - u * 40, W, H), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: poly([[0, 0], [1700 + u * 100, 0], [400 + u * 100, H], [0, H]]), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: rect(0, 0, W, 600 + u * 40), theme: V }],
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: rect(W - 900 - u * 60, 0, W, H), theme: L }],
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: poly([[0, H], [0, H - 1300 - u * 80], [1300 + u * 80, H]]), theme: V }],
  (u) => [{ clip: rect(0, 0, W, H), theme: CLEAR }, { clip: rect(0, 0, 900 + u * 60, H), theme: L }],
];
export const O2Chaos: React.FC = () => {
  const f = useG('chaos');
  const k = Math.min(8, Math.floor((f - SCENES.chaos.from) / K.chaosCut)), u = ease.outCubic(((f - SCENES.chaos.from) % K.chaosCut) / K.chaosCut);
  const B = f >= K.chaosPhrases[1], t0 = B ? K.chaosPhrases[1] : K.chaosPhrases[0];
  const w1 = B ? 'Anunciar' : 'Postar';
  const s1 = fitSize(w1, 2600, 360), s2 = 300, s3 = fitSize('estratégia.', 3240, 330);
  const y1 = 300 + measureLine(w1, s1).ascent;
  const y2 = y1 + s1 * 0.18 + measureLine('não é', s2).ascent;
  const y3 = y2 + s2 * 0.18 + measureLine('estratégia.', s3).ascent;
  const tags = [1, 3].map((i) => projectAt(f, planetPosition(i, f)));
  return (
    <ClipPanels panels={LAYOUTS[k](u)}>
      {(t) => (
        <Stage>
          {t.bg === 'transparent' && <rect x={0} y={0} width={W} height={y3 + 140} fill="url(#chaosScrim)" />}
          <defs>
            <linearGradient id="chaosScrim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={COLORS.space} stopOpacity={0.7} /><stop offset="0.7" stopColor={COLORS.space} stopOpacity={0.25} /><stop offset="1" stopColor={COLORS.space} stopOpacity={0} />
            </linearGradient>
          </defs>
          {tags.map((p, i) => p.visible && p.x > 200 && p.x < W - 600 && p.y > 300 && p.y < H - 300 && (
            <g key={i}>
              <path d={`M${p.x - 90} ${p.y - 60}v-30h30M${p.x + 90} ${p.y + 60}v30h-30`} stroke={t.fg} strokeWidth={4} fill="none" />
              <Mono x={p.x + 110} y={p.y - 30} color={t.fg} size={32}>SEM ÓRBITA</Mono>
              <Mono x={p.x + 110} y={p.y + 12} color={t.fg} size={26} weight={500} opacity={0.8}>{`OBJ.0${i + 2} · SEM DIREÇÃO`}</Mono>
            </g>
          ))}
          <KineticText id={`s2-${w1}`} text={w1} x={300} align="left" y={y1} size={s1} color={t.fg} frame={f} start={t0 + K.chaosLine[0]} stagger={1.2} dur={14} mode="orbital" seed={B ? 21 : 20} />
          <KineticText id="s2-nao" text="não é" x={300} align="left" y={y2} size={s2} color={t.fg} styles="ooooo" frame={f} start={t0 + K.chaosLine[1]} stagger={1.6} dur={14} mode="depth" seed={B ? 23 : 22} />
          <KineticText id="s2-estrategia" text="estratégia." x={300} align="left" y={y3} size={s3} color={t.dark ? COLORS.lilac : t.fg} frame={f} start={t0 + K.chaosLine[2]} stagger={1} dur={14} mode="orbital" seed={B ? 25 : 24} />
          <Hud frame={f} theme={t} scene="SC 02/08" sub={B ? 'SINAL: DISPERSO' : 'SINAL: RUÍDO'} />
        </Stage>
      )}
    </ClipPanels>
  );
};

// ---------------------------------------------------------------------------
// 07–10 THE CENTER — freeze; the line collapses into the star (GRAVITY PULL)
// ---------------------------------------------------------------------------
export const O3Center: React.FC = () => {
  const f = useG('center');
  const origin = starOnScreen(f);
  const line = 'Falta um centro.';
  const sz = fitSize(line, 3240, 300);
  const y = 300 + measureLine(line, sz).ascent;
  const exit = ease.inCubic(prog(f, 520, 572));
  const hold = f < K.starActivate;
  return (
    <>
      <Scrim y0={140} y1={y + 260} strength={0.5} />
      <Stage>
        <KineticText id="s3-line" text={line} x={1920} y={y} size={sz} color={COLORS.white} accent={{ from: 9, color: COLORS.lilac }}
          frame={f} start={K.centerText[0]} stagger={1.1} dur={16} mode="gravity" origin={origin} seed={30} exit={exit} />
        {hold && Math.floor(f / 8) % 2 === 0 && (
          <g transform="translate(1920 1940)">
            <rect x={-250} y={-34} width={16} height={46} fill={COLORS.lilac} />
            <rect x={-224} y={-34} width={16} height={46} fill={COLORS.lilac} />
            <Mono x={-190} y={6} color={COLORS.lilac} size={40}>HOLD · SISTEMA CONGELADO</Mono>
          </g>
        )}
        <Hud frame={f} theme={THEMES.space} scene="SC 03/08" tag="DG—CH.01  HOLD" sub="GRAVIDADE: ATIVA" freezeAt={hold ? K.freeze : undefined} />
      </Stage>
    </>
  );
};

// ---------------------------------------------------------------------------
// 10–13 LOGO REVEAL — star impulse; the camera finds the exact mark
// ---------------------------------------------------------------------------
export const O4Reveal: React.FC = () => {
  const f = useG('reveal');
  const flash = impulseFlash(f);
  // exact SVG mark over the aligned 3D ring (identical silhouette), handed back before the dive
  const logo = prog(f, K.logoAligned - 6, K.logoAligned) * (1 - prog(f, K.orbitalWipe[0], K.orbitalWipe[0] + 4));
  const word = 'Digital Galaxy';
  const brandFont = { family: FONTS.brand, weight: 700, tracking: 0.02 };
  const ws = fitSize(word, 2800, 230, brandFont);
  const wy = REVEAL_LOGO.cy + REVEAL_LOGO.r + 130 + measureLine(word, ws, brandFont).ascent;
  const sub = 'Estratégia e execução no mesmo lugar.';
  const subFont = { family: FONTS.body, weight: 400, tracking: 0 };
  const ss = fitSize(sub, 2600, 84, subFont);
  const sy = wy + 80 + measureLine(sub, ss, subFont).ascent;
  const exit = ease.inCubic(prog(f, K.orbitalWipe[0] - 4, K.orbitalWipe[0] + 8));
  const origin: [number, number] = [1920, REVEAL_LOGO.cy];
  return (
    <>
      {f >= K.logoAligned - 20 && <Scrim y0={wy - 330} y1={sy + 140} strength={0.45} />}
      <Stage>
        <StarImpulse f={f} />
        {logo > 0 && <BrandLogo x={1920} y={REVEAL_LOGO.cy} r={REVEAL_LOGO.r} opacity={logo} />}
        <KineticText id="s4-word" text={word} x={1920} y={wy} size={ws} font={brandFont} color={COLORS.white} frame={f} start={K.brandName} stagger={1} dur={16} mode="stellar" origin={origin} exit={exit} seed={40} />
        <KineticText id="s4-sub" text={sub} x={1920} y={sy} size={ss} font={subFont} color={COLORS.white} frame={f} start={K.brandSub} stagger={0.5} dur={14} mode="depth" exit={exit} origin={origin} seed={41} />
        <Hud frame={f} theme={THEMES.space} scene="SC 04/08" sub="NÚCLEO: ALINHADO" />
      </Stage>
      {flash > 0 && <AbsoluteFill style={{ backgroundColor: COLORS.lilac, opacity: flash, mixBlendMode: 'screen' }} />}
    </>
  );
};
