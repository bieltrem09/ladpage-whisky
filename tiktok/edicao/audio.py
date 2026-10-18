"""Trilha sintetizada (120 BPM, levada latina) + efeitos sonoros sincronizados com a edição."""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 27.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(3)

def t_arr(d):
    return np.arange(int(SR * d)) / SR

def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    if i < 0:
        sig, i = sig[-i:], 0
    buf[i:j] += sig[: j - i] * gain

def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos')
    return sosfilt(sos, x)

def env(d, a=0.002, decay=0.2):
    t = t_arr(d)
    e = np.exp(-t / decay)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e

# ---------------------------------------------------------------- instrumentos
def kick(level=1.0):
    t = t_arr(0.45)
    f = 45 + 110 * np.exp(-t / 0.045)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.16)
    s += 0.25 * filt(rng.normal(0, 1, len(t)), 'highpass', 2500) * np.exp(-t / 0.006)
    return np.tanh(1.6 * s) * level

def snare():
    t = t_arr(0.25)
    n = filt(rng.normal(0, 1, len(t)), 'bandpass', [1200, 7000]) * np.exp(-t / 0.06)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    return 0.55 * n + 0.35 * tone

def rim():
    t = t_arr(0.08)
    return filt(rng.normal(0, 1, len(t)), 'bandpass', [1800, 4200]) * np.exp(-t / 0.012) * 0.9

def hat(open_=False):
    d = 0.18 if open_ else 0.05
    t = t_arr(d)
    return filt(rng.normal(0, 1, len(t)), 'highpass', 7000) * np.exp(-t / (0.06 if open_ else 0.014)) * 0.35

def bass(freq, d):
    t = t_arr(d)
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)
    e = np.minimum(1, t / 0.005) * np.exp(-t / 0.35)
    return np.tanh(1.4 * s * e) * 0.55

def marimba(freq, d=0.35):
    t = t_arr(d)
    s = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.18)
    s += 0.35 * np.sin(2 * np.pi * freq * 3.98 * t) * np.exp(-t / 0.04)
    s += 0.12 * np.sin(2 * np.pi * freq * 9.2 * t) * np.exp(-t / 0.015)
    return s * 0.22

def crash():
    t = t_arr(1.6)
    n = filt(rng.normal(0, 1, len(t)), 'highpass', 4000) * np.exp(-t / 0.5)
    return n * 0.3

def whoosh(d=0.38):
    t = t_arr(d)
    n = rng.normal(0, 1, len(t))
    # varredura de banda: soma de faixas com envelope deslocado
    out = np.zeros_like(t)
    for k, fc in enumerate([500, 900, 1600, 2800, 5000]):
        b = filt(n, 'bandpass', [fc * 0.7, fc * 1.4])
        center = d * (0.25 + 0.12 * k)
        out += b * np.exp(-((t - center) / (d * 0.22)) ** 2)
    return out * 0.32

def tick(f=1900):
    t = t_arr(0.05)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.008) * 0.45

def pop(f=520):
    t = t_arr(0.09)
    fr = f * (1 + 1.2 * np.exp(-t / 0.01))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.03) * 0.5

def click():
    t = t_arr(0.04)
    return (filt(rng.normal(0, 1, len(t)), 'bandpass', [2500, 6000]) * np.exp(-t / 0.004) * 0.8
            + np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.006) * 0.25)

def thump():
    t = t_arr(0.35)
    f = 48 + 90 * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.11)
    wood = filt(rng.normal(0, 1, len(t)), 'bandpass', [300, 1400]) * np.exp(-t / 0.02)
    return np.tanh(2.2 * (s + 0.6 * wood)) * 0.85

def boom():
    t = t_arr(0.6)
    return np.sin(2 * np.pi * (40 + 30 * np.exp(-t / 0.08)) * t) * np.exp(-t / 0.25) * 0.55

def riser(d):
    t = t_arr(d)
    n = rng.normal(0, 1, len(t))
    out = np.zeros_like(t)
    seg = len(t) // 24
    for k in range(24):
        fc = 400 * (18 ** (k / 23))
        b = filt(n[k * seg:(k + 1) * seg + 400], 'bandpass', [fc * 0.8, min(fc * 1.6, 20000)])
        out[k * seg:k * seg + len(b)] += b[: len(out) - k * seg]
    sweep = np.sin(2 * np.pi * np.cumsum(220 * 4 ** (t / d)) / SR) * 0.15
    return (out * 0.5 + sweep) * (t / d) ** 2

