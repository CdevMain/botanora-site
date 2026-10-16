'use strict';
const { ui, url, money, routes } = require('../i18n');
const { layout, pageHero } = require('./layout');
const { sprig, icon } = require('./svg');
const { cover, productCard, evidenceBadge, range, esc, affCard } = require('./components');
const { teas, coffeeRef } = require('../content/teas');
const { benefits } = require('../content/benefits');
const { quiz, quizMap } = require('../content/quiz');
const config = require('../config');
const store = require('../store');
const { signAccess } = require('../access');
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

function previewSection(lang, p, pv) {
  const t = ui[lang].product.preview;
  const items = pv.items.map(x => ({ src: '/assets/img/previews/' + x.file, page: x.page }));
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
    <div class="pv-top"><span class="pv-count" aria-live="polite"></span><button type="button" class="pv-close" data-preview-close aria-label="${esc(t.close)}">&times;</button></div>
    <div class="pv-stage">
      <button type="button" class="pv-nav pv-prev" data-preview-step="-1" aria-label="${esc(t.prev)}">‹</button>
      <img class="pv-img" alt="">
      <button type="button" class="pv-nav pv-next" data-preview-step="1" aria-label="${esc(t.next)}">›</button>
    </div>
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
      <a class="btn btn-gold" href="${url(lang, 'quiz')}">${esc(h.ctaQuiz)}</a>
      <a class="btn btn-ghost" href="${url(lang, 'guide')}">${esc(h.ctaGuide)}</a>
    </div>
    <dl class="hero-stats reveal">
      ${h.stats.map(([n, l]) => `<div><dt>${n}</dt><dd>${esc(l)}</dd></div>`).join('')}
    </dl>
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

<section class="section band-paper" aria-labelledby="sh-title">
  <div class="wrap">
    <div class="section-head section-head-row">
      <div>
        <p class="eyebrow eyebrow-dark">${esc(h.shopEyebrow)}</p>
        <h2 id="sh-title" class="h2">${esc(h.shopTitle)}</h2>
        <p class="muted">${esc(h.shopText)}</p>
      </div>
      <a class="link-arrow" href="${url(lang, 'shop')}">${esc(h.shopCta)} ${icon('arrow', 'ico-sm')}</a>
    </div>
    <div class="product-grid">${featured.map(p => productCard(p, lang)).join('')}</div>
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

<section class="section band-paper quiz-band">
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
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Botanora', url: config.siteUrl, inLanguage: ui[lang].htmlLang }
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
      <h3 class="h2">${esc(tea.name[lang])}</h3>
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
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: g.h1, inLanguage: t.htmlLang, publisher: { '@type': 'Organization', name: 'Botanora' } }
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
      return [k, { product: p && p.status !== 'hidden' ? { title: p.title[lang], url: url(lang, 'shop', p.slug), cover: cover(p, lang, 'cover-sm') } : null, benefit: { title: bn.title[lang], url: url(lang, 'benefits') + '#' + bn.id } }];
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
  const body = `
${pageHero({ eyebrow: s.eyebrow, h1: s.h1, lead: s.lead })}
<section class="band-paper perks-band">
  <div class="wrap perks">${s.perks.map(([a, b], i) => `<div>${icon(['download', 'device', 'lock'][i], 'ico')}<p><strong>${esc(a)}</strong><br><span class="muted">${esc(b)}</span></p></div>`).join('')}</div>
</section>
<section class="section band-paper">
  <div class="wrap">
    <div class="product-grid product-grid-full">${list.map(p => productCard(p, lang)).join('')}</div>
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
  const soon = p.status !== 'available';
  const pv = previewFor(p.slug, lang);
  const related = visible(products).filter(x => x.slug !== p.slug).sort((a, b) => (a.status === 'available' ? -1 : 1) - (b.status === 'available' ? -1 : 1)).slice(0, 3);
  const body = `
