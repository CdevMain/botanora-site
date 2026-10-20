'use strict';
// Banco de receitas não publicadas.
//
// Como funciona:
//  1. Lê as receitas dos guias em PDF (content/pantry-index.json, que só existe no servidor) e as grátis do site,
//     e conta quais ingredientes aparecem juntos (ex.: chá verde + hortelã aparece em N receitas).
//  2. Cria rascunhos NOVOS a partir dos pares mais fortes: base de chá + 1 ou 2 aromáticos + acabamento,
//     quente, gelado ou latte. Uma combinação que já existe em qualquer guia ou no site é descartada,
//     então nenhuma receita paga é copiada.
//  3. Medidas, temperatura e tempo vêm de modelos fixos por ingrediente e do guia de preparo do site.
//  4. Nada vai ao ar sozinho: o rascunho é revisado (e testado na cozinha) no painel e publicado
//     na hora ou agendado. Publicadas viram receitas grátis, com página própria, no índice e no sitemap.
//  5. Todo dia entram novos rascunhos até manter uma fila de 20.
const crypto = require('crypto');
const store = require('./store');
const { teas } = require('./content/teas');
const { quizMap } = require('./content/quiz');

const L = (pt, en) => ({ pt, en });
// Bases (chá ou tisana principal). temp em °C, min = minutos de infusão
const BASES = {
  'cha-preto': { tea: 'preto', name: L('Chá Preto', 'Black Tea'), qty: L('1 sachê ou 2 g', '1 bag or 2 g'), item: L('chá preto', 'black tea'), temp: 95, min: 4, caf: true, note: L('o malte do chá preto', 'the malt of black tea'), latte: true },
  'cha-verde': { tea: 'verde', name: L('Chá Verde', 'Green Tea'), qty: L('1 sachê ou 2 g', '1 bag or 2 g'), item: L('chá verde', 'green tea'), temp: 80, min: 3, caf: true, note: L('o frescor vegetal do chá verde', 'the fresh, green notes of green tea') },
  'cha-branco': { tea: 'branco', name: L('Chá Branco', 'White Tea'), qty: L('2 colheres (chá) ou 2 g', '2 tsp or 2 g'), item: L('chá branco', 'white tea'), temp: 80, min: 4, caf: true, note: L('a doçura delicada do chá branco', 'the delicate sweetness of white tea') },
  oolong: { tea: 'oolong', name: L('Oolong', 'Oolong'), qty: L('1 colher (chá) ou 3 g', '1 tsp or 3 g'), item: L('oolong', 'oolong'), temp: 90, min: 4, caf: true, note: L('o floral tostado do oolong', 'the toasty florals of oolong'), latte: true },
  rooibos: { tea: 'rooibos', name: L('Rooibos', 'Rooibos'), qty: L('1 sachê ou 2 g', '1 bag or 2 g'), item: L('rooibos', 'rooibos'), temp: 100, min: 6, caf: false, note: L('o adocicado amadeirado do rooibos', 'the woody sweetness of rooibos'), latte: true },
  'erva-mate': { tea: 'mate', name: L('Chá-Mate', 'Toasted Mate'), qty: L('1 colher (sopa) ou 1 sachê', '1 tbsp or 1 bag'), item: L('chá-mate tostado', 'toasted mate tea'), temp: 95, min: 5, caf: true, note: L('o tostado do chá-mate', 'the roast of mate tea'), latte: true },
  hibisco: { tea: 'ervas', name: L('Hibisco', 'Hibiscus'), qty: L('1 colher (sopa) de flores secas', '1 tbsp dried flowers'), item: L('hibisco', 'hibiscus'), temp: 100, min: 6, caf: false, note: L('a acidez frutada do hibisco', 'the fruity tartness of hibiscus') },
  camomila: { tea: 'ervas', name: L('Camomila', 'Chamomile'), qty: L('1 colher (sopa) de flores ou 1 sachê', '1 tbsp flowers or 1 bag'), item: L('camomila', 'chamomile'), temp: 95, min: 5, caf: false, note: L('o mel floral da camomila', 'the honeyed florals of chamomile'), latte: true },
  'capim-cidreira': { tea: 'ervas', name: L('Capim-cidreira', 'Lemongrass'), qty: L('3 folhas frescas picadas', '3 fresh leaves, chopped'), item: L('capim-cidreira', 'lemongrass'), temp: 100, min: 6, caf: false, note: L('o cítrico verde do capim-cidreira', 'the green citrus of lemongrass') }
};
// Aromáticos: when = 'boil' (ferve junto), 'steep' (vai na infusão) ou 'end' (no final). iced = só nos gelados
const AROMA = {
  limao: { name: L('Limão', 'Lemon'), qty: L('2 rodelas', '2 slices'), item: L('limão', 'lemon'), when: 'end', note: L('o brilho do limão', 'a squeeze of lemon brightness') },
  laranja: { name: L('Laranja', 'Orange'), qty: L('3 tiras', '3 strips'), item: L('casca de laranja, sem a parte branca', 'orange peel, without the white pith'), when: 'steep', note: L('o perfume da casca de laranja', 'the perfume of orange peel') },
  canela: { name: L('Canela', 'Cinnamon'), qty: L('1 pau', '1 stick'), item: L('canela em pau', 'cinnamon stick'), when: 'boil', note: L('o calor doce da canela', 'the sweet warmth of cinnamon'), warm: true },
  cravo: { name: L('Cravo', 'Clove'), qty: L('2', '2'), item: L('cravos-da-índia', 'cloves'), when: 'boil', note: L('um toque de cravo', 'a touch of clove'), warm: true },
  gengibre: { name: L('Gengibre', 'Ginger'), qty: L('3 rodelas finas', '3 thin slices'), item: L('gengibre fresco', 'fresh ginger'), when: 'boil', note: L('a picância do gengibre', 'the bite of ginger') },
  anis: { name: L('Anis-estrelado', 'Star Anise'), qty: L('1', '1'), item: L('anis-estrelado', 'star anise'), when: 'steep', note: L('o final anisado', 'an anise finish'), warm: true },
  cardamomo: { name: L('Cardamomo', 'Cardamom'), qty: L('2 bagas amassadas', '2 pods, crushed'), item: L('cardamomo', 'cardamom'), when: 'boil', note: L('o perfume do cardamomo', 'the perfume of cardamom'), warm: true },
  hortela: { name: L('Hortelã', 'Mint'), qty: L('6 folhas', '6 leaves'), item: L('hortelã fresca', 'fresh mint'), when: 'steep', note: L('o frescor da hortelã', 'the cool of mint') },
  maca: { name: L('Maçã', 'Apple'), qty: L('4 fatias finas', '4 thin slices'), item: L('maçã', 'apple'), when: 'boil', note: L('a doçura da maçã', 'the sweetness of apple') },
  abacaxi: { name: L('Abacaxi', 'Pineapple'), qty: L('2 fatias em cubos', '2 slices, cubed'), item: L('abacaxi', 'pineapple'), when: 'end', iced: true, note: L('o tropical do abacaxi', 'the tropical note of pineapple') },
  maracuja: { name: L('Maracujá', 'Passion Fruit'), qty: L('polpa de ½ fruta', 'pulp of ½ fruit'), item: L('maracujá', 'passion fruit'), when: 'end', iced: true, note: L('a acidez do maracujá', 'the tang of passion fruit') },
  'frutas-vermelhas': { name: L('Morango', 'Strawberry'), qty: L('4 picados', '4, chopped'), item: L('morangos', 'strawberries'), when: 'end', iced: true, note: L('o morango maduro', 'ripe strawberry') },
  pessego: { name: L('Pêssego', 'Peach'), qty: L('½ em fatias', '½, sliced'), item: L('pêssego', 'peach'), when: 'end', iced: true, note: L('o pêssego maduro', 'ripe peach') },
  baunilha: { name: L('Baunilha', 'Vanilla'), qty: L('2 gotas', '2 drops'), item: L('extrato de baunilha', 'vanilla extract'), when: 'end', note: L('um fundo de baunilha', 'a hint of vanilla') },
  alecrim: { name: L('Alecrim', 'Rosemary'), qty: L('1 ramo pequeno', '1 small sprig'), item: L('alecrim', 'rosemary'), when: 'steep', note: L('o resinoso do alecrim', 'the resinous note of rosemary') },
  manjericao: { name: L('Manjericão', 'Basil'), qty: L('4 folhas', '4 leaves'), item: L('manjericão', 'basil'), when: 'end', iced: true, note: L('o verde do manjericão', 'the green of basil') },
  'erva-doce': { name: L('Erva-doce', 'Fennel'), qty: L('½ colher (chá)', '½ tsp'), item: L('erva-doce (sementes)', 'fennel seeds'), when: 'steep', note: L('o adocicado da erva-doce', 'the sweetness of fennel') },
  'capim-cidreira': { name: L('Capim-cidreira', 'Lemongrass'), qty: L('2 folhas picadas', '2 leaves, chopped'), item: L('capim-cidreira', 'lemongrass'), when: 'steep', note: L('o cítrico do capim-cidreira', 'the citrus of lemongrass') },
  coco: { name: L('Coco', 'Coconut'), qty: L('100 ml', '100 ml'), item: L('água de coco', 'coconut water'), when: 'end', iced: true, note: L('a água de coco', 'coconut water') }
};

