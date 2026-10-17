'use strict';
// Ilustrações em traço fino (estilo do logo). Tudo vetorial, cor via currentColor.

const r = n => Math.round(n * 100) / 100;

// Folha amendoada com nervura central e laterais
function leafPath(x, y, angle, len, width = 0.32, veins = 3) {
  const a = angle * Math.PI / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const P = (u, v) => [r(x + u * cos - v * sin), r(y + u * sin + v * cos)];
  const w = len * width;
  const tip = P(len, 0);
  const c1 = P(len * 0.3, -w), c2 = P(len * 0.75, -w * 0.8);
  const c3 = P(len * 0.75, w * 0.8), c4 = P(len * 0.3, w);
  let d = `M${x},${y} C${c1} ${c2} ${tip} C${c3} ${c4} ${x},${y} Z M${x},${y} L${P(len * 0.92, 0)}`;
  for (let i = 1; i <= veins; i++) {
    const t = i / (veins + 1);
    const s = P(len * t, 0);
    d += ` M${s} Q${P(len * t + len * 0.1, -w * 0.35)} ${P(len * (t + 0.16), -w * 0.62)}`;
    d += ` M${s} Q${P(len * t + len * 0.1, w * 0.35)} ${P(len * (t + 0.16), w * 0.62)}`;
  }
  return d;
}

// Ramo principal da marca: desenhado em sequência: o caule cresce em velocidade
// constante e cada folha nasce quando o caule passa por ela.
function sprig({ width = 520, height = 320, cls = '', leaves = 9, seed = 1, stemSeconds = 7, start = 0.4 } = {}) {
  const p0 = [20, height * 0.62], p1 = [width * 0.3, height * 0.78], p2 = [width * 0.62, height * 0.28], p3 = [width - 20, height * 0.36];
  const bez = t => {
    const m = 1 - t;
    return [
      m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
      m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]
    ];
  };
  // comprimento acumulado do caule (para saber quando ele chega a cada ponto)
  const N = 200, acc = [0];
  let prev = bez(0);
  for (let i = 1; i <= N; i++) { const q = bez(i / N); acc.push(acc[i - 1] + Math.hypot(q[0] - prev[0], q[1] - prev[1])); prev = q; }
  const stemLen = acc[N];
  const speed = stemLen / stemSeconds;               // px por segundo
  const arrive = t => start + acc[Math.round(t * N)] / speed;
  const seg = (d, delay, dur) => `<path class="draw" pathLength="1" style="--del:${delay.toFixed(2)}s;--dur:${dur.toFixed(2)}s" d="${d}"/>`;

  const parts = [seg(`M${p0} C${p1} ${p2} ${p3}`, start, stemSeconds)];
  let rnd = seed;
  const rand = () => { rnd = (rnd * 9301 + 49297) % 233280; return rnd / 233280; };
  for (let i = 0; i < leaves; i++) {
    const t = 0.1 + (i / leaves) * 0.85;
    const [x, y] = bez(t);
    const [x2, y2] = bez(t + 0.01);
    const tangent = Math.atan2(y2 - y, x2 - x) * 180 / Math.PI;
    const side = i % 2 === 0 ? -1 : 1;
    const len = (height * 0.38) * (1 - t * 0.45) * (0.85 + rand() * 0.3);
    const ang = tangent + side * (38 + rand() * 18);
    const px = x + Math.cos(ang * Math.PI / 180) * 8, py = y + Math.sin(ang * Math.PI / 180) * 8;
    const d = `M${r(x)},${r(y)} L${r(px)},${r(py)} ` + leafPath(r(px), r(py), ang, len, 0.3, 3);
    // a folha é desenhada na mesma velocidade do caule (perímetro + nervuras ≈ 4,5 × comprimento)
    parts.push(seg(d, arrive(t), (4.5 * len) / (speed * 1.3)));
  }
  [0.35, 0.72].forEach((t, i) => {
    const [x, y] = bez(t);
    const dir = i ? -1 : 1;
    const bx = x + 18 * dir, by = y - 40;
    const d = `M${r(x)},${r(y)} Q${r(x + 4 * dir)},${r(y - 20)} ${r(bx)},${r(by)} ` + leafPath(r(bx), r(by), -120, 13, 0.55, 0) + ' ' + leafPath(r(bx), r(by), -60, 13, 0.55, 0) + ' ' + leafPath(r(bx), r(by), -90, 11, 0.6, 0);
    parts.push(seg(d, arrive(t) + 0.3, 140 / speed));
  });
  const [tx, ty] = bez(0.5);
  parts.push(seg(`M${r(tx)},${r(ty)} c 10,22 -6,34 2,48 c 4,7 10,6 9,0`, arrive(0.5) + 0.2, 70 / speed));
  return `<svg class="sprig ${cls}" viewBox="0 0 ${width} ${height}" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${parts.join('')}</svg>`;
}