<section class="band-night product-hero">
  <div class="wrap product-layout">
    <div class="product-visual">${cover(p, lang, 'cover-lg', true)}</div>
    <div class="product-info">
      <a class="back-link" href="${url(lang, 'shop')}">← ${esc(pr.back)}</a>
      <p class="product-meta"><span class="badge ${soon ? 'badge-soon' : 'badge-ok'}">${soon ? esc(s.soon) : esc(s.available)}</span></p>
      <h1 class="display display-md">${esc(p.title[lang])}</h1>
      <p class="lead">${esc(p.subtitle[lang])}</p>
      ${soon ? '' : `<p class="price price-lg">${money(p.price, lang)}</p>`}
      <p class="muted-light">${esc(p.description[lang])}</p>
      <dl class="product-specs">
        <div><dt>${esc(pr.format)}</dt><dd>${esc(pr.formatValue)}</dd></div>
        <div><dt>${esc(s.pages)}</dt><dd>${p.pages}</dd></div>
        <div><dt>${esc(pr.language)}</dt><dd>${esc(p.lang[lang])}</dd></div>
      </dl>
      ${pv ? `<p class="product-preview-cta"><button type="button" class="btn btn-ghost btn-sm" data-preview-open="0">${icon('book', 'ico-sm')} ${esc(pr.preview.open)}</button></p>` : ''}
    </div>
  </div>
</section>
${pv ? previewSection(lang, p, pv) : ''}
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
      : `<h2 class="h3">${esc(pr.checkoutTitle)}</h2>
      <form class="stack-form" data-form="checkout" data-product="${esc(p.slug)}" novalidate>
        <label for="co-name">${esc(pr.name)}</label>
        <input id="co-name" name="name" required autocomplete="name" maxlength="80">
        <label for="co-email">${esc(pr.email)}</label>
        <input id="co-email" type="email" name="email" required autocomplete="email" maxlength="120">
        <fieldset class="lang-pick">
          <legend>${esc(pr.pdfLang)}</legend>
          <div class="segmented segmented-sm">${store.LANGS.map(l => { const ok = store.fileLangs(p).includes(l); return `<label><input type="radio" name="pdfLang" value="${l}"${l === (store.fileLangs(p).includes(lang) ? lang : store.fileLangs(p)[0]) ? ' checked' : ''}${ok ? '' : ' disabled'}><span>${l === 'pt' ? 'Português' : 'English'}${ok ? '' : ` <small>· ${esc(s.soon)}</small>`}</span></label>`; }).join('')}</div>
          <p class="tiny muted">${esc(pr.pdfLangHint)}</p>
        </fieldset>
        <label class="check"><input type="checkbox" name="consent" required> <span>${esc(pr.consent)}</span></label>
        <div class="buy-total"><span>${esc(p.title[lang])}</span><strong>${money(p.price, lang)}</strong></div>
        <button class="btn btn-dark btn-block" type="submit">${icon('lock', 'ico-sm')} ${esc(pr.pay)}</button>
        <p class="form-msg" role="status" data-err="${esc(t.newsletter.err)}"></p>
        <p class="tiny muted">${esc(pr.secure)}</p>
      </form>`}
    </div>
  </div>
</section>
<div class="buy-bar" aria-hidden="true">
  <div><span class="buy-bar-title">${esc(p.title[lang])}</span>${soon ? `<span class="buy-bar-sub">${esc(s.soon)}</span>` : `<strong>${money(p.price, lang)}</strong>`}</div>
  <a class="btn ${soon ? 'btn-ghost' : 'btn-gold'} btn-sm" href="#comprar" tabindex="-1">${soon ? esc(s.waitlist.split(' ')[0]) : esc(s.buy)}</a>
