"""
Original synthesized score + sound design for the Digital Galaxy opener.

Everything here is generated from scratch (numpy oscillators/noise) — no samples,
no third-party music. Timing comes from public/audio/cues.json, exported from
src/timeline/timeline.ts, so every impact lands on its visual cue.

usage: python3 scripts/audio/score.py public/audio/cues.json public/audio/score.wav
"""
import json, sys, wave
import numpy as np

SR = 48000
data = json.load(open(sys.argv[1])); OUT = sys.argv[2]
FPS = data['fps']; DUR = data['durationInFrames'] / FPS; N = int(SR * DUR)
BEAT = 0.5  # 120 BPM: one beat = 30 frames = one hard-cut unit
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N); REV = np.zeros(N)
tt = np.arange(N) / SR

def add(sig, t, g=1.0, pan=0.0, rev=0.0):
    i = int(round(t * SR))
    if i >= N or i < 0: return
    s = sig[: N - i] * g
    L[i:i + len(s)] += s * (1 - max(0, pan)); R[i:i + len(s)] += s * (1 + min(0, pan)); REV[i:i + len(s)] += s * rev

def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))

def noise(n): return rng.standard_normal(n)

def kick(g=1.0):
    n = int(0.5 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(44 + 120 * np.exp(-t * 30)) / SR) * env(n, 0.001, 0.17)
    return np.tanh((s + 0.35 * filt(noise(n), 2500) * env(n, 0.0005, 0.005)) * 1.7) * g

def hat(open_=False):
    n = int((0.22 if open_ else 0.06) * SR)
    return filt(noise(n), 7500) * env(n, 0.0005, 0.07 if open_ else 0.013)

def clap():
    n = int(0.35 * SR); e = np.zeros(n)
    for k in range(3): e += env(n, 0.0005, 0.007) * (np.arange(n) >= int(k * 0.011 * SR))
    j = int(0.033 * SR); e[j:] += env(n - j, 0.001, 0.1)
    return filt(noise(n), 900, 6500) * e * 0.8

def impact(g=1.0, size=1.0):
    n = int(1.8 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(36 + 80 * np.exp(-t * 8)) / SR) * env(n, 0.002, 0.5 * size)
    crack = filt(noise(n), 300, 9000) * env(n, 0.0005, 0.045 * size)
    metal = (np.sin(2 * np.pi * 180 * t) * np.sin(2 * np.pi * 263 * t)) * env(n, 0.001, 0.12 * size) * 0.3
    return np.tanh((boom * 1.25 + crack * 0.9 + metal) * 1.35) * g

def whoosh(d, up=True):
    n = int(d * SR) + int(0.12 * SR); x = noise(n); y = np.zeros(n); blk = 1024
    for s in range(0, n, blk):
        p = min(1, s / max(1, d * SR)); c = 350 + 5500 * (p ** 2 if up else (1 - p) ** 2)
        y[s:s + blk] = filt(x[s:s + blk], c * 0.5, c * 1.9)
    t = np.arange(n) / SR
    e = np.clip(t / d, 0, 1) ** 2.2 * (t <= d) + (t > d) * np.exp(-(t - d) * 30)
    return y * e * 0.9

def riser(d):
    n = int(d * SR); t = np.arange(n) / SR; p = t / d
    tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (p * 3)) / SR) * 0.25
    return (tone + whoosh(d)[:n] * 0.8) * p ** 2

def ping(f0=1320, d=0.3):
    n = int(1.5 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t) + 0.4 * np.sin(2 * np.pi * f0 * 1.5 * t) + 0.2 * np.sin(2 * np.pi * f0 * 2.01 * t)) * env(n, 0.001, d) * 0.3

def tick():
    n = int(0.05 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2600 * t) * env(n, 0.0004, 0.009) * 0.5

def saw(f, n):
    t = np.arange(n) / SR; s = np.zeros(n)
    for d in (-0.07, 0, 0.07): s += 2 * ((t * f * 2 ** (d / 12) + rng.random()) % 1) - 1
    return s / 3

