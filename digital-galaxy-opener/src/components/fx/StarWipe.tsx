import React from 'react';
import { AbsoluteFill } from 'remotion';
import { starClipPolygon } from '../../brand/logoGeometry';

/** Reveals children through the brand star, scaling from the given point. p: 0..1. */
export const StarWipe: React.FC<{ p: number; x: number; y: number; children: React.ReactNode; maxArm?: number }> = ({ p, x, y, children, maxArm = 9000 }) => {
  if (p <= 0) return null;
  if (p >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ clipPath: starClipPolygon(x, y, Math.max(1, p * p * maxArm)) }}>{children}</AbsoluteFill>;
};
