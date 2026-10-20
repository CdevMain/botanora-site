'use strict';
// Descoberta: interesses do visitante -> conteúdo grátis + guias que realmente tratam do assunto.
// Também guarda, por guia, "para quem é" e os temas (usados nos filtros da loja e nos relacionados).
// Só usa slugs do catálogo real (content/products.js) e rotas existentes.

// tags: tipos | receitas | rotina | ervas | matcha | preparo
const productInfo = {
  'infusoes-de-autor': { tags: ['receitas'], forWho: { pt: 'Para quem quer variar o chá do dia a dia com o que já tem na despensa, sem equipamento especial.', en: 'For anyone who wants to vary their everyday tea with what is already in the pantry, no special equipment needed.' } },
  'atlas-do-cha': { tags: ['tipos', 'preparo'], forWho: { pt: 'Para quem quer entender de onde vem cada chá e aprender a escolher, preparar e provar com mais critério.', en: 'For anyone who wants to understand where each tea comes from and learn to choose, brew and taste with more care.' } },
  'ritual-da-noite': { tags: ['rotina', 'ervas'], forWho: { pt: 'Para quem quer uma rotina noturna sem cafeína, com informação honesta sobre o que cada erva faz.', en: 'For anyone who wants a caffeine-free evening routine, with honest information on what each herb does.' } },
  'foco-e-energia': { tags: ['rotina', 'matcha'], forWho: { pt: 'Para quem trabalha ou estuda e quer trocar parte do café por uma energia mais estável.', en: 'For anyone who works or studies and wants to swap some coffee for steadier energy.' } },
  'chas-gelados': { tags: ['receitas'], forWho: { pt: 'Para quem quer bebidas geladas com chá para o calor, festas e para usar menos açúcar.', en: 'For anyone who wants iced tea drinks for hot days and parties, with less sugar.' } },
  'matcha-em-casa': { tags: ['matcha', 'preparo', 'receitas'], forWho: { pt: 'Para quem tem (ou quer ter) matcha em casa e quer acertar a espuma sem desperdiçar o pó.', en: 'For anyone who has (or wants) matcha at home and wants to get the foam right without wasting powder.' } },
  'ervas-do-quintal': { tags: ['ervas'], forWho: { pt: 'Para quem tem ou quer ter ervas em casa, até em vaso, e usar a colheita em chás e receitas.', en: 'For anyone who grows, or wants to grow, herbs at home, even in a pot, and use the harvest in teas and recipes.' } },
  'blends-autorais': { tags: ['receitas', 'ervas'], forWho: { pt: 'Para quem quer criar as próprias misturas, para tomar, presentear ou vender.', en: 'For anyone who wants to create their own blends, to drink, give or sell.' } },
  'cha-e-mesa': { tags: ['receitas'], forWho: { pt: 'Para quem gosta de receber e quer servir chá com comida, do café da tarde ao jantar.', en: 'For anyone who loves hosting and wants to serve tea with food, from afternoon tea to dinner.' } },
  'erva-mate': { tags: ['preparo', 'tipos'], forWho: { pt: 'Para quem quer aprender o chimarrão e o tererê do jeito certo, ou ir além da cuia.', en: 'For anyone who wants to learn chimarrão and tereré properly, or go beyond the gourd.' } }
};

const tagLabels = {
  tipos: { pt: 'Tipos de chá', en: 'Tea types' },
  receitas: { pt: 'Receitas e blends', en: 'Recipes and blends' },
  rotina: { pt: 'Rotina e bem-estar', en: 'Routine and wellbeing' },
  ervas: { pt: 'Ervas e cultivo', en: 'Herbs and growing' },
  matcha: { pt: 'Matcha e energia', en: 'Matcha and energy' },
  preparo: { pt: 'Preparo e técnica', en: 'Brewing and technique' }
};