</div>
${related.length ? `<section class="section band-paper-2">
  <div class="wrap">
    <h2 class="h3">${esc(pr.related)}</h2>
    <div class="product-grid product-grid-3">${related.map(x => productCard(x, lang)).join('')}</div>
  </div>
</section>` : ''}`;
  return layout({
    lang, key: 'shop', paths: pathsFor('shop', p.slug), title: `${p.title[lang]}: ${p.subtitle[lang]} | Botanora`, description: p.description[lang], body, dark: true, bodyClass: 'page-product',
    jsonLd: {
      '@context': 'https://schema.org', '@type': 'Product', name: p.title[lang], description: p.description[lang], brand: { '@type': 'Brand', name: 'Botanora' },
      offers: { '@type': 'Offer', price: (p.price / 100).toFixed(2), priceCurrency: 'BRL', availability: soon ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock', url: config.siteUrl + url(lang, 'shop', p.slug) }
    }
  });
}

// ---------------- PEDIDO ----------------
function order(lang, o, p, extra) {
  const t = ui[lang], od = t.order;
  const left = Math.max(0, config.maxDownloads - o.downloads);
  const statusTxt = od[o.status] || o.status;
  let content = '';
  if (o.status === 'paid') {
    const langs = p ? store.fileLangs(p) : [];
    const main = langs.includes(o.pdfLang) ? o.pdfLang : langs[0];
    const other = langs.find(l => l !== main);
    const lib = url(lang, 'library') + '?t=' + signAccess(o.email);
    content = `<div class="order-paid">
      ${icon('check', 'ico-xl')}
      <h2 class="h3">${esc(od.paid)}</h2>
      ${main ? `<a class="btn btn-gold" href="/download/${esc(o.id)}?t=${esc(o.token)}&amp;lang=${main}" data-event="download">${icon('download', 'ico-sm')} ${esc(od.download)} · ${main.toUpperCase()}</a>
      ${other ? `<a class="link-arrow" href="/download/${esc(o.id)}?t=${esc(o.token)}&amp;lang=${other}" data-event="download">${other === 'en' ? 'Download in English' : 'Baixar em português'} ${icon('arrow', 'ico-sm')}</a>` : ''}
      <p class="tiny muted-light">${left} ${esc(od.downloads)}</p>` : ''}
      <a class="btn btn-ghost btn-sm" href="${lib}">${esc(od.library)}</a>
      <p class="muted-light">${esc(od.keep)}</p>
    </div>`;
  } else if (o.status === 'pending') {
    if (extra.mpUrl) {
      content = `<div class="order-pay"><a class="btn btn-gold" href="${esc(extra.mpUrl)}">${esc(od.mp)}</a><p class="muted-light">${esc(od.waiting)}</p></div>`;
    } else if (extra.pix) {
      content = `<div class="order-pay">
        <h2 class="h3">${esc(od.pixTitle)}</h2>
        <p class="muted-light">${esc(od.pixText)}</p>
        <div class="pix-qr" data-qr="${esc(extra.pix)}"></div>
        <div class="pix-copy"><input readonly value="${esc(extra.pix)}" aria-label="PIX"><button class="btn btn-gold btn-sm" data-copy data-copied="${esc(od.copied)}">${esc(od.copy)}</button></div>
        <p class="muted-light">${esc(od.waiting)}</p>
      </div>`;
    } else {
      content = `<div class="order-pay"><p class="muted-light">${esc(od.noPix)}</p></div>`;
    }
  }
  const body = `
<section class="band-night order-section">
  <div class="wrap order-wrap" data-order="${esc(o.id)}" data-token="${esc(o.token)}" data-status="${esc(o.status)}">
    <p class="eyebrow">${esc(od.h1)} ${esc(o.id)}</p>
    <h1 class="display display-md">${esc(p ? p.title[lang] : o.title)}</h1>
    <div class="order-summary">
      <span class="badge ${o.status === 'paid' ? 'badge-ok' : 'badge-soon'}">${esc(statusTxt)}</span>
      <span>${esc(od.amount)}: <strong>${money(o.amount, lang)}</strong></span>
    </div>
    ${content}
  </div>
</section>`;
  const paths = { pt: url('pt', 'order', o.id) + '?t=' + o.token, en: url('en', 'order', o.id) + '?t=' + o.token };
  return layout({ lang, key: 'shop', paths, title: od.title, description: od.title, body, dark: true, noindex: true, bodyClass: 'page-order' });
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
function receive(lang, { expired = false, email = '' } = {}) {
  const t = ui[lang], r = t.receive;
  const body = `
