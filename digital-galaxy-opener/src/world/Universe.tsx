import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { K } from '../timeline/timeline';
import { clamp, ease, lerp, prog } from '../lib/easing';
import { rnd } from '../lib/random';
import { applyCam, type Cam } from './cameraRig';
import { WIDTH, HEIGHT } from '../timeline/timeline';
import {
  CHECKPOINT_ANGLES, FRAGMENTS, ORBITS, PLANE_NORMAL, R_LOGO, TUNNEL,
  energyWave, fragmentState, orbitDraw, orbitQuat, orbitRadius, orbitWorldPoint, planetAngle, planetPosition, planetScale,
  ringFormation, starEnergy, starScale, logoCalm,
} from './worldState';
import { extrude, glowTexture, ringShape, starFlareTexture, starShape } from './logoShapes';

const C = { space: '#13073B', lilac: '#C9BCFF', white: '#F5F3FA', violet: '#7C5CFF' };

// ---------------------------------------------------------------------------
// Brand environment map: reflections made only of the four brand colours.
// ---------------------------------------------------------------------------
function useBrandEnv() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const scene = new THREE.Scene();
    const sky = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP; void main(){
        vec3 space=vec3(0.075,0.027,0.231), violet=vec3(0.486,0.361,1.0), lilac=vec3(0.788,0.737,1.0);
        float h = vP.y*0.5+0.5; vec3 c = mix(space, violet*0.55, smoothstep(0.35,0.75,h)); c = mix(c, lilac*0.6, smoothstep(0.82,1.0,h));
        gl_FragColor = vec4(c,1.0); }`,
    }));
    scene.add(sky);
    const box = (c: string, x: number, y: number, z: number, s: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(...s), new THREE.MeshBasicMaterial({ color: c }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); scene.add(m);
    };
    box(C.white, 12, 14, 10, [10, 6, 0.2]); // key softbox
    box(C.lilac, -16, 4, -8, [3, 14, 0.2]); // rim strip
    box(C.violet, 0, -12, 14, [18, 3, 0.2]);
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(scene, 0.03).texture;
    pm.dispose();
    return tex;
  }, [gl]);
}

// ---------------------------------------------------------------------------
// Orbits: shader-drawn tori (draw-on progress, planet trail, depth fade)
// ---------------------------------------------------------------------------
const orbitMat = () => new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uProg: { value: 1 }, uStart: { value: 0 }, uPlanet: { value: 0 }, uTrail: { value: 1 }, uBright: { value: 1 }, uHi: { value: 0 } },
  vertexShader: 'varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.0); vD=-mv.z; gl_Position=projectionMatrix*mv; }',
  fragmentShader: `varying vec2 vUv; varying float vD; uniform float uProg,uStart,uPlanet,uTrail,uBright,uHi;
    void main(){
      float u = fract(vUv.x - uStart);
      if (u > uProg) discard;
      float behind = fract(uPlanet - vUv.x);
      float trail = exp(-behind*16.0) * uTrail;
      vec3 violet=vec3(0.486,0.361,1.0), lilac=vec3(0.788,0.737,1.0), white=vec3(0.961,0.953,0.98);
      vec3 col = mix(mix(violet, lilac, uHi), white, clamp(trail,0.0,1.0));
      float fog = (1.0 - smoothstep(30.0, 80.0, vD)) * smoothstep(0.35, 2.6, vD);
      gl_FragColor = vec4(col, (0.55 + 0.45*uHi + trail*1.6) * uBright * fog);
    }`,
});

const Orbits: React.FC<{ f: number; bright: number; hi?: number }> = ({ f, bright, hi = -1 }) => {
  const geo = useMemo(() => new THREE.TorusGeometry(1, 0.0075, 6, 512), []);
  const mats = useMemo(() => ORBITS.map(() => orbitMat()), []);
  return (
    <>
      {ORBITS.map((o, i) => {
        const r = orbitRadius(i, f), m = mats[i].uniforms, a = planetAngle(i, f);
        m.uProg.value = orbitDraw(i, f); m.uStart.value = 0.62 + i * 0.07; m.uBright.value = bright; m.uHi.value = hi === i ? 1 : 0;
        m.uPlanet.value = ((a / (Math.PI * 2)) % 1 + 1) % 1; m.uTrail.value = f >= K.expansion ? 1 : 0;
        const tube = 1 + r * 0.35; // keep the line weight readable at every scale
        return <mesh key={i} geometry={geo} material={mats[i]} quaternion={orbitQuat(i, f)} scale={[r, r, tube]} frustumCulled={false} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// Five pillar planets — distinct stylised materials, brand palette only
// ---------------------------------------------------------------------------
function bandTexture() {
  const c = document.createElement('canvas'); c.width = 16; c.height = 512;
  const g = c.getContext('2d')!;
  const cols = [C.violet, C.lilac, C.space, C.violet, C.white, C.lilac, C.violet, C.space];
  let y = 0;
  for (let i = 0; y < 512; i++) { const h = 18 + rnd(i * 3 + 1) * 70; g.fillStyle = cols[i % cols.length]; g.fillRect(0, y, 16, h); y += h; }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const Planets: React.FC<{ f: number; env: THREE.Texture; focus?: number }> = ({ f, env }) => {
  const m = useMemo(() => {
    const ico = new THREE.IcosahedronGeometry(1, 1);
    const sph = new THREE.SphereGeometry(1, 96, 64);
    const wire = new THREE.IcosahedronGeometry(1.06, 2);
    return {
      ico, sph, wire,
      ring: new THREE.RingGeometry(1.45, 2.05, 128, 1),
      m0: new THREE.MeshPhysicalMaterial({ color: C.lilac, roughness: 0.22, metalness: 0.35, flatShading: true, clearcoat: 1, envMap: env, envMapIntensity: 1.2 }),
      m1: new THREE.MeshPhysicalMaterial({ color: C.white, roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15, envMap: env, envMapIntensity: 0.9 }),
      m1r: new THREE.MeshStandardMaterial({ color: C.lilac, roughness: 0.5, metalness: 0.2, side: THREE.DoubleSide, transparent: true, opacity: 0.85, envMap: env }),
      m2: new THREE.MeshStandardMaterial({ map: bandTexture(), roughness: 0.55, metalness: 0.1, envMap: env, envMapIntensity: 0.7 }),
      m3: new THREE.MeshPhysicalMaterial({ color: C.violet, roughness: 0.12, metalness: 0.9, clearcoat: 1, envMap: env, envMapIntensity: 1.6 }),
      m4: new THREE.MeshStandardMaterial({ color: C.space, roughness: 0.35, metalness: 0.4, envMap: env, envMapIntensity: 1.1 }),
      m4w: new THREE.MeshBasicMaterial({ color: C.lilac, wireframe: true, transparent: true, opacity: 0.85 }),
      glow: new THREE.SpriteMaterial({ map: glowTexture(), color: C.violet, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }),
    };
  }, [env]);
  return (
    <>
      {ORBITS.map((o, i) => {
        const s = planetScale(i, f) * o.size;
        if (s < 0.004) return null;
        const p = planetPosition(i, f), spin = f / 60 * (0.35 + i * 0.08);
        return (
          <group key={i} position={p} scale={s}>
            <sprite material={m.glow} scale={[5.2, 5.2, 1]} />
            {i === 0 && <mesh geometry={m.ico} material={m.m0} rotation={[spin * 0.7, spin, 0]} />}
            {i === 1 && (
              <group rotation={[0.5, 0, 0.6]}>
                <mesh geometry={m.sph} material={m.m1} rotation={[0, spin, 0]} />
                <mesh geometry={m.ring} material={m.m1r} rotation={[Math.PI / 2 - 0.2, 0, 0]} scale={[1, 0.659, 1]} />
              </group>
            )}
            {i === 2 && <mesh geometry={m.sph} material={m.m2} rotation={[0.35, spin, 0.2]} />}
            {i === 3 && <mesh geometry={m.sph} material={m.m3} rotation={[0, spin, 0]} />}
            {i === 4 && (
              <group rotation={[spin * 0.4, spin, 0]}>
                <mesh geometry={m.sph} material={m.m4} />
                <mesh geometry={m.wire} material={m.m4w} />
              </group>
            )}
          </group>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------------------
// The star (energy core) and the logo ring
// ---------------------------------------------------------------------------
const Core: React.FC<{ f: number; env: THREE.Texture; cam: Cam; ringOpacity: number }> = ({ f, env, cam, ringOpacity }) => {
  const g = useMemo(() => ({
    star: extrude(starShape(), 0.03, 0.006), // thin plate: silhouette stays the official star at any distance
    ring: extrude(ringShape(), 0.22, 0.03),
    starMat: new THREE.MeshStandardMaterial({ color: C.white, emissive: C.white, emissiveIntensity: 1, roughness: 0.3, metalness: 0 }),
    ringMat: new THREE.MeshPhysicalMaterial({ color: C.white, roughness: 0.26, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1, envMap: env, envMapIntensity: 1.1, emissive: C.lilac, emissiveIntensity: 0.12, transparent: true }),
    halo: new THREE.SpriteMaterial({ map: glowTexture(), color: C.violet, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    hot: new THREE.SpriteMaterial({ map: glowTexture(), color: C.lilac, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    flare: new THREE.SpriteMaterial({ map: starFlareTexture(), color: C.lilac, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
  }), [env]);
  const e = starEnergy(f), s = starScale(f), rf = ringFormation(f);
  const calm = logoCalm(f); // the mark must read crisply: glare steps back
  const dist = cam.pos.length();
  const near = Math.min(1, dist / 5); // glare stays tasteful in macro close-ups
  g.starMat.emissiveIntensity = (0.85 + e * 0.6) * (1 - calm * 0.5);
  g.halo.opacity = Math.min(0.75, 0.5 + e * 0.15) * (1 - calm * 0.55); g.hot.opacity = Math.min(0.4, 0.3 + e * 0.1) * (1 - calm * 0.9) * (0.3 + 0.7 * near); // never fill the star's concave sides g.flare.opacity = Math.min(0.7, 0.25 + e * 0.35) * (1 - calm * 0.95) * (0.35 + 0.65 * near);
  const hotSize = Math.max(Math.min(1.6 * s * (1 + e * 0.25), 1.4), dist * 0.035), flareSize = Math.max(Math.min(5.5 * s * (1 + e * 0.3), 6), dist * 0.09);
  g.ringMat.opacity = ringOpacity;
  // billboard: the star always faces the camera so its silhouette stays the original
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(cam.pos, cam.target, cam.up));
  const facing = f >= K.expansion ? new THREE.Quaternion() : q;
  // align the 4-point flare with the star's real arms on screen (camera roll + orientation)
  const pc = new THREE.PerspectiveCamera(cam.fov, WIDTH / HEIGHT, 0.05, 400); applyCam(pc, cam);
  const c0 = new THREE.Vector3(0, 0, 0).project(pc), c1 = new THREE.Vector3(0, 0.5, 0).applyQuaternion(facing).project(pc);
  const armAngle = Math.atan2((c1.y - c0.y) / (WIDTH / HEIGHT), c1.x - c0.x) - Math.PI / 2;
  g.flare.rotation = armAngle;
  const behind = cam.target.clone().sub(cam.pos).normalize().multiplyScalar(0.45);
  return (
    <group>
      <pointLight position={[0, 0, 0.6]} color={C.lilac} intensity={(40 + e * 70) * Math.max(0.2, s)} distance={40} decay={1.6} />
      {/* glows sit BEHIND the star along the view axis: they light the space around it, never fill its concave sides */}
      <sprite material={g.halo} position={behind} scale={[7 * s * (1 + e * 0.4), 7 * s * (1 + e * 0.4), 1]} />
      <sprite material={g.hot} position={behind} scale={[hotSize, hotSize, 1]} />
      <sprite material={g.flare} position={behind} scale={[flareSize, flareSize, 1]} />
      <mesh geometry={g.star} material={g.starMat} scale={s} quaternion={facing} />
      {rf > 0 && ringOpacity > 0 && (
        <mesh geometry={g.ring} material={g.ringMat} scale={[rf, rf, Math.max(0.05, rf)]} rotation={[0, 0, (1 - rf) * -2.2]} />
      )}
    </group>
  );
};

// ---------------------------------------------------------------------------
// Energy waves, chaos fragments, tunnel, checkpoints, warp streaks
// ---------------------------------------------------------------------------
const Waves: React.FC<{ f: number }> = ({ f }) => {
  const g = useMemo(() => ({ geo: new THREE.TorusGeometry(1, 0.02, 6, 256), mat: new THREE.MeshBasicMaterial({ color: C.lilac, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }) }), []);
  const w = energyWave(f);
  if (w.a <= 0.01) return null;
  g.mat.opacity = Math.min(1, w.a);
  return <mesh geometry={g.geo} material={g.mat} quaternion={orbitQuat(0, f)} scale={[w.r, w.r, 1 + w.r * 0.6]} />;
};

const Fragments: React.FC<{ f: number }> = ({ f }) => {
  const g = useMemo(() => ({ geos: FRAGMENTS.map((fr) => new THREE.TorusGeometry(fr.r, 0.018, 6, 96, fr.arc)), mat: new THREE.MeshBasicMaterial({ color: C.violet, transparent: true, opacity: 0.95 }) }), []);
  return (
    <>
      {FRAGMENTS.map((_, j) => {
        const st = fragmentState(j, f);
        if (!st.vis || st.s < 0.01) return null;
        return <mesh key={j} geometry={g.geos[j]} material={g.mat} position={st.p} rotation={st.rot} scale={st.s} />;
      })}
    </>
  );
};

const Tunnel: React.FC<{ f: number }> = ({ f }) => {
  const vis = prog(f, K.orbitalWipe[0], K.orbitalWipe[1] + 10) * (1 - prog(f, K.checkpoints[3] + 10, K.pillar[0]));
  const g = useMemo(() => ({ geo: new THREE.TorusGeometry(0.75, 0.008, 6, 160), mat: new THREE.MeshBasicMaterial({ color: C.lilac, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }) }), []);
  if (vis <= 0) return null;
  g.mat.opacity = vis * 0.8;
  return (
    <>
      {TUNNEL.map((t, k) => {
        const p = orbitWorldPoint(3, t.angle, f);
        const tan = orbitWorldPoint(3, t.angle + 0.01, f).sub(p).normalize();
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
        return <mesh key={k} geometry={g.geo} material={g.mat} position={p} quaternion={q} scale={[1, 0.659, 1]} />;
      })}
    </>
  );
};

const Checkpoints: React.FC<{ f: number; cam: Cam }> = ({ f, cam }) => {
  const g = useMemo(() => ({
    geo: extrude(starShape(), 0.1, 0.015),
    on: new THREE.MeshStandardMaterial({ color: C.white, emissive: C.lilac, emissiveIntensity: 1.4 }),
    off: new THREE.MeshStandardMaterial({ color: C.violet, emissive: C.violet, emissiveIntensity: 0.3 }),
    glow: new THREE.SpriteMaterial({ map: glowTexture(), color: C.lilac, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
  }), []);
  if (f < K.orbitalWipe[0] || f > K.pillar[0] + 4) return null;
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(cam.pos, cam.target, cam.up));
  return (
    <>
      {CHECKPOINT_ANGLES.map((a, i) => {
        const p = orbitWorldPoint(3, a, f).add(PLANE_NORMAL.clone().multiplyScalar(0.12));
        const on = f >= K.checkpoints[i], d = f - K.checkpoints[i];
        const pulse = on ? 1 + 0.6 * Math.exp(-d / 6) : 0.75;
        g.glow.opacity = 0.9;
        return (
          <group key={i} position={p}>
            <mesh geometry={g.geo} material={on ? g.on : g.off} quaternion={q} scale={0.3 * pulse} />
            {on && <sprite material={g.glow} scale={[2.4 * pulse, 2.4 * pulse, 1]} />}
          </group>
        );
      })}
    </>
  );
};

/** Speed streaks: particles stretched along the camera's velocity. */
const Streaks: React.FC<{ f: number; vel: THREE.Vector3 }> = ({ f, vel }) => {
  const g = useMemo(() => {
    const N = 700, base = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const r = 3 + rnd(i * 3 + 1) * 22, th = rnd(i * 3 + 2) * Math.PI * 2, y = (rnd(i * 3 + 3) - 0.5) * 12; base[i * 3] = Math.cos(th) * r; base[i * 3 + 1] = y; base[i * 3 + 2] = Math.sin(th) * r; }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 6), 3));
    return { base, geo, N, mat: new THREE.LineBasicMaterial({ color: C.lilac, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }) };
  }, []);
  const speed = vel.length();
  if (speed < 0.06) return null;
  const k = Math.min(10, 4 + speed * 10), arr = g.geo.attributes.position.array as Float32Array;
  for (let i = 0; i < g.N; i++) {
    arr[i * 6] = g.base[i * 3]; arr[i * 6 + 1] = g.base[i * 3 + 1]; arr[i * 6 + 2] = g.base[i * 3 + 2];
    arr[i * 6 + 3] = g.base[i * 3] - vel.x * k; arr[i * 6 + 4] = g.base[i * 3 + 1] - vel.y * k; arr[i * 6 + 5] = g.base[i * 3 + 2] - vel.z * k;
  }
  g.geo.attributes.position.needsUpdate = true;
  g.mat.opacity = clamp((speed - 0.06) * 2.2) * 0.75;
  return <lineSegments geometry={g.geo} material={g.mat} frustumCulled={false} />;
};

export const Universe: React.FC<{ f: number; cam: Cam; vel: THREE.Vector3; ringOpacity: number }> = ({ f, cam, vel, ringOpacity }) => {
  const env = useBrandEnv();
  const hi = f >= K.orbitalWipe[1] && f < K.pillar[0] ? 3 : f >= K.pillar[0] && f < K.lens[1] ? Math.min(4, Math.floor((f - K.pillar[0]) / K.pillarLen)) : -1;
  const orbitBright = f < K.chaosPhrases[0] ? ease.outCubic(prog(f, 30, 120)) : f >= K.align[1] ? lerp(1, 0, prog(f, K.align[1], K.logoLock + 4)) : 1;
  return (
    <>
      <hemisphereLight args={[C.lilac, C.space, 0.35]} />
      <directionalLight position={[6, 9, 8]} intensity={1.5} color={C.white} />
      <directionalLight position={[-9, 3, -10]} intensity={2.2} color={C.violet} />
      <Orbits f={f} bright={orbitBright} hi={hi} />
      <Planets f={f} env={env} />
      <Core f={f} env={env} cam={cam} ringOpacity={ringOpacity} />
      <Waves f={f} />
      <Fragments f={f} />
      <Tunnel f={f} />
      <Checkpoints f={f} cam={cam} />
      <Streaks f={f} vel={vel} />
    </>
  );
};
export { R_LOGO };
