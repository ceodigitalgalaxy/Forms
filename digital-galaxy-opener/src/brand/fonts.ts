import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// Typography mirrors digitalgalaxy.com.br (css/style.css):
//   --font-display: "Galaxy"  → Orbitron 600 for titles. Letters with a tilde
//     (Ã Õ ã õ) are excluded via unicode-range and fall back to Sora — exactly
//     like the site, because Orbitron's tilde reads as a grave accent.
//   --font-brand:   "Orbitron" 700 (brand name, indexes)
//   --font-body:    "Sora" 400–700 (body, eyebrows, subtitles)
// Font files are the site's own Fontsource latin subsets (SIL Open Font License).
const GALAXY_RANGE = 'U+0000-00C2, U+00C4-00D4, U+00D6-00E2, U+00E4-00F4, U+00F6-FFFF';

type Face = { family: string; file: string; weight: string; unicodeRange?: string };
const faces: Face[] = [
  { family: 'Galaxy', file: 'orbitron-latin-600-normal.woff2', weight: '600', unicodeRange: GALAXY_RANGE },
  { family: 'Orbitron', file: 'orbitron-latin-600-normal.woff2', weight: '600' },
  { family: 'Orbitron', file: 'orbitron-latin-700-normal.woff2', weight: '700' },
  { family: 'Sora', file: 'sora-latin-400-normal.woff2', weight: '400' },
  { family: 'Sora', file: 'sora-latin-500-normal.woff2', weight: '500' },
  { family: 'Sora', file: 'sora-latin-600-normal.woff2', weight: '600' },
  { family: 'Sora', file: 'sora-latin-700-normal.woff2', weight: '700' },
  { family: 'JetBrains Mono', file: 'JetBrainsMono-Medium.ttf', weight: '500' },
  { family: 'JetBrains Mono', file: 'JetBrainsMono-Bold.ttf', weight: '700' },
  { family: 'JetBrains Mono', file: 'JetBrainsMono-ExtraBold.ttf', weight: '800' },
];

let promise: Promise<void> | null = null;
export const loadBrandFonts = () => {
  if (!promise) {
    promise = Promise.all(
      faces.map((f) => loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight, unicodeRange: f.unicodeRange })),
    ).then(async () => {
      // make sure canvas measurement sees the fallback glyphs too
      await document.fonts.load('600 100px Galaxy', 'Aã');
      await document.fonts.load('600 100px Sora', 'ãõÃÕ');
    });
  }
  return promise;
};
