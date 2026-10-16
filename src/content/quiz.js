'use strict';
// Quiz "Qual chá é para você?": cada opção soma pontos aos tipos de chá.

const quiz = [
  {
    q: { pt: 'Quando você costuma querer uma xícara?', en: 'When do you usually want a cup?' },
    options: [
      { label: { pt: 'Logo cedo, para começar o dia', en: 'First thing, to start the day' }, score: { preto: 2, matcha: 2, mate: 2, verde: 1 } },
      { label: { pt: 'À tarde, numa pausa', en: 'In the afternoon, on a break' }, score: { oolong: 2, branco: 2, verde: 1 } },
      { label: { pt: 'À noite, para desacelerar', en: 'In the evening, to unwind' }, score: { ervas: 3, rooibos: 3 } }
    ]
  },
  {
    q: { pt: 'Como você lida com cafeína?', en: 'How do you feel about caffeine?' },
    options: [
      { label: { pt: 'Quanto mais, melhor', en: 'The more the better' }, score: { matcha: 2, mate: 2, preto: 2 } },
      { label: { pt: 'Um pouco, sem exagero', en: 'A little, nothing extreme' }, score: { verde: 2, branco: 2, oolong: 2 } },
      { label: { pt: 'Prefiro evitar', en: "I'd rather avoid it" }, score: { ervas: 3, rooibos: 3 } }
    ]
  },
  {
    q: { pt: 'Qual perfil de sabor te atrai?', en: 'Which flavour profile draws you in?' },
    options: [
      { label: { pt: 'Fresco e vegetal', en: 'Fresh and green' }, score: { verde: 3, matcha: 2, mate: 1 } },
      { label: { pt: 'Floral e frutado', en: 'Floral and fruity' }, score: { branco: 2, oolong: 2, ervas: 2 } },
      { label: { pt: 'Intenso e tostado', en: 'Bold and roasted' }, score: { preto: 2, puer: 3, mate: 1 } },
      { label: { pt: 'Doce e cremoso', en: 'Sweet and creamy' }, score: { rooibos: 3, matcha: 1, preto: 1 } }
    ]
  },
  {
    q: { pt: 'O que você mais quer do chá?', en: 'What do you want most from tea?' },
    options: [
      { label: { pt: 'Foco e disposição', en: 'Focus and energy' }, score: { matcha: 2, verde: 2, mate: 2 } },
      { label: { pt: 'Relaxar e dormir melhor', en: 'Relax and sleep better' }, score: { ervas: 3, rooibos: 2 } },
      { label: { pt: 'Conforto depois de comer', en: 'Comfort after meals' }, score: { ervas: 2, puer: 2 } },
      { label: { pt: 'Descobrir sabores novos', en: 'Discover new flavours' }, score: { oolong: 3, branco: 2, puer: 1 } }
    ]
  }
];

// Tipo de chá -> guia recomendado e benefício relacionado
const quizMap = {
  branco: { product: 'atlas-do-cha', benefit: 'antioxidantes' },
  verde: { product: 'atlas-do-cha', benefit: 'foco' },
  matcha: { product: 'matcha-em-casa', benefit: 'foco' },
  oolong: { product: 'atlas-do-cha', benefit: 'pausa' },
  preto: { product: 'infusoes-de-autor', benefit: 'foco' },
  puer: { product: 'cha-e-mesa', benefit: 'digestao' },
  mate: { product: 'erva-mate', benefit: 'foco' },
  rooibos: { product: 'infusoes-de-autor', benefit: 'hidratacao' },
  ervas: { product: 'ritual-da-noite', benefit: 'sono' }
};

module.exports = { quiz, quizMap };
