"""
DIGITAL GALAXY — original score & sound design ("the sound of the star").

Everything is synthesized from scratch with numpy (oscillators, FM, filtered noise,
STFT filters, convolution reverb). No samples, no third-party music.

Timing is NOT hand-placed: every sound is rendered from public/audio/cues.json,
exported from src/timeline/timeline.ts — the same AV events that drive the visuals.

Modules (one per sound family):
  AudioTimeline        reads the shared events / scenes / key frames
  DeepSpaceAmbience    drones, resonances, filtered air, distant pulses, crystalline harmonics
  StellarPulseSound    the star's signature motif (small / medium / monumental variants)
  GravityImpactSound   sub + transient + space texture + short tail, scaled by event size
  OrbitalPassSound     doppler-style pass that follows the object's screen position (pan)
  CosmicTransitionSound contraction, expansion, compression, lens, slingshot, orbital wipe, freeze
  BrandSonicLogo       the closing signature (motif → D-major bloom)
  Music                128.57 BPM cinematic electronic score, arranged to the scenes

usage: python3 scripts/audio/score.py public/audio/cues.json public/audio/score_raw.wav
"""
import json, sys, wave
import numpy as np

SR = 48000

# ============================================================================
# AudioTimeline
# ============================================================================
class AudioTimeline:
    def __init__(self, path):
        d = json.load(open(path))
        self.fps = d['fps']; self.dur = d['durationInFrames'] / self.fps
        self.beat = d['beatFrames'] / self.fps; self.bpm = d['bpm']
        self.scenes = {k: (v['from'] / self.fps, (v['from'] + v['dur']) / self.fps) for k, v in d['scenes'].items()}
        self.k = d['keys']; self.events = d['events']
    def t(self, frame): return frame / self.fps
    def of(self, sound): return [e for e in self.events if e['sound'] == sound]

TL = AudioTimeline(sys.argv[1]); OUT = sys.argv[2]
N = int(SR * TL.dur); tt = np.arange(N) / SR
rng = np.random.default_rng(2026)

# ============================================================================
# DSP toolkit
# ============================================================================
class Bus:
    def __init__(self): self.L = np.zeros(N); self.R = np.zeros(N)
    def add(self, sig, t, gain=1.0, pan=0.0):
        """constant-power pan; pan may be a scalar or a per-sample array in [-1,1]"""
        i = int(round(t * SR))
        if i >= N: return
        if i < 0: sig = sig[-i:]; i = 0
        s = sig[: N - i] * gain
        p = pan[: len(s)] if isinstance(pan, np.ndarray) else pan
        a = (np.asarray(p) + 1) * np.pi / 4
        self.L[i:i + len(s)] += s * np.cos(a); self.R[i:i + len(s)] += s * np.sin(a)
    def addst(self, l, r, t, gain=1.0):
        i = int(round(t * SR))
        if i >= N: return
        n = min(len(l), N - i); self.L[i:i + n] += l[:n] * gain; self.R[i:i + n] += r[:n] * gain
    @property
    def st(self): return np.stack([self.L, self.R])

MUSIC, SFX, AMB, SEND = Bus(), Bus(), Bus(), Bus()

def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-5)) * np.exp(-t / d)

def filt(x, lo=None, hi=None, order=4):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1)) ** order)
    if hi: m *= 1 / (1 + (f / hi) ** order)
    return np.fft.irfft(X * m, len(x))

