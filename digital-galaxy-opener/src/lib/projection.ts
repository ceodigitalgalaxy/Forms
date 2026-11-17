// Minimal perspective camera for the orbital system. Orbits live on the XZ plane (y = up).
import { ORBIT_ANGLE, ORBIT_ASPECT } from '../brand/logoGeometry';
import { WIDTH, HEIGHT } from '../timeline/timeline';

export type V3 = [number, number, number];
export type Camera = { eye: V3; target: V3; focal: number; roll: number; cx: number; cy: number };
export type Projected = { x: number; y: number; z: number; s: number };

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

export function makeProjector(cam: Camera) {
  const f = norm(sub(cam.target, cam.eye));
  const r = norm(cross([0, 1, 0], f));
  const u = cross(f, r);
  const cr = Math.cos((cam.roll * Math.PI) / 180), sr = Math.sin((cam.roll * Math.PI) / 180);
  return (p: V3): Projected => {
    const d = sub(p, cam.eye);
    const z = Math.max(1, dot(d, f));
    const s = cam.focal / z;
    const x = dot(d, r) * s, y = -dot(d, u) * s;
    return { x: cam.cx + x * cr - y * sr, y: cam.cy + x * sr + y * cr, z, s };
  };
}

/** Elevation at which a circle projects to the logo's ring aspect (≈41.2°). */
export const LOGO_ELEVATION = Math.asin(ORBIT_ASPECT);

/** The "brand view": orthographic-like camera whose orbits match the logo's tilted ring exactly. */
export function brandCamera(cx = WIDTH / 2, cy = HEIGHT / 2, distance = 14000, zoom = 1, roll = ORBIT_ANGLE): Camera {
  return {
    eye: [0, distance * Math.sin(LOGO_ELEVATION), -distance * Math.cos(LOGO_ELEVATION)],
    target: [0, 0, 0],
    focal: distance * zoom,
    roll,
    cx,
    cy,
  };
}

export const orbitPoint = (radius: number, theta: number): V3 => [radius * Math.cos(theta), 0, radius * Math.sin(theta)];