// ---------- análise das receitas existentes (guias + site) ----------
let analysis = null;
function analyse() {
  if (analysis) return analysis;
  const { keysOf } = require('./pantry');
  const seo = require('./views/seo');
  const sets = [];
  for (const r of require('./content/pantry-index.json')) sets.push({ keys: new Set(r.items.flatMap(keysOf)), name: r.name.pt, guide: r.guideNumber, paid: !r.free });
  for (const r of seo.recipes) sets.push({ keys: new Set(r.ingredients.flatMap(i => keysOf(i.item.pt))), name: r.name.pt, guide: r.guideNumber || 0, paid: false });
  const pair = new Map(), where = new Map();
  const pk = (a, b) => [a, b].sort().join('+');
  for (const s of sets) {
    const ks = [...s.keys];
    for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) {
      const k = pk(ks[i], ks[j]); pair.set(k, (pair.get(k) || 0) + 1);
      if (!where.has(k)) where.set(k, []); where.get(k).push(s);
    }
  }
  analysis = { sets, pair: (a, b) => pair.get(pk(a, b)) || 0, where: (a, b) => where.get(pk(a, b)) || [] };
  return analysis;
}
const refresh = () => { analysis = null; };

function box() { if (!Array.isArray(store.db.recipeBank)) store.db.recipeBank = []; return store.db.recipeBank; }
const slugify = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const join = (list, lang) => list.length < 2 ? list.join('') : list.slice(0, -1).join(', ') + (lang === 'pt' ? ' e ' : ' and ') + list[list.length - 1];

