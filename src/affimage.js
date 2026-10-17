'use strict';
// Foto automática das recomendações: abre o anúncio (Mercado Livre ou Amazon),
// acha a imagem principal e guarda uma cópia em data/uploads. Se não der,
// o site mostra o ícone da recomendação.
//
// Segurança: só acessa domínios do Mercado Livre e da Amazon (também em cada
// redirecionamento dos links curtos meli.la / amzn.to), com tempo e tamanho limitados.
const fs = require('fs');
const path = require('path');
const store = require('./store');

const ALLOWED = [
  /(^|\.)mercadolivre\.com\.br$/, /(^|\.)mercadolibre\.com$/, /^meli\.la$/, /(^|\.)mlstatic\.com$/,
  /(^|\.)amazon\.com\.br$/, /(^|\.)amazon\.com$/, /^amzn\.to$/, /^a\.co$/, /(^|\.)media-amazon\.com$/, /(^|\.)ssl-images-amazon\.com$/
];
// Só para testes locais (ex.: AFF_FETCH_EXTRA_HOSTS=127.0.0.1)
const EXTRA = String(process.env.AFF_FETCH_EXTRA_HOSTS || '').split(',').map(s => s.trim()).filter(Boolean);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

function allowed(u) {
  let x; try { x = new URL(u); } catch (_) { return false; }
  if (EXTRA.includes(x.hostname)) return true;
  return x.protocol === 'https:' && ALLOWED.some(r => r.test(x.hostname));
}

// GET com redirecionamentos conferidos um a um, limite de tempo e de tamanho
async function get(url, { max = 2 * 1024 * 1024, accept = 'text/html,*/*' } = {}) {
  let cur = url;
  for (let hop = 0; hop < 7; hop++) {
    if (!allowed(cur)) throw new Error('domínio não permitido: ' + safeHost(cur));
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 12000);
    let res;
    try {
      res = await fetch(cur, { redirect: 'manual', signal: ctl.signal, headers: { 'User-Agent': UA, Accept: accept, 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' } });
    } finally { clearTimeout(timer); }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) { cur = new URL(res.headers.get('location'), cur).href; continue; }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const chunks = []; let size = 0;
    for await (const c of res.body) { size += c.length; if (size > max) throw new Error('arquivo grande demais'); chunks.push(c); }
    return { url: cur, type: res.headers.get('content-type') || '', body: Buffer.concat(chunks) };
  }
  throw new Error('redirecionamentos demais');
}
const safeHost = u => { try { return new URL(u).hostname; } catch (_) { return '?'; } };
const unescape = s => s.replace(/&amp;/g, '&').replace(/&#x2F;/gi, '/').replace(/&#47;/g, '/').replace(/\\u002F/gi, '/').replace(/\\\//g, '/');

// Procura a imagem principal no HTML do anúncio
function findImage(html, base) {
  const meta = name => {
    const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i');
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`, 'i');
    const m = html.match(re1) || html.match(re2);
    return m && m[1];
  };
  const candidates = [
    meta('og:image:secure_url'), meta('og:image'), meta('twitter:image'),
    (html.match(/data-old-hires=["'](https?:[^"']+)["']/i) || [])[1],
    (html.match(/"hiRes"\s*:\s*"(https?:[^"]+)"/) || [])[1],
    (html.match(/id=["']landingImage["'][^>]*src=["'](https?:[^"']+)["']/i) || [])[1],
    (html.match(/<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["']/i) || [])[1]
  ].filter(Boolean).map(unescape);
  for (const c of candidates) {
    try { const u = new URL(c, base).href; if (/^https?:/.test(u) && !/sprite|logo|transparent-pixel|\.gif(\?|$)/i.test(u)) return u; } catch (_) {}
  }
  return null;
}

// Plano B do Mercado Livre: API pública de produto/anúncio pelo código MLB
async function mlApiImage(pageUrl) {
  const s = String(pageUrl);
  const prod = s.match(/\/p\/(MLB\d+)/i), item = s.match(/(MLBU?)-?(\d{6,})/i);
  const tries = [];
  if (prod) tries.push(['https://api.mercadolibre.com/products/' + prod[1].toUpperCase(), j => j.pictures && j.pictures[0] && (j.pictures[0].url || j.pictures[0].secure_url)]);
  if (item && item[1].toUpperCase() === 'MLB') tries.push(['https://api.mercadolibre.com/items/MLB' + item[2], j => j.pictures && j.pictures[0] && (j.pictures[0].secure_url || j.pictures[0].url)]);
  for (const [u, pick] of tries) {
    try { const r = await get(u, { accept: 'application/json' }); const img = pick(JSON.parse(r.body.toString('utf8'))); if (img) return String(img).replace(/^http:/, 'https:'); } catch (_) {}
  }
  return null;
}

function imageExt(buf) {
  if (buf.slice(0, 3).toString('hex') === 'ffd8ff') return 'jpg';
  if (buf.slice(1, 4).toString() === 'PNG') return 'png';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'webp';
  return null;
}

// Busca e guarda a foto de uma recomendação. Nunca lança erro: devolve { ok, error? }.
async function fetchFor(a) {
  const pages = [a.source, a.url].filter(u => u && allowed(u));
  let lastErr = 'sem link do Mercado Livre ou da Amazon';
  for (const page of pages) {
    try {
      const r = await get(page);
      let img = findImage(r.body.toString('utf8'), r.url);
      if (!img && /mercadoli[bv]re|meli\.la/.test(r.url + page)) img = await mlApiImage(r.url) || await mlApiImage(page);
      if (!img) { lastErr = 'foto não encontrada na página'; continue; }
      const pic = await get(img, { max: 5 * 1024 * 1024, accept: 'image/avif,image/webp,image/*' });
      const ext = imageExt(pic.body);
      if (!ext) { lastErr = 'o arquivo não é uma imagem'; continue; }
      const file = `aff-${a.id}-auto-${Date.now().toString(36)}.${ext}`;
      fs.writeFileSync(path.join(store.UPLOAD_DIR, file), pic.body);
      if (a.autoImage && a.autoImage !== file) { try { fs.unlinkSync(path.join(store.UPLOAD_DIR, a.autoImage)); } catch (_) {} }
      Object.assign(a, { autoImage: file, autoImageAt: Date.now(), autoImageErr: '' });
      store.save();
      return { ok: true, file };
    } catch (e) { lastErr = e.name === 'AbortError' ? 'o site demorou demais' : e.message === 'fetch failed' ? 'não consegui acessar o anúncio' : /^HTTP (403|429|503)/.test(e.message) ? 'a loja bloqueou o acesso automático' : e.message; }
  }
  Object.assign(a, { autoImageAt: Date.now(), autoImageErr: lastErr });
  store.save();
  return { ok: false, error: lastErr };
}

// Tenta para todas as recomendações sem foto (no início e uma vez por dia)
async function fillMissing() {
  for (const a of store.db.affiliates) {
    if (a.imageFile || a.image) continue;
    const fresh = a.autoImage && fs.existsSync(path.join(store.UPLOAD_DIR, a.autoImage));
    if (fresh) continue;
    await fetchFor(a);
  }
}

module.exports = { fetchFor, fillMissing, findImage, allowed };
