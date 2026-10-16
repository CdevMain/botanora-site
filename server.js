'use strict';
// Botanora: servidor HTTP sem dependências externas (Node 18+).
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const config = require('./src/config');
const store = require('./src/store');
const analytics = require('./src/analytics');
const auth = require('./src/auth');
const payments = require('./src/payments');
const access = require('./src/access');
const mailer = require('./src/mailer');
const { LANGS, routes, url, ui } = require('./src/i18n');
const pages = require('./src/views/pages');
const seo = require('./src/views/seo');
const adminView = require('./src/views/admin');

const PUBLIC = path.join(config.root, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json'
};
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

// ---------- utilitários ----------
function clientIp(req) {
  if (config.trustProxy) {
    const xf = req.headers['x-forwarded-for'];
    if (xf) return xf.split(',')[0].trim();
    if (req.headers['cf-connecting-ip']) return req.headers['cf-connecting-ip'];
  }
  return req.socket.remoteAddress || '';
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.clarity.ms https://*.clarity.ms; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.clarity.ms https://c.bing.com; frame-ancestors 'none'; form-action 'self' https://www.mercadopago.com.br; base-uri 'self'"
};

if (config.siteUrl.startsWith('https://')) SECURITY_HEADERS['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';

function send(req, res, status, body, type = 'text/html; charset=utf-8', headers = {}) {
  let buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  const h = Object.assign({ 'Content-Type': type }, SECURITY_HEADERS, headers);
  if (buf.length > 1024 && /text|json|javascript|svg|xml/.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    buf = zlib.gzipSync(buf);
    h['Content-Encoding'] = 'gzip';
    h['Vary'] = 'Accept-Encoding';
  }
  h['Content-Length'] = buf.length;
  res.writeHead(status, h);
  res.end(req.method === 'HEAD' ? undefined : buf);
}
const json = (req, res, status, obj, headers) => send(req, res, status, JSON.stringify(obj), 'application/json; charset=utf-8', Object.assign({ 'Cache-Control': 'no-store' }, headers));
const redirect = (res, to, status = 302) => { res.writeHead(status, Object.assign({ Location: to }, SECURITY_HEADERS)); res.end(); };

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > limit) { reject(Object.assign(new Error('too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
async function readJson(req, limit) {
  const raw = await readBody(req, limit);
  try { return JSON.parse(raw.toString('utf8') || '{}'); } catch (_) { throw Object.assign(new Error('bad json'), { status: 400 }); }
}

// limite simples por IP
const buckets = new Map();
function rateLimit(ip, key, max, windowMs) {
  const k = key + '|' + ip; const now = Date.now();
  const b = buckets.get(k) || { n: 0, reset: now + windowMs };
  if (now > b.reset) { b.n = 0; b.reset = now + windowMs; }
  b.n++; buckets.set(k, b);
  return b.n <= max;
}
setInterval(() => { const now = Date.now(); for (const [k, b] of buckets) if (now > b.reset) buckets.delete(k); }, 60000).unref();

function sameOrigin(req) {
  const o = req.headers.origin || req.headers.referer;
  if (!o) return true;
  try { return new URL(o).host === req.headers.host; } catch (_) { return false; }
}

function preferredLang(req) {
  const c = auth.parseCookies(req).lang;
  if (LANGS.includes(c)) return c;
  const al = (req.headers['accept-language'] || '').trim().toLowerCase();
  return !al || al.startsWith('pt') ? 'pt' : 'en';
}

// Link da biblioteca e e-mail de acesso
function libraryUrl(email, lang) { return url(lang, 'library') + '?t=' + access.signAccess(email); }
async function sendAccess(email, lang) {
  if (!mailer.enabled()) return { skipped: true };
  const orders = store.paidOrdersFor(email);
  if (!orders.length) return { skipped: true };
  const titles = [...new Set(orders.map(o => { const p = store.getProduct(o.product); return p ? p.title[lang] : o.title; }))];
  const name = (orders.find(o => o.name) || {}).name || '';
  const mail = mailer.accessEmail({ lang, name, titles, link: config.siteUrl + libraryUrl(email, lang), receiveUrl: config.siteUrl + url(lang, 'receive') });
  return mailer.send({ to: email, ...mail });
}
function sendAccessLater(email, lang) { sendAccess(email, lang).catch(e => console.error('e-mail de acesso:', e.message)); }

function streamPdf(req, res, file, name) {
  const stat = fs.statSync(file);
  res.writeHead(200, Object.assign({}, SECURITY_HEADERS, {
    'Content-Type': 'application/pdf', 'Content-Length': stat.size, 'Cache-Control': 'private, no-store',
    'Content-Disposition': `attachment; filename="${name}"`
  }));
  fs.createReadStream(file).pipe(res);
}

function serveStatic(req, res, pathname) {
  const file = path.normalize(path.join(PUBLIC, decodeURIComponent(pathname)));
  if (!file.startsWith(PUBLIC + path.sep)) return false;
  let stat;
  try { stat = fs.statSync(file); } catch (_) { return false; }
  if (!stat.isFile()) return false;
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const etag = `"${stat.size.toString(36)}-${stat.mtimeMs.toString(36)}"`;
  if (req.headers['if-none-match'] === etag) { res.writeHead(304); res.end(); return true; }
  const cache = req.url.includes('?v=') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600';
  send(req, res, 200, fs.readFileSync(file), type, { 'Cache-Control': cache, ETag: etag });
  return true;
}

// Afiliados: só lojas conhecidas
const AFF_HOST = /(^|\.)(meli\.la|mercadolivre\.com\.br|mercadolibre\.com|amazon\.com\.br|amazon\.com|amzn\.to|amzn\.com|a\.co)$/i;
function safeHost(u) { try { return new URL(u).host; } catch (_) { return ''; } }
function safePath(u) { try { return new URL(u).pathname.slice(0, 120); } catch (_) { return ''; } }
const slugify = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'item';

// ---------- páginas públicas ----------
const keyBySeg = {};
for (const lang of LANGS) { keyBySeg[lang] = {}; for (const [k, v] of Object.entries(routes)) keyBySeg[lang][v[lang]] = k; }

function renderPublic(req, res, lang, rest, ip, query) {
  const products = store.db.products;
  const [seg = '', sub, ...more] = rest;
  const key = keyBySeg[lang][seg];
  let html = null, status = 200;

  if (more.length) { /* rota desconhecida: 404 */ }
  else if (key === 'home' && !sub) html = pages.home(lang, products);
  else if (key === 'guide' && !sub) html = pages.guide(lang, products);
  else if (key === 'guide' && sub) { const tea = seo.teaById(sub); if (tea) html = seo.teaPage(lang, tea); }
  else if (key === 'recipes' && !sub) html = seo.recipesIndex(lang);
  else if (key === 'recipes' && sub) { const r = seo.recipeBySlug(lang, sub); if (r) { if (r.slug[lang] !== sub) return redirect(res, seo.recipePaths(r)[lang], 301); html = seo.recipePage(lang, r); } }
  else if (key === 'faq' && !sub) html = seo.faqPage(lang);
  else if (key === 'benefits' && !sub) html = pages.benefitsPage(lang);
  else if (key === 'brewing' && !sub) html = pages.brewing(lang);
  else if (key === 'quiz' && !sub) html = pages.quizPage(lang, products);
  else if (key === 'privacy' && !sub) html = pages.privacy(lang);
  else if (key === 'gear' && !sub) html = pages.gear(lang);
  else if (key === 'receive' && !sub) html = pages.receive(lang, { email: (query.get('email') || '').slice(0, 120) });
  else if (key === 'library' && !sub) {
    const acc = access.verifyAccess(query.get('t') || '');
    const out = acc ? pages.library(lang, acc.email, query.get('t')) : pages.receive(lang, { expired: true });
    return send(req, res, 200, out, undefined, { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex' });
  }
  else if (key === 'shop' && !sub) html = pages.shop(lang, products);
  else if (key === 'shop' && sub) {
    const p = store.getProduct(sub);
    if (p && p.status !== 'hidden') html = pages.product(lang, p, products);
  } else if (key === 'order' && sub) {
    const o = store.findOrder(sub);
    if (o && query.get('t') === o.token) {
      const p = store.getProduct(o.product);
      const extra = { pix: o.provider === 'pix' ? payments.pixPayload({ amountCents: o.amount, txid: o.id }) : null, mpUrl: o.mpUrl || null };
      return send(req, res, 200, pages.order(lang, o, p, extra), undefined, { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
    }
  }

  if (!html) { html = pages.notFound(lang); status = 404; }
  else if (req.method === 'GET') analytics.trackPageview(req, { lang, ip });
  send(req, res, status, html, undefined, {
    'Cache-Control': 'no-cache',
    'Set-Cookie': `lang=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`
  });
}

// ---------- busca e IAs ----------
// Robôs de busca e de IA são bem-vindos nas páginas públicas (ChatGPT, Claude, Perplexity, Gemini, Copilot, Apple).
const AI_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'meta-externalagent', 'CCBot'];
const PRIVATE_PATHS = ['/admin', '/api/', '/download/', '/pt/pedido/', '/en/order/', '/pt/biblioteca', '/en/library', '/r/'];
function robotsTxt() {
  const block = ua => `User-agent: ${ua}\nAllow: /\n${PRIVATE_PATHS.map(p => `Disallow: ${p}`).join('\n')}\n`;
  return ['# Botanora: conteúdo aberto para buscadores e assistentes de IA.', '# Resumo para IAs: ' + config.siteUrl + '/llms.txt', '', block('*'), ...AI_BOTS.map(block), `Sitemap: ${config.siteUrl}/sitemap.xml`, ''].join('\n');
}

// Versão Markdown das páginas de conteúdo: mesma URL + .md
function markdownFor(pathname) {
  const parts = pathname.slice(0, -3).split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch (_) { return s; } });
  const [lang, seg, sub] = parts;
  if (!LANGS.includes(lang)) return null;
  const key = keyBySeg[lang][seg || ''];
  if (key === 'guide' && sub) { const tea = seo.teaById(sub); return tea ? seo.mdTea(lang, tea) : null; }
  if (key === 'recipes' && sub) { const r = seo.recipeBySlug(lang, sub); return r ? seo.mdRecipe(lang, r) : null; }
  if (key === 'recipes') return seo.mdRecipes(lang);
  if (key === 'faq') return seo.mdFaq(lang);
  if (key === 'shop' && sub) { const p = store.getProduct(sub); return p && p.status !== 'hidden' ? seo.mdProduct(lang, p) : null; }
  if (key === 'home' && !seg) return seo.llmsTxt(false);
  return null;
}

// Lista de URLs públicas (sitemap e IndexNow)
function publicUrls() {
  const list = [];
  const add = (pt, en, lastmod) => list.push({ pt, en, lastmod });
  const both = (key, ...rest) => add(url('pt', key, ...rest), url('en', key, ...rest));
  ['home', 'guide', 'benefits', 'brewing', 'recipes', 'faq', 'gear', 'quiz', 'shop', 'privacy'].forEach(k => both(k));
  require('./src/content/teas').teas.forEach(t => both('guide', t.id));
  seo.recipes.forEach(r => { const p = seo.recipePaths(r); add(p.pt, p.en); });
  store.db.products.filter(p => p.status !== 'hidden').forEach(p => both('shop', p.slug));
  return list;
}

// IndexNow: avisa Bing (base do Copilot) e outros buscadores das URLs, uma vez por dia no máximo
async function indexNowPing() {
  if (!config.siteUrl.startsWith('https://') || /localhost|127\.0\.0\.1/.test(config.siteUrl)) return;
  const day = new Date().toISOString().slice(0, 10);
  if (store.db.meta.indexNowDay === day) return;
  const host = new URL(config.siteUrl).host;
  const urlList = publicUrls().flatMap(e => [config.siteUrl + e.pt, config.siteUrl + e.en]);
  try {
    const r = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: config.indexNowKey, keyLocation: `${config.siteUrl}/${config.indexNowKey}.txt`, urlList }) });
    console.log(`  IndexNow: ${urlList.length} URLs enviadas (${r.status})`);
    store.db.meta.indexNowDay = day; store.save();
  } catch (e) { console.log('  IndexNow falhou:', e.message); }
}

function sitemap() {
  const base = config.siteUrl, today = new Date().toISOString().slice(0, 10);
  const xml = publicUrls().map(e => LANGS.map(l => `<url><loc>${base}${e[l]}</loc><lastmod>${e.lastmod || today}</lastmod><xhtml:link rel="alternate" hreflang="pt-BR" href="${base}${e.pt}"/><xhtml:link rel="alternate" hreflang="en" href="${base}${e.en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${base}${e.pt}"/></url>`).join('')).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${xml}</urlset>`;
}

// ---------- API pública ----------
async function apiPublic(req, res, pathname, ip, query) {
  if (req.method === 'POST' && !sameOrigin(req)) return json(req, res, 403, { error: 'origin' });

  if (pathname === '/api/event' && req.method === 'POST') {
    if (!rateLimit(ip, 'event', 120, 60000)) return json(req, res, 429, { error: 'rate' });
    const b = await readJson(req, 4096);
    const allowed = ['quiz_start', 'quiz_complete', 'timer_start', 'timer_done', 'lang_switch', 'download', 'cta', 'preview_open', 'preview_page'];
    if (b.type === 'engage') analytics.trackEngage(req, ip, b.path, b.ms);
    else if (allowed.includes(b.name)) {
      const props = {};
      for (const [k, v] of Object.entries(b.props || {}).slice(0, 5)) props[String(k).slice(0, 20)] = String(v).slice(0, 60);
      props.path = String(b.path || '').slice(0, 200);
      analytics.trackEvent(req, ip, b.name, props);
    }
    res.writeHead(204, SECURITY_HEADERS); return res.end();
  }

  if (pathname === '/api/newsletter' && req.method === 'POST') {
    if (!rateLimit(ip, 'form', 10, 600000)) return json(req, res, 429, { error: 'rate' });
    const b = await readJson(req);
    if (!EMAIL_RE.test(b.email || '')) return json(req, res, 400, { error: 'email' });
    store.addSubscriber(b.email.trim(), LANGS.includes(b.lang) ? b.lang : 'pt', String(b.path || '').slice(0, 100));
    return json(req, res, 200, { ok: true });
  }

  if (pathname === '/api/waitlist' && req.method === 'POST') {
    if (!rateLimit(ip, 'form', 10, 600000)) return json(req, res, 429, { error: 'rate' });
    const b = await readJson(req);
    const p = store.getProduct(b.product);
    if (!p || !EMAIL_RE.test(b.email || '')) return json(req, res, 400, { error: 'invalid' });
    store.addWaitlist(b.email.trim(), p.slug, LANGS.includes(b.lang) ? b.lang : 'pt');
    return json(req, res, 200, { ok: true });
  }

  if (pathname === '/api/checkout' && req.method === 'POST') {
    if (!rateLimit(ip, 'checkout', 8, 600000)) return json(req, res, 429, { error: 'rate' });
    const b = await readJson(req);
    const p = store.getProduct(b.product);
    const lang = LANGS.includes(b.lang) ? b.lang : 'pt';
    const name = String(b.name || '').trim().slice(0, 80);
    const email = String(b.email || '').trim().slice(0, 120);
    if (!p || p.status !== 'available' || !name || !EMAIL_RE.test(email) || !b.consent) return json(req, res, 400, { error: 'invalid' });
    const order = store.createOrder({ product: p, name, email, lang, pdfLang: LANGS.includes(b.pdfLang) ? b.pdfLang : lang });
    analytics.trackEvent(req, ip, 'checkout', { product: p.slug, path: b.path || '' });
    const orderUrl = url(lang, 'order', order.id) + '?t=' + order.token;
    if (order.provider === 'mercadopago') {
      try {
        order.mpUrl = await payments.mpCreatePreference(order, p);
        store.save();
        return json(req, res, 200, { redirect: order.mpUrl });
      } catch (e) {
        console.error(e.message);
        order.provider = 'pix'; store.save();
      }
    }
    return json(req, res, 200, { redirect: orderUrl });
  }

  const st = pathname.match(/^\/api\/order\/([A-Z0-9]+)\/status$/);
  if (st && req.method === 'GET') {
    const o = store.findOrder(st[1]);
    if (!o || query.get('t') !== o.token) return json(req, res, 404, { error: 'not found' });
    return json(req, res, 200, { status: o.status });
  }

  if (pathname === '/api/webhooks/mercadopago' && req.method === 'POST') {
    const b = await readJson(req, 32 * 1024).catch(() => ({}));
    const dataId = (b.data && b.data.id) || query.get('data.id') || query.get('id');
    const type = b.type || query.get('type') || query.get('topic');
    if (type === 'payment' && dataId && config.mercadoPago.accessToken) {
      if (!payments.mpVerifySignature(req, dataId)) return json(req, res, 401, { error: 'signature' });
      try {
        const pay = await payments.mpGetPayment(dataId);
        const o = store.findOrder(pay.external_reference);
        if (o && pay.status === 'approved' && Math.round(pay.transaction_amount * 100) >= o.amount) {
          store.markPaid(o, { paymentId: String(pay.id), method: pay.payment_type_id });
          sendAccessLater(o.email, o.pdfLang);
        }
      } catch (e) { console.error('webhook:', e.message); }
    }
    return json(req, res, 200, { ok: true });
  }

  // Página "Receber": e-mail (+ código do pedido) -> biblioteca
  if (pathname === '/api/access' && req.method === 'POST') {
    if (!rateLimit(ip, 'access', 8, 600000)) return json(req, res, 429, { error: 'rate' });
    const b = await readJson(req);
    const lang = LANGS.includes(b.lang) ? b.lang : 'pt';
    const email = String(b.email || '').trim().toLowerCase();
    const code = String(b.code || '').trim().toUpperCase().replace(/^#/, '');
    if (!EMAIL_RE.test(email)) return json(req, res, 400, { error: 'email' });
    const orders = store.paidOrdersFor(email);
    if (code) {
      const ok = orders.some(o => [o.id, o.refId, o.externalId].filter(Boolean).map(x => String(x).toUpperCase()).includes(code));
      return ok ? json(req, res, 200, { redirect: libraryUrl(email, lang) }) : json(req, res, 404, { error: 'notfound' });
    }
    if (mailer.enabled()) { if (orders.length) sendAccessLater(email, lang); return json(req, res, 200, { sent: true }); }
    return json(req, res, 200, { needCode: true });
  }

  // Download pela biblioteca (link de acesso + guia + idioma)
  if (pathname === '/api/library/download' && req.method === 'GET') {
    const acc = access.verifyAccess(query.get('t') || '');
    if (!acc) return send(req, res, 403, 'Link expirado. Peça um novo em ' + config.siteUrl + '/receber', 'text/plain; charset=utf-8');
    const slug = query.get('slug');
    const orders = store.paidOrdersFor(acc.email).filter(o => o.product === slug);
    const p = store.getProduct(slug);
    const o = orders.find(x => x.downloads < config.maxDownloads);
    if (!p || !orders.length) return send(req, res, 404, 'Guia não encontrado', 'text/plain; charset=utf-8');
    if (!o) return send(req, res, 429, 'Limite de downloads atingido. Fale com ' + config.contactEmail, 'text/plain; charset=utf-8');
    const f = store.resolveFile(p, query.get('lang'));
    if (!f) return send(req, res, 404, 'Arquivo indisponível', 'text/plain; charset=utf-8');
    o.downloads++; store.save();
    analytics.trackEvent(req, ip, 'download', { product: p.slug, lang: f.lang, path: '/library' });
    return streamPdf(req, res, f.path, `botanora-${p.slug}-${f.lang}.pdf`);
  }

  // Webhook da Cakto
  if (pathname === '/api/webhooks/cakto' && req.method === 'POST') return caktoWebhook(req, res);

  return json(req, res, 404, { error: 'not found' });
}

// ---------- Cakto ----------
function caktoLog(entry) {
  const m = store.db.meta;
  m.caktoLog = [Object.assign({ t: Date.now() }, entry), ...(m.caktoLog || [])].slice(0, 40);
  store.save();
}
function caktoVerify(req, raw, body) {
  const secret = config.cakto.secret;
  if (!secret) return 'CAKTO_WEBHOOK_SECRET não configurado';
  const sigHeader = String(req.headers['x-cakto-signature'] || '');
  const ts = String(req.headers['x-cakto-timestamp'] || '');
  if (sigHeader) {
    if (!/^\d+$/.test(ts) || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return 'timestamp inválido';
    const expected = 'v1=' + crypto.createHmac('sha256', secret).update(ts + '.').update(raw).digest('hex');
    const ok = sigHeader.split(',').map(x => x.trim()).some(v => v.length === expected.length && crypto.timingSafeEqual(Buffer.from(v), Buffer.from(expected)));
    return ok ? null : 'assinatura inválida';
  }
  const got = String(body.secret || '');
  const a = crypto.createHash('sha256').update(got).digest(), b2 = crypto.createHash('sha256').update(secret).digest();
  return got && crypto.timingSafeEqual(a, b2) ? null : 'secret inválido';
}
// Lê "id" ou "id:en" configurados no admin
function caktoMatches(ids) {
  const out = [];
  for (const p of store.db.products) {
    for (const entry of p.cakto || []) {
      const [cid, l] = String(entry).split(':').map(x => x.trim());
      if (cid && ids.includes(cid)) { out.push({ p, lang: LANGS.includes(l) ? l : null }); break; }
    }
  }
  return out;
}
async function caktoWebhook(req, res) {
  const raw = await readBody(req, 256 * 1024);
  let body;
  try { body = JSON.parse(raw.toString('utf8')); } catch (_) { return json(req, res, 400, { error: 'json' }); }
  const err = caktoVerify(req, raw, body);
  if (err) { caktoLog({ event: body.event || '?', result: 'rejeitado: ' + err }); return json(req, res, 401, { error: err }); }
  const event = String(body.event || '');
  const d = body.data || {};
  const prod = d.product || {}, offer = d.offer || {}, cust = d.customer || {};
  const ids = [prod.id, prod.short_id, offer.id].filter(Boolean).map(String);
  const base = { event, product: prod.name || '', productId: prod.id || '', shortId: prod.short_id || '', offerId: offer.id || '', offerName: offer.name || '', email: cust.email || '', ref: d.refId || d.id || '' };

  if (event === 'purchase_approved') {
    const email = String(cust.email || '').trim().toLowerCase();
    const matches = caktoMatches(ids);
    if (!EMAIL_RE.test(email) || !d.id) { caktoLog({ ...base, result: 'ignorado: sem e-mail ou id' }); return json(req, res, 200, { ok: true }); }
    if (!matches.length) { caktoLog({ ...base, result: 'sem guia ligado: copie o ID no painel' }); return json(req, res, 200, { ok: true, unmatched: true }); }
    const total = Math.round(Number(d.amount ?? d.baseAmount ?? offer.price ?? 0) * 100);
    const created = [];
    let langForMail = 'pt';
    for (const { p, lang } of matches) {
      const pdfLang = lang || 'pt';
      langForMail = pdfLang;
      const r = store.createExternalOrder({
        product: p, name: cust.name, email, amount: Math.round(total / matches.length), pdfLang,
        provider: 'cakto', externalId: String(d.id), refId: d.refId ? String(d.refId) : '', method: d.paymentMethodName || d.paymentMethod || ''
      });
      if (r.created) created.push(p.slug);
    }
    caktoLog({ ...base, result: created.length ? 'liberado: ' + created.join(', ') : 'duplicado (já liberado)' });
    if (created.length) sendAccessLater(email, langForMail);
    return json(req, res, 200, { ok: true, released: created });
  }

  if (['refund', 'chargeback'].includes(event) && d.id) {
    const list = store.db.orders.filter(o => o.provider === 'cakto' && o.externalId === String(d.id));
    list.forEach(o => { o.status = 'refunded'; o.refundedAt = Date.now(); });
    store.save();
    caktoLog({ ...base, result: list.length ? 'acesso revogado (' + list.length + ')' : 'pedido não encontrado' });
    return json(req, res, 200, { ok: true });
  }

  caktoLog({ ...base, result: 'evento sem ação' });
  return json(req, res, 200, { ok: true });
}

// ---------- download protegido ----------
function download(req, res, orderId, query, ip) {
  const o = store.findOrder(orderId);
  if (!o || query.get('t') !== o.token || o.status !== 'paid') return send(req, res, 403, 'Acesso negado', 'text/plain; charset=utf-8');
  const p = store.getProduct(o.product);
  const f = p && store.resolveFile(p, query.get('lang') || o.pdfLang);
  if (!f) return send(req, res, 404, 'Arquivo indisponível', 'text/plain; charset=utf-8');
  if (o.downloads >= config.maxDownloads) return send(req, res, 429, 'Limite de downloads atingido. Fale com ' + config.contactEmail, 'text/plain; charset=utf-8');
  o.downloads++; store.save();
  analytics.trackEvent(req, ip, 'download', { product: p.slug, lang: f.lang, path: '/download' });
  return streamPdf(req, res, f.path, `botanora-${p.slug}-${f.lang}.pdf`);
}

// ---------- API admin ----------
function toCsv(rows, cols) {
  const q = v => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return '﻿' + [cols.join(','), ...rows.map(r => cols.map(c => q(r[c])).join(','))].join('\n');
}
const iso = ts => ts ? new Date(ts).toISOString() : '';

async function apiAdmin(req, res, pathname, ip, query) {
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    if (!sameOrigin(req)) return json(req, res, 403, { error: 'origin' });
    const b = await readJson(req);
    const r = auth.login(ip, String(b.user || ''), String(b.password || ''));
    if (r.error) return json(req, res, r.error === 'locked' ? 429 : 401, { error: r.error });
    return json(req, res, 200, { ok: true }, { 'Set-Cookie': auth.cookieHeader(r.token, config.siteUrl.startsWith('https')) });
  }
  if (!auth.isAuthed(req)) return json(req, res, 401, { error: 'auth' });
  if (req.method !== 'GET' && !sameOrigin(req)) return json(req, res, 403, { error: 'origin' });

  if (pathname === '/api/admin/logout' && req.method === 'POST') {
    auth.logout(req);
    return json(req, res, 200, { ok: true }, { 'Set-Cookie': auth.cookieHeader('', false) });
  }
  if (pathname === '/api/admin/stats') return json(req, res, 200, analytics.stats(query.get('days')));
  if (pathname === '/api/admin/orders') {
    return json(req, res, 200, store.db.orders.slice().reverse().slice(0, 500).map(o => ({ ...o, token: undefined, link: o.provider === 'cakto' ? libraryUrl(o.email, o.pdfLang) : url(o.lang, 'order', o.id) + '?t=' + o.token, library: libraryUrl(o.email, o.pdfLang) })));
  }
  if (pathname === '/api/admin/audience') {
    return json(req, res, 200, { subscribers: store.db.subscribers.slice().reverse(), waitlist: store.db.waitlist.slice().reverse() });
  }
  if (pathname === '/api/admin/products' && req.method === 'GET') {
    return json(req, res, 200, store.db.products.map(p => ({ ...p, fileInfo: Object.fromEntries(LANGS.map(l => { const f = p.files[l] && store.pdfPath(p.files[l]); return [l, f && fs.existsSync(f) ? fs.statSync(f).size : 0]; })) })));
  }
  if (pathname === '/api/admin/integrations') {
    return json(req, res, 200, {
      webhookUrl: config.siteUrl + '/api/webhooks/cakto', caktoSecret: !!config.cakto.secret, mail: mailer.enabled(), mailFrom: config.mail.from,
      receive: { pt: config.siteUrl + '/receber', en: config.siteUrl + '/receive' }, siteUrl: config.siteUrl, log: store.db.meta.caktoLog || []
    });
  }

  const om = pathname.match(/^\/api\/admin\/orders\/([A-Z0-9]+)$/);
  if (om && req.method === 'POST') {
    const o = store.findOrder(om[1]);
    if (!o) return json(req, res, 404, { error: 'not found' });
    const b = await readJson(req);
    if (b.status === 'paid') { store.markPaid(o, { method: 'manual' }); sendAccessLater(o.email, o.pdfLang); }
    if (b.resend) {
      try { const r = await sendAccess(o.email, o.pdfLang); return json(req, res, 200, { ok: true, sent: !r.skipped, link: config.siteUrl + libraryUrl(o.email, o.pdfLang) }); }
      catch (e) { return json(req, res, 502, { error: e.message }); }
    }
    else if (b.status === 'cancelled' || b.status === 'pending') { o.status = b.status; o.paidAt = null; store.save(); }
    if (b.resetDownloads) { o.downloads = 0; store.save(); }
    return json(req, res, 200, { ok: true });
  }

  const pm = pathname.match(/^\/api\/admin\/products\/([a-z0-9-]+)(\/pdf)?$/);
  if (pm) {
    const p = store.getProduct(pm[1]);
    if (!p) return json(req, res, 404, { error: 'not found' });
    if (!pm[2] && req.method === 'PUT') {
      const b = await readJson(req);
      if (['available', 'coming_soon', 'hidden'].includes(b.status)) {
        if (b.status === 'available' && !store.hasFile(p)) return json(req, res, 400, { error: 'nofile' });
        p.status = b.status;
      }
      if (Number.isFinite(b.price) && b.price >= 100 && b.price <= 1000000) p.price = Math.round(b.price);
      if (Number.isFinite(b.pages) && b.pages > 0 && b.pages < 2000) p.pages = Math.round(b.pages);
      if (typeof b.cakto === 'string') p.cakto = b.cakto.split(/[\s,;]+/).map(x => x.trim()).filter(Boolean).slice(0, 20).map(x => x.slice(0, 80));
      for (const f of ['title', 'subtitle', 'description']) {
        if (b[f] && typeof b[f] === 'object') for (const l of LANGS) if (typeof b[f][l] === 'string' && b[f][l].trim()) p[f][l] = b[f][l].trim().slice(0, f === 'description' ? 1200 : 140);
      }
      store.save();
      return json(req, res, 200, { ok: true, product: p });
    }
    if (pm[2] && req.method === 'POST') {
      const buf = await readBody(req, 80 * 1024 * 1024);
      if (buf.slice(0, 5).toString() !== '%PDF-') return json(req, res, 400, { error: 'notpdf' });
      const lang = LANGS.includes(query.get('lang')) ? query.get('lang') : 'pt';
      const name = `${p.slug}-${lang}.pdf`;
      fs.writeFileSync(store.pdfPath(name), buf);
      p.files[lang] = name; store.save();
      return json(req, res, 200, { ok: true, size: buf.length });
    }
  }

  // Recomendações (afiliados)
  if (pathname === '/api/admin/affiliates' && req.method === 'GET') {
    const since = Date.now() - 30 * 86400000;
    const clicks = {}, clicks30 = {};
    for (const e of store.events) if (e.type === 'ev' && e.name === 'aff_click' && e.props) { clicks[e.props.id] = (clicks[e.props.id] || 0) + 1; if (e.t >= since) clicks30[e.props.id] = (clicks30[e.props.id] || 0) + 1; }
    return json(req, res, 200, store.db.affiliates.slice().sort((a, b) => (a.order || 99) - (b.order || 99)).map(a => ({ ...a, clicks: clicks[a.id] || 0, clicks30: clicks30[a.id] || 0 })));
  }
  const am = pathname.match(/^\/api\/admin\/affiliates(?:\/([a-z0-9-]+))?(\/image)?$/);
  if (am) {
    const clean = b => {
      const out = {};
      if (typeof b.url === 'string') { if (!AFF_HOST.test(safeHost(b.url.trim()))) throw Object.assign(new Error('host'), { status: 400 }); out.url = b.url.trim().slice(0, 600); }
      if (typeof b.source === 'string') out.source = b.source.trim().slice(0, 1000);
      if (['ml', 'amazon'].includes(b.store)) out.store = b.store;
      if (['preparo', 'servir', 'organizacao', 'outros'].includes(b.category)) out.category = b.category;
      if (['teapot', 'press', 'box', 'jar', 'cup', 'leaf', 'whisk', 'bag', 'gourd', 'ice', 'mortar'].includes(b.icon)) out.icon = b.icon;
      if (typeof b.image === 'string') out.image = /^https:\/\//.test(b.image.trim()) ? b.image.trim().slice(0, 600) : '';
      if (typeof b.active === 'boolean') out.active = b.active;
      if (Number.isFinite(b.order)) out.order = Math.round(b.order);
      for (const f of ['title', 'note']) if (b[f] && typeof b[f] === 'object') out[f] = { pt: String(b[f].pt || '').trim().slice(0, f === 'note' ? 300 : 120), en: String(b[f].en || '').trim().slice(0, f === 'note' ? 300 : 120) };
      return out;
    };
    if (!am[1] && req.method === 'POST') {
      const b = await readJson(req);
      const data = clean(b);
      if (!data.url || !data.title || !data.title.pt) return json(req, res, 400, { error: 'missing' });
      let id = slugify(data.title.pt); while (store.db.affiliates.some(a => a.id === id)) id += '-2';
      const a = Object.assign({ id, store: 'ml', category: 'preparo', icon: 'teapot', active: true, order: store.db.affiliates.length + 1, note: { pt: '', en: '' }, image: '' }, data);
      if (!a.title.en) a.title.en = a.title.pt;
      store.db.affiliates.push(a); store.save();
      return json(req, res, 200, { ok: true, item: a });
    }
    const a = store.db.affiliates.find(x => x.id === am[1]);
    if (!a) return json(req, res, 404, { error: 'not found' });
    if (!am[2] && req.method === 'PUT') { Object.assign(a, clean(await readJson(req))); if (!a.title.en) a.title.en = a.title.pt; store.save(); return json(req, res, 200, { ok: true, item: a }); }
    if (!am[2] && req.method === 'DELETE') { store.db.affiliates = store.db.affiliates.filter(x => x !== a); store.save(); return json(req, res, 200, { ok: true }); }
    if (am[2] && req.method === 'POST') {
      const buf = await readBody(req, 4 * 1024 * 1024);
      const ext = buf.slice(0, 3).toString('hex') === 'ffd8ff' ? 'jpg' : buf.slice(1, 4).toString() === 'PNG' ? 'png' : buf.slice(8, 12).toString() === 'WEBP' ? 'webp' : null;
      if (!ext) return json(req, res, 400, { error: 'notimage' });
      if (a.imageFile) { try { fs.unlinkSync(path.join(store.UPLOAD_DIR, a.imageFile)); } catch (_) {} }
      a.imageFile = `aff-${a.id}-${Date.now().toString(36)}.${ext}`;
      fs.writeFileSync(path.join(store.UPLOAD_DIR, a.imageFile), buf); store.save();
      return json(req, res, 200, { ok: true });
    }
    if (am[2] && req.method === 'DELETE') { if (a.imageFile) { try { fs.unlinkSync(path.join(store.UPLOAD_DIR, a.imageFile)); } catch (_) {} } a.imageFile = ''; store.save(); return json(req, res, 200, { ok: true }); }
  }

  const ex = pathname.match(/^\/api\/admin\/export\/(orders|subscribers|waitlist)\.csv$/);
  if (ex) {
    let csv;
    if (ex[1] === 'orders') csv = toCsv(store.db.orders.map(o => ({ ...o, createdAt: iso(o.createdAt), paidAt: iso(o.paidAt), amount: (o.amount / 100).toFixed(2) })), ['id', 'createdAt', 'status', 'product', 'amount', 'name', 'email', 'lang', 'pdfLang', 'provider', 'refId', 'paidAt', 'downloads']);
    else if (ex[1] === 'subscribers') csv = toCsv(store.db.subscribers.map(s => ({ ...s, createdAt: iso(s.createdAt) })), ['email', 'lang', 'source', 'createdAt']);
    else csv = toCsv(store.db.waitlist.map(s => ({ ...s, createdAt: iso(s.createdAt) })), ['email', 'product', 'lang', 'createdAt']);
    return send(req, res, 200, csv, 'text/csv; charset=utf-8', { 'Content-Disposition': `attachment; filename="botanora-${ex[1]}.csv"`, 'Cache-Control': 'no-store' });
  }

  return json(req, res, 404, { error: 'not found' });
}

// ---------- roteador ----------
const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  const pathname = u.pathname;
  const ip = clientIp(req);
  try {
    if (pathname.startsWith('/api/admin/')) return await apiAdmin(req, res, pathname, ip, u.searchParams);
    if (pathname.startsWith('/api/')) return await apiPublic(req, res, pathname, ip, u.searchParams);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(req, res, 405, 'Method not allowed', 'text/plain');

    if (pathname.startsWith('/assets/') && serveStatic(req, res, pathname)) return;
    if (pathname === '/favicon.ico' || pathname === '/manifest.webmanifest') { if (serveStatic(req, res, pathname)) return; }
    if (pathname === '/receber' || pathname === '/receive') return redirect(res, (pathname === '/receber' ? '/pt/receber' : '/en/receive') + u.search);
    if (pathname === '/robots.txt') return send(req, res, 200, robotsTxt(), 'text/plain; charset=utf-8');
    if (pathname === '/llms.txt') return send(req, res, 200, seo.llmsTxt(false), 'text/plain; charset=utf-8');
    if (pathname === '/llms-full.txt') return send(req, res, 200, seo.llmsTxt(true), 'text/plain; charset=utf-8');
    if (pathname === `/${config.indexNowKey}.txt`) return send(req, res, 200, config.indexNowKey, 'text/plain; charset=utf-8');
    if (pathname.endsWith('.md')) { const md = markdownFor(pathname); if (md) return send(req, res, 200, md, 'text/markdown; charset=utf-8', { 'Cache-Control': 'public, max-age=3600', 'X-Robots-Tag': 'noindex' }); }
    if (pathname === '/sitemap.xml') return send(req, res, 200, sitemap(), 'application/xml; charset=utf-8');
    if (pathname === '/') return redirect(res, '/' + preferredLang(req));

    // Link de afiliado: conta o clique e redireciona
    const rd = pathname.match(/^\/r\/([a-z0-9-]+)$/);
    if (rd) {
      const a = (store.db.affiliates || []).find(x => x.id === rd[1] && x.active);
      if (!a || !AFF_HOST.test(safeHost(a.url))) return send(req, res, 404, 'Link não encontrado', 'text/plain; charset=utf-8');
      analytics.trackEvent(req, ip, 'aff_click', { id: a.id, store: a.store, path: (req.headers.referer ? safePath(req.headers.referer) : '') });
      res.writeHead(302, Object.assign({ Location: a.url, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }, SECURITY_HEADERS));
      return res.end();
    }
    const md = pathname.match(/^\/media\/([a-z0-9-]+\.(?:jpg|png|webp))$/);
    if (md) {
      const f = path.join(store.UPLOAD_DIR, md[1]);
      if (!fs.existsSync(f)) return send(req, res, 404, 'Not found', 'text/plain');
      return send(req, res, 200, fs.readFileSync(f), MIME[path.extname(f)], { 'Cache-Control': 'public, max-age=86400' });
    }

    const dl = pathname.match(/^\/download\/([A-Z0-9]+)$/);
    if (dl) return download(req, res, dl[1], u.searchParams, ip);

    if (pathname === '/admin' || pathname === '/admin/') {
      return send(req, res, 200, adminView.page(auth.isAuthed(req)), undefined, { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    }

    const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch (_) { return s; } });
    if (parts.length && LANGS.includes(parts[0])) {
      if (pathname.length > 3 && pathname.endsWith('/')) return redirect(res, pathname.replace(/\/+$/, '') + u.search, 301);
      return renderPublic(req, res, parts[0], parts.slice(1), ip, u.searchParams);
    }
    return send(req, res, 404, pages.notFound(preferredLang(req)));
  } catch (e) {
    if (e.status) return json(req, res, e.status, { error: e.message });
    console.error(e);
    if (!res.headersSent) send(req, res, 500, 'Erro interno', 'text/plain; charset=utf-8');
  }
});

setTimeout(indexNowPing, 15000);
setInterval(indexNowPing, 6 * 3600 * 1000).unref();

server.listen(config.port, config.host, () => {
  console.log(`\n  Botanora rodando em http://localhost:${config.port}`);
  console.log(`  Painel: http://localhost:${config.port}/admin  (usuário: ${config.adminUser})\n`);
});