// Já existe (em guia, no site ou no banco)? Todas as chaves da combinação aparecem juntas numa receita
function exists(keys) {
  const a = analyse();
  if (a.sets.some(s => keys.every(k => s.keys.has(k)))) return true;
  return box().some(d => d.status !== 'discarded' && keys.every(k => (d.keys || []).includes(k)) && (d.keys || []).length === keys.length);
}

function build(baseKey, aromaKeys, style, seed) {
  const b = BASES[baseKey], as = aromaKeys.map(k => AROMA[k]);
  const tea = teas.find(t => t.id === b.tea);
  const iced = style === 'iced', latte = style === 'latte';
  const name = {}, tag = {};
  for (const lang of ['pt', 'en']) {
    const aro = join(as.map(a => a.name[lang]), lang);
    if (lang === 'pt') name.pt = latte ? `Latte de ${b.name.pt} com ${aro}` : `${b.name.pt}${iced ? ' Gelado' : ''} com ${aro}`;
    else name.en = latte ? `${b.name.en} Latte with ${aro}` : `${iced ? 'Iced ' : ''}${b.name.en} with ${aro}`;
    const notes = [b.note[lang], ...as.map(a => a.note[lang])];
    tag[lang] = (lang === 'pt' ? 'Combina ' : 'Brings together ') + join(notes, lang) + (latte ? (lang === 'pt' ? ', com a cremosidade do leite.' : ', with the creaminess of milk.') : iced ? (lang === 'pt' ? ', bem gelado.' : ', served ice-cold.') : '.');
  }
  const water = iced ? 150 : latte ? 150 : 250;
  const ing = [{ qty: L(`${water + 50} ml`, `${water + 50} ml`), item: L('água', 'water') }, { qty: b.qty, item: b.item }];
  as.forEach(a => ing.push({ qty: a.qty, item: a.item }));
  if (latte) ing.push({ qty: L('120 ml', '120 ml'), item: L('leite (ou bebida vegetal)', 'milk (or plant milk)') });
  ing.push({ qty: L('1 colher (chá)', '1 tsp'), item: L('mel (opcional)', 'honey (optional)') });
  if (iced) ing.push({ qty: L('1 copo cheio', '1 full glass'), item: L('gelo', 'ice') });
  const boil = as.filter(a => a.when === 'boil'), steep = as.filter(a => a.when === 'steep'), end = as.filter(a => a.when === 'end');
  const steps = [];
  const items = (list, lang) => join(list.map(a => a.item[lang].split(',')[0]), lang);
  const settle = b.temp < 100;
  steps.push(boil.length ? L(`Ferva a água com ${items(boil, 'pt')} por 3 minutos${settle ? ` e deixe baixar para cerca de ${b.temp} °C` : ''}.`, `Simmer the water with the ${items(boil, 'en')} for 3 minutes${settle ? `, then let it settle to about ${b.temp} °C` : ''}.`)
    : L(`Aqueça a água a ${b.temp} °C${b.temp >= 100 ? ' (fervura)' : ''}.`, `Heat the water to ${b.temp} °C${b.temp >= 100 ? ' (boiling)' : ''}.`));
  const mins = b.min + (iced ? 1 : 0);
  steps.push(L(`Junte o ${b.item.pt}${steep.length ? ' e acrescente ' + items(steep, 'pt') : ''}, tampe e deixe em infusão por ${mins} minutos.`, `Add the ${b.item.en}${steep.length ? ' and ' + items(steep, 'en') : ''}, cover and steep for ${mins} minutes.`));
  if (latte) steps.push(L('Coe. Aqueça o leite sem ferver e bata até espumar (com um batedor ou fechado num pote).', 'Strain. Warm the milk without boiling and froth it (with a whisk or shaken in a jar).'), L('Junte o leite ao chá, adoce com mel se quiser e sirva.', 'Pour the milk into the tea, sweeten with honey if you like and serve.'));
  else if (iced) steps.push(L('Coe e espere amornar por 5 minutos (assim o gelo não derrete todo).', 'Strain and let it cool for 5 minutes (so the ice does not all melt).'), L(`Encha o copo de gelo${end.length ? ', junte ' + items(end, 'pt') : ''}, despeje o chá e mexa. Adoce com mel se quiser.`, `Fill the glass with ice${end.length ? ', add the ' + items(end, 'en') : ''}, pour in the tea and stir. Sweeten with honey if you like.`));
  else steps.push(L(`Coe${end.length ? ', junte ' + items(end, 'pt') : ''} e adoce com mel se quiser, com a bebida já morna.`, `Strain${end.length ? ', add the ' + items(end, 'en') : ''} and sweeten with honey if you like, once it is warm rather than hot.`));
  const total = mins + (boil.length ? 4 : 2) + (iced ? 6 : 0) + (latte ? 3 : 0);
  const slug = { pt: slugify(name.pt), en: slugify(name.en) };
  return {
    slug, name, tag, time: L(`${total} min`, `${total} min`), yield: iced ? L('1 copo · 300 ml', '1 glass · 300 ml') : L('1 xícara · 250 ml', '1 cup · 250 ml'),
    caffeine: b.caf, iced, milk: latte, level: L('Simples', 'Easy'), ingredients: ing, steps,
    tip: tea ? { pt: tea.tip.pt, en: tea.tip.en } : null, finish: null, pantry: true, bank: true
  };
}

