import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, THEMES, alpha, type Theme } from '../brand/tokens';
import { PILLARS, SCENES } from '../timeline/timeline';
import { clamp, ease, lerp, prog } from '../lib/easing';
import { rnd } from '../lib/random';
import { fitSize, fitSizeAll, measureLine } from '../lib/text-layout';
import { ClipPanels, poly, rect, type Panel } from '../components/fx/ClipPanels';
import { Stage } from '../components/fx/Stage';
import { StarWipe } from '../components/fx/StarWipe';
import { Hud } from '../components/fx/Hud';
import { BrandStar } from '../components/brand/BrandStar';
import { BrandLogo } from '../components/brand/BrandLogo';
import { OrbitalRing } from '../components/brand/OrbitalRing';
import { StarPulse } from '../components/brand/StarPulse';
import { KineticText } from '../components/type/KineticText';
import { Mono } from '../components/type/Mono';

const W = 3840, H = 2160;
type Card = { n: string; label: string; theme: Theme; alt: Theme; numSide: 'left' | 'right'; num: 'f' | 'o'; numColor?: (t: Theme) => string };
const CARDS: Card[] = [
  { n: '01', label: 'ESTRATÉGIA', theme: THEMES.lilac, alt: THEMES.space, numSide: 'right', num: 'o' },
  { n: '02', label: 'MARCA', theme: THEMES.space, alt: THEMES.lilac, numSide: 'left', num: 'f', numColor: (t) => (t.dark ? COLORS.lilac : t.fg) },
  { n: '03', label: 'CONTEÚDO', theme: THEMES.violet, alt: THEMES.space, numSide: 'right', num: 'f' },
  { n: '04', label: 'PERFORMANCE', theme: THEMES.white, alt: THEMES.violet, numSide: 'left', num: 'f', numColor: (t) => (t.bg === COLORS.white ? COLORS.violet : t.fg) },
  { n: '05', label: 'PRESENÇA DIGITAL', theme: THEMES.space, alt: THEMES.lilac, numSide: 'right', num: 'o', numColor: (t) => (t.dark ? COLORS.lilac : t.fg) },
];
const NUM_SIZE = () => fitSizeAll(CARDS.map((c) => c.n), 1500, 1120);
const LABEL_SIZE = () => fitSizeAll(CARDS.map((c) => c.label), 3240, 290);

/** Split-screen geometry per card; jumps on the half-beat (`sub`). */
function panels(i: number, f: number): Panel[] {
  const c = CARDS[i], half = f >= PILLARS.sub, d = ease.outCubic(prog(f % PILLARS.sub, 0, 30)) * 60;
  const base = { clip: rect(0, 0, W, H), theme: c.theme };
  const A: Record<number, [string, string]> = {
    0: [poly([[W, 0], [W, H], [W - 900 - d, H], [W - 900 - 2160 * 0.5 - d, 0]]), rect(0, 1960 - d * 0.3, W, H)],
    1: [rect(0, 0, W, 300 + d * 0.4), poly([[W, 0], [W, H], [W - 760 - d, H]])],
    2: [rect(0, 1980 - d * 0.3, W, H), rect(W - 420 - d, 0, W, H)],
    3: [poly([[0, 0], [1200 + d, 0], [0, 1200 + d]]), rect(0, 0, 360 + d * 0.4, H)],
    4: [rect(0, 1990 - d * 0.3, W, H), poly([[0, H], [0, H - 900 - d], [900 + d, H]])],
  };
  return [base, { clip: A[i][half ? 1 : 0], theme: c.alt }];
}

