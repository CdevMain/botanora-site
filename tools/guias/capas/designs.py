"""As 10 ilustrações (caixa 1000x1000)."""
import math
import numpy as np
from sketch import bez, qbez, arc, ellipse, line, spline, join, leaf, resample


def mirror(P, cx=500):
    Q = np.array(P, float).copy(); Q[:, 0] = 2 * cx - Q[:, 0]; return Q


def steam(S, x, y, h, phase=0, w=1.0):
    pts = [(x + 22 * math.sin(phase + i * 1.3) * w, y - i * h / 5) for i in range(6)]
    S.stroke(spline(pts), 0.45, passes=5, amp=2)


def star_anise(S, cx, cy, r=60, rot=0):
    for i in range(8):
        a = rot + i * 45
        polys, _ = leaf(cx, cy, a, r, 0.42, veins=0)
        S.stroke(polys[0], 0.55, passes=6)
        rad = math.radians(a)
        S.stroke(ellipse(cx + math.cos(rad) * r * 0.55, cy + math.sin(rad) * r * 0.55, 6, 4, a, 30), 0.3, passes=3)
    S.stroke(ellipse(cx, cy, 10, 10, 0, 40), 0.5)


def flower5(S, cx, cy, r, rot=0):
    for i in range(5):
        a = math.radians(rot + i * 72)
        px, py = cx + math.cos(a) * r * 0.55, cy + math.sin(a) * r * 0.55
        S.stroke(ellipse(px, py, r * 0.55, r * 0.42, math.degrees(a)), 0.55, passes=6)
    for i in range(14):
        a = math.radians(i * 360 / 14)
        S.stroke(line((cx, cy), (cx + math.cos(a) * r * 0.32, cy + math.sin(a) * r * 0.32), 8), 0.2, passes=2)
    S.stroke(ellipse(cx, cy, r * 0.14, r * 0.14), 0.5)


def chamomile(S, cx, cy, r, rot=0):
    S.stroke(ellipse(cx, cy, r * 0.28, r * 0.24, rot), 0.7)
    S.hatch(ellipse(cx, cy, r * 0.27, r * 0.23, rot)[:80], ellipse(cx, cy, r * 0.05, r * 0.05)[:80], 10, 1.0, 0.3)
    for i in range(20):
        a = rot + i * 18
        polys, _ = leaf(cx + math.cos(math.radians(a)) * r * 0.27, cy + math.sin(math.radians(a)) * r * 0.24, a, r * 0.72, 0.13, veins=0)
        S.stroke(polys[0], 0.35, passes=4)


def branch_leaves(S, stem, ts, side_ang=48, size=150, seed_off=0, width=0.34, serr=0.0):
    P = resample(stem, 200)
    for i, t in enumerate(ts):
        k = int(t * 199)
        x, y = P[k]
        dx, dy = P[min(199, k + 2)] - P[max(0, k - 2)]
        tang = math.degrees(math.atan2(dy, dx))
        sgn = -1 if i % 2 == 0 else 1
        L = size * (1.1 - 0.5 * t)
        polys, (top, bot) = leaf(x, y, tang + sgn * side_ang, L, width, 4, serr)
        S.fill_leaf(polys, top, bot)


# ---------------------------------------------------------------- 1
def infusoes(S):
    S.stroke(ellipse(500, 460, 330, 330), 0.25, passes=3, amp=4)          # círculo de fundo
    rim = ellipse(500, 470, 190, 34)
    S.stroke(rim, 1.0)
    S.stroke(ellipse(500, 476, 170, 24), 0.35, passes=3)
    left = bez((310, 470), (312, 620), (400, 700), (500, 700))
    S.stroke(left, 1.0); S.stroke(mirror(left), 1.0)
    S.hatch(mirror(left), mirror(bez((330, 490), (340, 610), (420, 680), (500, 690))), 18, 0.8)
    S.hatch(left, mirror(left), 26, 0.55, 0.3, alpha=(0.12, 0.5), trim=(0.02, 0.2))
    S.stroke(bez((685, 520), (800, 505), (800, 645), (640, 665)), 0.9)
    S.stroke(bez((680, 550), (760, 545), (760, 625), (660, 638)), 0.6)
    S.stroke(ellipse(500, 712, 300, 46), 0.9)
    S.stroke(ellipse(500, 708, 150, 18), 0.4, passes=3)
    S.hatch(arc(500, 712, 300, 46, 10, 170), arc(500, 712, 230, 30, 20, 160), 10, 1.0, 0.3)
    for i, x in enumerate((420, 500, 580)):
        steam(S, x, 420, 210 - 40 * (i % 2), phase=i * 1.7)
    # canela
    for off in (0, 26):
        S.stroke(line((140, 845 + off), (450, 770 + off)), 0.8)
    S.stroke(ellipse(140, 858, 9, 15, -15), 0.6); S.stroke(ellipse(450, 783, 9, 15, -15), 0.6)
    S.hatch(line((150, 850), (445, 776)), line((150, 868), (445, 794)), 6, 1, 0.3)
    star_anise(S, 770, 820, 62, 12)
    S.scatter(500, 760, 260, 60, 30)


