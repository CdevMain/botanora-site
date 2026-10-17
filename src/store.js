'use strict';
// Armazenamento em arquivo: db.json (produtos, pedidos, inscritos) e
// events.ndjson (analytics, somente acréscimo). Sem dependências.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const { seedProducts } = require('./content/products');
const { seedAffiliates } = require('./content/affiliates');

const DB_FILE = path.join(config.dataDir, 'db.json');
const EVENTS_FILE = path.join(config.dataDir, 'events.ndjson');
const PDF_DIR = path.join(config.dataDir, 'pdfs');
const LANGS = ['pt', 'en'];

fs.mkdirSync(PDF_DIR, { recursive: true });

let db = { products: [], orders: [], subscribers: [], waitlist: [], affiliates: [], meta: {} };
if (fs.existsSync(DB_FILE)) {
  try { db = Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))); }
  catch (e) { console.error('db.json inválido, abortando para não sobrescrever:', e.message); process.exit(1); }
}

// Semeia produtos novos sem sobrescrever edições feitas no admin
for (const p of seedProducts) {
  if (!db.products.find(x => x.slug === p.slug)) db.products.push(JSON.parse(JSON.stringify(p)));
}
// Migração: um arquivo por idioma e lista de IDs da Cakto
for (const p of db.products) {
  if (!p.files) p.files = {};
  if (p.file) { if (!p.files.pt) p.files.pt = p.file; delete p.file; }
  if (typeof p.cover === 'string') delete p.cover;
  if (!Array.isArray(p.cakto)) p.cakto = [];
}
for (const o of db.orders) { if (!o.pdfLang) o.pdfLang = o.lang || 'pt'; if (o.email) o.email = o.email.toLowerCase(); }
db.products.sort((a, b) => a.order - b.order);
if (!Array.isArray(db.affiliates)) db.affiliates = [];
// Atualiza textos antigos (com travessão) para a versão atual do catálogo
const DASH = /\u2014/;
function refreshText(item, seed, fields) {
  if (!seed) return;
  for (const f of fields) if (item[f] && DASH.test(JSON.stringify(item[f]))) item[f] = JSON.parse(JSON.stringify(seed[f]));
}
for (const p of db.products) refreshText(p, seedProducts.find(x => x.slug === p.slug), ['title', 'subtitle', 'description', 'highlights']);
for (const a of db.affiliates) refreshText(a, seedAffiliates.find(x => x.id === a.id), ['title', 'note']);
if (!db.meta.affSeeded) { db.affiliates.push(...JSON.parse(JSON.stringify(seedAffiliates))); db.meta.affSeeded = true; }
const UPLOAD_DIR = path.join(config.dataDir, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Copia os PDFs iniciais de seed/ (ex.: infusoes-autorais-pt.pdf)
const seedPdfDir = path.join(config.root, 'seed');
const GUIDES_V = 8;
if (fs.existsSync(seedPdfDir)) {
  for (const f of fs.readdirSync(seedPdfDir)) {
    const dest = path.join(PDF_DIR, f);
    if (f.endsWith('.pdf') && (!fs.existsSync(dest) || (db.meta.guidesV || 0) < GUIDES_V)) fs.copyFileSync(path.join(seedPdfDir, f), dest);
  }
}
// Coleção completa (v2): os 10 guias em PT e EN. Roda uma vez: liga os arquivos,
// publica os guias que estavam "em breve" e atualiza páginas e textos do catálogo.
if ((db.meta.guidesV || 0) < GUIDES_V) {
  for (const p of db.products) {
    const s = seedProducts.find(x => x.slug === p.slug);
    if (!s || !s.files) continue;
    for (const l of LANGS) if (s.files[l] && fs.existsSync(path.join(PDF_DIR, s.files[l]))) p.files[l] = s.files[l];
    if (p.status === 'coming_soon') p.status = 'available';
    p.pages = s.pages;
    for (const f of ['title', 'subtitle', 'description', 'highlights', 'lang']) p[f] = JSON.parse(JSON.stringify(s[f]));
  }
  db.meta.guidesV = GUIDES_V;
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 150);
}
function flush() {
  clearTimeout(saveTimer);
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
  fs.renameSync(tmp, DB_FILE);
}
save();