// Escolhe a próxima combinação nova com mais "apoio" nas receitas dos guias
function candidates() {
  const a = analyse();
  const out = [];
  for (const bk of Object.keys(BASES)) {
    const ak = Object.keys(AROMA).filter(k => k !== bk);
    for (let i = 0; i < ak.length; i++) {
      const s1 = a.pair(bk, ak[i]);
      if (!s1) continue; // o par precisa aparecer em alguma receita dos guias ou do site
      out.push({ keys: [bk, ak[i]], score: s1 * 2 });
      for (let j = i + 1; j < ak.length; j++) {
        const s2 = a.pair(bk, ak[j]), s12 = a.pair(ak[i], ak[j]);
        if (!s2 || !s12) continue;
        out.push({ keys: [bk, ak[i], ak[j]], score: s1 + s2 + s12 * 2 + 1 });
      }
    }
  }
  return out;
}
function styleFor(keys, seed) {
  const b = BASES[keys[0]], aro = keys.slice(1).map(k => AROMA[k]);
  if (aro.some(x => x.iced)) return 'iced';
  const warm = aro.some(x => x.warm);
  const opts = ['hot', 'hot'];
  if (!warm) opts.push('iced');
  if (b.latte && warm) opts.push('latte');
  return opts[seed % opts.length];
}

