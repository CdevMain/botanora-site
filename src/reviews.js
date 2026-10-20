'use strict';
// Avaliações de quem comprou.
// - Só quem tem compra paga do guia avalia (pela biblioteca, com a sessão do aparelho).
// - Uma avaliação por e-mail e guia. Depois de enviada, pode ser editada MAX_EDITS vezes.
//   Corrigir uma avaliação recusada não gasta edição (o e-mail de recusa convida a corrigir).
// - Tudo passa pela aprovação no painel antes de aparecer no site. Editar volta para "em análise".
// - "Útil" (UP): qualquer visitante, um voto por aparelho/rede, guardado como hash.
const crypto = require('crypto');
const config = require('./config');
const store = require('./store');

const MAX_EDITS = 2;
const LIMITS = { name: [2, 40], text: [20, 1200], reason: 400 };

function list() {
  if (!Array.isArray(store.db.reviews)) store.db.reviews = [];
  return store.db.reviews;
}
const byId = id => list().find(r => r.id === id);
const clean = (s, max) => String(s || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);

// Compra paga deste guia (a mais antiga), ou null
function purchaseOf(email, slug) {
  const os = store.paidOrdersFor(email).filter(o => o.product === slug).sort((a, b) => (a.paidAt || 0) - (b.paidAt || 0));
  return os[0] || null;
}
const mine = (email, slug) => list().find(r => r.email === String(email).toLowerCase() && r.product === slug) || null;
const editsLeft = r => Math.max(0, MAX_EDITS - (r.edits || 0));

// Nome sugerido: primeiro nome + inicial do sobrenome ("Mariana C.")
function suggestName(order) {
  const parts = String((order && order.name) || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

function validate(b) {
  const rating = Number(b.rating);
  const name = clean(b.name, LIMITS.name[1]);
  const text = clean(b.text, LIMITS.text[1]);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'rating' };
  if (name.length < LIMITS.name[0]) return { error: 'name' };
  if (text.length < LIMITS.text[0]) return { error: 'text' };
  return { rating, name, text };
}

// Cria ou edita. Retorna { review, created } ou { error }
function submit(email, slug, body, lang) {
  email = String(email).toLowerCase();
  const order = purchaseOf(email, slug);
  if (!order) return { error: 'not_buyer' };
  const v = validate(body);
  if (v.error) return v;
  const now = Date.now();
  let r = mine(email, slug);
  if (!r) {
    r = { id: crypto.randomBytes(6).toString('hex'), email, product: slug, orderId: order.id, test: !!order.test, lang: lang === 'en' ? 'en' : 'pt',
      rating: v.rating, name: v.name, text: v.text, status: 'pending', edits: 0, voters: [], ups: 0, createdAt: now, updatedAt: now, history: [] };
    list().unshift(r);
    store.save();
    return { review: r, created: true };
  }
  if (r.rating === v.rating && r.name === v.name && r.text === v.text && r.status !== 'rejected') return { error: 'same' };
  const free = r.status === 'rejected';
  if (!free && editsLeft(r) <= 0) return { error: 'limit' };
  r.history = [...(r.history || []), { at: now, rating: r.rating, name: r.name, text: r.text, status: r.status }].slice(-6);
  Object.assign(r, { rating: v.rating, name: v.name, text: v.text, status: 'pending', updatedAt: now, edited: free ? !!r.edited : true, rejectReason: '', lang: lang === 'en' ? 'en' : r.lang });
  if (!free) r.edits = (r.edits || 0) + 1;
  store.save();
  return { review: r, created: false, free };
}

function approve(id) {
  const r = byId(id); if (!r) return null;
  Object.assign(r, { status: 'approved', approvedAt: Date.now(), rejectReason: '' });
  store.save(); return r;
}
function reject(id, reason) {
  const r = byId(id); if (!r) return null;
  Object.assign(r, { status: 'rejected', rejectedAt: Date.now(), rejectReason: clean(reason, LIMITS.reason) });
  store.save(); return r;
}
function resetEdits(id) {
  const r = byId(id); if (!r) return null;
  r.edits = 0; store.save(); return r;
}
function remove(id) {
  const i = list().findIndex(r => r.id === id); if (i < 0) return false;
  list().splice(i, 1); store.save(); return true;
}

// Voto "útil": liga/desliga por chave do visitante (hash, nunca o IP em si)
function voterKey(ip, ua) {
  return crypto.createHash('sha256').update(`${config.sessionSecret || 'botanora'}|up|${ip}|${String(ua || '').slice(0, 200)}`).digest('base64url').slice(0, 22);
}
function up(id, key) {
  const r = byId(id);
  if (!r || r.status !== 'approved' || r.test) return null;
  r.voters = Array.isArray(r.voters) ? r.voters : [];
  const i = r.voters.indexOf(key);
  if (i >= 0) r.voters.splice(i, 1); else r.voters.push(key);
  if (r.voters.length > 5000) r.voters = r.voters.slice(-5000);
  r.ups = r.voters.length;
  store.save();
  return { ups: r.ups, on: i < 0 };
}

// Públicas: aprovadas, sem compras de teste; mais úteis primeiro
function publicFor(slug) {
  // só de quem ainda tem a compra paga (reembolso tira a avaliação do ar)
  return list().filter(r => r.product === slug && r.status === 'approved' && !r.test && purchaseOf(r.email, slug))
    .sort((a, b) => (b.ups || 0) - (a.ups || 0) || (b.approvedAt || 0) - (a.approvedAt || 0));
}
function summary(slug) {
  const l = publicFor(slug);
  return { count: l.length, avg: l.length ? Math.round(l.reduce((s, r) => s + r.rating, 0) / l.length * 10) / 10 : 0 };
}
const pendingCount = () => list().filter(r => r.status === 'pending').length;

module.exports = { MAX_EDITS, LIMITS, list, byId, mine, editsLeft, purchaseOf, suggestName, submit, approve, reject, resetEdits, remove, voterKey, up, publicFor, summary, pendingCount };