# ---------------------------------------------------------------- 2
def atlas(S):
    stem = spline([(180, 930), (330, 760), (450, 590), (580, 430), (720, 280), (840, 130)])
    S.stroke(stem, 1.2)
    branch_leaves(S, stem, [0.1, 0.22, 0.34, 0.47, 0.6, 0.73, 0.86], 46, 260, width=0.25)
    # galho lateral com flor de camélia
    P = resample(stem, 200); x, y = P[int(0.42 * 199)]
    side = qbez((x, y), (x + 120, y + 60), (x + 210, y + 170))
    S.stroke(side, 0.7)
    flower5(S, x + 230, y + 200, 105, 15)
    # broto no topo
    for a in (-35, 25):
        polys, (top, bot) = leaf(840, 130, -55 + a, 70, 0.4, 1)
        S.fill_leaf(polys, top, bot, 3)
    S.scatter(500, 520, 300, 260, 30)


# ---------------------------------------------------------------- 3
def ritual(S):
    outer = arc(640, 300, 190, 190, 60, 300)
    inner = arc(715, 270, 165, 165, 90, 270)
    S.stroke(outer, 1.1); S.stroke(arc(715, 270, 165, 165, 75, 285), 0.8)
    S.hatch(arc(640, 300, 186, 186, 100, 260), arc(640, 300, 120, 140, 115, 245), 18, 0.9)
    for (x, y, s) in ((300, 180, 18), (220, 320, 10), (880, 520, 12), (420, 110, 8)):
        S.stroke(line((x - s, y), (x + s, y), 10), 0.4, passes=3); S.stroke(line((x, y - s), (x, y + s), 10), 0.4, passes=3)
    for (cx, cy, r, sx) in ((330, 560, 150, 330), (560, 640, 120, 600), (760, 760, 95, 790)):
        chamomile(S, cx, cy, r, rot=cx % 30)
        S.stroke(spline([(cx, cy + r * 0.25), (cx - 20, cy + 200), (sx - 30, 960)]), 0.6)
    for (x, y, a) in ((300, 820, 200), (650, 900, -20), (520, 860, 210)):
        polys, _ = leaf(x, y, a, 70, 0.18, 0, 0)
        S.stroke(polys[0], 0.4, passes=4)
    S.scatter(520, 700, 260, 160, 30)


# ---------------------------------------------------------------- 4
def foco(S):
    S.stroke(ellipse(500, 520, 250, 250), 0.9)
    S.hatch(arc(500, 520, 246, 246, -60, 60), arc(500, 520, 190, 230, -50, 50), 16, 1.0)
    for i in range(24):
        a = math.radians(i * 15)
        r0, r1 = 285, 285 + (70 if i % 2 == 0 else 40)
        S.stroke(line((500 + math.cos(a) * r0, 520 + math.sin(a) * r0), (500 + math.cos(a) * r1, 520 + math.sin(a) * r1), 10), 0.35, passes=3)
    # duas folhas e um broto
    stem = spline([(500, 900), (505, 760), (500, 620), (495, 470), (500, 330)])
    S.stroke(stem, 1.1)
    for (t, ang, L) in ((0.55, -140, 230), (0.42, -38, 250)):
        k = int(t * 199); x, y = resample(stem, 200)[k]
        polys, (top, bot) = leaf(x, y, ang, L, 0.34, 5)
        S.fill_leaf(polys, top, bot, 12)
    polys, (top, bot) = leaf(500, 340, -90, 150, 0.22, 2)
    S.fill_leaf(polys, top, bot, 6)
    S.scatter(500, 520, 300, 300, 25)