function generate(n = 3) {
  const made = [];
  const today = new Date().toISOString().slice(0, 10);
  const list = candidates()
    .map(c => ({ ...c, j: c.score + crypto.createHash('sha256').update(today + c.keys.join('+')).digest()[0] / 64 }))
    .sort((x, y) => y.j - x.j);
  for (const c of list) {
    if (made.length >= n) break;
    if (exists(c.keys)) continue;
    const seed = crypto.createHash('sha256').update(c.keys.join('+')).digest()[1];
    const style = styleFor(c.keys, seed);
    const r = build(c.keys[0], c.keys.slice(1), style, seed);
    const seo = require('./views/seo');
    if (seo.recipes.some(x => x.slug.pt === r.slug.pt) || box().some(d => d.recipe.slug.pt === r.slug.pt)) continue;
    const a = analyse();
    const basis = [];
    for (let i = 0; i < c.keys.length; i++) for (let j = i + 1; j < c.keys.length; j++) {
      const w = a.where(c.keys[i], c.keys[j]);
      if (w.length) basis.push({ pair: [c.keys[i], c.keys[j]], count: w.length, examples: w.slice(0, 4).map(s => s.name + (s.paid ? ' (guia pago)' : '')) });
    }
    const p = store.db.products.find(x => x.slug === (quizMap[BASES[c.keys[0]].tea] || {}).product);
    if (p) { r.guide = p.slug; r.guideNumber = p.order; }
    const d = { id: crypto.randomBytes(5).toString('hex'), status: 'draft', createdAt: Date.now(), keys: c.keys, style, score: Math.round(c.score), basis, recipe: r, scheduledFor: '' };
    box().unshift(d); made.push(d);
  }
  if (made.length) store.save();
  return made;
}

// Mantém a fila com até `keep` rascunhos (roda todo dia)
function topUp(keep = 20, perDay = 3) {
  const drafts = box().filter(d => d.status === 'draft').length;
  return drafts >= keep ? [] : generate(Math.min(perDay, keep - drafts));
}

