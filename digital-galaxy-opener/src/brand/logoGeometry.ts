// Exact geometry of the official Digital Galaxy mark
// (public/brand/logo-digital-galaxy-mark.svg, served at digitalgalaxy.com.br).
// Verified against the supplied artwork (public/brand/logo-reference-upload.jpg).
// DO NOT edit these paths — every logo instance in the film is drawn from them.

export const LOGO_VIEWBOX = { x: 92, y: 100, w: 265, h: 265 };

/** Outer ring: circle r=131.5 minus an ellipse 117.1×77.2 rotated 45° (even-odd). */
export const RING_PATH =
  'M356.00 232.50A131.5 131.5 0 1 0 93.00 232.50A131.5 131.5 0 1 0 356.00 232.50ZM307.60 315.30A117.1 77.2 45.0 1 0 142.00 149.70A117.1 77.2 45.0 1 0 307.60 315.30Z';

/** Four-point star with curved sides; drawn filled AND stroked (16, round join). */
export const STAR_PATH =
  'M224.80 198.50C224.80 222.22 237.58 235.00 261.30 235.00C237.58 235.00 224.80 247.78 224.80 271.50C224.80 247.78 212.03 235.00 188.30 235.00C212.03 235.00 224.80 222.22 224.80 198.50Z';
export const STAR_STROKE = 16;

export const OUTER = { cx: 224.5, cy: 232.5, r: 131.5 };
export const HOLE = { cx: 224.8, cy: 232.5, rx: 117.1, ry: 77.2, rot: 45 };
export const STAR = { cx: 224.8, cy: 235.0, arm: 36.5 + STAR_STROKE / 2 };

/** Ellipse aspect of the tilted ring — the film's orbital signature. */
export const ORBIT_ASPECT = HOLE.ry / HOLE.rx; // 0.659
export const ORBIT_ANGLE = HOLE.rot; // degrees, screen space

/** Map logo units → screen: logo outer circle centred at (x,y) with radius r. */
export const logoTransform = (x: number, y: number, r: number) => {
  const s = r / OUTER.r;
  return { s, tx: x - OUTER.cx * s, ty: y - OUTER.cy * s, attr: `translate(${x - OUTER.cx * s} ${y - OUTER.cy * s}) scale(${s})` };
};
/** Transform placing the STAR centre at (x,y) with star arm-extent `arm` px. */
export const starTransform = (x: number, y: number, arm: number) => {
  const s = arm / STAR.arm;
  return { s, attr: `translate(${x - STAR.cx * s} ${y - STAR.cy * s}) scale(${s})` };
};

/** Star outline as a polygon string usable by CSS clip-path (fill only, sampled). */
export function starClipPolygon(cx: number, cy: number, arm: number, samples = 24): string {
  // control polygon of STAR_PATH relative to star centre (unit: logo units, no stroke)
  const P = [
    [[0, -36.5], [0, -12.78], [12.78, 0], [36.5, 0]],
    [[36.5, 0], [12.78, 0], [0, 12.78], [0, 36.5]],
    [[0, 36.5], [0, 12.78], [-12.78, 0], [-36.5, 0]],
    [[-36.5, 0], [-12.78, 0], [0, -12.78], [0, -36.5]],
  ];
  const k = arm / 36.5;
  const pts: string[] = [];
  for (const seg of P) {
    for (let i = 0; i < samples; i++) {
      const t = i / samples, u = 1 - t;
      const x = u * u * u * seg[0][0] + 3 * u * u * t * seg[1][0] + 3 * u * t * t * seg[2][0] + t * t * t * seg[3][0];
      const y = u * u * u * seg[0][1] + 3 * u * u * t * seg[1][1] + 3 * u * t * t * seg[2][1] + t * t * t * seg[3][1];
      pts.push(`${(cx + x * k).toFixed(1)}px ${(cy + y * k).toFixed(1)}px`);
    }
  }
  return `polygon(${pts.join(',')})`;
}
