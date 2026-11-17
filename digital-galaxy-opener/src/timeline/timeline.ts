// Single source of truth for timing. Read by the scenes (frames) and by
// scripts/export-cues.mjs, which feeds the sound-design script. Keep this file
// free of imports and non-erasable TS syntax so Node can load it directly.

export const FPS = 60;
export const WIDTH = 3840;
export const HEIGHT = 2160;
export const DURATION = 1800; // 30s

export const SCENES = {
  signal: { from: 0, dur: 180 }, // 00–03  THE SIGNAL
  chaos: { from: 180, dur: 240 }, // 03–07  CHAOS
  center: { from: 420, dur: 180 }, // 07–10  THE CENTER
  reveal: { from: 600, dur: 180 }, // 10–13  LOGO REVEAL
  process: { from: 780, dur: 180 }, // 13–16  THE PROCESS
  pillars: { from: 960, dur: 420 }, // 16–23  THE FIVE PILLARS
  promise: { from: 1380, dur: 240 }, // 23–27  THE PROMISE
  final: { from: 1620, dur: 180 }, // 27–30  FINAL ORBIT
} as const;
export type SceneId = keyof typeof SCENES;

// ---- scene-local key frames ----
export const SIGNAL = { star: 4, rings: 12, lines: [42, 84, 120], stack: 150 };
export const CHAOS = { cut: 30, phrase: [0, 120], line: [4, 26, 46] };
export const CENTER = { textA: 6, textB: 28, star: 60, pulse: 72, pull: [84, 166], clear: [150, 172] };
export const REVEAL = { ring: [0, 40], hole: [10, 54], lift: [44, 80], planets: [40, 86], word: [60, 74], sub: 98 };
export const PROCESS = { checkpoints: [40, 82, 124, 160], travel: 32 };
export const PILLARS = { card: 84, wipe: 16, sub: 42 };
export const PROMISE = { cards: [0, 60, 120], sub: 30, stack: [180, 194, 208] };
export const FINAL = { pull: [0, 64], converge: [62, 112], text: 108, handles: 130 };

export type Cue = { frame: number; type: string; gain?: number; dur?: number };

/** Sound-design cue sheet, derived from the key frames above (global frames). */
export function buildCues(): Cue[] {
  const c: Cue[] = [];
  const at = (s: SceneId, f: number, type: string, o: Partial<Cue> = {}) => c.push({ frame: SCENES[s].from + f, type, ...o });
  // signal
  at('signal', SIGNAL.star, 'starPulse', { gain: 0.8 });
  SIGNAL.lines.forEach((f) => { at('signal', f - 10, 'swish', { dur: 10 }); at('signal', f, 'impact', { gain: 1 }); });
  at('signal', SIGNAL.stack, 'impact', { gain: 0.7 });
  at('signal', 160, 'whoosh', { dur: 20 });
  // chaos
  for (let f = 0; f < SCENES.chaos.dur; f += CHAOS.cut) at('chaos', f, 'cut', { gain: f % 120 === 0 ? 1 : 0.45 });
  CHAOS.phrase.forEach((p) => CHAOS.line.forEach((l, i) => at('chaos', p + l, 'impact', { gain: i === 2 ? 1 : 0.75 })));
  at('chaos', 218, 'whoosh', { dur: 22 });
  // center
  at('center', 0, 'freeze');
  at('center', CENTER.textA, 'impact', { gain: 0.9 });
  at('center', CENTER.textB, 'impact', { gain: 1.1 });
  at('center', CENTER.star, 'starPulse', { gain: 1 });
  at('center', CENTER.pulse, 'starPulse', { gain: 0.7 });
  at('center', CENTER.pull[0], 'riser', { dur: SCENES.center.dur - CENTER.pull[0] });
  // reveal
  at('reveal', 0, 'drop');
  at('reveal', REVEAL.word[0], 'impact', { gain: 0.8 });
  at('reveal', REVEAL.word[1], 'impact', { gain: 0.8 });
  at('reveal', REVEAL.sub, 'shimmer');
  at('reveal', 158, 'whoosh', { dur: 22 });
  // process
  at('process', 0, 'impact', { gain: 0.8 });
  PROCESS.checkpoints.forEach((f) => { at('process', f - PROCESS.travel, 'swish', { dur: PROCESS.travel - 4 }); at('process', f, 'checkpoint'); });
  // pillars
  for (let i = 0; i < 5; i++) {
    const f = i * PILLARS.card;
    if (i > 0) { at('pillars', f - PILLARS.wipe, 'swish', { dur: PILLARS.wipe }); at('pillars', f - PILLARS.wipe, 'tick'); }
    at('pillars', f, 'impact', { gain: 1 });
    at('pillars', f + PILLARS.sub, 'cut', { gain: 0.6 });
  }
  at('pillars', SCENES.pillars.dur - 22, 'whoosh', { dur: 22 });
  // promise
  PROMISE.cards.forEach((f) => { at('promise', f, 'impact', { gain: 1.1 }); at('promise', f + PROMISE.sub, 'cut', { gain: 0.8 }); });
  PROMISE.stack.forEach((f, i) => at('promise', f, 'impact', { gain: 0.7 + i * 0.2 }));
  at('promise', 222, 'riser', { dur: 18 });
  // final
  at('final', 0, 'impact', { gain: 1 });
  at('final', 0, 'whoosh', { dur: FINAL.pull[1] });
  at('final', FINAL.converge[0], 'riser', { dur: FINAL.converge[1] - FINAL.converge[0] });
  at('final', FINAL.converge[1], 'final');
  return c.sort((a, b) => a.frame - b.frame);
}
