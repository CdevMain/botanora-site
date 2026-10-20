'use strict';
// "Com o que você tem": a pessoa marca os ingredientes da despensa e recebe a melhor
// receita grátis que dá para fazer. Receitas dos guias pagos só aparecem como chamada
// (nome, guia e quantos ingredientes a pessoa tem), nunca com quantidades ou preparo.
// O índice dos guias (content/pantry-index.json) fica só no servidor.
const free = [...require('./content/recipes.json'), ...require('./content/pantry-recipes.json')];
const guideIndex = require('./content/pantry-index.json');

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// key, nome PT, nome EN, grupo, padrão (sobre o texto do ingrediente em PT, sem acento)
const CATALOG = [
  ['cha-preto', 'Chá preto', 'Black tea', 'chas', /cha preto|earl grey|assam|ceylon|darjeeling|lapsang|english breakfast|keemun/],
  ['cha-verde', 'Chá verde', 'Green tea', 'chas', /cha verde|sencha|long jing|gyokuro|bancha|genmaicha|kukicha|kabusecha|gunpowder|verde chines/],
  ['matcha', 'Matcha', 'Matcha', 'chas', /matcha/],
  ['cha-branco', 'Chá branco', 'White tea', 'chas', /cha branco|bai mu dan|shou mei|silver needle/],
  ['oolong', 'Oolong', 'Oolong', 'chas', /oolong|tie guan yin/],
  ['hojicha', 'Hojicha', 'Hojicha', 'chas', /hojicha/],
  ['puer', 'Pu-erh', 'Pu-erh', 'chas', /pu-?erh/],
  ['rooibos', 'Rooibos', 'Rooibos', 'chas', /rooibos/],
  ['erva-mate', 'Erva-mate / chá-mate', 'Yerba mate / mate tea', 'chas', /erva-?mate|cha-?mate|\bmate\b|chimarrao|terere/],
  ['camomila', 'Camomila', 'Chamomile', 'ervas', /camomila/],
  ['hortela', 'Hortelã', 'Mint', 'ervas', /hortela|\bmenta\b/],
  ['capim-cidreira', 'Capim-cidreira', 'Lemongrass', 'ervas', /capim|lemongrass/],
  ['erva-doce', 'Erva-doce', 'Fennel seed', 'ervas', /erva-?doce|funcho/],
  ['hibisco', 'Hibisco', 'Hibiscus', 'ervas', /hibisc/],
  ['melissa', 'Melissa', 'Lemon balm', 'ervas', /melissa|erva-cidreira/],
  ['lavanda', 'Lavanda', 'Lavender', 'ervas', /lavanda/],
  ['alecrim', 'Alecrim', 'Rosemary', 'ervas', /alecrim/],
  ['manjericao', 'Manjericão', 'Basil', 'ervas', /manjeric/],
  ['jasmim', 'Jasmim', 'Jasmine', 'ervas', /jasmim/],
  ['limao', 'Limão', 'Lemon / lime', 'frutas', /limao|limoes|\blima\b|siciliano/],
  ['laranja', 'Laranja', 'Orange', 'frutas', /laranja|tangerina|mexerica/],
  ['maca', 'Maçã', 'Apple', 'frutas', /\bmacas?\b/],
  ['abacaxi', 'Abacaxi', 'Pineapple', 'frutas', /abacaxi/],
  ['maracuja', 'Maracujá', 'Passion fruit', 'frutas', /maracuja/],
  ['frutas-vermelhas', 'Morango e frutas vermelhas', 'Strawberries and berries', 'frutas', /morango|framboesa|mirtilo|amora|cereja|frutas vermelhas/],
  ['pessego', 'Pêssego', 'Peach', 'frutas', /pessego/],
  ['banana', 'Banana', 'Banana', 'frutas', /banana/],
  ['coco', 'Coco', 'Coconut', 'frutas', /\bcoco\b/],
  ['manga', 'Manga', 'Mango', 'frutas', /\bmanga\b/],
  ['canela', 'Canela', 'Cinnamon', 'especiarias', /canela/],
  ['cravo', 'Cravo-da-índia', 'Cloves', 'especiarias', /cravo/],
  ['gengibre', 'Gengibre', 'Ginger', 'especiarias', /gengibre/],
  ['anis', 'Anis-estrelado', 'Star anise', 'especiarias', /\banis/],
  ['cardamomo', 'Cardamomo', 'Cardamom', 'especiarias', /cardamomo/],
  ['pimenta', 'Pimenta-do-reino', 'Black pepper', 'especiarias', /pimenta/],
  ['baunilha', 'Baunilha', 'Vanilla', 'especiarias', /baunilha/],
  ['noz-moscada', 'Noz-moscada', 'Nutmeg', 'especiarias', /noz-?moscada/],
  ['curcuma', 'Cúrcuma', 'Turmeric', 'especiarias', /curcuma|acafrao-da-terra/],
  ['leite', 'Leite', 'Milk', 'laticinios', /\bleite\b(?! condensado| de coco| em po)/],
  ['leite-condensado', 'Leite condensado', 'Condensed milk', 'laticinios', /leite condensado/],
  ['creme-de-leite', 'Creme de leite', 'Cream', 'laticinios', /creme de leite|\bnata\b|chantilly/],
  ['manteiga', 'Manteiga', 'Butter', 'laticinios', /manteiga/],
  ['iogurte', 'Iogurte', 'Yogurt', 'laticinios', /iogurte/],
  ['queijo', 'Queijo', 'Cheese', 'laticinios', /queijo|cream cheese|mascarpone/],
  ['ovo', 'Ovos', 'Eggs', 'laticinios', /\bovos?\b|gemas?\b|claras?\b/],
  ['mel', 'Mel', 'Honey', 'despensa', /\bmel\b/],
  ['acucar', 'Açúcar', 'Sugar', 'despensa', /acucar|rapadura|melado/],
  ['chocolate', 'Chocolate ou cacau', 'Chocolate or cocoa', 'despensa', /chocolate|cacau/],
  ['farinha', 'Farinha', 'Flour', 'despensa', /farinha|polvilho|amido/],
  ['aveia', 'Aveia', 'Oats', 'despensa', /aveia/],
  ['arroz', 'Arroz', 'Rice', 'despensa', /\barroz\b/],
  ['agua-com-gas', 'Água com gás ou tônica', 'Sparkling water or tonic', 'despensa', /com gas|tonica|club soda|gaseificada/],
  ['shoyu', 'Shoyu', 'Soy sauce', 'despensa', /shoyu|molho de soja/]
];
const GROUPS = { chas: ['Chás', 'Teas'], ervas: ['Ervas e flores', 'Herbs and flowers'], frutas: ['Frutas', 'Fruit'], especiarias: ['Especiarias', 'Spices'], laticinios: ['Leite, ovos e afins', 'Dairy and eggs'], despensa: ['Despensa', 'Pantry'] };
// Sempre à mão: não contam como ingrediente que falta
const BASIC = /^(agua|gelo|sal\b|agua fervente|agua fria|agua gelada|agua quente|agua a \d)/;
const isBasic = item => { const n = norm(item); return (BASIC.test(n) && !/coco|gas|tonica|rosas/.test(n)) || /^gelo|^cubos de gelo/.test(n); };
// Trocas aceitas: quem tem um, pode usar o outro
const SWAP = { mel: ['acucar'], acucar: ['mel'] };

