// Renders reference stills and enforces the layout rules.
//   node scripts/stills.mjs [--every 6] [--scale 0.25] [--out out/stills] [frames...]
// Every still is rendered with inputProps.validate = true: a text block outside the
// title-safe area (or a block letter hiding an accent) throws and is reported here.
import { bundle } from '@remotion/bundler';
import { openBrowser, renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : d; };
const every = Number(opt('--every', 0));
const scale = Number(opt('--scale', 0.25));
const outDir = opt('--out', 'out/stills');
let frames = args.map(Number);
if (every) frames = Array.from({ length: Math.ceil(1800 / every) }, (_, i) => i * every).concat([1799]);
if (!frames.length) frames = [30, 60, 100, 140, 175, 200, 260, 340, 400, 440, 500, 560, 615, 660, 760, 840, 900, 950, 1000, 1040, 1100, 1190, 1270, 1360, 1400, 1450, 1520, 1600, 1650, 1700, 1760, 1799];

fs.mkdirSync(outDir, { recursive: true });
const inputProps = { validate: true, muted: true };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browser = await openBrowser('chrome');
const composition = await selectComposition({ serveUrl, id: 'DigitalGalaxyOpener', inputProps, puppeteerInstance: browser });
const failures = [];
for (const frame of frames) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.jpg`);
  try {
    await renderStill({ composition, serveUrl, frame, output, imageFormat: 'jpeg', jpegQuality: 88, scale, inputProps, puppeteerInstance: browser });
  } catch (e) {
    const msg = String(e?.message ?? e).split('\n')[0];
    failures.push(`frame ${frame}: ${msg}`);
    console.error(`✗ frame ${frame}: ${msg}`);
  }
}
await browser.close({ silent: true });
console.log(`${frames.length - failures.length}/${frames.length} frames passed layout validation → ${outDir}`);
if (failures.length) process.exit(1);
