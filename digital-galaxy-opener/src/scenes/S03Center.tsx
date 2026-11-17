import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, THEMES, alpha } from '../brand/tokens';
import { CENTER, SCENES } from '../timeline/timeline';
import { ease, lerp, prog } from '../lib/easing';
import { fitSize, measureLine } from '../lib/text-layout';
import { SpaceBackground } from '../components/fx/Background';
import { Stage } from '../components/fx/Stage';
import { Dust } from '../components/fx/Dust';
import { Hud } from '../components/fx/Hud';
import { Planet } from '../components/brand/OrbitalSystem';
import { BrandStar } from '../components/brand/BrandStar';
import { StarPulse } from '../components/brand/StarPulse';
import { OrbitalRing } from '../components/brand/OrbitalRing';
import { KineticText } from '../components/type/KineticText';
import { Mono } from '../components/type/Mono';
import { ARCS, BODIES, FREEZE_FRAME, arcAngle, bodyPos } from './chaosField';
import { STAR_ARM } from './S01Signal';

const CX = 1920, CY = 1080;

/** 07–10s THE CENTER — everything freezes; the star switches on and pulls the universe in. */
export const S03Center: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + SCENES.center.from;
  const pull = ease.inCubic(prog(f, CENTER.pull[0], CENTER.pull[1]));
  const lines = prog(f, CENTER.pull[0] - 12, CENTER.pull[0] + 4);
  const starIn = ease.outBack(prog(f, CENTER.star, CENTER.star + 18), 2.4);
  const charge = prog(f, 120, 180);
  const arm = STAR_ARM * starIn * (1 + 0.35 * charge * charge);
  const exit = ease.inCubic(prog(f, CENTER.clear[0], CENTER.clear[1]));

  const sA = fitSize('FALTA UM', 3240, 400), sB = fitSize('CENTRO.', 3240, 470);
  const yA = 260 + measureLine('FALTA UM', sA).ascent;
  const yB = 1930 - Math.max(measureLine('CENTRO.', sB).descent, 4);

  return (
    <>
      <SpaceBackground glow={0.12 + 0.25 * starIn + 0.3 * charge} />
      <Stage>
        <Dust frame={420} dy={-420 * 2} opacity={0.7} />
        {/* frozen fragments, then attraction toward the star */}
        {ARCS.map((a, i) => {
          const cx = lerp(a.cx, CX, pull), cy = lerp(a.cy, CY, pull), r = a.r * (1 - pull);
          if (r < 2) return null;
          return (
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * a.aspect} transform={`rotate(${arcAngle(i, FREEZE_FRAME) + pull * 140} ${cx} ${cy})`}
              fill="none" stroke={COLORS.violet} strokeWidth={a.width} pathLength={1000} strokeDasharray={`${a.span * 1000} 1000`} strokeLinecap="round" opacity={1 - pull * 0.6} />
          );
        })}
        {BODIES.map((b, i) => {
          const p0 = bodyPos(i, FREEZE_FRAME);
          const dx = p0.x - CX, dy = p0.y - CY, ang = pull * 1.6, c = Math.cos(ang), s = Math.sin(ang), k = 1 - pull;
          const x = CX + (dx * c - dy * s) * k, y = CY + (dx * s + dy * c) * k;
          if (k <= 0.01) return null;
          const prev = Math.max(0, pull - 0.06);
          const pc = Math.cos(prev * 1.6), ps = Math.sin(prev * 1.6), pk = 1 - prev;
          return (
            <g key={i}>
              {lines > 0 && (
                <line x1={x} y1={y} x2={lerp(x, CX, lines)} y2={lerp(y, CY, lines)} stroke={COLORS.violet} strokeWidth={3} strokeDasharray="14 18" opacity={0.85 * k} />
              )}
              {pull > 0 && (
                <line x1={CX + (dx * pc - dy * ps) * pk} y1={CY + (dx * ps + dy * pc) * pk} x2={x} y2={y} stroke={COLORS.lilac} strokeLinecap="round" strokeWidth={b.size * 1.2 * k} opacity={0.5} />
              )}
              <Planet x={x} y={y} r={b.size * (0.35 + 0.65 * k)} kind={b.kind} />
              {f < CENTER.star && (
                <g>
                  <path d={`M${x - 80} ${y - 50}v-30h30M${x + 80} ${y + 50}v30h-30`} stroke={COLORS.lilac} strokeWidth={4} fill="none" />
                  <Mono x={x + 100} y={y - 30} color={COLORS.lilac} size={30}>{`OBJ.${String(i + 1).padStart(2, '0')}`}</Mono>
                  <Mono x={x + 100} y={y + 10} color={COLORS.white} size={24} weight={500}>FREEZE</Mono>
                </g>
              )}
            </g>
          );
        })}
        {/* the star — origin of order */}
        {f >= CENTER.star && (
          <g>
            <StarPulse x={CX} y={CY} arm={STAR_ARM} t={f - CENTER.star} dur={50} strength={1.2} />
            <StarPulse x={CX} y={CY} arm={STAR_ARM} t={f - CENTER.pulse} dur={50} strength={0.8} />
            {[0, 1, 2].map((i) => (
              <OrbitalRing key={i} cx={CX} cy={CY} r={STAR_ARM * (2.2 + i * 1.3) * (1 + 0.2 * Math.sin(f / 9 + i))} color={alpha(COLORS.violet, 1)}
                width={3} opacity={0.6 * charge} dash={[18, 26]} dashOffset={-f * 4 * (i % 2 ? 1 : -1)} />
            ))}
            <BrandStar x={CX} y={CY} arm={arm} color={COLORS.white} glow={1 + charge * 1.5} />
          </g>
        )}
        <KineticText id="s3-a" text="FALTA UM" x={1920} y={yA} size={sA} color={COLORS.white} styles="fffffffoo" frame={f} start={CENTER.textA} stagger={2} dur={14} mode="drop" seed={30} exit={exit} />
        <KineticText id="s3-b" text="CENTRO." x={1920} y={yB} size={sB} color={COLORS.lilac} frame={f} start={CENTER.textB} stagger={2.6} dur={14} mode="rise" seed={31} exit={exit} />
        <Hud frame={g} theme={THEMES.space} scene="SC 03/08" tag="DG—CH.01  HOLD" sub="SINAL CONGELADO" freezeAt={SCENES.center.from} />
        {f < CENTER.clear[0] && (Math.floor(f / 10) % 2 === 0 || f > 40) && (
          <g transform="translate(2010 128)">
            <rect x={-250} y={-6} width={16} height={46} fill={COLORS.lilac} />
            <rect x={-224} y={-6} width={16} height={46} fill={COLORS.lilac} />
            <Mono x={-190} y={34} color={COLORS.lilac} size={40}>HOLD · FRAME 420</Mono>
          </g>
        )}
      </Stage>
    </>
  );
};
