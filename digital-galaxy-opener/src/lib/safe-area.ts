import { getInputProps } from 'remotion';
import { WIDTH, HEIGHT } from '../timeline/timeline';

/** Mandatory title-safe area for 3840×2160 (L/R 300px, T/B 220px). */
export const SAFE = { x0: 300, y0: 220, x1: WIDTH - 300, y1: HEIGHT - 220 };
export type Box = { x0: number; y0: number; x1: number; y1: number };

export type Container = { scale?: number; cx?: number; cy?: number; dx?: number; dy?: number };
export function applyContainer(b: Box, c?: Container): Box {
  if (!c) return b;
  const s = c.scale ?? 1, cx = c.cx ?? WIDTH / 2, cy = c.cy ?? HEIGHT / 2, dx = c.dx ?? 0, dy = c.dy ?? 0;
  const t = (x: number, y: number) => [cx + (x - cx) * s + dx, cy + (y - cy) * s + dy];
  const [x0, y0] = t(b.x0, b.y0), [x1, y1] = t(b.x1, b.y1);
  return { x0, y0, x1, y1 };
}

const ACCENTED = /[ÁÀÂÃÉÊÍÓÔÕÚÇ]/;
export const hasAccent = (s: string) => ACCENTED.test(s);

declare global { interface Window { __dgSafe?: Record<string, string> } }

/**
 * Automatic check: every essential text block must sit fully inside SAFE.
 * In validation renders (inputProps.validate = true) a violation throws and fails the render.
 */
export function assertSafe(id: string, box: Box) {
  const tol = 0.5;
  const bad = box.x0 < SAFE.x0 - tol || box.y0 < SAFE.y0 - tol || box.x1 > SAFE.x1 + tol || box.y1 > SAFE.y1 + tol;
  if (!bad) return;
  const msg = `SAFE-AREA VIOLATION "${id}": box x ${box.x0.toFixed(0)}–${box.x1.toFixed(0)}, y ${box.y0.toFixed(0)}–${box.y1.toFixed(0)} (safe x ${SAFE.x0}–${SAFE.x1}, y ${SAFE.y0}–${SAFE.y1})`;
  if ((getInputProps() as { validate?: boolean }).validate) throw new Error(msg);
  if (typeof window !== 'undefined') { window.__dgSafe = window.__dgSafe ?? {}; if (!window.__dgSafe[id]) console.warn(msg); window.__dgSafe[id] = msg; }
}
export function assertRule(id: string, ok: boolean, msg: string) {
  if (ok) return;
  const m = `LAYOUT RULE "${id}": ${msg}`;
  if ((getInputProps() as { validate?: boolean }).validate) throw new Error(m);
  console.warn(m);
}
