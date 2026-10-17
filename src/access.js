'use strict';
// Acesso à biblioteca do cliente, sem senha e sem link aberto.
//
// 1. Link de entrada (por e-mail): aleatório, de uso único e com validade curta.
//    Guardamos só o hash. Depois de usado, não abre mais nada, então repassar
//    o e-mail ou o link não dá acesso a outra pessoa.
// 2. Sessão do aparelho: ao confirmar o link (ou e-mail + código do pedido),
//    o aparelho recebe um cookie HttpOnly que dura ACCESS_DAYS. Para entrar em
//    outro aparelho, a pessoa pede um link novo, que chega no e-mail da compra.
// 3. Limite de aparelhos por e-mail (MAX_DEVICES): o mais antigo sai quando
//    um novo entra.
const crypto = require('crypto');
const config = require('./config');
const store = require('./store');

const COOKIE = 'btn_lib';
const HOUR = 3600 * 1000;
const hash = t => crypto.createHash('sha256').update('lib|' + String(t)).digest('base64url');
const newToken = () => crypto.randomBytes(24).toString('base64url');

function box() {
  const db = store.db;
  if (!db.access || typeof db.access !== 'object') db.access = {};
  if (!db.access.links) db.access.links = {};
  if (!db.access.sessions) db.access.sessions = {};
  return db.access;
}

function prune() {
  const a = box(), now = Date.now();
  let changed = false;
  for (const [k, l] of Object.entries(a.links)) if (l.x < now - 7 * 24 * HOUR) { delete a.links[k]; changed = true; }
  for (const [k, s] of Object.entries(a.sessions)) if (s.x < now) { delete a.sessions[k]; changed = true; }
  if (changed) store.save();
}
prune();
setInterval(prune, 6 * HOUR).unref();

// ---------- links de entrada ----------
function issueLink(email, hours = 24) {
  const t = newToken();
  box().links[hash(t)] = { e: String(email).toLowerCase(), x: Date.now() + hours * HOUR, u: 0 };
  store.save();
  return t;
}
// Só olha (para a página de confirmação), sem gastar o link
function peekLink(t) {
  const l = typeof t === 'string' && t.length < 100 ? box().links[hash(t)] : null;
  if (!l) return { state: 'invalid' };
  if (l.u) return { state: 'used', email: l.e };
  if (l.x < Date.now()) return { state: 'expired', email: l.e };
  return { state: 'ok', email: l.e };
}
function consumeLink(t) {
  const p = peekLink(t);
  if (p.state !== 'ok') return null;
  box().links[hash(t)].u = Date.now();
  store.save();
  return p.email;
}

// ---------- sessões por aparelho ----------
function deviceLabel(ua = '') {
  const os = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'Outro';
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
  return br ? `${br} · ${os}` : os;
}
function createSession(email, req) {
  const a = box(), now = Date.now();
  email = String(email).toLowerCase();
  const mine = Object.entries(a.sessions).filter(([, s]) => s.e === email).sort((x, y) => x[1].s - y[1].s);
  while (mine.length >= config.maxDevices) delete a.sessions[mine.shift()[0]];
  const t = newToken();
  a.sessions[hash(t)] = { e: email, c: now, s: now, x: now + config.accessDays * 24 * HOUR, d: deviceLabel(req.headers['user-agent']) };
  store.save();
  return t;
}
function parseCookie(req, name) {
  for (const c of (req.headers.cookie || '').split(';')) {
    const i = c.indexOf('=');
    if (i > 0 && c.slice(0, i).trim() === name) return decodeURIComponent(c.slice(i + 1).trim());
  }
  return '';
}
function sessionEmail(req) {
  const t = parseCookie(req, COOKIE);
  if (!t || t.length > 100) return null;
  const s = box().sessions[hash(t)];
  if (!s || s.x < Date.now()) return null;
  if (Date.now() - s.s > HOUR) { s.s = Date.now(); store.save(); }
  return s.e;
}
function endSession(req) {
  const t = parseCookie(req, COOKIE);
  if (t && box().sessions[hash(t)]) { delete box().sessions[hash(t)]; store.save(); }
}
function endAllSessions(email) {
  const a = box(); let n = 0;
  for (const [k, s] of Object.entries(a.sessions)) if (s.e === String(email).toLowerCase()) { delete a.sessions[k]; n++; }
  if (n) store.save();
  return n;
}
function devicesFor(email) {
  return Object.values(box().sessions).filter(s => s.e === String(email).toLowerCase() && s.x > Date.now()).length;
}
function cookieHeader(token) {
  const secure = config.siteUrl.startsWith('https') ? '; Secure' : '';
  const base = `${COOKIE}=${token || ''}; Path=/; HttpOnly; SameSite=Lax${secure}`;
  return token ? `${base}; Max-Age=${config.accessDays * 86400}` : `${base}; Max-Age=0`;
}

module.exports = { issueLink, peekLink, consumeLink, createSession, sessionEmail, endSession, endAllSessions, devicesFor, cookieHeader };
