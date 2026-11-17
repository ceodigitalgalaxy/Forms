// ============================================================================
// AUDIOVISUAL TIMELINE — the single source of truth.
// Scenes, camera, 3D world state, typography AND the sound design all read the
// frames below. scripts/export-cues.mjs exports AV_EVENTS for the score.
// Keep this file free of imports and non-erasable TS syntax (Node loads it raw).
// ============================================================================

export const FPS = 60;
export const WIDTH = 3840;
export const HEIGHT = 2160;
export const DURATION = 1800; // exactly 30 s

/** Musical grid: 28 frames per beat = 128.57 BPM (≈130 BPM, frame-exact). */
export const BEAT = 28;
export const BPM = (60 * FPS) / BEAT;
export const beat = (n: number) => Math.round(n * BEAT);

export const SCENES = {
  signal: { from: 0, dur: 168 }, //   00.0–02.8  THE SIGNAL        (6 beats)
  chaos: { from: 168, dur: 252 }, //  02.8–07.0  CHAOS             (9 beats)
  center: { from: 420, dur: 168 }, // 07.0–09.8  THE CENTER        (6 beats)
  reveal: { from: 588, dur: 196 }, // 09.8–13.1  LOGO REVEAL       (7 beats)
  process: { from: 784, dur: 168 }, //13.1–15.9  THE PROCESS       (6 beats)
  pillars: { from: 952, dur: 420 }, //15.9–22.9  THE FIVE PILLARS  (15 beats, 3 per pillar)
  promise: { from: 1372, dur: 252 }, //22.9–27.1 THE PROMISE       (9 beats)
  final: { from: 1624, dur: 176 }, // 27.1–30.0  FINAL ORBIT
} as const;
export type SceneId = keyof typeof SCENES;

// ---- key frames (GLOBAL frames) ----
export const K = {
  // signal
  light: 0,
  starReveal: 28,
  signalLines: [56, 84, 112],
  signalStack: 126,
  compress: [148, 168] as [number, number], // COSMIC COMPRESSION → chaos
  // chaos
  chaosCut: 28,
  chaosPhrases: [168, 280],
  chaosLine: [4, 18, 32],
  // center
  freeze: 420,
  centerText: [434, 448],
  starActivate: 476,
  contraction: [476, 588] as [number, number], // GRAVITY PULL
  // reveal
  expansion: 588, // STAR IMPULSE → COSMIC EXPANSION
  planetLock: [612, 620, 628, 636, 644], // STELLAR ALIGNMENT
  ringThrough: 662, // camera threads an orbit ring
  logoAligned: 700,
  brandName: 702,
  brandSub: 728,
  orbitalWipe: [764, 784] as [number, number], // ORBITAL WIPE
  // process
  checkpoints: [812, 854, 896, 938],
  // pillars
  pillar: [952, 1036, 1120, 1204, 1288],
  pillarLen: 84,
  slingshot: 16, // last frames of each pillar = ORBITAL SLINGSHOT
  // promise
  lens: [1352, 1372] as [number, number], // GRAVITATIONAL LENS
  promise: [1372, 1428, 1484],
  promiseStack: [1540, 1554, 1568],
  promisePull: [1596, 1624] as [number, number],
  // final
  pullback: [1624, 1690] as [number, number],
  align: [1690, 1740] as [number, number], // orbits converge into the logo
  alignTicks: [1700, 1708, 1716, 1724, 1732],
  logoLock: 1740,
  cta: 1748,
  handles: 1770,
};

// ---------------------------------------------------------------------------
// AV EVENTS — each event drives a visual behaviour AND a sound.
// ---------------------------------------------------------------------------
export type Motion =
  | 'stellarPulse' | 'gravityType' | 'cut' | 'compression' | 'freeze' | 'contraction' | 'expansion'
  | 'alignment' | 'orbitPass' | 'orbitalWipe' | 'checkpoint' | 'slingshot' | 'lens' | 'logoLock' | 'end';
export type Sound =
  | 'stellarPulse' | 'gravityImpact' | 'typeHit' | 'cutHit' | 'compression' | 'freeze' | 'contraction'
  | 'expansion' | 'alignTick' | 'orbitalPass' | 'orbitalWipe' | 'checkpoint' | 'slingshot' | 'lens' | 'sonicLogo' | 'shimmer';
