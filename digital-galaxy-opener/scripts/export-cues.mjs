// Exports the cue sheet from src/timeline/timeline.ts (single source of truth) for the sound design.
import { mkdirSync, writeFileSync } from 'node:fs';
import { buildCues, DURATION, FPS, SCENES } from '../src/timeline/timeline.ts';

mkdirSync('public/audio', { recursive: true });
const cues = buildCues();
writeFileSync('public/audio/cues.json', JSON.stringify({ fps: FPS, durationInFrames: DURATION, scenes: SCENES, cues }, null, 1));
console.log(`cues.json: ${cues.length} cues`);