// ---------------- per-pillar graphics (region: gx..gx+1560, 440..1460) ----------------
const Gfx: React.FC<{ i: number; f: number; t: Theme; gx: number }> = ({ i, f, t, gx }) => {
  const cx = gx + 780, cy = 950;
  const p = (a: number, b: number, e = ease.outExpo) => e(prog(f, a, b));
  if (i === 0) {
    // ESTRATÉGIA — a target built from the logo's tilted ring, aiming at the star
    return (
      <g>
        {[0, 1, 2, 3, 4].map((k) => (
          <OrbitalRing key={k} cx={cx} cy={cy} r={140 + k * 130} color={t.fg} width={k === 4 ? 8 : 5} progress={p(4 + k * 3, 30 + k * 3, ease.inOutCubic)} opacity={0.35 + k * 0.13} start={-90 + f * (k % 2 ? 0.4 : -0.4)} />
        ))}
        <path d={`M${cx - 760} ${cy}H${cx + 760}M${cx} ${cy - 520}V${cy + 520}`} stroke={t.fg} strokeWidth={3} strokeDasharray="10 16" opacity={p(10, 30)} />
        <BrandStar x={cx} y={cy} arm={82 * p(14, 32, (x) => ease.outBack(x, 2))} color={t.fg} />
        <StarPulse x={cx} y={cy} arm={70} t={f - 30} dur={40} color={t.fg} />
        <Mono x={cx + 110} y={cy - 110} color={t.fg} size={34} opacity={p(30, 36)}>ALVO · 0.0.0</Mono>
      </g>
    );
  }
  if (i === 1) {
    // MARCA — the identity system itself: mark, typeface, palette
    const chips: Array<[string, string]> = [[COLORS.space, '#13073B'], [COLORS.lilac, '#C9BCFF'], [COLORS.white, '#F5F3FA'], [COLORS.violet, '#7C5CFF']];
    return (
      <g>
        <BrandLogo x={gx + 190} y={600} r={150 * p(0, 20, (x) => ease.outBack(x, 1.8))} color={t.fg} />
        <text x={gx + 420} y={720} style={{ fontFamily: 'Inter', fontWeight: 900, fontSize: 300 }} fill={t.fg} opacity={p(6, 14)}>Aa</text>
        <Mono x={gx + 870} y={560} color={t.fg} size={34} opacity={p(10, 16)}>INTER · BLACK</Mono>
        <Mono x={gx + 870} y={610} color={t.fg} size={28} weight={500} opacity={p(12, 18) * 0.8}>JETBRAINS MONO</Mono>
        {chips.map(([c, hex], k) => {
          const e = p(10 + k * 4, 30 + k * 4);
          const x = gx + k * 395, y = 860 + (1 - e) * 500;
          return (
            <g key={k} opacity={e > 0 ? 1 : 0}>
              <rect x={x} y={y} width={360} height={560} fill={c} stroke={t.fg} strokeWidth={c === t.bg ? 4 : 0} />
              <Mono x={x + 28} y={y + 520} color={c === COLORS.space || c === COLORS.violet ? COLORS.white : COLORS.space} size={34}>{hex}</Mono>
            </g>
          );
        })}
      </g>
    );
  }
  if (i === 2) {
    // CONTEÚDO — a living feed: three rows of formats at different speeds
    return (
      <g>
        <defs><clipPath id="feedclip"><rect x={gx} y={440} width={1560} height={1040} /></clipPath></defs>
        <g clipPath="url(#feedclip)">
          {[0, 1, 2].map((row) => {
            const h = row === 1 ? 380 : 300, y = 440 + row * 360 + (row === 2 ? 40 : 0);
            const speed = [5.5, -7, 4][row], off = (f * speed) % 2400;
            return Array.from({ length: 9 }, (_, k) => {
              const w = rnd(row * 31 + k) < 0.5 ? h * 0.75 : h;
              const x = gx - 600 + k * 340 + off;
              const filled = rnd(row * 17 + k * 3) < 0.35;
              const e = p(row * 4 + k * 1.2, row * 4 + k * 1.2 + 16);
              return (
                <g key={`${row}-${k}`} opacity={e}>
                  <rect x={x} y={y + (1 - e) * 80} width={w * 0.86} height={(row === 1 ? 330 : 270)} rx={18} fill={filled ? t.fg : 'none'} stroke={t.fg} strokeWidth={5} />
                  {filled ? (
                    <BrandStar x={x + w * 0.43} y={y + (row === 1 ? 165 : 135) + (1 - e) * 80} arm={34} color={t.bg} />
                  ) : (
                    <path d={`M${x + w * 0.38} ${y + 105 + (1 - e) * 80}l70 40l-70 40z`} fill={t.fg} />
                  )}
                </g>
              );
            });
          })}
        </g>
      </g>
    );
  }
  if (i === 3) {
    // PERFORMANCE — growth drawn along an orbit-like curve, ending on the star
    const base = 1400, left = gx + 60, bw = 150, gap = 92;
    const hs = [260, 380, 470, 620, 760, 900];
    const pts = hs.map((h, k) => [left + k * (bw + gap) + bw / 2, base - h - 60] as const);
    const dl = p(18, 50, ease.inOutCubic);
    const path = pts.map((q, k) => `${k ? 'L' : 'M'}${q[0]} ${q[1]}`).join('');
    const last = pts[pts.length - 1];
    return (
      <g>
        <path d={`M${left - 40} ${base}H${gx + 1540}M${left - 40} ${base}V${450}`} stroke={t.fg} strokeWidth={4} />
        {Array.from({ length: 5 }, (_, k) => <line key={k} x1={left - 40} x2={gx + 1540} y1={base - (k + 1) * 190} y2={base - (k + 1) * 190} stroke={t.fg} strokeOpacity={0.18} strokeWidth={3} />)}
        {hs.map((h, k) => {
          const e = p(4 + k * 3, 22 + k * 3);
          return <rect key={k} x={left + k * (bw + gap)} y={base - h * e} width={bw} height={h * e} fill={k === hs.length - 1 ? t.ac : t.fg} opacity={k === hs.length - 1 ? 1 : 0.85} />;
        })}
        <path d={path} fill="none" stroke={t.ac === COLORS.violet ? COLORS.violet : t.fg} strokeWidth={8} pathLength={1000} strokeDasharray={`${dl * 1000} 1000`} strokeLinejoin="round" />
        {dl >= 1 && <StarPulse x={last[0]} y={last[1]} arm={50} t={f - 50} dur={34} color={t.fg} />}
        <BrandStar x={last[0]} y={last[1]} arm={56 * ease.outBack(prog(f, 48, 60), 2)} color={t.fg} />
      </g>
    );
  }
  // PRESENÇA DIGITAL — a constellation of channels connected to the brand
  const nodes = Array.from({ length: 10 }, (_, k) => {
    const ring = k % 3, a = rnd(k * 13 + 3) * Math.PI * 2 + f * 0.012 * (ring % 2 ? 1 : -1), r = 300 + ring * 200;
    const ex = r * Math.cos(a), ey = r * 0.659 * Math.sin(a), c = Math.cos(Math.PI / 4), s = Math.sin(Math.PI / 4);
    return { x: cx + ex * c - ey * s, y: cy + ex * s + ey * c, k };
  });
  const tags = ['SITE', 'SEO LOCAL', 'GOOGLE', 'REDES'];
  return (
    <g>
      {[0, 1, 2].map((k) => <OrbitalRing key={k} cx={cx} cy={cy} r={300 + k * 200} color={t.fg} width={4} opacity={0.45} progress={p(k * 3, 26 + k * 3, ease.inOutCubic)} />)}
      {[0, 1, 2].map((k) => {
        const q = ((f - k * 18) % 54) / 54;
        return f - k * 18 > 0 ? <OrbitalRing key={`ping${k}`} cx={cx} cy={cy} r={120 + q * 820} color={t.ac} width={6} opacity={(1 - q) * 0.8} /> : null;
      })}
      {nodes.map((n) => {
        const e = p(8 + n.k * 2, 22 + n.k * 2);
        return (
          <g key={n.k}>
            <line x1={cx} y1={cy} x2={lerp(cx, n.x, e)} y2={lerp(cy, n.y, e)} stroke={t.fg} strokeOpacity={0.5} strokeWidth={3} />
            <circle cx={n.x} cy={n.y} r={18 * e} fill={t.fg} />
            {n.k < 4 && e >= 1 && <Mono x={n.x + 32} y={n.y + 12} color={t.fg} size={30}>{tags[n.k]}</Mono>}
          </g>
        );
      })}
      <BrandStar x={cx} y={cy} arm={86 * p(0, 16, (x) => ease.outBack(x, 2))} color={t.fg} glow={t.dark ? 1 : 0} />
    </g>
  );
};

