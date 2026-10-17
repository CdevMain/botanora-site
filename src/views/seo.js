'use strict';
// Páginas de conteúdo para busca (Google) e para IAs: um chá por página, receitas gratuitas
// e perguntas frequentes. Cada página tem resposta direta no topo, dados estruturados (JSON-LD)
// e versão em Markdown (mesma URL + .md) para leitura por IAs.
const config = require('../config');
const { ui, url, money } = require('../i18n');
const { layout, pageHero, esc } = require('./layout');
const { icon } = require('./svg');
const { cover, productCard, range } = require('./components');
const { teas } = require('../content/teas');
const { benefits } = require('../content/benefits');
const { quizMap } = require('../content/quiz');
const { faq } = require('../content/faq');
const recipes = require('../content/recipes.json');
const store = require('../store');

const T = {
  pt: {
    teaEyebrow: 'Tipos de chá', summary: 'Em resumo', howTo: 'Como preparar', step: n => `Passo ${n}`,
    benefitsTitle: 'Para que costuma ser usado', faqTitle: 'Perguntas frequentes', others: 'Outros chás', recipesTitle: 'Receitas para experimentar',
    guideCta: 'Quer ir mais fundo?', guideCtaText: 'Este assunto está completo no guia em PDF, com receitas, tabelas e técnica.', seeGuide: 'Ver o guia',
    rIndexTitle: 'Receitas de chá grátis | Botânora', rIndexH1: 'Receitas de chá', rIndexEyebrow: 'Receitas grátis',
    rIndexLead: 'Vinte receitas testadas, duas de cada guia Botânora: chás quentes e gelados, lattes, doces e salgados com chá. Com medidas, temperatura e tempo.',
    rIndexDesc: 'Receitas de chá grátis com medidas, temperatura e tempo: chá gelado, matcha, chimarrão, chai, scones, brigadeiro de matcha e mais.',
    ingredients: 'Ingredientes', method: 'Modo de preparo', finish: 'Finalização', tip: 'Dica', time: 'Tempo', yieldL: 'Rende', level: 'Nível',
    caf: 'Com cafeína', nocaf: 'Sem cafeína', iced: 'Gelado', hot: 'Quente', fromGuide: 'Do guia', more: 'Esta receita faz parte do guia', moreText: n => `O guia completo tem ${n} páginas, com mais receitas, técnica e tabelas, em português e inglês.`,
    faqTitlePage: 'Perguntas frequentes sobre chá | Botânora', faqH1: 'Perguntas sobre chá', faqEyebrow: 'Respostas diretas',
    faqLead: 'Temperatura da água, tempo de infusão, cafeína, chás para dormir, chimarrão, matcha e mais. Respostas curtas e práticas.',
    faqDesc: 'Respostas diretas sobre chá: temperatura da água, tempo de infusão, cafeína, chá para dormir, matcha, chimarrão e chá gelado.',
    general: 'Preparo e dúvidas gerais', byTea: 'Sobre cada chá', home: 'Início', guideName: 'Tipos de chá', recipesName: 'Receitas', faqName: 'Perguntas',
    teaTitle: n => `${n}: como preparar, temperatura, cafeína e sabor | Botânora`,
    caffeine: 'Cafeína', water: 'Água', steep: 'Tempo', amount: 'Quantidade', flavor: 'Sabor', origin: 'Origem', bestTime: 'Melhor momento', resteeps: 'Reinfusões',
    none: 'sem cafeína', perCup: 'por xícara de 200 ml', updated: 'Atualizado em'
  },
  en: {
    teaEyebrow: 'Types of tea', summary: 'At a glance', howTo: 'How to brew', step: n => `Step ${n}`,
    benefitsTitle: 'What it is commonly used for', faqTitle: 'Frequently asked questions', others: 'Other teas', recipesTitle: 'Recipes to try',
    guideCta: 'Want to go deeper?', guideCtaText: 'This topic is covered in full in the PDF guide, with recipes, tables and technique.', seeGuide: 'See the guide',
    rIndexTitle: 'Free tea recipes | Botânora', rIndexH1: 'Tea recipes', rIndexEyebrow: 'Free recipes',
    rIndexLead: 'Twenty tested recipes, two from each Botânora guide: hot and iced teas, lattes, sweets and savoury dishes with tea. With amounts, temperature and time.',
    rIndexDesc: 'Free tea recipes with amounts, temperature and time: iced tea, matcha, yerba mate, chai, scones, matcha brigadeiro and more.',
    ingredients: 'Ingredients', method: 'Method', finish: 'To finish', tip: 'Tip', time: 'Time', yieldL: 'Makes', level: 'Level',
    caf: 'Caffeinated', nocaf: 'Caffeine-free', iced: 'Iced', hot: 'Hot', fromGuide: 'From the guide', more: 'This recipe is part of the guide', moreText: n => `The full guide has ${n} pages, with more recipes, technique and tables, in Portuguese and English.`,
    faqTitlePage: 'Tea FAQ: brewing, caffeine and more | Botânora', faqH1: 'Questions about tea', faqEyebrow: 'Straight answers',
    faqLead: 'Water temperature, steeping time, caffeine, teas for sleep, yerba mate, matcha and more. Short, practical answers.',
    faqDesc: 'Straight answers about tea: water temperature, steeping time, caffeine, tea for sleep, matcha, yerba mate and iced tea.',
    general: 'Brewing and general questions', byTea: 'About each tea', home: 'Home', guideName: 'Types of tea', recipesName: 'Recipes', faqName: 'Questions',
    teaTitle: n => `${n}: how to brew, temperature, caffeine and flavour | Botânora`,
    caffeine: 'Caffeine', water: 'Water', steep: 'Steep', amount: 'Amount', flavor: 'Flavour', origin: 'Origin', bestTime: 'Best time', resteeps: 'Resteeps',
    none: 'caffeine-free', perCup: 'per 200 ml cup', updated: 'Updated'
  }
};

