"""Motor de 'desenho riscado à mão': transforma contornos limpos em feixes de traços
irregulares (estilo nanquim branco sobre preto), aqui em dourado sobre azul-noite."""
import math
import numpy as np

DENS_STROKE = 1.0
DENS_HATCH = 2.6


# ---------------- primitivas (polilinhas Nx2) ----------------
def bez(p0, p1, p2, p3, n=80):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2, p3 = map(np.array, (p0, p1, p2, p3))
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3


def qbez(p0, p1, p2, n=60):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2 = map(np.array, (p0, p1, p2))
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2


def arc(cx, cy, rx, ry, a0, a1, n=120, rot=0):
    a = np.radians(np.linspace(a0, a1, n))
    x, y = rx * np.cos(a), ry * np.sin(a)
    r = math.radians(rot)
    return np.stack([cx + x * math.cos(r) - y * math.sin(r), cy + x * math.sin(r) + y * math.cos(r)], 1)


def ellipse(cx, cy, rx, ry, rot=0, n=160):
    return arc(cx, cy, rx, ry, 0, 360, n, rot)


def line(a, b, n=40):
    return np.linspace(np.array(a, float), np.array(b, float), n)


def spline(pts, n=None):
    """Catmull-Rom passando pelos pontos."""
    P = np.array(pts, float)
    P = np.vstack([P[0], P, P[-1]])
    out = []
    seg = n or 24
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for t in np.linspace(0, 1, seg, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-2])
    return np.array(out)


def join(*parts):
    return np.vstack(parts)


def leaf(x, y, ang, length, width=0.32, veins=4, serrate=0.0):
    """Folha com contorno, nervura e veias. Retorna lista de polilinhas."""
    a = math.radians(ang)
    c, s = math.cos(a), math.sin(a)
    T = lambda u, v: (x + u * c - v * s, y + u * s + v * c)
    w = length * width
    t = np.linspace(0, 1, 70)
    prof = np.sin(np.pi * t ** 0.85) * w
    if serrate:
        prof = prof * (1 + serrate * np.abs(np.sin(t * 38)))
    top = np.array([T(length * ti, -pi) for ti, pi in zip(t, prof)])
    bot = np.array([T(length * ti, pi) for ti, pi in zip(t, prof)])
    out = [join(top, bot[::-1]), np.array([T(length * ti, 0) for ti in np.linspace(0, 0.95, 40)])]
    for i in range(1, veins + 1):
        u = i / (veins + 1)
        for sg in (-1, 1):
            out.append(np.array([T(length * (u + k * 0.17), sg * w * 0.75 * math.sin(np.pi * u) * k ** 0.8) for k in np.linspace(0, 1, 12)]))
    return out, (top, bot)


def resample(P, n):
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(P, axis=0).T))]
    if d[-1] == 0:
        return np.repeat(P[:1], n, 0)
    u = np.linspace(0, d[-1], n)
    return np.stack([np.interp(u, d, P[:, 0]), np.interp(u, d, P[:, 1])], 1)