# ---------------------------------------------------------------- 5
def gelados(S):
    lt, rt, lb, rb = (360, 260), (640, 260), (385, 860), (615, 860)
    S.stroke(line(lt, lb), 1.0); S.stroke(line(rt, rb), 1.0)
    S.stroke(ellipse(500, 260, 140, 22), 0.9)
    S.stroke(arc(500, 860, 115, 18, 0, 180), 1.0)
    S.stroke(arc(500, 380, 133, 20, 0, 180), 0.5)                       # nível do líquido
    S.hatch(line((610, 400), (612, 850)), line((560, 400), (570, 850)), 14, 1.0, 0.3)
    S.hatch(line((370, 400), (387, 850)), line((612, 400), (612, 850)), 22, 0.6, 0.28, alpha=(0.08, 0.35))
    for (x, y, s, a) in ((450, 470, 80, 15), (545, 560, 75, -12), (470, 660, 72, 30), (555, 760, 66, -5)):
        sq = np.array([(-1, -1), (1, -1), (1, 1), (-1, 1), (-1, -1)], float) * s / 2
        rr = math.radians(a); R = np.array([[math.cos(rr), -math.sin(rr)], [math.sin(rr), math.cos(rr)]])
        P = sq @ R.T + (x, y)
        S.stroke(join(*[line(P[i], P[i + 1], 12) for i in range(4)]), 0.6)
        S.stroke(line(P[0] + (8, 10), P[1] + (-10, 10), 8), 0.25, passes=2)
    # limão na borda
    S.stroke(ellipse(655, 250, 75, 75), 0.9); S.stroke(ellipse(655, 250, 62, 62), 0.4, passes=3)
    for i in range(8):
        a = math.radians(i * 45 + 10)
        S.stroke(line((655, 250), (655 + math.cos(a) * 58, 250 + math.sin(a) * 58), 10), 0.3, passes=3)
    # canudo e hortelã
    S.stroke(line((450, 820), (300, 130)), 0.7); S.stroke(line((470, 820), (322, 128)), 0.7)
    stem = spline([(420, 270), (380, 200), (360, 120)])
    S.stroke(stem, 0.5)
    for (t, a, L) in ((0.2, -160, 90), (0.5, -20, 95), (0.8, -150, 70), (0.95, -60, 60)):
        x, y = resample(stem, 50)[int(t * 49)]
        polys, (top, bot) = leaf(x, y, a, L, 0.42, 3, serrate=0.08)
        S.fill_leaf(polys, top, bot, 4)
    S.scatter(500, 560, 220, 300, 30)


# ---------------------------------------------------------------- 6
def matcha(S):
    rim = ellipse(430, 540, 260, 50)
    S.stroke(rim, 1.0)
    S.stroke(ellipse(430, 548, 230, 36), 0.35, passes=3)
    body = bez((170, 540), (175, 720), (300, 800), (430, 800))
    S.stroke(body, 1.1); S.stroke(mirror(body, 430), 1.1)
    S.stroke(ellipse(430, 812, 95, 16), 0.6)
    S.hatch(mirror(body, 430), mirror(bez((215, 560), (225, 700), (320, 770), (430, 780)), 430), 18, 0.8)
    S.hatch(body, mirror(body, 430), 30, 0.55, 0.3, alpha=(0.12, 0.5), trim=(0.02, 0.2))
    # espuma
    S.scatter(430, 545, 150, 18, 45, (3, 9), (0.2, 0.5))
    # chasen (batedor)
    hx = 770
    S.stroke(line((hx - 22, 120), (hx - 22, 420)), 0.9); S.stroke(line((hx + 22, 120), (hx + 22, 420)), 0.9)
    S.stroke(ellipse(hx, 120, 22, 7), 0.6)
    S.hatch(line((hx + 18, 130), (hx + 18, 420)), line((hx + 4, 130), (hx + 4, 420)), 6, 1, 0.3)
    for i in range(22):
        f = (i / 21 - 0.5) * 2
        S.stroke(bez((hx + f * 20, 420), (hx + f * 40, 520), (hx + f * 95, 600), (hx + f * 80, 690)), 0.3, passes=2, amp=1.5)
    S.stroke(arc(hx, 690, 80, 14, 0, 180), 0.4)
    # chashaku
    S.stroke(bez((80, 900), (300, 870), (520, 860), (700, 880)), 0.7)
    S.stroke(bez((80, 916), (300, 886), (520, 876), (690, 896)), 0.5)
    S.stroke(ellipse(715, 885, 30, 14, -5), 0.6)