const UPDATED = '2026-10-16';
const abs = p => config.siteUrl + p;
const pathsFor = (key, ...rest) => ({ pt: url('pt', key, ...rest), en: url('en', key, ...rest) });
const teaById = id => teas.find(t => t.id === id);
const fmtTime = tea => tea.time[1] < 1 ? `${Math.round(tea.time[1] * 60)} s` : `${range(tea.time[0], tea.time[1])} min`;
const cafTxt = (tea, lang) => tea.caffeine[1] === 0 ? T[lang].none : `${range(tea.caffeine[0], tea.caffeine[1])} mg`;
const productBySlug = slug => store.db.products.find(p => p.slug === slug && p.status !== 'hidden');
const recipeBySlug = (lang, slug) => recipes.find(r => r.slug[lang] === slug || r.slug.pt === slug || r.slug.en === slug);
const recipePaths = r => ({ pt: url('pt', 'recipes', r.slug.pt), en: url('en', 'recipes', r.slug.en) });

// Receitas ligadas a cada chá (por palavras dos ingredientes)
const TEA_WORDS = { branco: ['branco', 'bai mu dan', 'shou mei'], verde: ['chá verde', 'sencha', 'long jing', 'gyokuro', 'jasmim'], matcha: ['matcha'], oolong: ['oolong'],
  preto: ['chá preto', 'assam', 'ceylon', 'earl grey', 'chai'], puer: ['pu-erh'], mate: ['erva-mate', 'mate'], rooibos: ['rooibos'], ervas: ['camomila', 'melissa', 'capim', 'hibisco', 'hortelã', 'gengibre', 'canela'] };
function recipesForTea(id) {
  const words = TEA_WORDS[id] || [];
  return recipes.filter(r => r.ingredients.some(i => words.some(w => i.item.pt.toLowerCase().includes(w))) || words.some(w => r.name.pt.toLowerCase().includes(w))).slice(0, 4);
}

function isoMinutes(txt) {
  let m = 0;
  const h = /(\d+)\s*h/.exec(txt); if (h) m += 60 * +h[1];
  const mm = /(\d+)\s*min/.exec(txt); if (mm) m += +mm[1];
  if (/noite|overnight|dia|day|semana|week/i.test(txt)) return null;
  return m ? `PT${m}M` : null;
}

function breadcrumbLd(items) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })) };
}
function faqLd(list, lang) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: list.map(f => ({ '@type': 'Question', name: f.q[lang], acceptedAnswer: { '@type': 'Answer', text: f.a[lang] } })) };
}
const crumbs = (lang, items) => `<nav class="crumbs wrap" aria-label="breadcrumb"><ol>${items.map(([n, p], i) => i < items.length - 1 ? `<li><a href="${p}">${esc(n)}</a></li>` : `<li aria-current="page">${esc(n)}</li>`).join('')}</ol></nav>`;

