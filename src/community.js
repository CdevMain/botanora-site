'use strict';
// Comunidade: perguntas e respostas (estilo Quora), com moderação.
//
// - Qualquer pessoa pergunta, com nome e e-mail obrigatórios. A pergunta só aparece depois de aprovada.
// - Recusada: a pessoa recebe o motivo e um link de edição (vale 14 dias, uso livre até reenviar).
// - Respondem: compradores (com a sessão da biblioteca, selo "Comprou um guia"; passam por aprovação)
//   e o dono do site pelo painel (foto + selo da Botânora; publicada na hora).
// - "Útil" nas respostas e "Também quero saber" nas perguntas: um voto por visitante (hash).
// - E-mail nunca aparece no site.
const crypto = require('crypto');
const config = require('./config');
const store = require('./store');

const LIMITS = { name: [2, 40], q: [15, 800], a: [10, 2000], reason: 400 };
const EDIT_DAYS = 14;

function box() { if (!Array.isArray(store.db.questions)) store.db.questions = []; return store.db.questions; }
const clean = (s, max) => String(s || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
const newId = () => crypto.randomBytes(5).toString('hex');
const hash = t => crypto.createHash('sha256').update('qa|' + t).digest('base64url');
const slugify = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

const byId = id => box().find(q => q.id === id);
const pathOf = q => `${q.id}-${slugify(q.text.split('\n')[0].slice(0, 80)) || 'pergunta'}`;

function ask({ name, email, text, product, lang }) {
  name = clean(name, LIMITS.name[1]); email = String(email || '').trim().toLowerCase(); text = clean(text, LIMITS.q[1]);
  if (name.length < LIMITS.name[0]) return { error: 'name' };
  if (!EMAIL_RE.test(email)) return { error: 'email' };
  if (text.length < LIMITS.q[0]) return { error: 'text' };
  if (box().some(q => q.email === email && q.text === text)) return { error: 'dup' };
  const p = product && store.getProduct(product) ? product : '';
  const q = { id: newId(), name, email, text, product: p, lang: lang === 'en' ? 'en' : 'pt', status: 'pending', createdAt: Date.now(), updatedAt: Date.now(), answers: [], voters: [], ups: 0, buyer: store.paidOrdersFor(email).length > 0 };
  box().unshift(q); store.save();
  return { question: q };
}

// Link de edição (enviado no e-mail de recusa)
function issueEdit(q) { const t = crypto.randomBytes(18).toString('base64url'); q.edit = { h: hash(t), x: Date.now() + EDIT_DAYS * 864e5 }; store.save(); return t; }
function byEditToken(t) {
  if (typeof t !== 'string' || t.length > 60) return null;
  const h = hash(t);
  return box().find(q => q.edit && q.edit.h === h && q.edit.x > Date.now()) || null;
}
function editByToken(t, { name, text, product }) {
  const q = byEditToken(t); if (!q) return { error: 'expired' };
  const n = clean(name, LIMITS.name[1]), tx = clean(text, LIMITS.q[1]);
  if (n.length < LIMITS.name[0]) return { error: 'name' };
  if (tx.length < LIMITS.q[0]) return { error: 'text' };
  q.history = [...(q.history || []), { at: Date.now(), text: q.text, status: q.status }].slice(-6);
  Object.assign(q, { name: n, text: tx, status: 'pending', rejectReason: '', updatedAt: Date.now(), edited: true });
  if (product !== undefined) q.product = product && store.getProduct(product) ? product : '';
  delete q.edit; store.save();
  return { question: q };
}

function approve(id) { const q = byId(id); if (!q) return null; Object.assign(q, { status: 'approved', approvedAt: q.approvedAt || Date.now(), rejectReason: '' }); delete q.edit; store.save(); return q; }
function reject(id, reason) { const q = byId(id); if (!q) return null; Object.assign(q, { status: 'rejected', rejectReason: clean(reason, LIMITS.reason), rejectedAt: Date.now() }); store.save(); return q; }
function remove(id) { const i = box().findIndex(q => q.id === id); if (i < 0) return false; box().splice(i, 1); store.save(); return true; }

// Resposta do comprador (sessão da biblioteca) ou do dono (painel)
function answer(qid, { by, email, name, text }) {
  const q = byId(qid); if (!q || q.status !== 'approved') return { error: 'question' };
  text = clean(text, LIMITS.a[1]);
  if (text.length < LIMITS.a[0]) return { error: 'text' };
  if (by === 'buyer') {
    name = clean(name, LIMITS.name[1]);
    if (name.length < LIMITS.name[0]) return { error: 'name' };
    if (!store.paidOrdersFor(email).length) return { error: 'not_buyer' };
    if (q.answers.some(a => a.by === 'buyer' && a.email === String(email).toLowerCase() && a.status !== 'rejected')) return { error: 'already' };
  }
  const a = { id: newId(), by, email: by === 'buyer' ? String(email).toLowerCase() : '', name: by === 'owner' ? '' : name, text, status: by === 'owner' ? 'approved' : 'pending', createdAt: Date.now(), approvedAt: by === 'owner' ? Date.now() : null, voters: [], ups: 0, author: by === 'owner' ? String(email || '') : '' };
  q.answers.push(a); q.updatedAt = Date.now(); store.save();
  return { answer: a, question: q };
}
function findAnswer(qid, aid) { const q = byId(qid); const a = q && q.answers.find(x => x.id === aid); return a ? { q, a } : null; }
function moderateAnswer(qid, aid, ok, reason) {
  const f = findAnswer(qid, aid); if (!f) return null;
  Object.assign(f.a, ok ? { status: 'approved', approvedAt: Date.now(), rejectReason: '' } : { status: 'rejected', rejectReason: clean(reason, LIMITS.reason) });
  store.save(); return f;
}
function removeAnswer(qid, aid) { const q = byId(qid); if (!q) return false; const i = q.answers.findIndex(a => a.id === aid); if (i < 0) return false; q.answers.splice(i, 1); store.save(); return true; }

function voterKey(ip, ua) { return crypto.createHash('sha256').update(`${config.sessionSecret || 'botanora'}|qa|${ip}|${String(ua || '').slice(0, 200)}`).digest('base64url').slice(0, 22); }
function up(qid, aid, key) {
  const q = byId(qid); if (!q || q.status !== 'approved') return null;
  const t = aid ? q.answers.find(a => a.id === aid && a.status === 'approved') : q;
  if (!t) return null;
  t.voters = Array.isArray(t.voters) ? t.voters : [];
  const i = t.voters.indexOf(key);
  if (i >= 0) t.voters.splice(i, 1); else t.voters.push(key);
  if (t.voters.length > 5000) t.voters = t.voters.slice(-5000);
  t.ups = t.voters.length; store.save();
  return { ups: t.ups, on: i < 0 };
}

// Públicas
const approvedAnswers = q => q.answers.filter(a => a.status === 'approved').sort((a, b) => (b.by === 'owner') - (a.by === 'owner') || (b.ups || 0) - (a.ups || 0) || a.createdAt - b.createdAt);
function publicList({ product = '', sort = 'recent' } = {}) {
  return box().filter(q => q.status === 'approved' && (!product || q.product === product))
    .sort((a, b) => sort === 'top' ? (b.ups || 0) - (a.ups || 0) || b.approvedAt - a.approvedAt : (b.approvedAt || 0) - (a.approvedAt || 0));
}
const publicById = id => { const q = byId(id); return q && q.status === 'approved' ? q : null; };
const pendingCount = () => box().filter(q => q.status === 'pending').length + box().reduce((s, q) => s + q.answers.filter(a => a.status === 'pending').length, 0);

module.exports = { LIMITS, ask, issueEdit, byEditToken, editByToken, approve, reject, remove, answer, moderateAnswer, removeAnswer, findAnswer, voterKey, up, publicList, publicById, approvedAnswers, pathOf, byId, list: box, pendingCount, slugify };