// ---------- publicar ----------
function live(d) {
  const seo = require('./views/seo');
  if (!seo.recipes.some(r => r.slug.pt === d.recipe.slug.pt)) seo.recipes.push(d.recipe);
  require('./pantry').refresh && require('./pantry').refresh();
}
function unlive(d) {
  const seo = require('./views/seo');
  const i = seo.recipes.findIndex(r => r === d.recipe || r.slug.pt === d.recipe.slug.pt);
  if (i >= 0) seo.recipes.splice(i, 1);
  require('./pantry').refresh && require('./pantry').refresh();
}
// No início: coloca no ar as publicadas
function boot() { for (const d of box()) if (d.status === 'published') live(d); }

const byId = id => box().find(d => d.id === id);
function publish(id) { const d = byId(id); if (!d) return null; d.status = 'published'; d.publishedAt = Date.now(); d.scheduledFor = ''; live(d); store.save(); return d; }
function unpublish(id) { const d = byId(id); if (!d) return null; d.status = 'draft'; unlive(d); store.save(); return d; }
function discard(id) { const d = byId(id); if (!d) return null; if (d.status === 'published') unlive(d); d.status = 'discarded'; store.save(); return d; }
function schedule(id, date) { const d = byId(id); if (!d) return null; d.scheduledFor = /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date : ''; store.save(); return d; }
// Publica as agendadas para hoje ou antes
function runSchedule() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const due = box().filter(d => d.status === 'draft' && d.scheduledFor && d.scheduledFor <= today);
  due.forEach(d => publish(d.id));
  return due;
}

// Edição (painel). Linhas de ingrediente: "qtd pt | item pt | qtd en | item en"; passos: "pt || en"
function update(id, b) {
  const d = byId(id); if (!d) return { error: 'not_found' };
  const r = d.recipe, s = (v, n) => String(v || '').trim().slice(0, n);
  for (const lang of ['pt', 'en']) {
    if (b['name_' + lang] !== undefined) r.name[lang] = s(b['name_' + lang], 90) || r.name[lang];
    if (b['tag_' + lang] !== undefined) r.tag[lang] = s(b['tag_' + lang], 240) || r.tag[lang];
    if (b['tip_' + lang] !== undefined) { r.tip = r.tip || { pt: '', en: '' }; r.tip[lang] = s(b['tip_' + lang], 400); }
    if (b['time_' + lang] !== undefined) r.time[lang] = s(b['time_' + lang], 30) || r.time[lang];
  }
  if (typeof b.ingredients === 'string') {
    const ing = b.ingredients.split('\n').map(l => l.split('|').map(x => x.trim())).filter(p => p.length >= 2 && p[1])
      .map(p => ({ qty: L(p[0] || '', p[2] || p[0] || ''), item: L(p[1], p[3] || p[1]) })).slice(0, 25);
    if (ing.length) r.ingredients = ing;
  }
  if (typeof b.steps === 'string') {
    const st = b.steps.split('\n').map(l => l.split('||').map(x => x.trim())).filter(p => p[0]).map(p => L(p[0], p[1] || p[0])).slice(0, 15);
    if (st.length) r.steps = st;
  }
  if (b.iced !== undefined) r.iced = !!b.iced;
  if (b.caffeine !== undefined) r.caffeine = !!b.caffeine;
  // o endereço muda junto com o nome enquanto não estiver publicada
  if (d.status !== 'published') r.slug = { pt: slugify(r.name.pt), en: slugify(r.name.en) };
  d.editedAt = Date.now(); d.tested = b.tested !== undefined ? !!b.tested : d.tested;
  store.save();
  return { draft: d };
}
const list = () => box();

module.exports = { generate, topUp, publish, unpublish, discard, schedule, runSchedule, update, list, byId, boot, refresh, analyse };