function faqBlock(list, lang, open = false) {
  return `<div class="faq-list">${list.map(f => `<details class="faq-item" id="${f.id}"${open ? ' open' : ''}><summary><h3>${esc(f.q[lang])}</h3></summary><p>${esc(f.a[lang])}</p></details>`).join('')}</div>`;
}

function guideCta(lang, p) {
  if (!p) return '';
  const t = T[lang];
  return `<aside class="guide-cta">
  <div class="guide-cta-cover">${cover(p, lang, 'cover-sm')}</div>
  <div><p class="label">${esc(t.guideCta)}</p><h3 class="h3">${esc(p.title[lang])}</h3><p class="muted">${esc(p.subtitle[lang])}. ${esc(t.guideCtaText)}</p>
  <a class="btn btn-dark btn-sm" href="${url(lang, 'shop', p.slug)}" data-event="cta">${esc(t.seeGuide)}${p.status === 'available' ? ` · ${money(p.price, lang)}` : ''}</a></div>
</aside>`;
}

function recipeCard(r, lang) {
  const t = T[lang];
  return `<a class="recipe-card" href="${recipePaths(r)[lang]}">
  <span class="label">${esc(t.fromGuide)} ${String(r.guideNumber).padStart(2, '0')}</span>
  <h3>${esc(r.name[lang])}</h3><p>${esc(r.tag[lang])}</p>
  <span class="recipe-card-meta">${icon('clock', 'ico-sm')} ${esc(r.time[lang])} · ${r.iced ? esc(t.iced) : esc(t.hot)} · ${r.caffeine ? esc(t.caf) : esc(t.nocaf)}</span>
</a>`;
}

