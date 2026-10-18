"""Edição vertical 9:16 do site Semana da Margarita a partir das gravações de tela."""
import subprocess, sys, math, json
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

U = '/root/.claude/uploads/1b5b528d-bd9d-5bff-ade4-586671e29eb0/'
SRC = {
    'D': (U + 'ce6871ce-margarita-desktop.mp4', 1440, 900),
    'M': (U + '2df43ad7-margarita-mobile.mp4', 780, 1688),
}
OW, OH, FPS = 1080, 1920, 30
NAVY = (20, 32, 56)
NAVY_DEEP = (14, 22, 40)
CREAM = (246, 238, 218)
RED = (210, 58, 44)
FONT_BLACK = '/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
FONT_BOLD = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'

# Retângulos (coords da fonte) dos rótulos das garrafas reais: desfocados (regra de marcas).
LABELS = {
    'M': [(160, 680, 360, 930), (345, 760, 560, 1080)],
    'D': [(612, 350, 782, 568), (770, 398, 912, 700)],
}

def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3

def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)

def lerp(a, b, x):
    if isinstance(a, tuple):
        return tuple(p + (q - p) * x for p, q in zip(a, b))
    return a + (b - a) * x

def piecewise(keys, t):
    """keys: [(t_out, valor)] -> interpolação linear."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            return lerp(v0, v1, (t - t0) / (t1 - t0))
    return keys[-1][1]

# ---------------------------------------------------------------- roteiro
# Cada plano: fonte, mapa de tempo saída->fonte, layout, câmera (escala/foco), efeitos.
SHOTS = [
    # 1 · loader do próprio site (navy + selo + contador)
    dict(t0=0.0, t1=1.0, src='M', tmap=[(0.0, 26 / 30), (1.0, 2.0)], layout='full', bg=NAVY,
         scale=[(0.0, 1.137), (1.0, 1.22)], focus=[(0.0, (390, 1000))]),
    # 2 · DROP: hero mobile, letras sobem
    dict(t0=1.0, t1=2.5, src='M', tmap=[(1.0, 2.0), (1.4, 2.4), (2.5, 3.62)], layout='full', bg=NAVY,
         scale=[(1.0, 1.40), (2.5, 1.50)], focus=[(1.0, (390, 790))], punch=True,
         blur_labels=True),
    # 3 · hero desktop, push-in
    dict(t0=2.5, t1=4.0, src='D', tmap=[(2.5, 3.0), (4.0, 4.4)], layout='card', bg=NAVY,
         scale=[(2.5, 0.80), (4.0, 1.08)], focus=[(2.5, (720, 472)), (4.0, (740, 470))],
         punch=True, blur_labels=True),
    # 4 · rolagem rápida até a história (whip)
    dict(t0=4.0, t1=5.5, src='D', tmap=[(4.0, 6.4), (4.6, 8.4), (5.5, 9.9)], layout='card', bg=NAVY,
         scale=[(4.0, 0.92), (5.5, 1.0)], focus=[(4.0, (720, 472))], whip=True),
    # 5 · Anatomia mobile: título + drink desmontado
    dict(t0=5.5, t1=6.5, src='M', tmap=[(5.5, 23.35), (6.5, 24.55)], layout='full', bg=CREAM,
         scale=[(5.5, 1.40), (6.5, 1.48)], focus=[(5.5, (390, 860))], whip=True),
    # 6 · Anatomia close: junta no tempo e desmonta em câmera lenta
    dict(t0=6.5, t1=10.0, src='M',
         tmap=[(6.5, 27.62), (7.0, 28.13), (7.6, 28.72), (9.0, 30.12), (10.0, 30.80)],
         layout='full', bg=CREAM, scale=[(6.5, 1.78), (10.0, 1.92)], focus=[(6.5, (390, 930))],
         punch=True),
    # 7 · Anatomia desktop com as legendas dos ingredientes
    dict(t0=10.0, t1=11.0, src='D', tmap=[(10.0, 18.3), (11.0, 20.3)], layout='card', bg=CREAM,
         scale=[(10.0, 1.70), (11.0, 1.85)], focus=[(10.0, (400, 430))], punch=True),
    # 8 · Receitas: copo gira a cada aba
    dict(t0=11.0, t1=13.5, src='D', tmap=[(11.0, 29.2), (12.0, 30.97), (13.0, 32.78), (13.5, 33.6)],
         layout='card', bg=NAVY, scale=[(11.0, 0.95), (13.5, 1.10)], focus=[(11.0, (720, 640))],
         whip=True),
    # 9 · Receita picante no celular (modal com foto)
    dict(t0=13.5, t1=14.5, src='M', tmap=[(13.5, 42.15), (14.5, 43.0)], layout='full', bg=CREAM,
         scale=[(13.5, 1.40), (14.5, 1.48)], focus=[(13.5, (390, 760))], punch=True),
    # 10 · Passaporte mobile
    dict(t0=14.5, t1=15.5, src='M', tmap=[(14.5, 49.85), (15.5, 50.9)], layout='full', bg=CREAM,
         scale=[(14.5, 1.40), (15.5, 1.47)], focus=[(14.5, (390, 900))], whip=True),
    # 11 · Carimbos batendo, cada um numa batida
    dict(t0=15.5, t1=19.0, src='D',
         tmap=[(15.5, 44.10), (16.0, 44.62), (17.0, 46.65), (18.0, 48.82), (19.0, 50.25)],
         layout='card', bg=NAVY, scale=[(15.5, 1.75), (19.0, 1.90)], focus=[(15.5, (965, 300))],
         punch=True, shakes=[16.0, 17.0, 18.0]),
    # 12 · Mapa de bares
    dict(t0=19.0, t1=20.5, src='D', tmap=[(19.0, 54.67), (19.5, 55.17), (20.5, 57.0)], layout='card',
         bg=NAVY, scale=[(19.0, 1.10), (20.5, 1.22)], focus=[(19.0, (640, 470))], whip=True),
    # 13 · Celular: time-lapse do site inteiro
    dict(t0=20.5, t1=23.5, src='M', tmap=[(20.5, 3.6), (23.5, 36.0)], layout='phone', bg=CREAM,
         scale=[(20.5, 0.66), (23.5, 0.70)], focus=[(20.5, (390, 844))], punch=True),
    # 14 · Final: rodapé com MARGARITA gigante + pergunta
    dict(t0=23.5, t1=26.5, src='D', tmap=[(23.5, 62.6), (24.6, 64.0), (26.5, 65.3)], layout='card',
         bg=NAVY, scale=[(23.5, 0.80), (26.5, 0.90)], focus=[(23.5, (720, 640))], punch=True,
         flash=True),
    # 15 · Volta ao loader: o último frame emenda no primeiro (loop)
    dict(t0=26.5, t1=27.0, src='M', tmap=[(26.5, 0.72), (27.0, 25 / 30)], layout='full', bg=NAVY,
         scale=[(26.5, 1.137)], focus=[(26.5, (390, 1000))]),
]
DURATION = 27.0

TEXTS = [
    (0.05, 1.0, ['fiz um site...']),
    (1.0, 2.5, ['...que parece', 'comercial de TV']),
    (2.6, 4.0, ['isso é só a', 'primeira tela']),
    (5.6, 9.6, ['role a tela e o', 'drink se desmonta']),
    (11.1, 13.4, ['cada receita tem', 'sua animação']),
    (14.6, 18.9, ['e tem passaporte', 'de verdade']),
    (19.1, 20.4, ['com todos os', 'bares no mapa']),
    (20.6, 23.4, ['e funciona perfeito', 'no celular']),
    (23.7, 26.45, ['quanto você cobraria', 'por esse site?']),
]
SMALL_TEXTS = [(23.9, 26.45, 'Beba com moderação · +18')]

# ---------------------------------------------------------------- recursos
def rounded_mask(w, h, r):
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], r, fill=255)
    return np.asarray(m, np.float32) / 255.0

CHROME_H = 46
def browser_chrome(w):
    im = Image.new('RGB', (w, CHROME_H), (232, 224, 204))
    d = ImageDraw.Draw(im)
    for i, c in enumerate([(236, 106, 94), (244, 190, 79), (97, 197, 84)]):
        d.ellipse([22 + i * 26, 16, 36 + i * 26, 30], fill=c)
    f = ImageFont.truetype(FONT_BOLD, 17)
    url = 'semana-da-margarita.vercel.app'
    tw = d.textlength(url, font=f)
    d.rounded_rectangle([w / 2 - tw / 2 - 26, 9, w / 2 + tw / 2 + 26, 37], 14, fill=(246, 240, 226))
    d.text((w / 2 - tw / 2, 13), url, font=f, fill=(90, 84, 70))
    return np.asarray(im, np.uint8)

PHONE_BEZEL = 20
def make_text(lines, size=72):
    f = ImageFont.truetype(FONT_BLACK, size)
    padx, pady, gap = 26, 14, 8
    boxes = []
    for ln in lines:
        bb = f.getbbox(ln)
        boxes.append((ln, bb[2] - bb[0], bb[3] - bb[1], bb))
    W = max(b[1] for b in boxes) + 2 * padx + 40
    H = sum(b[2] + 2 * pady for b in boxes) + gap * (len(boxes) - 1) + 40
    im = Image.new('RGBA', (int(W), int(H)), (0, 0, 0, 0))
    sh = Image.new('RGBA', im.size, (0, 0, 0, 0))
    d, ds = ImageDraw.Draw(im), ImageDraw.Draw(sh)
    y = 20
    for ln, tw, th, bb in boxes:
        x = (W - tw) / 2 - padx
        rect = [x, y, x + tw + 2 * padx, y + th + 2 * pady]
        ds.rounded_rectangle([rect[0], rect[1] + 6, rect[2], rect[3] + 6], 16, fill=(0, 0, 0, 90))
        d.rounded_rectangle(rect, 16, fill=RED + (255,))
        d.text((x + padx - bb[0], y + pady - bb[1]), ln, font=f, fill=(255, 255, 255, 255))
        y += th + 2 * pady + gap
    sh = sh.filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(8))
    out = Image.alpha_composite(sh, im)
    return np.asarray(out, np.float32) / 255.0

def make_small(text, size=30):
    f = ImageFont.truetype(FONT_BOLD, size)
    bb = f.getbbox(text)
    im = Image.new('RGBA', (bb[2] - bb[0] + 40, bb[3] - bb[1] + 24), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((20 - bb[0], 12 - bb[1]), text, font=f, fill=CREAM + (235,))
    return np.asarray(im, np.float32) / 255.0

TEXT_IMGS = [(a, b, make_text(l)) for a, b, l in TEXTS]
SMALL_IMGS = [(a, b, make_small(s)) for a, b, s in SMALL_TEXTS]

yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
r = np.sqrt(((xx - OW / 2) / (OW / 2)) ** 2 + ((yy - OH / 2) / (OH / 2)) ** 2)
VIGNETTE = (1 - 0.22 * np.clip(r - 0.55, 0, 1) ** 1.4)[..., None]

def background(color):
    c = np.array(color, np.float32)
    glow = np.exp(-(((xx - OW / 2) / 700) ** 2 + ((yy - OH * 0.48) / 900) ** 2))[..., None]
    return np.clip(c * (0.9 + 0.25 * glow), 0, 255)

BG_CACHE = {}

# ---------------------------------------------------------------- leitura das fontes
class Reader:
    def __init__(self, key, start):
        self.path, self.w, self.h = SRC[key]
        self.start = max(0.0, start - 0.1)
        self.p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-ss', f'{self.start:.3f}', '-i', self.path,
                                   '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                                  stdout=subprocess.PIPE)
        self.idx = -1
        self.prev = self.cur = None

    def _next(self):
        n = self.w * self.h * 3
        b = self.p.stdout.read(n)
        if len(b) < n:
            return False
        self.prev, self.cur = self.cur, np.frombuffer(b, np.uint8).reshape(self.h, self.w, 3)
        self.idx += 1
        return True

    def at(self, t):
        fi = (t - self.start) * FPS
        need = int(math.floor(fi)) + 1
        while self.idx < need:
            if not self._next():
                break
        a = fi - (self.idx - 1)
        if self.prev is None or a >= 0.999:
            return self.cur
        if a <= 0.001:
            return self.prev
        return cv2.addWeighted(self.prev, 1 - a, self.cur, a, 0)

    def close(self):
        self.p.kill()

def blur_labels(img, key):
    img = img.copy()
    for x0, y0, x1, y1 in LABELS[key]:
        roi = img[y0:y1, x0:x1].astype(np.float32)
        bl = cv2.GaussianBlur(roi, (0, 0), 14)
        h, w = roi.shape[:2]
        m = np.zeros((h, w), np.float32)
        cv2.rectangle(m, (12, 12), (w - 13, h - 13), 1.0, -1)
        m = cv2.GaussianBlur(m, (0, 0), 6)[..., None]
        img[y0:y1, x0:x1] = (roi * (1 - m) + bl * m).astype(np.uint8)
    return img

def shot_at(t):
    for s in SHOTS:
        if s['t0'] <= t < s['t1']:
            return s
    return SHOTS[-1]

def grade(f):
    f = f / 255.0
    f = (f - 0.5) * 1.07 + 0.5
    g = f.mean(axis=2, keepdims=True)
    f = g + (f - g) * 1.14
    f[..., 0] *= 1.025
    f[..., 2] *= 0.965
    return f * 255.0

def overlay(frame, rgba, cx, top, alpha=1.0):
    h, w = rgba.shape[:2]
    x0 = int(round(cx - w / 2)); y0 = int(round(top))
    xs0, ys0 = max(0, -x0), max(0, -y0)
    x0c, y0c = max(0, x0), max(0, y0)
    x1c, y1c = min(OW, x0 + w), min(OH, y0 + h)
    if x1c <= x0c or y1c <= y0c:
        return
    sub = rgba[ys0:ys0 + (y1c - y0c), xs0:xs0 + (x1c - x0c)]
    a = sub[..., 3:4] * alpha
    frame[y0c:y1c, x0c:x1c] = frame[y0c:y1c, x0c:x1c] * (1 - a) + sub[..., :3] * 255.0 * a

def render(out_path, preview_every=None):
    readers = {}
    masks = {}
    chrome = browser_chrome(1440)
    rng = np.random.default_rng(7)
    enc = None
    if out_path:
        enc = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                                '-s', f'{OW}x{OH}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264',
                                '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-r', str(FPS),
                                out_path], stdin=subprocess.PIPE)
    nframes = int(round(DURATION * FPS))
    frames_to_do = range(nframes) if not preview_every else range(0, nframes, preview_every)
    previews = []
    for n in frames_to_do:
        t = n / FPS
        s = shot_at(t)
        sid = id(s)
        if sid not in readers:
            for k in list(readers):
                readers[k].close()
            readers.clear()
            readers[sid] = Reader(s['src'], s['tmap'][0][1])
        rd = readers[sid]
        st = piecewise(s['tmap'], t)
        img = rd.at(st)
        if s.get('blur_labels'):
            img = blur_labels(img, s['src'])
        lt = t - s['t0']

        # monta "cartão" (navegador ou celular) ou tela cheia
        lay = s['layout']
        if lay == 'card':
            card = np.concatenate([chrome, img], axis=0)
            oy = CHROME_H
            key = ('card', card.shape)
            if key not in masks:
                masks[key] = rounded_mask(card.shape[1], card.shape[0], 26)
        elif lay == 'phone':
            b = PHONE_BEZEL
            card = np.zeros((img.shape[0] + 2 * b, img.shape[1] + 2 * b, 3), np.uint8)
            card[:] = (17, 17, 20)
            card[b:-b, b:-b] = img
            oy = b
            key = ('phone', card.shape)
            if key not in masks:
                m = rounded_mask(card.shape[1], card.shape[0], 96)
                masks[key] = m
            # cantos arredondados da tela
            inner = rounded_mask(img.shape[1], img.shape[0], 78)[..., None]
            card[b:-b, b:-b] = (img * inner + np.array([17, 17, 20]) * (1 - inner)).astype(np.uint8)
        else:
            card, oy, key = img, 0, None

        sc = piecewise(s['scale'], t)
        if s.get('punch'):
            sc *= lerp(1.18, 1.0, ease_out(lt / 0.32))
        fx, fy = piecewise(s['focus'], t) if len(s['focus']) > 1 else s['focus'][0][1]
        fy += oy
        if lay != 'full':
            fx += (card.shape[1] - img.shape[1]) / 2
        cx, cy = OW / 2, {'card': OH * 0.53, 'phone': OH * 0.6}.get(lay, OH / 2)
        dx = dy = 0.0
        whip_v = 0.0
        if s.get('whip') and lt < 0.28:
            p = ease_out(lt / 0.28)
            dy = (1 - p) * OH * 0.55
            whip_v = (1 - p)
        for st_t in s.get('shakes', []):
            u = t - st_t
            if 0 <= u < 0.18:
                amp = 14 * (1 - u / 0.18)
                dx += rng.uniform(-amp, amp); dy += rng.uniform(-amp, amp)
                sc *= 1 + 0.025 * (1 - u / 0.18)
        M = np.float32([[sc, 0, cx - sc * fx + dx], [0, sc, cy - sc * fy + dy]])

        bgk = s['bg']
        if bgk not in BG_CACHE:
            BG_CACHE[bgk] = background(bgk)
        frame = BG_CACHE[bgk].copy()
        warped = cv2.warpAffine(card, M, (OW, OH), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT,
                                borderValue=bgk).astype(np.float32)
        if key is not None:
            wm = cv2.warpAffine(masks[key], M, (OW, OH), flags=cv2.INTER_LINEAR)
            # sombra suave
            M2 = M.copy(); M2[1, 2] += 30
            sh = cv2.warpAffine(masks[key], M2, (OW // 4, OH // 4) if False else (OW, OH), flags=cv2.INTER_LINEAR)
            sh = cv2.resize(cv2.GaussianBlur(cv2.resize(sh, (OW // 4, OH // 4)), (0, 0), 12), (OW, OH))[..., None]
            frame = frame * (1 - 0.45 * sh)
            wm = wm[..., None]
            frame = frame * (1 - wm) + warped * wm
        else:
            # tela cheia: fundo só aparece nas bordas
            wm = cv2.warpAffine(np.ones(card.shape[:2], np.float32), M, (OW, OH))[..., None]
            frame = frame * (1 - wm) + warped * wm
        if whip_v > 0.05:
            k = int(6 + 120 * whip_v) | 1
            frame = cv2.blur(frame, (1, k))
        frame = grade(frame)
        if s.get('flash') and lt < 0.16:
            frame = frame + (255 - frame) * (0.55 * (1 - lt / 0.16))

        # textos
        for a, b, timg in TEXT_IMGS:
            if a <= t < b:
                ti = t - a
                al = min(1.0, ti / 0.2) * min(1.0, (b - t) / 0.15)
                off = 14 * (1 - ease_out(ti / 0.2))
                overlay(frame, timg, OW / 2, 300 + off, al)
        for a, b, timg in SMALL_IMGS:
            if a <= t < b:
                al = min(1.0, (t - a) / 0.3) * min(1.0, (b - t) / 0.15)
                overlay(frame, timg, OW / 2, 1500, al)

        frame = frame * VIGNETTE
        frame += rng.normal(0, 3.2, (OH, OW, 1)).astype(np.float32)
        out = np.clip(frame, 0, 255).astype(np.uint8)
        if enc:
            enc.stdin.write(out.tobytes())
        if preview_every:
            previews.append((t, out))
        if n % 60 == 0:
            print(f'{t:5.2f}s', flush=True)
    for k in readers:
        readers[k].close()
    if enc:
        enc.stdin.close(); enc.wait()
    return previews

if __name__ == '__main__':
    if sys.argv[1] == 'preview':
        step = int(sys.argv[2])
        pv = render(None, preview_every=step)
        th = [cv2.resize(f, (216, 384)) for _, f in pv]
        for (t, _), im in zip(pv, th):
            cv2.putText(im, f'{t:.2f}', (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cols = 9
        while len(th) % cols: th.append(np.zeros_like(th[0]))
        rows = [np.concatenate(th[i:i + cols], axis=1) for i in range(0, len(th), cols)]
        Image.fromarray(np.concatenate(rows, axis=0)).save(sys.argv[3])
    else:
        render(sys.argv[2])
