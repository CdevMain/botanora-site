'use strict';
const { ui, url, money } = require('../i18n');
const { icon } = require('./svg');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fs = require('fs');
const path = require('path');
const COVER_DIR = path.join(__dirname, '..', '..', 'public', 'assets', 'img', 'covers');
const coverCache = new Map();
// Capa ilustrada por idioma (covers/<slug>-<lang>.jpg); cai para a outra língua ou para a capa gerada em CSS
function coverSrc(slug, lang) {
  const key = slug + lang;
  if (!coverCache.has(key)) {
    const pick = [lang, lang === 'pt' ? 'en' : 'pt'].map(l => `${slug}-${l}.jpg`).find(f => fs.existsSync(path.join(COVER_DIR, f)));
    coverCache.set(key, pick ? '/assets/img/covers/' + pick : null);
  }
  return coverCache.get(key);
}

function cover(p, lang, cls = '', eager = false) {
  const src = coverSrc(p.slug, lang);
  if (src) {
    return `<div class="cover cover-img ${cls}"><img src="${src}" alt="${esc(p.title[lang])}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" width="1000" height="1414"></div>`;
  }
  const n = String(p.order).padStart(2, '0');
  return `<div class="cover ${cls}" role="img" aria-label="${esc(p.title[lang])}">
    <span class="cover-top">Botanora · Nº ${n}</span>
    <span class="cover-ring">${icon(p.icon || 'leaf', 'cover-ico')}</span>
    <span class="cover-title">${esc(p.title[lang])}</span>
    <span class="cover-sub">${esc(p.subtitle[lang])}</span>
    <span class="cover-base"></span>
  </div>`;
}

function productCard(p, lang) {
  const t = ui[lang].shop;
  const href = url(lang, 'shop', p.slug);
  const soon = p.status !== 'available';
  return `<article class="product-card${soon ? ' is-soon' : ''}">
    <a href="${href}" class="product-cover-link" tabindex="-1" aria-hidden="true">${cover(p, lang)}</a>
    <div class="product-body">
      <p class="product-meta"><span class="badge ${soon ? 'badge-soon' : 'badge-ok'}">${soon ? esc(t.soon) : esc(t.available)}</span><span>${p.pages} ${esc(t.pages)}</span></p>
      <h3 class="product-title"><a href="${href}">${esc(p.title[lang])}</a></h3>
      <p class="product-sub">${esc(p.subtitle[lang])}</p>
      <div class="product-foot">
        ${soon ? `<a class="link-arrow" href="${href}">${esc(t.waitlist)} ${icon('arrow', 'ico-sm')}</a>`
        : `<span class="price">${money(p.price, lang)}</span><a class="btn btn-dark btn-sm" href="${href}">${esc(t.buy)}</a>`}
      </div>
    </div>
  </article>`;
}

function evidenceBadge(level, lang) {
  const label = ui[lang].benefits.evidence[level];
  const dots = { strong: 3, moderate: 2, early: 1 }[level];
  return `<span class="evidence evidence-${level}" title="${esc(label)}"><span class="dots">${[1, 2, 3].map(i => `<i${i <= dots ? ' class="on"' : ''}></i>`).join('')}</span>${esc(label)}</span>`;
}

function range(a, b, unit = '') {
  return a === b ? `${a}${unit}` : `${a}–${b}${unit}`;
}

function affImage(a) {
  if (a.imageFile) return '/media/' + a.imageFile;
  if (a.image && /^https:\/\//.test(a.image)) return a.image;
  return null;
}

function affCard(a, lang) {
  const g = ui[lang].gear;
  const img = affImage(a);
  const title = a.title[lang] || a.title.pt;
  return `<article class="aff-card" data-cat="${esc(a.category)}">
    <a class="aff-media${img ? '' : ' aff-media-ico'}" href="/r/${esc(a.id)}" target="_blank" rel="sponsored nofollow noopener" tabindex="-1" aria-hidden="true">
      ${img ? `<img src="${esc(img)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : icon(a.icon || 'teapot', 'aff-ico')}
    </a>
    <div class="aff-body">
      <p class="aff-meta"><span>${esc(g.cats[a.category] || '')}</span><span class="aff-store aff-${esc(a.store)}">${esc(g.stores[a.store] || a.store)}</span></p>
      <h3 class="aff-title"><a href="/r/${esc(a.id)}" target="_blank" rel="sponsored nofollow noopener">${esc(title)}</a></h3>
      ${a.note && (a.note[lang] || a.note.pt) ? `<p class="aff-note">${esc(a.note[lang] || a.note.pt)}</p>` : ''}
      <a class="link-arrow aff-cta" href="/r/${esc(a.id)}" target="_blank" rel="sponsored nofollow noopener">${esc(g.cta)} ${esc(g.stores[a.store] || '')} ↗</a>
    </div>
  </article>`;
}

module.exports = { affCard, affImage, coverSrc, cover, productCard, evidenceBadge, range, esc };
