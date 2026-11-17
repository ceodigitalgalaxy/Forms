import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, THEMES, alpha } from '../brand/tokens';
import { FINAL, SCENES } from '../timeline/timeline';
import { ease, lerp, prog } from '../lib/easing';
import { LOGO_ELEVATION, makeProjector, type Camera } from '../lib/projection';
import { HOLE, OUTER, STAR } from '../brand/logoGeometry';
import { fitSize, measureLine } from '../lib/text-layout';
import { assertSafe } from '../lib/safe-area';
import { SpaceBackground } from '../components/fx/Background';
import { Stage } from '../components/fx/Stage';
import { Dust } from '../components/fx/Dust';
import { Hud } from '../components/fx/Hud';
import { OrbitalSystem } from '../components/brand/OrbitalSystem';
import { LogoReveal } from '../components/brand/LogoReveal';
import { BrandStar } from '../components/brand/BrandStar';
import { StarPulse } from '../components/brand/StarPulse';
import { KineticText } from '../components/type/KineticText';

const LOGO_R = 300; // end-card logo radius (px)
const LOGO_Y = 760;
const ZF = 0.62; // final px-per-world-unit at the core (brand view)
const CTA = 'COLOQUE SUA MARCA EM ÓRBITA.';
const HANDLES = ['@digitalgalaxymkt', 'digitalgalaxy.com.br'];

/** 27–30s FINAL ORBIT — pull back to the full system, which collapses into the original mark. */
export const S08FinalOrbit: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + SCENES.final.from;
  const p = ease.inOutQuint(prog(f, FINAL.pull[0], FINAL.pull[1]));
  const conv = ease.inOutCubic(prog(f, FINAL.converge[0], FINAL.converge[1]));
  const D = lerp(3400, 14000, p), el = lerp(0.2, LOGO_ELEVATION, p), az = lerp(-1.1, 0, p);
  const scale = lerp(2.3, ZF, p);
  const cy = lerp(1080, LOGO_Y, ease.inOutQuint(prog(f, 92, 122)));
  const cam: Camera = {
    eye: [D * Math.sin(az) * Math.cos(el), D * Math.sin(el), -D * Math.cos(az) * Math.cos(el)],
    target: [0, 0, 0], focal: scale * D, roll: lerp(-8, 45, p), cx: 1920, cy,
  };
  const s0 = makeProjector(cam)([0, 0, 0]).s;
  const k = s0 / ZF; // screen scale relative to the final logo size
  const r = LOGO_R * k;
  const ls = r / OUTER.r;
  const starX = 1920 + (STAR.cx - OUTER.cx) * ls, starY = cy + (STAR.cy - OUTER.cy) * ls;
  const logoOn = f >= 96;
  const holeWorld = (HOLE.rx * (LOGO_R / OUTER.r)) / ZF;

  const cs = fitSize(CTA, 3100, 170);
  const ctaY = LOGO_Y + LOGO_R + 150 + measureLine(CTA, cs).ascent;
  const hs = 60, hw = HANDLES.map((h) => measureLine(h, hs, 700, 'JetBrains Mono', 0).width), hgap = 150;
  const htotal = hw[0] + hw[1] + hgap;
  const hy = ctaY + 190;
  const hp = ease.outExpo(prog(f, FINAL.handles, FINAL.handles + 18));
  if (f >= FINAL.handles) assertSafe('s8-handles', { x0: 1920 - htotal / 2, y0: hy - hs * 0.8, x1: 1920 + htotal / 2, y1: hy + hs * 0.25 });

  return (
    <>
      <SpaceBackground glow={0.28} gy={(cy / 2160) * 100} />
      <Stage>
        <Dust frame={g} dx={-p * 900} dy={-g * 2} opacity={0.8 * (1 - conv * 0.5)} />
        <OrbitalSystem
          frame={g}
          cam={cam}
          extraSpin={2.6 * ease.inOutCubic(prog(f, 0, FINAL.pull[1]))}
          converge={conv}
          convergeTo={holeWorld}
          orbitOpacity={0.9 * (1 - prog(f, 106, 116))}
          planetOpacity={1 - prog(f, 90, 108)}
          trails={1 - conv}
          lineWidth={lerp(4, 3, p)}
          centerAbove
          center={
            <g>
              <circle cx={1920} cy={cy} r={r * 2.9} fill="url(#finalHalo)" />
              <defs>
                <radialGradient id="finalHalo">
                  <stop offset="0.3" stopColor={alpha(COLORS.violet, 0.55)} />
                  <stop offset="1" stopColor={alpha(COLORS.violet, 0)} />
                </radialGradient>
              </defs>
              {logoOn ? (
                <>
                  <StarPulse x={starX} y={starY} arm={STAR.arm * ls} t={f - FINAL.converge[1]} dur={50} strength={1.2} />
                  <LogoReveal x={1920} y={cy} r={r} draw={prog(f, 96, 106)} sweep={prog(f, 98, FINAL.converge[1] + 4)} />
                </>
              ) : (
                <BrandStar x={starX} y={starY} arm={STAR.arm * ls} color={COLORS.white} glow={1.4} />
              )}
            </g>
          }
        />
        <KineticText id="s8-cta" text={CTA} x={1920} y={ctaY} size={cs} color={COLORS.white} accent={{ from: 18, color: COLORS.lilac }}
          frame={f} start={FINAL.text} stagger={0.9} dur={14} mode="rise" seed={99} />
        {f >= FINAL.handles && (
          <g opacity={hp} transform={`translate(0 ${(1 - hp) * 30})`}>
            <text x={1920 - htotal / 2} y={hy} style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: hs }} fill={COLORS.lilac}>{HANDLES[0]}</text>
            <BrandStar x={1920 - htotal / 2 + hw[0] + hgap / 2} y={hy - hs * 0.33} arm={20} color={COLORS.white} />
            <text x={1920 - htotal / 2 + hw[0] + hgap} y={hy} style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: hs }} fill={COLORS.white}>{HANDLES[1]}</text>
          </g>
        )}
        <Hud frame={g} theme={THEMES.space} scene="SC 08/08" sub="FINAL ORBIT" minimal={f >= FINAL.text} />
      </Stage>
    </>
  );
};
