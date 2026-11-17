import React, { useId } from 'react';
import { FONTS, TITLE } from '../../brand/tokens';
import { ease, clamp, lerp } from '../../lib/easing';
import { rnd } from '../../lib/random';
import { measureLine, fitSize, type FontSpec } from '../../lib/text-layout';
import { assertSafe, assertRule, applyContainer, hasAccent, type Container } from '../../lib/safe-area';

export type LetterStyle = 'f' | 'o' | 'b'; // fill · outline · solid block
/**
 * COSMIC TYPOGRAPHY motions (all settle to a still, fully legible line):
 *  gravity  — letters are born at the gravity point and pulled along curved paths into place
 *  orbital  — letters sweep in on short orbital arcs before aligning
 *  stellar  — a star-pulse mask reveals the line from the gravity point
 *  depth    — the line arrives from depth (controlled scale, no skew)
 *  rise     — classic masked rise (used sparingly)
 */
export type EntryMode = 'gravity' | 'orbital' | 'stellar' | 'depth' | 'rise';

export type KineticTextProps = {
  id: string;
  text: string;
  x: number;
  y: number; // baseline
  align?: 'left' | 'center' | 'right';
  size?: number;
  fit?: { maxWidth: number; maxSize: number };
  font?: FontSpec;
  color: string;
  styles?: string;
  blockColor?: string;
  blockText?: string;
  outlineWidth?: number;
  frame: number;
  start: number;
  stagger?: number;
  dur?: number;
  mode?: EntryMode;
  /** Gravity point letters are born from / collapse into (default: frame centre). */
  origin?: [number, number];
  seed?: number;
  opacity?: number;
  container?: Container;
  /** 0..1 COSMIC COMPRESSION exit: letters collapse into `origin`, last letter first. */
  exit?: number;
  /** Transient GRAVITATIONAL LENS: letters bend away from (x,y) and magnify slightly. */
  lens?: { x: number; y: number; radius: number; strength: number };
  essential?: boolean;
  accent?: { from: number; to?: number; color: string };
};

export const resolveSize = (p: Pick<KineticTextProps, 'text' | 'size' | 'fit' | 'font' | 'styles' | 'outlineWidth'>) => {
  if (p.size) return p.size;
  const f = (w: number) => fitSize(p.text, w, p.fit!.maxSize, p.font);
  const s = f(p.fit!.maxWidth);
  return p.styles?.includes('o') ? f(p.fit!.maxWidth - s * (p.outlineWidth ?? 0.02)) : s;
};

