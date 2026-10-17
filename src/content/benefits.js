'use strict';
// Central de benefícios. Linguagem cautelosa e níveis de evidência honestos.
// evidence: 'strong' | 'moderate' | 'early'

const benefits = [
  {
    id: 'foco', icon: 'spark',
    title: { pt: 'Foco e energia estável', en: 'Focus and steady energy' },
    summary: {
      pt: 'Cafeína combinada com L-teanina (um aminoácido quase exclusivo da planta do chá) tende a produzir um estado de atenção mais calmo do que a cafeína sozinha.',
      en: 'Caffeine paired with L-theanine (an amino acid almost unique to the tea plant) tends to produce calmer alertness than caffeine on its own.'
    },
    evidence: 'moderate',
    science: {
      pt: 'Ensaios controlados mostram melhora de atenção e tempo de reação com a combinação cafeína + L-teanina. O efeito é modesto e depende da dose.',
      en: 'Controlled trials show improvements in attention and reaction time with caffeine + L-theanine. The effect is modest and dose-dependent.'
    },
    teas: ['matcha', 'verde', 'mate', 'preto'],
    ritual: { pt: 'Uma xícara de verde ou matcha no meio da manhã, longe do café da manhã pesado.', en: 'A cup of green or matcha mid-morning, away from a heavy breakfast.' },
    caution: { pt: 'Evite cafeína nas 6–8 horas antes de dormir.', en: 'Avoid caffeine within 6–8 hours of bedtime.' }
  },
  {
    id: 'sono', icon: 'moon',
    title: { pt: 'Sono e desaceleração', en: 'Sleep and winding down' },
    summary: {
      pt: 'Tisanas sem cafeína criam um ritual noturno. Camomila, melissa e maracujá (passiflora) são as mais estudadas para relaxamento.',
      en: 'Caffeine-free tisanes create an evening ritual. Chamomile, lemon balm and passionflower are the most studied for relaxation.'
    },
    evidence: 'early',
    science: {
      pt: 'Estudos pequenos sugerem melhora na qualidade subjetiva do sono com camomila e passiflora. Parte do benefício vem do próprio ritual: luz baixa, bebida quente, pausa.',
      en: 'Small studies suggest improved subjective sleep quality with chamomile and passionflower. Part of the benefit is the ritual itself: low light, a warm drink, a pause.'
    },
    teas: ['ervas', 'rooibos'],
    ritual: { pt: 'Camomila tampada por 6 min, 45 minutos antes de deitar.', en: 'Covered chamomile for 6 min, 45 minutes before bed.' },
    caution: { pt: 'Camomila pode causar alergia em quem reage a plantas da família das margaridas.', en: 'Chamomile may trigger allergies in people sensitive to the daisy family.' }
  },
  {
    id: 'digestao', icon: 'root',
    title: { pt: 'Digestão e conforto', en: 'Digestion and comfort' },
    summary: {
      pt: 'Gengibre, hortelã e erva-doce são aliados clássicos depois das refeições. O gengibre tem a base de evidências mais sólida, principalmente contra náusea.',
      en: 'Ginger, mint and fennel are classic after-meal allies. Ginger has the strongest evidence base, especially for nausea.'
    },
    evidence: 'strong',
    science: {
      pt: 'Revisões sistemáticas apoiam o gengibre para alívio de náusea. Para hortelã, a evidência mais forte é do óleo em cápsulas no intestino irritável; o chá é menos estudado.',
      en: 'Systematic reviews support ginger for nausea relief. For peppermint, the strongest evidence is for enteric-coated oil in IBS; the tea is less studied.'
    },
    teas: ['ervas', 'puer'],
    ritual: { pt: 'Decocção de 3 lâminas de gengibre por 5 min, com limão no fim.', en: 'Simmer 3 slices of ginger for 5 min, finish with lemon.' },
    caution: { pt: 'Hortelã pode piorar refluxo em algumas pessoas.', en: 'Peppermint can worsen reflux in some people.' }
  },
  {
    id: 'antioxidantes', icon: 'drop',
    title: { pt: 'Antioxidantes e coração', en: 'Antioxidants and heart' },
    summary: {
      pt: 'Chás verdes e brancos são ricos em catequinas; o hibisco, em antocianinas. Consumo regular de chá aparece associado a melhores marcadores cardiovasculares.',
      en: 'Green and white teas are rich in catechins; hibiscus in anthocyanins. Regular tea drinking is associated with better cardiovascular markers.'
    },
    evidence: 'moderate',
    science: {
      pt: 'Grandes estudos observacionais associam o consumo de chá a menor risco cardiovascular. Meta-análises mostram redução modesta da pressão arterial com hibisco. Associação não é causa.',
      en: 'Large observational studies link tea drinking with lower cardiovascular risk. Meta-analyses show a modest blood-pressure reduction with hibiscus. Association is not causation.'
    },
    teas: ['verde', 'branco', 'matcha', 'ervas'],
    ritual: { pt: '2 a 3 xícaras ao longo do dia, sem açúcar.', en: '2–3 cups through the day, unsweetened.' },
    caution: { pt: 'Hibisco é desaconselhado na gestação e pode interagir com anti-hipertensivos.', en: 'Hibiscus is not advised in pregnancy and may interact with blood-pressure medication.' }
  },
  {
    id: 'hidratacao', icon: 'wave',
    title: { pt: 'Hidratação com sabor', en: 'Hydration with flavour' },
    summary: {
      pt: 'Chá conta como água. Para quem tem dificuldade de beber água pura, infusões geladas sem açúcar são uma das trocas mais simples e eficazes no dia a dia.',
      en: 'Tea counts as water. For anyone who struggles to drink plain water, unsweetened iced infusions are one of the simplest, most effective daily swaps.'
    },
    evidence: 'strong',
    science: {
      pt: 'Em quantidades habituais, o chá hidrata de forma comparável à água: o efeito diurético da cafeína é pequeno em quem consome com regularidade.',
      en: 'In usual amounts, tea hydrates comparably to water; the diuretic effect of caffeine is small in regular drinkers.'
    },
    teas: ['rooibos', 'ervas', 'branco'],
    ritual: { pt: 'Cold brew: 5 g de rooibos em 1 L de água fria por 8 h na geladeira.', en: 'Cold brew: 5 g rooibos in 1 L cold water for 8 h in the fridge.' },
    caution: { pt: 'Troque refrigerantes, não a água: varie as bases.', en: 'Swap out sodas, not water: vary your bases.' }
  },
  {
    id: 'pausa', icon: 'leaf',
    title: { pt: 'Pausa e bem-estar mental', en: 'Pause and mental wellbeing' },
    summary: {
      pt: 'Preparar chá com atenção (medir, esperar, cheirar) funciona como uma micro-meditação. O ritual importa tanto quanto a folha.',
      en: 'Making tea with attention (measuring, waiting, smelling) works as a micro-meditation. The ritual matters as much as the leaf.'
    },
    evidence: 'early',
    science: {
      pt: 'Pesquisas sobre pausas e rituais mostram redução do estresse percebido. A L-teanina tem estudos preliminares sobre relaxamento sem sonolência.',
      en: 'Research on breaks and rituals shows reduced perceived stress. L-theanine has preliminary studies on relaxation without drowsiness.'
    },
    teas: ['oolong', 'verde', 'ervas'],
    ritual: { pt: 'Use o timer da Botânora e fique com a xícara durante toda a infusão.', en: 'Use the Botânora timer and stay with your cup for the whole steep.' },
    caution: { pt: 'Chá complementa, não substitui, cuidado profissional em saúde mental.', en: 'Tea complements, never replaces, professional mental-health care.' }
  }
];

module.exports = { benefits };
