import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { Theme } from '../../brand/tokens';

export type Panel = { clip: string; theme: Theme };
/**
 * Split-screen colour panels. The same content is rendered once per panel in that
 * panel's theme and clipped to it, so type and graphics invert cleanly across cuts.
 */
export const ClipPanels: React.FC<{ panels: Panel[]; children: (t: Theme, i: number) => React.ReactNode }> = ({ panels, children }) => (
  <AbsoluteFill>
    {panels.map((p, i) => (
      <AbsoluteFill key={i} style={{ clipPath: p.clip, backgroundColor: p.theme.bg }}>
        {children(p.theme, i)}
      </AbsoluteFill>
    ))}
  </AbsoluteFill>
);

/** Helpers for CSS polygons in composition px. */
export const rect = (x0: number, y0: number, x1: number, y1: number) => `polygon(${x0}px ${y0}px, ${x1}px ${y0}px, ${x1}px ${y1}px, ${x0}px ${y1}px)`;
export const poly = (pts: Array<[number, number]>) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
