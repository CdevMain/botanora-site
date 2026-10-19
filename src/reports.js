'use strict';
// Relatórios do painel: fotografia dos números de um período, salva em data/reports
// como uma página HTML pronta para imprimir ou salvar em PDF. Também usado antes de
// "Limpar últimos 30 dias", para nada se perder.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');
const store = require('./store');
const analytics = require('./analytics');

const DIR = path.join(config.dataDir, 'reports');
fs.mkdirSync(DIR, { recursive: true });
const DAY = 86400000;

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = n => new Intl.NumberFormat('pt-BR').format(n || 0);
const brl = c => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((c || 0) / 100);
const pct = x => ((x || 0) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
const dur = ms => { const s = Math.round((ms || 0) / 1000); return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's'; };
const dt = ts => ts ? new Date(ts).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
const d = ts => new Date(ts).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const PRINT_JS = "document.querySelector('.print').addEventListener('click',function(){window.print()})";
const PRINT_HASH = "'sha256-" + crypto.createHash('sha256').update(PRINT_JS).digest('base64') + "'";
const KIND = { geral: 'Visão geral', vendas: 'Vendas', completo: 'Completo' };
const STATUS = { paid: 'Pago', pending: 'Pendente', cancelled: 'Cancelado', refunded: 'Reembolsado' };

function meta() { if (!Array.isArray(store.db.meta.reports)) store.db.meta.reports = []; return store.db.meta.reports; }

const table = (head, rows, empty = 'Sem dados no período.') => rows.length
  ? `<table><thead><tr>${head.map(h => `<th${h.n ? ' class="n"' : ''}>${esc(h.t || h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${head[i].n ? ' class="n"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
  : `<p class="empty">${esc(empty)}</p>`;
const kpis = list => `<div class="kpis">${list.map(([l, v, sub]) => `<div class="kpi"><span>${esc(l)}</span><b>${v}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</div>`).join('')}</div>`;
const vs = (cur, prev, fmt) => prev ? `antes: ${fmt(prev)}` : '';

function overviewHtml(s) {
  const k = s.kpis, e = s.engagement;
  const fun = { visits: 'Visitas', shop: 'Viram a loja', product: 'Viram um guia', checkout: 'Clicaram em comprar', paid: 'Compraram' };
  return `<h2>Tráfego</h2>
${kpis([['Visitantes', nf(k.visitors[0]), vs(...k.visitors, nf)], ['Visualizações', nf(k.pageviews[0]), vs(...k.pageviews, nf)], ['Visitas', nf(k.visits[0])],
    ['Páginas por visita', (k.pagesPerVisit[0] || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })], ['Tempo médio', dur(k.avgEngageMs[0])], ['Rejeição', pct(k.bounceRate[0])]])}
<h2>Funil de compra</h2>
${table(['Etapa', { t: 'Pessoas', n: 1 }, { t: 'Da etapa anterior', n: 1 }], s.funnel.map((f, i) => [esc(fun[f.key] || f.key), nf(f.n), i && s.funnel[i - 1].n ? pct(f.n / s.funnel[i - 1].n) : '-']))}
<div class="cols">
  <div><h2>Páginas mais vistas</h2>${table(['Página', { t: 'Visualizações', n: 1 }], s.topPages.slice(0, 15).map(p => [esc(p.path), nf(p.views)]))}</div>
  <div><h2>Origem das visitas</h2>${table(['Site', { t: 'Visitas', n: 1 }], s.referrers.slice(0, 15).map(r => [esc(r.key), nf(r.n)]), 'Apenas acesso direto no período.')}
  ${s.utm.length ? `<h3>Campanhas (utm_source)</h3>${table(['Campanha', { t: 'Visitas', n: 1 }], s.utm.map(r => [esc(r.key), nf(r.n)]))}` : ''}</div>
</div>
<div class="cols">
  <div><h2>Dispositivos</h2>${table(['Tipo', { t: 'Visualizações', n: 1 }], s.devices.map(r => [esc({ mobile: 'Celular', desktop: 'Computador', tablet: 'Tablet' }[r.key] || r.key), nf(r.n)]))}
  <h3>Versão do site</h3>${table(['Idioma', { t: 'Visualizações', n: 1 }], s.siteLang.map(r => [r.key === 'pt' ? 'Português' : 'English', nf(r.n)]))}</div>
  <div><h2>Engajamento</h2>${table(['Ação', { t: 'Total', n: 1 }], [
    ['Quiz iniciados', nf(e.quizStart)], ['Quiz concluídos', nf(e.quizComplete)], ['Timers iniciados', nf(e.timerStart)], ['Timers concluídos', nf(e.timerDone)],
    ['Prévias abertas', nf(e.previewOpen)], ['Downloads de PDF', nf(e.downloads)], ['Cliques em recomendações', nf(e.affClicks)],
    ['Novos na newsletter', nf(e.newsletter)], ['Novos em listas de espera', nf(e.waitlist)]])}</div>
</div>`;
}

function salesHtml(s, from, to) {
  const k = s.kpis;
  const orders = store.db.orders.filter(o => !o.test && o.createdAt >= from && o.createdAt <= to).sort((a, b) => b.createdAt - a.createdAt);
  return `<h2>Vendas</h2>
${kpis([['Receita', brl(k.revenue[0]), vs(...k.revenue, brl)], ['Vendas pagas', nf(k.paidOrders[0]), vs(...k.paidOrders, nf)], ['Ticket médio', brl(k.aov[0])],
    ['Conversão', pct(k.conversion[0]), 'vendas ÷ visitas'], ['Pedidos no período', nf(orders.length)], ['Receita total desde o início', brl(s.totals.revenue)]])}
<h2>Por guia</h2>
${table(['Guia', { t: 'Visualizações', n: 1 }, { t: 'Cliques em comprar', n: 1 }, { t: 'Vendas', n: 1 }, { t: 'Receita', n: 1 }, { t: 'Lista de espera', n: 1 }],
    s.products.slice().sort((a, b) => b.revenue - a.revenue || b.views - a.views).map(p => [esc(p.title), nf(p.views), nf(p.checkouts), nf(p.paid), brl(p.revenue), nf(p.waitlist)]))}
<h2>Pedidos (${nf(orders.length)})</h2>
${table(['Data', 'Pedido', 'Cliente', 'Guia', 'Status', { t: 'Valor', n: 1 }],
    orders.map(o => [dt(o.createdAt), `<code>${esc(o.id)}</code>${o.refId ? `<br><small>Cakto ${esc(o.refId)}</small>` : ''}`, `${esc(o.name)}<br><small>${esc(o.email)}</small>`, esc(o.title), esc(STATUS[o.status] || o.status) + (o.archived ? ' <small>(arquivado)</small>' : ''), brl(o.amount)]),
    'Nenhum pedido no período.')}`;
}

function page(title, sub, body) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)}</title>
<style>
:root { --ink: #16212a; --muted: #6f7a82; --line: #e4ddcf; --gold: #b8932f; --paper: #f7f3ea; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 14px/1.5 -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; }
.doc { max-width: 980px; margin: 0 auto; padding: 40px 28px 60px; background: #fff; min-height: 100vh; }
header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; border-bottom: 2px solid var(--ink); padding-bottom: 16px; margin-bottom: 8px; }
.brand { letter-spacing: .35em; font-size: 12px; color: var(--gold); margin: 0 0 6px; }
h1 { font: 500 28px/1.15 Georgia, 'Times New Roman', serif; margin: 0; }
.sub { color: var(--muted); margin: 6px 0 0; }
.print { border: 1px solid var(--ink); background: var(--ink); color: #fff; padding: 10px 16px; font: inherit; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; cursor: pointer; }
h2 { font: 500 20px Georgia, serif; margin: 30px 0 10px; }
h3 { font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin: 18px 0 8px; }
.kpis { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--line); }
.kpi { padding: 14px 16px; border-right: 1px solid var(--line); border-bottom: 1px solid var(--line); display: grid; gap: 2px; }
.kpi span { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
.kpi b { font: 500 24px Georgia, serif; }
.kpi small { color: var(--muted); font-size: 12px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { text-align: left; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); font-weight: 500; border-bottom: 1px solid var(--ink); padding: 6px 8px; }
td { border-bottom: 1px solid var(--line); padding: 7px 8px; vertical-align: top; }
.n { text-align: right; white-space: nowrap; }
td small { color: var(--muted); }
code { font-size: 12px; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.empty { color: var(--muted); border: 1px dashed var(--line); padding: 12px; margin: 0; }
footer { margin-top: 40px; color: var(--muted); font-size: 12px; border-top: 1px solid var(--line); padding-top: 12px; }
@media (max-width: 700px) { .kpis { grid-template-columns: 1fr 1fr; } .cols { grid-template-columns: 1fr; } header { flex-direction: column; align-items: flex-start; } }
@media print { body { background: #fff; } .doc { padding: 0; } .print { display: none; } h2 { break-after: avoid; } tr { break-inside: avoid; } }
</style></head><body><div class="doc">
<header><div><p class="brand">BOTÂNORA · RELATÓRIO</p><h1>${esc(title)}</h1><p class="sub">${esc(sub)}</p></div><button class="print" type="button">Imprimir / salvar PDF</button></header>
${body}
<footer>Gerado em ${dt(Date.now())} pelo painel da Botânora. Compras de teste e pedidos arquivados não entram nos números.</footer>
</div><script>${PRINT_JS}</script></body></html>`;
}

// Gera e salva. kind: 'geral' | 'vendas' | 'completo'
function create(kind, days = 30, reason = 'manual') {
  if (!KIND[kind]) kind = 'completo';
  days = Math.max(1, Math.min(365, Number(days) || 30));
  const s = analytics.stats(days);
  const from = new Date(s.range.from).getTime(), to = Date.now();
  const label = days === 1 ? 'Hoje' : days === 365 ? 'Últimos 12 meses' : `Últimos ${days} dias`;
  const title = `${KIND[kind]} · ${label}`;
  const sub = `${d(from)} a ${d(to)}${reason === 'clear' ? ' · salvo automaticamente antes de limpar os dados' : ''}`;
  const body = (kind !== 'vendas' ? overviewHtml(s) : '') + (kind !== 'geral' ? salesHtml(s, from, to) : '');
  const id = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(to)) + '-' + kind + '-' + crypto.randomBytes(3).toString('hex');
  fs.writeFileSync(path.join(DIR, id + '.html'), page(title, sub, body));
  const r = { id, kind, days, from, to, createdAt: to, reason, title, summary: { visitors: s.kpis.visitors[0], pageviews: s.kpis.pageviews[0], paid: s.kpis.paidOrders[0], revenue: s.kpis.revenue[0] } };
  meta().unshift(r);
  if (meta().length > 300) for (const old of meta().splice(300)) { try { fs.unlinkSync(path.join(DIR, old.id + '.html')); } catch (_) {} }
  store.save();
  return r;
}
const list = () => meta();
function file(id) {
  if (!/^[0-9a-z-]+$/.test(id) || !meta().some(r => r.id === id)) return null;
  const f = path.join(DIR, id + '.html');
  return fs.existsSync(f) ? f : null;
}
function remove(id) {
  const i = meta().findIndex(r => r.id === id);
  if (i < 0) return false;
  try { fs.unlinkSync(path.join(DIR, id + '.html')); } catch (_) {}
  meta().splice(i, 1); store.save();
  return true;
}

// Limpar os últimos N dias: salva um relatório completo antes e depois
// apaga visitas/eventos (what.events) e/ou arquiva pedidos (what.sales).
// Pedidos arquivados saem dos números e da lista, mas o cliente continua com acesso aos guias.
function clear({ events = false, sales = false, days = 30 } = {}) {
  const report = create('completo', days, 'clear');
  const cutoff = Date.now() - days * DAY;
  let removed = 0, archived = 0;
  if (events) removed = store.purgeEventsSince(cutoff);
  if (sales) for (const o of store.db.orders) if (o.createdAt >= cutoff && !o.archived) { o.archived = true; o.archivedAt = Date.now(); archived++; }
  store.save();
  return { report, removed, archived };
}

module.exports = { create, list, file, remove, clear, PRINT_HASH };
