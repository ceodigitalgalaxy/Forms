/** Deterministic hash → [0,1). Same input, same output, on every render worker. */
export function rnd(n: number): number {
  let t = (Math.imul(n | 0, 2654435761) + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const rndRange = (n: number, a: number, b: number) => a + (b - a) * rnd(n);