# ---------------------------------------------------------------- 7
def ervas(S):
    S.stroke(line((300, 640), (700, 640)), 0.9); S.stroke(line((290, 700), (710, 700)), 0.9)
    S.stroke(line((300, 640), (290, 700), 10), 0.8); S.stroke(line((700, 640), (710, 700), 10), 0.8)
    S.stroke(line((320, 700), (365, 930)), 1.0); S.stroke(line((680, 700), (635, 930)), 1.0)
    S.stroke(arc(500, 930, 135, 16, 0, 180), 0.9)
    S.hatch(line((650, 710), (620, 920)), line((560, 710), (560, 925)), 14, 1.0)
    S.hatch(line((330, 705), (370, 925)), line((670, 705), (630, 925)), 24, 0.5, 0.3, alpha=(0.1, 0.45))
    S.hatch(line((300, 650), (700, 650)), line((292, 690), (708, 690)), 5, 1.0, 0.3, alpha=(0.1, 0.3))
    # capim-cidreira (lâminas longas)
    for (x, top, bend) in ((380, 120, -120), (420, 90, -60), (460, 140, 40), (360, 220, -170)):
        S.stroke(qbez((x, 640), (x + bend * 0.2, (640 + top) / 2), (x + bend, top)), 0.7)
        S.stroke(qbez((x + 12, 640), (x + 12 + bend * 0.2, (640 + top) / 2), (x + bend + 6, top + 10)), 0.35, passes=3)
    # hortelã
    stem = spline([(560, 640), (575, 520), (590, 400), (600, 300)])
    S.stroke(stem, 0.8)
    for (t, a, L) in ((0.25, -150, 110), (0.3, -20, 115), (0.6, -155, 95), (0.65, -25, 95), (0.95, -100, 70)):
        x, y = resample(stem, 60)[int(t * 59)]
        polys, (top, bot) = leaf(x, y, a, L, 0.45, 3, serrate=0.1)
        S.fill_leaf(polys, top, bot, 5)
    # alecrim
    stem2 = spline([(640, 640), (690, 520), (740, 400), (790, 290)])
    S.stroke(stem2, 0.7)
    P = resample(stem2, 40)
    for i in range(3, 40, 2):
        x, y = P[i]
        for sg in (-1, 1):
            a = math.radians(-70 + sg * 50 - 40)
            S.stroke(line((x, y), (x + math.cos(a) * 40 * sg, y + math.sin(a) * 40)), 0.25, passes=2, amp=1)
    S.scatter(500, 780, 250, 120, 25)


# ---------------------------------------------------------------- 8
def blends(S):
    S.stroke(ellipse(470, 560, 250, 55), 1.0)
    S.stroke(ellipse(470, 568, 215, 40), 0.4, passes=3)
    body = bez((220, 560), (230, 760), (350, 840), (470, 840))
    S.stroke(body, 1.1); S.stroke(mirror(body, 470), 1.1)
    S.stroke(line((380, 840), (360, 880)), 0.7); S.stroke(line((560, 840), (580, 880)), 0.7)
    S.stroke(arc(470, 880, 110, 14, 0, 180), 0.7)
    S.hatch(mirror(body, 470), mirror(bez((260, 580), (270, 740), (370, 815), (470, 820)), 470), 18, 0.8)
    S.hatch(body, mirror(body, 470), 30, 0.55, 0.3, alpha=(0.12, 0.5), trim=(0.02, 0.2))
    # pilão
    S.stroke(bez((520, 590), (600, 420), (690, 250), (760, 150)), 0.9)
    S.stroke(bez((570, 600), (650, 430), (735, 265), (800, 170)), 0.9)
    S.stroke(ellipse(545, 600, 30, 18, -30), 0.7); S.stroke(ellipse(780, 158, 24, 14, -60), 0.7)
    S.hatch(bez((560, 590), (640, 425), (725, 262), (792, 165)), bez((545, 592), (625, 425), (712, 258), (782, 160)), 6, 1, 0.3)
    # pétalas e folhas soltas
    for (x, y, a, L, wdt) in ((180, 330, -30, 90, 0.35), (300, 230, 60, 70, 0.45), (820, 520, 200, 80, 0.4), (150, 520, 120, 60, 0.5), (360, 380, -10, 55, 0.5), (850, 760, 160, 70, 0.4)):
        polys, (top, bot) = leaf(x, y, a, L, wdt, 2)
        S.fill_leaf(polys, top, bot, 4)
    star_anise(S, 140, 760, 45, 5)
    flower5(S, 690, 860, 50, 10)
    S.scatter(470, 560, 160, 25, 40, (3, 8), (0.2, 0.5))


