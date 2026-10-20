'use strict';
const crypto = require('crypto');
const config = require('./config');

const sessions = new Map(); // token -> { exp, uid }
const attempts = new Map(); // ip -> { n, until }
const TTL = 12 * 3600 * 1000;
const COOKIE = 'btn_admin';

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function blocked(ip) {
  const a = attempts.get(ip);
  return a && a.until > Date.now();
}

function login(ip, user, pass) {
  if (blocked(ip)) return { error: 'locked' };
  const u = require('./team').verify(user, pass);
  if (!u) {
    const a = attempts.get(ip) || { n: 0, until: 0 };
    a.n++;
    if (a.n >= 5) { a.until = Date.now() + 15 * 60000; a.n = 0; }
    attempts.set(ip, a);
    return { error: 'invalid' };
  }
  attempts.delete(ip);
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { exp: Date.now() + TTL, uid: u.id });
  return { token, user: u };
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(c => {
    const i = c.indexOf('=');
    if (i > 0) out[c.slice(0, i).trim()] = decodeURIComponent(c.slice(i + 1).trim());
  });
  return out;
}

// Usuário logado (com permissões atualizadas) ou null
function currentUser(req) {
  const t = parseCookies(req)[COOKIE];
  if (!t) return null;
  const s = sessions.get(t);
  if (!s || s.exp < Date.now()) { sessions.delete(t); return null; }
  const u = require('./team').current(s.uid);
  if (!u) { sessions.delete(t); return null; }
  return u;
}
const isAuthed = req => !!currentUser(req);
// Encerra as sessões de um usuário (ao desativar ou trocar a senha)
function endUser(uid) { for (const [t, s] of sessions) if (s.uid === uid) sessions.delete(t); }

function logout(req) { sessions.delete(parseCookies(req)[COOKIE]); }

function cookieHeader(token, secure) {
  const base = `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict${secure ? '; Secure' : ''}`;
  return token ? `${base}; Max-Age=${TTL / 1000}` : `${base}; Max-Age=0`;
}

module.exports = { login, logout, isAuthed, currentUser, endUser, cookieHeader, parseCookies, safeEqual };
