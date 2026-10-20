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

  const titles = { overview: 'Visão geral', sales: 'Pedidos e vendas', products: 'Guias e PDFs', reviews: 'Avaliações', gear: 'Recomendações', audience: 'Inscritos', integrations: 'Integrações',
    campaigns: 'Campanhas', daily: 'Chá do dia', recipes: 'Banco de receitas', questions: 'Perguntas', team: 'Usuários e permissões', security: 'Segurança e backups', history: 'Histórico', owner: 'Perfil do dono' };
  const loaders = {
    audience: () => loadAudience(), products: () => loadProducts(), sales: () => { loadOrders(); renderTestBuy(); }, integrations: () => loadIntegrations(), gear: () => loadAff(),
    reviews: () => loadReviews(), campaigns: () => loadCampaigns(), daily: () => loadDaily(), recipes: () => loadRecipes(), questions: () => loadQuestions(),
    team: () => loadTeam(), security: () => loadSecurity(), history: () => loadHistory(), owner: () => loadOwner(), overview: () => loadTasks()
  };
  let ME = { perms: [] };
  const allowed = perm => !perm || ME.owner || ME.perms.includes(perm);
  function openTab(tab) {
    const btn = $(`.sidenav [data-tab="${tab}"]:not([hidden])`);
    if (!btn) return;
    $$('.sidenav [data-tab]').forEach(x => x.setAttribute('aria-selected', x.dataset.tab === tab && !x.classList.contains('area-head')));
    $$('.sidenav .area').forEach(a => a.classList.toggle('is-open', !!$(`[data-tab="${tab}"]`, a)));
    $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== tab; });
    $('#page-title').textContent = titles[tab] || '';
    document.body.dataset.tab = tab;
    history.replaceState(null, '', '#' + tab);
    document.body.classList.remove('nav-open'); $('.nav-toggle').setAttribute('aria-expanded', 'false');
    if (loaders[tab]) Promise.resolve(loaders[tab]()).catch(err => toast(err.need ? 'Sem permissão: ' + (err.label || err.need) : 'Não deu certo: ' + err.message, true));
  }
  $$('.sidenav [data-tab]').forEach(b => b.addEventListener('click', () => openTab(b.dataset.tab)));
  $('.nav-toggle').addEventListener('click', () => { const o = !document.body.classList.contains('nav-open'); document.body.classList.toggle('nav-open', o); $('.nav-toggle').setAttribute('aria-expanded', o); });
  // Mostra só as áreas e abas que o usuário pode usar
  function applyPerms() {
    $$('.sidenav .area').forEach(a => {
      const subs = $$('.area-tabs [data-tab]', a);
      subs.forEach(b => { b.hidden = !allowed(b.dataset.perm); });
      const head = $('.area-head', a), firstOk = subs.length ? subs.find(b => !b.hidden) : (allowed(head.dataset.perm) ? head : null);
      a.hidden = !firstOk;
      if (firstOk) { head.dataset.tab = firstOk.dataset.tab; head.hidden = false; }
    });
    $('#tb-user').textContent = ME.user ? `${ME.owner ? ME.user + ' · dono' : (ME.name || ME.user)}` : '';
    document.body.classList.toggle('can-stats', allowed('stats'));
  }
  // Contadores de pendências na barra lateral
  function setCount(tab, n) {
    const c = $(`[data-count-tab="${tab}"]`); if (c) { c.textContent = n; c.hidden = !n; }
    const area = $(`.sidenav [data-tab="${tab}"]`)?.closest('.area');
    if (area) { const total = $$('[data-count-tab]', area).reduce((s, x) => s + (x.hidden ? 0 : Number(x.textContent) || 0), 0); const ac = $('.area-count', area); ac.textContent = total; ac.hidden = !total; }
  }
  $$('.range button').forEach(b => b.addEventListener('click', () => {
    $$('.range button').forEach(x => x.classList.toggle('on', x === b));
    days = Number(b.dataset.days);
    if (current() === 'campaigns') loadCampaigns(); else loadStats();
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
      <div><span>Cliques no guia do quiz</span><b>${nf.format(e.quizReco || 0)}</b></div><div><span>Receitas salvas</span><b>${nf.format(e.recipeSave || 0)}</b></div>
      <div><span>Cliques em "Por onde começar"</span><b>${nf.format(e.paths || 0)}</b></div><div><span>Cliques em "Comprar" no topo do guia</span><b>${nf.format(e.buyJump || 0)}</b></div>
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
    $('#clear-tests').hidden = !orders.some(o => o.test);
  }
  $('#clear-tests').addEventListener('click', async () => {
    if (!confirm('Apagar todas as compras de teste? Os e-mails de teste perdem o acesso à biblioteca.')) return;
    const r = await api('/api/admin/test-purchase', { method: 'DELETE' });
    toast(r.removed + ' compra(s) de teste apagada(s).'); loadOrders();
  });

  // ---------- compra de teste ----------
  async function renderTestBuy() {
    if (!products.length) products = await api('/api/admin/products');
    $('#test-buy').innerHTML = `<div class="aff-fields">
        <label class="span2">E-mail *<input name="email" type="email" required placeholder="voce@gmail.com"></label>
        <label>Nome<input name="name" value="Teste"></label>
        <label>Idioma do e-mail${sel('lang', { pt: 'Português', en: 'English' }, 'pt')}</label>
        <label>Celular (4 últimos dígitos)<input name="phone4" inputmode="numeric" maxlength="4" placeholder="ex.: 8765"></label>
      </div>
      <p class="sub-h">Guias liberados</p>
      <div class="test-guides">${products.map((p, i) => `<label class="toggle"><input type="checkbox" name="g" value="${esc(p.slug)}"${i === 0 ? ' checked' : ''}> ${esc(p.title.pt)}</label>`).join('')}
        <label class="toggle"><input type="checkbox" data-all> <b>Todos</b></label></div>
      <div class="pe-files"><label class="toggle"><input type="checkbox" name="sendMail" checked> Enviar o e-mail de acesso (como numa compra real)</label><button class="btn primary" type="submit">Simular compra</button></div>
      <p class="hint" id="test-result"></p>`;
  }
  $('#test-buy').addEventListener('change', e => { if (e.target.matches('[data-all]')) $$('#test-buy [name=g]').forEach(c => { c.checked = e.target.checked; }); });
  $('#test-buy').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, btn = $('button[type=submit]', f);
    const productsSel = $$('[name=g]', f).filter(c => c.checked).map(c => c.value);
    if (!productsSel.length) return toast('Escolha ao menos um guia.', true);
    btn.disabled = true;
    try {
      const r = await api('/api/admin/test-purchase', { method: 'POST', body: JSON.stringify({ email: f.email.value, name: f.name.value, lang: f.lang.value, phone4: f.phone4.value, products: productsSel, sendMail: f.sendMail.checked }) });
      const mailTxt = { sent: 'E-mail de acesso enviado.', off: 'E-mail não enviado (opção desmarcada).', disabled: 'E-mail não enviado: a Resend não está configurada no .env.' }[r.mail] || ('Falha no e-mail: ' + r.mail);
      $('#test-result').innerHTML = `Compra de teste criada (${r.released.length} guia${r.released.length > 1 ? 's' : ''}). ${esc(mailTxt)} Para entrar como cliente: <a href="${esc(r.receive)}" target="_blank" rel="noopener">abrir Receber meus guias</a> (de preferência numa janela anônima).`;
      toast('Compra de teste criada.');
      loadOrders(); loadStats();
    } catch (err) { toast(err.error === 'email' ? 'Confira o e-mail.' : 'Não deu certo: ' + err.message, true); }
    finally { btn.disabled = false; }
  });
  function renderOrders() {
    const f = $('#order-filter').value;
    const list = orders.filter(o => f === 'archived' ? o.archived : !o.archived && (!f || o.status === f));
    $('#orders').innerHTML = list.length ? `<thead><tr><th>Pedido</th><th>Data</th><th>Cliente</th><th>Guia</th><th>PDF</th><th class="num">Valor</th><th>Origem</th><th>Status</th><th class="num">Downloads</th><th></th></tr></thead><tbody>${list.map(o => `<tr>
      <td data-l="Pedido"><code>${esc(o.id)}</code>${o.refId ? `<br><span class="muted">Cakto ${esc(o.refId)}</span>` : ''}</td><td data-l="Data">${dt(o.createdAt)}</td>
      <td data-l="Cliente">${esc(o.name)}<br><span class="muted">${esc(o.email)}</span></td>
      <td data-l="Guia">${esc(o.title)}</td><td data-l="PDF"><span class="lang-tag">${esc((o.pdfLang || 'pt').toUpperCase())}</span></td><td class="num" data-l="Valor">${brl(o.amount)}</td>
      <td data-l="Origem">${o.test ? '<span class="pill pill-pending">Teste</span>' : (providerName[o.provider] || o.provider)}${o.method === 'manual' ? ' <span class="muted">(manual)</span>' : ''}</td>
      <td data-l="Status"><span class="pill pill-${o.status}">${statusName[o.status] || o.status}</span>${o.archived ? ' <span class="pill pill-hidden">Arquivado</span>' : ''}</td><td class="num" data-l="Downloads">${o.downloads}</td>
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
        <div class="pe-sec">
          <p class="pe-sec-t">Venda</p>
          <div class="pe-row3">
            <label>Preço (R$)<input name="price" type="number" min="1" step="0.01" value="${(p.price / 100).toFixed(2)}"></label>
            <label>Status<span class="select"><select name="status">${['available', 'coming_soon', 'hidden'].map(s => `<option value="${s}"${p.status === s ? ' selected' : ''}>${statusName[s]}</option>`).join('')}</select></span></label>
            <label>Páginas<input name="pages" type="number" min="1" value="${p.pages}"></label>
          </div>
        </div>
        <div class="pe-sec">
          <p class="pe-sec-t">Checkout na Cakto <span>o botão Comprar leva para o link; sem link, o guia mostra a lista de espera</span></p>
          <div class="pe-row2">
            ${['pt', 'en'].map(l => { const v = (p.checkout || {})[l] || ''; return `<label><span>Link ${l.toUpperCase()}${l === 'en' ? ' <small>· opcional</small>' : ''}</span><span class="pe-link"><input name="checkout${l === 'pt' ? 'Pt' : 'En'}" type="url" value="${esc(v)}" placeholder="https://pay.cakto.com.br/..."><a class="pe-open${v ? '' : ' off'}" href="${esc(v || '#')}" target="_blank" rel="noopener" title="Testar o link">↗</a></span></label>`; }).join('')}
          </div>
          <details class="pe-adv"${(p.cakto || []).length ? ' open' : ''}><summary>Avançado: IDs extras na Cakto</summary>
            <label><span>IDs de produto ou oferta <small>· só se precisar liberar este guia por outra oferta (combo, order bump). Use <code>id:en</code> para entregar em inglês.</small></span><input name="cakto" value="${esc((p.cakto || []).join(', '))}" placeholder="ex.: 8f2a1c, combo-colecao"></label>
          </details>
        </div>
        <div class="pe-sec">
          <p class="pe-sec-t">Arquivos</p>
          <div class="pe-files">${fileBtn(p, 'pt')}${fileBtn(p, 'en')}<button class="btn primary" type="submit">Salvar</button></div>
        </div>
      </div>
    </form>`).join('');
  }
  // o botão ↗ acompanha o link digitado
  $('#product-editor').addEventListener('input', e => {
    const box = e.target.closest('.pe-link'); if (!box) return;
    const v = e.target.value.trim(), a = $('.pe-open', box);
    a.href = /^https:\/\//.test(v) ? v : '#'; a.classList.toggle('off', !/^https:\/\//.test(v));
  });
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
      <label class="span2">Imagem por URL (https)<input name="image" value="${esc(a.image || '')}" placeholder="opcional: sem foto, o site busca a do anúncio sozinho"></label>
    </div>`;
  }
  function affPayload(f) {
    return { store: f.store.value, category: f.category.value, icon: f.icon.value, order: f.order.value === '' ? undefined : Number(f.order.value), url: f.url.value, source: f.source.value, image: f.image.value,
      title: { pt: f.title_pt.value, en: f.title_en.value }, note: { pt: f.note_pt.value, en: f.note_en.value }, active: f.active ? f.active.checked : true };
  }
  const imgBtn = has => `<label class="file-btn${has ? ' has-file' : ''}"><input type="file" name="img" accept="image/jpeg,image/png,image/webp"><span class="fb-lang">IMG</span><span class="fb-text"><b>${has ? 'Foto enviada' : 'Enviar foto'}</b><small>${has ? 'trocar foto' : 'JPG, PNG ou WEBP até 4 MB'}</small></span>${upIcon}</label>`;
  // De onde vem a foto do cartão: enviada > link manual > automática > ícone
  function photoStatus(a) {
    if (a.imageFile) return '<span class="pill pill-paid">Foto enviada</span>';
    if (a.image) return '<span class="pill pill-paid">Foto por link</span>';
    if (a.autoImage) return `<span class="pill pill-available">Foto automática</span> <span class="muted">do anúncio, ${dt(a.autoImageAt)}</span>`;
    return `<span class="pill pill-hidden">Ícone</span> <span class="muted">${a.autoImageErr ? 'não achei a foto: ' + esc(a.autoImageErr) : 'buscando a foto do anúncio…'}</span>`;
  }
  // miniatura quebrada: mostra o ícone
  document.addEventListener('error', e => { if (e.target.matches && e.target.matches('img[data-thumb]')) { e.target.parentNode.classList.add('is-ico'); e.target.remove(); } }, true);
  const photoToast = p => { if (p && p.ok === false) toast('Foto: ' + p.error + '. O site usa o ícone.', true); else if (p && p.ok) toast('Foto do anúncio encontrada.'); };
  async function loadAff() {
    const list = await api('/api/admin/affiliates');
    $('#aff-new').innerHTML = affFields() + `<div class="pe-files"><label class="toggle"><input type="checkbox" name="active" checked> Ativo no site</label><button class="btn primary" type="submit">Adicionar</button></div>`;
    $('#aff-list').innerHTML = list.length ? list.map(a => `<form class="pe-card aff-admin" data-id="${a.id}">
      <div class="aff-thumb${a.imageFile || a.image || a.autoImage ? '' : ' is-ico'}">${a.imageFile ? `<img src="/media/${a.imageFile}" alt="" data-thumb>` : a.image ? `<img src="${esc(a.image)}" alt="" referrerpolicy="no-referrer" data-thumb>` : a.autoImage ? `<img src="/media/${a.autoImage}" alt="" data-thumb>` : ''}${a.iconSvg || ''}</div>
      <div class="pe-main">
        <div class="pe-head"><div class="pe-title"><b>${esc(a.title.pt)}</b><span>${a.store === 'amazon' ? 'Amazon' : 'Mercado Livre'} · ${catName[a.category] || ''} · <a href="/r/${a.id}" target="_blank" rel="noopener">/r/${a.id}</a></span></div>
          <span class="clicks"><b>${nf.format(a.clicks30)}</b> cliques em 30 dias · ${nf.format(a.clicks)} no total</span>
          <span class="pill ${a.active ? 'pill-available' : 'pill-hidden'}">${a.active ? 'Ativo' : 'Oculto'}</span></div>
        <p class="aff-photo-status">${photoStatus(a)} <button class="btn-sm" type="button" data-autoimg="${a.id}">${a.autoImage ? 'Buscar foto de novo' : 'Buscar foto do anúncio'}</button></p>
        <details><summary>Editar</summary>${affFields(a)}</details>
        <div class="pe-files">${imgBtn(!!a.imageFile)}<label class="toggle"><input type="checkbox" name="active"${a.active ? ' checked' : ''}> Ativo no site</label>
          <button class="btn-sm danger" type="button" data-del="${a.id}">Excluir</button><button class="btn primary" type="submit">Salvar</button></div>
      </div>
    </form>`).join('') : '<p class="empty">Nenhuma recomendação ainda.</p>';
  }
  $('#aff-new').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type=submit]', e.target); btn.disabled = true; btn.textContent = 'Buscando foto…';
    try { const r = await api('/api/admin/affiliates', { method: 'POST', body: JSON.stringify(affPayload(e.target)) }); toast('Recomendação adicionada.'); photoToast(r.photo); loadAff(); }
    catch (err) { toast(err.error === 'host' ? 'Use um link do Mercado Livre ou da Amazon.' : 'Preencha o link e o título.', true); }
    finally { btn.disabled = false; btn.textContent = 'Adicionar'; }
  });
  $('#aff-list').addEventListener('change', e => {
    const inp = e.target.closest('.file-btn input'); if (!inp || !inp.files[0]) return;
    const lab = inp.closest('.file-btn'); lab.classList.add('is-picked'); $('b', lab).textContent = inp.files[0].name.slice(0, 24); $('small', lab).textContent = 'clique em Salvar';
  });
  $('#aff-list').addEventListener('click', async e => {
    const ai = e.target.closest('[data-autoimg]');
    if (ai) {
      ai.disabled = true; ai.textContent = 'Buscando…';
      try { const r = await api(`/api/admin/affiliates/${ai.dataset.autoimg}/auto-image`, { method: 'POST' }); photoToast(r); } catch (err) { toast(err.message, true); }
      return loadAff();
    }
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
      const r = await api('/api/admin/affiliates/' + id, { method: 'PUT', body: JSON.stringify(affPayload(f)) });
      toast('Recomendação salva.'); photoToast(r.photo); loadAff();
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
          <p class="hint">No produto da Cakto, em <b>Entrega → Acesso por e-mail</b>, use o link da página de receber (abaixo). Esse link é o mesmo para todos e não abre nada sozinho: o cliente informa o e-mail da compra e recebe um código de 6 dígitos (e um botão de entrada). Se o e-mail não chegar, confirma com os 4 últimos dígitos do celular informado na compra. Cada aparelho entra uma vez e fica conectado. Até 5 aparelhos por e-mail (MAX_DEVICES).</p>
          <p class="sub-h">Português</p>${copy(i.receive.pt)}<p class="sub-h">English</p>${copy(i.receive.en)}
        </div>
        <div class="card"><div class="card-head"><h2>3 · Ligar guias aos produtos</h2></div>
          <p class="hint">Em <b>Produtos</b>, preencha "IDs na Cakto" de cada guia com o ID do produto ou da oferta. Um combo pode liberar vários guias: coloque o mesmo ID em cada um. Para vender a versão em inglês, crie uma oferta separada e use <code>id:en</code>. Vendas sem guia ligado aparecem no registro abaixo com o ID para copiar.</p>
        </div>
        <div class="card"><div class="card-head"><h2>4 · E-mail automático (opcional)</h2>${ok(i.mail)}</div>
          <p class="hint">Com <code>RESEND_API_KEY</code> e <code>MAIL_FROM</code> no <code>.env</code>, o cliente recebe um link de entrada (uso único) no idioma da compra assim que o pagamento é aprovado, e a página de receber passa a funcionar só com o e-mail. Sem isso, a entrada é pelo e-mail + 4 últimos dígitos do celular da compra.${i.mailFrom ? ` Remetente: <b>${esc(i.mailFrom)}</b>.` : ''}</p>
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

  // ---------- avaliações ----------
  let reviewsData = [];
  const rvStatus = { pending: 'Em análise', approved: 'Publicada', rejected: 'Recusada' };
  const rvPill = { pending: 'pill-pending', approved: 'pill-paid', rejected: 'pill-refunded' };
  const starTxt = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  async function loadReviews(countOnly) {
    reviewsData = await api('/api/admin/reviews');
    setCount('reviews', reviewsData.filter(r => r.status === 'pending').length);
    if (!countOnly) renderReviews();
  }
  function renderReviews() {
    const f = $('#review-filter').value;
    const list = reviewsData.filter(r => !f || r.status === f);
    $('#review-list').innerHTML = list.length ? list.map(r => `<article class="rv-item" data-id="${r.id}">
      <header class="rv-top"><strong>${esc(r.title)}</strong> <span class="pill ${rvPill[r.status]}">${rvStatus[r.status]}</span>${r.test ? ' <span class="pill">Teste</span>' : ''}${r.edited ? ' <span class="pill">Editada</span>' : ''}${r.buyer ? '' : ' <span class="pill pill-refunded" title="O e-mail não tem mais compra paga deste guia">Sem compra ativa</span>'}</header>
      <p class="rv-stars" title="${r.rating}/5">${starTxt(r.rating)} <span class="muted">${r.rating}/5</span></p>
      <p class="rv-who"><b>${esc(r.name)}</b> · ${esc(r.email)} · ${r.lang.toUpperCase()} · enviada ${dt(r.createdAt)}${r.updatedAt !== r.createdAt ? ' · editada ' + dt(r.updatedAt) : ''}</p>
      <p class="rv-text">${esc(r.text)}</p>
      ${r.rejectReason ? `<p class="hint">Motivo da recusa: ${esc(r.rejectReason)}</p>` : ''}
      <p class="hint">Edições usadas: ${r.edits} de ${r.max} · ${r.ups} ${r.ups === 1 ? 'pessoa achou útil' : 'pessoas acharam útil'}</p>
      <div class="rv-actions">
        ${r.status !== 'approved' ? '<button class="btn-sm primary" data-rv="approve">Aprovar e publicar</button>' : ''}
        ${r.status !== 'rejected' ? '<button class="btn-sm" data-rv="reject-open">Recusar…</button>' : ''}
        <button class="btn-sm" data-rv="reset"${r.edits ? '' : ' disabled'} title="Devolve as 2 edições ao cliente">Zerar edições</button>
        <button class="btn-sm danger" data-rv="delete">Excluir</button>
      </div>
      <form class="rv-reject" hidden>
        <label>Motivo (vai no e-mail para o cliente)<textarea name="reason" rows="2" maxlength="400" placeholder="Ex.: o comentário cita outra loja / tem um link / fala de outro produto."></textarea></label>
        <div class="rv-actions"><button class="btn-sm primary" type="submit">Recusar e enviar e-mail</button><button class="btn-sm" type="button" data-rv="reject-cancel">Cancelar</button></div>
      </form>
    </article>`).join('') : '<p class="empty">Nenhuma avaliação neste filtro.</p>';
  }
  const mailNote = m => m === 'sent' ? ' E-mail enviado ao cliente.' : m === 'disabled' ? ' (envio de e-mail desligado)' : m && m.startsWith('error') ? ' Falha no e-mail: ' + m.slice(7) : '';
  $('#review-filter').addEventListener('change', renderReviews);
  $('#review-list').addEventListener('click', async e => {
    const b = e.target.closest('[data-rv]'); if (!b) return;
    const item = b.closest('.rv-item'), id = item.dataset.id, act = b.dataset.rv;
    if (act === 'reject-open') { $('.rv-reject', item).hidden = false; $('textarea', item).focus(); return; }
    if (act === 'reject-cancel') { $('.rv-reject', item).hidden = true; return; }
    if (act === 'delete' && !confirmDelete()) return;
    b.disabled = true;
    try {
      if (act === 'delete') { await api('/api/admin/reviews/' + id, { method: 'DELETE' }); toast('Avaliação excluída.'); }
      else { const r = await api(`/api/admin/reviews/${id}/${act}`, { method: 'POST', body: '{}' }); toast((act === 'approve' ? 'Publicada no site.' : 'Edições zeradas: o cliente pode editar de novo.') + mailNote(r.mail)); }
      await loadReviews();
    } catch (err) { toast('Não deu certo: ' + err.message, true); b.disabled = false; }
  });
  function confirmDelete() { return window.confirm('Excluir esta avaliação de vez? O cliente poderá escrever outra.'); }
  $('#review-list').addEventListener('submit', async e => {
    e.preventDefault();
    const item = e.target.closest('.rv-item'), btn = $('button[type=submit]', e.target);
    btn.disabled = true;
    try {
      const r = await api(`/api/admin/reviews/${item.dataset.id}/reject`, { method: 'POST', body: JSON.stringify({ reason: e.target.reason.value }) });
      toast('Recusada.' + mailNote(r.mail)); await loadReviews();
    } catch (err) { toast('Não deu certo: ' + err.message, true); btn.disabled = false; }
  });

  // ---------- visão geral: alertas e tarefas ----------
  async function loadTasks() {
    const el = $('#tasks');
    const t = await api('/api/admin/tasks');
    el.hidden = !t.length;
    el.innerHTML = `<div class="card-head"><h2>Alertas e tarefas</h2></div><ul class="tasks">${t.map(x => `<li class="task task-${x.level}"><button type="button" data-go="${x.tab}"><b>${nf.format(x.n)}</b> ${esc(x.label)} <span aria-hidden="true">→</span></button></li>`).join('')}</ul>`;
  }
  $('#tasks').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) openTab(b.dataset.go); });

  // ---------- campanhas (Meta Ads) ----------
  let camp = null;
  const money = (v, cur = 'BRL') => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur || 'BRL' }).format(Number(v) || 0);
  const campStatus = { ACTIVE: 'Ativa', PAUSED: 'Pausada', DELETED: 'Excluída', ARCHIVED: 'Arquivada', IN_PROCESS: 'Em análise', WITH_ISSUES: 'Com problema', CAMPAIGN_PAUSED: 'Pausada', ADSET_PAUSED: 'Conjunto pausado', PENDING_REVIEW: 'Em revisão', DISAPPROVED: 'Reprovada' };
  async function loadCampaigns() {
    camp = await api('/api/admin/campaigns?days=' + days);
    const c = camp, el = $('#campaigns'), canEdit = allowed('campaigns.edit');
    const setup = `<div class="card"><div class="card-head"><h2>Conectar o Meta Ads</h2><span class="pill pill-pending">Não conectado</span></div>
      <ol class="steps-admin">
        <li>No <b>Gerenciador de Negócios da Meta</b> (business.facebook.com), em Usuários → Usuários do sistema, crie um usuário do sistema e dê acesso à sua conta de anúncios.</li>
        <li>Gere um token para ele com as permissões <code>ads_read</code> e <code>ads_management</code>.</li>
        <li>No <code>.env</code> da VPS, adicione <code>META_ACCESS_TOKEN=</code> (o token) e <code>META_AD_ACCOUNT_ID=</code> (só os números da conta, sem "act_"). Opcional: <code>META_APP_SECRET</code>, <code>META_PIXEL_ID</code> e <code>META_CAPI_TOKEN</code>.</li>
        <li>Reinicie o site (<code>sudo systemctl restart botanora</code>). Os números aparecem aqui.</li>
      </ol>
      <p class="hint">O token fica só no servidor e nunca vai para o navegador.</p></div>`;
    const flags = `<div class="flags"><span class="pill ${c.connected ? 'pill-paid' : 'pill-pending'}">Marketing API ${c.connected ? 'conectada · ' + esc(c.account) : 'não conectada'}</span><span class="pill ${c.pixel ? 'pill-paid' : 'pill-cancelled'}">Pixel ${c.pixel ? 'ativo (com consentimento)' : 'não configurado'}</span><span class="pill ${c.capi ? 'pill-paid' : 'pill-cancelled'}">Conversions API ${c.capi ? 'ativa: compras validadas pela Cakto' : 'desligada'}</span><span class="pill">API ${esc(c.version)}</span></div>`;
    let metaHtml = '';
    if (c.connected && c.error) metaHtml = `<div class="card"><div class="card-head"><h2>Meta Ads</h2><span class="pill pill-refunded">Erro</span></div><p class="hint">A Meta respondeu: <b>${esc(c.error)}</b>${c.errorCode === 190 ? ' (token expirado ou sem permissão: gere um novo token)' : ''}</p><button class="btn-sm" data-camp-refresh>Tentar de novo</button></div>`;
    else if (c.meta) {
      const m = c.meta, cur = m.account.currency, tt = m.totals;
      metaHtml = `<div class="kpis kpis-6">${[['Investido', money(tt.spend, cur)], ['Impressões', nf.format(tt.impressions)], ['Cliques no link', nf.format(tt.clicks)], ['CPC médio', tt.clicks ? money(tt.spend / tt.clicks, cur) : '-'], ['Compras (Meta)', nf.format(tt.purchases)], ['ROAS (Meta)', tt.spend ? (tt.value / tt.spend).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '×' : '-']].map(([l, v]) => `<div class="kpi"><span class="kpi-label">${l}</span><div class="kpi-value">${v}</div></div>`).join('')}</div>
      <div class="card"><div class="card-head"><h2>Campanhas · ${esc(m.account.name)}</h2><span class="hint">Atualizado ${dt(m.fetchedAt)} · <button class="link-btn" data-camp-refresh>atualizar agora</button></span></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Campanha</th><th>Status</th><th class="num">Orçamento/dia</th><th class="num">Investido</th><th class="num">Cliques</th><th class="num">CTR</th><th class="num">CPC</th><th class="num">Compras</th><th class="num">ROAS</th>${canEdit ? '<th></th>' : ''}</tr></thead><tbody>
      ${m.rows.length ? m.rows.map(r => `<tr data-camp="${r.id}" data-name="${esc(r.name)}"><td data-l="Campanha"><b>${esc(r.name)}</b><br><small class="muted">${esc(r.objective || '')}</small></td>
        <td data-l="Status"><span class="pill ${r.effective === 'ACTIVE' ? 'pill-paid' : 'pill-pending'}">${esc(campStatus[r.effective] || r.effective)}</span></td>
        <td class="num" data-l="Orçamento/dia">${r.dailyBudget ? money(r.dailyBudget / 100, cur) : r.lifetimeBudget ? 'total ' + money(r.lifetimeBudget / 100, cur) : '-'}</td>
        <td class="num" data-l="Investido">${money(r.spend, cur)}</td><td class="num" data-l="Cliques">${nf.format(r.clicks)}</td><td class="num" data-l="CTR">${r.ctr.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</td>
        <td class="num" data-l="CPC">${r.cpc ? money(r.cpc, cur) : '-'}</td><td class="num" data-l="Compras">${nf.format(r.purchases)}</td><td class="num" data-l="ROAS">${r.roas ? r.roas.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '×' : '-'}</td>
        ${canEdit ? `<td data-l="Ações" class="row-actions">${['ACTIVE', 'PAUSED'].includes(r.status) ? `<button class="btn-sm" data-camp-status="${r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'}">${r.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}</button>` : ''}${r.dailyBudget ? `<button class="btn-sm" data-camp-budget="${r.dailyBudget}">Orçamento</button>` : ''}</td>` : ''}</tr>`).join('') : `<tr><td class="empty" colspan="10">Nenhuma campanha na conta.</td></tr>`}
      </tbody></table></div>
      <p class="hint">Compras e ROAS da Meta dependem do Pixel/Conversions API. A coluna de vendas reais está em "Origem das vendas no site", logo abaixo.</p></div>`;
    }
    const site = `<div class="card"><div class="card-head"><h2>Origem das vendas no site</h2><p class="hint">Visitas que chegaram com <code>utm_campaign</code> e vendas validadas pela notificação oficial da Cakto. O site repassa as UTMs para o checkout da Cakto automaticamente.</p></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Campanha (utm_campaign)</th><th>Fonte</th><th class="num">Visitas</th><th class="num">Pessoas</th><th class="num">Vendas</th><th class="num">Receita</th></tr></thead><tbody>
      ${c.site.length ? c.site.map(r => `<tr><td data-l="Campanha"><b>${esc(r.campaign)}</b></td><td data-l="Fonte">${esc(r.source || '-')}</td><td class="num" data-l="Visitas">${nf.format(r.visits)}</td><td class="num" data-l="Pessoas">${nf.format(r.people)}</td><td class="num" data-l="Vendas">${nf.format(r.orders)}</td><td class="num" data-l="Receita">${brl(r.revenue)}</td></tr>`).join('') : '<tr><td class="empty" colspan="6">Nenhuma visita com utm_campaign no período. Use o gerador abaixo nos anúncios.</td></tr>'}
      </tbody></table></div></div>`;
    const pages = [['/pt', 'Home (PT)'], ['/en', 'Home (EN)'], ['/pt/loja', 'Loja'], ['/pt/receitas', 'Receitas'], ['/pt/quiz', 'Quiz'], ...c.products.map(p => ['/pt/loja/' + p.slug, 'Guia: ' + p.title])];
    const utm = `<div class="card"><div class="card-head"><h2>Gerar link de campanha</h2><p class="hint">Use este link no anúncio. A campanha aparece na tabela acima quando alguém visitar ou comprar.</p></div>
      <form class="aff-form utm-form" id="utm-form">
        <label>Página<span class="select"><select name="page">${pages.map(([u, l]) => `<option value="${esc(u)}">${esc(l)}</option>`).join('')}</select></span></label>
        <label>Nome da campanha<input name="campaign" placeholder="ex.: matcha-outubro" required></label>
        <label>Anúncio/criativo (opcional)<input name="content" placeholder="ex.: video-15s"></label>
        <label>Fonte<span class="select"><select name="source"><option value="meta">Meta (Facebook/Instagram)</option><option value="instagram">Instagram orgânico</option><option value="google">Google</option><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option></select></span></label>
        <div class="utm-out"><input name="out" readonly placeholder="O link aparece aqui"><button class="btn-sm primary" type="submit">Gerar e copiar</button></div>
      </form></div>`;
    el.innerHTML = flags + (c.connected ? metaHtml : setup) + site + utm;
  }
  const slugU = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  $('#campaigns').addEventListener('submit', async e => {
    if (e.target.id !== 'utm-form') return;
    e.preventDefault();
    const f = e.target, u = new URL(f.page.value, camp.siteUrl);
    const medium = { meta: 'paid_social', instagram: 'social', google: 'cpc', email: 'email', whatsapp: 'social' }[f.source.value];
    u.searchParams.set('utm_source', f.source.value); u.searchParams.set('utm_medium', medium); u.searchParams.set('utm_campaign', slugU(f.campaign.value));
    if (f.content.value) u.searchParams.set('utm_content', slugU(f.content.value));
    f.out.value = u.toString();
    try { await navigator.clipboard.writeText(f.out.value); toast('Link copiado.'); } catch (_) { f.out.select(); }
  });
  $('#campaigns').addEventListener('click', async e => {
    if (e.target.closest('[data-camp-refresh]')) { await api('/api/admin/campaigns/refresh', { method: 'POST', body: '{}' }); return loadCampaigns(); }
    const row = e.target.closest('[data-camp]'); if (!row) return;
    const st = e.target.closest('[data-camp-status]'), bg = e.target.closest('[data-camp-budget]');
    let body;
    if (st) { if (!confirm(`${st.dataset.campStatus === 'PAUSED' ? 'Pausar' : 'Ativar'} a campanha "${row.dataset.name}" na Meta?`)) return; body = { status: st.dataset.campStatus }; }
    else if (bg) { const v = prompt(`Novo orçamento diário para "${row.dataset.name}" (em reais):`, (Number(bg.dataset.campBudget) / 100).toFixed(2).replace('.', ',')); if (v === null) return; const n = Math.round(Number(String(v).replace(/\./g, '').replace(',', '.')) * 100); if (!(n >= 100)) return toast('Valor inválido.', true); body = { dailyBudget: n }; }
    else return;
    body.name = row.dataset.name;
    try { await api('/api/admin/campaigns/' + row.dataset.camp, { method: 'POST', body: JSON.stringify(body) }); toast('Alteração enviada para a Meta.'); loadCampaigns(); }
    catch (err) { toast(err.need ? 'Sem permissão para mudar campanhas.' : 'A Meta recusou: ' + err.message, true); }
  });

  // ---------- chá do dia ----------
  let dailyData = null;
  const periodName = { morning: 'Manhã', afternoon: 'Tarde', night: 'Noite' };
  const seasonName = { verao: 'verão', outono: 'outono', inverno: 'inverno', primavera: 'primavera' };
  async function loadDaily() {
    dailyData = await api('/api/admin/daily?days=14');
    const d = dailyData, teaName = Object.fromEntries(d.teas.map(t => [t.id, t.name]));
    $('#daily').innerHTML = `<div class="card"><div class="card-head"><h2>Chá do dia: próximos 14 dias</h2><p class="hint">A escolha é automática (momento do dia, estação no Brasil, dia útil ou fim de semana e variedade em relação aos dias anteriores) e aparece na home. À noite só entram chás sem cafeína. Troque o chá, a receita ou escreva uma nota quando quiser; "Automático" volta para a análise.</p></div>
      <div class="daily-admin">${d.days.map(day => {
        const dl = new Date(day.key + 'T12:00:00Z').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'UTC' });
        return `<div class="day${day.key === d.today ? ' is-today' : ''}"><h3>${esc(dl)}${day.key === d.today ? ' · hoje' : ''} <small>${seasonName[day.season]}${day.weekend ? ' · fim de semana' : ''}</small></h3>
        ${['morning', 'afternoon', 'night'].map(per => { const x = day.periods[per]; return `<form class="day-row" data-day="${day.key}" data-period="${per}">
          <span class="day-per">${periodName[per]}</span>
          <span class="select"><select name="tea" aria-label="Chá"><option value="">Automático: ${esc(teaName[x.autoTea])}</option>${d.teas.filter(t => per !== 'night' || t.caffeineFree).map(t => `<option value="${t.id}"${x.manual && x.tea === t.id ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select></span>
          <span class="select"><select name="recipe" aria-label="Receita"><option value="">Receita automática${x.recipe && !x.manual ? ': ' + esc(x.recipe.name) : ''}</option>${d.recipes.filter(r => per !== 'night' || !r.caffeine).map(r => `<option value="${esc(r.slug)}"${x.recipe && x.recipe.slugPt === r.slug && x.manual ? ' selected' : ''}>${esc(r.name)}${r.iced ? ' (gelada)' : ''}</option>`).join('')}</select></span>
          <input name="notePt" placeholder="Nota (opcional)" maxlength="200" value="${esc(x.note || '')}">
          <button class="btn-sm" type="submit">Salvar</button>
        </form>`; }).join('')}</div>`;
      }).join('')}</div></div>`;
  }
  $('#daily').addEventListener('submit', async e => {
    const f = e.target.closest('form[data-day]'); if (!f) return;
    e.preventDefault();
    try { await api(`/api/admin/daily/${f.dataset.day}/${f.dataset.period}`, { method: 'PUT', body: JSON.stringify({ tea: f.tea.value, recipe: f.recipe.value, notePt: f.notePt.value }) }); toast('Chá do dia salvo.'); loadDaily(); }
    catch (err) { toast(err.message === 'night_caffeine' ? 'À noite só chás sem cafeína.' : 'Não deu certo: ' + err.message, true); }
  });

  // ---------- banco de receitas ----------
  let bank = null, bankFilter = 'draft';
  const styleName = { hot: 'Quente', iced: 'Gelada', latte: 'Latte' };
  async function loadRecipes() {
    bank = await api('/api/admin/recipes');
    const canPub = allowed('content.publish');
    const list = bank.items.filter(d => d.status === bankFilter);
    $('#recipes').innerHTML = `<div class="card"><div class="card-head"><h2>Banco de receitas não publicadas</h2>
        <button class="btn-sm primary" data-rb-gen>Gerar mais 3 rascunhos</button>
        <p class="hint">Os rascunhos nascem da análise de ${nf.format(bank.analysed)} receitas (guias em PDF e site): o sistema procura ingredientes que aparecem juntos e monta combinações novas, que não existem em nenhum guia. Todo dia entram novos rascunhos até manter 20 na fila. <b>Prepare antes de publicar</b>: ajuste medidas e texto, marque como testada e publique na hora ou agende.</p></div>
      <div class="chip-row rb-filter">${[['draft', 'Rascunhos'], ['published', 'Publicadas'], ['discarded', 'Descartadas']].map(([k, l]) => `<button class="btn-sm${k === bankFilter ? ' primary' : ''}" data-rb-filter="${k}">${l} (${bank.counts[k]})</button>`).join('')}</div>
      <div class="review-admin">${list.length ? list.map(d => { const r = d.recipe; return `<article class="rv-item rb-item" data-rb="${d.id}">
        <header class="rv-top"><strong>${esc(r.name.pt)}</strong> <span class="pill">${styleName[d.style] || d.style}</span>${r.caffeine ? '' : ' <span class="pill">Sem cafeína</span>'}${d.tested ? ' <span class="pill pill-paid">Testada</span>' : ''}${d.scheduledFor ? ` <span class="pill pill-pending">Agendada: ${esc(d.scheduledFor.split('-').reverse().join('/'))}</span>` : ''}</header>
        <p class="rv-who">${esc(r.name.en)} · ${esc(r.time.pt)} · ${esc(r.yield.pt)} · criada ${dt(d.createdAt)}${d.publishedAt ? ' · publicada ' + dt(d.publishedAt) : ''}</p>
        <p class="rv-text">${esc(r.tag.pt)}</p>
        <details class="rb-more"><summary>Ingredientes, preparo e de onde veio</summary>
          <ul>${r.ingredients.map(i => `<li>${esc(i.qty.pt)} ${esc(i.item.pt)}</li>`).join('')}</ul><ol>${r.steps.map(x => `<li>${esc(x.pt)}</li>`).join('')}</ol>
          <p class="hint">${d.basis.map(b => `<b>${esc(b.pair.join(' + '))}</b> aparecem juntos em ${b.count} receita(s): ${esc(b.examples.join('; '))}`).join('<br>')}</p>
        </details>
        <form class="rb-edit" hidden>
          <div class="grid-2f"><label>Nome (PT)<input name="name_pt" value="${esc(r.name.pt)}"></label><label>Nome (EN)<input name="name_en" value="${esc(r.name.en)}"></label>
          <label>Descrição (PT)<textarea name="tag_pt" rows="2">${esc(r.tag.pt)}</textarea></label><label>Descrição (EN)<textarea name="tag_en" rows="2">${esc(r.tag.en)}</textarea></label></div>
          <label>Ingredientes, um por linha: <code>qtd PT | item PT | qtd EN | item EN</code><textarea name="ingredients" rows="7">${esc(r.ingredients.map(i => [i.qty.pt, i.item.pt, i.qty.en, i.item.en].join(' | ')).join('\n'))}</textarea></label>
          <label>Preparo, um passo por linha: <code>PT || EN</code><textarea name="steps" rows="6">${esc(r.steps.map(x => x.pt + ' || ' + x.en).join('\n'))}</textarea></label>
          <div class="grid-2f"><label>Tempo (PT)<input name="time_pt" value="${esc(r.time.pt)}"></label><label>Dica (PT)<textarea name="tip_pt" rows="2">${esc((r.tip && r.tip.pt) || '')}</textarea></label></div>
          <label class="check"><input type="checkbox" name="tested"${d.tested ? ' checked' : ''}> Já preparei e aprovei esta receita</label>
          <div class="rv-actions"><button class="btn-sm primary" type="submit">Salvar</button><button class="btn-sm" type="button" data-rb="cancel">Cancelar</button></div>
        </form>
        <div class="rv-actions">
          <a class="btn-sm" href="/api/admin/recipes/${d.id}/preview?lang=pt" target="_blank" rel="noopener">Prévia PT ↗</a><a class="btn-sm" href="/api/admin/recipes/${d.id}/preview?lang=en" target="_blank" rel="noopener">Prévia EN ↗</a>
          ${d.status !== 'discarded' ? '<button class="btn-sm" data-rb="edit">Editar</button>' : ''}
          ${d.status === 'draft' && canPub ? `<button class="btn-sm primary" data-rb="publish">Publicar agora</button><label class="rb-sched">Agendar <input type="date" data-rb-date value="${esc(d.scheduledFor || '')}"></label>` : ''}
          ${d.status === 'published' && canPub ? `<a class="btn-sm" href="/pt/receitas/${esc(r.slug.pt)}" target="_blank" rel="noopener">Ver no site ↗</a><button class="btn-sm" data-rb="unpublish">Tirar do ar</button>` : ''}
          ${d.status === 'discarded' ? '<button class="btn-sm" data-rb="restore">Voltar para rascunhos</button>' : '<button class="btn-sm danger" data-rb="discard">Descartar</button>'}
        </div>
      </article>`; }).join('') : '<p class="empty">Nada aqui.</p>'}</div>`;
  }
  $('#recipes').addEventListener('click', async e => {
    if (e.target.closest('[data-rb-gen]')) { const r = await api('/api/admin/recipes/generate', { method: 'POST', body: JSON.stringify({ n: 3 }) }); toast(r.made ? `${r.made} rascunho(s) novo(s).` : 'Nenhuma combinação nova encontrada agora.'); return loadRecipes(); }
    const fb = e.target.closest('[data-rb-filter]'); if (fb) { bankFilter = fb.dataset.rbFilter; return loadRecipes(); }
    const b = e.target.closest('button[data-rb]'); if (!b) return;
    const item = b.closest('[data-rb]:not(button)'), id = item.dataset.rb, act = b.dataset.rb;
    if (act === 'edit') { $('.rb-edit', item).hidden = false; return; }
    if (act === 'cancel') { $('.rb-edit', item).hidden = true; return; }
    try {
      if (act === 'discard') { await api('/api/admin/recipes/' + id, { method: 'DELETE' }); toast('Descartada.'); }
      else if (act === 'restore') { await api('/api/admin/recipes/' + id + '/unpublish', { method: 'POST', body: '{}' }); toast('Voltou para os rascunhos.'); }
      else { const r = await api(`/api/admin/recipes/${id}/${act}`, { method: 'POST', body: '{}' }); toast(act === 'publish' ? 'Publicada no site.' : 'Tirada do ar.'); }
      loadRecipes();
    } catch (err) { toast(err.need ? 'Sem permissão para publicar receitas.' : err.message, true); }
  });
  $('#recipes').addEventListener('change', async e => {
    const inp = e.target.closest('[data-rb-date]'); if (!inp) return;
    const id = inp.closest('[data-rb]').dataset.rb;
    await api(`/api/admin/recipes/${id}/schedule`, { method: 'POST', body: JSON.stringify({ date: inp.value }) });
    toast(inp.value ? 'Agendada: publica sozinha nesse dia.' : 'Agendamento removido.'); loadRecipes();
  });
  $('#recipes').addEventListener('submit', async e => {
    const f = e.target.closest('.rb-edit'); if (!f) return;
    e.preventDefault();
    const id = f.closest('[data-rb]').dataset.rb, body = Object.fromEntries(new FormData(f).entries());
    body.tested = f.tested.checked;
    try { await api('/api/admin/recipes/' + id, { method: 'PUT', body: JSON.stringify(body) }); toast('Receita salva.'); loadRecipes(); } catch (err) { toast(err.message, true); }
  });

  // ---------- perguntas da comunidade ----------
  let qData = null;
  const qStatus = { pending: 'Para moderar', approved: 'Publicada', rejected: 'Recusada' };
  async function loadQuestions(countOnly) {
    qData = await api('/api/admin/questions');
    const pend = qData.items.filter(q => q.status === 'pending').length + qData.items.reduce((s, q) => s + q.answers.filter(a => a.status === 'pending').length, 0);
    setCount('questions', pend);
    if (countOnly) return;
    const f = $('#q-filter').value, canAns = allowed('community.answer');
    const list = qData.items.filter(q => !f || (f === 'pending' ? q.status === 'pending' || q.answers.some(a => a.status === 'pending') : f === 'unanswered' ? q.status === 'approved' && !q.answers.some(a => a.status === 'approved') : q.status === f));
    const ownerName = qData.owner.name;
    $('#q-list').innerHTML = list.length ? list.map(q => `<article class="rv-item" data-q="${q.id}">
      <header class="rv-top"><strong>${esc(q.guide || 'Assunto geral')}</strong> <span class="pill ${rvPill[q.status]}">${qStatus[q.status]}</span>${q.buyer ? ' <span class="pill pill-paid">Comprador</span>' : ''}${q.edited ? ' <span class="pill">Editada</span>' : ''}${q.ups ? ` <span class="pill">▲ ${q.ups}</span>` : ''}</header>
      <p class="rv-who"><b>${esc(q.name)}</b> · ${esc(q.email)} · ${q.lang.toUpperCase()} · ${dt(q.createdAt)}${q.url ? ` · <a href="${q.url}" target="_blank" rel="noopener">ver no site ↗</a>` : ''}</p>
      <p class="rv-text">${esc(q.text)}</p>
      ${q.rejectReason ? `<p class="hint">Motivo da recusa: ${esc(q.rejectReason)}</p>` : ''}
      <div class="rv-actions">
        ${q.status !== 'approved' ? '<button class="btn-sm primary" data-qa-act="approve">Aprovar e publicar</button>' : ''}
        ${q.status !== 'rejected' ? '<button class="btn-sm" data-qa-act="reject-open">Recusar…</button>' : ''}
        <button class="btn-sm danger" data-qa-act="delete">Excluir</button>
      </div>
      <form class="rv-reject" data-qa-reject hidden><label>Motivo (vai no e-mail, com um link para a pessoa editar)<textarea name="reason" rows="2" maxlength="400"></textarea></label><div class="rv-actions"><button class="btn-sm primary" type="submit">Recusar e enviar e-mail</button><button class="btn-sm" type="button" data-qa-act="reject-cancel">Cancelar</button></div></form>
      ${q.answers.length ? `<div class="qa-admin-answers">${q.answers.map(a => `<div class="qa-admin-answer" data-a="${a.id}">
        <p class="rv-who">${a.by === 'owner' ? `<b>${esc(ownerName)}</b> · Botânora` : `<b>${esc(a.name)}</b> · ${esc(a.email)} · comprador`} · ${dt(a.createdAt)} · <span class="pill ${rvPill[a.status]}">${qStatus[a.status] || a.status}</span>${a.ups ? ` · ▲ ${a.ups}` : ''}</p>
        <p class="rv-text">${esc(a.text)}</p>
        <div class="rv-actions">${a.status === 'pending' ? '<button class="btn-sm primary" data-a-act="approve">Aprovar</button><button class="btn-sm" data-a-act="reject">Recusar</button>' : ''}<button class="btn-sm danger" data-a-act="delete">Excluir</button></div>
      </div>`).join('')}</div>` : ''}
      ${q.status === 'approved' && canAns ? `<form class="qa-owner-answer" data-qa-answer><label>Responder como ${esc(ownerName)} (publica na hora, com sua foto e o selo da Botânora)<textarea name="text" rows="3" minlength="10"></textarea></label><button class="btn-sm primary" type="submit">Publicar resposta</button></form>` : ''}
    </article>`).join('') : '<p class="empty">Nada neste filtro.</p>';
  }
  $('#q-filter').addEventListener('change', () => loadQuestions());
  $('#q-list').addEventListener('click', async e => {
    const item = e.target.closest('[data-q]'); if (!item) return;
    const qid = item.dataset.q, b = e.target.closest('[data-qa-act],[data-a-act]'); if (!b) return;
    const mailNote2 = m => m === 'sent' ? ' E-mail enviado.' : m === 'disabled' ? ' (e-mail desligado)' : m && m.startsWith('error') ? ' Falha no e-mail.' : '';
    try {
      if (b.dataset.qaAct === 'reject-open') { $('[data-qa-reject]', item).hidden = false; return; }
      if (b.dataset.qaAct === 'reject-cancel') { $('[data-qa-reject]', item).hidden = true; return; }
      if (b.dataset.qaAct === 'delete') { if (!confirm('Excluir esta pergunta e as respostas?')) return; await api('/api/admin/questions/' + qid, { method: 'DELETE' }); toast('Excluída.'); }
      else if (b.dataset.qaAct === 'approve') { const r = await api(`/api/admin/questions/${qid}/approve`, { method: 'POST', body: '{}' }); toast('Publicada.' + mailNote2(r.mail)); }
      else if (b.dataset.aAct) {
        const aid = b.closest('[data-a]').dataset.a, act = b.dataset.aAct;
        if (act === 'delete') { if (!confirm('Excluir esta resposta?')) return; await api(`/api/admin/questions/${qid}/answers/${aid}`, { method: 'DELETE' }); toast('Resposta excluída.'); }
        else { const reason = act === 'reject' ? prompt('Motivo (vai no e-mail para quem respondeu):', '') : ''; if (reason === null) return; const r = await api(`/api/admin/questions/${qid}/answers/${aid}/${act}`, { method: 'POST', body: JSON.stringify({ reason }) }); toast((act === 'approve' ? 'Resposta publicada.' : 'Resposta recusada.') + mailNote2(r.mail)); }
      }
      loadQuestions();
    } catch (err) { toast('Não deu certo: ' + err.message, true); }
  });
  $('#q-list').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, qid = f.closest('[data-q]').dataset.q;
    try {
      if (f.matches('[data-qa-reject]')) { const r = await api(`/api/admin/questions/${qid}/reject`, { method: 'POST', body: JSON.stringify({ reason: f.reason.value }) }); toast('Recusada.' + (r.mail === 'sent' ? ' E-mail com link de edição enviado.' : '')); }
      else if (f.matches('[data-qa-answer]')) { const r = await api(`/api/admin/questions/${qid}/answer`, { method: 'POST', body: JSON.stringify({ text: f.text.value }) }); toast('Resposta publicada.' + (r.mail === 'sent' ? ' Quem perguntou recebeu um e-mail.' : '')); }
      loadQuestions();
    } catch (err) { toast(err.need ? 'Sem permissão para responder como Botânora.' : err.message, true); }
  });

  // ---------- usuários e permissões ----------
  let teamData = null;
  async function loadTeam() {
    teamData = await api('/api/admin/team/users');
    const P = teamData.perms, R = teamData.roles;
    const permBoxes = (sel, dis) => `<div class="perm-grid">${Object.entries(P).map(([k, l]) => `<label class="check"><input type="checkbox" name="perm" value="${k}"${sel.includes(k) ? ' checked' : ''}${dis ? ' disabled' : ''}> ${esc(l)}</label>`).join('')}</div>`;
    const roleSel = `<span class="select"><select data-role><option value="">Aplicar um modelo de permissões…</option>${Object.entries(R).map(([k, r]) => `<option value="${k}">${esc(r.label)}</option>`).join('')}</select></span>`;
    $('#team').innerHTML = `<div class="card"><div class="card-head"><h2>Usuários do painel</h2><p class="hint">O dono (usuário do .env) tem acesso total e não pode ser removido. Cada pessoa da equipe entra com usuário e senha próprios e só vê o que tem permissão. Desativar ou trocar a senha encerra as sessões abertas dessa pessoa. Tudo fica no Histórico.</p></div>
      <div class="review-admin">${teamData.users.map(u => `<article class="rv-item" data-user="${u.id}">
        <header class="rv-top"><strong>${esc(u.name)}</strong> <span class="pill">${esc(u.user)}</span>${u.owner ? ' <span class="pill pill-paid">Dono</span>' : u.active ? ' <span class="pill pill-paid">Ativo</span>' : ' <span class="pill pill-cancelled">Desativado</span>'}</header>
        <p class="rv-who">${u.owner ? 'Acesso total' : `${u.perms.length} permissões · último acesso ${u.lastLogin ? dt(u.lastLogin) : 'nunca'}`}</p>
        ${u.owner ? '' : `<form class="user-form">${roleSel}${permBoxes(u.perms)}
          <div class="grid-2f"><label>Nome<input name="name" value="${esc(u.name)}"></label><label>Nova senha (opcional, mínimo 10)<input name="pass" type="password" autocomplete="new-password"></label></div>
          <div class="rv-actions"><button class="btn-sm primary" type="submit">Salvar</button><button class="btn-sm" type="button" data-user-act="toggle">${u.active ? 'Desativar' : 'Reativar'}</button><button class="btn-sm danger" type="button" data-user-act="delete">Remover</button></div></form>`}
      </article>`).join('')}</div></div>
      <div class="card"><div class="card-head"><h2>Adicionar pessoa</h2></div>
      <form class="user-form" id="user-new">${roleSel}${permBoxes(R.moderacao.perms)}
        <div class="grid-3f"><label>Nome<input name="name" required></label><label>Usuário (letras, números, . _ -)<input name="user" required pattern="[A-Za-z0-9._-]{3,32}"></label><label>Senha (mínimo 10)<input name="pass" type="password" required minlength="10" autocomplete="new-password"></label></div>
        <button class="btn-sm primary" type="submit">Criar usuário</button></form></div>`;
  }
  const permsOf = f => $$('input[name=perm]:checked', f).map(x => x.value);
  $('#team').addEventListener('change', e => {
    const s = e.target.closest('[data-role]'); if (!s || !s.value) return;
    const f = s.closest('form'), perms = teamData.roles[s.value].perms;
    $$('input[name=perm]', f).forEach(x => { x.checked = perms.includes(x.value); });
  });
  $('#team').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    const errs = { user: 'Usuário inválido (3 a 32 letras, números, . _ -).', exists: 'Esse usuário já existe.', pass: 'A senha precisa de pelo menos 10 caracteres.' };
    try {
      if (f.id === 'user-new') { await api('/api/admin/team/users', { method: 'POST', body: JSON.stringify({ name: f.name.value, user: f.user.value, pass: f.pass.value, perms: permsOf(f) }) }); toast('Usuário criado.'); }
      else { const id = f.closest('[data-user]').dataset.user; await api('/api/admin/team/users/' + id, { method: 'PUT', body: JSON.stringify({ name: f.name.value, perms: permsOf(f), pass: f.pass.value }) }); toast('Usuário salvo.'); }
      loadTeam();
    } catch (err) { toast(errs[err.message] || err.message, true); }
  });
  $('#team').addEventListener('click', async e => {
    const b = e.target.closest('[data-user-act]'); if (!b) return;
    const id = b.closest('[data-user]').dataset.user, u = teamData.users.find(x => x.id === id);
    if (b.dataset.userAct === 'delete') { if (!confirm(`Remover ${u.name}?`)) return; await api('/api/admin/team/users/' + id, { method: 'DELETE' }); toast('Removido.'); }
    else { await api('/api/admin/team/users/' + id, { method: 'PUT', body: JSON.stringify({ active: !u.active }) }); toast(u.active ? 'Desativado: as sessões dessa pessoa foram encerradas.' : 'Reativado.'); }
    loadTeam();
  });

  // ---------- segurança e backups ----------
  async function loadSecurity() {
    const [sec, bks] = await Promise.all([api('/api/admin/team/security'), api('/api/admin/team/backups')]);
    $('#security').innerHTML = `<div class="card"><div class="card-head"><h2>Situação de segurança</h2></div>
      <ul class="checklist">${sec.checks.map(c => `<li class="${c.ok ? 'ok' : 'warn'}"><span aria-hidden="true">${c.ok ? '✓' : '!'}</span> ${esc(c.label)}</li>`).join('')}</ul>
      <p class="hint">Proteção dos PDFs: os arquivos ficam fora da pasta pública e só saem pela biblioteca, com o cookie do aparelho (até ${sec.maxDevices} aparelhos por e-mail) e limite de ${sec.maxDownloads} downloads por pedido. Pagamentos só liberam acesso com a notificação oficial da Cakto, conferida pela assinatura ou pela chave secreta do webhook.</p></div>
      <div class="card"><div class="card-head"><h2>Backups do banco de dados</h2><button class="btn-sm primary" data-backup-now>Fazer backup agora</button>
        <p class="hint">Um backup automático por dia (guarda os 14 mais recentes) em <code>data/backups</code> na VPS. Baixe e guarde uma cópia fora do servidor de vez em quando. O backup não inclui os PDFs (ficam em <code>data/pdfs</code>).</p></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Arquivo</th><th>Tipo</th><th>Data</th><th class="num">Tamanho</th><th></th></tr></thead><tbody>
      ${bks.length ? bks.map(b => `<tr><td data-l="Arquivo"><code>${esc(b.name)}</code></td><td data-l="Tipo">${b.kind === 'auto' ? 'Automático' : 'Manual'}</td><td data-l="Data">${dt(b.t)}</td><td class="num" data-l="Tamanho">${(b.size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KB</td><td><a class="btn-sm" href="/api/admin/team/backups/${encodeURIComponent(b.name)}">Baixar</a></td></tr>`).join('') : '<tr><td class="empty" colspan="5">Nenhum backup ainda.</td></tr>'}
      </tbody></table></div></div>`;
  }
  $('#security').addEventListener('click', async e => {
    if (!e.target.closest('[data-backup-now]')) return;
    const r = await api('/api/admin/team/backups', { method: 'POST', body: '{}' }); toast('Backup criado: ' + r.name); loadSecurity();
  });

  // ---------- histórico ----------
  async function loadHistory() {
    const q = ($('#hist-q') || {}).value || '';
    const list = await api('/api/admin/team/audit?n=400&q=' + encodeURIComponent(q));
    $('#history').innerHTML = `<div class="card"><div class="card-head"><h2>Histórico de alterações</h2>
      <input id="hist-q" class="hist-q" placeholder="Filtrar pela ação (ex.: Aprovou, Publicou, Alterou campanha)" value="${esc(q)}">
      <p class="hint">Cada alteração feita no painel (e cada entrada ou falha de login) fica registrada com quem fez, quando e o que mudou. Guarda as 3.000 mais recentes.</p></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Item</th><th>Detalhe</th></tr></thead><tbody>
      ${list.length ? list.map(x => `<tr class="${/Falha/.test(x.action) ? 'is-alert' : ''}"><td data-l="Quando">${dt(x.t)}</td><td data-l="Quem">${esc(x.name || x.by)}${x.ip ? ` <small class="muted">#${esc(x.ip)}</small>` : ''}</td><td data-l="Ação">${esc(x.action)}</td><td data-l="Item"><code>${esc(x.target)}</code></td><td data-l="Detalhe">${esc(x.detail)}</td></tr>`).join('') : '<tr><td class="empty" colspan="5">Nada registrado ainda.</td></tr>'}
      </tbody></table></div></div>`;
  }
  let histT;
  $('#history').addEventListener('input', e => { if (e.target.id !== 'hist-q') return; clearTimeout(histT); histT = setTimeout(async () => { await loadHistory(); const i = $('#hist-q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 400); });

  // ---------- perfil do dono ----------
  async function loadOwner() {
    const o = await api('/api/admin/owner');
    $('#owner').innerHTML = `<div class="card"><div class="card-head"><h2>Perfil do dono</h2><p class="hint">Aparece nas respostas da Botânora na comunidade: sua foto, o selo da Botânora e o nome abaixo.</p></div>
      <div class="owner-grid"><div class="owner-photo">${o.photo ? `<img src="/media/${esc(o.photo)}" alt="" width="120" height="120">` : '<span>Sem foto</span>'}<label class="btn-sm">Trocar foto<input type="file" accept="image/jpeg,image/png,image/webp" id="owner-file" hidden></label></div>
      <form id="owner-form" class="aff-form"><label>Nome que aparece<input name="name" value="${esc(o.name)}" maxlength="60"></label>
        <label>Cargo (PT)<input name="rolePt" value="${esc(o.role.pt)}" maxlength="60"></label><label>Cargo (EN)<input name="roleEn" value="${esc(o.role.en)}" maxlength="60"></label>
        <button class="btn-sm primary" type="submit">Salvar</button></form></div></div>`;
  }
  $('#owner').addEventListener('submit', async e => { e.preventDefault(); const f = e.target; await api('/api/admin/owner', { method: 'PUT', body: JSON.stringify({ name: f.name.value, rolePt: f.rolePt.value, roleEn: f.roleEn.value }) }); toast('Perfil salvo.'); });
  $('#owner').addEventListener('change', async e => {
    if (e.target.id !== 'owner-file' || !e.target.files[0]) return;
    const r = await fetch('/api/admin/owner/photo', { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: e.target.files[0] });
    if (!r.ok) return toast('Imagem inválida (use JPG, PNG ou WEBP até 3 MB).', true);
    toast('Foto atualizada.'); loadOwner();
  });

  // ---------- público ----------
  async function loadAudience() {
    const a = await api('/api/admin/audience');
    const names = Object.fromEntries((stats ? stats.products : []).map(p => [p.slug, p.title]));
    $('#subscribers').innerHTML = a.subscribers.length ? `<thead><tr><th>E-mail</th><th>Idioma</th><th>Origem</th><th>Data</th></tr></thead><tbody>${a.subscribers.map(s => `<tr><td data-l="E-mail">${esc(s.email)}</td><td data-l="Idioma">${s.lang.toUpperCase()}</td><td class="muted" data-l="Origem">${esc(s.source)}</td><td data-l="Data">${dt(s.createdAt)}</td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="empty">Nenhum inscrito ainda.</td></tr></tbody>';
    $('#waitlist').innerHTML = a.waitlist.length ? `<thead><tr><th>E-mail</th><th>Guia</th><th>Idioma</th><th>Data</th></tr></thead><tbody>${a.waitlist.map(s => `<tr><td data-l="E-mail">${esc(s.email)}</td><td data-l="Guia">${esc(names[s.product] || s.product)}</td><td data-l="Idioma">${s.lang.toUpperCase()}</td><td data-l="Data">${dt(s.createdAt)}</td></tr>`).join('')}</tbody>` : '<tbody><tr><td class="empty">Nenhum inscrito em listas de espera.</td></tr></tbody>';
  }

  // inicialização
  loadReports().catch(() => {});
  api('/api/admin/me').then(me => {
    ME = me; applyPerms();
    if (allowed('stats')) loadReports().catch(() => {});
    if (allowed('community')) { loadReviews(true).catch(() => {}); loadQuestions(true).catch(() => {}); }
    const h = location.hash.slice(1);
    const first = $('.sidenav [data-tab]:not([hidden])');
    const start = () => openTab($(`.sidenav [data-tab="${h}"]:not([hidden])`) ? h : (allowed('stats') ? 'overview' : first && first.dataset.tab));
    if (allowed('stats')) loadStats().then(start, start); else start();
  });
  // ---------- relatórios ----------
  const kindName = { geral: 'Visão geral', vendas: 'Vendas', completo: 'Completo' };
  async function loadReports() {
    const list = await api('/api/admin/reports');
    const html = list.length ? `<thead><tr><th>Gerado em</th><th>Relatório</th><th>Período</th><th class="num">Visitantes</th><th class="num">Vendas</th><th class="num">Receita</th><th></th></tr></thead><tbody>${list.map(r => `<tr>
      <td data-l="Gerado em">${dt(r.createdAt)}</td>
      <td data-l="Relatório">${esc(kindName[r.kind] || r.kind)}${r.reason === 'clear' ? ' <span class="pill pill-pending">antes de limpar</span>' : ''}</td>
      <td data-l="Período">${new Date(r.from).toLocaleDateString('pt-BR')} a ${new Date(r.to).toLocaleDateString('pt-BR')}</td>
      <td class="num" data-l="Visitantes">${nf.format(r.summary.visitors)}</td><td class="num" data-l="Vendas">${nf.format(r.summary.paid)}</td><td class="num" data-l="Receita">${brl(r.summary.revenue)}</td>
      <td><div class="row-actions"><a class="btn-sm" href="/api/admin/reports/${r.id}" target="_blank" rel="noopener">Abrir</a><a class="btn-sm" href="/api/admin/reports/${r.id}?download=1">Baixar</a><button class="btn-sm danger" type="button" data-report-del="${r.id}">Excluir</button></div></td>
    </tr>`).join('')}</tbody>` : '<tbody><tr><td class="empty">Nenhum relatório salvo ainda. Use "Gerar relatório do período".</td></tr></tbody>';
    $$('[data-report-list]').forEach(t => { t.innerHTML = html; });
  }
  document.addEventListener('click', async e => {
    const gen = e.target.closest('[data-report]');
    if (gen) {
      // abre a aba já no clique (senão o navegador bloqueia) e preenche quando o relatório fica pronto
      const w = window.open('about:blank', '_blank');
      gen.disabled = true;
      try {
        const r = await api('/api/admin/reports', { method: 'POST', body: JSON.stringify({ kind: gen.dataset.report, days }) });
        if (w) w.location = '/api/admin/reports/' + r.id;
        toast('Relatório salvo em Relatórios salvos.'); loadReports();
      } catch (err) { if (w) w.close(); toast('Não deu certo: ' + err.message, true); }
      finally { gen.disabled = false; }
      return;
    }
    const del = e.target.closest('[data-report-del]');
    if (del) {
      if (!confirm('Excluir este relatório?')) return;
      await api('/api/admin/reports/' + del.dataset.reportDel, { method: 'DELETE' }); toast('Relatório excluído.'); loadReports();
      return;
    }
    const clr = e.target.closest('[data-clear]');
    if (clr) {
      const f = $('#clear-form'); f.reset();
      f.events.checked = clr.dataset.clear === 'overview'; f.sales.checked = clr.dataset.clear === 'sales';
      $('#clear-dlg').showModal(); setTimeout(() => f.confirm.focus(), 50);
    }
  });
  $('#clear-dlg [data-close]').addEventListener('click', () => $('#clear-dlg').close());
  $('#clear-form').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, btn = $('button[type=submit]', f);
    if (!f.events.checked && !f.sales.checked) return toast('Marque o que deseja limpar.', true);
    if (f.confirm.value.trim().toUpperCase() !== 'LIMPAR') { f.confirm.focus(); return toast('Digite LIMPAR para confirmar.', true); }
    btn.disabled = true;
    try {
      const r = await api('/api/admin/clear', { method: 'POST', body: JSON.stringify({ events: f.events.checked, sales: f.sales.checked, confirm: 'LIMPAR' }) });
      $('#clear-dlg').close();
      const parts = [];
      if (f.events.checked) parts.push(`${nf.format(r.removed)} eventos apagados`);
      if (f.sales.checked) parts.push(`${nf.format(r.archived)} pedidos arquivados`);
      toast('Relatório salvo. ' + parts.join(', ') + '.');
      loadStats(); loadReports(); if (current() === 'sales') loadOrders();
    } catch (err) { toast('Não deu certo: ' + err.message, true); }
    finally { btn.disabled = false; }
  });

  // ---------- ao vivo ----------
  // O servidor avisa quando chega visita, venda, inscrição ou download; o painel recarrega o que está na tela.
  const liveEl = $('#live-sync');
  const current = () => document.body.dataset.tab || 'overview';
  let busy = false, again = false, lastKinds = new Set();
  async function refresh() {
    if (document.visibilityState !== 'visible') { again = true; return; }
    if (busy) { again = true; return; }
    busy = true;
    try {
      const tab = current();
      if (allowed('stats') && (tab === 'overview' || tab === 'sales' || lastKinds.has('ev'))) await loadStats();
      if (tab === 'sales' && lastKinds.has('db')) await loadOrders();
      if (tab === 'audience' && lastKinds.has('db')) await loadAudience();
      if (lastKinds.has('db') && allowed('community')) { await loadReviews(tab !== 'reviews'); await loadQuestions(tab !== 'questions'); }
      if (tab === 'overview' && lastKinds.has('db')) await loadTasks();
      lastKinds = new Set();
      liveEl.textContent = 'Ao vivo · ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      liveEl.classList.add('flash'); setTimeout(() => liveEl.classList.remove('flash'), 900);
    } catch (_) {} finally { busy = false; if (again) { again = false; setTimeout(refresh, 500); } }
  }
  let es = null, fallback = null;
  function connect() {
    if (!('EventSource' in window)) { fallback = setInterval(() => { lastKinds = new Set(['ev', 'db']); refresh(); }, 20000); return; }
    es = new EventSource('/api/admin/stream');
    es.addEventListener('change', e => { try { JSON.parse(e.data).forEach(k => lastKinds.add(k)); } catch (_) {} refresh(); });
    es.onopen = () => { liveEl.classList.remove('off'); if (fallback) { clearInterval(fallback); fallback = null; } };
    es.onerror = () => {
      liveEl.classList.add('off'); liveEl.textContent = 'Reconectando…';
      if (!fallback) fallback = setInterval(() => { lastKinds = new Set(['ev', 'db']); refresh(); }, 30000);
    };
  }
  connect();
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && again) { again = false; refresh(); } });
  // "agora no site" muda com o tempo mesmo sem eventos novos (quem sai deixa de contar)
  setInterval(() => { if (document.visibilityState === 'visible') api('/api/admin/stats?days=1').then(s => { $('#realtime').textContent = s.realtime; }).catch(() => {}); }, 60000);
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (stats) { lineChart($('#chart-traffic'), stats.series, ['visitors', 'pv'], s => `<b>${nf.format(s.visitors)}</b> visitantes · ${nf.format(s.pv)} visualizações`); barChart($('#chart-revenue'), stats.series, 'revenue', brl); } }, 200); });
})();