# ---------------------------------------------------------------- 9
def mesa(S):
    # bule
    cx, cy = 400, 560
    S.stroke(ellipse(cx, cy, 210, 190), 1.1)
    S.hatch(arc(cx, cy, 205, 185, -70, 70), arc(cx, cy, 150, 170, -60, 60), 18, 0.9)
    S.hatch(arc(cx, cy, 200, 182, 110, 250)[::-1], arc(cx, cy, 200, 182, -70, 70), 30, 0.5, 0.3, alpha=(0.1, 0.45), trim=(0.05, 0.2))
    S.stroke(ellipse(cx, 395, 120, 22), 0.8)
    S.stroke(bez((300, 392), (310, 330), (490, 330), (500, 392)), 0.8)
    S.stroke(ellipse(cx, 318, 22, 16), 0.7)
    S.stroke(bez((205, 560), (110, 520), (90, 420), (60, 380)), 0.9)            # bico
    S.stroke(bez((215, 610), (120, 590), (80, 450), (40, 392)), 0.9)
    S.stroke(ellipse(50, 386, 14, 8, -40), 0.5)
    S.stroke(bez((600, 470), (720, 440), (720, 680), (585, 660)), 0.9)          # alça
    S.stroke(bez((598, 500), (685, 480), (685, 640), (590, 630)), 0.5)
    S.stroke(ellipse(cx, 748, 120, 18), 0.6)
    # xícara pequena
    S.stroke(ellipse(780, 740, 105, 20), 0.9)
    left = bez((675, 740), (680, 830), (730, 870), (780, 870))
    S.stroke(left, 0.9); S.stroke(mirror(left, 780), 0.9)
    S.hatch(mirror(left, 780), mirror(bez((700, 750), (705, 820), (740, 855), (780, 860)), 780), 10, 0.9, 0.3)
    S.stroke(ellipse(780, 880, 175, 26), 0.8)
    steam(S, 780, 715, 160, 1.0, 0.7)
    S.stroke(line((40, 900), (960, 900)), 0.35, passes=3)
    S.scatter(500, 860, 380, 40, 30)


# ---------------------------------------------------------------- 10
def mate(S):
    cx = 470
    rim = ellipse(cx, 380, 120, 26)
    S.stroke(rim, 1.0)
    left = spline([(350, 380), (330, 450), (250, 560), (230, 690), (300, 840), (470, 890)])
    S.stroke(left, 1.2); S.stroke(mirror(left, cx), 1.2)
    S.hatch(mirror(left, cx), mirror(spline([(380, 400), (360, 470), (300, 570), (285, 690), (340, 820), (470, 865)]), cx), 20, 0.8)
    S.hatch(left, mirror(left, cx), 30, 0.55, 0.3, alpha=(0.12, 0.5), trim=(0.02, 0.2))
    S.stroke(arc(cx, 640, 225, 26, 0, 180), 0.45, passes=3)   # faixa decorativa
    S.stroke(arc(cx, 670, 228, 26, 0, 180), 0.45, passes=3)
    # erva (montinho)
    S.scatter(cx - 30, 372, 60, 10, 50, (3, 10), (0.25, 0.6))
    # bomba
    S.stroke(line((cx + 10, 400), (cx + 150, 110)), 0.8)
    S.stroke(line((cx + 26, 404), (cx + 166, 114)), 0.8)
    S.stroke(bez((cx + 150, 110), (cx + 160, 70), (cx + 200, 60), (cx + 230, 80)), 0.7)
    S.stroke(ellipse(cx + 70, 290, 14, 10, -64), 0.5)
    # ramo de erva-mate
    stem = spline([(760, 920), (810, 780), (850, 640), (900, 500)])
    S.stroke(stem, 0.8)
    branch_leaves(S, stem, [0.2, 0.42, 0.62, 0.82], 55, 115, width=0.36, serr=0.05)
    S.scatter(cx, 640, 260, 280, 25)


DESIGNS = [
    ('infusoes-de-autor', infusoes), ('atlas-do-cha', atlas), ('ritual-da-noite', ritual), ('foco-e-energia', foco),
    ('chas-gelados', gelados), ('matcha-em-casa', matcha), ('ervas-do-quintal', ervas), ('blends-autorais', blends),
    ('cha-e-mesa', mesa), ('erva-mate', mate)
]