// ---------------- CHÁ ----------------
function teaPage(lang, tea) {
  const t = T[lang], g = ui[lang].guide;
  const name = tea.name[lang];
  const p = productBySlug(quizMap[tea.id] && quizMap[tea.id].product);
  const tFaq = faq.filter(f => f.tea === tea.id);
  const bens = benefits.filter(b => (b.teas || []).includes(tea.id));
  const recs = recipesForTea(tea.id);
  const others = teas.filter(x => x.id !== tea.id);
  const paths = pathsFor('guide', tea.id);
  const facts = [
    [t.water, range(tea.temp[0], tea.temp[1], ' °C')], [t.steep, fmtTime(tea)], [t.amount, `${tea.grams} g · 200 ml`],
    [t.caffeine, cafTxt(tea, lang)], [t.flavor, tea.flavor[lang]], [t.origin, tea.origin[lang]], [t.bestTime, tea.bestTime[lang]]
  ];
  if (tea.resteeps) facts.push([t.resteeps, String(tea.resteeps)]);
  const answer = lang === 'pt'
    ? `${name}: use ${tea.grams} g de folha para 200 ml de água a ${range(tea.temp[0], tea.temp[1], ' °C')} e deixe em infusão por ${fmtTime(tea)}. Cafeína: ${cafTxt(tea, lang)} ${t.perCup}. Sabor: ${tea.flavor[lang].toLowerCase()}.`
    : `${name}: use ${tea.grams} g of leaf per 200 ml of water at ${range(tea.temp[0], tea.temp[1], ' °C')} and steep for ${fmtTime(tea)}. Caffeine: ${cafTxt(tea, lang)} ${t.perCup}. Flavour: ${tea.flavor[lang].toLowerCase()}.`;
  const steps = lang === 'pt'
    ? [`Aqueça a água a ${range(tea.temp[0], tea.temp[1], ' °C')}.`, `Use ${tea.grams} g de folha para cada 200 ml.`, `Deixe em infusão por ${fmtTime(tea)} e retire as folhas.`, tea.tip.pt]
    : [`Heat the water to ${range(tea.temp[0], tea.temp[1], ' °C')}.`, `Use ${tea.grams} g of leaf for every 200 ml.`, `Steep for ${fmtTime(tea)}, then remove the leaves.`, tea.tip.en];
  const crumbItems = [[t.home, url(lang, 'home')], [t.guideName, url(lang, 'guide')], [name, paths[lang]]];
  const body = `${pageHero({ eyebrow: t.teaEyebrow, h1: name, lead: tea.tagline[lang] })}
${crumbs(lang, crumbItems)}
<section class="section band-paper seo-page">
  <div class="wrap seo-grid">
    <article class="seo-main">
      <p class="answer"><strong>${esc(t.summary)}.</strong> ${esc(answer)}</p>
      <p>${esc(tea.body[lang])}</p>
      <h2 class="h3">${esc(t.howTo)}</h2>
      <ol class="steps-list">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      ${bens.length ? `<h2 class="h3">${esc(t.benefitsTitle)}</h2><ul class="check-list">${bens.map(b => `<li>${icon('check', 'ico-sm')}<span><a href="${url(lang, 'benefits')}#${b.id}">${esc(b.title[lang])}</a>: ${esc(b.summary[lang])}</span></li>`).join('')}</ul>` : ''}
      ${tFaq.length ? `<h2 class="h3">${esc(t.faqTitle)}</h2>${faqBlock(tFaq, lang, true)}` : ''}
    </article>
    <aside class="seo-side">
      <div class="fact-box"><h2 class="label">${esc(t.summary)}</h2><dl>${facts.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl></div>
      ${guideCta(lang, p)}
    </aside>
  </div>
</section>
${recs.length ? `<section class="section band-paper-2"><div class="wrap"><h2 class="h3">${esc(t.recipesTitle)}</h2><div class="recipe-grid">${recs.map(r => recipeCard(r, lang)).join('')}</div></div></section>` : ''}
<section class="section band-paper"><div class="wrap"><h2 class="h3">${esc(t.others)}</h2><div class="chip-row">${others.map(o => `<a class="chip" href="${url(lang, 'guide', o.id)}">${esc(o.name[lang])}</a>`).join('')}</div></div></section>`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: t.teaTitle(name).replace(' | Botânora', ''), description: answer, inLanguage: lang === 'pt' ? 'pt-BR' : 'en',
      author: { '@type': 'Organization', name: 'Botânora', url: config.siteUrl }, publisher: { '@type': 'Organization', name: 'Botânora', logo: { '@type': 'ImageObject', url: abs('/assets/img/icon-512.png') } },
      dateModified: UPDATED, datePublished: UPDATED, mainEntityOfPage: abs(paths[lang]), image: abs('/assets/img/og.png') },
    breadcrumbLd(crumbItems)
  ];
  if (tFaq.length) ld.push(faqLd(tFaq, lang));
  return layout({ lang, key: 'guide', paths, title: t.teaTitle(name), description: answer.slice(0, 158), body, dark: true, jsonLd: ld, markdown: paths[lang] + '.md' });
}

