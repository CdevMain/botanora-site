'use strict';
// Catálogo inicial dos 10 guias em PDF. Copiado para o banco no primeiro start;
// depois disso, preço, status e arquivo são editados pelo painel /admin.
// status: 'available' | 'coming_soon' | 'hidden'
// files: um PDF por idioma ({ pt, en }); cakto: IDs de produto/oferta da Cakto ligados ao guia.
// Capas: public/assets/img/covers/<slug>-<idioma>.jpg (geradas por tools/covers).

const seedProducts = [
  {
    slug: 'infusoes-de-autor', order: 1, status: 'available', price: 2990, pages: 40, icon: 'cup',
    files: { pt: 'infusoes-autorais-pt.pdf', en: 'infusoes-de-autor-en.pdf' },
    title: { pt: 'Infusões Autorais', en: 'Signature Infusions' },
    subtitle: { pt: '40 chás e infusões em estilo barista, feitos com a sua despensa', en: '40 barista-style teas and infusions made from your pantry' },
    description: {
      pt: 'Um caderno de receitas pensado como o menu de uma casa de chá: cada bebida tem base, camada aromática e acabamento. 36 quentes, 4 gelados, 6 cremosos e 30 sem cafeína, com técnica de temperatura e tempo sem termômetro e preparos base que duram semanas.',
      en: 'A recipe book built like a tea-house menu: every drink has a base, an aromatic layer and a finish. 36 hot, 4 iced, 6 creamy and 30 caffeine-free, with no-thermometer temperature and timing technique and base preparations that keep for weeks.'
    },
    highlights: {
      pt: ['40 receitas testadas', 'Técnica de temperatura sem termômetro', 'Preparos base: xaropes, gelo de hibisco, maçã caramelizada', 'Índice por ingrediente'],
      en: ['40 tested recipes', 'No-thermometer temperature technique', 'Base preps: syrups, hibiscus ice, caramelised apple', 'Index by ingredient']
    },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'atlas-do-cha', order: 2, status: 'available', price: 3490, pages: 40, icon: 'leaf',
    files: { pt: 'atlas-do-cha-pt.pdf', en: 'atlas-do-cha-en.pdf' },
    title: { pt: 'Atlas do Chá', en: 'The Tea Atlas' },
    subtitle: { pt: 'Os seis estilos da Camellia sinensis, da folha à xícara', en: 'The six styles of Camellia sinensis, leaf to cup' },
    description: {
      pt: 'Branco, verde, amarelo, oolong, preto e escuro: como cada processo muda a folha, onde cada estilo nasce e como reconhecê-lo. Com 12 receitas por estilo, fichas de 24 chás famosos, método de degustação e um capítulo prático sobre utensílios, água e gongfu.',
      en: 'White, green, yellow, oolong, black and dark: how each process changes the leaf, where each style comes from and how to recognise it. With 12 recipes by style, profiles of 24 famous teas, a tasting method and a practical chapter on tools, water and gongfu.'
    },
    highlights: { pt: ['12 receitas, do gongfu ao bubble tea', 'Fichas de 24 chás famosos', 'Ficha de degustação e glossário de 60 termos', 'Utensílios, água e gongfu passo a passo'], en: ['12 recipes, from gongfu to bubble tea', 'Profiles of 24 famous teas', 'Tasting sheet and 60-term glossary', 'Tools, water and gongfu step by step'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'ritual-da-noite', order: 3, status: 'available', price: 2490, pages: 24, icon: 'moon',
    files: { pt: 'ritual-da-noite-pt.pdf', en: 'ritual-da-noite-en.pdf' },
    title: { pt: 'Ritual da Noite', en: 'The Night Ritual' },
    subtitle: { pt: 'Tisanas sem cafeína para desacelerar e dormir melhor', en: 'Caffeine-free tisanes to slow down and sleep better' },
    description: {
      pt: 'Camomila, melissa, maracujá, lavanda e rooibos em 20 blends noturnos e 4 bebidas cremosas sem cafeína, com um protocolo de 45 minutos, um plano de sete noites e o que a ciência realmente diz sobre cada erva.',
      en: 'Chamomile, lemon balm, passionflower, lavender and rooibos in 20 evening blends and 4 creamy caffeine-free drinks, with a 45-minute protocol, a seven-night plan and what the science really says about each herb.'
    },
    highlights: { pt: ['24 receitas noturnas', 'Protocolo de 45 min e plano de 7 noites', 'Tabela de segurança e interações', 'Diário de sono de duas semanas'], en: ['24 evening recipes', '45-minute protocol and 7-night plan', 'Safety and interactions table', 'Two-week sleep diary'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'foco-e-energia', order: 4, status: 'available', price: 2490, pages: 24, icon: 'spark',
    files: { pt: 'foco-e-energia-pt.pdf', en: 'foco-e-energia-en.pdf' },
    title: { pt: 'Foco & Energia', en: 'Focus & Energy' },
    subtitle: { pt: 'Chá verde, matcha e mate para uma energia sem picos', en: 'Green tea, matcha and mate for energy without the crash' },
    description: {
      pt: 'Como dosar cafeína e L-teanina ao longo do dia, trocar o terceiro café por algo mais estável e montar uma rotina de chás para trabalho e estudo, com 18 receitas, calculadora de cafeína e um plano de preparo semanal.',
      en: 'How to pace caffeine and L-theanine through the day, swap the third coffee for something steadier and build a tea routine for work and study, with 18 recipes, a caffeine calculator and a weekly prep plan.'
    },
    highlights: { pt: ['18 receitas, da manhã ao fim do expediente', 'Calculadora de cafeína', 'Rotina de 3 xícaras e plano de troca', 'Garrafa da semana e lanches que ajudam'], en: ['18 recipes, from morning to the end of the workday', 'Caffeine calculator', '3-cup routine and swap plan', 'Weekly bottle and helpful snacks'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'chas-gelados', order: 5, status: 'available', price: 2490, pages: 28, icon: 'ice',
    files: { pt: 'chas-gelados-pt.pdf', en: 'chas-gelados-en.pdf' },
    title: { pt: 'Gelados & Cold Brew', en: 'Iced & Cold Brew' },
    subtitle: { pt: 'Infusões frias, espumas e chás de verão', en: 'Cold infusions, foams and summer teas' },
    description: {
      pt: 'Cold brew, flash, concentrado, kombucha caseira, mocktails e sobremesas geladas: 33 receitas, 6 mocktails, proporções para jarra de 1 L, gelos aromáticos, xaropes e um plano para reduzir o açúcar.',
      en: 'Cold brew, flash-chill, concentrates, homemade kombucha, mocktails and frozen desserts: 33 recipes, 6 mocktails, 1-litre jug ratios, aromatic ice, syrups and a plan to cut sugar.'
    },
    highlights: { pt: ['33 receitas e 6 mocktails', 'Kombucha caseira passo a passo', 'Proporções para jarra de 1 L', 'Bar de chá gelado para festas'], en: ['33 recipes and 6 mocktails', 'Homemade kombucha step by step', '1-litre jug ratios', 'Iced tea bar for parties'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'matcha-em-casa', order: 6, status: 'available', price: 2990, pages: 28, icon: 'whisk',
    files: { pt: 'matcha-em-casa-pt.pdf', en: 'matcha-em-casa-en.pdf' },
    title: { pt: 'Matcha em Casa', en: 'Matcha at Home' },
    subtitle: { pt: 'Do usucha ao latte, sem desperdiçar o pó', en: 'From usucha to latte, without wasting powder' },
    description: {
      pt: 'Como escolher entre cerimonial e culinário, guardar, peneirar e bater, resolver os erros mais comuns e 18 receitas, do usucha e koicha ao latte gelado, brigadeiro, tiramisù e sorvete.',
      en: 'How to choose ceremonial vs culinary grade, store, sift and whisk, fix the most common mistakes, plus 18 recipes from usucha and koicha to iced lattes, brigadeiro, tiramisù and ice cream.'
    },
    highlights: { pt: ['Guia de compra', 'Técnica de batida e plano de 7 dias', 'Tabela de problemas e soluções', '18 receitas, de bebidas a doces'], en: ['Buying guide', 'Whisking technique and 7-day plan', 'Troubleshooting table', '18 recipes, from drinks to desserts'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'ervas-do-quintal', order: 7, status: 'available', price: 2490, pages: 32, icon: 'flower',
    files: { pt: 'ervas-do-quintal-pt.pdf', en: 'ervas-do-quintal-en.pdf' },
    title: { pt: 'Ervas do Quintal', en: 'Backyard Herbs' },
    subtitle: { pt: 'Cultivar, colher e secar as ervas brasileiras', en: 'Growing, harvesting and drying Brazilian herbs' },
    description: {
      pt: 'Capim-cidreira, erva-cidreira, hortelã, macela, boldo, alecrim e mais: 22 ervas em fichas, como plantar em vaso e em 1 m², colher, secar e guardar, cuidados de segurança e 16 receitas e misturas para usar a colheita.',
      en: 'Lemongrass, lemon balm, mint, macela, boldo, rosemary and more: 22 herb profiles, how to grow in pots and in 1 m², harvest, dry and store, safety cautions and 16 recipes and blends to use the harvest.'
    },
    highlights: { pt: ['22 ervas em fichas', '16 receitas: chás, xaropes, sal e manteiga', 'Calendário de colheita e horta em 1 m²', 'Etiquetas para imprimir'], en: ['22 herb profiles', '16 recipes: teas, syrups, salt and butter', 'Harvest calendar and 1 m² garden', 'Printable jar labels'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'blends-autorais', order: 8, status: 'available', price: 3490, pages: 36, icon: 'mortar',
    files: { pt: 'blends-autorais-pt.pdf', en: 'blends-autorais-en.pdf' },
    title: { pt: 'Blends Autorais', en: 'Crafting Blends' },
    subtitle: { pt: 'O método para criar suas próprias misturas', en: 'A method for creating your own blends' },
    description: {
      pt: 'Base, corpo, aroma e acabamento: a estrutura que os blenders usam, com roda de sabores, 38 fórmulas, 6 receitas com os blends, técnicas de secagem e torra, calculadora de lote, planilha de custo e o que ver antes de vender.',
      en: 'Base, body, aroma and finish: the structure blenders use, with a flavour wheel, 38 formulas, 6 recipes using the blends, drying and roasting techniques, a batch calculator, a cost sheet and what to check before selling.'
    },
    highlights: { pt: ['38 fórmulas testadas', 'Roda de sabores e 38 ingredientes', 'Calculadora de lote e planilha de custo', 'Rótulos, kits de presente e venda'], en: ['38 tested formulas', 'Flavour wheel and 38 ingredients', 'Batch calculator and cost sheet', 'Labels, gift kits and selling'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'cha-e-mesa', order: 9, status: 'available', price: 2990, pages: 28, icon: 'plate',
    files: { pt: 'cha-e-mesa-pt.pdf', en: 'cha-e-mesa-en.pdf' },
    title: { pt: 'Chá & Mesa', en: 'Tea & Table' },
    subtitle: { pt: 'Harmonização de chás com comida', en: 'Pairing tea with food' },
    description: {
      pt: 'Como os taninos, a acidez e a doçura do chá conversam com queijos, doces, peixes e churrasco. Com tabela de harmonização, menu de chá da tarde, brunch, jantar em quatro tempos e 20 receitas que usam chá como ingrediente.',
      en: 'How tannin, acidity and sweetness in tea talk to cheese, desserts, fish and barbecue. With a pairing chart, an afternoon-tea menu, a brunch, a four-course dinner and 20 recipes that use tea as an ingredient.'
    },
    highlights: { pt: ['Tabela de harmonização', 'Chá da tarde, brunch e jantar harmonizado', '20 receitas com chá, de scones a pudim de chai', 'Chá no lugar do vinho'], en: ['Pairing chart', 'Afternoon tea, brunch and paired dinner', '20 recipes with tea, from scones to chai flan', 'Tea instead of wine'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  },
  {
    slug: 'erva-mate', order: 10, status: 'available', price: 2490, pages: 24, icon: 'gourd',
    files: { pt: 'erva-mate-pt.pdf', en: 'erva-mate-en.pdf' },
    title: { pt: 'Erva-Mate', en: 'Yerba Mate' },
    subtitle: { pt: 'Do chimarrão ao tererê e ao mate tostado', en: 'From chimarrão to tereré and toasted mate' },
    description: {
      pt: 'A história, os tipos de erva, a cura e a montagem da cuia, a temperatura certa, tererê, chá-mate e 18 receitas, da chipa ao mate cocido, com perguntas frequentes e um plano para aprender a gostar de chimarrão.',
      en: 'History, leaf styles, curing and setting up the gourd, the right temperature, tereré, toasted mate and 18 recipes from chipa to mate cocido, with FAQs and a plan for learning to love chimarrão.'
    },
    highlights: { pt: ['Cura e montagem da cuia passo a passo', 'Tipos de erva, cuias e bombas', '18 receitas modernas e tradicionais', 'Perguntas frequentes'], en: ['Curing and setting up the gourd', 'Leaf styles, gourds and bombillas', '18 modern and traditional recipes', 'Frequently asked questions'] },
    lang: { pt: 'Português e inglês', en: 'Portuguese and English' }
  }
];

// Checkout de cada guia na Cakto (pay.cakto.com.br/<id da oferta>). Um link por guia:
// a biblioteca libera o PDF nas duas línguas, então não há oferta separada em inglês.
const CHECKOUT = {
  'infusoes-de-autor': 'https://pay.cakto.com.br/dw6ovas_1204491',
  'atlas-do-cha': 'https://pay.cakto.com.br/5ssfeja',
  'ritual-da-noite': 'https://pay.cakto.com.br/hrew6c6',
  'foco-e-energia': 'https://pay.cakto.com.br/gy6o7dv',
  'chas-gelados': 'https://pay.cakto.com.br/3ef3dja',
  'matcha-em-casa': 'https://pay.cakto.com.br/65gsymb',
  'ervas-do-quintal': 'https://pay.cakto.com.br/5jjuwx4',
  'blends-autorais': 'https://pay.cakto.com.br/8njqro2',
  'cha-e-mesa': 'https://pay.cakto.com.br/cmgoiku',
  'erva-mate': 'https://pay.cakto.com.br/4gtqc7d'
};
for (const p of seedProducts) p.checkout = { pt: CHECKOUT[p.slug] || '', en: '' };

module.exports = { seedProducts };
