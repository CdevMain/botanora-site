'use strict';
const config = require('../config');
const { ui, url } = require('../i18n');
const { logo, icon, sprig } = require('./svg');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function layout({ lang, key, paths, title, description, body, bodyClass = '', jsonLd = null, dark = false, noindex = false, data = null, markdown = null }) {
  const t = ui[lang];
  const other = t.other;
  const nav = ['guide', 'benefits', 'brewing', 'recipes', 'gear', 'quiz', 'shop'];
  const canonical = config.siteUrl + paths[lang];
  const ld = [{
    '@context': 'https://schema.org', '@type': 'Organization', name: 'Botânora', alternateName: 'Botanora', url: config.siteUrl,
    logo: config.siteUrl + '/assets/img/og.png', email: config.contactEmail
  }];
  if (jsonLd) Array.isArray(jsonLd) ? ld.push(...jsonLd) : ld.push(jsonLd);

  return `<!doctype html>
<html lang="${t.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<link rel="alternate" hreflang="pt-BR" href="${esc(config.siteUrl + paths.pt)}">
<link rel="alternate" hreflang="en" href="${esc(config.siteUrl + paths.en)}">
<link rel="alternate" hreflang="x-default" href="${esc(config.siteUrl + paths.pt)}">
${markdown ? `<link rel="alternate" type="text/markdown" href="${esc(config.siteUrl + markdown)}" title="Markdown">` : ''}
${config.googleVerification ? `<meta name="google-site-verification" content="${esc(config.googleVerification)}">` : ''}
${config.bingVerification ? `<meta name="msvalidate.01" content="${esc(config.bingVerification)}">` : ''}
<meta name="robots" content="${noindex ? 'noindex' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Botânora">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${config.siteUrl}/assets/img/og.png">
<meta property="og:locale" content="${lang === 'pt' ? 'pt_BR' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#121B22">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preload" href="/assets/fonts/eb-garamond-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jost-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${ASSET_V}">
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld).replace(/</g, '\\u003c')}</script>
</head>
<body class="${bodyClass}${dark ? ' header-dark' : ''}" data-lang="${lang}"${config.gaId ? ` data-ga="${esc(config.gaId)}"` : ''}${config.clarityId ? ` data-clarity="${esc(config.clarityId)}"` : ''}>
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-header" id="top">
  <div class="wrap header-inner">
    <a class="brand" href="${url(lang, 'home')}" aria-label="Botânora, ${esc(t.tagline)}">${logo()}</a>
    <nav class="main-nav" id="main-nav" aria-label="Principal">
      <ul>
        ${nav.map(k => `<li><a href="${url(lang, k)}"${k === key ? ' aria-current="page"' : ''}>${esc(t.nav[k])}</a></li>`).join('')}
      </ul>
      <div class="menu-extra">
        <a class="btn btn-gold" href="${url(lang, 'shop')}">${esc(t.nav.shop)}</a>
        <a class="btn btn-ghost" href="${url(lang, 'library')}">${icon('book', 'ico-sm')} ${esc(t.nav.myGuides)}</a>
      </div>
      <a class="my-guides" href="${url(lang, 'library')}" title="${esc(t.nav.myGuides)}"${key === 'library' || key === 'receive' ? ' aria-current="page"' : ''}>${icon('book', 'ico-sm')}<span>${esc(t.nav.myGuides)}</span></a>
      <a class="lang-switch" href="${esc(paths[other])}" hreflang="${other}" data-event="lang_switch" lang="${other === 'pt' ? 'pt-BR' : 'en'}">
        <span class="lang-cur">${t.langShort}</span><span class="lang-sep">/</span><span>${esc(ui[other].langShort)}</span>
      </a>
    </nav>
    <button class="menu-btn" aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span class="sr">${esc(t.menu)}</span></button>
  </div>
</header>
<main id="main">
${body}
</main>
<section class="newsletter band-night" aria-labelledby="nl-title">
  ${sprig({ cls: 'nl-sprig', width: 420, height: 260, leaves: 7, seed: 7 })}
  <div class="wrap nl-inner">
    <div>
      <p class="eyebrow">Botânora</p>
      <h2 id="nl-title" class="h2">${esc(t.newsletter.title)}</h2>
      <p class="muted-light">${esc(t.newsletter.text)}</p>
    </div>
    <form class="nl-form" data-form="newsletter" novalidate>
      <label class="sr" for="nl-email">E-mail</label>
      <input id="nl-email" type="email" name="email" required autocomplete="email" placeholder="${esc(t.newsletter.placeholder)}">
      <button class="btn btn-gold" type="submit">${esc(t.newsletter.button)}</button>
      <p class="form-msg" role="status" data-ok="${esc(t.newsletter.ok)}" data-err="${esc(t.newsletter.err)}"></p>
      <p class="nl-consent tiny muted-light">${esc(t.newsletter.consent)} <a href="${url(lang, 'privacy')}">${esc(t.newsletter.privacy)}</a></p>
    </form>
  </div>
</section>
<footer class="site-footer band-night">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      ${logo('logo logo-lg')}
      <p class="muted-light">${esc(t.footer.about)}</p>
    </div>
    <div>
      <h3 class="label">${esc(t.footer.learn)}</h3>
      <ul>${['guide', 'benefits', 'brewing', 'recipes', 'gear', 'quiz', 'faq'].map(k => `<li><a href="${url(lang, k)}">${esc(t.nav[k])}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h3 class="label">${esc(t.footer.shop)}</h3>
      <ul><li><a href="${url(lang, 'shop')}">${esc(t.nav.shop)}</a></li><li><a href="${url(lang, 'receive')}">${esc(t.footer.receive)}</a></li><li><a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a></li></ul>
    </div>
    <div>
      <h3 class="label">${esc(t.footer.legal)}</h3>
      <ul><li><a href="${url(lang, 'privacy')}">${esc(t.footer.privacy)}</a></li><li><a href="${url(lang, 'terms')}">${esc(t.footer.terms)}</a></li>${config.gaId || config.clarityId ? `<li><button type="button" class="link-btn" data-consent-open>${esc(t.footer.cookies)}</button></li>` : ''}</ul>
      <p class="tiny muted-light">${esc(t.footer.analytics)}</p>
    </div>
  </div>
  <div class="wrap footer-base">
    <p class="tiny">${esc(t.footer.disclaimer)}</p>
    <p class="tiny">© ${new Date().getFullYear()} Botânora. ${esc(t.footer.rights)}</p>
  </div>
</footer>
${config.gaId || config.clarityId ? `<div class="consent" role="dialog" aria-live="polite" aria-label="${esc(t.consent.label)}" hidden data-consent>
  <p>${esc(t.consent.text)} <a href="${url(lang, 'privacy')}">${esc(t.consent.more)}</a></p>
  <div class="consent-actions">
    <button type="button" class="btn btn-ghost btn-sm" data-consent-choice="necessary">${esc(t.consent.reject)}</button>
    <button type="button" class="btn btn-gold btn-sm" data-consent-choice="all">${esc(t.consent.accept)}</button>
  </div>
</div>` : ''}
${data ? `<script id="page-data" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>` : ''}
<script src="/assets/js/site.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

const ASSET_V = Date.now().toString(36);

// Cabeçalho de página interna
function pageHero({ eyebrow, h1, lead, art = true, extra = '' }) {
  return `<section class="page-hero band-night">
  ${art ? sprig({ cls: 'hero-sprig hero-sprig-sm', width: 520, height: 320, leaves: 9, seed: 3 }) : ''}
  <div class="wrap">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1 class="display">${esc(h1)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ''}
    ${extra}
  </div>
</section>`;
}

module.exports = { layout, pageHero, esc, icon };
