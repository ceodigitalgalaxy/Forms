import React from 'react';
import { COLORS, FONTS } from '../../brand/tokens';
import { clamp } from '../../lib/easing';
import { BrandStar } from '../brand/BrandStar';
import { measureLine } from '../../lib/text-layout';
import { assertSafe } from '../../lib/safe-area';

/** Site eyebrow (.eyebrow): Sora 600, uppercase, letter-spacing 0.12em, lilac, led by the brand star. */
export const Eyebrow: React.FC<{ id: string; text: string; x: number; y: number; frame: number; start: number; size?: number; color?: string; align?: 'left' | 'center' }> = ({
  id, text, x, y, frame, start, size = 54, color = COLORS.lilac, align = 'left',
}) => {
  if (frame < start) return null;
  const font = { family: FONTS.body, weight: 600, tracking: 0.12 };
  const m = measureLine(text, size, font);
  const lead = size * 0.9;
  const total = lead + m.width;
  const x0 = align === 'center' ? x - total / 2 : x;
  assertSafe(id, { x0, y0: y - m.ascent, x1: x0 + total, y1: y + m.descent });
  const p = clamp((frame - start) / 14);
  const shown = Math.round(p * text.length); // types out like a transmission
  return (
    <g>
      <BrandStar x={x0 + size * 0.3} y={y - m.capHeight / 2} arm={size * 0.3 * Math.min(1, p * 3)} color={color} />
      <text x={x0 + lead} y={y} fill={color} style={{ fontFamily: font.family, fontWeight: 600, fontSize: size, letterSpacing: '0.12em' }}>{text.slice(0, shown)}</text>
    </g>
  );
};
