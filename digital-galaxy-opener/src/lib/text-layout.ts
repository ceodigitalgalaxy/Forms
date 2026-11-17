// Canvas-based text metrics (same shaping engine as the SVG text that is rendered).
// Fonts must be loaded first — see <FontGate/>.
type Metrics = { width: number; ascent: number; descent: number; xs: number[]; capHeight: number };
const cache = new Map<string, Metrics>();
let ctx: CanvasRenderingContext2D | null = null;
const getCtx = () => {
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable');
  return ctx;
};

export function measureLine(text: string, size: number, weight = 900, family = 'Inter', tracking = -0.02): Metrics {
  const key = `${text}|${size.toFixed(2)}|${weight}|${family}|${tracking}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const c = getCtx();
  c.font = `${weight} ${size}px "${family}"`;
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
export function fitSize(text: string, maxWidth: number, maxSize: number, weight = 900, family = 'Inter', tracking = -0.02) {
  const w100 = measureLine(text, 100, weight, family, tracking).width;
  return Math.min(maxSize, Math.floor((100 * maxWidth) / w100));
}

/** One shared size for several lines (keeps a stack typographically even). */
export const fitSizeAll = (lines: string[], maxWidth: number, maxSize: number, weight = 900) =>
  Math.min(...lines.map((l) => fitSize(l, maxWidth, maxSize, weight)));

/** Baseline that optically centres a line's cap height on `cy`. */
export const centeredBaseline = (text: string, size: number, cy: number, weight = 900) => cy + measureLine(text, size, weight).capHeight / 2;

/**
 * Stack lines so the block is vertically centred on `cy`, using real glyph
 * ascent/descent (accents included) plus `gap` (em of the larger neighbour).
 */
export function stackBaselines(lines: Array<{ text: string; size: number; weight?: number }>, cy: number, gap = 0.16): number[] {
  const ms = lines.map((l) => measureLine(l.text, l.size, l.weight ?? 900));
  // use cap-height + accent allowance consistently so lines with/without accents align evenly
  const asc = lines.map((l, i) => Math.max(ms[i].ascent, ms[i].capHeight));
  const desc = lines.map((l, i) => Math.max(ms[i].descent, l.size * 0.02));
  const ys: number[] = [];
  let y = 0;
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) y += desc[i - 1] + gap * Math.max(lines[i - 1].size, lines[i].size) + asc[i];
    ys.push(y);
  }
  const top = -asc[0], bottom = ys[ys.length - 1] + desc[desc.length - 1];
  const off = cy - (top + bottom) / 2;
  return ys.map((v) => v + off);
}
