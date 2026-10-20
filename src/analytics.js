'use strict';
// Analytics próprio, sem cookies. Visitante = hash(sal diário + IP + user-agent).
// O IP nunca é gravado; o sal muda todo dia, então não há rastreio entre dias.
const crypto = require('crypto');
const store = require('./store');
// Compras de teste (criadas no painel) e pedidos arquivados ("Limpar últimos 30 dias") não entram nos números
const realOrders = () => store.db.orders.filter(o => !o.test && !o.archived);

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|curl|wget|python|axios|node-fetch|headless|lighthouse|pingdom|uptime/i;

function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function salt() {
  const today = dayKey();
  const m = store.db.meta;
  if (!m.salt || m.salt.day !== today) {
    m.salt = { day: today, value: crypto.randomBytes(16).toString('hex') };
    store.save();
  }
  return m.salt.value;
}

function visitorId(ip, ua) {
  return crypto.createHash('sha256').update(salt() + '|' + ip + '|' + ua).digest('hex').slice(0, 16);
}

function device(ua) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function browser(ua) {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung';
  if (/chrome|crios/i.test(ua)) return 'Chrome';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Outro';
}

function os(ua) {
  if (/windows/i.test(ua)) return 'Windows';
  if (/iphone|ipad|ios/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/mac os/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Outro';
}

function refHost(ref, host) {
  if (!ref) return '';
  try {
    const u = new URL(ref);
    if (u.host === host) return '';
    return u.host.replace(/^www\./, '');
  } catch (_) { return ''; }
}

function isBot(ua) { return !ua || BOT_RE.test(ua); }

function trackPageview(req, ctx) {
  const ua = req.headers['user-agent'] || '';
  if (isBot(ua)) return;
  if (req.headers['purpose'] === 'prefetch' || req.headers['sec-purpose']) return;
  const u = new URL(req.url, 'http://x');
  const utm = u.searchParams.get('utm_source') || u.searchParams.get('ref') || '';
  store.addEvent({
    t: Date.now(), type: 'pv', path: u.pathname, lang: ctx.lang || '',
    ref: refHost(req.headers.referer, req.headers.host), utm: utm.slice(0, 60),
    ...(u.searchParams.get('utm_campaign') ? { uc: u.searchParams.get('utm_campaign').slice(0, 80), um: (u.searchParams.get('utm_medium') || '').slice(0, 40) } : {}),
    ...(u.searchParams.get('fbclid') ? { fb: 1 } : {}),
    dev: device(ua), br: browser(ua), os: os(ua),
    al: (req.headers['accept-language'] || '').slice(0, 5),
    v: visitorId(ctx.ip, ua)
  });
}

function trackEvent(req, ip, name, props = {}) {
  const ua = req.headers['user-agent'] || '';
  if (isBot(ua)) return;
  store.addEvent({ t: Date.now(), type: 'ev', name, path: String(props.path || '').slice(0, 200), props, v: visitorId(ip, ua) });
}

function trackEngage(req, ip, path, ms) {
  const ua = req.headers['user-agent'] || '';
  if (isBot(ua)) return;
  ms = Math.max(0, Math.min(Number(ms) || 0, 30 * 60 * 1000));
  if (ms < 500) return;
  store.addEvent({ t: Date.now(), type: 'engage', path: String(path).slice(0, 200), ms, v: visitorId(ip, ua) });
}

// ---------- agregação para o painel ----------
const PRODUCT_PATH = /^\/(?:pt\/loja|en\/shop)\/([a-z0-9-]+)$/;

function startOfDay(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }

function countBy(arr, key, limit = 10) {
  const m = new Map();
  for (const x of arr) { const k = typeof key === 'function' ? key(x) : x[key]; if (k === undefined) continue; m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k, n]) => ({ key: k, n }));
}

