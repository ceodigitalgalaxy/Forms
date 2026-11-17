// Digital Galaxy identity — the ONLY colours used in the film.
export const COLORS = {
  space: '#13073B', // Deep Space Purple — base
  lilac: '#C9BCFF', // Soft Lilac — main accent
  white: '#F5F3FA', // Off-White — text
  violet: '#7C5CFF', // Electric Violet — glows & orbit lines
} as const;
export type BrandColor = (typeof COLORS)[keyof typeof COLORS];

const RGB: Record<string, [number, number, number]> = {
  [COLORS.space]: [19, 7, 59],
  [COLORS.lilac]: [201, 188, 255],
  [COLORS.white]: [245, 243, 250],
  [COLORS.violet]: [124, 92, 255],
};
/** Brand colour with alpha (transparency only — never a new hue). */
export const alpha = (c: string, a: number) => {
  const v = RGB[c];
  if (!v) throw new Error(`Off-palette colour: ${c}`);
  return `rgba(${v[0]},${v[1]},${v[2]},${a})`;
};

/** Colour themes for panels. fg = type, ac = accent. */
export type Theme = { bg: string; fg: string; ac: string; line: string; dark: boolean };
export const THEMES = {
  space: { bg: COLORS.space, fg: COLORS.white, ac: COLORS.lilac, line: COLORS.violet, dark: true },
  lilac: { bg: COLORS.lilac, fg: COLORS.space, ac: COLORS.violet, line: COLORS.space, dark: false },
  violet: { bg: COLORS.violet, fg: COLORS.white, ac: COLORS.lilac, line: COLORS.white, dark: false },
  white: { bg: COLORS.white, fg: COLORS.space, ac: COLORS.violet, line: COLORS.space, dark: false },
} satisfies Record<string, Theme>;

/** Font stacks — identical to the site's CSS variables. */
export const FONTS = {
  display: 'Galaxy, Sora', //  --font-display (titles): Orbitron 600, tildes in Sora
  brand: 'Orbitron, Sora', //  --font-brand  (brand name, indexes)
  body: 'Sora', //             --font-body   (subtitles, eyebrows)
  mono: 'JetBrains Mono', //   HUD codes only
} as const;
/** Title metrics from the site: weight 600, letter-spacing -0.01em, line-height 1.1–1.15. */
export const TITLE = { weight: 600, tracking: -0.01, lineHeight: 1.12 } as const;
