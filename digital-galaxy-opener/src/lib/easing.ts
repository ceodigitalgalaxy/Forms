// Deterministic easing toolkit — every motion in the film is a pure function of frame.
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 progress of frame f between frames a and b. */
export const prog = (f: number, a: number, b: number) => clamp((f - a) / (b - a));

export const ease = {
  linear: (t: number) => t,
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  inOutExpo: (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inCubic: (t: number) => t * t * t,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  inOutQuint: (t: number) => (t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2),
  outBack: (t: number, s = 1.7) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  /** "Broadcast snap": fast attack, long settle. */
  snap: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(1 - t, 5)),
};

/** Stop-and-go: hold, then move with inOutQuint, between key values at key frames. */
export function keyframes(f: number, keys: Array<[number, number]>, e: (t: number) => number = ease.inOutQuint) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], e(prog(f, keys[i - 1][0], keys[i][0])));
  }
  return keys[keys.length - 1][1];
}