function summarize(from, to) {
  const ev = store.events.filter(e => e.t >= from && e.t < to);
  const pv = ev.filter(e => e.type === 'pv');
  const visits = new Map(); // v|dia -> nº de páginas
  for (const e of pv) { const k = e.v + '|' + dayKey(e.t); visits.set(k, (visits.get(k) || 0) + 1); }
  const engageByVisit = new Map();
  for (const e of ev) if (e.type === 'engage') { const k = e.v + '|' + dayKey(e.t); engageByVisit.set(k, (engageByVisit.get(k) || 0) + e.ms); }
  const nVisits = visits.size;
  const bounces = [...visits.values()].filter(n => n === 1).length;
  const engageVals = [...engageByVisit.values()];
  const orders = realOrders().filter(o => o.createdAt >= from && o.createdAt < to);
  const paid = realOrders().filter(o => o.status === 'paid' && o.paidAt >= from && o.paidAt < to);
  const revenue = paid.reduce((s, o) => s + o.amount, 0);
  return {
    ev, pv, visits: nVisits,
    visitors: new Set(pv.map(e => e.v + '|' + dayKey(e.t))).size,
    pageviews: pv.length,
    pagesPerVisit: nVisits ? pv.length / nVisits : 0,
    bounceRate: nVisits ? bounces / nVisits : 0,
    avgEngageMs: engageVals.length ? engageVals.reduce((a, b) => a + b, 0) / engageVals.length : 0,
    orders: orders.length, paidOrders: paid.length, revenue,
    conversion: nVisits ? paid.length / nVisits : 0
  };
}