function keysOf(item) {
  const n = norm(item);
  return CATALOG.filter(c => c[4].test(n)).map(c => c[0]);
}
// Ingredientes de uma receita: { keys: Set, other: [itens sem chave] }
// itens: textos em PT; qtys (opcional): quantidades, para reconhecer "a gosto" e "opcional"
function analyse(items, qtys = []) {
  const keys = new Set(), other = [];
  for (const [n, it] of items.entries()) {
    if (isBasic(it)) continue;
    const opt = /opcional|a gosto/.test(norm(it + ' ' + (qtys[n] || '')));
    const k = keysOf(it);
    if (k.length) { if (!opt) k.forEach(x => keys.add(x)); }
    else if (!opt) other.push(it);
  }
  return { keys, other };
}

let FREE = free.map(r => ({ r, ...analyse(r.ingredients.map(i => i.item.pt), r.ingredients.map(i => i.qty.pt)) }));
const PAID = guideIndex.filter(x => !x.free).map(x => ({ x, ...analyse(x.items) }));

// Lista de ingredientes que aparecem em alguma receita, por grupo
let used = new Set([...FREE, ...PAID].flatMap(e => [...e.keys]));
// Recalcula quando o banco de receitas publica ou tira uma receita do ar
function refresh() {
  const live = require('./views/seo').recipes;
  FREE = live.map(r => ({ r, ...analyse(r.ingredients.map(i => i.item.pt), r.ingredients.map(i => i.qty.pt)) }));
  used = new Set([...FREE, ...PAID].flatMap(e => [...e.keys]));
}
function chips(lang) {
  const i = lang === 'en' ? 2 : 1;
  return Object.entries(GROUPS).map(([g, names]) => ({
    group: g, label: names[lang === 'en' ? 1 : 0],
    items: CATALOG.filter(c => c[3] === g && used.has(c[0])).map(c => ({ key: c[0], label: c[i] }))
  })).filter(g => g.items.length);
}
const labelOf = (key, lang) => { const c = CATALOG.find(x => x[0] === key); return c ? c[lang === 'en' ? 2 : 1] : key; };

