'use strict';
// Chá do dia: uma análise diária (fuso de São Paulo) do melhor chá para a manhã, a tarde e a noite.
//
// Critérios, nesta ordem:
//  1. Momento do dia: manhã aceita cafeína (mais em dia útil), tarde pede cafeína moderada,
//     noite só sem cafeína (regra fixa, nunca é quebrada).
//  2. Estação no Brasil (verão, outono, inverno, primavera): chás leves e versões geladas no calor,
//     chás encorpados no frio.
//  3. Variedade: evita repetir o chá do mesmo período do dia anterior.
//  4. Desempate estável por data (todo mundo vê a mesma escolha no mesmo dia).
// Cada escolha vem com uma receita grátis do site, o guia relacionado e o porquê.
// O painel pode trocar a escolha de qualquer dia (db.daily[YYYY-MM-DD]).
const crypto = require('crypto');
const store = require('./store');
const { teas } = require('./content/teas');
const { quizMap } = require('./content/quiz');

const PERIODS = ['morning', 'afternoon', 'night'];
const TZ = 'America/Sao_Paulo';
const dayKey = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
const addDays = (key, n) => { const d = new Date(key + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
function season(key) {
  const m = Number(key.slice(5, 7));
  return m === 12 || m <= 2 ? 'verao' : m <= 5 ? 'outono' : m <= 8 ? 'inverno' : 'primavera';
}
const weekday = key => new Date(key + 'T12:00:00Z').getUTCDay(); // 0 = domingo
const isWeekend = key => [0, 6].includes(weekday(key));

// Pontos base por período (0 = não entra)
const BASE = {
  morning: { preto: 5, matcha: 5, mate: 5, verde: 4, oolong: 3, puer: 2, branco: 1 },
  afternoon: { oolong: 5, branco: 5, verde: 4, rooibos: 4, ervas: 3, mate: 2, puer: 2 },
  night: { ervas: 5, rooibos: 5 }
};
const SEASON = {
  verao: { verde: 2, branco: 2, mate: 2, ervas: 2, matcha: 1, puer: -2, preto: -1 },
  outono: { oolong: 2, preto: 1, puer: 1, rooibos: 1 },
  inverno: { preto: 2, puer: 2, rooibos: 2, oolong: 1, branco: -1, verde: -1 },
  primavera: { branco: 2, oolong: 1, verde: 1, ervas: 1 }
};
const WEEKDAY_MORNING = { matcha: 1, mate: 1, verde: 1 }; // foco em dia útil
const WEEKEND_MORNING = { preto: 1, oolong: 1 };          // manhã sem pressa

const jitter = (key, period, tea) => crypto.createHash('sha256').update(`${key}|${period}|${tea}`).digest()[0] / 255 * 1.5;

function scoreFor(key, period) {
  const s = season(key);
  return Object.entries(BASE[period]).map(([tea, base]) => {
    let pts = base + (SEASON[s][tea] || 0);
    if (period === 'morning') pts += (isWeekend(key) ? WEEKEND_MORNING : WEEKDAY_MORNING)[tea] || 0;
    return { tea, pts };
  });
}
// Escolha automática. Para variar, olha as escolhas dos 2 dias anteriores (calculadas em sequência,
// a partir de 5 dias antes, sem recursão) e não repete o chá da manhã na tarde do mesmo dia.
const rank = (key, period, avoid) => scoreFor(key, period)
  .map(x => ({ ...x, j: x.pts + jitter(key, period, x.tea) - (avoid[x.tea] || 0) }))
  .sort((a, b) => b.j - a.j);
// Sequência estável: calculada dia a dia a partir de uma data fixa, então o "ontem" de hoje
// é exatamente o que apareceu ontem no site.
const ANCHOR = '2026-01-01';
const memo = new Map();
function computeDay(k, prev, prev2) {
  const day = {};
  // a noite (só sem cafeína) é escolhida antes da tarde, que tem mais opções e desvia das duas
  for (const period of ['morning', 'night', 'afternoon']) {
    const avoid = {};
    if (prev) avoid[prev[period]] = 4;
    if (prev2) avoid[prev2[period]] = (avoid[prev2[period]] || 0) + 2;
    if (period === 'afternoon') { avoid[day.morning] = (avoid[day.morning] || 0) + 3; avoid[day.night] = (avoid[day.night] || 0) + 3; }
    day[period] = rank(k, period, avoid)[0].tea;
    day['_first_' + period] = rank(k, period, {})[0].tea;
  }
  day._yesterday = prev || null;
  return day;
}
function autoDay(key) {
  if (memo.has(key)) return memo.get(key);
  if (key <= ANCHOR) { const d = computeDay(key, null, null); memo.set(key, d); return d; }
  // acha o último dia já calculado e segue em frente
  let k = key, back = [];
  while (!memo.has(k) && k > ANCHOR) { back.push(k); k = addDays(k, -1); }
  if (!memo.has(k)) memo.set(k, computeDay(k, null, null));
  for (const day of back.reverse()) { const prev = memo.get(addDays(day, -1)); memo.set(day, computeDay(day, prev, prev && prev._yesterday)); }
  return memo.get(key);
}

// Receita grátis que combina com o chá, o período e a estação
function recipeFor(key, period, teaId) {
  const seo = require('./views/seo'), { keysOf } = require('./pantry');
  // pelas chaves de ingrediente (as mesmas de "Com o que você tem"), não por palavras soltas
  const CAMELLIA = ['cha-branco', 'cha-verde', 'matcha', 'oolong', 'cha-preto', 'puer', 'hojicha'];
  const HERBS = ['camomila', 'hortela', 'capim-cidreira', 'erva-doce', 'hibisco', 'melissa', 'lavanda', 'alecrim', 'manjericao', 'gengibre', 'canela', 'cravo'];
  const want = { branco: ['cha-branco'], verde: ['cha-verde'], matcha: ['matcha'], oolong: ['oolong'], preto: ['cha-preto'], puer: ['puer'], mate: ['erva-mate'], rooibos: ['rooibos'] }[teaId];
  let list = seo.recipes.filter(r => {
    const keys = new Set(r.ingredients.flatMap(i => keysOf(i.item.pt)));
    if (want) return want.some(k => keys.has(k));
    return HERBS.some(k => keys.has(k)) && !CAMELLIA.some(k => keys.has(k)) && !keys.has('erva-mate') && !keys.has('rooibos'); // ervas
  });
  if (period === 'night') list = list.filter(r => !r.caffeine);
  if (!list.length) return null;
  // bebidas primeiro (rendimento em xícara, copo, caneca, jarra ou ml)
  const drinks = list.filter(r => /x[ií]cara|copo|caneca|jarra|\bml\b|cup|glass|mug|jug|pitcher/i.test(r.yield.pt + ' ' + r.yield.en));
  if (drinks.length) list = drinks;
  const s = season(key);
  const wantIced = s === 'verao' && period !== 'night' ? true : (s === 'inverno' || period === 'night') ? false : null;
  const pref = wantIced === null ? list : list.filter(r => !!r.iced === wantIced);
  const pool = pref.length ? pref : list;
  const n = crypto.createHash('sha256').update(`${key}|${period}|r`).digest().readUInt16BE(0);
  return pool[n % pool.length];
}

const WHY = {
  pt: {
    morning: { wd: 'Manhã de dia útil: cafeína com L-teanina para começar com foco, sem o pico do café.', we: 'Manhã de fim de semana: uma xícara mais encorpada, para tomar sem pressa.' },
    afternoon: 'Tarde: cafeína moderada (ou nenhuma) para uma pausa que não atrapalha o sono.',
    night: 'Noite: só sem cafeína, para desacelerar antes de dormir.',
    season: { verao: 'No verão, chás leves e versões geladas.', outono: 'No outono, chás tostados e aconchegantes.', inverno: 'No inverno, chás encorpados e quentes.', primavera: 'Na primavera, chás florais e delicados.' },
    variety: t => `Ontem foi ${t}: hoje variamos.`
  },
  en: {
    morning: { wd: 'Weekday morning: caffeine with L-theanine for a focused start, without the coffee spike.', we: 'Weekend morning: a fuller cup to enjoy slowly.' },
    afternoon: 'Afternoon: moderate (or no) caffeine for a break that will not keep you up.',
    night: 'Night: caffeine-free only, to slow down before bed.',
    season: { verao: 'In summer, light teas and iced versions.', outono: 'In autumn, roasted, cosy teas.', inverno: 'In winter, full-bodied hot teas.', primavera: 'In spring, floral, delicate teas.' },
    variety: t => `Yesterday was ${t}: today we switch it up.`
  }
};

function box() { if (!store.db.daily || typeof store.db.daily !== 'object') store.db.daily = {}; return store.db.daily; }

// Plano do dia: { key, season, weekend, periods: { morning: {...}, ... } }
function plan(key = dayKey(), lang = 'pt') {
  const ov = box()[key] || {};
  const w = WHY[lang] || WHY.pt;
  const out = { key, season: season(key), weekend: isWeekend(key), periods: {} };
  for (const period of PERIODS) {
    const auto = autoDay(key);
    const o = ov[period] || {};
    const teaId = o.tea && teas.some(t => t.id === o.tea) && (period !== 'night' || teas.find(t => t.id === o.tea).caffeine[1] === 0) ? o.tea : auto[period];
    const tea = teas.find(t => t.id === teaId);
    const seo = require('./views/seo');
    const recipe = (o.recipe && seo.recipes.find(r => r.slug.pt === o.recipe)) || recipeFor(key, period, teaId);
    const why = [period === 'morning' ? w.morning[out.weekend ? 'we' : 'wd'] : w[period], w.season[out.season]];
    // a variedade só é citada quando mudou a escolha (o chá de ontem seria o primeiro de novo)
    const y = auto._yesterday && auto._yesterday[period];
    if (!o.tea && auto['_first_' + period] === y && y !== teaId) why.push(w.variety(teas.find(t => t.id === y).name[lang]));
    out.periods[period] = {
      tea: teaId, name: tea.name[lang], tagline: tea.tagline[lang], icon: tea.icon, temp: tea.temp, time: tea.time, caffeine: tea.caffeine,
      recipe: recipe ? { slug: recipe.slug[lang], slugPt: recipe.slug.pt, name: recipe.name[lang], iced: recipe.iced, time: recipe.time[lang] } : null,
      guide: quizMap[teaId] ? quizMap[teaId].product : null,
      note: o.note && o.note[lang] ? o.note[lang] : '', why, manual: !!o.tea, autoTea: auto[period]
    };
  }
  return out;
}

// Painel: troca a escolha de um período (tea vazio = volta para o automático)
function setOverride(key, period, { tea, recipe, notePt, noteEn }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !PERIODS.includes(period)) return { error: 'invalid' };
  if (tea && !teas.some(t => t.id === tea)) return { error: 'tea' };
  if (tea && period === 'night' && teas.find(t => t.id === tea).caffeine[1] > 0) return { error: 'night_caffeine' };
  const day = box()[key] = box()[key] || {};
  if (!tea && !recipe && !notePt && !noteEn) delete day[period];
  else day[period] = { tea: tea || '', recipe: recipe || '', note: { pt: String(notePt || '').slice(0, 200), en: String(noteEn || '').slice(0, 200) } };
  if (!Object.keys(day).length) delete box()[key];
  // limpa dias antigos (mais de 60 dias)
  const old = addDays(dayKey(), -60);
  for (const k of Object.keys(box())) if (k < old) delete box()[k];
  store.save();
  return { ok: true };
}

module.exports = { plan, setOverride, dayKey, addDays, season, PERIODS };