def tv_band(x, fc, bw_oct=1.0, lp=False):
    """Time-varying band-pass (or low-pass) via STFT overlap-add. fc: per-sample centre/cutoff (Hz)."""
    n = len(x); win = 2048; hop = 512; w = np.hanning(win)
    pad = np.concatenate([np.zeros(win), x, np.zeros(win)]); y = np.zeros_like(pad); norm = np.zeros_like(pad)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    for s in range(0, len(pad) - win, hop):
        c = fc[min(n - 1, max(0, s + win // 2 - win))]
        X = np.fft.rfft(pad[s:s + win] * w)
        if lp: m = 1 / (1 + (freqs / max(c, 20)) ** 4)
        else: m = np.exp(-0.5 * (np.log2(np.maximum(freqs, 1) / max(c, 20)) / (bw_oct / 2)) ** 2)
        y[s:s + win] += np.fft.irfft(X * m, win) * w; norm[s:s + win] += w * w
    return (y / np.maximum(norm, 1e-6))[win:win + n]

def noise(n): return rng.standard_normal(n)
def sine(f, n, ph=0.0):
    f = np.broadcast_to(f, (n,)) if np.ndim(f) == 0 else f
    return np.sin(2 * np.pi * np.cumsum(f) / SR + ph)
def saw(f, n):
    t = np.arange(n) / SR; s = np.zeros(n)
    for d in (-0.06, 0, 0.06): s += 2 * ((t * f * 2 ** (d / 12) + rng.random()) % 1) - 1
    return s / 3
nf = lambda m: 440 * 2 ** ((m - 69) / 12)

# ============================================================================
# StellarPulseSound — the star's signature (attack · crystal tone · rising harmonic · resonance)
# ============================================================================
def stellar_pulse(intensity, pitch=0):
    big = min(1.5, intensity)
    n = int((0.8 + big * 1.4) * SR); t = np.arange(n) / SR
    base = nf(81 + pitch)  # A5 (+ variation)
    attack = filt(noise(n), 4000, 12000) * env(n, 0.0003, 0.006) * 0.6
    crystal = (sine(base, n) + 0.5 * sine(base * 2.0, n) + 0.25 * sine(base * 3.01, n)) * env(n, 0.002, 0.12 + big * 0.35)
    rise = sine(base * 1.5 * 2 ** (np.minimum(t, 0.3) / 0.3 * 7 / 12), n) * env(n, 0.03, 0.18 + big * 0.2) * 0.35  # ascending harmonic
    sub = sine(55 * (1 + 0.4 * np.exp(-t * 12)), n) * env(n, 0.004, 0.18 + big * 0.5) * (0.0 if big < 0.6 else 0.9 * big)
    return (attack + crystal * 0.55 + rise + sub) * (0.45 + 0.4 * big)

# ============================================================================
# GravityImpactSound — mass (sub) · transient · space texture · short tail
# ============================================================================
def gravity_impact(scale):
    """scale ~0.3 particle, ~0.8 planet, ~1.5 logo reveal"""
    n = int((0.6 + scale * 1.6) * SR); t = np.arange(n) / SR
    sub = sine(34 + 70 * np.exp(-t * (14 - scale * 4)), n) * env(n, 0.002, 0.16 + 0.42 * scale)
    trans = filt(noise(n), 1800, 9000) * env(n, 0.0002, 0.008 + 0.01 * scale)
    fm = sine(130 + 900 * sine(41, n) * np.exp(-t * 8), n) * env(n, 0.001, 0.06 + 0.12 * scale) * 0.35  # metallic space grain
    tex = tv_band(noise(n), 3000 * np.exp(-t * 6) + 250, 1.2) * env(n, 0.003, 0.12 + 0.3 * scale) * 0.6
    out = sub * 1.15 + trans * 0.8 + fm + tex
    return np.tanh(out * 1.2) * (0.5 + 0.35 * scale)

def type_hit(intensity):
    n = int(0.45 * SR); t = np.arange(n) / SR
    return (sine(70 + 60 * np.exp(-t * 30), n) * env(n, 0.001, 0.1) * 0.8 + filt(noise(n), 2500, 10000) * env(n, 0.0002, 0.006) * 0.6) * intensity * 0.55

def cut_hit(intensity):
    n = int(0.3 * SR)
    return (filt(noise(n), 800, 7000) * env(n, 0.0003, 0.02) * 0.7 + sine(52, n) * env(n, 0.001, 0.07)) * intensity * 0.5

# ============================================================================
# OrbitalPassSound — doppler-style pass with pan following the object
# ============================================================================
def orbital_pass(pre, post, intensity, pan):
    n = int((pre + post + 0.25) * SR); t = np.arange(n) / SR
    x = np.clip((t - pre) / max(pre, post, 1e-3), -1, 1)                  # -1 approaching … 0 at camera … +1 gone
    amp = np.exp(-(x * 2.2) ** 2) * intensity
    fc = 300 + 3200 * np.exp(-(x * 1.6) ** 2) * np.where(x < 0, 1.0, 0.7)  # pitch rises, then falls (doppler)
    body = tv_band(noise(n), fc, 1.4) * amp
    tone = sine(90 * 2 ** (-x * 0.8), n) * amp * 0.35                    # low hum with pitch glide
    p = np.interp(t, [0, pre, pre + post], [pan[0], (pan[0] + pan[1]) / 2, pan[1]]) * 0.85  # keep mono-friendly
    return (body + tone) * 0.9, p

# ============================================================================
# CosmicTransitionSound
# ============================================================================
def contraction(d, intensity):
    """pitch rises, density grows, ends in a concentrated cut (micro-silence before impact)"""
    n = int(d * SR); t = np.arange(n) / SR; p = t / d
    tone = sine(65 * 2 ** (p ** 2 * 3.0), n) * 0.35 + sine(130 * 2 ** (p ** 2 * 3.0), n) * 0.15
    air = tv_band(noise(n), 200 + 7000 * p ** 2.2, 1.0) * 0.7
    rate = 4 + 40 * p ** 2; pulses = (np.sin(2 * np.pi * np.cumsum(rate) / SR) > 0.6) * 0.25 * p
    out = (tone + air + pulses * sine(880, n)) * p ** 1.6 * intensity
    out[-int(0.05 * SR):] = 0  # 50 ms vacuum before the release
    return out

def expansion(intensity):
    n = int(3.5 * SR); t = np.arange(n) / SR
    open_ = tv_band(noise(n), 400 + 6000 * (1 - np.exp(-t * 2.2)), 2.0, lp=False) * env(n, 0.01, 0.9) * 0.45
    boom = sine(30 + 40 * np.exp(-t * 5), n) * env(n, 0.003, 1.1) * 0.9
    l = (open_ + boom) * intensity; r = (tv_band(noise(n), 400 + 6000 * (1 - np.exp(-t * 2.2)), 2.0) * env(n, 0.01, 0.9) * 0.45 + boom) * intensity
    return l, r  # decorrelated air = stereo bloom, shared boom = mono-solid

def compression(d):
    n = int(d * SR); t = np.arange(n) / SR; p = t / d
    s = (sine(200 * 2 ** (p * 2.5), n) * 0.3 + tv_band(noise(n), 500 + 6000 * p, 1.0) * 0.6) * p ** 2
    s[-int(0.03 * SR):] = 0
    return s

def lens(d):
    n = int((d + 0.6) * SR); t = np.arange(n) / SR; p = np.clip(t / d, 0, 1)
    fm = sine(220 * 2 ** (p * 0.9) + 60 * np.sin(2 * np.pi * (3 + 9 * p) * t), n)  # frequency modulation, rising tension
    return fm * np.where(t < d, p ** 1.5, np.exp(-(t - d) * 6)) * 0.4

def slingshot(d, pan):
    n = int((d + 0.4) * SR); t = np.arange(n) / SR; p = np.clip(t / d, 0, 1)
    w = tv_band(noise(n), 250 + 4000 * np.sin(np.pi * p) ** 2, 1.3) * np.sin(np.pi * p) ** 1.5
    hum = sine(70 * 2 ** (np.sin(np.pi * p) * 1.2), n) * np.sin(np.pi * p) * 0.3
    return w + hum, np.interp(t, [0, d], [pan[0], pan[1]]) * 0.85

def orbital_wipe(d, pan):
    s, p = slingshot(d, pan)
    n = len(s); t = np.arange(n) / SR
    ring = sum(sine(f, n) for f in (523.25, 784.0, 1046.5)) * env(n, 0.05, 0.6) * 0.12  # soft metallic resonance
    return s + ring, p

# ============================================================================
# DeepSpaceAmbience
# ============================================================================
def ambience():
    n = N
    drone = (sine(nf(26) * (1 + 0.002 * np.sin(2 * np.pi * 0.07 * tt)), n) * 0.35 + sine(nf(38) + 0.3 * np.sin(2 * np.pi * 0.11 * tt), n) * 0.18)
    air = tv_band(noise(n), 900 + 500 * np.sin(2 * np.pi * 0.05 * tt), 2.5) * 0.06
    res = sine(nf(62), n) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.09 * tt)) * 0.03 + sine(nf(69), n) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.13 * tt + 1)) * 0.025
    crystal = np.zeros(n)
    for k in range(int(TL.dur / 1.9)):
        t0 = 0.6 + k * 1.9 + rng.random() * 0.4; m = int(1.6 * SR); i = int(t0 * SR)
        if i + m < n: crystal[i:i + m] += sine(nf(rng.choice([86, 88, 93, 95, 98])), m) * env(m, 0.4, 0.5) * 0.018
    return drone + air + res + crystal

