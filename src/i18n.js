'use strict';

const LANGS = ['pt', 'en'];

// Rotas localizadas: chave -> caminho por idioma
const routes = {
  home: { pt: '', en: '' },
  guide: { pt: 'guia', en: 'guide' },
  benefits: { pt: 'beneficios', en: 'benefits' },
  brewing: { pt: 'preparo', en: 'brewing' },
  quiz: { pt: 'quiz', en: 'quiz' },
  shop: { pt: 'loja', en: 'shop' },
  order: { pt: 'pedido', en: 'order' },
  privacy: { pt: 'privacidade', en: 'privacy' },
  receive: { pt: 'receber', en: 'receive' },
  gear: { pt: 'utensilios', en: 'gear' },
  library: { pt: 'biblioteca', en: 'library' },
  recipes: { pt: 'receitas', en: 'recipes' },
  faq: { pt: 'perguntas', en: 'questions' }
};

function url(lang, key, ...rest) {
  const seg = routes[key][lang];
  const parts = ['', lang];
  if (seg) parts.push(seg);
  rest.forEach(r => parts.push(encodeURIComponent(r)));
  return parts.join('/') || '/';
}

const ui = {
  pt: {
    locale: 'pt-BR', htmlLang: 'pt-BR', other: 'en', otherLabel: 'English', langShort: 'PT',
    tagline: 'Chás e botânicos',
    nav: { guide: 'Tipos de chá', benefits: 'Benefícios', brewing: 'Preparo', recipes: 'Receitas', gear: 'Utensílios', quiz: 'Quiz', faq: 'Perguntas', shop: 'Guias em PDF' },
    skip: 'Pular para o conteúdo',
    menu: 'Menu',
    footer: {
      receive: 'Receber meus guias',
      about: 'Uma central independente sobre chás: o que são, como prepará-los bem e o que a ciência diz sobre seus benefícios. E guias em PDF para ir mais fundo.',
      learn: 'Aprenda', shop: 'Loja', legal: 'Transparência',
      privacy: 'Privacidade', disclaimer: 'O conteúdo é educativo e não substitui orientação médica ou nutricional.',
      analytics: 'Métricas próprias sem cookies. Google Analytics e Microsoft Clarity só com a sua permissão.',
      cookies: 'Preferências de cookies',
      rights: 'Todos os direitos reservados.'
    },
    consent: { text: 'Usamos cookies do Google Analytics e do Microsoft Clarity para entender como o site é usado e melhorá-lo. Eles só são ativados se você aceitar.', more: 'Saiba mais', accept: 'Aceitar', reject: 'Só os necessários', label: 'Aviso de cookies' },
    newsletter: {
      title: 'Uma carta por mês sobre chá',
      text: 'Receitas da estação, um tipo de chá explicado a fundo e aviso quando cada novo guia for lançado.',
      placeholder: 'seu@email.com', button: 'Inscrever', ok: 'Pronto! Você está na lista.', err: 'Não deu certo. Confira o e-mail.'
    },
    home: {
      title: 'Botânora | Chás, benefícios e guias de preparo',
      description: 'Central sobre chás: tipos, benefícios com base em evidência, guia de preparo com timer e guias em PDF.',
      eyebrow: 'Central do chá',
      h1a: 'Tudo o que uma folha', h1b: 'pode fazer por você',
      lead: 'Entenda os tipos de chá, prepare cada um no ponto certo e descubra o que a ciência realmente diz sobre seus benefícios.',
      ctaQuiz: 'Descobrir meu chá', ctaGuide: 'Explorar os tipos',
      stats: [['9', 'estilos de chá e tisanas'], ['6', 'benefícios com evidência'], ['10', 'guias em PDF']],
      spectrumEyebrow: 'Uma planta, muitos chás',
      spectrumTitle: 'O que muda é a oxidação',
      spectrumText: 'Branco, verde, oolong e preto vêm da mesma planta, a Camellia sinensis. A diferença está no quanto a folha oxida depois de colhida. Toque em cada estilo.',
      benefitsEyebrow: 'Central de benefícios',
      benefitsTitle: 'O que o chá faz bem, com honestidade',
      benefitsText: 'Cada benefício traz o nível de evidência científica, os chás indicados e os cuidados.',
      brewEyebrow: 'Preparo',
      brewTitle: 'Dois números fazem uma boa xícara',
      brewText: 'Temperatura da água e tempo de infusão. Escolha o chá e a Botânora calcula a dose e cronometra para você.',
      brewCta: 'Abrir o guia de preparo',
      shopEyebrow: 'Biblioteca Botânora',
      shopTitle: 'Guias em PDF para ir mais fundo',
      shopText: 'Cadernos ilustrados, prontos para ler no celular ou imprimir.',
      shopCta: 'Ver todos os guias',
      quizTitle: 'Qual chá combina com você?',
      quizText: 'Quatro perguntas, uma recomendação. Leva 30 segundos.',
      quizCta: 'Fazer o quiz'
    },
    guide: {
      title: 'Tipos de chá: guia completo | Botânora',
      description: 'Branco, verde, matcha, oolong, preto, pu-erh, erva-mate, rooibos e ervas: processo, sabor, cafeína e preparo.',
      eyebrow: 'Guia', h1: 'Os tipos de chá',
      lead: 'Quase todo chá verdadeiro vem de uma única planta, a Camellia sinensis. O que separa um branco de um preto é o que acontece depois da colheita. As tisanas (ervas, flores, rooibos, mate) são outro universo.',
      camellia: 'Da Camellia sinensis', herbal: 'Tisanas e outras plantas',
      oxidation: 'Oxidação', caffeine: 'Cafeína', temp: 'Água', time: 'Tempo', flavor: 'Sabor', bestTime: 'Melhor momento', origin: 'Origem', tip: 'Dica',
      na: 'não se aplica', resteeps: 'reinfusões', compareTitle: 'Comparativo rápido', compareText: 'Valores médios por xícara de 200 ml. Variam com a folha, o tempo e a temperatura.',
      caffeineTitle: 'Quanta cafeína tem cada xícara?', none: 'sem cafeína', perCup: 'mg por xícara',
      brewThis: 'Preparar este chá', related: 'Guia relacionado'
    },
    benefits: {
      title: 'Benefícios do chá com base em evidência | Botânora',
      description: 'Foco, sono, digestão, antioxidantes, hidratação e pausa: o que cada chá faz, com nível de evidência e cuidados.',
      eyebrow: 'Central de benefícios', h1: 'Como o chá faz bem',
      lead: 'Sem promessas milagrosas. Cada benefício abaixo traz o nível de evidência, os chás indicados, um ritual simples e os cuidados.',
      evidence: { strong: 'Evidência forte', moderate: 'Evidência moderada', early: 'Evidência preliminar' },
      evidenceLegend: 'Como lemos a evidência',
      evidenceHelp: {
        strong: 'Revisões sistemáticas e ensaios consistentes.',
        moderate: 'Ensaios controlados ou grandes estudos observacionais, com efeitos modestos.',
        early: 'Estudos pequenos ou iniciais. Promissor, não conclusivo.'
      },
      science: 'O que a ciência diz', teas: 'Chás indicados', ritual: 'Ritual', caution: 'Cuidado',
      disclaimer: 'Este conteúdo é educativo. Gestantes, lactantes, pessoas com condições de saúde ou em uso de medicamentos devem consultar um profissional antes de mudar hábitos.',
      filterAll: 'Todos'
    },
    brewing: {
      title: 'Guia de preparo e timer de chá | Botânora',
      description: 'Calculadora de dose, temperatura ideal e timer de infusão para cada tipo de chá.',
      eyebrow: 'Preparo', h1: 'Prepare no ponto certo',
      lead: 'Escolha o chá e o volume. A Botânora calcula a dose, indica a temperatura e cronometra a infusão.',
      choose: 'Escolha o chá', volume: 'Volume de água', strength: 'Intensidade',
      strengths: ['Suave', 'Equilibrado', 'Intenso'],
      dose: 'Dose', water: 'Água', steep: 'Infusão', grams: 'g de folhas', spoons: 'colheres de chá',
      start: 'Iniciar', pause: 'Pausar', reset: 'Reiniciar', done: 'Pronto! Retire as folhas.',
      noThermo: 'Sem termômetro', thermoGuide: [
        ['100 °C', 'Fervura plena', 'bolhas grandes e contínuas'],
        ['≈ 90 °C', 'Descansada 1 min', 'desligue e espere um minuto'],
        ['≈ 80 °C', 'Descansada 3 min', 'ou junte ¼ de água fria'],
        ['≈ 70 °C', 'Primeiras bolhas', 'pequenas bolhas no fundo, a chaleira "chia"']
      ],
      rulesTitle: 'Regras de ouro',
      rules: [
        'Tampe as ervas: os aromas evaporam com o vapor.',
        'Não esprema o sachê: o último líquido concentra taninos amargos.',
        'Mel e limão por último, com a bebida morna.',
        'Aqueça a xícara antes de servir.',
        'Prove antes de adoçar.'
      ],
      notify: 'Notificar quando terminar'
    },
    quiz: {
      title: 'Qual chá é para você? Quiz | Botânora',
      description: 'Responda quatro perguntas e descubra o chá que combina com sua rotina.',
      eyebrow: 'Quiz', h1: 'Qual chá é para você?', lead: 'Quatro perguntas. Uma recomendação feita para a sua rotina.',
      step: 'Pergunta', of: 'de', back: 'Voltar', result: 'Seu chá é', again: 'Refazer o quiz',
      seeGuide: 'Ver no guia', benefit: 'Benefício relacionado', product: 'Guia recomendado', brew: 'Como preparar'
    },
    shop: {
      title: 'Guias em PDF sobre chá | Botânora',
      description: 'Dez guias ilustrados sobre chás: receitas, tipos, preparo, ervas, blends e harmonização.',
      eyebrow: 'Biblioteca Botânora', h1: 'Guias em PDF',
      lead: 'Cadernos ilustrados para ler no celular, no tablet ou imprimir. Pagamento único, download imediato após a confirmação.',
      available: 'Disponível', soon: 'Em breve', pages: 'páginas', buy: 'Comprar', details: 'Ver detalhes',
      waitlist: 'Avise-me no lançamento', waitlistDone: 'Combinado! Avisaremos você.',
      perks: [['Download imediato', 'Após a confirmação do pagamento'], ['Leia em qualquer tela', 'PDF otimizado para celular e impressão'], ['Pagamento seguro', 'PIX ou Mercado Pago']],
      all: 'Todos os guias'
    },
    product: {
      includes: 'O que você encontra', format: 'Formato', formatValue: 'PDF · A4', language: 'Idioma',
      checkoutTitle: 'Finalizar compra', name: 'Seu nome', email: 'E-mail para receber o acesso',
      consent: 'Concordo com a política de privacidade e entendo que, por ser um produto digital, o acesso é liberado após a confirmação do pagamento.',
      pdfLang: 'Idioma do PDF', pdfLangHint: 'Na sua biblioteca você também poderá baixar a outra versão, quando disponível.',
      pay: 'Ir para o pagamento', secure: 'Pagamento processado com segurança. Seus dados não são compartilhados.',
      soonText: 'Este guia está em produção. Entre na lista e seja avisado no lançamento, com condição especial para a lista.',
      related: 'Você também pode gostar', back: 'Voltar à loja',
      preview: { open: 'Ler uma prévia', eyebrow: 'Prévia gratuita', title: 'Folheie antes de comprar', text: '{n} páginas de amostra do guia, do jeito que você vai receber. Toque numa página para ler em tamanho grande.', page: 'Página {p} de {t}', of: 'de', close: 'Fechar', prev: 'Página anterior', next: 'Próxima página', buy: 'Quero o guia completo', langNote: 'Prévia em português. O guia também está disponível em inglês.' }
    },
    order: {
      title: 'Seu pedido | Botânora', h1: 'Pedido', pending: 'Aguardando pagamento', paid: 'Pagamento confirmado', cancelled: 'Pedido cancelado',
      pixTitle: 'Pague com PIX', pixText: 'Abra o app do seu banco, escolha PIX e escaneie o código ou use o "copia e cola".',
      copy: 'Copiar código PIX', copied: 'Copiado!', amount: 'Valor', waiting: 'Esta página atualiza sozinha quando o pagamento for confirmado.',
      download: 'Baixar o PDF', keep: 'Guarde o link desta página: é por ele que você baixa o seu guia novamente.',
      downloads: 'downloads restantes', noPix: 'O pagamento está sendo configurado. Entraremos em contato pelo e-mail informado.',
      mp: 'Pagar com Mercado Pago', notFound: 'Pedido não encontrado.', library: 'Abrir minha biblioteca', otherLang: 'Baixar em inglês', refunded: 'Pedido reembolsado'
    },
    privacy: {
      title: 'Privacidade | Botânora', h1: 'Privacidade',
      body: [
        'A Botânora não usa ferramentas de publicidade. Cookies de medição de terceiros só são ativados se você aceitar no aviso de cookies.',
        'Se você aceitar, usamos o Google Analytics (estatísticas de visitas) e o Microsoft Clarity (mapas de calor e gravações anônimas de navegação, sem o que você digita em formulários) para entender como o site é usado e melhorá-lo. Você pode mudar a escolha a qualquer momento em "Preferências de cookies", no rodapé.',
        'Para medir o uso do site, registramos a página visitada, a origem da visita, o tipo de dispositivo e um identificador anônimo gerado a partir do seu IP e navegador combinados com um código que muda todos os dias. O IP não é armazenado.',
        'Quando você compra um guia, entra numa lista de espera ou assina a newsletter, guardamos nome e e-mail apenas para entregar o que você pediu. Você pode pedir a exclusão a qualquer momento pelo e-mail de contato.',
        'Pagamentos são processados pelo seu banco (PIX) ou pelo Mercado Pago. Não temos acesso aos dados do seu cartão.'
      ]
    },
    gear: {
      title: 'Utensílios recomendados para chá | Botânora', description: 'Bules, infusores, prensas e organizadores que usamos e recomendamos para preparar chá em casa.',
      eyebrow: 'Recomendações', h1: 'Utensílios que fazem diferença', lead: 'Uma seleção curta de itens para preparar, servir e organizar seus chás. Escolhemos pelo uso, não pelo preço.',
      homeTitle: 'Para preparar melhor', homeText: 'Os utensílios que recomendamos para a sua bancada de chá.', all: 'Ver todos os utensílios',
      cats: { all: 'Todos', preparo: 'Preparo', servir: 'Servir', organizacao: 'Organização', outros: 'Outros' },
      stores: { ml: 'Mercado Livre', amazon: 'Amazon' }, cta: 'Ver no', disclosure: 'Alguns links são de afiliado: se você comprar por eles, a Botânora pode receber uma comissão, sem custo extra para você. Preços e estoque são definidos pela loja.',
      brewTitle: 'Utensílios para este preparo'
    },
    receive: {
      title: 'Receber meus guias | Botânora', h1: 'Receba seus guias',
      lead: 'Comprou um guia Botânora? Informe o e-mail usado na compra e acesse sua biblioteca para baixar os PDFs no idioma que preferir.',
      email: 'E-mail da compra', code: 'Código do pedido', codeHint: 'Está no e-mail de confirmação da compra (ex.: o número do pedido na Cakto).',
      codeOptional: 'opcional se você recebe e-mails da Botânora',
      submit: 'Acessar meus guias', sent: 'Pronto! Se houver compras neste e-mail, enviamos agora o link da sua biblioteca. Confira também o spam.',
      needCode: 'Informe também o código do pedido para liberar o acesso.', notFound: 'Não encontramos uma compra paga com esses dados. Confira o e-mail e o código do pedido.',
      steps: [['Compre o guia', 'Na loja Botânora ou pelo checkout da Cakto.'], ['Receba o acesso', 'Um link chega no seu e-mail logo após a confirmação.'], ['Escolha e baixe', 'Na biblioteca, escolha o guia e o idioma do PDF.']],
      help: 'Precisa de ajuda? Escreva para'
    },
    library: {
      title: 'Minha biblioteca | Botânora', h1: 'Sua biblioteca', lead: 'Escolha o guia e o idioma do PDF. Você pode baixar quantas vezes precisar dentro do limite do pedido.',
      choose: 'Idioma do PDF', download: 'Baixar PDF', pt: 'Português', en: 'English', soon: 'Em produção',
      onlyOne: 'Disponível apenas em', expired: 'Este link expirou ou é inválido. Peça um novo abaixo.',
      empty: 'Nenhum guia pago encontrado para este e-mail.', purchased: 'Comprado em', left: 'downloads restantes', more: 'Ver outros guias'
    },
    notFound: { title: 'Página não encontrada | Botânora', h1: 'Esta folha não está aqui', text: 'A página que você procurou não existe ou mudou de lugar.', cta: 'Voltar ao início' },
    currency: 'BRL', from: 'por'
  },
  en: {
    locale: 'en-US', htmlLang: 'en', other: 'pt', otherLabel: 'Português', langShort: 'EN',
    tagline: 'Tea and botanicals',
    nav: { guide: 'Types of tea', benefits: 'Benefits', brewing: 'Brewing', recipes: 'Recipes', gear: 'Gear', quiz: 'Quiz', faq: 'Questions', shop: 'PDF guides' },
    skip: 'Skip to content',
    menu: 'Menu',
    footer: {
      receive: 'Get my guides',
      about: 'An independent hub about tea: what it is, how to brew it well and what the science says about its benefits. Plus PDF guides to go deeper.',
      learn: 'Learn', shop: 'Shop', legal: 'Transparency',
      privacy: 'Privacy', disclaimer: 'Content is educational and does not replace medical or nutritional advice.',
      analytics: 'Our own cookie-free analytics. Google Analytics and Microsoft Clarity only with your permission.',
      cookies: 'Cookie preferences',
      rights: 'All rights reserved.'
    },
    consent: { text: 'We use Google Analytics and Microsoft Clarity cookies to understand how the site is used and improve it. They are only enabled if you accept.', more: 'Learn more', accept: 'Accept', reject: 'Necessary only', label: 'Cookie notice' },
    newsletter: {
      title: 'One letter a month about tea',
      text: 'Seasonal recipes, one tea style explained in depth, and a note when each new guide launches.',
      placeholder: 'you@email.com', button: 'Subscribe', ok: "Done! You're on the list.", err: "That didn't work. Check the email."
    },
    home: {
      title: 'Botânora | Tea, benefits and brewing guides',
      description: 'A tea hub: types, evidence-based benefits, a brewing guide with timer, and PDF guides.',
      eyebrow: 'The tea hub',
      h1a: 'Everything a single leaf', h1b: 'can do for you',
      lead: 'Understand the types of tea, brew each one just right and find out what the science really says about the benefits.',
      ctaQuiz: 'Find my tea', ctaGuide: 'Explore the types',
      stats: [['9', 'tea styles and tisanes'], ['6', 'evidence-rated benefits'], ['10', 'PDF guides']],
      spectrumEyebrow: 'One plant, many teas',
      spectrumTitle: 'Oxidation makes the difference',
      spectrumText: 'White, green, oolong and black all come from the same plant, Camellia sinensis. What differs is how much the leaf oxidises after picking. Tap each style.',
      benefitsEyebrow: 'Benefits hub',
      benefitsTitle: 'What tea does well, honestly',
      benefitsText: 'Every benefit shows the level of scientific evidence, the teas to reach for and the cautions.',
      brewEyebrow: 'Brewing',
      brewTitle: 'Two numbers make a good cup',
      brewText: 'Water temperature and steep time. Pick your tea and Botânora works out the dose and times it for you.',
      brewCta: 'Open the brewing guide',
      shopEyebrow: 'The Botânora library',
      shopTitle: 'PDF guides to go deeper',
      shopText: 'Illustrated handbooks, ready to read on your phone or print.',
      shopCta: 'See all guides',
      quizTitle: 'Which tea suits you?',
      quizText: 'Four questions, one recommendation. Takes 30 seconds.',
      quizCta: 'Take the quiz'
    },
    guide: {
      title: 'Types of tea: the complete guide | Botânora',
      description: 'White, green, matcha, oolong, black, pu-erh, yerba mate, rooibos and herbs: process, flavour, caffeine and brewing.',
      eyebrow: 'Guide', h1: 'The types of tea',
      lead: 'Almost every true tea comes from a single plant, Camellia sinensis. What separates a white from a black is what happens after harvest. Tisanes (herbs, flowers, rooibos, mate) are another world.',
      camellia: 'From Camellia sinensis', herbal: 'Tisanes and other plants',
      oxidation: 'Oxidation', caffeine: 'Caffeine', temp: 'Water', time: 'Time', flavor: 'Flavour', bestTime: 'Best time', origin: 'Origin', tip: 'Tip',
      na: 'n/a', resteeps: 'resteeps', compareTitle: 'Quick comparison', compareText: 'Average values per 200 ml cup. They vary with the leaf, time and temperature.',
      caffeineTitle: 'How much caffeine is in each cup?', none: 'caffeine-free', perCup: 'mg per cup',
      brewThis: 'Brew this tea', related: 'Related guide'
    },
    benefits: {
      title: 'Evidence-based benefits of tea | Botânora',
      description: 'Focus, sleep, digestion, antioxidants, hydration and calm: what each tea does, with evidence level and cautions.',
      eyebrow: 'Benefits hub', h1: 'How tea does you good',
      lead: 'No miracle claims. Each benefit below shows the level of evidence, the teas to reach for, a simple ritual and the cautions.',
      evidence: { strong: 'Strong evidence', moderate: 'Moderate evidence', early: 'Early evidence' },
      evidenceLegend: 'How we read the evidence',
      evidenceHelp: {
        strong: 'Systematic reviews and consistent trials.',
        moderate: 'Controlled trials or large observational studies, with modest effects.',
        early: 'Small or early studies. Promising, not conclusive.'
      },
      science: 'What the science says', teas: 'Teas to try', ritual: 'Ritual', caution: 'Caution',
      disclaimer: 'This content is educational. If you are pregnant, breastfeeding, have a health condition or take medication, talk to a professional before changing your habits.',
      filterAll: 'All'
    },
    brewing: {
      title: 'Tea brewing guide and timer | Botânora',
      description: 'Dose calculator, ideal temperature and steeping timer for every type of tea.',
      eyebrow: 'Brewing', h1: 'Brew it just right',
      lead: 'Pick your tea and volume. Botânora works out the dose, shows the temperature and times the steep.',
      choose: 'Choose your tea', volume: 'Water volume', strength: 'Strength',
      strengths: ['Light', 'Balanced', 'Strong'],
      dose: 'Dose', water: 'Water', steep: 'Steep', grams: 'g of leaf', spoons: 'teaspoons',
      start: 'Start', pause: 'Pause', reset: 'Reset', done: 'Done! Remove the leaves.',
      noThermo: 'No thermometer', thermoGuide: [
        ['100 °C', 'Rolling boil', 'large, continuous bubbles'],
        ['≈ 90 °C', 'Rested 1 min', 'turn off and wait a minute'],
        ['≈ 80 °C', 'Rested 3 min', 'or add ¼ cold water'],
        ['≈ 70 °C', 'First bubbles', 'tiny bubbles at the bottom, the kettle hisses']
      ],
      rulesTitle: 'Golden rules',
      rules: [
        'Cover herbal infusions: the aromas leave with the steam.',
        "Don't squeeze the bag: the last drops are bitter tannins.",
        'Honey and lemon go in last, once the drink is warm.',
        'Warm the cup before serving.',
        'Taste before you sweeten.'
      ],
      notify: 'Notify me when done'
    },
    quiz: {
      title: 'Which tea is for you? Quiz | Botânora',
      description: 'Answer four questions and find the tea that fits your routine.',
      eyebrow: 'Quiz', h1: 'Which tea is for you?', lead: 'Four questions. One recommendation built around your routine.',
      step: 'Question', of: 'of', back: 'Back', result: 'Your tea is', again: 'Retake the quiz',
      seeGuide: 'See it in the guide', benefit: 'Related benefit', product: 'Recommended guide', brew: 'How to brew'
    },
    shop: {
      title: 'Tea PDF guides | Botânora',
      description: 'Ten illustrated tea guides: recipes, tea types, brewing, herbs, blending and pairing.',
      eyebrow: 'The Botânora library', h1: 'PDF guides',
      lead: 'Illustrated handbooks to read on your phone, tablet or in print. One-time payment, instant download once payment is confirmed.',
      available: 'Available', soon: 'Coming soon', pages: 'pages', buy: 'Buy', details: 'View details',
      waitlist: 'Notify me at launch', waitlistDone: "Great! We'll let you know.",
      perks: [['Instant download', 'Once payment is confirmed'], ['Read on any screen', 'PDF optimised for mobile and print'], ['Secure payment', 'PIX or Mercado Pago']],
      all: 'All guides'
    },
    product: {
      includes: "What's inside", format: 'Format', formatValue: 'PDF · A4', language: 'Language',
      checkoutTitle: 'Checkout', name: 'Your name', email: 'Email to receive access',
      consent: 'I agree to the privacy policy and understand that, as a digital product, access is granted once payment is confirmed.',
      pdfLang: 'PDF language', pdfLangHint: 'Your library will also let you download the other version when available.',
      pay: 'Continue to payment', secure: 'Payment processed securely. Your data is never shared.',
      soonText: 'This guide is in production. Join the list to hear at launch, with a special offer for the list.',
      related: 'You may also like', back: 'Back to the shop',
      preview: { open: 'Read a preview', eyebrow: 'Free preview', title: 'Look inside before you buy', text: '{n} sample pages from the guide, exactly as you will receive it. Tap a page to read it full size.', page: 'Page {p} of {t}', of: 'of', close: 'Close', prev: 'Previous page', next: 'Next page', buy: 'Get the full guide', langNote: 'Preview in English. The guide is also available in Portuguese.' }
    },
    order: {
      title: 'Your order | Botânora', h1: 'Order', pending: 'Awaiting payment', paid: 'Payment confirmed', cancelled: 'Order cancelled',
      pixTitle: 'Pay with PIX', pixText: 'Open your banking app, choose PIX and scan the code or use "copy and paste".',
      copy: 'Copy PIX code', copied: 'Copied!', amount: 'Amount', waiting: 'This page updates automatically once payment is confirmed.',
      download: 'Download the PDF', keep: 'Keep this page\'s link: you can use it to download your guide again.',
      downloads: 'downloads left', noPix: 'Payment is being set up. We will contact you at the email provided.',
      mp: 'Pay with Mercado Pago', notFound: 'Order not found.', library: 'Open my library', otherLang: 'Download in Portuguese', refunded: 'Order refunded'
    },
    privacy: {
      title: 'Privacy | Botânora', h1: 'Privacy',
      body: [
        'Botânora uses no advertising tools. Third-party measurement cookies are only enabled if you accept them in the cookie notice.',
        'If you accept, we use Google Analytics (visit statistics) and Microsoft Clarity (heatmaps and anonymous session recordings, without what you type into forms) to understand how the site is used and improve it. You can change your choice at any time under "Cookie preferences" in the footer.',
        'To measure site usage we record the page visited, the referrer, the device type and an anonymous identifier derived from your IP and browser combined with a code that changes every day. Your IP is never stored.',
        'When you buy a guide, join a waitlist or subscribe to the newsletter, we keep your name and email only to deliver what you asked for. You can request deletion at any time via the contact email.',
        'Payments are processed by your bank (PIX) or by Mercado Pago. We never see your card details.'
      ]
    },
    gear: {
      title: 'Recommended tea gear | Botânora', description: 'Teapots, infusers, presses and organisers we use and recommend for brewing tea at home.',
      eyebrow: 'Recommendations', h1: 'Gear that makes a difference', lead: 'A short selection of items to brew, serve and organise your tea. Chosen for use, not price.',
      homeTitle: 'Brew better', homeText: 'The gear we recommend for your tea corner.', all: 'See all gear',
      cats: { all: 'All', preparo: 'Brewing', servir: 'Serving', organizacao: 'Storage', outros: 'Other' },
      stores: { ml: 'Mercado Livre', amazon: 'Amazon' }, cta: 'View on', disclosure: 'Some links are affiliate links: if you buy through them, Botânora may earn a commission at no extra cost to you. Prices and stock are set by the store.',
      brewTitle: 'Gear for this brew'
    },
    receive: {
      title: 'Get my guides | Botânora', h1: 'Get your guides',
      lead: 'Bought a Botânora guide? Enter the email you used at checkout and open your library to download the PDFs in your preferred language.',
      email: 'Purchase email', code: 'Order code', codeHint: 'It is in your purchase confirmation email (e.g. the Cakto order number).',
      codeOptional: 'optional if you receive Botânora emails',
      submit: 'Access my guides', sent: "Done! If this email has purchases, we've just sent your library link. Check your spam folder too.",
      needCode: 'Please also enter your order code to unlock access.', notFound: "We couldn't find a paid purchase with these details. Check the email and order code.",
      steps: [['Buy the guide', 'In the Botânora shop or through Cakto checkout.'], ['Get access', 'A link arrives in your inbox right after payment.'], ['Choose and download', 'In your library, pick the guide and the PDF language.']],
      help: 'Need help? Write to'
    },
    library: {
      title: 'My library | Botânora', h1: 'Your library', lead: 'Pick a guide and the PDF language. You can download as often as you need within your order limit.',
      choose: 'PDF language', download: 'Download PDF', pt: 'Português', en: 'English', soon: 'In production',
      onlyOne: 'Available only in', expired: 'This link has expired or is invalid. Request a new one below.',
      empty: 'No paid guides found for this email.', purchased: 'Purchased on', left: 'downloads left', more: 'See other guides'
    },
    notFound: { title: 'Page not found | Botânora', h1: 'This leaf is not here', text: 'The page you were looking for does not exist or has moved.', cta: 'Back to home' },
    currency: 'BRL', from: 'for'
  }
};

function money(cents, lang) {
  return new Intl.NumberFormat(ui[lang].locale, { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

module.exports = { LANGS, routes, url, ui, money };
