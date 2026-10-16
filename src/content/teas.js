'use strict';
// Tipos de chá: dados editoriais bilíngues.
// Faixas de cafeína são aproximadas por xícara de ~200 ml e variam com folha, tempo e temperatura.

const teas = [
  {
    id: 'branco', family: 'camellia', icon: 'bud',
    oxidation: [5, 10], caffeine: [15, 35], temp: [75, 85], time: [3, 5], grams: 2.5, resteeps: 3,
    name: { pt: 'Chá branco', en: 'White tea' },
    tagline: { pt: 'O mínimo de intervenção', en: 'The least intervention' },
    body: {
      pt: 'Brotos e folhas jovens apenas murchos e secos, sem enrolar e sem fogo para fixar. É o estilo mais próximo da folha viva. Versões de broto (Silver Needle) são delicadas e meladas; as de folha (Bai Mu Dan) ganham corpo e notas de feno.',
      en: 'Young buds and leaves that are simply withered and dried, with no rolling and no firing. It is the style closest to the living leaf. Bud styles (Silver Needle) are delicate and honeyed; leaf styles (Bai Mu Dan) gain body and hay-like notes.'
    },
    flavor: { pt: 'Mel, flores brancas, pêssego, feno', en: 'Honey, white flowers, peach, hay' },
    bestTime: { pt: 'Tarde', en: 'Afternoon' },
    origin: { pt: 'Fujian, China', en: 'Fujian, China' },
    tip: { pt: 'É o mais tolerante: difícil amargar. Deixe 5 min e depois reinfunda.', en: 'The most forgiving: hard to make bitter. Steep 5 min, then resteep.' }
  },
  {
    id: 'verde', family: 'camellia', icon: 'leaf',
    oxidation: [0, 3], caffeine: [20, 45], temp: [70, 80], time: [2, 3], grams: 2.5, resteeps: 2,
    name: { pt: 'Chá verde', en: 'Green tea' },
    tagline: { pt: 'Calor que fixa o frescor', en: 'Heat that locks in freshness' },
    body: {
      pt: 'Logo após a colheita a folha é aquecida para interromper a oxidação. Os chineses usam a panela (notas tostadas, como no Long Jing); os japoneses, o vapor (notas marinhas e de grama, como no Sencha). Água fervente é o erro mais comum: queima e amarga.',
      en: 'Right after picking, the leaf is heated to stop oxidation. Chinese greens are pan-fired (toasty notes, as in Long Jing); Japanese greens are steamed (grassy, marine notes, as in Sencha). Boiling water is the most common mistake: it scorches and turns bitter.'
    },
    flavor: { pt: 'Grama, castanha, alga, vegetal', en: 'Grass, chestnut, seaweed, vegetal' },
    bestTime: { pt: 'Manhã e início da tarde', en: 'Morning to early afternoon' },
    origin: { pt: 'China e Japão', en: 'China and Japan' },
    tip: { pt: 'Ferveu? Espere 3 a 4 minutos com a tampa aberta antes de servir.', en: 'Boiled it? Wait 3–4 minutes with the lid off before pouring.' }
  },
  {
    id: 'matcha', family: 'camellia', icon: 'whisk',
    oxidation: [0, 0], caffeine: [40, 70], temp: [70, 80], time: [0.5, 0.5], grams: 2, resteeps: 0,
    name: { pt: 'Matcha', en: 'Matcha' },
    tagline: { pt: 'A folha inteira, batida', en: 'The whole leaf, whisked' },
    body: {
      pt: 'Folhas sombreadas por semanas antes da colheita, sem talos nem nervuras, moídas em pedra. Como você bebe a folha inteira, o matcha concentra mais cafeína e L-teanina por xícara do que um chá verde infusionado.',
      en: 'Leaves shaded for weeks before harvest, stripped of stems and veins, then stone-milled. Because you drink the entire leaf, matcha delivers more caffeine and L-theanine per cup than steeped green tea.'
    },
    flavor: { pt: 'Umami, creme, grama doce', en: 'Umami, cream, sweet grass' },
    bestTime: { pt: 'Manhã', en: 'Morning' },
    origin: { pt: 'Uji e Nishio, Japão', en: 'Uji and Nishio, Japan' },
    tip: { pt: 'Peneire o pó e bata em "W", não em círculos, até formar espuma fina.', en: 'Sift the powder and whisk in a "W" motion, not circles, until a fine foam forms.' }
  },
  {
    id: 'oolong', family: 'camellia', icon: 'roll',
    oxidation: [15, 70], caffeine: [30, 50], temp: [85, 95], time: [3, 5], grams: 3, resteeps: 5,
    name: { pt: 'Oolong', en: 'Oolong' },
    tagline: { pt: 'O território do meio', en: 'The territory in between' },
    body: {
      pt: 'Parcialmente oxidado e trabalhado à mão: a folha é agitada, murcha, enrolada e tostada em ciclos. Vai do floral quase verde (Tie Guan Yin) ao tostado e mineral (Da Hong Pao). É o chá que mais recompensa infusões curtas e repetidas.',
      en: 'Partially oxidised and worked by hand: the leaf is tossed, withered, rolled and roasted in cycles. It ranges from floral, nearly green (Tie Guan Yin) to roasted and mineral (Da Hong Pao). It is the tea that rewards short, repeated steeps the most.'
    },
    flavor: { pt: 'Orquídea, manteiga, frutas de caroço, tostado', en: 'Orchid, butter, stone fruit, roast' },
    bestTime: { pt: 'Qualquer hora do dia', en: 'Any time of day' },
    origin: { pt: 'Taiwan e Fujian', en: 'Taiwan and Fujian' },
    tip: { pt: 'Experimente o estilo gongfu: mais folha, pouca água, infusões de 30 s.', en: 'Try gongfu style: more leaf, little water, 30-second steeps.' }
  },
  {
    id: 'preto', family: 'camellia', icon: 'cup',
    oxidation: [90, 100], caffeine: [40, 70], temp: [90, 100], time: [3, 5], grams: 2.5, resteeps: 1,
    name: { pt: 'Chá preto', en: 'Black tea' },
    tagline: { pt: 'Oxidação completa, corpo pleno', en: 'Fully oxidised, full-bodied' },
    body: {
      pt: 'A folha é enrolada para romper as células e deixada oxidar até escurecer: a mesma reação que doura uma maçã cortada. O resultado tem mais corpo, taninos e notas de malte. Os chineses o chamam de "chá vermelho", pela cor da infusão.',
      en: 'The leaf is rolled to break its cells and left to oxidise until dark, the same reaction that browns a cut apple. The result has more body, tannin and malt. In China it is called "red tea" after the colour of the liquor.'
    },
    flavor: { pt: 'Malte, mel escuro, cacau, frutas secas', en: 'Malt, dark honey, cocoa, dried fruit' },
    bestTime: { pt: 'Manhã', en: 'Morning' },
    origin: { pt: 'Índia, Sri Lanka, China, Quênia', en: 'India, Sri Lanka, China, Kenya' },
    tip: { pt: 'Mais de 5 minutos extrai taninos demais e amarga.', en: 'Past 5 minutes it pulls too much tannin and turns bitter.' }
  },
  {
    id: 'puer', family: 'camellia', icon: 'cake',
    oxidation: [80, 100], caffeine: [30, 70], temp: [95, 100], time: [2, 4], grams: 4, resteeps: 8,
    name: { pt: 'Pu-erh e chás escuros', en: 'Pu-erh & dark teas' },
    tagline: { pt: 'Fermentado e envelhecido', en: 'Fermented and aged' },
    body: {
      pt: 'De Yunnan, na China, e prensado em discos. O sheng (cru) envelhece lentamente por anos; o shou (maduro) passa por fermentação acelerada em pilhas úmidas. É um chá de terra, madeira e profundidade, e um dos que mais aguentam reinfusões.',
      en: 'From Yunnan, China, and pressed into cakes. Sheng (raw) ages slowly over years; shou (ripe) goes through accelerated wet-pile fermentation. It tastes of earth, wood and depth, and handles more resteeps than almost any tea.'
    },
    flavor: { pt: 'Terra úmida, madeira, couro, cacau', en: 'Forest floor, wood, leather, cocoa' },
    bestTime: { pt: 'Após as refeições', en: 'After meals' },
    origin: { pt: 'Yunnan, China', en: 'Yunnan, China' },
    tip: { pt: 'Faça um "enxágue" de 10 s com água fervente e descarte antes da primeira infusão.', en: 'Do a 10-second rinse with boiling water and discard it before the first steep.' }
  },
  {
    id: 'mate', family: 'herbal', icon: 'gourd',
    oxidation: [0, 0], caffeine: [30, 80], temp: [65, 80], time: [3, 5], grams: 5, resteeps: 10,
    name: { pt: 'Erva-mate', en: 'Yerba mate' },
    tagline: { pt: 'A infusão do Sul', en: 'The infusion of the South' },
    body: {
      pt: 'Não vem da Camellia sinensis, mas tem cafeína. É a base do chimarrão, do tererê e do chá-mate tostado. A água nunca deve ferver: acima de ~80 °C a erva "queima" e amarga.',
      en: 'Not from Camellia sinensis, but it does contain caffeine. It is the base of chimarrão, tereré and toasted mate tea. The water must never boil: above ~80 °C the leaf scorches and turns bitter.'
    },
    flavor: { pt: 'Herbal, amargo limpo, tostado', en: 'Herbal, clean bitterness, toasty' },
    bestTime: { pt: 'Manhã e roda de conversa', en: 'Morning and good company' },
    origin: { pt: 'Sul do Brasil, Argentina, Paraguai', en: 'Southern Brazil, Argentina, Paraguay' },
    tip: { pt: 'Para chimarrão, água em torno de 70 °C, quando a chaleira "chia".', en: 'For chimarrão, water around 70 °C, when the kettle starts to hiss.' }
  },
  {
    id: 'rooibos', family: 'herbal', icon: 'needle',
    oxidation: [0, 100], caffeine: [0, 0], temp: [95, 100], time: [5, 8], grams: 2.5, resteeps: 1,
    name: { pt: 'Rooibos', en: 'Rooibos' },
    tagline: { pt: 'Doçura sem cafeína', en: 'Caffeine-free sweetness' },
    body: {
      pt: 'Um arbusto sul-africano, sem parentesco com o chá. Naturalmente sem cafeína e com poucos taninos, por isso não amarga mesmo em infusões longas, e aceita leite muito bem.',
      en: 'A South African shrub, unrelated to tea. Naturally caffeine-free and low in tannins, so it never turns bitter even with long steeps, and it takes milk beautifully.'
    },
    flavor: { pt: 'Baunilha, madeira doce, mel', en: 'Vanilla, sweet wood, honey' },
    bestTime: { pt: 'Noite', en: 'Evening' },
    origin: { pt: 'Cederberg, África do Sul', en: 'Cederberg, South Africa' },
    tip: { pt: 'Pode ferver junto com canela e maçã: ganha corpo sem amargar.', en: 'You can simmer it with cinnamon and apple: it gains body without bitterness.' }
  },
  {
    id: 'ervas', family: 'herbal', icon: 'flower',
    oxidation: [0, 0], caffeine: [0, 0], temp: [95, 100], time: [5, 7], grams: 2, resteeps: 0,
    name: { pt: 'Ervas, flores e frutas', en: 'Herbs, flowers & fruits' },
    tagline: { pt: 'Tisanas: o universo além do chá', en: 'Tisanes: the world beyond tea' },
    body: {
      pt: 'Camomila, capim-cidreira, hortelã, hibisco, erva-doce, gengibre. Tecnicamente são tisanas, não chás. Folhas e flores pedem infusão tampada (os aromas evaporam); raízes, cascas e sementes pedem decocção: ferver na água.',
      en: 'Chamomile, lemongrass, mint, hibiscus, fennel, ginger. Technically tisanes, not teas. Leaves and flowers want a covered infusion (the aromas are volatile); roots, barks and seeds want a decoction: simmered in the water.'
    },
    flavor: { pt: 'Do floral ao cítrico e picante', en: 'From floral to citrus to spicy' },
    bestTime: { pt: 'Qualquer hora, principalmente à noite', en: 'Any time, especially evening' },
    origin: { pt: 'Do mundo todo, inclusive do seu quintal', en: 'Everywhere, including your garden' },
    tip: { pt: 'Tampe sempre a xícara. O vapor que escapa é o aroma indo embora.', en: 'Always cover the cup. The escaping steam is the aroma leaving.' }
  }
];

const coffeeRef = { caffeine: [80, 120], name: { pt: 'Café coado (referência)', en: 'Drip coffee (reference)' } };

module.exports = { teas, coffeeRef };