const PillarCard: React.FC<{ i: number; f: number; g: number }> = ({ i, f, g }) => {
  const c = CARDS[i];
  const ns = NUM_SIZE(), ls = LABEL_SIZE();
  const nm = measureLine(c.n, ns, 900, 'Inter', -0.04);
  const numY = 450 + nm.capHeight;
  const numX = c.numSide === 'right' ? 3540 : 300;
  const gx = c.numSide === 'right' ? 300 : 1980;
  const labelY = 1930 - Math.max(measureLine(c.label, ls).descent, ls * 0.03);
  return (
    <ClipPanels panels={panels(i, f)}>
      {(t) => (
        <Stage>
          <Gfx i={i} f={f} t={t} gx={gx} />
          <KineticText id={`s6-num-${c.n}`} text={c.n} x={numX} align={c.numSide} y={numY} size={ns} tracking={-0.04} color={c.numColor ? c.numColor(t) : t.fg}
            styles={c.num + c.num} outlineWidth={0.012} frame={f} start={2} stagger={5} dur={18} mode={i % 2 ? 'rise' : 'drop'} seed={60 + i} />
          <Mono x={300} y={330} color={t.fg} size={44} spacing={0.3}>{`PILAR ${c.n} / 05`}</Mono>
          {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={300 + k * 128} y={362} width={112} height={10} fill={t.fg} opacity={k <= i ? 1 : 0.22} />)}
          <Mono x={3540} y={330} color={t.fg} size={34} anchor="end" weight={500}>{`DG-PLR-${c.n} · SERVIÇO`}</Mono>
          <KineticText id={`s6-label-${c.n}`} text={c.label} x={300} align="left" y={labelY} size={ls} color={t.fg} frame={f} start={8} stagger={1.6} dur={14} mode="rise" seed={70 + i}
            accent={i === 4 ? { from: 9, color: t.dark ? COLORS.lilac : t.fg } : undefined} />
          <Hud frame={g} theme={t} scene={`${c.n}/05`} sub="THE FIVE PILLARS" />
        </Stage>
      )}
    </ClipPanels>
  );
};

/** 16–23s THE FIVE PILLARS — five broadcast cards, each opened by the brand star. */
export const S06Pillars: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + SCENES.pillars.from;
  const i = Math.min(4, Math.floor(f / PILLARS.card));
  const local = f - i * PILLARS.card;
  const next = i + 1;
  const wipeStart = next * PILLARS.card - PILLARS.wipe;
  const wp = next < 5 ? ease.inCubic(prog(f, wipeStart, next * PILLARS.card)) : 0;
  return (
    <>
      <PillarCard i={i} f={local} g={g} />
      {wp > 0 && (
        <StarWipe p={clamp(wp)} x={1920} y={1080}>
          <PillarCard i={next} f={f - next * PILLARS.card} g={g} />
        </StarWipe>
      )}
      {wp > 0 && wp < 1 && (
        <Stage>
          <BrandStar x={1920} y={1080} arm={Math.max(1, wp * wp * 9000 * (44.5 / 36.5))} color={COLORS.white} outline={10} opacity={0.9} />
          <Mono x={1920} y={1080 + 30} anchor="middle" color={alpha(COLORS.white, 1)} size={90} opacity={wp < 0.15 ? 1 : 0}>{CARDS[next].n}</Mono>
        </Stage>
      )}
    </>
  );
};
