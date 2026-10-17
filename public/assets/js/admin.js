/* Botânora: painel administrativo */
(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('pt-BR');
  const brl = c => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((c || 0) / 100);
  const pct = x => (x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
  const dur = ms => { const s = Math.round(ms / 1000); return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's'; };
  const dt = ts => ts ? new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

  // ---------- login ----------
  const lf = $('#login-form');
  if (lf) {
    lf.addEventListener('submit', async e => {
      e.preventDefault();
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: lf.user.value, password: lf.password.value }) });
      if (r.ok) return location.reload();
      $('.msg', lf).textContent = r.status === 429 ? 'Muitas tentativas. Aguarde 15 minutos.' : 'Usuário ou senha incorretos.';
    });
    return;
  }

  // ---------- app ----------
  let days = 30, stats = null, orders = [], products = [];
  const api = async (url, opts = {}) => {
    const r = await fetch(url, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
    if (r.status === 401) { location.reload(); throw new Error('auth'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || 'erro'), j);
    return j;
  };
  function toast(t, err) { const el = $('#toast'); el.textContent = t; el.className = 'toast show' + (err ? ' err' : ''); clearTimeout(el._t); el._t = setTimeout(() => el.className = 'toast', 2600); }

  const titles = { overview: 'Visão geral', sales: 'Vendas', products: 'Produtos', gear: 'Recomendações', audience: 'Público', integrations: 'Integrações' };
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
    $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== b.dataset.tab; });
    $('#page-title').textContent = titles[b.dataset.tab];
    history.replaceState(null, '', '#' + b.dataset.tab);
    if (b.dataset.tab === 'audience') loadAudience();
    if (b.dataset.tab === 'products') loadProducts();
    if (b.dataset.tab === 'sales') loadOrders();
    if (b.dataset.tab === 'integrations') loadIntegrations();
    if (b.dataset.tab === 'gear') loadAff();
  }));
  $$('.range button').forEach(b => b.addEventListener('click', () => {
    $$('.range button').forEach(x => x.classList.toggle('on', x === b));
    days = Number(b.dataset.days); loadStats();
  }));
  $('#logout').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }); location.reload(); });

  // ---------- KPIs ----------
  function delta(cur, prev, invert) {
    if (!prev && !cur) return '<span class="delta flat">-</span>';
    if (!prev) return '<span class="delta up">novo</span>';
    const d = (cur - prev) / prev;
    const good = invert ? d < 0 : d > 0;
    const cls = Math.abs(d) < 0.005 ? 'flat' : good ? 'up' : 'down';
    return `<span class="delta ${cls}">${d > 0 ? '▲' : d < 0 ? '▼' : ''} ${pct(Math.abs(d))} vs. período anterior</span>`;
  }
  function kpi(label, [cur, prev], fmt, help, invert) {
    return `<div class="kpi"><div class="kpi-label">${help ? `<span title="${esc(help)}">${esc(label)}</span>` : esc(label)}</div><div class="kpi-value">${fmt(cur)}</div>${delta(cur, prev, invert)}</div>`;
  }

  // ---------- gráficos SVG ----------
  function lineChart(el, series, keys, fmtVal) {
    const W = el.clientWidth || 600, H = el.clientHeight || 260, P = { l: 40, r: 12, t: 12, b: 26 };
    if (!series.length) { el.innerHTML = '<p class="empty">Sem dados no período.</p>'; return; }
    const max = Math.max(1, ...series.flatMap(s => keys.map(k => s[k])));
    const nice = Math.pow(10, Math.floor(Math.log10(max))); const top = Math.ceil(max / nice) * nice || 1;
    const x = i => P.l + (series.length === 1 ? (W - P.l - P.r) / 2 : i * (W - P.l - P.r) / (series.length - 1));
    const y = v => H - P.b - v / top * (H - P.t - P.b);
    const path = k => series.map((s, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(s[k]).toFixed(1)).join('');
    const ticks = [0, .25, .5, .75, 1].map(f => top * f);
    const step = Math.max(1, Math.ceil(series.length / 8));
    const lab = d => { const [, m, dd] = d.split('-'); return dd + '/' + m; };
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico de tráfego">
      <defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a3852b" stop-opacity=".22"/><stop offset="1" stop-color="#a3852b" stop-opacity="0"/></linearGradient></defs>
      <g class="grid">${ticks.map(t => `<line x1="${P.l}" x2="${W - P.r}" y1="${y(t)}" y2="${y(t)}"/>`).join('')}</g>
      <g class="axis">${ticks.map(t => `<text x="${P.l - 8}" y="${y(t) + 4}" text-anchor="end">${nf.format(Math.round(t))}</text>`).join('')}
      ${series.map((s, i) => i % step === 0 || (i === series.length - 1 && (series.length - 1) % step >= step / 2) ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${lab(s.day)}</text>` : '').join('')}</g>
      <path class="area-a" d="${path(keys[0])}L${x(series.length - 1)},${y(0)}L${x(0)},${y(0)}Z"/>
      ${keys[1] ? `<path class="line-b" d="${path(keys[1])}"/>` : ''}
      <path class="line-a" d="${path(keys[0])}"/>
      <line class="hover-line" y1="${P.t}" y2="${H - P.b}" style="display:none"/>
      <circle class="dot" r="4" style="display:none"/>
      <rect x="${P.l}" y="0" width="${W - P.l - P.r}" height="${H}" fill="transparent" class="hit"/>
    </svg><div class="tip"></div>`;
    const svg = $('svg', el), tip = $('.tip', el), hl = $('.hover-line', el), dot = $('.dot', el);
    $('.hit', el).addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect();
      const mx = (e.clientX - r.left) * W / r.width;
      const i = Math.max(0, Math.min(series.length - 1, Math.round((mx - P.l) / ((W - P.l - P.r) / Math.max(1, series.length - 1)))));
      const s = series[i];
      hl.setAttribute('x1', x(i)); hl.setAttribute('x2', x(i)); hl.style.display = '';
      dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(s[keys[0]])); dot.style.display = '';
      tip.innerHTML = `${lab(s.day)}<br>${fmtVal(s)}`;
      tip.style.left = (x(i) / W * r.width) + 'px'; tip.style.top = (y(s[keys[0]]) / H * r.height) + 'px'; tip.style.opacity = 1;
    });
    $('.hit', el).addEventListener('mouseleave', () => { tip.style.opacity = 0; hl.style.display = 'none'; dot.style.display = 'none'; });
  }

  function barChart(el, series, key, fmt) {
    const W = el.clientWidth || 600, H = el.clientHeight || 260, P = { l: 56, r: 8, t: 10, b: 26 };
    const max = Math.max(...series.map(s => s[key]));
    if (!max) { el.innerHTML = '<p class="empty">Nenhuma venda paga no período.</p>'; return; }
    const bw = (W - P.l - P.r) / series.length;
    const y = v => H - P.b - v / max * (H - P.t - P.b);
    const step = Math.max(1, Math.ceil(series.length / 8));
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Receita por dia">
      <g class="grid"><line x1="${P.l}" x2="${W - P.r}" y1="${y(0)}" y2="${y(0)}"/><line x1="${P.l}" x2="${W - P.r}" y1="${y(max)}" y2="${y(max)}"/></g>
      <g class="axis"><text x="${P.l - 8}" y="${y(max) + 4}" text-anchor="end">${fmt(max)}</text><text x="${P.l - 8}" y="${y(0) + 4}" text-anchor="end">0</text>
      ${series.map((s, i) => i % step === 0 ? `<text x="${P.l + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle">${s.day.slice(8)}/${s.day.slice(5, 7)}</text>` : '').join('')}</g>
      ${series.map((s, i) => `<rect class="bar" x="${P.l + i * bw + bw * .15}" width="${Math.max(1, bw * .7)}" y="${y(s[key])}" height="${Math.max(0, y(0) - y(s[key]))}"><title>${s.day}: ${fmt(s[key])} (${s.orders} pedido${s.orders === 1 ? '' : 's'})</title></rect>`).join('')}
    </svg>`;
  }

  function bars(list, { label = x => x.key, value = x => x.n, fmt = nf.format, empty = 'Sem dados no período.' } = {}) {
    if (!list || !list.length) return `<p class="empty">${empty}</p>`;
    const max = Math.max(...list.map(value)) || 1;
    return `<div class="bars">${list.map(x => `<div class="bar-row"><span class="name" title="${esc(label(x))}">${esc(label(x))}</span><span class="val">${fmt(value(x))}</span><span class="track"><span class="fill" style="width:${value(x) / max * 100}%"></span></span></div>`).join('')}</div>`;
  }

  // ---------- estatísticas ----------
  const devName = { mobile: 'Celular', desktop: 'Computador', tablet: 'Tablet' };
  const funnelName = { visits: 'Visitas', shop: 'Viram a loja', product: 'Viram um guia', checkout: 'Iniciaram compra', paid: 'Compraram' };
  async function loadStats() {
    stats = await api('/api/admin/stats?days=' + days);
    const k = stats.kpis;
    const from = new Date(stats.range.from).toLocaleDateString('pt-BR'), to = new Date(stats.range.to).toLocaleDateString('pt-BR');
    $('#range-label').textContent = `${from} – ${to} · ${nf.format(stats.totals.events)} eventos registrados desde o início`;
    $('#realtime').textContent = stats.realtime;
    $('#kpis').innerHTML = [
      kpi('Visitantes', k.visitors, nf.format, 'Pessoas únicas por dia, somadas no período'),
      kpi('Visualizações', k.pageviews, nf.format),
      kpi('Páginas / visita', k.pagesPerVisit, v => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })),
      kpi('Tempo médio', k.avgEngageMs, dur, 'Tempo com a aba visível, por visita'),
      kpi('Rejeição', k.bounceRate, pct, 'Visitas com apenas uma página', true),
      kpi('Receita', k.revenue, brl),
      kpi('Vendas', k.paidOrders, nf.format),
      kpi('Conversão', k.conversion, pct, 'Vendas pagas ÷ visitas')
    ].join('');
    $('#kpis-sales').innerHTML = [
      kpi('Receita', k.revenue, brl), kpi('Vendas pagas', k.paidOrders, nf.format), kpi('Pedidos criados', k.orders, nf.format),
      kpi('Ticket médio', k.aov, brl), kpi('Conversão', k.conversion, pct, 'Vendas pagas ÷ visitas'),
      `<div class="kpi"><div class="kpi-label">Receita total</div><div class="kpi-value">${brl(stats.totals.revenue)}</div><span class="delta flat">desde o início</span></div>`
    ].join('');

    lineChart($('#chart-traffic'), stats.series, ['visitors', 'pv'], s => `<b>${nf.format(s.visitors)}</b> visitantes · ${nf.format(s.pv)} visualizações`);
    barChart($('#chart-revenue'), stats.series, 'revenue', brl);

    const f = stats.funnel, f0 = f[0].n || 1;
    $('#funnel').innerHTML = `<div class="funnel">${f.map((s, i) => `<div class="funnel-step" style="--w:${Math.max(2, s.n / f0 * 100)}%"><span>${funnelName[s.key]}</span><b>${nf.format(s.n)}</b></div>${i && f[i - 1].n ? `<div class="funnel-rate">${pct(s.n / f[i - 1].n)} da etapa anterior</div>` : ''}`).join('')}</div>`;

    $('#top-pages').innerHTML = bars(stats.topPages, { label: x => x.path, value: x => x.views });
    $('#referrers').innerHTML = `<p class="sub-h">Sites de origem</p>${bars(stats.referrers, { empty: 'Apenas acesso direto até agora.' })}${stats.utm.length ? `<p class="sub-h">Campanhas (utm_source)</p>${bars(stats.utm)}` : ''}`;
    $('#devices').innerHTML = `<p class="sub-h">Dispositivo</p>${bars(stats.devices, { label: x => devName[x.key] || x.key })}<p class="sub-h">Versão do site</p>${bars(stats.siteLang, { label: x => x.key === 'pt' ? 'Português' : 'English' })}<p class="sub-h">Navegador</p>${bars(stats.browsers)}`;
    const e = stats.engagement;
    $('#engagement').innerHTML = `<div class="mini-stats">
      <div><span>Quiz iniciados</span><b>${nf.format(e.quizStart)}</b></div><div><span>Quiz concluídos</span><b>${nf.format(e.quizComplete)}</b></div>
      <div><span>Timers iniciados</span><b>${nf.format(e.timerStart)}</b></div><div><span>Timers concluídos</span><b>${nf.format(e.timerDone)}</b></div>
      <div><span>Novos na newsletter</span><b>${nf.format(e.newsletter)}</b></div><div><span>Novos em listas de espera</span><b>${nf.format(e.waitlist)}</b></div>
      <div><span>Downloads de PDF</span><b>${nf.format(e.downloads)}</b></div><div><span>Trocas de idioma</span><b>${nf.format(e.langSwitch)}</b></div>
      <div><span>Cliques em recomendações</span><b>${nf.format(e.affClicks || 0)}</b></div><div><span>Inscritos (total)</span><b>${nf.format(stats.totals.subscribers)}</b></div>
      <div><span>Prévias abertas</span><b>${nf.format(e.previewOpen || 0)}</b></div><div><span>Pedidos (total)</span><b>${nf.format(stats.totals.orders)}</b></div>
    </div>`;
    const teaName = { branco: 'Chá branco', verde: 'Chá verde', matcha: 'Matcha', oolong: 'Oolong', preto: 'Chá preto', puer: 'Pu-erh', mate: 'Erva-mate', rooibos: 'Rooibos', ervas: 'Ervas e flores' };
    $('#quiz').innerHTML = bars(stats.quizResults, { label: x => teaName[x.key] || x.key, empty: 'Nenhum quiz concluído no período.' });

    $('#product-perf').innerHTML = `<thead><tr><th>Guia</th><th>Status</th><th class="num">Visualizações</th><th class="num">Iniciaram compra</th><th class="num">Vendas</th><th class="num">Conversão</th><th class="num">Receita</th><th class="num">Lista de espera</th></tr></thead><tbody>${stats.products.slice().sort((a, b) => b.revenue - a.revenue || b.waitlist - a.waitlist).map(p => `<tr><td data-l="Guia">${esc(p.title)}</td><td data-l="Status"><span class="pill pill-${p.status}">${statusName[p.status]}</span></td><td class="num" data-l="Visualizações">${nf.format(p.views)}</td><td class="num" data-l="Iniciaram compra">${nf.format(p.checkouts)}</td><td class="num" data-l="Vendas">${nf.format(p.paid)}</td><td class="num" data-l="Conversão">${p.views ? pct(p.paid / p.views) : '-'}</td><td class="num" data-l="Receita">${brl(p.revenue)}</td><td class="num" data-l="Lista de espera">${nf.format(p.waitlist)}${p.waitlistPeriod ? ` <span class="muted">(+${p.waitlistPeriod})</span>` : ''}</td></tr>`).join('')}</tbody>`;
  }
  const statusName = { available: 'Disponível', coming_soon: 'Em breve', hidden: 'Oculto', paid: 'Pago', pending: 'Pendente', cancelled: 'Cancelado', refunded: 'Reembolsado' };
  const providerName = { cakto: 'Cakto' };

  // ---------- pedidos ----------
  async function loadOrders() {
    orders = await api('/api/admin/orders');
    renderOrders();
  }
  function renderOrders() {
    const f = $('#order-filter').value;
    const list = orders.filter(o => !f || o.status === f);
    $('#orders').innerHTML = list.length ? `<thead><tr><th>Pedido</th><th>Data</th><th>Cliente</th><th>Guia</th><th>PDF</th><th class="num">Valor</th><th>Origem</th><th>Status</th><th class="num">Downloads</th><th></th></tr></thead><tbody>${list.map(o => `<tr>
      <td data-l="Pedido"><code>${esc(o.id)}</code>${o.refId ? `<br><span class="muted">Cakto ${esc(o.refId)}</span>` : ''}</td><td data-l="Data">${dt(o.createdAt)}</td>
      <td data-l="Cliente">${esc(o.name)}<br><span class="muted">${esc(o.email)}</span></td>
      <td data-l="Guia">${esc(o.title)}</td><td data-l="PDF"><span class="lang-tag">${esc((o.pdfLang || 'pt').toUpperCase())}</span></td><td class="num" data-l="Valor">${brl(o.amount)}</td>
      <td data-l="Origem">${providerName[o.provider] || o.provider}${o.method === 'manual' ? ' <span class="muted">(manual)</span>' : ''}</td>
      <td data-l="Status"><span class="pill pill-${o.status}">${statusName[o.status] || o.status}</span></td><td class="num" data-l="Downloads">${o.downloads}</td>
      <td><div class="row-actions">
        ${o.status === 'pending' ? `<button class="btn-sm primary" data-pay="${o.id}">Confirmar pagamento</button><button class="btn-sm" data-cancel="${o.id}">Cancelar</button>` : ''}
        ${o.status === 'paid' ? `<button class="btn-sm" data-resend="${o.id}">Enviar acesso</button>` : ''}
        ${o.status === 'paid' ? `<button class="btn-sm" data-mklink="${o.id}" title="Link de uso único, vale 3 dias">Gerar link de acesso</button>` : ''}
        ${o.devices ? `<button class="btn-sm" data-logoutall="${o.id}" title="O cliente precisará pedir um link novo para entrar">Desconectar ${o.devices} aparelho${o.devices > 1 ? 's' : ''}</button>` : ''}
      </div></td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="empty">Nenhum pedido ainda.</td></tr></tbody>';
  }
  $('#order-filter').addEventListener('change', renderOrders);
  $('#orders').addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.mklink) {
      const r = await api('/api/admin/orders/' + b.dataset.mklink, { method: 'POST', body: JSON.stringify({ makeLink: true }) });
      await navigator.clipboard.writeText(r.link).catch(() => {});
      return toast('Link copiado. Ele funciona uma vez e vale 3 dias: o aparelho de quem abrir fica conectado.');
    }
    if (b.dataset.logoutall) {
      if (!confirm('Desconectar todos os aparelhos deste cliente? Ele precisará pedir um link novo para entrar.')) return;
      const r = await api('/api/admin/orders/' + b.dataset.logoutall, { method: 'POST', body: JSON.stringify({ logoutAll: true }) });
      toast(r.ended + ' aparelho(s) desconectado(s).'); return loadOrders();
    }
    if (b.dataset.resend) {
      try {
        const r = await api('/api/admin/orders/' + b.dataset.resend, { method: 'POST', body: JSON.stringify({ resend: true }) });
        if (r.sent) toast('E-mail de acesso enviado.');
        else { await navigator.clipboard.writeText(r.link).catch(() => {}); toast('E-mail não configurado: link de acesso copiado (uso único, vale 3 dias).'); }
      } catch (err) { toast('Falha no envio: ' + err.message, true); }
      return;
    }
    const id = b.dataset.pay || b.dataset.cancel;
    if (b.dataset.pay && !confirm('Confirmar o pagamento deste pedido? O download será liberado para o cliente.')) return;
    await api('/api/admin/orders/' + id, { method: 'POST', body: JSON.stringify({ status: b.dataset.pay ? 'paid' : 'cancelled' }) });
    toast(b.dataset.pay ? 'Pagamento confirmado.' : 'Pedido cancelado.');
    loadOrders(); loadStats();
  });

  // ---------- produtos ----------
  const mb = n => (n / 1048576).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' MB';
  const upIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>';
  function fileBtn(p, l) {
    const size = p.fileInfo[l];
    return `<label class="file-btn${size ? ' has-file' : ''}">
      <input type="file" name="pdf_${l}" accept="application/pdf">
      <span class="fb-lang">${l.toUpperCase()}</span>
      <span class="fb-text"><b>${size ? 'PDF enviado' : 'Enviar PDF'}</b><small>${size ? mb(size) + ' · trocar arquivo' : (l === 'pt' ? 'Versão em português' : 'Versão em inglês')}</small></span>
      ${upIcon}
    </label>`;
  }
  async function loadProducts() {
    products = await api('/api/admin/products');
    $('#product-editor').innerHTML = products.map(p => `<form class="pe-card" data-slug="${p.slug}">
      <img class="pe-cover" src="/assets/img/covers/${p.slug}-pt.jpg" alt="" onerror="this.style.visibility='hidden'">
      <div class="pe-main">
        <div class="pe-head"><span class="pe-num">${String(p.order).padStart(2, '0')}</span><div class="pe-title"><b>${esc(p.title.pt)}</b><span>${esc(p.title.en)} · /${esc(p.slug)}</span></div><span class="pill pill-${p.status}">${statusName[p.status]}</span></div>
        <div class="pe-fields">
          <label>Preço (R$)<input name="price" type="number" min="1" step="0.01" value="${(p.price / 100).toFixed(2)}"></label>
          <label>Status<span class="select"><select name="status">${['available', 'coming_soon', 'hidden'].map(s => `<option value="${s}"${p.status === s ? ' selected' : ''}>${statusName[s]}</option>`).join('')}</select></span></label>
          <label>Páginas<input name="pages" type="number" min="1" value="${p.pages}"></label>
          <label class="pe-cakto">Link do checkout na Cakto · PT <small>o botão Comprar leva para cá; sem link, o guia mostra a lista de espera</small><input name="checkoutPt" type="url" value="${esc((p.checkout || {}).pt || '')}" placeholder="https://pay.cakto.com.br/..."></label>
          <label class="pe-cakto">Link do checkout na Cakto · EN <small>opcional, oferta da versão em inglês</small><input name="checkoutEn" type="url" value="${esc((p.checkout || {}).en || '')}" placeholder="https://pay.cakto.com.br/..."></label>
          <label class="pe-cakto">IDs na Cakto <small>produto ou oferta · use <code>id:en</code> para entregar em inglês</small><input name="cakto" value="${esc((p.cakto || []).join(', '))}" placeholder="ex.: 8f2a1c, oferta-en:en"></label>
        </div>
        <div class="pe-files">${fileBtn(p, 'pt')}${fileBtn(p, 'en')}<button class="btn primary" type="submit">Salvar</button></div>
      </div>
    </form>`).join('');
  }
  $('#product-editor').addEventListener('change', e => {
    const inp = e.target.closest('.file-btn input'); if (!inp) return;
    const lab = inp.closest('.file-btn'), f = inp.files[0];
    if (!f) return;
    lab.classList.add('is-picked');
    $('b', lab).textContent = f.name.length > 26 ? f.name.slice(0, 24) + '…' : f.name;
    $('small', lab).textContent = mb(f.size) + ' · clique em Salvar';
  });
  $('#product-editor').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, slug = f.dataset.slug, btn = $('button[type=submit]', f);
    btn.disabled = true;
    try {
      for (const l of ['pt', 'en']) {
        const file = f['pdf_' + l].files[0];
        if (!file) continue;
        const r = await fetch(`/api/admin/products/${slug}/pdf?lang=${l}`, { method: 'POST', headers: { 'Content-Type': 'application/pdf' }, body: file });
        if (!r.ok) throw new Error((await r.json()).error === 'notpdf' ? 'O arquivo não é um PDF válido.' : 'Falha no envio do PDF.');
      }
      await api('/api/admin/products/' + slug, { method: 'PUT', body: JSON.stringify({ price: Math.round(parseFloat(f.price.value) * 100), pages: Number(f.pages.value), status: f.status.value, cakto: f.cakto.value, checkout: { pt: f.checkoutPt.value, en: f.checkoutEn.value } }) });
      toast('Guia atualizado.');
      loadProducts(); loadStats();
    } catch (err) {
      toast(err.error === 'nofile' ? 'Envie ao menos um PDF antes de marcar como Disponível.' : err.message, true);
    } finally { btn.disabled = false; }
  });

  // ---------- recomendações (afiliados) ----------
  const catName = { preparo: 'Preparo', servir: 'Servir', organizacao: 'Organização', outros: 'Outros' };
  const icons = ['teapot', 'press', 'box', 'jar', 'cup', 'leaf', 'whisk', 'bag', 'gourd', 'ice', 'mortar'];
  const sel = (name, opts, val) => `<span class="select"><select name="${name}">${Object.entries(opts).map(([k, v]) => `<option value="${k}"${k === val ? ' selected' : ''}>${v}</option>`).join('')}</select></span>`;
  function affFields(a = {}) {
    const t = a.title || {}, n = a.note || {};
    return `<div class="aff-fields">
      <label>Loja${sel('store', { ml: 'Mercado Livre', amazon: 'Amazon' }, a.store || 'ml')}</label>
      <label>Categoria${sel('category', catName, a.category || 'preparo')}</label>
      <label>Ícone (sem foto)${sel('icon', Object.fromEntries(icons.map(i => [i, i])), a.icon || 'teapot')}</label>
      <label>Ordem<input name="order" type="number" value="${a.order ?? ''}"></label>
      <label class="span2">Link de afiliado *<input name="url" required value="${esc(a.url || '')}" placeholder="https://meli.la/… ou https://amzn.to/…"></label>
      <label class="span2">Link do anúncio (referência)<input name="source" value="${esc(a.source || '')}" placeholder="https://www.mercadolivre.com.br/…"></label>
      <label class="span2">Título (PT) *<input name="title_pt" required maxlength="120" value="${esc(t.pt || '')}"></label>
      <label class="span2">Título (EN)<input name="title_en" maxlength="120" value="${esc(t.en || '')}"></label>
      <label class="span2">Por que recomendamos (PT)<textarea name="note_pt" rows="2" maxlength="300">${esc(n.pt || '')}</textarea></label>
      <label class="span2">Por que recomendamos (EN)<textarea name="note_en" rows="2" maxlength="300">${esc(n.en || '')}</textarea></label>
      <label class="span2">Imagem por URL (https)<input name="image" value="${esc(a.image || '')}" placeholder="opcional, ou envie uma foto ao lado"></label>
    </div>`;
  }
  function affPayload(f) {
    return { store: f.store.value, category: f.category.value, icon: f.icon.value, order: f.order.value === '' ? undefined : Number(f.order.value), url: f.url.value, source: f.source.value, image: f.image.value,
      title: { pt: f.title_pt.value, en: f.title_en.value }, note: { pt: f.note_pt.value, en: f.note_en.value }, active: f.active ? f.active.checked : true };
  }
  const imgBtn = has => `<label class="file-btn${has ? ' has-file' : ''}"><input type="file" name="img" accept="image/jpeg,image/png,image/webp"><span class="fb-lang">IMG</span><span class="fb-text"><b>${has ? 'Foto enviada' : 'Enviar foto'}</b><small>${has ? 'trocar foto' : 'JPG, PNG ou WEBP até 4 MB'}</small></span>${upIcon}</label>`;
  async function loadAff() {
    const list = await api('/api/admin/affiliates');
    $('#aff-new').innerHTML = affFields() + `<div class="pe-files"><label class="toggle"><input type="checkbox" name="active" checked> Ativo no site</label><button class="btn primary" type="submit">Adicionar</button></div>`;
    $('#aff-list').innerHTML = list.length ? list.map(a => `<form class="pe-card aff-admin" data-id="${a.id}">
      <div class="aff-thumb">${a.imageFile ? `<img src="/media/${a.imageFile}" alt="">` : a.image ? `<img src="${esc(a.image)}" alt="" referrerpolicy="no-referrer">` : `<span>${esc(a.icon)}</span>`}</div>
      <div class="pe-main">
        <div class="pe-head"><div class="pe-title"><b>${esc(a.title.pt)}</b><span>${a.store === 'amazon' ? 'Amazon' : 'Mercado Livre'} · ${catName[a.category] || ''} · <a href="/r/${a.id}" target="_blank" rel="noopener">/r/${a.id}</a></span></div>
          <span class="clicks"><b>${nf.format(a.clicks30)}</b> cliques em 30 dias · ${nf.format(a.clicks)} no total</span>
          <span class="pill ${a.active ? 'pill-available' : 'pill-hidden'}">${a.active ? 'Ativo' : 'Oculto'}</span></div>
        <details><summary>Editar</summary>${affFields(a)}</details>
        <div class="pe-files">${imgBtn(!!a.imageFile)}<label class="toggle"><input type="checkbox" name="active"${a.active ? ' checked' : ''}> Ativo no site</label>
          <button class="btn-sm danger" type="button" data-del="${a.id}">Excluir</button><button class="btn primary" type="submit">Salvar</button></div>
      </div>
    </form>`).join('') : '<p class="empty">Nenhuma recomendação ainda.</p>';
  }
  $('#aff-new').addEventListener('submit', async e => {
    e.preventDefault();
    try { await api('/api/admin/affiliates', { method: 'POST', body: JSON.stringify(affPayload(e.target)) }); toast('Recomendação adicionada.'); loadAff(); }
    catch (err) { toast(err.error === 'host' ? 'Use um link do Mercado Livre ou da Amazon.' : 'Preencha o link e o título.', true); }
  });
  $('#aff-list').addEventListener('change', e => {
    const inp = e.target.closest('.file-btn input'); if (!inp || !inp.files[0]) return;
    const lab = inp.closest('.file-btn'); lab.classList.add('is-picked'); $('b', lab).textContent = inp.files[0].name.slice(0, 24); $('small', lab).textContent = 'clique em Salvar';
  });
  $('#aff-list').addEventListener('click', async e => {
    const d = e.target.closest('[data-del]'); if (!d) return;
    if (!confirm('Excluir esta recomendação?')) return;
    await api('/api/admin/affiliates/' + d.dataset.del, { method: 'DELETE' }); toast('Excluída.'); loadAff();
  });
  $('#aff-list').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, id = f.dataset.id, btn = $('button[type=submit]', f); btn.disabled = true;
    try {
      const file = f.img.files[0];
      if (file) { const r = await fetch(`/api/admin/affiliates/${id}/image`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file }); if (!r.ok) throw new Error('Imagem inválida (use JPG, PNG ou WEBP).'); }
      await api('/api/admin/affiliates/' + id, { method: 'PUT', body: JSON.stringify(affPayload(f)) });
      toast('Recomendação salva.'); loadAff();
    } catch (err) { toast(err.error === 'host' ? 'Use um link do Mercado Livre ou da Amazon.' : err.message, true); }
    finally { btn.disabled = false; }
  });

  // ---------- integrações ----------
  async function loadIntegrations() {
    const i = await api('/api/admin/integrations');
    const ok = v => v ? '<span class="pill pill-paid">Configurado</span>' : '<span class="pill pill-pending">Pendente</span>';
    const copy = v => `<div class="copy-field"><input readonly value="${esc(v)}"><button class="btn-sm" data-copy="${esc(v)}">Copiar</button></div>`;
    $('#integrations').innerHTML = `
      <div class="int-grid">
        <div class="card"><div class="card-head"><h2>1 · Webhook da Cakto</h2>${ok(i.caktoSecret)}</div>
          <p class="hint">Na Cakto: <b>Integrações → Webhooks → Adicionar</b>. Cole a URL abaixo, selecione os produtos e os eventos <code>purchase_approved</code>, <code>refund</code> e <code>chargeback</code>. Depois copie o <b>secret</b> gerado para <code>CAKTO_WEBHOOK_SECRET</code> no arquivo <code>.env</code> e reinicie o servidor.</p>
          ${copy(i.webhookUrl)}
        </div>
        <div class="card"><div class="card-head"><h2>2 · Entrega "Acesso por e-mail"</h2></div>
          <p class="hint">No produto da Cakto, em <b>Entrega → Acesso por e-mail</b>, use o link da página de receber (abaixo). Esse link é o mesmo para todos e não abre nada sozinho: o cliente informa o e-mail da compra e recebe um link de uso único (ou usa o código do pedido da Cakto). Cada aparelho entra uma vez e fica conectado; para outro aparelho, ele pede um novo link. Até 5 aparelhos por e-mail (MAX_DEVICES).</p>
          <p class="sub-h">Português</p>${copy(i.receive.pt)}<p class="sub-h">English</p>${copy(i.receive.en)}
        </div>
        <div class="card"><div class="card-head"><h2>3 · Ligar guias aos produtos</h2></div>
          <p class="hint">Em <b>Produtos</b>, preencha "IDs na Cakto" de cada guia com o ID do produto ou da oferta. Um combo pode liberar vários guias: coloque o mesmo ID em cada um. Para vender a versão em inglês, crie uma oferta separada e use <code>id:en</code>. Vendas sem guia ligado aparecem no registro abaixo com o ID para copiar.</p>
        </div>
        <div class="card"><div class="card-head"><h2>4 · E-mail automático (opcional)</h2>${ok(i.mail)}</div>
          <p class="hint">Com <code>RESEND_API_KEY</code> e <code>MAIL_FROM</code> no <code>.env</code>, o cliente recebe um link de entrada (uso único) no idioma da compra assim que o pagamento é aprovado, e a página de receber passa a funcionar só com o e-mail. Sem isso, a entrada é pelo e-mail + código do pedido da Cakto.${i.mailFrom ? ` Remetente: <b>${esc(i.mailFrom)}</b>.` : ''}</p>
        </div>
      </div>
      <div class="card"><div class="card-head"><h2>Registro de webhooks</h2><button class="btn-sm" id="int-refresh">Atualizar</button></div>
        <div class="table-wrap"><table class="table">${i.log.length ? `<thead><tr><th>Data</th><th>Evento</th><th>Produto / oferta</th><th>IDs</th><th>Cliente</th><th>Resultado</th></tr></thead><tbody>${i.log.map(l => `<tr><td data-l="Data">${dt(l.t)}</td><td data-l="Evento"><code>${esc(l.event)}</code></td><td data-l="Produto">${esc(l.product)}${l.offerName ? `<br><span class="muted">${esc(l.offerName)}</span>` : ''}</td><td data-l="IDs"><span class="muted">${[l.productId, l.shortId, l.offerId].filter(Boolean).map(x => `<code class="click-copy" data-copy="${esc(x)}">${esc(x)}</code>`).join(' ')}</span></td><td data-l="Cliente">${esc(l.email || '')}</td><td data-l="Resultado">${esc(l.result)}</td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="empty">Nenhum webhook recebido ainda. Use "Enviar teste" na Cakto depois de cadastrar a URL.</td></tr></tbody>'}</table></div>
      </div>`;
  }
  $('#integrations').addEventListener('click', async e => {
    const c = e.target.closest('[data-copy]');
    if (c) { await navigator.clipboard.writeText(c.dataset.copy).catch(() => {}); toast('Copiado.'); }
    if (e.target.id === 'int-refresh') loadIntegrations();
  });

  // ---------- público ----------
  async function loadAudience() {
    const a = await api('/api/admin/audience');
    const names = Object.fromEntries((stats ? stats.products : []).map(p => [p.slug, p.title]));
    $('#subscribers').innerHTML = a.subscribers.length ? `<thead><tr><th>E-mail</th><th>Idioma</th><th>Origem</th><th>Data</th></tr></thead><tbody>${a.subscribers.map(s => `<tr><td data-l="E-mail">${esc(s.email)}</td><td data-l="Idioma">${s.lang.toUpperCase()}</td><td class="muted" data-l="Origem">${esc(s.source)}</td><td data-l="Data">${dt(s.createdAt)}</td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="empty">Nenhum inscrito ainda.</td></tr></tbody>';
    $('#waitlist').innerHTML = a.waitlist.length ? `<thead><tr><th>E-mail</th><th>Guia</th><th>Idioma</th><th>Data</th></tr></thead><tbody>${a.waitlist.map(s => `<tr><td data-l="E-mail">${esc(s.email)}</td><td data-l="Guia">${esc(names[s.product] || s.product)}</td><td data-l="Idioma">${s.lang.toUpperCase()}</td><td data-l="Data">${dt(s.createdAt)}</td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="empty">Nenhum inscrito em listas de espera.</td></tr></tbody>';
  }

  // inicialização
  loadStats().then(() => {
    const h = location.hash.slice(1);
    const tab = $(`.tabs button[data-tab="${h}"]`);
    if (tab) tab.click();
  });
  setInterval(() => { if (document.visibilityState === 'visible') api('/api/admin/stats?days=1').then(s => { $('#realtime').textContent = s.realtime; }).catch(() => {}); }, 30000);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (stats) { lineChart($('#chart-traffic'), stats.series, ['visitors', 'pv'], s => `<b>${nf.format(s.visitors)}</b> visitantes · ${nf.format(s.pv)} visualizações`); barChart($('#chart-revenue'), stats.series, 'revenue', brl); } }, 200); });
})();