export type AVEvent = {
  id: string;
  /** Frame of the impact / sync point. */
  frame: number;
  /** Frames of build-up BEFORE `frame` (risers, whooshes, pulls). */
  pre?: number;
  /** Frames of tail AFTER `frame`. */
  dur?: number;
  motion: Motion;
  sound: Sound;
  /** 0..1.5 — small / medium / monumental. */
  intensity: number;
  /** Stereo position: start → end in [-1, 1] (follows the object on screen). */
  pan?: [number, number];
  /** Optional musical pitch offset (semitones) for motif variations. */
  pitch?: number;
};

export function buildEvents(): AVEvent[] {
  const e: AVEvent[] = [];
  const add = (x: AVEvent) => e.push(x);
  // 00–03 THE SIGNAL
  add({ id: 'light', frame: K.light, dur: 40, motion: 'stellarPulse', sound: 'stellarPulse', intensity: 0.35 });
  add({ id: 'star-reveal', frame: K.starReveal, dur: 40, motion: 'stellarPulse', sound: 'stellarPulse', intensity: 0.7, pitch: 0 });
  K.signalLines.forEach((f, i) => add({ id: `signal-line-${i}`, frame: f, pre: 10, motion: 'gravityType', sound: 'typeHit', intensity: 0.7 + i * 0.12 }));
  add({ id: 'signal-stack', frame: K.signalStack, motion: 'gravityType', sound: 'typeHit', intensity: 0.55 });
  add({ id: 'compression', frame: K.compress[1], pre: K.compress[1] - K.compress[0], motion: 'compression', sound: 'compression', intensity: 1 });
  // 03–07 CHAOS
  for (let k = 0; k < 9; k++) add({ id: `chaos-cut-${k}`, frame: SCENES.chaos.from + k * BEAT, motion: 'cut', sound: 'cutHit', intensity: k % 4 === 0 ? 0.9 : 0.5, pan: [k % 2 ? 0.35 : -0.35, k % 2 ? 0.35 : -0.35] });
  K.chaosPhrases.forEach((p, pi) => K.chaosLine.forEach((l, li) => add({ id: `chaos-${pi}-${li}`, frame: p + l, motion: 'gravityType', sound: 'typeHit', intensity: li === 2 ? 0.95 : 0.6 })));
  add({ id: 'chaos-pass-a', frame: 238, pre: 16, dur: 16, motion: 'orbitPass', sound: 'orbitalPass', intensity: 0.8, pan: [-0.8, 0.8] });
  add({ id: 'chaos-pass-b', frame: 350, pre: 16, dur: 16, motion: 'orbitPass', sound: 'orbitalPass', intensity: 0.8, pan: [0.8, -0.8] });
  // 07–10 THE CENTER
  add({ id: 'freeze', frame: K.freeze, dur: 30, motion: 'freeze', sound: 'freeze', intensity: 1 });
  K.centerText.forEach((f, i) => add({ id: `center-text-${i}`, frame: f, motion: 'gravityType', sound: 'typeHit', intensity: 0.6 + i * 0.3 }));
  add({ id: 'star-activate', frame: K.starActivate, dur: 50, motion: 'stellarPulse', sound: 'stellarPulse', intensity: 1.0, pitch: 2 });
  add({ id: 'contraction', frame: K.contraction[1], pre: K.contraction[1] - K.contraction[0], motion: 'contraction', sound: 'contraction', intensity: 1.2 });
  // 10–13 LOGO REVEAL
  add({ id: 'expansion', frame: K.expansion, dur: 90, motion: 'expansion', sound: 'expansion', intensity: 1.5 });
  add({ id: 'logo-born', frame: K.expansion, dur: 60, motion: 'stellarPulse', sound: 'gravityImpact', intensity: 1.5 });
  K.planetLock.forEach((f, i) => add({ id: `lock-${i}`, frame: f, motion: 'alignment', sound: 'alignTick', intensity: 0.5 + i * 0.06, pitch: i * 2, pan: [[-0.6, 0.5, -0.3, 0.7, 0][i], [-0.6, 0.5, -0.3, 0.7, 0][i]] }));
  add({ id: 'ring-through', frame: K.ringThrough, pre: 22, dur: 18, motion: 'orbitPass', sound: 'orbitalPass', intensity: 1, pan: [-0.9, 0.9] });
  add({ id: 'logo-aligned', frame: K.logoAligned, motion: 'logoLock', sound: 'gravityImpact', intensity: 0.9 });
  add({ id: 'brand-sub', frame: K.brandSub, motion: 'gravityType', sound: 'shimmer', intensity: 0.5 });
  add({ id: 'orbital-wipe', frame: K.orbitalWipe[1], pre: K.orbitalWipe[1] - K.orbitalWipe[0], motion: 'orbitalWipe', sound: 'orbitalWipe', intensity: 1, pan: [0.6, -0.6] });
  // 13–16 THE PROCESS
  K.checkpoints.forEach((f, i) => {
    add({ id: `cp-travel-${i}`, frame: f, pre: 26, motion: 'orbitPass', sound: 'orbitalPass', intensity: 0.45, pan: [0.7, -0.7] });
    add({ id: `cp-${i}`, frame: f, dur: 36, motion: 'checkpoint', sound: 'checkpoint', intensity: 0.55 + i * 0.1, pitch: [0, 3, 5, 7][i] });
  });
  // 16–23 THE FIVE PILLARS
  K.pillar.forEach((f, i) => {
    if (i > 0) add({ id: `slingshot-${i}`, frame: f, pre: K.slingshot, motion: 'slingshot', sound: 'slingshot', intensity: 0.85, pan: i % 2 ? [-0.8, 0.8] : [0.8, -0.8] });
    add({ id: `pillar-${i}`, frame: f, motion: 'gravityType', sound: 'gravityImpact', intensity: 0.8 + i * 0.04 });
    add({ id: `pillar-pulse-${i}`, frame: f + 42, motion: 'stellarPulse', sound: 'stellarPulse', intensity: 0.3, pitch: i });
  });
  // 23–27 THE PROMISE
  add({ id: 'lens', frame: K.lens[1], pre: K.lens[1] - K.lens[0], motion: 'lens', sound: 'lens', intensity: 1 });
  K.promise.forEach((f, i) => add({ id: `promise-${i}`, frame: f, motion: 'gravityType', sound: 'gravityImpact', intensity: 1.0 + i * 0.1 }));
  K.promiseStack.forEach((f, i) => add({ id: `promise-stack-${i}`, frame: f, motion: 'gravityType', sound: 'typeHit', intensity: 0.6 + i * 0.15 }));
  add({ id: 'promise-pull', frame: K.promisePull[1], pre: K.promisePull[1] - K.promisePull[0], motion: 'contraction', sound: 'contraction', intensity: 0.8 });
  // 27–30 FINAL ORBIT
  add({ id: 'final-expansion', frame: K.pullback[0], dur: 70, motion: 'expansion', sound: 'expansion', intensity: 1.1 });
  add({ id: 'final-pass', frame: K.pullback[0] + 30, pre: 20, dur: 30, motion: 'orbitPass', sound: 'orbitalPass', intensity: 0.7, pan: [0.9, -0.9] });
  K.alignTicks.forEach((f, i) => add({ id: `align-${i}`, frame: f, motion: 'alignment', sound: 'alignTick', intensity: 0.45 + i * 0.08, pitch: [0, 2, 3, 5, 7][i] }));
  add({ id: 'logo-lock', frame: K.logoLock, dur: 60, motion: 'logoLock', sound: 'sonicLogo', intensity: 1.5 });
  add({ id: 'cta', frame: K.cta, motion: 'gravityType', sound: 'typeHit', intensity: 0.35 });
  add({ id: 'end', frame: DURATION, motion: 'end', sound: 'shimmer', intensity: 0 });
  return e.sort((a, b) => a.frame - b.frame);
}

export const AV_EVENTS = buildEvents();
/** Frames of a given motion type (visual layers subscribe to these). */
export const framesOf = (m: Motion) => AV_EVENTS.filter((x) => x.motion === m).map((x) => x.frame);