${pageHero({ eyebrow: 'Botanora', h1: r.h1, lead: r.lead, art: false })}
<section class="section band-paper">
  <div class="wrap receive-grid">
    <form class="buy-box stack-form" data-form="access" novalidate>
      ${expired ? `<p class="notice">${esc(t.library.expired)}</p>` : ''}
      <label for="rc-email">${esc(r.email)}</label>
      <input id="rc-email" type="email" name="email" required autocomplete="email" value="${esc(email)}" placeholder="${esc(t.newsletter.placeholder)}">
      <label for="rc-code">${esc(r.code)}${mailer.enabled() ? ` <span class="opt">(${esc(r.codeOptional)})</span>` : ''}</label>
      <input id="rc-code" name="code" autocomplete="off" maxlength="60" placeholder="Ex.: ABC1234">
      <p class="tiny muted">${esc(r.codeHint)}</p>
      <button class="btn btn-dark btn-block" type="submit">${icon('download', 'ico-sm')} ${esc(r.submit)}</button>
      <p class="form-msg" role="status" data-ok="${esc(r.sent)}" data-need="${esc(r.needCode)}" data-err="${esc(r.notFound)}"></p>
    </form>
    <ol class="steps">${r.steps.map(([a, b], i) => `<li><span class="step-n">${String(i + 1).padStart(2, '0')}</span><div><strong>${esc(a)}</strong><p class="muted">${esc(b)}</p></div></li>`).join('')}
      <li class="steps-help"><p class="muted">${esc(r.help)} <a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a></p></li>
    </ol>
  </div>
</section>`;
  return layout({ lang, key: 'receive', paths: pathsFor('receive'), title: r.title, description: r.lead, body, dark: true, noindex: true });
}

// ---------------- BIBLIOTECA ----------------
function library(lang, email, token) {
  const t = ui[lang], lb = t.library;
  const orders = store.paidOrdersFor(email);
  const bySlug = new Map();
  for (const o of orders) if (!bySlug.has(o.product)) bySlug.set(o.product, o);
  const items = [...bySlug.values()].map(o => ({ o, p: store.getProduct(o.product) })).filter(x => x.p);
  const fmtDate = ts => new Date(ts).toLocaleDateString(t.locale);
  const body = `
${pageHero({ eyebrow: email, h1: lb.h1, lead: lb.lead, art: false })}
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
            <input type="hidden" name="t" value="${esc(token)}"><input type="hidden" name="slug" value="${esc(p.slug)}">
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
  const q = '?t=' + token;
  return layout({ lang, key: 'library', paths: { pt: url('pt', 'library') + q, en: url('en', 'library') + q }, title: lb.title, description: lb.lead, body, dark: true, noindex: true });
}

function privacy(lang) {
  const t = ui[lang].privacy;
  const body = `${pageHero({ eyebrow: 'Botanora', h1: t.h1, lead: '', art: false })}
<section class="section band-paper"><div class="wrap prose">${t.body.map(p => `<p>${esc(p)}</p>`).join('')}<p><a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a></p></div></section>`;
  return layout({ lang, key: 'privacy', paths: pathsFor('privacy'), title: t.title, description: t.body[0], body, dark: true });
}

function notFound(lang) {
  const t = ui[lang].notFound;
  const body = `<section class="band-night nf">${sprig({ cls: 'hero-sprig', width: 520, height: 320, leaves: 7, seed: 11 })}<div class="wrap"><p class="eyebrow">404</p><h1 class="display">${esc(t.h1)}</h1><p class="lead">${esc(t.text)}</p><a class="btn btn-gold" href="${url(lang, 'home')}">${esc(t.cta)}</a></div></section>`;
  return layout({ lang, key: '', paths: pathsFor('home'), title: t.title, description: t.text, body, dark: true, noindex: true });
}

module.exports = { home, guide, benefitsPage, brewing, gear, quizPage, shop, product, order, receive, library, privacy, notFound };
