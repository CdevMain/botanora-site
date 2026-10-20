/* Botânora: interações do site. Sem dependências. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const lang = document.body.dataset.lang || 'pt';
  const dataEl = $('#page-data');
  const DATA = dataEl ? JSON.parse(dataEl.textContent) : {};

  // ---------- cookies: Google Analytics e Microsoft Clarity só com consentimento ----------
  const CONSENT_KEY = 'botanora_consent';
  const gaId = document.body.dataset.ga, clarityId = document.body.dataset.clarity, pixelId = document.body.dataset.pixel;
  function getConsent() {
    try { const v = localStorage.getItem(CONSENT_KEY); if (v) return v; } catch (_) {}
    const m = document.cookie.match(/(?:^|; )consent=(all|necessary)/);
    return m ? m[1] : null;
  }
  function saveConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (_) {}
    document.cookie = `consent=${v}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  }
  let thirdPartyLoaded = false;
  function loadThirdParty() {
    if (thirdPartyLoaded) return;
    thirdPartyLoaded = true;
    if (gaId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', gaId);
      const s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
      document.head.appendChild(s);
    }
    if (clarityId) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', clarityId);
    }
    if (pixelId) {
      // Pixel da Meta: PageView, ViewContent (página do guia) e InitiateCheckout (clique em comprar). A compra vai pelo servidor (Conversions API)
      (function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', pixelId); window.fbq('track', 'PageView');
      const pv = document.querySelector('[data-product-view]');
      if (pv) window.fbq('track', 'ViewContent', { content_ids: [pv.dataset.productView], content_type: 'product', currency: 'BRL', value: Number(pv.dataset.price || 0) });
    }
  }
  function clearThirdPartyCookies() {
    const host = location.hostname, root = host.split('.').slice(-3).join('.');
    document.cookie.split('; ').map(c => c.split('=')[0]).filter(n => /^(_ga|_gid|_gat|_clck|_clsk|CLID|MUID|_fbp|_fbc)/.test(n)).forEach(n => {
      [host, '.' + host, '.' + root, '.' + host.split('.').slice(-2).join('.')].forEach(d => { document.cookie = `${n}=; Path=/; Max-Age=0; Domain=${d}`; });
      document.cookie = `${n}=; Path=/; Max-Age=0`;
    });
  }
  const banner = document.querySelector('[data-consent]');
  if (gaId || clarityId || pixelId) {
    const current = getConsent();
    if (current === 'all') loadThirdParty();
    else if (!current && banner) banner.hidden = false;
    document.querySelectorAll('[data-consent-choice]').forEach(b => b.addEventListener('click', () => {
      const v = b.dataset.consentChoice;
      const before = getConsent();
      saveConsent(v);
      if (banner) banner.hidden = true;
      if (v === 'all') loadThirdParty();
      else if (before === 'all') { clearThirdPartyCookies(); location.reload(); }
    }));
    document.querySelectorAll('[data-consent-open]').forEach(b => b.addEventListener('click', () => { if (banner) { banner.hidden = false; const f = banner.querySelector('button'); if (f) f.focus(); } }));
  }

  // ---------- origem da visita: repassa UTMs ao checkout da Cakto (para saber qual campanha vendeu) ----------
  const UTM_KEY = 'btn_utm';
  try {
    const q = new URLSearchParams(location.search), keep = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'].forEach(k => { if (q.get(k)) keep[k] = q.get(k).slice(0, 100); });
    if (Object.keys(keep).length) localStorage.setItem(UTM_KEY, JSON.stringify(Object.assign(keep, { t: Date.now() })));
  } catch (_) {}
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="pay.cakto.com.br"]');
    if (!a) return;
    try {
      const v = JSON.parse(localStorage.getItem(UTM_KEY) || 'null');
      if (window.fbq) window.fbq('track', 'InitiateCheckout', { content_ids: [a.dataset.product || ''], content_type: 'product', currency: 'BRL' });
      if (!v || Date.now() - v.t > 30 * 864e5) return; // vale por 30 dias
      const u = new URL(a.href);
      Object.entries(v).forEach(([k, val]) => { if (k !== 't' && !u.searchParams.has(k)) u.searchParams.set(k, val); });
      a.href = u.toString();
    } catch (_) {}
  }, true);

  // ---------- métricas ----------
  function track(name, props) {
    if (window.gtag && thirdPartyLoaded) { try { window.gtag('event', name, props || {}); } catch (_) {} }
    const body = JSON.stringify({ name, props: props || {}, path: location.pathname });
    try { navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' })); }
    catch (_) { fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {}); }
  }
  // tempo de engajamento (só conta com a aba visível)
  let visibleSince = document.visibilityState === 'visible' ? Date.now() : 0, engaged = 0, sent = false;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { if (visibleSince) engaged += Date.now() - visibleSince; visibleSince = 0; flushEngage(); }
    else { visibleSince = Date.now(); sent = false; }
  });
  window.addEventListener('pagehide', flushEngage);
  function flushEngage() {
    if (visibleSince) { engaged += Date.now() - visibleSince; visibleSince = Date.now(); }
    if (sent || engaged < 1000) return;
    sent = true;
    const body = JSON.stringify({ type: 'engage', path: location.pathname, ms: engaged });
    engaged = 0;
    try { navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' })); } catch (_) {}
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-event]');
    if (a) track(a.dataset.event, { to: a.getAttribute('href') || '' });
  });

  // ---------- ramo: desenha quando entra na tela ----------
  const sprigs = $$('.sprig');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-drawing'); io.unobserve(e.target); } }), { threshold: 0.15 });
    sprigs.forEach(s => io.observe(s));
  } else sprigs.forEach(s => s.classList.add('is-drawing'));

  // ---------- menu ----------
  const menuBtn = $('.menu-btn'), nav = $('#main-nav');
  if (menuBtn) menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav && nav.classList.contains('is-open')) menuBtn.click(); });

  // ---------- barra de compra fixa no celular ----------
  const buyBar = $('.buy-bar'), buyBox = $('#comprar');
  if (buyBar && buyBox && 'IntersectionObserver' in window) {
    let pastHero = false, boxVisible = false;
    const upd = () => buyBar.classList.toggle('is-visible', pastHero && !boxVisible);
    new IntersectionObserver(es => { boxVisible = es[0].isIntersecting; upd(); }).observe(buyBox);
    const hero = $('.product-hero');
    if (hero) new IntersectionObserver(es => { pastHero = !es[0].isIntersecting; upd(); }).observe(hero);
  }

  // ---------- formulários ----------
  async function post(url, data) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || 'error'), j);
    return j;
  }
  function msg(form, ok, text) {
    const el = $('.form-msg', form);
    if (!el) return;
    el.textContent = text || (ok ? el.dataset.ok : el.dataset.err) || '';
    el.className = 'form-msg ' + (ok ? 'is-ok' : 'is-err');
  }
  $$('form[data-form]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const kind = form.dataset.form;
      const fd = new FormData(form);
      const data = Object.fromEntries(fd.entries());
      data.lang = lang; data.path = location.pathname;
      if (form.dataset.product) data.product = form.dataset.product;
      if (kind === 'checkout') data.consent = !!fd.get('consent');
      const invalid = $$('input[required]', form).find(i => !i.checkValidity());
      if (invalid) { invalid.focus(); invalid.reportValidity(); return; }
      const btn = $('button[type=submit]', form);
      btn.disabled = true;
      try {
        const res = await post('/api/' + kind, data);
        if (res.redirect) { location.href = res.redirect; return; }
        if (res.needCode) { const el = $('.form-msg', form); el.textContent = el.dataset.need; el.className = 'form-msg is-err'; const c = $('[name=code]', form); if (c) c.focus(); return; }
        msg(form, true);
        if (kind !== 'access') form.reset();
      } catch (_) {
        msg(form, false);
      } finally { btn.disabled = false; }
    });
  });

  // ---------- receitas: "com o que você tem" ----------
  const pan = $('[data-pantry]');
  if (pan) {
    const U = JSON.parse(pan.dataset.pantry), out = $('[data-pantry-out]', pan), count = $('[data-pantry-count]', pan), clear = $('[data-pantry-clear]', pan);
    const chips = $$('.chip[data-k]', pan), KEY = 'botanora_pantry';
    const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const sel = () => chips.filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.dataset.k);
    let timer = null, seq = 0;
    const meta = r => `${r.time} · ${r.iced ? U.iced : U.hot} · ${r.caffeine ? U.caf : U.nocaf}`;
    const status = r => r.missing.length ? `${r.missing.length === 1 ? U.missOne : U.miss}: ${e(r.missing.join(', '))}` : U.ready;
    function render(d) {
      if (!d.best) { out.innerHTML = `<p class="pantry-empty">${e(sel().length ? U.nothing : U.empty)}</p>`; return; }
      const b = d.best;
      out.innerHTML = `<article class="pantry-best">
        <p class="pantry-flag${b.missing.length ? '' : ' ok'}"><span class="label">${e(U.best)}</span> <span>${status(b)}</span></p>
        <h3 class="h3"><a href="${e(b.url)}">${e(b.name)}</a></h3>
        <p class="muted">${e(b.tag)}</p><p class="tiny muted">${e(meta(b))}</p>
        <ul class="pantry-ing">${b.ingredients.map(i => `<li class="${i.ok ? 'ok' : 'no'}"><span aria-hidden="true">${i.ok ? '✓' : '○'}</span> <b>${e(i.qty)}</b> ${e(i.item)}</li>`).join('')}</ul>
        <a class="btn btn-dark" href="${e(b.url)}">${e(U.open)}</a>
      </article>
      ${d.more.length ? `<p class="label pantry-sub">${e(U.more)}</p><div class="pantry-more">${d.more.map(r => `<a class="pantry-mini" href="${e(r.url)}"><b>${e(r.name)}</b><span class="tiny${r.missing.length ? '' : ' ok'}">${status(r)}</span><span class="tiny muted">${e(meta(r))}</span></a>`).join('')}</div>` : ''}
      ${d.guides.length ? `<p class="label pantry-sub">${e(U.guides)}</p><div class="pantry-guides">${d.guides.map(g => `<a class="pantry-guide" href="${e(g.url)}"><img src="${e(g.cover)}" alt="" loading="lazy" width="54" height="76"><span><b>${e(g.recipe)}</b><span class="tiny muted">${e(g.ready ? U.guideReady : U.guideHave.replace('{a}', g.have).replace('{b}', g.total))}</span><span class="tiny pantry-guide-name">${e(g.guide)} →</span></span></a>`).join('')}</div>` : ''}`;
    }
    function update() {
      const s = sel();
      count.textContent = s.length ? (s.length === 1 ? U.selected[0] : U.selected[1].replace('{n}', s.length)) : U.none;
      clear.hidden = !s.length;
      const go = $('.pantry-go', pan); if (go) go.hidden = !s.length;
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) {}
      clearTimeout(timer);
      if (!s.length) { render({ best: null }); return; }
      out.classList.add('is-loading');
      timer = setTimeout(async () => {
        const my = ++seq;
        try { const d = await post('/api/pantry', { have: s, lang, path: location.pathname }); if (my === seq) render(d); }
        catch (_) {} finally { if (my === seq) out.classList.remove('is-loading'); }
      }, 250);
    }
    chips.forEach(c => c.addEventListener('click', () => { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); update(); }));
    clear.addEventListener('click', () => { chips.forEach(c => c.setAttribute('aria-pressed', 'false')); update(); });
    try { const saved = JSON.parse(localStorage.getItem(KEY) || '[]'); if (saved.length) { chips.forEach(c => { if (saved.includes(c.dataset.k)) c.setAttribute('aria-pressed', 'true'); }); update(); } } catch (_) {}
  }

  // ---------- recomendações: se a foto não carregar, mostra o ícone ----------
  const affFallback = img => { const box = img.closest('.aff-media'); if (box) box.classList.add('aff-media-ico'); img.remove(); };
  document.addEventListener('error', e => { if (e.target.matches && e.target.matches('[data-aff-img]')) affFallback(e.target); }, true);
  $$('[data-aff-img]').forEach(img => { if (img.complete && !img.naturalWidth) affFallback(img); });

  // ---------- acesso à biblioteca: e-mail -> código de 6 dígitos (plano B: celular) ----------
  const acc = $('[data-access]');
  if (acc) {
    const M = JSON.parse(acc.dataset.msg || '{}');
    const steps = $$('[data-step]', acc), emailIn = $('[name=email]', acc), codeIn = $('[name=code]', acc), phoneIn = $('[name=phone]', acc);
    let step = 'email';
    const go = s => {
      step = s;
      steps.forEach(el => { el.hidden = el.dataset.step !== s; });
      $('[data-email-show]', acc).textContent = emailIn.value.trim();
      msg(acc, true, '');
      const f = { email: emailIn, code: codeIn, backup: phoneIn }[s];
      if (f) setTimeout(() => f.focus(), 30);
    };
    const btnOf = () => $(`[data-step="${step}"] button[type=submit]`, acc);
    async function send(extra) {
      const btn = btnOf(); btn.disabled = true;
      try {
        const r = await post('/api/access', Object.assign({ email: emailIn.value.trim(), lang }, extra));
        if (r.redirect) { location.href = r.redirect; return r; }
        return r;
      } catch (err) { msg(acc, false, M[err.error] || M.err); return null; }
      finally { btn.disabled = false; }
    }
    acc.addEventListener('submit', async e => {
      e.preventDefault();
      if (step === 'email') {
        if (!emailIn.checkValidity() || !emailIn.value.trim()) { emailIn.reportValidity(); return; }
        const r = await send({});
        if (!r) return;
        if (r.mail === false) { go('backup'); msg(acc, true, M.noMail); } else go('code');
      } else if (step === 'code') {
        const c = codeIn.value.replace(/\D/g, '');
        if (c.length !== 6) { msg(acc, false, M.wrong); codeIn.focus(); return; }
        await send({ code: c });
      } else {
        const ph = phoneIn.value.replace(/\D/g, '');
        if (ph.length !== 4) { phoneIn.focus(); return; }
        await send({ phone: ph });
      }
    });
    // código colado ou digitado: envia sozinho ao completar 6 dígitos
    codeIn.addEventListener('input', () => {
      codeIn.value = codeIn.value.replace(/\D/g, '').slice(0, 6);
      if (codeIn.value.length === 6) acc.requestSubmit ? acc.requestSubmit() : acc.dispatchEvent(new Event('submit', { cancelable: true }));
    });
    phoneIn.addEventListener('input', () => { phoneIn.value = phoneIn.value.replace(/\D/g, '').slice(0, 4); });
    acc.addEventListener('click', async e => {
      if (e.target.closest('[data-change]')) { codeIn.value = ''; phoneIn.value = ''; go('email'); }
      if (e.target.closest('[data-backup]')) go('backup');
      if (e.target.closest('[data-resend]')) { const r = await send({}); if (r) msg(acc, true, M.resent); }
    });
    if (emailIn.value) emailIn.focus();
  }

  // ---------- espectro (home) ----------
  const sp = $('[data-spectrum]');
  if (sp) {
    sp.addEventListener('click', e => {
      const dot = e.target.closest('.spectrum-dot');
      if (!dot) return;
      $$('.spectrum-dot', sp).forEach(d => { const on = d === dot; d.classList.toggle('is-active', on); d.setAttribute('aria-selected', on); });
      $$('.sp-card', sp).forEach(c => { c.hidden = c.dataset.for !== dot.dataset.tea; });
    });
    sp.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const dots = $$('.spectrum-dot', sp); const i = dots.indexOf(document.activeElement);
      if (i < 0) return;
      const n = dots[(i + (e.key === 'ArrowRight' ? 1 : dots.length - 1)) % dots.length];
      n.focus(); n.click();
    });
  }

  // ---------- filtro de benefícios ----------
  const filters = $$('[data-filter]');
  filters.forEach(btn => btn.addEventListener('click', () => {
    const row = btn.closest('.filter-row');
    const scope = row.dataset.filterScope || '.benefit-card', attr = row.dataset.filterAttr || 'evidence';
    $$('[data-filter]', row).forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', b === btn); });
    // o atributo pode ter vários valores separados por espaço (ex.: temas de um guia)
    const v = btn.dataset.filter;
    let shown = 0;
    $$(scope).forEach(c => { c.hidden = v !== 'all' && !String(c.dataset[attr] || '').split(' ').includes(v); if (!c.hidden) shown++; });
    const count = $('.filter-count', row);
    if (count && row.dataset.filterCount) count.textContent = v === 'all' ? '' : row.dataset.filterCount.replace('{n}', shown);
    if (row.dataset.filterEvent) track(row.dataset.filterEvent, { value: v });
  }));

  // ---------- preparo + timer ----------
  const brew = $('[data-brew]');
  if (brew && DATA.teas) {
    const L = DATA.labels;
    const out = k => $(`[data-out="${k}"]`);
    const vol = $('#vol'), volOut = $('#vol-out');
    const card = $('.timer-card'), ring = $('.ring-fg'), clock = out('clock'), status = $('.timer-status');
    const startBtn = $('[data-act="start"]');
    let total = 0, left = 0, running = false, endAt = 0, raf = 0, current;

    const params = new URLSearchParams(location.search);
    const pre = params.get('tea');
    if (pre) { const r = $(`input[name=tea][value="${CSS.escape(pre)}"]`); if (r) r.checked = true; }

    const fmt = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    const thermoHint = t => { const top = t[1]; return top >= 98 ? DATA.thermo[0][1] : top >= 88 ? DATA.thermo[1][1] : top >= 78 ? DATA.thermo[2][1] : DATA.thermo[3][1]; };

    function calc() {
      current = DATA.teas.find(t => t.id === $('input[name=tea]:checked').value);
      const ml = Number(vol.value);
      const k = Number($('input[name=strength]:checked').value);
      volOut.textContent = ml + ' ml';
      const g = current.grams * ml / 200 * k;
      out('dose').textContent = (Math.round(g * 2) / 2).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US') + ' g';
      out('spoons').textContent = '≈ ' + (Math.round(g / 2.5 * 2) / 2).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US') + ' ' + L.spoons;
      out('temp').textContent = current.temp[0] === current.temp[1] ? current.temp[0] + ' °C' : current.temp[0] + '–' + current.temp[1] + ' °C';
      out('thermo').textContent = thermoHint(current.temp);
      // tempo: suave usa o mínimo, intenso o máximo
      const t = k < 1 ? current.time[0] : k > 1 ? current.time[1] : (current.time[0] + current.time[1]) / 2;
      out('time').textContent = fmt(t * 60) + ' min';
      out('resteep').textContent = current.resteeps ? current.resteeps + '× ' + L.resteeps : '';
      out('tip').textContent = current.tip;
      out('name').textContent = current.name;
      if (!running) { total = left = Math.round(t * 60); paint(); }
    }
    function paint() {
      clock.textContent = fmt(left);
      ring.style.strokeDashoffset = total ? String(1 - left / total) : '0';
    }
    function tick() {
      left = (endAt - Date.now()) / 1000;
      if (left <= 0) { left = 0; paint(); finish(); return; }
      paint(); raf = requestAnimationFrame(tick);
    }
    function finish() {
      running = false; startBtn.textContent = startBtn.dataset.start;
      status.textContent = status.dataset.done; card.classList.add('is-done');
      track('timer_done', { tea: current.id });
      try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); [0, .35, .7].forEach(d => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(.0001, ctx.currentTime + d); g.gain.exponentialRampToValueAtTime(.2, ctx.currentTime + d + .02); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + d + .3); o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + .32); }); } catch (_) {}
      if ($('[data-notify]').checked && 'Notification' in window && Notification.permission === 'granted') new Notification('Botânora', { body: current.name + ': ' + status.dataset.done });
      document.title = '✓ ' + document.title.replace(/^✓ /, '');
    }
    startBtn.addEventListener('click', () => {
      if (running) { running = false; cancelAnimationFrame(raf); startBtn.textContent = startBtn.dataset.start; return; }
      if (left <= 0) { calc(); left = total; }
      running = true; card.classList.remove('is-done'); status.textContent = '';
      endAt = Date.now() + left * 1000; startBtn.textContent = startBtn.dataset.pause;
      track('timer_start', { tea: current.id });
      tick();
    });
    $('[data-act="reset"]').addEventListener('click', () => { running = false; cancelAnimationFrame(raf); startBtn.textContent = startBtn.dataset.start; status.textContent = ''; card.classList.remove('is-done'); left = total; paint(); });
    $('[data-notify]').addEventListener('change', e => { if (e.target.checked && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission(); });
    brew.addEventListener('change', e => { if (e.target.name === 'tea' || e.target.name === 'strength') { if (running) { running = false; cancelAnimationFrame(raf); startBtn.textContent = startBtn.dataset.start; } calc(); } });
    vol.addEventListener('input', calc);
    calc();
  }

  // ---------- quiz ----------
  const qc = $('[data-quiz]');
  if (qc && DATA.quiz) {
    const L = DATA.l, Q = DATA.quiz;
    const arrow = '<svg class="ico-sm" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 24 H40 M30 14 L40 24 L30 34"/></svg>';
    let answers = [];
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // Último resultado fica só neste navegador (sem conta, sem servidor)
    const KEY = 'btn_quiz_' + document.body.dataset.lang;
    const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && Array.isArray(v.a) && v.a.length === Q.length && v.a.every((k, i) => Q[i].options[k]) ? v : null; } catch (_) { return null; } };
    const save = a => { try { localStorage.setItem(KEY, JSON.stringify({ a, at: Date.now() })); } catch (_) {} };
    const pick = a => { const score = {}; a.forEach((k, i) => { const s = Q[i].options[k].score; for (const t in s) score[t] = (score[t] || 0) + s[t]; }); return Object.keys(score).sort((x, y) => score[y] - score[x])[0]; };
    function step() {
      const i = answers.length;
      if (i >= Q.length) return result(true);
      const q = Q[i], last = !i && load();
      qc.innerHTML = `<div class="quiz-step">
        ${last ? `<p class="quiz-last">${esc(L.last)} <strong>${esc(DATA.teas[pick(last.a)].name)}</strong>. <button type="button" class="link-btn" data-last>${esc(L.lastSee)}</button></p>` : ''}
        <div class="quiz-progress" aria-hidden="true">${Q.map((_, k) => `<i${k <= i ? ' class="on"' : ''}></i>`).join('')}</div>
        <p class="label">${esc(L.step)} ${i + 1} ${esc(L.of)} ${Q.length}</p>
        <h2 class="quiz-q" tabindex="-1">${esc(q.q)}</h2>
        <div class="quiz-opts">${q.options.map((o, k) => `<button type="button" class="quiz-opt" data-k="${k}">${esc(o.label)}${arrow}</button>`).join('')}</div>
        ${i ? `<button type="button" class="quiz-back">← ${esc(L.back)}</button>` : ''}
      </div>`;
      if (i) { const h = $('.quiz-q', qc); if (h) h.focus(); }
    }
    function result(fresh) {
      const id = pick(answers);
      const tea = DATA.teas[id], m = DATA.map[id];
      if (fresh) { save(answers); track('quiz_complete', { tea: id }); }
      qc.innerHTML = `<div class="quiz-result">
        <div>
          ${tea.icon}
          <p class="label">${esc(L.result)}</p>
          <h2 class="display" tabindex="-1">${esc(tea.name)}</h2>
          <p class="italic muted">${esc(tea.tagline)}</p>
          <p>${esc(tea.body)}</p>
          <div class="quiz-why"><p class="label">${esc(L.why)}</p><p class="muted">${esc(L.whyText)}</p>
            <ul>${answers.map((k, i) => `<li>${esc(Q[i].options[k].label)}</li>`).join('')}</ul></div>
          <dl class="spec-row"><div><dt>${esc(L.temp)}</dt><dd>${esc(tea.temp)}</dd></div><div><dt>${esc(L.time)}</dt><dd>${esc(tea.time)}</dd></div></dl>
          <div class="quiz-links">
            <a class="btn btn-dark" href="${DATA.urls.brewing}?tea=${id}" data-event="quiz_brew">${esc(L.brew)}</a>
            <a class="link-arrow" href="${m.teaUrl}" data-event="quiz_tea">${esc(L.seeGuide)} ${arrow}</a>
            <a class="link-arrow" href="${m.benefit.url}" data-event="quiz_benefit">${esc(L.benefit)}: ${esc(m.benefit.title)} ${arrow}</a>
          </div>
          ${m.recipes && m.recipes.length ? `<div class="quiz-recipes"><p class="label">${esc(L.recipes)}</p>${m.recipes.map(r => `<a class="recipe-card" href="${r.url}" data-event="quiz_recipe"><h3>${esc(r.name)}</h3><p>${esc(r.tag)}</p></a>`).join('')}</div>` : ''}
          <p class="tiny muted quiz-saved">${esc(L.saved)}</p>
          <button type="button" class="quiz-back" data-again>↺ ${esc(L.again)}</button>
        </div>
        ${m.product ? `<aside class="quiz-side"><a href="${m.product.url}" class="quiz-side-cover" data-event="quiz_reco" tabindex="-1" aria-hidden="true">${m.product.cover}</a><p class="label">${esc(L.product)}</p><p class="h4">${esc(m.product.title)}</p><p class="tiny muted">${esc(m.product.sub)}</p><a class="btn btn-dark btn-sm" href="${m.product.url}" data-event="quiz_reco">${esc(L.productSee)}</a></aside>` : ''}
      </div>`;
      const h = $('.quiz-result .display', qc); if (h) h.focus({ preventScroll: true });
      const top = qc.getBoundingClientRect().top + scrollY - 100; if (top < scrollY) scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    qc.addEventListener('click', e => {
      const opt = e.target.closest('.quiz-opt');
      if (opt) { if (!answers.length) track('quiz_start'); answers.push(Number(opt.dataset.k)); step(); return; }
      if (e.target.closest('[data-last]')) { const v = load(); if (v) { answers = v.a.slice(); result(false); } return; }
      if (e.target.closest('[data-again]')) { answers = []; track('quiz_restart'); step(); return; }
      if (e.target.closest('.quiz-back')) { answers.pop(); step(); }
    });
    step();
  }

  // ---------- receitas salvas (só neste navegador) ----------
  const SKEY = 'btn_saved_recipes';
  const getSaved = () => { try { const v = JSON.parse(localStorage.getItem(SKEY) || '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string').slice(0, 200) : []; } catch (_) { return []; } };
  const setSaved = v => { try { localStorage.setItem(SKEY, JSON.stringify(v)); return true; } catch (_) { return false; } };
  const saveBtn = $('[data-save-recipe]');
  if (saveBtn) {
    const id = saveBtn.dataset.saveRecipe, label = $('span', saveBtn);
    const paint = on => { saveBtn.setAttribute('aria-pressed', on); saveBtn.classList.toggle('is-on', on); label.textContent = on ? saveBtn.dataset.on : saveBtn.dataset.off; };
    paint(getSaved().includes(id));
    saveBtn.addEventListener('click', () => {
      const list = getSaved(), on = !list.includes(id);
      if (!setSaved(on ? [id, ...list] : list.filter(x => x !== id))) return;
      paint(on); track(on ? 'recipe_save' : 'recipe_unsave', { recipe: id });
    });
  }
  const savedBox = $('[data-saved-list]');
  if (savedBox) {
    const grid = $('[data-saved-grid]', savedBox), done = new Set();
    getSaved().forEach(id => {
      const card = $(`.recipe-card[data-recipe="${CSS.escape(id)}"]`);
      if (card && !done.has(id)) { done.add(id); grid.appendChild(card.cloneNode(true)); }
    });
    if (done.size) savedBox.hidden = false;
  }

  // ---------- avaliações: enviar/editar (biblioteca) ----------
  $$('form[data-review]').forEach(f => {
    const M = JSON.parse(f.dataset.msg || '{}'), msg = $('.form-msg', f), btn = $('button[type=submit]', f);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const rating = Number((f.querySelector('input[name=rating]:checked') || {}).value || 0);
      const body = { slug: f.dataset.slug, lang: f.dataset.lang, rating, name: f.name.value, text: f.text.value };
      const bad = !rating ? 'rating' : body.name.trim().length < 2 ? 'name' : body.text.trim().length < 20 ? 'text' : '';
      if (bad) { msg.textContent = M[bad]; msg.className = 'form-msg is-err'; return; }
      btn.disabled = true; msg.className = 'form-msg'; msg.textContent = '…';
      try {
        const r = await fetch('/api/library/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { msg.textContent = M[j.error] || (r.status === 429 ? M.rate : r.status === 401 ? M.login : M.generic); msg.className = 'form-msg is-err'; btn.disabled = false; return; }
        msg.textContent = M.sent; msg.className = 'form-msg is-ok';
        setTimeout(() => { location.replace(location.pathname + '#avaliado-' + f.dataset.slug); location.reload(); }, 1200);
      } catch (_) { msg.textContent = M.generic; msg.className = 'form-msg is-err'; btn.disabled = false; }
    });
  });
  // link do e-mail de recusa: abre o formulário do guia certo
  // #avaliar-<guia>: abre o formulário (link do e-mail); #avaliado-<guia>: só mostra o resultado do envio
  const rh = /^#(avaliar|avaliado)-(.+)$/.exec(location.hash);
  if (rh) {
    const box = document.getElementById('avaliar-' + decodeURIComponent(rh[2]));
    const d = box && $('details', box);
    if (d && rh[1] === 'avaliar') d.open = true;
    if (box) box.scrollIntoView({ block: 'center' });
  }

  // ---------- avaliações: "útil" e "ver todas" (página do guia) ----------
  const UKEY = 'btn_review_ups';
  const getUps = () => { try { const v = JSON.parse(localStorage.getItem(UKEY) || '[]'); return Array.isArray(v) ? v : []; } catch (_) { return []; } };
  const setUps = v => { try { localStorage.setItem(UKEY, JSON.stringify(v.slice(-300))); } catch (_) {} };
  const mineUps = new Set(getUps());
  $$('[data-up]').forEach(b => {
    if (mineUps.has(b.dataset.up)) b.setAttribute('aria-pressed', 'true');
    b.addEventListener('click', async () => {
      b.disabled = true;
      try {
        const r = await fetch('/api/reviews/up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: b.dataset.up }) });
        if (r.ok) {
          const j = await r.json();
          b.setAttribute('aria-pressed', j.on); $('.review-up-n', b).textContent = j.ups;
          j.on ? mineUps.add(b.dataset.up) : mineUps.delete(b.dataset.up); setUps([...mineUps]);
          if (j.on) track('review_up', { id: b.dataset.up });
        }
      } catch (_) {}
      b.disabled = false;
    });
  });
  const moreBtn = $('[data-reviews-more]');
  if (moreBtn) moreBtn.addEventListener('click', () => { $$('.review[data-more]').forEach(r => { r.hidden = false; }); moreBtn.remove(); track('review_open'); });

  // ---------- comunidade: perguntar, editar, responder, votar ----------
  const postJson = (u, body) => fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async r => ({ ok: r.ok, status: r.status, j: await r.json().catch(() => ({})) }));
  function qaForm(f, url, extra, done) {
    const M = JSON.parse(f.dataset.msg || '{}'), msg = $('.form-msg', f), btn = $('button[type=submit]', f);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(f).entries());
      // checagem rápida antes de enviar (o servidor confere de novo)
      const bad = 'name' in data && String(data.name).trim().length < 2 ? 'name' : 'email' in data && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email).trim()) ? 'email' : 'text' in data && String(data.text).trim().length < (f.matches('[data-qa-answer]') ? 10 : 15) ? 'text' : '';
      if (bad && M[bad]) { msg.textContent = M[bad]; msg.className = 'form-msg is-err'; return; }
      btn.disabled = true; msg.className = 'form-msg'; msg.textContent = '…';
      try {
        const r = await postJson(url, Object.assign(data, extra()));
        if (!r.ok) { msg.textContent = M[r.j.error] || (r.status === 429 ? M.rate : r.status === 401 ? M.login : M.generic); msg.className = 'form-msg is-err'; btn.disabled = false; return; }
        msg.textContent = M.sent; msg.className = 'form-msg is-ok'; done(f);
      } catch (_) { msg.textContent = M.generic; msg.className = 'form-msg is-err'; btn.disabled = false; }
    });
  }
  $$('[data-qa-ask]').forEach(f => qaForm(f, '/api/qa/ask', () => ({ lang: f.dataset.lang }), f => { f.reset(); $$('input,textarea,select,button', f).forEach(x => { x.disabled = true; }); track('qa_ask'); }));
  $$('[data-qa-edit]').forEach(f => qaForm(f, '/api/qa/edit', () => ({ t: f.dataset.t }), f => { $$('input,textarea,button', f).forEach(x => { x.disabled = true; }); }));
  $$('[data-qa-answer]').forEach(f => qaForm(f, '/api/qa/answer', () => ({ qid: f.dataset.qaAnswer }), f => { $$('input,textarea,button', f).forEach(x => { x.disabled = true; }); track('qa_answer'); }));
  $$('select[data-autosubmit]').forEach(s => s.addEventListener('change', () => s.form.submit()));
  const QKEY = 'btn_qa_ups';
  const qUps = new Set((() => { try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (_) { return []; } })());
  $$('[data-qa-up]').forEach(b => {
    const qid = b.dataset.qaQ || (b.closest('[data-qa]') || {}).dataset?.qa, aid = b.dataset.qaUp, key = qid + ':' + aid;
    if (qUps.has(key)) b.setAttribute('aria-pressed', 'true');
    b.addEventListener('click', async () => {
      b.disabled = true;
      try {
        const r = await postJson('/api/qa/up', { qid, aid });
        if (r.ok) { b.setAttribute('aria-pressed', r.j.on); $('.review-up-n', b).textContent = r.j.ups; r.j.on ? qUps.add(key) : qUps.delete(key); try { localStorage.setItem(QKEY, JSON.stringify([...qUps].slice(-300))); } catch (_) {} if (r.j.on) track('qa_up'); }
      } catch (_) {}
      b.disabled = false;
    });
  });

  // ---------- prévia do guia (com zoom) ----------
  const pvDlg = $('[data-preview]');
  if (pvDlg) {
    const D = JSON.parse($('.pv-data', pvDlg).textContent);
    const img = $('.pv-img', pvDlg), view = $('.pv-view', pvDlg), count = $('.pv-count', pvDlg), level = $('.pv-zlevel', pvDlg);
    const STEPS = [1, 1.5, 2, 3, 4], MAX = 4;
    let cur = 0, seen = new Set(), lastFocus = null, z = 1, base = null, zoomTracked = false;
    const preload = i => { if (D.items[i]) { const im = new Image(); im.src = D.items[i].src; } };

    // Volta ao tamanho normal (a imagem se ajusta à tela pelo CSS)
    function resetZoom() {
      z = 1; base = null;
      pvDlg.classList.remove('pv-zoomed');
      view.style.width = view.style.height = '';
      img.style.width = img.style.height = '';
      view.scrollLeft = view.scrollTop = 0;
      level.textContent = '100%';
    }
    // Amplia mantendo parado o ponto (cx, cy) da tela, como num leitor de PDF
    function setZoom(nz, cx, cy) {
      nz = Math.min(MAX, Math.max(1, Math.round(nz * 100) / 100));
      if (nz === z) return;
      if (nz === 1) return resetZoom();
      if (!base) {
        const r = img.getBoundingClientRect();
        base = { w: r.width, h: r.height };
        view.style.width = base.w + 'px'; view.style.height = base.h + 'px';
        pvDlg.classList.add('pv-zoomed');
        const it = D.items[cur];
        if (it.hd && img.dataset.hd !== it.hd) { img.dataset.hd = it.hd; const hi = new Image(); hi.onload = () => { if (D.items[cur] === it) img.src = it.hd; }; hi.src = it.hd; }
      }
      const vr = view.getBoundingClientRect();
      const px = (cx == null ? vr.width / 2 : cx - vr.left), py = (cy == null ? vr.height / 2 : cy - vr.top);
      const fx = (view.scrollLeft + px) / (base.w * z), fy = (view.scrollTop + py) / (base.h * z);
      z = nz;
      img.style.width = base.w * z + 'px'; img.style.height = base.h * z + 'px';
      view.scrollLeft = fx * base.w * z - px; view.scrollTop = fy * base.h * z - py;
      level.textContent = Math.round(z * 100) + '%';
      if (!zoomTracked) { zoomTracked = true; track('preview_zoom', { slug: D.slug }); }
    }
    const stepZoom = (dir, cx, cy) => {
      if (dir === 0) return resetZoom();
      const next = dir > 0 ? STEPS.find(s => s > z + 0.01) : [...STEPS].reverse().find(s => s < z - 0.01);
      setZoom(next || (dir > 0 ? MAX : 1), cx, cy);
    };

    function show(i) {
      resetZoom();
      cur = (i + D.items.length) % D.items.length;
      const it = D.items[cur];
      delete img.dataset.hd;
      img.src = it.src;
      img.alt = D.label.replace('{p}', it.page).replace('{t}', D.pages);
      count.textContent = `${cur + 1} / ${D.items.length} · ${img.alt}`;
      preload(cur + 1); preload(cur - 1);
      if (!seen.has(cur)) { seen.add(cur); if (cur > 0) track('preview_page', { slug: D.slug, n: cur + 1 }); }
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      if (pvDlg.showModal) pvDlg.showModal(); else pvDlg.setAttribute('open', '');
      document.documentElement.classList.add('pv-lock');
      track('preview_open', { slug: D.slug });
    }
    function close() {
      if (pvDlg.close) pvDlg.close(); else pvDlg.removeAttribute('open');
    }
    pvDlg.addEventListener('close', () => {
      resetZoom();
      document.documentElement.classList.remove('pv-lock');
      if (lastFocus) lastFocus.focus();
    });
    window.addEventListener('resize', () => { if (z > 1) resetZoom(); });
    $$('[data-preview-open]').forEach(b => b.addEventListener('click', () => open(+b.dataset.previewOpen || 0)));
    $$('[data-preview-step]', pvDlg).forEach(b => b.addEventListener('click', () => show(cur + +b.dataset.previewStep)));
    $$('[data-preview-close]', pvDlg).forEach(b => b.addEventListener('click', close));
    $$('[data-zoom]', pvDlg).forEach(b => b.addEventListener('click', () => stepZoom(+b.dataset.zoom)));
    pvDlg.addEventListener('click', e => { if (e.target === pvDlg) close(); });
    pvDlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' && z === 1) { e.preventDefault(); show(cur + 1); }
      if (e.key === 'ArrowLeft' && z === 1) { e.preventDefault(); show(cur - 1); }
      if (e.key === '+' || e.key === '=') { e.preventDefault(); stepZoom(1); }
      if (e.key === '-') { e.preventDefault(); stepZoom(-1); }
      if (e.key === '0') { e.preventDefault(); resetZoom(); }
    });
    // Duplo clique / duplo toque: alterna entre normal e 2,5x no ponto tocado
    let lastType = 'mouse';
    img.addEventListener('dblclick', e => { e.preventDefault(); if (lastType === 'touch') return; z > 1 ? resetZoom() : setZoom(2.5, e.clientX, e.clientY); });
    // Ctrl + roda do mouse (ou pinça no trackpad) amplia
    view.addEventListener('wheel', e => {
      if (!e.ctrlKey) { if (z > 1) { e.preventDefault(); view.scrollLeft += e.deltaX; view.scrollTop += e.deltaY; } return; }
      e.preventDefault();
      setZoom(z * Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
    }, { passive: false });

    // Ponteiros: arrastar para mover (com zoom), pinça com dois dedos, deslizar para trocar de página
    const pts = new Map();
    let drag = null, pinch = null, swipeX = null, lastTap = 0;
    view.addEventListener('pointerdown', e => {
      lastType = e.pointerType;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z };
        drag = null; swipeX = null;
      } else if (pts.size === 1) {
        if (e.pointerType === 'touch') {
          const now = Date.now();
          if (now - lastTap < 300) { z > 1 ? resetZoom() : setZoom(2.5, e.clientX, e.clientY); lastTap = 0; return; }
          lastTap = now;
        }
        if (z > 1) { drag = { x: e.clientX, y: e.clientY, sl: view.scrollLeft, st: view.scrollTop }; view.setPointerCapture(e.pointerId); view.classList.add('pv-grabbing'); }
        else swipeX = e.clientX;
      }
    });
    view.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size === 2) {
        const [a, b] = [...pts.values()];
        setZoom(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      } else if (drag) {
        view.scrollLeft = drag.sl - (e.clientX - drag.x);
        view.scrollTop = drag.st - (e.clientY - drag.y);
      }
    });
    const up = e => {
      if (swipeX !== null && pts.size === 1 && z === 1) {
        const dx = e.clientX - swipeX;
        if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1));
      }
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
      if (!pts.size) { drag = null; swipeX = null; view.classList.remove('pv-grabbing'); }
    };
    view.addEventListener('pointerup', up);
    view.addEventListener('pointercancel', up);
  }
})();
