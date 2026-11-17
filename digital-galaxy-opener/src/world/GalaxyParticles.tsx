import React, { useMemo } from 'react';
import * as THREE from 'three';
import { rnd } from '../lib/random';
import { planeQuat } from './worldState';

// Galaxy disk (spiral arms in the logo plane) + deep starfield. Custom shader:
// differential rotation, GRAVITATIONAL CONTRACTION with per-radius lag, energy-wave displacement.
const VERT = /* glsl */ `
  attribute vec4 aData; // x: radius, y: angle0, z: size, w: colour index
  attribute float aLift;
  uniform float uTime, uCollapse, uWaveR, uWaveA, uProj, uDisk, uRMax, uBright;
  varying float vCol; varying float vAlpha; varying float vDepth;
  void main() {
    vec3 p = position;
    if (uDisk > 0.5) {
      float r = aData.x;
      float lag = clamp(r / uRMax, 0.0, 1.0) * 0.45;          // far matter falls later
      float k = clamp((uCollapse - lag) / (1.0 - lag), 0.0, 1.0);
      float ang = aData.y + uTime * 0.22 / sqrt(r + 0.6) + k * k * 3.2; // differential rotation + spiral fall
      float rr = r * (1.0 - k * 0.985);
      float d = rr - uWaveR;
      float wave = uWaveA * exp(-d * d * 1.4);                 // STAR IMPULSE front
      rr += wave * 0.9;
      p = vec3(cos(ang) * rr, sin(ang) * rr, aLift * (1.0 - k) + wave * 0.35);
    }
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float s = aData.z * uProj / max(0.1, -mv.z);
    gl_PointSize = clamp(s, 1.6, 90.0);
    vCol = aData.w; vDepth = -mv.z;
    vAlpha = uBright * clamp(s / 3.0, 0.35, 1.0);
  }`;
const FRAG = /* glsl */ `
  varying float vCol; varying float vAlpha; varying float vDepth;
  uniform float uFogFar;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    a = a * a;
    vec3 white = vec3(0.961, 0.953, 0.980), lilac = vec3(0.788, 0.737, 1.0), violet = vec3(0.486, 0.361, 1.0);
    vec3 col = vCol < 0.5 ? white : (vCol < 1.5 ? lilac : violet);
    float fog = 1.0 - smoothstep(uFogFar * 0.35, uFogFar, vDepth);
    gl_FragColor = vec4(col, a * vAlpha * fog);
  }`;

const makeMat = (disk: boolean) =>
  new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }, uCollapse: { value: 0 }, uWaveR: { value: 0 }, uWaveA: { value: 0 }, uProj: { value: 1000 },
      uDisk: { value: disk ? 1 : 0 }, uRMax: { value: 32 }, uBright: { value: 1 }, uFogFar: { value: disk ? 90 : 400 },
    },
  });

export function useGalaxy() {
  return useMemo(() => {
    // --- spiral disk ---
    const N = 9000, pos = new Float32Array(N * 3), data = new Float32Array(N * 4), lift = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const arm = i % 3, t = rnd(i * 5 + 1);
      const r = 1.9 + Math.pow(t, 0.75) * 30;
      const spread = (rnd(i * 5 + 2) - 0.5) * (0.5 + r * 0.035);
      const ang = arm * ((Math.PI * 2) / 3) + Math.log(r) * 2.1 + spread;
      data[i * 4] = r; data[i * 4 + 1] = ang;
      data[i * 4 + 2] = 0.035 + Math.pow(rnd(i * 5 + 3), 6) * 0.16;
      const c = rnd(i * 5 + 4); data[i * 4 + 3] = c < 0.45 ? 1 : c < 0.8 ? 2 : 0;
      lift[i] = (rnd(i * 5 + 6) - 0.5) * (0.25 + 0.6 * Math.exp(-r / 6));
    }
    const disk = new THREE.BufferGeometry();
    disk.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    disk.setAttribute('aData', new THREE.BufferAttribute(data, 4));
    disk.setAttribute('aLift', new THREE.BufferAttribute(lift, 1));
    disk.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 80);
    // --- deep starfield shell (parallax reference) ---
    const M = 3500, sp = new Float32Array(M * 3), sd = new Float32Array(M * 4), sl = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      const u = rnd(i * 7 + 1) * 2 - 1, th = rnd(i * 7 + 2) * Math.PI * 2, R = 45 + rnd(i * 7 + 3) * 140;
      const s = Math.sqrt(1 - u * u);
      sp[i * 3] = Math.cos(th) * s * R; sp[i * 3 + 1] = u * R; sp[i * 3 + 2] = Math.sin(th) * s * R;
      sd[i * 4 + 2] = 0.12 + Math.pow(rnd(i * 7 + 4), 8) * 0.9;
      const c = rnd(i * 7 + 5); sd[i * 4 + 3] = c < 0.55 ? 0 : c < 0.85 ? 1 : 2;
    }
    const field = new THREE.BufferGeometry();
    field.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    field.setAttribute('aData', new THREE.BufferAttribute(sd, 4));
    field.setAttribute('aLift', new THREE.BufferAttribute(sl, 1));
    field.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 400);
    return { disk, field, diskMat: makeMat(true), fieldMat: makeMat(false) };
  }, []);
}

export const GalaxyParticles: React.FC<{
  g: ReturnType<typeof useGalaxy>; time: number; collapse: number; wave: { r: number; a: number }; proj: number; bright: number; fieldBright: number;
}> = ({ g, time, collapse, wave, proj, bright, fieldBright }) => {
  const u = g.diskMat.uniforms;
  u.uTime.value = time; u.uCollapse.value = collapse; u.uWaveR.value = wave.r; u.uWaveA.value = wave.a * 1.6; u.uProj.value = proj; u.uBright.value = bright;
  g.fieldMat.uniforms.uProj.value = proj; g.fieldMat.uniforms.uBright.value = fieldBright;
  return (
    <>
      <points geometry={g.field} material={g.fieldMat} frustumCulled={false} />
      <points geometry={g.disk} material={g.diskMat} quaternion={planeQuat} frustumCulled={false} />
    </>
  );
};