// ---------------- RECEITAS ----------------
function recipesIndex(lang) {
  const t = T[lang];
  const groups = {};
  recipes.forEach(r => { (groups[r.guide] = groups[r.guide] || []).push(r); });
  const body = `${pageHero({ eyebrow: t.rIndexEyebrow, h1: t.rIndexH1, lead: t.rIndexLead })}
<section class="section band-paper"><div class="wrap">
  ${Object.entries(groups).map(([slug, list]) => { const p = productBySlug(slug); return `<div class="recipe-group"><h2 class="label">${esc(t.fromGuide)}: ${p ? `<a href="${url(lang, 'shop', slug)}">${esc(p.title[lang])}</a>` : esc(slug)}</h2><div class="recipe-grid">${list.map(r => recipeCard(r, lang)).join('')}</div></div>`; }).join('')}
</div></section>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: recipes.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(recipePaths(r)[lang]), name: r.name[lang] })) },
    breadcrumbLd([[t.home, url(lang, 'home')], [t.recipesName, url(lang, 'recipes')]])];
  return layout({ lang, key: 'recipes', paths: pathsFor('recipes'), title: t.rIndexTitle, description: t.rIndexDesc, body, dark: true, jsonLd: ld, markdown: url(lang, 'recipes') + '.md' });
}

function recipePage(lang, r) {
  const t = T[lang];
  const p = productBySlug(r.guide);
  const paths = recipePaths(r);
  const crumbItems = [[t.home, url(lang, 'home')], [t.recipesName, url(lang, 'recipes')], [r.name[lang], paths[lang]]];
  const title = `${r.name[lang]}: ${lang === 'pt' ? 'receita' : 'recipe'} | Botânora`;
  const desc = `${r.tag[lang]} ${lang === 'pt' ? 'Ingredientes' : 'Ingredients'}: ${r.ingredients.map(i => i.item[lang]).slice(0, 4).join(', ')}. ${t.time}: ${r.time[lang]}.`;
  const body = `${pageHero({ eyebrow: t.fromGuide + (p ? ' ' + p.title[lang] : ''), h1: r.name[lang], lead: r.tag[lang] })}
${crumbs(lang, crumbItems)}
<section class="section band-paper seo-page">
  <div class="wrap seo-grid">
    <article class="seo-main recipe-page">
      <div class="recipe-meta">
        <span>${icon('clock', 'ico-sm')} ${esc(r.time[lang])}</span><span>${icon('cup', 'ico-sm')} ${esc(r.yield[lang])}</span>
        <span>${icon(r.iced ? 'ice' : 'thermo', 'ico-sm')} ${r.iced ? esc(t.iced) : esc(t.hot)}</span><span>${icon(r.caffeine ? 'spark' : 'moon', 'ico-sm')} ${r.caffeine ? esc(t.caf) : esc(t.nocaf)}</span>
        <span>${icon('scale', 'ico-sm')} ${esc(r.level[lang])}</span>
      </div>
      <h2 class="h3">${esc(t.ingredients)}</h2>
      <table class="ing-table"><tbody>${r.ingredients.map(i => `<tr><td>${esc(i.qty[lang])}</td><td>${esc(i.item[lang])}</td></tr>`).join('')}</tbody></table>
      <h2 class="h3">${esc(t.method)}</h2>
      <ol class="steps-list">${r.steps.map(s => `<li>${esc(s[lang])}</li>`).join('')}</ol>
      ${r.finish ? `<p><strong>${esc(t.finish)}:</strong> ${esc(r.finish[lang])}</p>` : ''}
      ${r.tip ? `<p class="answer"><strong>${esc(t.tip)}:</strong> ${esc(r.tip[lang])}</p>` : ''}
    </article>
    <aside class="seo-side">
      ${p ? `<div class="fact-box"><p class="label">${esc(t.more)}</p><p>${esc(t.moreText(p.pages))}</p></div>` : ''}
      ${guideCta(lang, p)}
    </aside>
  </div>
</section>
<section class="section band-paper-2"><div class="wrap"><h2 class="h3">${esc(t.recipesTitle)}</h2><div class="recipe-grid">${recipes.filter(x => x !== r).sort((a, b) => (a.guide === r.guide ? -1 : 0) - (b.guide === r.guide ? -1 : 0)).slice(0, 4).map(x => recipeCard(x, lang)).join('')}</div></div></section>`;
  const recipeLd = {
    '@context': 'https://schema.org', '@type': 'Recipe', name: r.name[lang], description: r.tag[lang], inLanguage: lang === 'pt' ? 'pt-BR' : 'en',
    image: [abs(`/assets/img/covers/${r.guide}-${lang}.jpg`)], author: { '@type': 'Organization', name: 'Botânora', url: config.siteUrl }, datePublished: UPDATED,
    recipeCategory: lang === 'pt' ? (r.iced ? 'Bebida gelada' : 'Bebida') : (r.iced ? 'Cold drink' : 'Drink'), recipeCuisine: lang === 'pt' ? 'Brasileira' : 'Brazilian',
    keywords: [r.name[lang], lang === 'pt' ? 'chá' : 'tea', p ? p.title[lang] : ''].filter(Boolean).join(', '),
    recipeYield: r.yield[lang], recipeIngredient: r.ingredients.map(i => `${i.qty[lang]} ${i.item[lang]}`),
    recipeInstructions: r.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s[lang] }))
  };
  const tt = isoMinutes(r.time[lang]); if (tt) recipeLd.totalTime = tt;
  return layout({ lang, key: 'recipes', paths, title, description: desc.slice(0, 158), body, dark: true, jsonLd: [recipeLd, breadcrumbLd(crumbItems)], markdown: paths[lang] + '.md' });
}

// ---------------- PERGUNTAS ----------------
function faqPage(lang) {
  const t = T[lang];
  const general = faq.filter(f => !f.tea);
  const byTea = teas.map(tea => [tea, faq.filter(f => f.tea === tea.id)]).filter(([, l]) => l.length);
  const body = `${pageHero({ eyebrow: t.faqEyebrow, h1: t.faqH1, lead: t.faqLead })}
<section class="section band-paper seo-page"><div class="wrap narrow">
  <h2 class="h3">${esc(t.general)}</h2>${faqBlock(general, lang)}
  <h2 class="h3">${esc(t.byTea)}</h2>
  ${byTea.map(([tea, l]) => `<h3 class="label"><a href="${url(lang, 'guide', tea.id)}">${esc(tea.name[lang])}</a></h3>${faqBlock(l, lang)}`).join('')}
</div></section>`;
  const ld = [faqLd(faq, lang), breadcrumbLd([[t.home, url(lang, 'home')], [t.faqName, url(lang, 'faq')]])];
  return layout({ lang, key: 'faq', paths: pathsFor('faq'), title: t.faqTitlePage, description: t.faqDesc, body, dark: true, jsonLd: ld, markdown: url(lang, 'faq') + '.md' });
}

// ---------------- MARKDOWN (para IAs) ----------------
function mdTea(lang, tea) {
  const t = T[lang], name = tea.name[lang];
  const p = productBySlug(quizMap[tea.id] && quizMap[tea.id].product);
  const tFaq = faq.filter(f => f.tea === tea.id);
  return `# ${name}\n\n> ${tea.tagline[lang]}\n\n${tea.body[lang]}\n\n## ${t.summary}\n\n- ${t.water}: ${range(tea.temp[0], tea.temp[1], ' °C')}\n- ${t.steep}: ${fmtTime(tea)}\n- ${t.amount}: ${tea.grams} g / 200 ml\n- ${t.caffeine}: ${cafTxt(tea, lang)} ${t.perCup}\n- ${t.flavor}: ${tea.flavor[lang]}\n- ${t.origin}: ${tea.origin[lang]}\n- ${t.bestTime}: ${tea.bestTime[lang]}\n\n${t.tip}: ${tea.tip[lang]}\n\n` +
    (tFaq.length ? `## ${t.faqTitle}\n\n${tFaq.map(f => `### ${f.q[lang]}\n\n${f.a[lang]}`).join('\n\n')}\n\n` : '') +
    (p ? `## ${t.guideCta}\n\n[${p.title[lang]}](${abs(url(lang, 'shop', p.slug))}): ${p.subtitle[lang]}.\n` : '') + `\nFonte: ${abs(url(lang, 'guide', tea.id))}\n`;
}
function mdRecipe(lang, r) {
  const t = T[lang], p = productBySlug(r.guide);
  return `# ${r.name[lang]}\n\n> ${r.tag[lang]}\n\n- ${t.time}: ${r.time[lang]}\n- ${t.yieldL}: ${r.yield[lang]}\n- ${r.iced ? t.iced : t.hot} · ${r.caffeine ? t.caf : t.nocaf} · ${t.level}: ${r.level[lang]}\n\n## ${t.ingredients}\n\n${r.ingredients.map(i => `- ${i.qty[lang]} ${i.item[lang]}`).join('\n')}\n\n## ${t.method}\n\n${r.steps.map((s, i) => `${i + 1}. ${s[lang]}`).join('\n')}\n\n` +
    (r.finish ? `${t.finish}: ${r.finish[lang]}\n\n` : '') + (r.tip ? `${t.tip}: ${r.tip[lang]}\n\n` : '') + (p ? `${t.more}: [${p.title[lang]}](${abs(url(lang, 'shop', p.slug))}).\n` : '') + `\nFonte: ${abs(recipePaths(r)[lang])}\n`;
}
function mdFaq(lang) {
  const t = T[lang];
  return `# ${t.faqH1}\n\n${t.faqLead}\n\n${faq.map(f => `## ${f.q[lang]}\n\n${f.a[lang]}`).join('\n\n')}\n\nFonte: ${abs(url(lang, 'faq'))}\n`;
}
function mdRecipes(lang) {
  const t = T[lang];
  return `# ${t.rIndexH1}\n\n${t.rIndexLead}\n\n${recipes.map(r => `- [${r.name[lang]}](${abs(recipePaths(r)[lang])}): ${r.tag[lang]}`).join('\n')}\n`;
}
function mdProduct(lang, p) {
  const pr = ui[lang].product;
  return `# ${p.title[lang]}\n\n> ${p.subtitle[lang]}\n\n${p.description[lang]}\n\n- ${lang === 'pt' ? 'Formato' : 'Format'}: PDF A4, ${p.pages} ${lang === 'pt' ? 'páginas' : 'pages'}\n- ${pr.language}: ${p.lang[lang]}\n- ${lang === 'pt' ? 'Preço' : 'Price'}: ${money(p.price, lang)}\n\n## ${pr.includes}\n\n${p.highlights[lang].map(h => `- ${h}`).join('\n')}\n\n${lang === 'pt' ? 'Comprar' : 'Buy'}: ${abs(url(lang, 'shop', p.slug))}\n`;
}

// ---------------- llms.txt ----------------
function llmsTxt(full = false) {
  const prods = store.db.products.filter(p => p.status === 'available');
  const L = [];
  L.push('# Botânora', '');
  L.push('> Botânora é uma central independente e bilíngue (português do Brasil e inglês) sobre chás: tipos de chá, preparo correto (temperatura, tempo e quantidade), cafeína, benefícios com nível de evidência, receitas e guias em PDF. Botânora is an independent, bilingual (Brazilian Portuguese and English) tea hub: tea types, correct brewing, caffeine, evidence-graded benefits, recipes and PDF guides.', '');
  L.push('Conteúdo educativo, sem promessas de cura. Valores de cafeína são médias por xícara de 200 ml. Todas as páginas existem em PT-BR (/pt/...) e EN (/en/...), e cada página de conteúdo tem uma versão em Markdown adicionando .md ao final da URL.', '');
  L.push('## Tipos de chá / Types of tea', '');
  teas.forEach(tea => L.push(`- [${tea.name.pt}](${abs(url('pt', 'guide', tea.id))}) ([EN](${abs(url('en', 'guide', tea.id))})): água ${range(tea.temp[0], tea.temp[1], ' °C')}, ${fmtTime(tea)}, cafeína ${cafTxt(tea, 'pt')} por xícara. ${tea.flavor.pt}.`));
  L.push('', '## Guias em PDF / PDF guides', '');
  prods.forEach(p => L.push(`- [${p.title.pt} / ${p.title.en}](${abs(url('pt', 'shop', p.slug))}): ${p.subtitle.pt}. ${p.pages} páginas, PT-BR e EN, ${money(p.price, 'pt')}.`));
  L.push('', '## Receitas grátis / Free recipes', '');
  recipes.forEach(r => L.push(`- [${r.name.pt}](${abs(recipePaths(r).pt)}) ([EN](${abs(recipePaths(r).en)})): ${r.tag.pt}`));
  L.push('', '## Páginas principais / Main pages', '');
  [['guide', 'Tipos de chá'], ['benefits', 'Benefícios do chá com nível de evidência'], ['brewing', 'Guia de preparo com timer'], ['faq', 'Perguntas frequentes'], ['recipes', 'Receitas'], ['quiz', 'Quiz: qual chá é para você'], ['gear', 'Utensílios recomendados'], ['shop', 'Loja de guias']]
    .forEach(([k, n]) => L.push(`- [${n}](${abs(url('pt', k))}) ([EN](${abs(url('en', k))}))`));
  if (full) {
    L.push('', '## Perguntas frequentes (respostas completas)', '');
    faq.forEach(f => L.push(`### ${f.q.pt}`, '', f.a.pt, '', `*${f.q.en}* ${f.a.en}`, ''));
    L.push('## Benefícios / Benefits', '');
    benefits.forEach(b => L.push(`### ${b.title.pt}`, '', `${b.summary.pt} ${b.science ? b.science.pt : ''}`.trim(), ''));
  } else {
    L.push('', '## Optional', '', `- [Versão completa com todas as respostas](${abs('/llms-full.txt')})`);
  }
  L.push('', `Contato: ${config.contactEmail}`, '');
  return L.join('\n');
}

module.exports = { teaPage, recipesIndex, recipePage, faqPage, mdTea, mdRecipe, mdFaq, mdRecipes, mdProduct, llmsTxt, recipes, recipeBySlug, recipePaths, teaById };
