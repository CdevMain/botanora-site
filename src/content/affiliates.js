'use strict';
// Recomendações iniciais (links de afiliado). Depois do primeiro start,
// tudo é gerenciado em Painel → Recomendações.
// store: 'ml' (Mercado Livre) | 'amazon'
// category: 'preparo' | 'organizacao' | 'servir' | 'outros'

const seedAffiliates = [
  {
    id: 'bule-vidro-infusor', store: 'ml', category: 'preparo', icon: 'teapot', order: 1, active: true,
    url: 'https://meli.la/26wLhTZ',
    source: 'https://www.mercadolivre.com.br/bule-chaleira-1l-vidro-com-infusor-e-tampa-bambu-cha-alca-cafe-pitia/p/MLB78284135',
    title: { pt: 'Bule de vidro 1 L com infusor e tampa de bambu', en: '1 L glass teapot with infuser and bamboo lid' },
    note: { pt: 'Vidro deixa ver a cor da infusão e o infusor removível evita amargar: tire as folhas no tempo certo.', en: 'Glass lets you watch the colour, and the removable infuser stops bitterness: lift the leaves out on time.' }
  },
  {
    id: 'prensa-francesa-700', store: 'ml', category: 'preparo', icon: 'press', order: 2, active: true,
    url: 'https://meli.la/26XEcnD',
    source: 'https://www.mercadolivre.com.br/icoffee-prensa-francesa-icoffee-aco-inoxidavel-700ml-preto/p/MLB63647797',
    title: { pt: 'Prensa francesa iCoffee inox 700 ml', en: 'iCoffee stainless French press 700 ml' },
    note: { pt: 'Ótima para chás de folha solta e cold brew: o êmbolo separa as folhas sem precisar de peneira.', en: 'Great for loose-leaf tea and cold brew: the plunger separates the leaves without a strainer.' }
  },
  {
    id: 'caixa-sache-6', store: 'ml', category: 'organizacao', icon: 'box', order: 3, active: true,
    url: 'https://meli.la/1zwPmXj',
    source: 'https://www.mercadolivre.com.br/caixa-porta-sache-cha-6-divisoria-organizador-nicho-recepcao/up/MLBU3386464533',
    title: { pt: 'Caixa porta-sachê de chá com 6 divisórias', en: 'Tea bag box with 6 compartments' },
    note: { pt: 'Organiza os sachês por estilo: cafeína de um lado, tisanas da noite do outro.', en: 'Sort your bags by style: caffeinated on one side, evening tisanes on the other.' }
  },
  {
    id: 'porta-saches-acrilico', store: 'ml', category: 'servir', icon: 'jar', order: 4, active: true,
    url: 'https://meli.la/2RsQDVW',
    source: 'https://www.mercadolivre.com.br/porta-saches-acucar-4-nichos-tampa-acrilico-cristal-acribom/p/MLB53010477',
    title: { pt: 'Porta-sachês 4 nichos com tampa de acrílico', en: '4-slot sachet holder with acrylic lid' },
    note: { pt: 'Para servir na mesa: sachês, mel e açúcar à vista e protegidos.', en: 'For the table: sachets, honey and sugar on display and protected.' }
  }
];

module.exports = { seedAffiliates };
