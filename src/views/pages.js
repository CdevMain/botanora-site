'use strict';
const { ui, url, money, routes } = require('../i18n');
const { layout, pageHero } = require('./layout');
const { sprig, icon } = require('./svg');
const { cover, productCard, evidenceBadge, range, esc, affCard } = require('./components');
const { teas, coffeeRef } = require('../content/teas');
const { benefits } = require('../content/benefits');
const { quiz, quizMap } = require('../content/quiz');
const discover = require('../content/discover');
const { terms } = require('../content/legal');
const config = require('../config');
const store = require('../store');
const mailer = require('../mailer');
const fs = require('fs');
const path = require('path');

// Prévias dos guias (geradas por tools/guias/previews.py)
const PREVIEW_DIR = path.join(config.root, 'public', 'assets', 'img', 'previews');
let previewCache = { mtime: 0, data: {} };
function previewFor(slug, lang) {
  try {
    const f = path.join(PREVIEW_DIR, 'previews.json');
    const m = fs.statSync(f).mtimeMs;
    if (m !== previewCache.mtime) previewCache = { mtime: m, data: JSON.parse(fs.readFileSync(f, 'utf8')) };
    const e = previewCache.data[slug];
    if (!e) return null;
    const pick = e[lang] || e.pt || e.en;
    return pick && pick.items && pick.items.length ? Object.assign({ lang: e[lang] ? lang : (e.pt ? 'pt' : 'en') }, pick) : null;
  } catch (_) { return null; }
}

function freeRecipes(lang, p) {
  const list = require('../content/recipes.json').filter(r => r.guide === p.slug);
  if (!list.length) return '';
  const h = lang === 'pt' ? 'Experimente grátis: receitas deste guia' : 'Try for free: recipes from this guide';
  const sub = lang === 'pt' ? 'Duas receitas completas, do jeito que estão no guia.' : 'Two complete recipes, exactly as they appear in the guide.';
  return `<section class="section band-paper"><div class="wrap"><p class="label">${lang === 'pt' ? 'Receitas grátis' : 'Free recipes'}</p><h2 class="h3">${esc(h)}</h2><p class="muted">${esc(sub)}</p>
  <div class="recipe-grid">${list.map(r => `<a class="recipe-card" href="${url(lang, 'recipes', r.slug[lang])}"><h3>${esc(r.name[lang])}</h3><p>${esc(r.tag[lang])}</p><span class="recipe-card-meta">${icon('clock', 'ico-sm')} ${esc(r.time[lang])}</span></a>`).join('')}</div></div></section>`;
}

function previewSection(lang, p, pv) {
  const t = ui[lang].product.preview;
  const items = pv.items.map(x => ({ src: '/assets/img/previews/' + x.file, hd: x.hd ? '/assets/img/previews/' + x.hd : null, page: x.page }));
  const both = store.fileLangs(p).length > 1;
  return `<section class="section band-paper-2 preview-band" id="previa">
  <div class="wrap">
    <div class="section-head section-head-row">
      <div><p class="label">${esc(t.eyebrow)}</p><h2 class="h2">${esc(t.title)}</h2>
      <p class="muted">${esc(t.text.replace('{n}', items.length))}${both ? ' ' + esc(t.langNote) : ''}</p></div>
      <button type="button" class="btn btn-dark btn-sm" data-preview-open="0">${icon('book', 'ico-sm')} ${esc(t.open)}</button>
    </div>
    <div class="preview-strip" role="list">
      ${items.map((x, i) => `<button type="button" class="preview-thumb" role="listitem" data-preview-open="${i}" aria-label="${esc(t.page.replace('{p}', x.page).replace('{t}', pv.pages))}">
        <img src="${x.src}" alt="" loading="lazy" decoding="async" width="900" height="1273">
        <span>${esc(t.page.replace('{p}', x.page).replace('{t}', pv.pages))}</span></button>`).join('')}
    </div>
  </div>
  <dialog class="preview-dialog" data-preview aria-label="${esc(t.title)}">
    <div class="pv-top"><span class="pv-count" aria-live="polite"></span>
      <div class="pv-tools">
        <div class="pv-zoom" role="group" aria-label="${esc(t.zoom)}">
          <button type="button" class="pv-zbtn" data-zoom="-1" aria-label="${esc(t.zoomOut)}">&minus;</button>
          <button type="button" class="pv-zbtn pv-zlevel" data-zoom="0" aria-label="${esc(t.zoomReset)}">100%</button>
          <button type="button" class="pv-zbtn" data-zoom="1" aria-label="${esc(t.zoomIn)}">+</button>
        </div>
        <button type="button" class="pv-close" data-preview-close aria-label="${esc(t.close)}">&times;</button>
      </div></div>
    <div class="pv-stage">
      <button type="button" class="pv-nav pv-prev" data-preview-step="-1" aria-label="${esc(t.prev)}">‹</button>
      <div class="pv-view"><img class="pv-img" alt="" draggable="false"></div>
      <button type="button" class="pv-nav pv-next" data-preview-step="1" aria-label="${esc(t.next)}">›</button>
    </div>
    <p class="pv-hint">${esc(t.zoomHint)}</p>
    <div class="pv-foot">${p.status === 'available' ? `<a class="btn btn-gold btn-sm" href="#comprar" data-preview-close>${esc(t.buy)}</a>` : ''}</div>
    <script type="application/json" class="pv-data">${JSON.stringify({ items, pages: pv.pages, label: t.page, slug: p.slug }).replace(/</g, '\\u003c')}</script>
  </dialog>
</section>`;
}

const teaById = id => teas.find(t => t.id === id);
const fmtTime = (tea, lang) => tea.time[1] < 1 ? `${Math.round(tea.time[1] * 60)} s` : `${range(tea.time[0], tea.time[1])} min`;
const caf = (tea, lang) => tea.caffeine[1] === 0 ? ui[lang].guide.none : `${range(tea.caffeine[0], tea.caffeine[1])} mg`;
const pathsFor = (key, ...rest) => ({ pt: url('pt', key, ...rest), en: url('en', key, ...rest) });
const visible = products => products.filter(p => p.status !== 'hidden');
const activeAff = () => (store.db.affiliates || []).filter(a => a.active).sort((a, b) => (a.order || 99) - (b.order || 99));