function score(e, have) {
  const covered = [], missing = [];
  for (const k of e.keys) (have.has(k) || (SWAP[k] || []).some(s => have.has(s)) ? covered : missing).push(k);
  const miss = missing.length + e.other.length;
  return { covered, missing, miss, total: e.keys.size + e.other.length };
}
const better = (a, b) => a.s.miss - b.s.miss || b.s.covered.length - a.s.covered.length || a.s.total - b.s.total;

function suggest(haveKeys, lang, { products = [], url }) {
  const have = new Set(haveKeys.filter(k => CATALOG.some(c => c[0] === k)));
  if (!have.size) return { best: null, more: [], guides: [] };
  const freeRanked = FREE.map(e => ({ e, s: score(e, have) })).filter(x => x.s.covered.length).sort(better);
  const card = ({ e, s }) => ({
    slug: e.r.slug[lang], name: e.r.name[lang], tag: e.r.tag[lang], time: e.r.time[lang], iced: e.r.iced, caffeine: e.r.caffeine,
    pantry: !!e.r.pantry, url: url(lang, 'recipes', e.r.slug[lang]),
    have: s.covered.map(k => labelOf(k, lang)),
    missing: [...s.missing.map(k => labelOf(k, lang)), ...e.other.map(o => (e.r.ingredients.find(i => i.item.pt === o) || { item: { [lang]: o } }).item[lang])],
    ingredients: e.r.ingredients.map(i => ({ qty: i.qty[lang], item: i.item[lang], ok: isBasic(i.item.pt) || keysOf(i.item.pt).some(k => have.has(k) || (SWAP[k] || []).some(x => have.has(x))) }))
  });
  const best = freeRanked[0] ? card(freeRanked[0]) : null;
  const more = freeRanked.slice(1).filter(x => x.s.miss <= 2).slice(0, 4).map(card);
  // Guias: receitas pagas que dá para fazer (ou quase) com o que a pessoa tem; um destaque por guia
  const seen = new Set(), guides = [];
  for (const x of PAID.map(e => ({ e, s: score(e, have) })).filter(x => x.s.covered.length >= 2 && x.s.miss <= 1).sort(better)) {
    const p = products.find(pp => pp.order === x.e.x.guideNumber);
    if (!p || seen.has(p.slug)) continue;
    seen.add(p.slug);
    guides.push({ recipe: x.e.x.name[lang], guide: p.title[lang], url: url(lang, 'shop', p.slug), cover: `/assets/img/covers/${p.slug}-${lang}.jpg`, have: x.s.covered.length, total: x.s.total, ready: x.s.miss === 0 });
    if (guides.length === 3) break;
  }
  return { best, more, guides };
}

module.exports = { chips, suggest, freeRecipes: free, labelOf, keysOf, refresh };