# ---------------- traço riscado ----------------
class Sketch:
    def __init__(self, seed=1):
        self.rng = np.random.default_rng(seed)
        self.strokes = []  # (pontos, largura, opacidade, tom)

    def _noise(self, n, amp):
        r = self.rng
        t = np.linspace(0, 1, n)
        out = np.zeros(n)
        for f, a in ((r.uniform(0.6, 1.6), 1.0), (r.uniform(2.5, 5), 0.45), (r.uniform(9, 16), 0.15)):
            out += a * np.sin(2 * np.pi * (f * t + r.uniform(0, 1)))
        return out * amp

    def stroke(self, P, weight=1.0, passes=None, amp=None, tone=None):
        """Desenha um contorno como um feixe de traços irregulares."""
        r = self.rng
        P = resample(np.asarray(P, float), max(12, int(np.sum(np.hypot(*np.diff(P, axis=0).T)) / 3)))
        n = len(P)
        d = np.gradient(P, axis=0)
        nrm = np.stack([-d[:, 1], d[:, 0]], 1)
        nrm /= (np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-9)
        passes = int((passes or (5 + 9 * weight)) * DENS_STROKE)
        amp = amp if amp is not None else 2.2 + 3.2 * weight
        for k in range(passes):
            wild = r.random() < 0.18            # fios soltos, como no traço à mão
            off = self._noise(n, amp * (2.3 if wild else 1)) + r.normal(0, amp * 0.25)
            Q = P + nrm * off[:, None]
            # recortes: o traço nem sempre cobre o contorno inteiro
            i0 = int(n * r.uniform(0, 0.12)); i1 = int(n * r.uniform(0.86, 1.0))
            if r.random() < 0.25 and n > 30:
                cut = int(r.uniform(0.3, 0.7) * n)
                segs = [(i0, cut + int(r.uniform(-3, 3))), (cut + int(r.uniform(2, 8)), i1)]
            else:
                segs = [(i0, i1)]
            for a, b in segs:
                a, b = max(0, a), min(n, b)
                if b - a < 4:
                    continue
                seg = Q[a:b].copy()
                # sobra de traço nas pontas (gesto da mão)
                for end, sign in ((0, -1), (-1, 1)):
                    tdir = seg[end] - seg[end + (1 if end == 0 else -1)]
                    tdir /= (np.linalg.norm(tdir) + 1e-9)
                    ext = seg[end] + tdir * r.uniform(0, (34 if wild else 10) * weight)
                    seg = np.vstack([ext, seg]) if end == 0 else np.vstack([seg, ext])
                w = r.uniform(0.6, 1.2 + 2.0 * weight)
                o = r.uniform(0.35, 0.95) if k < passes - 2 else r.uniform(0.7, 1.0)
                self.strokes.append((seg, w, o, tone if tone is not None else r.uniform(0, 1)))

    def many(self, polys, weight=1.0, **kw):
        for P in polys:
            self.stroke(P, weight, **kw)

    def hatch(self, A, B, count=24, bias=1.0, weight=0.35, alpha=(0.25, 0.75), trim=(0.0, 0.3)):
        """Linhas de sombra seguindo a forma, interpoladas entre dois contornos."""
        r = self.rng
        A, B = resample(np.asarray(A, float), 90), resample(np.asarray(B, float), 90)
        count = int(count * DENS_HATCH)
        for i in range(count):
            t = (i + r.uniform(0, 1)) / count
            t = t ** bias
            C = A + (B - A) * t
            n = len(C)
            a = int(n * r.uniform(*trim)); b = n - int(n * r.uniform(*trim))
            if b - a < 6:
                continue
            seg = C[a:b] + self._noise(b - a, 3.4)[:, None] * np.array([0.8, 0.8])
            if r.random() < 0.3:
                tdir = seg[-1] - seg[-4]; seg = np.vstack([seg, seg[-1] + tdir * r.uniform(1, 5)])
            self.strokes.append((seg, r.uniform(0.45, 1.3) * (weight / 0.35), r.uniform(*alpha), r.uniform(0, 1)))

    def scatter(self, cx, cy, rx, ry, count=40, length=(6, 18), alpha=(0.1, 0.4)):
        """Riscos soltos (poeira de grafite) em volta da forma."""
        r = self.rng
        for _ in range(count):
            x, y = cx + r.normal(0, rx), cy + r.normal(0, ry)
            a = r.uniform(0, math.pi)
            L = r.uniform(*length)
            P = np.array([[x, y], [x + L * math.cos(a), y + L * math.sin(a)]])
            self.strokes.append((P, r.uniform(0.4, 0.9), r.uniform(*alpha), r.uniform(0, 1)))

    def svg_paths(self, palette):
        out = []
        for P, w, o, tone in self.strokes:
            col = palette[min(len(palette) - 1, int(tone * len(palette)))]
            d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in P)
            out.append(f'<path d="{d}" stroke="{col}" stroke-width="{w:.2f}" stroke-opacity="{o:.2f}"/>')
        return '\n'.join(out)


    def fill_leaf(self, polys, top, bot, k=8):
        """Folha: contorno forte, nervuras e estrias ao longo do comprimento."""
        self.stroke(polys[0], 0.75)
        for v in polys[1:]:
            self.stroke(v, 0.28, passes=3)
        self.hatch(top, bot, k, 1.0, 0.3, alpha=(0.2, 0.6), trim=(0.05, 0.3))