// Ícones 48x48
const P = {
  leaf: leafPath(8, 40, -45, 40, 0.34, 3),
  bud: 'M24 44 V26 ' + leafPath(24, 26, -90, 18, 0.45, 1) + ' ' + leafPath(24, 34, -150, 13, 0.4, 1) + ' ' + leafPath(24, 36, -30, 13, 0.4, 1),
  whisk: 'M24 4 V18 M18 18 h12 M18 18 C14 30 16 40 24 44 C32 40 34 30 30 18 M21 18 C19 30 20 38 24 44 M27 18 C29 30 28 38 24 44 M24 18 V44',
  roll: 'M14 30 C10 22 18 14 26 18 C34 22 30 32 22 30 C16 28 18 22 24 23 M30 34 C36 34 40 28 37 22 M12 36 C18 40 26 40 32 37',
  cup: 'M8 20 H34 V30 C34 37 29 41 21 41 C13 41 8 37 8 30 Z M34 23 H37 C41 23 42 30 37 31 H34 M6 44 H36 M16 6 C14 9 18 11 16 14 M22 4 C20 8 24 10 22 14 M28 6 C26 9 30 11 28 14',
  cake: 'M24 24 m-18 0 a18 7 0 1 0 36 0 a18 7 0 1 0 -36 0 M6 24 V30 C6 34 14 37 24 37 C34 37 42 34 42 30 V24 M24 24 m-4 0 a4 1.6 0 1 0 8 0 a4 1.6 0 1 0 -8 0 M14 20 C18 18 22 19 24 21 M30 27 C34 26 36 27 37 28',
  gourd: 'M16 18 C10 24 10 36 16 41 C20 44 28 44 32 41 C38 36 38 24 32 18 Z M15 18 H33 M28 18 L36 4 M33 4 H39 M18 24 C22 22 26 22 30 24',
  needle: 'M10 40 L38 8 M14 34 l-6 -2 M18 30 l-5 -4 M22 25 l-3 -6 M26 21 l6 1 M30 16 l6 3 M34 12 l4 4 M16 37 l4 5 M20 32 l6 3',
  flower: 'M24 22 m-4 0 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 ' + [0, 60, 120, 180, 240, 300].map(a => leafPath(24 + 4 * Math.cos(a * Math.PI / 180), 22 + 4 * Math.sin(a * Math.PI / 180), a, 12, 0.5, 0)).join(' ') + ' M24 34 V46 M24 42 C28 38 32 39 33 40',
  moon: 'M30 6 C18 8 12 20 16 30 C20 40 32 44 40 38 C30 38 22 30 22 20 C22 14 25 9 30 6 Z M36 12 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 Z',
  spark: 'M24 4 L27 20 L42 24 L27 28 L24 44 L21 28 L6 24 L21 20 Z M38 8 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 Z',
  root: 'M24 4 V20 M24 20 C24 28 16 30 14 38 M24 20 C24 30 30 32 32 42 M24 26 C22 32 24 38 22 44 M14 38 l-4 4 M32 42 l3 3 ' + leafPath(24, 12, -140, 12, 0.45, 0) + ' ' + leafPath(24, 12, -40, 12, 0.45, 0),
  drop: 'M24 4 C24 4 10 20 10 30 C10 38 16 44 24 44 C32 44 38 38 38 30 C38 20 24 4 24 4 Z M18 32 C18 36 21 38 24 38',
  wave: 'M4 18 C10 14 14 22 20 18 S30 14 36 18 S44 20 44 20 M4 28 C10 24 14 32 20 28 S30 24 36 28 S44 30 44 30 M4 38 C10 34 14 42 20 38 S30 34 36 38 S44 40 44 40',
  ice: 'M12 8 H36 L33 42 H15 Z M17 18 h8 v8 h-8 Z M24 26 h7 v7 h-7 Z M30 4 L26 22',
  mortar: 'M6 22 H42 C42 34 34 42 24 42 C14 42 6 34 6 22 Z M16 42 H32 M30 22 L40 6 M37 4 l5 3',
  plate: 'M24 28 m-18 0 a18 8 0 1 0 36 0 a18 8 0 1 0 -36 0 M24 28 m-10 0 a10 4 0 1 0 20 0 a10 4 0 1 0 -20 0 M8 6 V16 M12 6 V16 M8 16 C8 19 12 19 12 16 M10 18 V24 M40 6 C36 8 36 16 40 18 V24',
  clock: 'M24 26 m-17 0 a17 17 0 1 0 34 0 a17 17 0 1 0 -34 0 M24 16 V26 L31 30 M20 4 H28 M24 4 V9',
  thermo: 'M20 8 C20 5 28 5 28 8 V30 C32 32 33 38 30 41 C27 44 21 44 18 41 C15 38 16 32 20 30 Z M24 16 V36',
  scale: 'M24 6 V40 M14 40 H34 M8 14 H40 M8 14 L3 28 H13 Z M40 14 L35 28 H45 Z',
  arrow: 'M8 24 H40 M30 14 L40 24 L30 34',
  check: 'M8 25 L19 36 L40 12',
  lock: 'M12 22 H36 V42 H12 Z M17 22 V15 C17 7 31 7 31 15 V22 M24 30 V34',
  download: 'M24 6 V32 M14 22 L24 32 L34 22 M8 40 H40',
  device: 'M14 4 H34 V44 H14 Z M22 39 H26',
  card: 'M4 12 H44 V38 H4 Z M4 19 H44 M10 30 H20',
  teapot: 'M12 20 C8 26 8 36 14 40 H34 C40 36 40 26 36 20 Z M14 20 C16 16 32 16 34 20 M22 14 H26 V16 M12 26 C6 24 4 18 2 16 M36 24 C44 22 46 34 36 36',
  press: 'M14 12 H34 V42 H14 Z M12 12 H36 M24 4 V30 M20 4 H28 M14 30 H34 M34 18 C42 18 42 34 34 34',
  box: 'M6 16 H42 V40 H6 Z M6 16 L12 8 H36 L42 16 M18 16 V40 M30 16 V40 M6 28 H42',
  jar: 'M12 14 H36 V42 H12 Z M10 10 H38 V14 H10 Z M24 14 V42 M12 28 H36 M17 20 h3 M28 34 h3',
  bag: 'M10 16 H38 L36 42 H12 Z M18 16 C18 8 30 8 30 16',
  book: 'M24 12 C19 9 12 9 7 11 V38 C12 36 19 36 24 39 C29 36 36 36 41 38 V11 C36 9 29 9 24 12 Z M24 12 V39'
};

function icon(name, cls = 'ico') {
  const d = P[name] || P.leaf;
  return `<svg class="${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}

// Logotipo: ramo pequeno + wordmark espaçado
function logo(cls = 'logo') {
  return `<span class="${cls}"><svg class="logo-mark" viewBox="0 0 64 40" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 30 C20 34 36 20 60 14 ${leafPath(16, 31, -110, 16, 0.38, 1)} ${leafPath(26, 28, -60, 15, 0.38, 1)} ${leafPath(36, 23, -125, 14, 0.38, 1)} ${leafPath(46, 19, -55, 12, 0.38, 1)} ${leafPath(56, 15, -100, 9, 0.4, 0)}"/></svg><span class="logo-word">BOTÂNORA</span></span>`;
}

module.exports = { sprig, icon, logo, leafPath };
