// AudioTimeline export: the SAME events that drive the visuals (src/timeline/timeline.ts)
// are written to public/audio/cues.json for the sound-design engine.
import { mkdirSync, writeFileSync } from 'node:fs';
import { AV_EVENTS, BEAT, BPM, DURATION, FPS, K, SCENES } from '../src/timeline/timeline.ts';

mkdirSync('public/audio', { recursive: true });
writeFileSync('public/audio/cues.json', JSON.stringify({ fps: FPS, durationInFrames: DURATION, beatFrames: BEAT, bpm: BPM, scenes: SCENES, keys: K, events: AV_EVENTS }, null, 1));
console.log(`cues.json: ${AV_EVENTS.length} audiovisual events · ${BPM.toFixed(2)} BPM`);
