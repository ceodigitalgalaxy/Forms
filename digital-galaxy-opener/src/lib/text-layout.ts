// Canvas text metrics with the same fonts/fallbacks the SVG text uses.
// Fonts must be loaded first — see <FontGate/>.
import { FONTS, TITLE } from '../brand/tokens';

type Metrics = { width: number; ascent: number; descent: number; xs: number[]; capHeight: number };
const cache = new Map<string, Metrics>();
let ctx: CanvasRenderingContext2D | null = null;
const getCtx = () => {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');
  return ctx;
};
export type FontSpec = { family?: string; weight?: number; tracking?: number };
const spec = (s?: FontSpec) => ({ family: s?.family ?? FONTS.display, weight: s?.weight ?? TITLE.weight, tracking: s?.tracking ?? TITLE.tracking });

export function measureLine(text: string, size: number, font?: FontSpec): Metrics {
  const { family, weight, tracking } = spec(font);
  const key = `${text}|${size.toFixed(2)}|${weight}|${family}|${tracking}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = getCtx();
  c.font = `${weight} ${size}px ${family}`;
  const xs: number[] = [];
  for (let i = 0; i <= text.length; i++) xs.push(c.measureText(text.slice(0, i)).width + i * tracking * size);
  const m = c.measureText(text);
  const cap = c.measureText('H');
  const res: Metrics = {
    xs,
    width: Math.max(xs[text.length] - tracking * size, m.actualBoundingBoxRight),
    ascent: m.actualBoundingBoxAscent,
    descent: m.actualBoundingBoxDescent,
    capHeight: cap.actualBoundingBoxAscent,
  };
  cache.set(key, res);
  return res;
}

/** Largest font size (≤ maxSize) at which `text` fits in `maxWidth`. */
export function fitSize(text: string, maxWidth: number, maxSize: number, font?: FontSpec) {
  const w100 = measureLine(text, 100, font).width;
  return Math.min(maxSize, Math.floor((100 * maxWidth) / w100));
}
/** One shared size for several lines (keeps a stack typographically even). */
export const fitSizeAll = (lines: string[], maxWidth: number, maxSize: number, font?: FontSpec) =>
  Math.min(...lines.map((l) => fitSize(l, maxWidth, maxSize, font)));

/** Baseline that optically centres a line's cap height on `cy`. */
export const centeredBaseline = (text: string, size: number, cy: number, font?: FontSpec) => cy + measureLine(text, size, font).capHeight / 2;

/**
 * Baselines for a stack of lines, centred on `cy`, spaced with the site's
 * title line-height (1.12) measured on real glyph extents (accents included).
 */
export function stackBaselines(lines: Array<{ text: string; size: number; font?: FontSpec }>, cy: number, lineHeight: number = TITLE.lineHeight): number[] {
  const ys: number[] = [];
  let y = 0;
  lines.forEach((l, i) => { if (i > 0) y += Math.max(lines[i - 1].size, l.size) * lineHeight; ys.push(y); });
  const first = measureLine(lines[0].text, lines[0].size, lines[0].font);
  const last = measureLine(lines[lines.length - 1].text, lines[lines.length - 1].size, lines[lines.length - 1].font);
  const top = -Math.max(first.ascent, first.capHeight), bottom = ys[ys.length - 1] + Math.max(last.descent, 0);
  const off = cy - (top + bottom) / 2;
  return ys.map((v) => v + off);
}