// ---------- eventos ----------
const events = [];
if (fs.existsSync(EVENTS_FILE)) {
  const lines = fs.readFileSync(EVENTS_FILE, 'utf8').split('\n');
  for (const l of lines) { if (l) { try { events.push(JSON.parse(l)); } catch (_) { /* linha corrompida */ } } }
}
const eventStream = fs.createWriteStream(EVENTS_FILE, { flags: 'a' });
function addEvent(ev) {
  events.push(ev);
  eventStream.write(JSON.stringify(ev) + '\n');
}

// ---------- helpers ----------
const id = (n = 8) => crypto.randomBytes(n).toString('hex');
const now = () => Date.now();
const newOrderId = () => 'BTN' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString('hex').toUpperCase();

function getProduct(slug) { return db.products.find(p => p.slug === slug); }

function pdfPath(file) {
  const safe = path.basename(file || '');
  return safe ? path.join(PDF_DIR, safe) : null;
}

// Idiomas com PDF enviado para o guia
function fileLangs(p) {
  return LANGS.filter(l => p.files && p.files[l] && fs.existsSync(pdfPath(p.files[l])));
}
function hasFile(p) { return fileLangs(p).length > 0; }
// Melhor arquivo para o idioma pedido (cai para o outro se não houver)
function resolveFile(p, lang) {
  const langs = fileLangs(p);
  const use = langs.includes(lang) ? lang : langs[0];
  return use ? { lang: use, path: pdfPath(p.files[use]) } : null;
}

function createOrder({ product, name, email, lang, pdfLang }) {
  const order = {
    id: newOrderId(),
    token: id(16),
    product: product.slug,
    title: product.title.pt,
    amount: product.price,
    name, email: email.toLowerCase(), lang,
    pdfLang: LANGS.includes(pdfLang) ? pdfLang : lang,
    status: 'pending',
    provider: config.mercadoPago.accessToken ? 'mercadopago' : 'pix',
    downloads: 0,
    createdAt: now(),
    paidAt: null
  };
  db.orders.push(order);
  save();
  return order;
}

// Pedido vindo de plataforma externa (Cakto), já pago
function createExternalOrder({ product, name, email, amount, pdfLang, provider, externalId, refId, method }) {
  const dup = db.orders.find(o => o.provider === provider && o.externalId === externalId && o.product === product.slug);
  if (dup) return { order: dup, created: false };
  const order = {
    id: newOrderId(), token: id(16), product: product.slug, title: product.title.pt,
    amount, name: name || '', email: email.toLowerCase(), lang: pdfLang, pdfLang,
    status: 'pending', provider, externalId, refId: refId || '', method: method || '',
    downloads: 0, createdAt: now(), paidAt: null
  };
  db.orders.push(order);
  markPaid(order);
  return { order, created: true };
}

function findOrder(orderId) { return db.orders.find(o => o.id === orderId); }

function markPaid(order, meta = {}) {
  if (order.status === 'paid') return order;
  order.status = 'paid';
  order.paidAt = now();
  Object.assign(order, meta);
  save();
  addEvent({ t: now(), type: 'purchase', product: order.product, amount: order.amount, order: order.id });
  return order;
}

function paidOrdersFor(email) {
  const e = String(email || '').toLowerCase();
  return db.orders.filter(o => o.email === e && o.status === 'paid');
}

function addSubscriber(email, lang, source) {
  const e = email.toLowerCase();
  if (db.subscribers.find(s => s.email === e)) return false;
  db.subscribers.push({ email: e, lang, source, createdAt: now() });
  save();
  return true;
}

function addWaitlist(email, product, lang) {
  const e = email.toLowerCase();
  if (db.waitlist.find(w => w.email === e && w.product === product)) return false;
  db.waitlist.push({ email: e, product, lang, createdAt: now() });
  save();
  return true;
}

process.on('SIGINT', () => { flush(); process.exit(0); });
process.on('SIGTERM', () => { flush(); process.exit(0); });

module.exports = {
  db, events, addEvent, save, flush, getProduct, createOrder, createExternalOrder, findOrder, markPaid,
  paidOrdersFor, addSubscriber, addWaitlist, pdfPath, fileLangs, hasFile, resolveFile, PDF_DIR, UPLOAD_DIR, LANGS
};