export const KineticText: React.FC<KineticTextProps> = (p) => {
  const uid = useId().replace(/:/g, '');
  const font = { family: p.font?.family ?? FONTS.display, weight: p.font?.weight ?? TITLE.weight, tracking: p.font?.tracking ?? TITLE.tracking };
  const size = resolveSize(p);
  const m = measureLine(p.text, size, font);
  const styles = p.styles ?? '';
  const ow = (p.outlineWidth ?? 0.02) * size;
  const padX = styles.includes('o') ? ow / 2 : 0;
  const x0 = p.align === 'left' ? p.x + padX : p.align === 'right' ? p.x - m.width - padX : p.x - m.width / 2;
  const stagger = p.stagger ?? 1.6, dur = p.dur ?? 20, mode = p.mode ?? 'gravity', seed = p.seed ?? 1;
  const [ox, oy] = p.origin ?? [1920, 1080];
  const blockPad = size * 0.08;
  const hasBlock = styles.includes('b');

  if (p.frame >= p.start && p.essential !== false) {
    const top = Math.max(m.ascent, hasBlock ? m.capHeight + blockPad : 0) + (styles.includes('o') ? ow / 2 : 0);
    const bottom = Math.max(m.descent, hasBlock ? blockPad : 0);
    assertSafe(p.id, applyContainer({ x0: x0 - padX, y0: p.y - top, x1: x0 + m.width + padX, y1: p.y + bottom }, p.container));
    for (let i = 0; i < p.text.length; i++)
      if (styles[i] === 'b') assertRule(p.id, !hasAccent(p.text[i]), `block style on accented letter "${p.text[i]}" would hide its accent`);
  }

  const n = p.text.length;
  const exit = p.exit ?? 0;
  const capC = p.y - m.capHeight / 2;
  // stellar mask: a circle growing from the origin, star-sharp edge drawn by the scene
  const stellarR = mode === 'stellar' ? ease.outQuart(clamp((p.frame - p.start) / (dur + n * stagger))) * 4600 : 0;
  const letters: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const ch = p.text[i];
    if (ch === ' ') continue;
    const lt = p.frame - (p.start + i * stagger);
    if (lt < 0 && mode !== 'stellar') continue;
    const pr = mode === 'stellar' ? 1 : clamp(lt / dur);
    const r1 = rnd(seed * 977 + i * 131), r2 = rnd(seed * 313 + i * 71 + 5);
    const left = x0 + m.xs[i], cw = m.xs[i + 1] - m.xs[i] - font.tracking * size, cx = left + cw / 2;
    let dx = 0, dy = 0, sc = 1, op = 1, rot = 0;
    if (mode === 'gravity') {
      // born at the gravity point, pulled along a spiral that tightens as it lands
      const e = ease.snap(pr);
      const sx = ox - cx, sy = oy - capC;
      const swirl = (1 - e) * (0.9 + r1 * 0.6) * (i % 2 ? 1 : -1);
      const c = Math.cos(swirl), s = Math.sin(swirl);
      dx = (sx * c - sy * s) * (1 - e); dy = (sx * s + sy * c) * (1 - e);
      sc = lerp(0.05, 1, e); op = clamp(pr * 4);
    } else if (mode === 'orbital') {
      const e = ease.outQuart(pr);
      const a = (1 - e) * (1.2 + r1) * (r2 < 0.5 ? 1 : -1), R = size * (0.9 + r2 * 0.8) * (1 - e);
      dx = Math.sin(a) * R; dy = (1 - Math.cos(a)) * R * 0.6 * (r1 < 0.5 ? 1 : -1);
      op = clamp(pr * 3);
    } else if (mode === 'depth') {
      const e = ease.outQuart(pr);
      sc = lerp(0.72, 1, e); op = clamp(pr * 2.5); dy = (1 - e) * size * 0.12;
    } else if (mode === 'rise') {
      dy = (1 - ease.outExpo(pr)) * size * 0.95;
    }
    // COSMIC COMPRESSION exit (reverse stagger): collapse into the origin
    if (exit > 0) {
      const ex = ease.inExpo(clamp(exit * 1.5 - ((n - 1 - i) / Math.max(1, n - 1)) * 0.5));
      dx = lerp(dx, ox - cx, ex); dy = lerp(dy, oy - capC, ex); sc *= 1 - ex * 0.97; rot += ex * (i % 2 ? 1 : -1) * 0.6;
    }
    if (p.lens && p.lens.strength > 0) {
      const lx = cx + dx - p.lens.x, ly = capC + dy - p.lens.y, d = Math.hypot(lx, ly) || 1;
      const k = p.lens.strength * Math.exp(-((d / p.lens.radius) ** 2));
      dx += (lx / d) * k * p.lens.radius * 0.25; dy += (ly / d) * k * p.lens.radius * 0.25; sc *= 1 + k * 0.12;
    }
    const st = (styles[i] as LetterStyle) || 'f';
    const col = p.accent && i >= p.accent.from && i < (p.accent.to ?? n) ? p.accent.color : p.color;
    const tf = `translate(${cx + dx} ${dy}) translate(0 ${capC}) rotate(${(rot * 180) / Math.PI}) scale(${sc}) translate(0 ${-capC})`;
    const bh = (m.capHeight + blockPad * 2) * clamp(pr * 1.8);
    letters.push(
      <g key={i} transform={tf} opacity={op}>
        {st === 'b' && <rect x={-cw / 2 - size * 0.02} y={p.y + blockPad - bh} width={cw + size * 0.04} height={bh} fill={p.blockColor ?? col} />}
        <text x={0} y={p.y} textAnchor="middle"
          style={{ fontFamily: font.family, fontWeight: font.weight, fontSize: size }}
          fill={st === 'o' ? 'none' : st === 'b' ? p.blockText ?? '#13073B' : col}
          stroke={st === 'o' ? col : 'none'} strokeWidth={st === 'o' ? ow : 0} strokeLinejoin="round">
          {ch}
        </text>
      </g>,
    );
  }
  const clip = mode === 'rise';
  return (
    <g opacity={p.opacity ?? 1}>
      <defs>
        {clip && <clipPath id={`kc${uid}`}><rect x={x0 - size} y={p.y - m.ascent - size * 0.15} width={m.width + size * 2} height={m.ascent + m.descent + size * 0.3 + blockPad} /></clipPath>}
        {mode === 'stellar' && <clipPath id={`ks${uid}`}><circle cx={ox} cy={oy} r={Math.max(0.1, stellarR)} /></clipPath>}
      </defs>
      <g clipPath={clip ? `url(#kc${uid})` : mode === 'stellar' ? `url(#ks${uid})` : undefined}>{letters}</g>
    </g>
  );
};