# ---------------------------------------------------------------- arranjo
CHORDS = [  # (baixo, tríade) por compasso de 2 s: Am · F · C · G
    (110.0, [220.0, 261.6, 329.6]),
    (87.31, [174.6, 220.0, 261.6]),
    (130.8, [261.6, 329.6, 392.0]),
    (98.0, [196.0, 246.9, 293.7]),
]

def music():
    m = np.zeros(N)
    # intro 0–1 s: contagem do loader
    for i in range(8):
        add(m, tick(1500 + i * 120), i * 0.125, 0.35 + 0.05 * i)
    add(m, riser(1.0), 0.0, 0.7)
    sections = [(1.0, 20.5, 'groove'), (20.5, 23.5, 'build'), (23.5, 26.5, 'groove')]
    for a, b, kind in sections:
        nsix = int(round((b - a) / (BEAT / 4)))
        for s in range(nsix):
            tt = a + s * BEAT / 4
            bar_pos = s % 16
            bar = int((tt - 1.0) // 2.0) % 4
            bf, triad = CHORDS[bar]
            if kind == 'groove':
                if bar_pos % 4 == 0:
                    add(m, kick(), tt, 0.95)
                if bar_pos in (3, 6, 11, 14):
                    add(m, snare(), tt, 0.55)
                    add(m, rim(), tt, 0.3)
                if bar_pos % 2 == 0:
                    add(m, hat(bar_pos % 8 == 4), tt, 0.8)
                if bar_pos in (0, 3, 8, 11):
                    add(m, bass(bf, 0.4), tt, 1.0)
                if bar_pos in (2, 6, 10, 14):
                    for f in triad:
                        add(m, marimba(f), tt, 1.0)
                if bar_pos in (7,) and bar % 2 == 1:
                    add(m, marimba(triad[-1] * 2, 0.25), tt, 0.8)
            else:
                prog = (tt - a) / (b - a)
                if tt < b - 0.25:
                    if bar_pos % 4 == 0:
                        add(m, kick(0.85), tt, 0.9)
                    step = 4 if prog < 0.33 else (2 if prog < 0.66 else 1)
                    if bar_pos % step == 0:
                        add(m, snare(), tt, 0.25 + 0.4 * prog)
                    if bar_pos % 2 == 0:
                        add(m, hat(), tt, 0.6)
        add(m, crash(), a, 0.9 if kind == 'groove' else 0.4)
        if kind == 'groove':
            add(m, boom(), a, 1.0)
    add(m, riser(3.0), 20.5, 0.9)
    # corte seco no fim (loop)
    m[int(26.5 * SR):] = 0
    return m

def sfx():
    s = np.zeros(N)
    for w in [4.0, 5.5, 11.0, 14.5, 19.0]:
        add(s, whoosh(), w - 0.12, 1.0)
    for p in [2.5, 6.5, 10.0, 13.5, 15.5, 20.5]:
        add(s, boom(), p, 0.5)
    # anatomia: ingredientes juntando (7.0–7.55) e se separando (9.0–9.9)
    for i in range(8):
        add(s, pop(780 - i * 40), 7.0 + i * 0.07, 0.55)
    for i in range(8):
        add(s, pop(420 + i * 55), 9.0 + i * 0.125, 0.75)
        add(s, tick(2400 + i * 90), 9.0 + i * 0.125, 0.35)
    for c in [12.0, 13.0, 13.6, 19.5]:
        add(s, click(), c, 0.9)
    for st in [16.0, 17.0, 18.0]:
        add(s, thump(), st, 1.0)
    s[int(26.5 * SR):] = 0
    return s

def norm_write(path, x, peak=0.89):
    x = x / max(1e-9, np.abs(x).max()) * peak
    # leve "estéreo": atraso de 8 ms no canal direito para os agudos
    hp = filt(x, 'highpass', 3000)
    d = int(0.008 * SR)
    r = x.copy(); r[d:] += 0.15 * hp[:-d]; l = x + 0.15 * hp
    st = np.stack([l, r], 1)
    st = st / np.abs(st).max() * peak
    pcm = (st * 32767).astype(np.int16)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())

if __name__ == '__main__':
    m, s = music(), sfx()
    lim = lambda x: np.tanh(x * 1.2) / np.tanh(1.2)
    norm_write('mix_full.wav', lim(0.75 * m / np.abs(m).max() + 0.55 * s / np.abs(s).max()))
    norm_write('mix_sfx.wav', lim(s / np.abs(s).max()), peak=0.7)
    print('ok')