# ============================================================================
# Music — 128.57 BPM (28 frames / beat), D minor, arranged to the scenes
# ============================================================================
B = TL.beat
CH = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]  # Dm Bb F C
BASS = [38, 34, 41, 36]
def chord_at(t): return int(((t - TL.scenes['chaos'][0]) // (4 * B)) % 4)

def kick(g=1.0):
    n = int(0.45 * SR); t = np.arange(n) / SR
    return np.tanh((sine(44 + 110 * np.exp(-t * 32), n) * env(n, 0.001, 0.16) + 0.3 * filt(noise(n), 2500) * env(n, 0.0004, 0.004)) * 1.6) * g
def snare():
    n = int(0.3 * SR); return filt(noise(n), 1200, 8000) * env(n, 0.0005, 0.07) * 0.6 + sine(190, n) * env(n, 0.001, 0.04) * 0.3
def hat(o=False):
    n = int((0.18 if o else 0.05) * SR); return filt(noise(n), 7500) * env(n, 0.0004, 0.06 if o else 0.012)
def tom(f0=90):
    n = int(0.6 * SR); t = np.arange(n) / SR; return sine(f0 * (1 + 0.5 * np.exp(-t * 18)), n) * env(n, 0.002, 0.22)

def music():
    S = TL.scenes; k = TL.k
    def in_(name, t): return S[name][0] <= t < S[name][1]
    beats = int(TL.dur / B * 4) + 1
    for q in range(beats):  # 16th-note grid
        t = q * B / 4; st = q % 16
        groove = in_('chaos', t) or (t >= TL.t(k['logoAligned']) and t < S['promise'][0])
        half = TL.t(k['expansion']) <= t < TL.t(k['logoAligned'])
        intro = t < S['chaos'][0]
        if groove:
            if st % 4 == 0: MUSIC.add(kick(), t, 0.9)
            if st in (4, 12): MUSIC.add(snare(), t, 0.5, -0.05)
            if st % 2 == 1: MUSIC.add(hat(), t, 0.07, 0.3)
            if st % 4 == 2: MUSIC.add(hat(True), t, 0.07, -0.25)
            if in_('chaos', t) and st in (14, 15): MUSIC.add(hat(), t, 0.09, 0.4)  # glitchy fills
            if st % 2 == 0:
                n = int(0.2 * SR); MUSIC.add(filt(saw(nf(BASS[chord_at(t)] - 12 + (12 if st % 4 == 2 else 0)), n), None, 600) * env(n, 0.003, 0.1) * 0.5, t)
            if t >= S['process'][0] and st % 2 == 1:  # arpeggio (process + pillars)
                ch = CH[chord_at(t)]; m = ch[(q // 2) % 3] + 24; n = int(0.18 * SR)
                MUSIC.add((sine(nf(m), n) + 0.3 * sine(nf(m) * 2, n)) * env(n, 0.002, 0.07) * 0.09, t, 0.6 * np.sin(q * 0.7)); SEND.add(sine(nf(m), n) * env(n, 0.002, 0.07) * 0.05, t)
            if in_('pillars', t) and st in (6, 14): MUSIC.add(tom(70 + (q % 32) // 8 * 10), t, 0.35, 0.3)
        elif half:  # grand half-time after the reveal
            if st == 0: MUSIC.add(kick(1.0), t, 1.0)
            if st == 8: MUSIC.add(snare(), t, 0.7); MUSIC.add(tom(60), t, 0.5)
            if st % 4 == 2: MUSIC.add(hat(True), t, 0.05)
        elif intro and t > 4 * B and st % 4 == 2:
            MUSIC.add(hat(), t, 0.035, 0.2)  # distant pulse
        elif in_('promise', t) and t < TL.t(k['promisePull'][0]):
            if st % 2 == 1: MUSIC.add(hat(), t, 0.05)
    # pads: chords per bar, with automation per section
    pad = np.zeros(N)
    t0 = S['chaos'][0]
    for b in range(-2, int((TL.dur - t0) / (4 * B)) + 2):
        s = t0 + b * 4 * B; i = int(max(0, s) * SR); n = int(4 * B * SR)
        if i >= N or s + 4 * B < 0: continue
        ch = CH[b % 4] if s < TL.t(k['align'][0]) else [50, 54, 57]  # resolves to D major in the final
        seg = sum(saw(nf(m), n) for m in ch)
        fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.02 * SR))
        pad[i:i + n] += (seg * fade)[: N - i]
    pad = filt(pad, 120, 1600) * 0.16
    auto = np.interp(tt, [0, 2.6, 2.8, 7.0, 7.01, 7.9, 9.75, 9.8, 13.07, 22.87, 26.6, 27.07, 28.9, 30],
                        [0.25, 0.5, 0.75, 0.75, 0.0, 0.25, 0.9, 1.2, 0.8, 0.85, 1.0, 1.05, 1.25, 0.0])
    MUSIC.L += pad * auto; MUSIC.R += pad * auto * 0.97; SEND.L += pad * auto * 0.3; SEND.R += pad * auto * 0.3
    # sub bass bed (intro drone → resolution)
    subbed = sine(nf(26), N) * np.interp(tt, [0, 0.4, 2.7, 2.8, 30], [0, 0.22, 0.22, 0, 0])
    MUSIC.L += subbed; MUSIC.R += subbed

# ============================================================================
# BrandSonicLogo — the star motif resolving into D major
# ============================================================================
def sonic_logo(t):
    for k, m in enumerate([74, 81, 86, 90]):  # D5 A5 D6 F#6 — four points of the star
        n = int(2.2 * SR); x = sine(nf(m), n) + 0.4 * sine(nf(m) * 2.0, n) + 0.15 * sine(nf(m) * 3.0, n)
        SFX.add(x * env(n, 0.002, 0.5 + k * 0.15) * 0.18, t - 0.42 + k * 0.105, 1.0, (k - 1.5) * 0.25); SEND.add(x * env(n, 0.002, 0.5) * 0.12, t - 0.42 + k * 0.105)
    n = int(3.2 * SR); bloom = sum(sine(nf(m), n) for m in (50, 54, 57, 62, 66)) * env(n, 0.15, 1.3) * 0.11
    SFX.add(bloom, t, 1.0); SEND.add(bloom * 0.6, t)
    SFX.add(gravity_impact(1.4), t, 1.0)
    l, r = expansion(0.7); SFX.addst(l, r, t, 0.6)

# ============================================================================
# Render the event sheet
# ============================================================================
def build():
    AMB.L += ambience(); AMB.R += ambience()
    music()
    duck = np.ones(N)
    def duck_at(t, depth, rel):
        i = int(t * SR); m = min(int(rel * 4 * SR), N - i)
        if m > 0: duck[i:i + m] = np.minimum(duck[i:i + m], 1 - depth * np.exp(-np.arange(m) / SR / rel))
    for e in TL.events:
        t = TL.t(e['frame']); I = e['intensity']; pre = e.get('pre', 0) / TL.fps; post = e.get('dur', 20) / TL.fps
        pan = e.get('pan', [0, 0]); snd = e['sound']; pitch = e.get('pitch', 0) or 0
        if snd == 'stellarPulse':
            s = stellar_pulse(I, pitch); SFX.add(s, t, 1.0); SEND.add(s * 0.5, t)
        elif snd == 'gravityImpact':
            s = gravity_impact(I); SFX.add(s, t, 1.0); SEND.add(s * 0.35, t); duck_at(t, 0.45 * min(1, I), 0.25)
        elif snd == 'typeHit':
            SFX.add(type_hit(I), t, 1.0, pan[0] if pan else 0)
        elif snd == 'cutHit':
            SFX.add(cut_hit(I), t, 1.0, pan[0] * 0.6)
        elif snd == 'orbitalPass':
            s, p = orbital_pass(max(pre, 0.15), max(post, 0.2), I, pan); SFX.add(s, t - max(pre, 0.15), 0.8, p); SEND.add(s * 0.25, t - max(pre, 0.15))
        elif snd == 'compression':
            SFX.add(compression(pre), t - pre, 0.8)
        elif snd == 'contraction':
            SFX.add(contraction(pre, I), t - pre, 0.75); SEND.add(contraction(pre, I) * 0.2, t - pre)
        elif snd == 'expansion':
            l, r = expansion(I); SFX.addst(l, r, t, 0.75); SEND.addst(l * 0.4, r * 0.4, t); duck_at(t, 0.5, 0.4)
        elif snd == 'freeze':
            SFX.add(gravity_impact(0.9), t, 0.9); SEND.add(stellar_pulse(0.5, -5) * 0.6, t)
        elif snd == 'alignTick':
            n = int(0.9 * SR); m = 74 + pitch; x = (sine(nf(m), n) + 0.3 * sine(nf(m) * 2, n)) * env(n, 0.001, 0.18)
            SFX.add(x * 0.28, t, 1.0, pan[0] * 0.6 if pan else 0); SFX.add(type_hit(0.3), t, 1.0); SEND.add(x * 0.2, t)
        elif snd == 'checkpoint':
            s = stellar_pulse(0.45, pitch); SFX.add(s, t, 0.9); SFX.add(gravity_impact(0.35), t, 0.6); SEND.add(s * 0.4, t)
        elif snd == 'slingshot':
            s, p = slingshot(pre, pan); SFX.add(s, t - pre, 0.7, p)
        elif snd == 'orbitalWipe':
            s, p = orbital_wipe(pre, pan); SFX.add(s, t - pre, 0.75, p); SEND.add(s * 0.3, t - pre)
        elif snd == 'lens':
            SFX.add(lens(pre), t - pre, 0.8); SEND.add(lens(pre) * 0.3, t - pre)
        elif snd == 'shimmer' and I > 0:
            for k, m in enumerate([86, 90, 93, 98]):
                n = int(1.2 * SR); x = sine(nf(m), n) * env(n, 0.002, 0.35) * 0.08
                SFX.add(x, t + k * 0.06, 1.0, (k - 1.5) * 0.3); SEND.add(x, t + k * 0.06)
        elif snd == 'sonicLogo':
            sonic_logo(t); duck_at(t, 0.5, 0.6)
    # freeze: the music stops dead, ambience thins; contraction pulls ambience down further
    gate = np.interp(tt, [0, 7.0, 7.005, 7.93, 9.6, 9.8, 30], [1, 1, 0.0, 0.0, 0.6, 1, 1])
    amb_auto = np.interp(tt, [0, 7.0, 7.1, 7.9, 9.7, 9.8, 26.6, 27.05, 27.1, 30], [1, 1, 0.5, 0.6, 0.15, 1, 1, 0.3, 1, 1])
    MUSIC.L *= gate * duck; MUSIC.R *= gate * duck
    AMB.L *= amb_auto; AMB.R *= amb_auto

def reverb(bus):
    irn = int(2.0 * SR); te = np.arange(irn) / SR; out = []
    for seed, x in ((1, bus.L), (2, bus.R)):
        ir = np.random.default_rng(seed).standard_normal(irn) * np.exp(-te / 0.45)
        ir = filt(ir, 250, 7000); ir /= np.sqrt(np.sum(ir ** 2))
        m = 1 << int(np.ceil(np.log2(len(x) + irn)))
        out.append(np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:N])
    return np.stack(out)

build()
mix = MUSIC.st * 0.8 + SFX.st * 1.0 + AMB.st * 0.55 + reverb(SEND) * 0.28
mix = filt(mix[0], 28), filt(mix[1], 28)            # clean sub rumble below 28 Hz
mix = np.stack(mix) * np.interp(tt, [0, TL.dur - 0.5, TL.dur], [1, 1, 0])
mix = mix / np.max(np.abs(mix)) * 0.7                 # headroom; loudness is set in the mastering pass
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
mono = (mix[0] + mix[1]) / 2; side = (mix[0] - mix[1]) / 2
corr = float(np.sum(mix[0] * mix[1]) / np.sqrt(np.sum(mix[0] ** 2) * np.sum(mix[1] ** 2)))
print(f'raw score written: {OUT} · {TL.dur:.2f}s · L/R correlation {corr:.2f} · side/mid {np.sqrt(np.mean(side**2))/np.sqrt(np.mean(mono**2)):.2f}')