// Caminhos "Quero..." da home. free: [chave de rota, ...segmentos, hash]
const interests = [
  { id: 'tipos', icon: 'leaf', title: { pt: 'Conhecer os tipos de chá', en: 'Get to know the types of tea' }, text: { pt: 'Branco, verde, oolong, preto, pu-erh e as tisanas: o que muda de um para o outro.', en: 'White, green, oolong, black, pu-erh and herbal infusions: what sets each apart.' }, free: ['guide'], freeLabel: { pt: 'Guia dos tipos', en: 'Tea types guide' }, guides: ['atlas-do-cha'] },
  { id: 'receitas', icon: 'cup', title: { pt: 'Criar receitas e infusões', en: 'Make recipes and infusions' }, text: { pt: 'Receitas grátis, inclusive com o que você já tem em casa.', en: 'Free recipes, including ones made with what you already have.' }, free: ['recipes'], freeLabel: { pt: 'Ver as receitas', en: 'See the recipes' }, guides: ['infusoes-de-autor', 'blends-autorais', 'chas-gelados'] },
  { id: 'matcha', icon: 'whisk', title: { pt: 'Preparar matcha do jeito certo', en: 'Make matcha properly' }, text: { pt: 'Temperatura, dose e batida para uma espuma lisa e sem grumos.', en: 'Temperature, dose and whisking for a smooth, lump-free foam.' }, free: ['guide', 'matcha'], freeLabel: { pt: 'Como preparar matcha', en: 'How to make matcha' }, guides: ['matcha-em-casa'] },
  { id: 'ervas', icon: 'flower', title: { pt: 'Ervas, cultivo e tisanas', en: 'Herbs, growing and tisanes' }, text: { pt: 'Camomila, capim-cidreira, hortelã: preparo, cuidados e o que plantar em casa.', en: 'Chamomile, lemongrass, mint: brewing, cautions and what to grow at home.' }, free: ['guide', 'ervas'], freeLabel: { pt: 'Guia das ervas', en: 'Herbs guide' }, guides: ['ervas-do-quintal', 'ritual-da-noite'] },
  { id: 'rotina', icon: 'moon', title: { pt: 'Um ritual para a rotina', en: 'A ritual for your routine' }, text: { pt: 'Chás para começar o dia com foco ou desacelerar à noite, com o que a ciência diz.', en: 'Teas to start the day focused or slow down at night, with what the science says.' }, free: ['benefits'], freeLabel: { pt: 'Benefícios com evidência', en: 'Evidence-based benefits' }, guides: ['ritual-da-noite', 'foco-e-energia'] },
  { id: 'preparo', icon: 'thermo', title: { pt: 'Preparar com mais precisão', en: 'Brew with more precision' }, text: { pt: 'Calculadora de dose, temperatura certa e timer para cada chá.', en: 'Dose calculator, the right temperature and a timer for every tea.' }, free: ['brewing'], freeLabel: { pt: 'Abrir o guia de preparo', en: 'Open the brewing guide' }, guides: ['atlas-do-cha', 'erva-mate'] }
];

// Benefício -> guia que trata do assunto (só quando o guia cobre o tema de fato)
const benefitGuides = { foco: 'foco-e-energia', sono: 'ritual-da-noite', digestao: 'ervas-do-quintal', hidratacao: 'chas-gelados' };

const infoFor = slug => productInfo[slug] || { tags: [], forWho: null };

// Guias relacionados: mais temas em comum primeiro, depois a ordem do catálogo
function relatedProducts(p, list, n = 3) {
  const mine = new Set(infoFor(p.slug).tags);
  return list.filter(x => x.slug !== p.slug)
    .map(x => ({ x, s: infoFor(x.slug).tags.filter(t => mine.has(t)).length + (x.status === 'available' ? 0.5 : 0) }))
    .sort((a, b) => b.s - a.s || a.x.order - b.x.order).slice(0, n).map(e => e.x);
}

module.exports = { benefitGuides, productInfo, tagLabels, interests, infoFor, relatedProducts };
