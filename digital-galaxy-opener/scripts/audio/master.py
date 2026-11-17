"""Mastering: two-pass EBU R128 loudness normalisation (target -14 LUFS integrated,
-1 dBTP true peak), then a verification measurement and a mono-compatibility check."""
import json, subprocess, sys, re
src, dst = sys.argv[1], sys.argv[2]
I, TP, LRA = -14.0, -1.0, 11.0
p1 = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', src, '-af', f'loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(p1[p1.rindex('{'):p1.rindex('}') + 1])
af = (f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
      f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-af', af, '-c:a', 'pcm_s16le', dst], check=True)
def measure(path, extra=''):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', f'{extra}ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    s = out[out.rindex('Summary:'):]
    g = lambda k: float(re.search(k + r':\s+(-?[\d.]+)', s).group(1))
    return g('I'), g('LRA'), g('Peak')
i, lra, tp = measure(dst)
mi, _, _ = measure(dst, 'pan=mono|c0=0.5*c0+0.5*c1,')
print(f'mastered: {dst}\n  integrated {i:.1f} LUFS · LRA {lra:.1f} LU · true peak {tp:.1f} dBTP\n  mono fold-down {mi:.1f} LUFS (Δ {mi - i:+.1f} LU)')