function stats(days = 30) {
  days = Math.max(1, Math.min(365, Number(days) || 30));
  const to = Date.now();
  const from = startOfDay(to) - (days - 1) * 86400000;
  const prevFrom = from - days * 86400000;
  const cur = summarize(from, to);
  const prev = summarize(prevFrom, from);

  // série diária
  const series = [];
  for (let d = 0; d < days; d++) {
    const s = from + d * 86400000;
    series.push({ day: dayKey(s), pv: 0, visitors: new Set(), revenue: 0, orders: 0 });
  }
  const idx = new Map(series.map((x, i) => [x.day, i]));
  for (const e of cur.pv) { const i = idx.get(dayKey(e.t)); if (i !== undefined) { series[i].pv++; series[i].visitors.add(e.v); } }
  for (const o of realOrders()) {
    if (o.status === 'paid' && o.paidAt >= from) { const i = idx.get(dayKey(o.paidAt)); if (i !== undefined) { series[i].revenue += o.amount; series[i].orders++; } }
  }

  // engajamento por página
  const pageStats = new Map();
  for (const e of cur.pv) {
    const p = pageStats.get(e.path) || { path: e.path, views: 0, vis: new Set(), ms: 0, msn: 0 };
    p.views++; p.vis.add(e.v + dayKey(e.t)); pageStats.set(e.path, p);
  }
  for (const e of cur.ev) if (e.type === 'engage') { const p = pageStats.get(e.path); if (p) { p.ms += e.ms; p.msn++; } }
  const topPages = [...pageStats.values()].sort((a, b) => b.views - a.views).slice(0, 12)
    .map(p => ({ path: p.path, views: p.views, visitors: p.vis.size, avgMs: p.msn ? p.ms / p.msn : 0 }));

  // produtos
  const productViews = new Map();
  for (const e of cur.pv) { const m = e.path.match(PRODUCT_PATH); if (m) productViews.set(m[1], (productViews.get(m[1]) || 0) + 1); }
  const checkouts = cur.ev.filter(e => e.type === 'ev' && e.name === 'checkout');
  const products = store.db.products.map(p => {
    const paid = realOrders().filter(o => o.product === p.slug && o.status === 'paid' && o.paidAt >= from);
    return {
      slug: p.slug, title: p.title.pt, status: p.status, price: p.price,
      views: productViews.get(p.slug) || 0,
      checkouts: checkouts.filter(c => c.props && c.props.product === p.slug).length,
      paid: paid.length,
      revenue: paid.reduce((s, o) => s + o.amount, 0),
      waitlist: store.db.waitlist.filter(w => w.product === p.slug).length,
      waitlistPeriod: store.db.waitlist.filter(w => w.product === p.slug && w.createdAt >= from).length,
      hasFile: store.hasFile(p)
    };
  });

  const named = n => cur.ev.filter(e => e.type === 'ev' && e.name === n).length;
  const shopPaths = /^\/(pt\/loja|en\/shop)/;
  const fiveMin = to - 5 * 60000;

  return {
    range: { days, from, to },
    kpis: {
      visitors: [cur.visitors, prev.visitors],
      pageviews: [cur.pageviews, prev.pageviews],
      visits: [cur.visits, prev.visits],
      pagesPerVisit: [cur.pagesPerVisit, prev.pagesPerVisit],
      bounceRate: [cur.bounceRate, prev.bounceRate],
      avgEngageMs: [cur.avgEngageMs, prev.avgEngageMs],
      revenue: [cur.revenue, prev.revenue],
      paidOrders: [cur.paidOrders, prev.paidOrders],
      orders: [cur.orders, prev.orders],
      conversion: [cur.conversion, prev.conversion],
      aov: [cur.paidOrders ? cur.revenue / cur.paidOrders : 0, prev.paidOrders ? prev.revenue / prev.paidOrders : 0]
    },
    realtime: new Set(store.events.filter(e => e.t >= fiveMin && (e.type === 'pv' || e.type === 'engage')).map(e => e.v)).size,
    series: series.map(s => ({ day: s.day, pv: s.pv, visitors: s.visitors.size, revenue: s.revenue, orders: s.orders })),
    topPages,
    referrers: countBy(cur.pv.filter(e => e.ref), 'ref'),
    utm: countBy(cur.pv.filter(e => e.utm), 'utm'),
    devices: countBy(cur.pv, 'dev'),
    browsers: countBy(cur.pv, 'br', 6),
    systems: countBy(cur.pv, 'os', 6),
    siteLang: countBy(cur.pv, 'lang'),
    browserLang: countBy(cur.pv.filter(e => e.al), 'al', 6),
    funnel: [
      { key: 'visits', n: cur.visits },
      { key: 'shop', n: new Set(cur.pv.filter(e => shopPaths.test(e.path)).map(e => e.v + dayKey(e.t))).size },
      { key: 'product', n: new Set(cur.pv.filter(e => PRODUCT_PATH.test(e.path)).map(e => e.v + dayKey(e.t))).size },
      { key: 'checkout', n: new Set(checkouts.map(e => e.v)).size },
      { key: 'paid', n: cur.paidOrders }
    ],
    products,
    engagement: {
      quizStart: named('quiz_start'), quizComplete: named('quiz_complete'),
      timerStart: named('timer_start'), timerDone: named('timer_done'),
      newsletter: store.db.subscribers.filter(s => s.createdAt >= from).length,
      waitlist: store.db.waitlist.filter(w => w.createdAt >= from).length,
      langSwitch: named('lang_switch'),
      downloads: named('download'),
      previewOpen: named('preview_open'),
      quizReco: named('quiz_reco'), recipeSave: named('recipe_save'),
      paths: named('path_free') + named('path_guide'), buyJump: named('buy_jump'),
      affClicks: named('aff_click')
    },
    quizResults: countBy(cur.ev.filter(e => e.type === 'ev' && e.name === 'quiz_complete'), e => e.props && e.props.tea),
    totals: {
      subscribers: store.db.subscribers.length,
      waitlist: store.db.waitlist.length,
      orders: realOrders().length,
      revenue: realOrders().filter(o => o.status === 'paid').reduce((s, o) => s + o.amount, 0),
      events: store.events.length
    }
  };
}

module.exports = { trackPageview, trackEvent, trackEngage, stats, isBot, dayKey };
