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
  const gaId = document.body.dataset.ga, clarityId = document.body.dataset.clarity;
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
  }
  function clearThirdPartyCookies() {
    const host = location.hostname, root = host.split('.').slice(-3).join('.');
    document.cookie.split('; ').map(c => c.split('=')[0]).filter(n => /^(_ga|_gid|_gat|_clck|_clsk|CLID|MUID)/.test(n)).forEach(n => {
      [host, '.' + host, '.' + root, '.' + host.split('.').slice(-2).join('.')].forEach(d => { document.cookie = `${n}=; Path=/; Max-Age=0; Domain=${d}`; });
      document.cookie = `${n}=; Path=/; Max-Age=0`;
    });
  }
  const banner = document.querySelector('[data-consent]');
  if (gaId || clarityId) {
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
    $$(scope).forEach(c => { c.hidden = btn.dataset.filter !== 'all' && c.dataset[attr] !== btn.dataset.filter; });
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
    function step() {
      const i = answers.length;
      if (i >= Q.length) return result();
      const q = Q[i];
      qc.innerHTML = `<div class="quiz-step">
        <div class="quiz-progress">${Q.map((_, k) => `<i${k <= i ? ' class="on"' : ''}></i>`).join('')}</div>
        <p class="label">${esc(L.step)} ${i + 1} ${esc(L.of)} ${Q.length}</p>
        <h2 class="quiz-q">${esc(q.q)}</h2>
        <div class="quiz-opts">${q.options.map((o, k) => `<button class="quiz-opt" data-k="${k}">${esc(o.label)}${arrow}</button>`).join('')}</div>
        ${i ? `<button class="quiz-back">← ${esc(L.back)}</button>` : ''}
      </div>`;
      const first = $('.quiz-opt', qc); if (i && first) first.focus();
    }
    function result() {
      const score = {};
      answers.forEach((k, i) => { const s = Q[i].options[k].score; for (const t in s) score[t] = (score[t] || 0) + s[t]; });
      const id = Object.keys(score).sort((a, b) => score[b] - score[a])[0];
      const tea = DATA.teas[id], m = DATA.map[id];
      track('quiz_complete', { tea: id });
      qc.innerHTML = `<div class="quiz-result">
        <div>
          ${tea.icon}
          <p class="label">${esc(L.result)}</p>
          <h2 class="display">${esc(tea.name)}</h2>
          <p class="italic muted">${esc(tea.tagline)}</p>
          <p>${esc(tea.body)}</p>
          <dl class="spec-row"><div><dt>${esc(L.temp)}</dt><dd>${esc(tea.temp)}</dd></div><div><dt>${esc(L.time)}</dt><dd>${esc(tea.time)}</dd></div></dl>
          <div class="quiz-links">
            <a class="btn btn-dark" href="${DATA.urls.brewing}?tea=${id}">${esc(L.brew)}</a>
            <a class="link-arrow" href="${DATA.urls.guide}#${id}">${esc(L.seeGuide)} ${arrow}</a>
            <a class="link-arrow" href="${m.benefit.url}">${esc(L.benefit)}: ${esc(m.benefit.title)} ${arrow}</a>
            <button class="quiz-back" data-again>↺ ${esc(L.again)}</button>
          </div>
        </div>
        ${m.product ? `<aside class="quiz-side"><a href="${m.product.url}" style="text-decoration:none">${m.product.cover}<p class="label">${esc(L.product)}</p><p class="h4">${esc(m.product.title)}</p></a></aside>` : ''}
      </div>`;
      const top = qc.getBoundingClientRect().top + scrollY - 100; if (top < scrollY) scrollTo({ top, behavior: 'smooth' });
    }
    qc.addEventListener('click', e => {
      const opt = e.target.closest('.quiz-opt');
      if (opt) { if (!answers.length) track('quiz_start'); answers.push(Number(opt.dataset.k)); step(); return; }
      if (e.target.closest('[data-again]')) { answers = []; step(); return; }
      if (e.target.closest('.quiz-back')) { answers.pop(); step(); }
    });
    step();
  }

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