nf = lambda m: 440 * 2 ** ((m - 69) / 12)
CH = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]  # Am F C G
BASS = [33, 29, 36, 31]
chord = lambda t: int((t // 4) % 4)

# ---- pad bed with automation ----
pad = np.zeros(N)
for b in range(int(DUR // 4) + 1):
    s0 = int(b * 4 * SR); n = min(int(4 * SR), N - s0)
    if n <= 0: break
    seg = sum(saw(nf(m), n) for m in CH[b % 4])
    fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.03 * SR))
    pad[s0:s0 + n] += seg * fade
pad = filt(pad, 110, 1500) * 0.2
pv = np.interp(tt, [0, 2.9, 3, 7, 7.01, 7.3, 9.95, 10, 23, 26.5, 27, 28.9, 30], [0.8, 1, 0.5, 0.5, 0, 0.5, 1.3, 0.55, 0.55, 0.8, 0.9, 1.1, 0])
L += pad * pv; R += pad * pv; REV += pad * pv * 0.4
drone = np.sin(2 * np.pi * nf(33) * tt) * np.interp(tt, [0, 0.3, 2.95, 3, 30], [0, 0.32, 0.32, 0, 0])
L += drone; R += drone

def full(t): return (3 <= t < 7) or (10 <= t < 23)
sc = np.ones(N)
for k in range(int(DUR / (BEAT / 4))):
    t = k * BEAT / 4; step = k % 16
    if full(t):
        if step % 4 == 0:
            add(kick(), t, 0.95)
            i = int(t * SR); m = min(int(0.25 * SR), N - i); sc[i:i + m] = np.minimum(sc[i:i + m], 1 - 0.7 * np.exp(-np.arange(m) / SR / 0.06))
        if step % 4 == 2: add(hat(True), t, 0.11, pan=0.25)
        if step % 2 == 1: add(hat(), t, 0.10, pan=-0.3)
        if 3 <= t < 7 and step % 2 == 0: add(hat(), t, 0.05, pan=0.5)
        if step in (4, 12): add(clap(), t, 0.48, rev=0.25)
        if step % 2 == 0:
            n = int(0.24 * SR); b = filt(saw(nf(BASS[chord(t)] + (12 if step % 4 == 2 else 0)), n), None, 700) * env(n, 0.003, 0.12) * 0.55
            add(b, t)
        if t >= 10 and step % 2 == 1:
            ch = CH[chord(t)]; m = ch[(k // 2) % 3] + 12 * (1 + (k // 6) % 2); n = int(0.2 * SR); ts = np.arange(n) / SR
            add((np.sin(2 * np.pi * nf(m) * ts) + 0.3 * np.sin(4 * np.pi * nf(m) * ts)) * env(n, 0.002, 0.07) * 0.12, t, pan=0.4 * np.sin(k), rev=0.5)
    elif 23 <= t < 26.5:
        if step % 2 == 1: add(hat(), t, 0.08)
        if step % 8 == 4: add(clap(), t, 0.38, rev=0.3)
    elif 26.5 <= t < 27:
        add(kick(0.6), t) if step % 2 == 0 else None
    elif 8.4 <= t < 10:
        if step % (4 if t < 9.2 else 2 if t < 9.6 else 1) == 0: add(tick(), t, 0.5 + (t - 8.4) * 0.4, rev=0.3)

for c in data['cues']:
    t = c['frame'] / FPS; ty = c['type']; g = c.get('gain', 1.0); d = c.get('dur', 20) / FPS
    if ty == 'impact': add(impact(0.62 * g, 0.75 + 0.3 * g), t, rev=0.25); add(kick(0.55 * g), t)
    elif ty == 'cut': add(impact(0.3 * g, 0.4), t, rev=0.1); add(hat(True), t, 0.2 * g)
    elif ty in ('drop', 'final'): add(impact(1.0, 2.4), t, rev=0.6); add(kick(1.0), t); add(clap(), t, 0.45, rev=0.6); add(ping(880, 1.2), t, 0.7, rev=0.8)
    elif ty == 'freeze': add(impact(0.75, 1.5), t, rev=0.8); add(ping(1760, 0.5), t, 0.6, rev=0.7)
    elif ty == 'whoosh': add(whoosh(d), t, 0.55, pan=0.3, rev=0.2)
    elif ty == 'swish': add(whoosh(d), t, 0.32, pan=-0.3)
    elif ty == 'riser': add(riser(d), t, 0.7, rev=0.3)
    elif ty == 'starPulse': add(ping(1320, 0.35), t, 0.8 * g, rev=0.8); add(kick(0.4 * g), t)
    elif ty == 'checkpoint': add(ping(1568, 0.25), t, 0.8, rev=0.6); add(impact(0.35, 0.5), t)
    elif ty == 'shimmer':
        for k, m in enumerate([81, 84, 88, 93]): add(ping(nf(m), 0.6), t + k * 0.05, 0.35, pan=0.3 * (k - 1.5), rev=0.9)
    elif ty == 'tick': add(tick(), t, 0.9)

L *= 0.72 + 0.28 * sc; R *= 0.72 + 0.28 * sc
irn = int(2.4 * SR); te = np.arange(irn) / SR
def conv(x, ir):
    m = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x)]
for ch, seed in ((L, 1), (R, 2)):
    ir = np.random.default_rng(seed).standard_normal(irn) * np.exp(-te / 0.6); ir = filt(ir, 200, 6000); ir /= np.sqrt(np.sum(ir ** 2))
    ch += conv(REV, ir) * 0.35
mix = np.stack([L, R]) * np.interp(tt, [0, 29.2, 30], [1, 1, 0])
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.6) * 0.89
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print('score written:', OUT, f'{DUR:.1f}s')