// ---------------- HOME ----------------
function home(lang, products) {
  const t = ui[lang], h = t.home;
  const spectrum = ['verde', 'branco', 'oolong', 'preto', 'puer'].map(teaById);
  const featured = visible(products).slice(0, 4);
  const brewRows = ['branco', 'verde', 'oolong', 'preto', 'mate', 'ervas'].map(teaById);

  const body = `
<section class="hero band-night">
  <div class="hero-glow" aria-hidden="true"></div>
  ${sprig({ cls: 'hero-sprig', width: 640, height: 400, leaves: 11, seed: 5 })}
  <div class="wrap hero-inner">
    <p class="eyebrow reveal">${esc(h.eyebrow)}</p>
    <h1 class="display hero-title reveal"><span>${esc(h.h1a)}</span> <em>${esc(h.h1b)}</em></h1>
    <p class="lead reveal">${esc(h.lead)}</p>
    <div class="hero-ctas reveal">
      <a class="btn btn-gold" href="${url(lang, 'quiz')}" data-event="home_cta_quiz">${esc(h.ctaQuiz)}</a>
      <a class="btn btn-ghost" href="${url(lang, 'shop')}" data-event="home_cta_shop">${esc(h.ctaGuide)}</a>
      <a class="link-arrow hero-mine" href="${url(lang, 'library')}" data-event="home_cta_library">${icon('book', 'ico-sm')} ${esc(h.ctaMine)} ${icon('arrow', 'ico-sm')}</a>
    </div>
    <dl class="hero-stats reveal">
      ${h.stats.map(([n, l]) => `<div><dt>${n}</dt><dd>${esc(l)}</dd></div>`).join('')}
    </dl>
  </div>
</section>

<section class="section band-paper paths-band" aria-labelledby="pt-title">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow eyebrow-dark">${esc(h.pathsEyebrow)}</p>
      <h2 id="pt-title" class="h2">${esc(h.pathsTitle)}</h2>
      <p class="muted">${esc(h.pathsText)}</p>
    </div>
    <ul class="path-grid">
      ${discover.interests.map(it => {
        const gs = it.guides.map(sl => products.find(p => p.slug === sl && p.status !== 'hidden')).filter(Boolean);
        const free = url(lang, ...it.free);
        return `<li class="path-card">
        ${icon(it.icon, 'ico-lg')}
        <h3 class="h4"><a href="${free}" data-event="path_free" data-path="${it.id}">${esc(it.title[lang])}</a></h3>
        <p>${esc(it.text[lang])}</p>
        <p class="path-free"><a class="link-arrow" href="${free}" data-event="path_free" tabindex="-1" aria-hidden="true">${esc(it.freeLabel[lang])} ${icon('arrow', 'ico-sm')}</a></p>
        ${gs.length ? `<p class="path-guides"><span class="label">${esc(h.pathGuide)}</span> ${gs.map(g => `<a href="${url(lang, 'shop', g.slug)}" data-event="path_guide" data-path="${it.id}">${esc(g.title[lang])}</a>`).join('<span aria-hidden="true"> · </span>')}</p>` : ''}
      </li>`; }).join('')}
    </ul>
  </div>
</section>

<section class="section band-paper-2" aria-labelledby="sh-title">
  <div class="wrap">
    <div class="section-head section-head-row">
      <div>
        <p class="eyebrow eyebrow-dark">${esc(h.shopEyebrow)}</p>
        <h2 id="sh-title" class="h2">${esc(h.shopTitle)}</h2>
        <p class="muted">${esc(h.shopText)}</p>
      </div>
      <a class="link-arrow" href="${url(lang, 'shop')}" data-event="home_all_guides">${esc(h.shopCta)} ${icon('arrow', 'ico-sm')}</a>
    </div>
    <div class="product-grid">${featured.map(p => productCard(p, lang)).join('')}</div>
  </div>
</section>

<section class="section band-paper" aria-labelledby="sp-title">
  <div class="wrap split">
    <div class="split-text">
      <p class="eyebrow eyebrow-dark">${esc(h.spectrumEyebrow)}</p>
      <h2 id="sp-title" class="h2">${esc(h.spectrumTitle)}</h2>
      <p class="muted">${esc(h.spectrumText)}</p>
      <a class="link-arrow" href="${url(lang, 'guide')}">${esc(t.nav.guide)} ${icon('arrow', 'ico-sm')}</a>
    </div>
    <div class="spectrum" data-spectrum>
      <div class="spectrum-track" role="tablist" aria-label="${esc(t.guide.oxidation)}">
        <div class="spectrum-bar" aria-hidden="true"></div>
        ${spectrum.map((tea, i) => {
          const pos = [6, 24, 50, 76, 94][i];
          return `<button role="tab" class="spectrum-dot${tea.id === 'oolong' ? ' is-active' : ''}" style="--pos:${pos}%" data-tea="${tea.id}" aria-selected="${tea.id === 'oolong'}" aria-controls="sp-panel"><span>${esc(tea.name[lang].split(/ e | & /)[0])}</span></button>`;
        }).join('')}
        <div class="spectrum-scale" aria-hidden="true"><span>0%</span><span>${esc(t.guide.oxidation)}</span><span>100%</span></div>
      </div>
      <div class="spectrum-panel" id="sp-panel" role="tabpanel" aria-live="polite">
        ${spectrum.map(tea => `<div class="sp-card" data-for="${tea.id}"${tea.id === 'oolong' ? '' : ' hidden'}>
          <div class="sp-head">${icon(tea.icon, 'ico-lg')}<div><h3 class="h3">${esc(tea.name[lang])}</h3><p class="italic">${esc(tea.tagline[lang])}</p></div></div>
          <dl class="spec-row">
            <div><dt>${esc(t.guide.oxidation)}</dt><dd>${range(tea.oxidation[0], tea.oxidation[1], '%')}</dd></div>
            <div><dt>${esc(t.guide.temp)}</dt><dd>${range(tea.temp[0], tea.temp[1], ' °C')}</dd></div>
            <div><dt>${esc(t.guide.time)}</dt><dd>${fmtTime(tea, lang)}</dd></div>
            <div><dt>${esc(t.guide.caffeine)}</dt><dd>${caf(tea, lang)}</dd></div>
          </dl>
          <p class="sp-flavor"><span class="label">${esc(t.guide.flavor)}</span> ${esc(tea.flavor[lang])}</p>
          <a class="link-arrow" href="${url(lang, 'guide')}#${tea.id}">${esc(t.quiz.seeGuide)} ${icon('arrow', 'ico-sm')}</a>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section class="section band-paper-2" aria-labelledby="bn-title">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow eyebrow-dark">${esc(h.benefitsEyebrow)}</p>
      <h2 id="bn-title" class="h2">${esc(h.benefitsTitle)}</h2>
      <p class="muted">${esc(h.benefitsText)}</p>
    </div>
    <div class="benefit-grid">
      ${benefits.map(b => `<a class="benefit-tile" href="${url(lang, 'benefits')}#${b.id}">
        ${icon(b.icon, 'ico-lg')}
        <h3 class="h4">${esc(b.title[lang])}</h3>
        <p>${esc(b.summary[lang])}</p>
        ${evidenceBadge(b.evidence, lang)}
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="section band-night brew-teaser" aria-labelledby="br-title">
  <div class="wrap split">
    <div class="split-text">
      <p class="eyebrow">${esc(h.brewEyebrow)}</p>
      <h2 id="br-title" class="h2">${esc(h.brewTitle)}</h2>
      <p class="muted-light">${esc(h.brewText)}</p>
      <a class="btn btn-gold" href="${url(lang, 'brewing')}">${esc(h.brewCta)}</a>
    </div>
    <div class="menu-card">
      <p class="menu-title">${esc(t.brewing.h1)}</p>
      <table class="menu-table">
        <thead><tr><th scope="col"></th><th scope="col">${esc(t.guide.temp)}</th><th scope="col">${esc(t.guide.time)}</th></tr></thead>
        <tbody>${brewRows.map(tea => `<tr><th scope="row"><a href="${url(lang, 'brewing')}?tea=${tea.id}">${esc(tea.name[lang])}</a></th><td>${range(tea.temp[0], tea.temp[1], ' °C')}</td><td>${fmtTime(tea, lang)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
</section>



${activeAff().length ? `<section class="section band-paper-2 gear-band" aria-labelledby="gr-title">
  <div class="wrap">
    <div class="section-head section-head-row">
      <div>
        <p class="eyebrow eyebrow-dark">${esc(t.gear.eyebrow)}</p>
        <h2 id="gr-title" class="h2">${esc(t.gear.homeTitle)}</h2>
        <p class="muted">${esc(t.gear.homeText)}</p>
      </div>
      <a class="link-arrow" href="${url(lang, 'gear')}">${esc(t.gear.all)} ${icon('arrow', 'ico-sm')}</a>
    </div>
    <div class="aff-grid">${activeAff().slice(0, 4).map(a => affCard(a, lang)).join('')}</div>
    <p class="aff-disclosure">${esc(t.gear.disclosure)}</p>
  </div>
</section>` : ''}

<section class="section band-paper about-band" aria-labelledby="ab-title">
  <div class="wrap split">
    <div class="split-text">
      <p class="eyebrow eyebrow-dark">${esc(h.aboutEyebrow)}</p>
      <h2 id="ab-title" class="h2">${esc(h.aboutTitle)}</h2>
      <p class="muted">${esc(h.aboutText)}</p>
      <a class="link-arrow" href="${url(lang, 'benefits')}">${esc(t.nav.benefits)} ${icon('arrow', 'ico-sm')}</a>
    </div>
    <ul class="about-points">${h.aboutPoints.map(([a, b]) => `<li>${icon('check', 'ico-sm')}<div><strong>${esc(a)}</strong><p class="muted">${esc(b)}</p></div></li>`).join('')}</ul>
  </div>
</section>

<section class="section band-paper-2 quiz-band">
  <div class="wrap">
    <div class="quiz-cta">
      ${icon('cup', 'ico-xl')}
      <div>
        <h2 class="h2">${esc(h.quizTitle)}</h2>
        <p class="muted">${esc(h.quizText)}</p>
      </div>
      <a class="btn btn-dark" href="${url(lang, 'quiz')}">${esc(h.quizCta)}</a>
    </div>
  </div>
</section>`;

  return layout({
    lang, key: 'home', paths: pathsFor('home'), title: h.title, description: h.description, body, dark: true,
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Botânora', url: config.siteUrl, inLanguage: ui[lang].htmlLang }
  });
}

// ---------------- GUIA ----------------
function guide(lang, products) {
  const t = ui[lang], g = t.guide;
  const groups = [['camellia', g.camellia], ['herbal', g.herbal]];
  const maxCaf = coffeeRef.caffeine[1];
  const relatedFor = id => {
    const slug = quizMap[id] && quizMap[id].product;
    return products.find(p => p.slug === slug && p.status !== 'hidden');
  };

  const teaSection = (tea, i) => {
    const rel = relatedFor(tea.id);
    return `<article class="tea-entry" id="${tea.id}">
    <div class="tea-entry-side">
      <span class="tea-num">${String(i + 1).padStart(2, '0')}</span>
      ${icon(tea.icon, 'ico-xl')}
    </div>
    <div class="tea-entry-main">
      <h3 class="h2"><a class="tea-link" href="${url(lang, 'guide', tea.id)}">${esc(tea.name[lang])}</a></h3>
      <p class="italic tagline">${esc(tea.tagline[lang])}</p>
      <p>${esc(tea.body[lang])}</p>
      <div class="ox-meter" aria-label="${esc(g.oxidation)} ${range(tea.oxidation[0], tea.oxidation[1], '%')}">
        <span class="label">${esc(g.oxidation)}</span>
        <div class="ox-track"><span style="left:${tea.oxidation[0]}%;width:${Math.max(2, tea.oxidation[1] - tea.oxidation[0])}%"></span></div>
        <span class="ox-val">${tea.family === 'herbal' ? esc(t.guide.na) : range(tea.oxidation[0], tea.oxidation[1], '%')}</span>
      </div>
      <dl class="spec-grid">
        <div>${icon('thermo', 'ico-sm')}<dt>${esc(g.temp)}</dt><dd>${range(tea.temp[0], tea.temp[1], ' °C')}</dd></div>
        <div>${icon('clock', 'ico-sm')}<dt>${esc(g.time)}</dt><dd>${fmtTime(tea, lang)}</dd></div>
        <div>${icon('spark', 'ico-sm')}<dt>${esc(g.caffeine)}</dt><dd>${caf(tea, lang)}</dd></div>
        <div>${icon('scale', 'ico-sm')}<dt>200 ml</dt><dd>${tea.grams} g${tea.resteeps ? ` · ${tea.resteeps}× ${esc(g.resteeps)}` : ''}</dd></div>
      </dl>
      <dl class="facts">
        <div><dt>${esc(g.flavor)}</dt><dd>${esc(tea.flavor[lang])}</dd></div>
        <div><dt>${esc(g.bestTime)}</dt><dd>${esc(tea.bestTime[lang])}</dd></div>
        <div><dt>${esc(g.origin)}</dt><dd>${esc(tea.origin[lang])}</dd></div>
      </dl>
      <p class="tip"><span class="label">${esc(g.tip)}</span> ${esc(tea.tip[lang])}</p>
      <div class="tea-actions">
        <a class="btn btn-dark btn-sm" href="${url(lang, 'brewing')}?tea=${tea.id}">${icon('clock', 'ico-sm')} ${esc(g.brewThis)}</a>
        ${rel ? `<a class="link-arrow" href="${url(lang, 'shop', rel.slug)}">${esc(g.related)}: ${esc(rel.title[lang])} ${icon('arrow', 'ico-sm')}</a>` : ''}
      </div>
    </div>
  </article>`;
  };

  let n = 0;
  const body = `
${pageHero({ eyebrow: g.eyebrow, h1: g.h1, lead: g.lead })}
<nav class="chip-nav band-paper" aria-label="${esc(g.h1)}">
  <div class="wrap chip-row">${teas.map(tea => `<a class="chip" href="#${tea.id}">${icon(tea.icon, 'ico-sm')}${esc(tea.name[lang])}</a>`).join('')}</div>
</nav>
${groups.map(([fam, label]) => `<section class="section band-paper tea-group">
  <div class="wrap">
    <h2 class="group-title"><span class="label">${esc(label)}</span></h2>
    ${teas.filter(x => x.family === fam).map(tea => teaSection(tea, n++)).join('')}
  </div>
</section>`).join('')}

<section class="section band-paper-2" aria-labelledby="cmp-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="cmp-title" class="h2">${esc(g.compareTitle)}</h2>
      <p class="muted">${esc(g.compareText)}</p>
    </div>
    <div class="table-scroll" tabindex="0">
      <table class="compare">
        <thead><tr><th scope="col"></th><th scope="col">${esc(g.oxidation)}</th><th scope="col">${esc(g.temp)}</th><th scope="col">${esc(g.time)}</th><th scope="col">${esc(g.caffeine)}</th><th scope="col">${esc(g.flavor)}</th><th scope="col">${esc(g.bestTime)}</th></tr></thead>
        <tbody>${teas.map(tea => `<tr><th scope="row"><a href="#${tea.id}">${esc(tea.name[lang])}</a></th><td data-l="${esc(g.oxidation)}">${tea.family === 'herbal' ? esc(g.na) : range(tea.oxidation[0], tea.oxidation[1], '%')}</td><td data-l="${esc(g.temp)}">${range(tea.temp[0], tea.temp[1], ' °C')}</td><td data-l="${esc(g.time)}">${fmtTime(tea, lang)}</td><td data-l="${esc(g.caffeine)}">${caf(tea, lang)}</td><td data-l="${esc(g.flavor)}">${esc(tea.flavor[lang])}</td><td data-l="${esc(g.bestTime)}">${esc(tea.bestTime[lang])}</td></tr>`).join('')}</tbody>
      </table>
    </div>

    <h3 class="h3 caf-title">${esc(g.caffeineTitle)}</h3>
    <div class="caf-chart" role="list">
      ${[...teas, { name: coffeeRef.name, caffeine: coffeeRef.caffeine, ref: true }].sort((a, b) => b.caffeine[1] - a.caffeine[1]).map(x => `
      <div class="caf-row${x.ref ? ' is-ref' : ''}" role="listitem">
        <span class="caf-name">${esc(x.name[lang])}</span>
        <span class="caf-track"><span class="caf-range" style="left:${x.caffeine[0] / maxCaf * 100}%;width:${Math.max(0.8, (x.caffeine[1] - x.caffeine[0]) / maxCaf * 100)}%"></span></span>
        <span class="caf-val">${x.caffeine[1] === 0 ? esc(g.none) : `${range(x.caffeine[0], x.caffeine[1])} mg`}</span>
      </div>`).join('')}
    </div>
  </div>
</section>`;

  return layout({
    lang, key: 'guide', paths: pathsFor('guide'), title: g.title, description: g.description, body, dark: true,
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: g.h1, inLanguage: t.htmlLang, publisher: { '@type': 'Organization', name: 'Botânora' } }
  });
}

// ---------------- BENEFÍCIOS ----------------
function benefitsPage(lang) {
  const t = ui[lang], b = t.benefits;
  const body = `
${pageHero({ eyebrow: b.eyebrow, h1: b.h1, lead: b.lead })}
<section class="section band-paper">
  <div class="wrap">
    <div class="evidence-legend">
      <p class="label">${esc(b.evidenceLegend)}</p>
      <ul>${['strong', 'moderate', 'early'].map(l => `<li>${evidenceBadge(l, lang)}<span>${esc(b.evidenceHelp[l])}</span></li>`).join('')}</ul>
    </div>
    <div class="filter-row" role="group" aria-label="${esc(b.evidenceLegend)}">
      <button class="chip is-active" data-filter="all" aria-pressed="true">${esc(b.filterAll)}</button>
      ${['strong', 'moderate', 'early'].map(l => `<button class="chip" data-filter="${l}" aria-pressed="false">${esc(b.evidence[l])}</button>`).join('')}
    </div>
    <div class="benefit-list">
      ${benefits.map(x => `<article class="benefit-card" id="${x.id}" data-evidence="${x.evidence}">
        <header class="benefit-head">
          ${icon(x.icon, 'ico-xl')}
          <div><h2 class="h3">${esc(x.title[lang])}</h2>${evidenceBadge(x.evidence, lang)}</div>
        </header>
        <p class="benefit-summary">${esc(x.summary[lang])}</p>
        <div class="benefit-cols">
          <div><h3 class="label">${esc(b.science)}</h3><p>${esc(x.science[lang])}</p></div>
          <div><h3 class="label">${esc(b.ritual)}</h3><p>${esc(x.ritual[lang])}</p></div>
        </div>
        <div class="benefit-teas"><h3 class="label">${esc(b.teas)}</h3>
          <div class="chip-row">${x.teas.map(id => { const tea = teaById(id); return `<a class="chip chip-sm" href="${url(lang, 'guide')}#${id}">${icon(tea.icon, 'ico-sm')}${esc(tea.name[lang])}</a>`; }).join('')}</div>
        </div>
        <p class="caution"><strong>${esc(b.caution)}:</strong> ${esc(x.caution[lang])}</p>
        ${(() => { const g = discover.benefitGuides[x.id] && store.getProduct(discover.benefitGuides[x.id]); return g && g.status !== 'hidden' ? `<p class="benefit-guide"><span class="label">${esc(t.home.pathGuide)}</span> <a href="${url(lang, 'shop', g.slug)}" data-event="cta">${esc(g.title[lang])}: ${esc(g.subtitle[lang])}</a></p>` : ''; })()}
      </article>`).join('')}
    </div>
    <p class="disclaimer">${esc(b.disclaimer)}</p>
  </div>
</section>`;
  return layout({ lang, key: 'benefits', paths: pathsFor('benefits'), title: b.title, description: b.description, body, dark: true });
}

// ---------------- PREPARO ----------------
function brewing(lang) {
  const t = ui[lang], b = t.brewing, g = t.guide;
  const body = `
${pageHero({ eyebrow: b.eyebrow, h1: b.h1, lead: b.lead, art: false })}
<section class="section band-paper brew-section">
  <div class="wrap brew-grid" data-brew>
    <div class="brew-controls">
      <fieldset>
        <legend class="label">${esc(b.choose)}</legend>
        <div class="tea-picker">
          ${teas.map((tea, i) => `<label class="tea-opt"><input type="radio" name="tea" value="${tea.id}"${i === 1 ? ' checked' : ''}><span>${icon(tea.icon, 'ico')}${esc(tea.name[lang])}</span></label>`).join('')}
        </div>
      </fieldset>
      <div class="brew-row">
        <label class="label" for="vol">${esc(b.volume)} <output id="vol-out">300 ml</output></label>
        <input type="range" id="vol" min="100" max="1000" step="50" value="300">
      </div>
      <fieldset class="brew-row">
        <legend class="label">${esc(b.strength)}</legend>
        <div class="segmented">${b.strengths.map((s, i) => `<label><input type="radio" name="strength" value="${[0.8, 1, 1.25][i]}"${i === 1 ? ' checked' : ''}><span>${esc(s)}</span></label>`).join('')}</div>
      </fieldset>
      <dl class="brew-results">
        <div>${icon('scale', 'ico')}<dt>${esc(b.dose)}</dt><dd data-out="dose"></dd><dd class="sub" data-out="spoons"></dd></div>
        <div>${icon('thermo', 'ico')}<dt>${esc(b.water)}</dt><dd data-out="temp"></dd><dd class="sub" data-out="thermo"></dd></div>
        <div>${icon('clock', 'ico')}<dt>${esc(b.steep)}</dt><dd data-out="time"></dd><dd class="sub" data-out="resteep"></dd></div>
      </dl>
      <p class="tip" data-out="tip"></p>
    </div>
    <div class="timer-card">
      <div class="timer-ring">
        <svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="90" class="ring-bg"/><circle cx="100" cy="100" r="90" class="ring-fg" pathLength="1"/></svg>
        <div class="timer-center">
          <span class="timer-name" data-out="name"></span>
          <span class="timer-time" role="timer" aria-live="off" data-out="clock">0:00</span>
          <span class="timer-status" role="status" aria-live="polite" data-done="${esc(b.done)}"></span>
        </div>
      </div>
      <div class="timer-actions">
        <button class="btn btn-gold" data-act="start" data-start="${esc(b.start)}" data-pause="${esc(b.pause)}">${esc(b.start)}</button>
        <button class="btn btn-ghost" data-act="reset">${esc(b.reset)}</button>
      </div>
      <label class="notify"><input type="checkbox" data-notify> ${esc(b.notify)}</label>
    </div>
  </div>
</section>
${activeAff().filter(a => a.category === 'preparo').length ? `<section class="section band-paper gear-inline">
  <div class="wrap">
    <div class="section-head section-head-row"><div><p class="eyebrow eyebrow-dark">${esc(t.gear.eyebrow)}</p><h2 class="h3">${esc(t.gear.brewTitle)}</h2></div><a class="link-arrow" href="${url(lang, 'gear')}">${esc(t.gear.all)} ${icon('arrow', 'ico-sm')}</a></div>
    <div class="aff-grid">${activeAff().filter(a => a.category === 'preparo').slice(0, 4).map(a => affCard(a, lang)).join('')}</div>
    <p class="aff-disclosure">${esc(t.gear.disclosure)}</p>
  </div>
</section>` : ''}
<section class="section band-paper-2">
  <div class="wrap split split-even">
    <div>
      <h2 class="h3">${esc(b.noThermo)}</h2>
      <ul class="thermo-list">${b.thermoGuide.map(([temp, name, how]) => `<li><span class="thermo-temp">${esc(temp)}</span><span><strong>${esc(name)}</strong><br><span class="muted">${esc(how)}</span></span></li>`).join('')}</ul>
    </div>
    <div>
      <h2 class="h3">${esc(b.rulesTitle)}</h2>
      <ol class="rules">${b.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
    </div>
  </div>
</section>`;
  const data = { teas: teas.map(x => ({ id: x.id, name: x.name[lang], temp: x.temp, time: x.time, grams: x.grams, resteeps: x.resteeps, tip: x.tip[lang] })), labels: { grams: b.grams, spoons: b.spoons, resteeps: g.resteeps }, thermo: b.thermoGuide };
  return layout({ lang, key: 'brewing', paths: pathsFor('brewing'), title: b.title, description: b.description, body, dark: true, data });
}

// ---------------- QUIZ ----------------
function quizPage(lang, products) {
  const t = ui[lang], q = t.quiz;
  const body = `
${pageHero({ eyebrow: q.eyebrow, h1: q.h1, lead: q.lead, art: false })}
<section class="section band-paper">
  <div class="wrap quiz-wrap">
    <div class="quiz-card" data-quiz aria-live="polite">
      <noscript><p>JavaScript é necessário para o quiz.</p></noscript>
    </div>
  </div>
</section>`;
  const data = {
    quiz: quiz.map(x => ({ q: x.q[lang], options: x.options.map(o => ({ label: o.label[lang], score: o.score })) })),
    teas: Object.fromEntries(teas.map(x => [x.id, { name: x.name[lang], tagline: x.tagline[lang], body: x.body[lang], icon: icon(x.icon, 'ico-xl'), temp: range(x.temp[0], x.temp[1], ' °C'), time: fmtTime(x, lang) }])),
    map: Object.fromEntries(Object.entries(quizMap).map(([k, v]) => {
      const p = products.find(pp => pp.slug === v.product);
      const bn = benefits.find(bb => bb.id === v.benefit);
      const recs = require('./seo').recipesForTea(k).slice(0, 2).map(r => ({ name: r.name[lang], tag: r.tag[lang], url: url(lang, 'recipes', r.slug[lang]) }));
      return [k, { product: p && p.status !== 'hidden' ? { title: p.title[lang], sub: p.subtitle[lang], url: url(lang, 'shop', p.slug), cover: cover(p, lang, 'cover-sm') } : null, benefit: { title: bn.title[lang], url: url(lang, 'benefits') + '#' + bn.id }, recipes: recs, teaUrl: url(lang, 'guide', k) }];
    })),
    urls: { guide: url(lang, 'guide'), brewing: url(lang, 'brewing') },
    l: Object.assign({ temp: t.guide.temp, time: t.guide.time }, q)
  };
  return layout({ lang, key: 'quiz', paths: pathsFor('quiz'), title: q.title, description: q.description, body, dark: true, data });
}

// ---------------- LOJA ----------------
function shop(lang, products) {
  const t = ui[lang], s = t.shop;
  const list = visible(products);
  const tags = Object.keys(discover.tagLabels).filter(tg => list.some(p => discover.infoFor(p.slug).tags.includes(tg)));
  const body = `
${pageHero({ eyebrow: s.eyebrow, h1: s.h1, lead: s.lead })}
<section class="band-paper perks-band">
  <div class="wrap perks">${s.perks.map(([a, b], i) => `<div>${icon(['download', 'device', 'lock'][i], 'ico')}<p><strong>${esc(a)}</strong><br><span class="muted">${esc(b)}</span></p></div>`).join('')}</div>
</section>
<section class="section band-paper">
  <div class="wrap">
    ${tags.length > 1 ? `<div class="filter-row shop-filter" role="group" aria-label="${esc(s.filterLabel)}" data-filter-scope=".product-grid-full .product-card" data-filter-attr="tags" data-filter-count="${esc(s.shown)}" data-filter-event="shop_filter">
      <button class="chip is-active" data-filter="all" aria-pressed="true">${esc(s.filterAll)}</button>
      ${tags.map(tg => `<button class="chip" data-filter="${tg}" aria-pressed="false">${esc(discover.tagLabels[tg][lang])}</button>`).join('')}
      <p class="filter-count tiny muted" role="status" aria-live="polite"></p>
    </div>` : ''}
    <div class="product-grid product-grid-full">${list.map(p => productCard(p, lang)).join('')}</div>
    <aside class="not-sure">
      ${icon('cup', 'ico-lg')}
      <div><h2 class="h4">${esc(s.notSure)}</h2><p class="muted">${esc(s.notSureText)}</p></div>
      <a class="btn btn-dark btn-sm" href="${url(lang, 'quiz')}" data-event="shop_quiz">${esc(s.notSureCta)}</a>
    </aside>
  </div>
</section>`;
  return layout({
    lang, key: 'shop', paths: pathsFor('shop'), title: s.title, description: s.description, body, dark: true,
    jsonLd: { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: config.siteUrl + url(lang, 'shop', p.slug), name: p.title[lang] })) }
  });
}

// ---------------- PRODUTO ----------------
function product(lang, p, products) {
  const t = ui[lang], s = t.shop, pr = t.product;
  const soon = p.status !== 'available' || !hasCheckout(p); // sem link da Cakto, mostra a lista de espera
  const pv = previewFor(p.slug, lang);
  const related = discover.relatedProducts(p, visible(products), 3);
  const info = discover.infoFor(p.slug);
  const fq = pr.faq, both = store.fileLangs(p).length > 1;
  const pFaq = [
    fq.receive, fq.devices, [fq.langs[0], fq.langs[1].replace('{l}', p.lang[lang] + (both ? '. ' + pr.bothLangs.replace(/\.$/, '') : ''))],
    pv ? [fq.preview[0], fq.preview[1].replace('{n}', pv.items.length)] : null,
    soon ? null : fq.pay, fq.other.map(x => x.replace('{d}', config.maxDevices)), fq.help.map(x => x.replace('{e}', config.contactEmail))
  ].filter(Boolean);
  const body = `
<section class="band-night product-hero">
  <div class="wrap product-layout">
    <div class="product-visual">${cover(p, lang, 'cover-lg', true)}</div>
    <div class="product-info">
      <a class="back-link" href="${url(lang, 'shop')}">← ${esc(pr.back)}</a>
      <p class="product-meta"><span class="badge ${soon ? 'badge-soon' : 'badge-ok'}">${soon ? esc(s.soon) : esc(s.available)}</span></p>
      <h1 class="display display-md">${esc(p.title[lang])}</h1>
      <p class="lead">${esc(p.subtitle[lang])}</p>
      ${info.forWho ? `<p class="for-who"><span class="label">${esc(pr.forWho)}</span> ${esc(info.forWho[lang])}</p>` : ''}
      ${soon ? '' : `<p class="price price-lg">${money(p.price, lang)}</p>`}
      <div class="product-ctas">
        <a class="btn ${soon ? 'btn-ghost' : 'btn-gold'}" href="#comprar" data-event="${soon ? 'waitlist_jump' : 'buy_jump'}" data-product="${esc(p.slug)}">${soon ? esc(s.waitlist) : esc(pr.buyNow)}</a>
        ${pv ? `<button type="button" class="btn btn-ghost" data-preview-open="0">${icon('book', 'ico-sm')} ${esc(pr.previewFree)}</button>` : ''}
      </div>
      <p class="muted-light">${esc(p.description[lang])}</p>
      <dl class="product-specs">
        <div><dt>${esc(pr.format)}</dt><dd>${esc(pr.formatValue)}</dd></div>
        <div><dt>${esc(s.pages)}</dt><dd>${p.pages}</dd></div>
        <div><dt>${esc(pr.language)}</dt><dd>${esc(p.lang[lang])}</dd></div>
        <div><dt>${esc(pr.delivery)}</dt><dd>${esc(pr.deliveryValue)}</dd></div>
      </dl>
    </div>
  </div>
</section>
${pv ? previewSection(lang, p, pv) : ''}
${freeRecipes(lang, p)}
<section class="section band-paper">
  <div class="wrap split split-even">
    <div>
      <h2 class="h3">${esc(pr.includes)}</h2>
      <ul class="check-list">${p.highlights[lang].map(h => `<li>${icon('check', 'ico-sm')}${esc(h)}</li>`).join('')}</ul>
    </div>
    <div class="buy-box" id="comprar">
      ${soon ? `<h2 class="h3">${esc(s.waitlist)}</h2>
      <p class="muted">${esc(pr.soonText)}</p>
      <form class="stack-form" data-form="waitlist" data-product="${esc(p.slug)}" novalidate>
        <label for="wl-email">${esc(pr.email)}</label>
        <input id="wl-email" type="email" name="email" required autocomplete="email" placeholder="${esc(t.newsletter.placeholder)}">
        <button class="btn btn-dark" type="submit">${esc(s.waitlist)}</button>
        <p class="form-msg" role="status" data-ok="${esc(s.waitlistDone)}" data-err="${esc(t.newsletter.err)}"></p>
      </form>`
      : buyBox(lang, p)}
    </div>
  </div>
</section>
<div class="buy-bar" aria-hidden="true">
  <div><span class="buy-bar-title">${esc(p.title[lang])}</span>${soon ? `<span class="buy-bar-sub">${esc(s.soon)}</span>` : `<strong>${money(p.price, lang)}</strong>`}</div>
  <a class="btn ${soon ? 'btn-ghost' : 'btn-gold'} btn-sm" href="#comprar" tabindex="-1">${soon ? esc(s.waitlist.split(' ')[0]) : esc(s.buy)}</a>
</div>
<section class="section band-paper" aria-labelledby="pfaq-title">
  <div class="wrap narrow">
    <h2 id="pfaq-title" class="h3">${esc(pr.faqTitle)}</h2>
    <div class="faq-list">${pFaq.map(([q, a]) => `<details class="faq-item"><summary><h3>${esc(q)}</h3></summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div>
</section>
${related.length ? `<section class="section band-paper-2">
  <div class="wrap">
    <h2 class="h3">${esc(pr.related)}</h2>
    <div class="product-grid product-grid-3">${related.map(x => productCard(x, lang)).join('')}</div>
  </div>
</section>` : ''}`;
  return layout({
    lang, key: 'shop', paths: pathsFor('shop', p.slug), title: `${p.title[lang]}: ${p.subtitle[lang]} | Botânora`, description: p.description[lang], body, dark: true, bodyClass: 'page-product', markdown: url(lang, 'shop', p.slug) + '.md',
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'Product', name: p.title[lang], description: p.description[lang], brand: { '@type': 'Brand', name: 'Botânora' },
      sku: 'BOT-' + String(p.order).padStart(2, '0'), category: lang === 'pt' ? 'Guia digital em PDF' : 'Digital PDF guide', image: [config.siteUrl + `/assets/img/covers/${p.slug}-${lang}.jpg`],
      inLanguage: ['pt-BR', 'en'], additionalProperty: [{ '@type': 'PropertyValue', name: lang === 'pt' ? 'Páginas' : 'Pages', value: p.pages }],
      offers: { '@type': 'Offer', price: (p.price / 100).toFixed(2), priceCurrency: 'BRL', availability: soon ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock', url: config.siteUrl + url(lang, 'shop', p.slug) }
    }, { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: pFaq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }]
  });
}

// Compra pela Cakto: um botão por idioma com link de checkout cadastrado no painel
const hasCheckout = p => store.LANGS.some(l => p.checkout && p.checkout[l]);
function buyBox(lang, p) {
  const pr = ui[lang].product;
  const links = store.LANGS.filter(l => p.checkout && p.checkout[l]);
  const main = links.includes(lang) ? lang : links[0];
  const other = links.find(l => l !== main);
  const name = l => pr.langNames[l];
  return `<h2 class="h3">${esc(pr.checkoutTitle)}</h2>
      <div class="buy-total"><span>${esc(p.title[lang])}</span><strong>${money(p.price, lang)}</strong></div>
      <p class="buy-fee tiny muted">${esc(pr.fee)}</p>
      <a class="btn btn-dark btn-block" href="${esc(p.checkout[main])}" rel="noopener" data-event="checkout" data-product="${esc(p.slug)}">${icon('lock', 'ico-sm')} ${esc(other ? pr.pay.replace('{l}', name(main)) : pr.payOne)}</a>
      ${!other && store.fileLangs(p).length > 1 ? `<p class="tiny muted buy-langs">${esc(pr.bothLangs)}</p>` : ''}
      ${other ? `<a class="link-arrow buy-other" href="${esc(p.checkout[other])}" rel="noopener" data-event="checkout" data-product="${esc(p.slug)}">${esc(pr.otherLang.replace('{l}', name(other)))} ${icon('arrow', 'ico-sm')}</a>` : ''}
      <ul class="buy-steps tiny muted">${pr.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <p class="tiny muted">${esc(pr.secure)}</p>`;
}

// ---------------- UTENSÍLIOS (afiliados) ----------------
function gear(lang) {
  const t = ui[lang], g = t.gear;
  const list = activeAff();
  const cats = ['preparo', 'servir', 'organizacao', 'outros'].filter(c => list.some(a => a.category === c));
  const body = `
${pageHero({ eyebrow: g.eyebrow, h1: g.h1, lead: g.lead })}
<section class="section band-paper">
  <div class="wrap">
    ${cats.length > 1 ? `<div class="filter-row" role="group" data-filter-scope=".aff-card" data-filter-attr="cat">
      <button class="chip is-active" data-filter="all" aria-pressed="true">${esc(g.cats.all)}</button>
      ${cats.map(c => `<button class="chip" data-filter="${c}" aria-pressed="false">${esc(g.cats[c])}</button>`).join('')}
    </div>` : ''}
    <div class="aff-grid aff-grid-full">${list.map(a => affCard(a, lang)).join('')}</div>
    <p class="aff-disclosure">${esc(g.disclosure)}</p>
  </div>
</section>`;
  return layout({ lang, key: 'gear', paths: pathsFor('gear'), title: g.title, description: g.description, body, dark: true });
}

// ---------------- RECEBER ----------------
function receive(lang, { notice = '', email = '', paid = false } = {}) {
  const t = ui[lang], r = t.receive;
  const note = { expired: t.library.expired, used: t.library.used, out: t.library.out, login: t.library.login }[notice];
  const body = `
${pageHero({ eyebrow: 'Botânora', h1: paid ? r.paidTitle : r.h1, lead: paid ? r.paid : r.lead, art: false })}
<section class="section band-paper">
  <div class="wrap receive-grid">
    <form class="buy-box stack-form access-form" data-access novalidate data-msg='${esc(JSON.stringify({ wrong: r.wrong, expired: r.expiredCode, notfound: r.notFound, rate: r.rate, err: t.newsletter.err, resent: r.resent, noMail: r.noMail }))}'>
      ${note ? `<p class="notice">${esc(note)}</p>` : ''}
      <div data-step="email">
        <label for="rc-email">${esc(r.email)}</label>
        <input id="rc-email" type="email" name="email" required autocomplete="email" value="${esc(email)}" placeholder="${esc(t.newsletter.placeholder)}">
        <button class="btn btn-dark btn-block" type="submit">${esc(r.sendCode)}</button>
        <p class="tiny muted">${esc(r.emailHint)}</p>
      </div>
      <div data-step="code" hidden>
        <p class="access-sent">${esc(r.codeSent)} <strong data-email-show></strong></p>
        <label for="rc-code">${esc(r.codeLabel)}</label>
        <input id="rc-code" name="code" class="code-input" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="6" placeholder="000000">
        <button class="btn btn-dark btn-block" type="submit">${icon('download', 'ico-sm')} ${esc(r.enter)}</button>
        <p class="tiny muted access-links"><button type="button" class="link-btn" data-resend>${esc(r.resend)}</button> · <button type="button" class="link-btn" data-change>${esc(r.change)}</button> · <button type="button" class="link-btn" data-backup>${esc(r.noEmail)}</button></p>
      </div>
      <div data-step="backup" hidden>
        <p class="access-sent" data-backup-intro>${esc(r.backupIntro)}</p>
        <label for="rc-phone">${esc(r.phoneLabel)}</label>
        <input id="rc-phone" name="phone" class="code-input" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="0000" autocomplete="off">
        <button class="btn btn-dark btn-block" type="submit">${icon('download', 'ico-sm')} ${esc(r.enter)}</button>
        <p class="tiny muted access-links"><button type="button" class="link-btn" data-change>${esc(r.change)}</button></p>
      </div>
      <p class="form-msg" role="status"></p>
    </form>
    <ol class="steps">${r.steps.map(([a, b], i) => `<li><span class="step-n">${String(i + 1).padStart(2, '0')}</span><div><strong>${esc(a)}</strong><p class="muted">${esc(b)}</p></div></li>`).join('')}
      <li class="steps-help"><p class="muted">${esc(r.help)} <a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a></p></li>
    </ol>
  </div>
</section>`;
  return layout({ lang, key: 'receive', paths: pathsFor('receive'), title: r.title, description: r.lead, body, dark: true, noindex: true });
}

// ---------------- BIBLIOTECA ----------------
// Mostra o e-mail sem entregar o endereço inteiro (ex.: ca•••@gmail.com)
const maskEmail = e => { const [u, d] = String(e).split('@'); return (u.length <= 2 ? u[0] : u.slice(0, 2)) + '•••@' + d; };

// Confirmação do link de entrada: o acesso só é liberado no clique
function libraryEnter(lang, token, email) {
  const lb = ui[lang].library;
  const body = `
${pageHero({ eyebrow: 'Botânora', h1: lb.enterH1, lead: lb.enterLead.replace('{email}', maskEmail(email)), art: false })}
<section class="section band-paper">
  <div class="wrap">
    <form class="buy-box stack-form enter-box" method="post" action="/api/library/enter">
      <input type="hidden" name="t" value="${esc(token)}"><input type="hidden" name="lang" value="${lang}">
      <button class="btn btn-dark btn-block" type="submit">${icon('download', 'ico-sm')} ${esc(lb.enterBtn)}</button>
      <p class="tiny muted">${esc(lb.enterNote)}</p>
    </form>
  </div>
</section>`;
  return layout({ lang, key: 'library', paths: pathsFor('library'), title: lb.title, description: lb.lead, body, dark: true, noindex: true });
}

function library(lang, email, devices = 1) {
  const t = ui[lang], lb = t.library;
  const orders = store.paidOrdersFor(email);
  const bySlug = new Map();
  for (const o of orders) if (!bySlug.has(o.product)) bySlug.set(o.product, o);
  const items = [...bySlug.values()].map(o => ({ o, p: store.getProduct(o.product) })).filter(x => x.p);
  const fmtDate = ts => new Date(ts).toLocaleDateString(t.locale);
  const body = `
${pageHero({ eyebrow: email, h1: lb.h1, lead: lb.lead, art: false })}
<section class="section-tight band-paper lib-session">
  <div class="wrap lib-session-row">
    <p class="tiny muted">${esc(lb.connected)} ${devices > 1 ? esc(lb.devices.replace('{n}', devices)) : ''}</p>
    <form method="post" action="/api/library/logout" class="lib-out"><input type="hidden" name="lang" value="${lang}">
      <button class="link-btn" type="submit">${esc(lb.logout)}</button>
      ${devices > 1 ? `<button class="link-btn" type="submit" name="all" value="1">${esc(lb.logoutAll)}</button>` : ''}
    </form>
  </div>
</section>
<section class="section band-paper">
  <div class="wrap">
    ${items.length ? `<div class="library">${items.map(({ o, p }) => {
      const langs = store.fileLangs(p);
      const def = langs.includes(o.pdfLang) ? o.pdfLang : (langs.includes(lang) ? lang : langs[0]);
      const left = Math.max(0, config.maxDownloads - o.downloads);
      return `<article class="lib-item">
        ${cover(p, def || lang, 'cover-sm')}
        <div class="lib-body">
          <h2 class="h3">${esc(p.title[lang])}</h2>
          <p class="muted">${esc(p.subtitle[lang])}</p>
          <p class="tiny muted">${esc(lb.purchased)} ${fmtDate(o.paidAt)} · ${left} ${esc(lb.left)}</p>
          ${langs.length ? `<form class="lib-form" method="get" action="/api/library/download">
            <input type="hidden" name="ui" value="${lang}"><input type="hidden" name="slug" value="${esc(p.slug)}">
            <fieldset class="lang-pick"><legend>${esc(lb.choose)}</legend>
              <div class="segmented segmented-sm">${store.LANGS.map(l => `<label><input type="radio" name="lang" value="${l}"${l === def ? ' checked' : ''}${langs.includes(l) ? '' : ' disabled'}><span>${esc(lb[l])}${langs.includes(l) ? '' : ` <small>· ${esc(lb.soon)}</small>`}</span></label>`).join('')}</div>
            </fieldset>
            <button class="btn btn-dark" type="submit" data-event="download"${left ? '' : ' disabled'}>${icon('download', 'ico-sm')} ${esc(lb.download)}</button>
          </form>` : `<p class="badge badge-soon">${esc(lb.soon)}</p>`}
        </div>
      </article>`;
    }).join('')}</div>` : `<p class="empty-state">${esc(lb.empty)}</p>`}
    <p class="lib-more"><a class="link-arrow" href="${url(lang, 'shop')}">${esc(lb.more)} ${icon('arrow', 'ico-sm')}</a></p>
  </div>
</section>`;
  return layout({ lang, key: 'library', paths: pathsFor('library'), title: lb.title, description: lb.lead, body, dark: true, noindex: true });
}

function privacy(lang) {
  const t = ui[lang].privacy;
  const body = `${pageHero({ eyebrow: 'Botânora', h1: t.h1, lead: '', art: false })}
<section class="section band-paper"><div class="wrap prose">${t.body.map(p => `<p>${esc(p)}</p>`).join('')}<p><a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a></p></div></section>`;
  return layout({ lang, key: 'privacy', paths: pathsFor('privacy'), title: t.title, description: t.body[0], body, dark: true });
}

function termsPage(lang) {
  const t = terms[lang];
  const fill = x => x.replace(/\{email\}/g, config.contactEmail).replace('{devices}', config.maxDevices).replace('{days}', config.accessDays);
  const body = `${pageHero({ eyebrow: 'Botânora', h1: t.h1, lead: t.lead, art: false })}
<section class="section band-paper"><div class="wrap prose">${t.sections.map(([h, p]) => `<h2 class="h4">${esc(h)}</h2><p>${h === t.sections[6][0] ? `${esc(fill(p).replace(/\.$/, ''))}: <a href="${url(lang, 'privacy')}">${esc(ui[lang].footer.privacy)}</a>.` : esc(fill(p))}</p>`).join('')}</div></section>`;
  return layout({ lang, key: 'terms', paths: pathsFor('terms'), title: t.title, description: t.lead, body, dark: true });
}

function notFound(lang) {
  const t = ui[lang].notFound;
  const body = `<section class="band-night nf">${sprig({ cls: 'hero-sprig', width: 520, height: 320, leaves: 7, seed: 11 })}<div class="wrap"><p class="eyebrow">404</p><h1 class="display">${esc(t.h1)}</h1><p class="lead">${esc(t.text)}</p><a class="btn btn-gold" href="${url(lang, 'home')}">${esc(t.cta)}</a></div></section>`;
  return layout({ lang, key: '', paths: pathsFor('home'), title: t.title, description: t.text, body, dark: true, noindex: true });
}

module.exports = { home, guide, benefitsPage, brewing, gear, quizPage, shop, product, receive, library, privacy, termsPage, notFound, libraryEnter };
