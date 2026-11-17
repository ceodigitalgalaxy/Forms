import React from 'react';
import { alpha, type Theme } from '../../brand/tokens';
import { FPS, WIDTH, HEIGHT } from '../../timeline/timeline';
import { Mono } from '../type/Mono';

const tc = (f: number) => { const s = Math.floor(f / FPS); return `00:00:${String(s).padStart(2, '0')}:${String(f % FPS).padStart(2, '0')}`; };
const M = 96; // HUD margin (decorative layer — outside the title-safe area by design)

/** Broadcast HUD: corner brackets, live tag, timecode, coordinates, scene code, dot grid. */
export const Hud: React.FC<{ frame: number; theme: Theme; scene: string; tag?: string; sub?: string; coords?: string; minimal?: boolean; opacity?: number; freezeAt?: number }> = ({
  frame, theme, scene, tag = 'DG—CH.01  LIVE', sub = 'DIGITAL GALAXY / BROADCAST', coords, minimal, opacity = 1, freezeAt,
}) => {
  const c = theme.fg, L = 96, w = 5;
  const ra = 5 + ((frame / FPS) * 0.37) % 1, dec = 22 + Math.sin(frame / 42) * 0.5;
  const blink = Math.floor(frame / 30) % 2 === 0;
  return (
    <g opacity={opacity}>
      <path d={`M${M} ${M + L}V${M}H${M + L} M${WIDTH - M - L} ${M}H${WIDTH - M}V${M + L} M${WIDTH - M} ${HEIGHT - M - L}V${HEIGHT - M}H${WIDTH - M - L} M${M + L} ${HEIGHT - M}H${M}V${HEIGHT - M - L}`}
        fill="none" stroke={c} strokeWidth={w} />
      {!minimal && (
        <>
          <circle cx={M + 52} cy={M + 66} r={11} fill={blink ? theme.ac : alpha(theme.dark ? '#F5F3FA' : '#13073B', 0.25)} />
          <Mono x={M + 80} y={M + 78} color={c} size={38}>{tag}</Mono>
          <Mono x={M + 40} y={M + 130} color={c} size={28} weight={500} opacity={0.8}>{sub}</Mono>
          <path d={`M${M + 40} ${M + 158}H${M + 520}` + Array.from({ length: 13 }, (_, i) => `M${M + 40 + i * 40} ${M + 158}v${i % 4 ? 12 : 24}`).join('')} stroke={c} strokeWidth={2.5} opacity={0.6} />
          <Mono x={WIDTH - M - 40} y={M + 78} color={c} size={38} anchor="end">TC {tc(freezeAt ?? frame)}</Mono>
          <Mono x={WIDTH - M - 40} y={M + 130} color={c} size={28} weight={500} anchor="end" opacity={0.8}>3840×2160 · 60P</Mono>
          {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={WIDTH - M - 40 - (i % 6) * 30} cy={M + 175 + Math.floor(i / 6) * 30} r={4} fill={c} opacity={0.7} />)}
          <Mono x={M + 40} y={HEIGHT - M - 44} color={c} size={30} weight={500}>{coords ?? `RA 0${Math.floor(ra)}h ${String(Math.floor((ra % 1) * 60)).padStart(2, '0')}m · DEC +${dec.toFixed(2)}°`}</Mono>
          <Mono x={WIDTH - M - 40} y={HEIGHT - M - 44} color={c} size={38} anchor="end">{scene}</Mono>
        </>
      )}
    </g>
  );
};
