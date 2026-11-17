import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

const faces: Array<[string, string, string]> = [
  ['Inter', 'Inter-Light.otf', '300'],
  ['Inter', 'Inter-Medium.otf', '500'],
  ['Inter', 'Inter-SemiBold.otf', '600'],
  ['Inter', 'Inter-Bold.otf', '700'],
  ['Inter', 'Inter-ExtraBold.otf', '800'],
  ['Inter', 'Inter-Black.otf', '900'],
  ['JetBrains Mono', 'JetBrainsMono-Medium.ttf', '500'],
  ['JetBrains Mono', 'JetBrainsMono-Bold.ttf', '700'],
  ['JetBrains Mono', 'JetBrainsMono-ExtraBold.ttf', '800'],
];

let promise: Promise<void> | null = null;
/** Loads every brand face (Inter + JetBrains Mono, both OFL) from /public/fonts. */
export const loadBrandFonts = () => {
  if (!promise) {
    promise = Promise.all(
      faces.map(([family, file, weight]) => loadFont({ family, url: staticFile(`fonts/${file}`), weight, format: file.endsWith('otf') ? 'opentype' : 'truetype' })),
    ).then(() => undefined);
  }
  return promise;
};
