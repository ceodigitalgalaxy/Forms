import React, { useId } from 'react';
import { ease, clamp } from '../../lib/easing';
import { rnd } from '../../lib/random';
import { measureLine, fitSize } from '../../lib/text-layout';
import { assertSafe, assertRule, applyContainer, hasAccent, type Container } from '../../lib/safe-area';

export type LetterStyle = 'f' | 'o' | 'b'; // fill · outline · solid block
export type EntryMode = 'rise' | 'drop' | 'grow' | 'mixed' | 'cut';

export type KineticTextProps = {
  id: string;
  text: string;
  /** Anchor x and BASELINE y, in composition pixels. */
  x: number;
  y: number;
  align?: 'left' | 'center' | 'right';
  size?: number;
  fit?: { maxWidth: number; maxSize: number };
  weight?: number;
  tracking?: number;
  color: string;
  /** One char per letter: f = fill, o = outline, b = solid block (never on accented letters). */
  styles?: string;
  blockColor?: string;
  blockText?: string;
  outlineWidth?: number;
  frame: number;
  start: number;
  stagger?: number;
  dur?: number;
  mode?: EntryMode;
  seed?: number;
  opacity?: number;
  container?: Container;
  /** Exit: 0..1 — letters leave upward with a clip, in reverse stagger. */
  exit?: number;
  essential?: boolean;
  /** Cycle light→heavy weights while a letter enters (default true). */
  stepWeights?: boolean;
  /** Letters with index in [from, to) use this colour instead of `color`. */
  accent?: { from: number; to?: number; color: string };
};

const STEP_WEIGHTS = [300, 500, 700, 800];

/** Resolves the font size a KineticText will use (for stacking lines). */
export const resolveSize = (p: Pick<KineticTextProps, 'text' | 'size' | 'fit' | 'weight' | 'tracking' | 'styles' | 'outlineWidth'>) => {
  if (p.size) return p.size;
  const f = (w: number) => fitSize(p.text, w, p.fit!.maxSize, p.weight ?? 900, 'Inter', p.tracking ?? -0.02);
  const s = f(p.fit!.maxWidth);
  // outlined letters: reserve the stroke inside the available width
  return p.styles?.includes('o') ? f(p.fit!.maxWidth - s * (p.outlineWidth ?? 0.024)) : s;
};

/** Letter-by-letter kinetic headline. Every glyph is a pure function of `frame`. */
export const KineticText: React.FC<KineticTextProps> = (p) => {
  const uid = useId().replace(/:/g, '');
  const weight = p.weight ?? 900, tracking = p.tracking ?? -0.02;
  const size = resolveSize(p);
  const m = measureLine(p.text, size, weight, 'Inter', tracking);
  const styles = p.styles ?? '';
  const ow = (p.outlineWidth ?? 0.024) * size;
  const padX = styles.includes('o') ? ow / 2 : 0; // outline stroke stays inside the anchor
  const x0 = p.align === 'left' ? p.x + padX : p.align === 'right' ? p.x - m.width - padX : p.x - m.width / 2;
  const stagger = p.stagger ?? 2.4, dur = p.dur ?? 16, mode = p.mode ?? 'rise', seed = p.seed ?? 1;
  const blockPad = size * 0.07;
  const hasBlock = styles.includes('b');

  // ---- automatic layout checks ----
  if (p.frame >= p.start && p.essential !== false) {
    const top = Math.max(m.ascent, hasBlock ? m.capHeight + blockPad : 0) + (styles.includes('o') ? ow / 2 : 0);
    const bottom = Math.max(m.descent, hasBlock ? blockPad : 0);
    assertSafe(p.id, applyContainer({ x0: x0 - padX, y0: p.y - top, x1: x0 + m.width + padX, y1: p.y + bottom }, p.container));
    for (let i = 0; i < p.text.length; i++)
      if (styles[i] === 'b') assertRule(p.id, !hasAccent(p.text[i]), `block style on accented letter "${p.text[i]}" would hide its accent`);
  }

  const clipTop = p.y - m.ascent - size * 0.12, clipH = m.ascent + m.descent + size * 0.24 + blockPad;
  const exit = p.exit ?? 0;
  const letters: React.ReactNode[] = [];
  for (let i = 0; i < p.text.length; i++) {
    const ch = p.text[i];
    if (ch === ' ') continue;
    const lt = p.frame - (p.start + i * stagger);
    if (lt < 0) continue;
    const pr = clamp(lt / dur), e = ease.outExpo(pr);
    const r1 = rnd(seed * 977 + i * 131), r2 = rnd(seed * 313 + i * 71 + 5);
    const w = pr < 0.5 && mode !== 'cut' && p.stepWeights !== false ? STEP_WEIGHTS[Math.min(3, Math.floor(pr * 8))] : weight;
    const left = x0 + m.xs[i];
    const cw = m.xs[i + 1] - m.xs[i] - tracking * size;
    const cx = left + cw / 2;
    const st = (styles[i] as LetterStyle) || 'f';
    const col = p.accent && i >= p.accent.from && i < (p.accent.to ?? p.text.length) ? p.accent.color : p.color;
    let m2: EntryMode = mode;
    if (mode === 'mixed') m2 = r1 < 0.4 ? 'rise' : r1 < 0.7 ? 'grow' : 'drop';
    let ty = 0, sc = 1;
    if (m2 === 'rise') ty = (1 - e) * size * 0.95;
    if (m2 === 'drop') ty = -(1 - e) * size * 0.95;
    if (m2 === 'grow') { const s0 = 0.25 + r2 * 0.45; sc = s0 + (1 - s0) * e; ty = (1 - e) * size * 0.08; }
    // exit: reverse order rise-out
    const ex = clamp(exit * 1.6 - ((p.text.length - 1 - i) / Math.max(1, p.text.length - 1)) * 0.6);
    ty -= ease.inCubic(ex) * size * 1.0;
    const capC = p.y - m.capHeight / 2;
    const tf = `translate(${cx} ${ty}) translate(0 ${capC}) scale(${sc}) translate(0 ${-capC})`;
    const font = { fontFamily: 'Inter', fontWeight: w, fontSize: size } as const;
    letters.push(
      <g key={i} transform={tf}>
        {st === 'b' && (
          <rect
            x={-cw / 2 - size * 0.012}
            y={p.y + blockPad - (m.capHeight + blockPad * 2) * clamp(pr * 1.8)}
            width={cw + size * 0.024}
            height={(m.capHeight + blockPad * 2) * clamp(pr * 1.8)}
            fill={p.blockColor ?? col}
          />
        )}
        <text
          x={0}
          y={p.y}
          textAnchor="middle"
          style={font}
          fill={st === 'o' ? 'none' : st === 'b' ? p.blockText ?? '#13073B' : col}
          stroke={st === 'o' ? col : 'none'}
          strokeWidth={st === 'o' ? ow : 0}
          strokeLinejoin="round"
        >
          {ch}
        </text>
      </g>,
    );
  }
  const clipped = mode !== 'grow' || exit > 0;
  return (
    <g opacity={p.opacity ?? 1}>
      {clipped && (
        <defs>
          <clipPath id={`kc${uid}`}>
            <rect x={x0 - size} y={clipTop} width={m.width + size * 2} height={clipH} />
          </clipPath>
        </defs>
      )}
      <g clipPath={clipped ? `url(#kc${uid})` : undefined}>{letters}</g>
    </g>
  );
};
