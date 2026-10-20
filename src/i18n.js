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
  privacy: { pt: 'privacidade', en: 'privacy' },
  receive: { pt: 'receber', en: 'receive' },
  gear: { pt: 'utensilios', en: 'gear' },
  library: { pt: 'biblioteca', en: 'library' },
  recipes: { pt: 'receitas', en: 'recipes' },
  faq: { pt: 'perguntas', en: 'questions' },
  terms: { pt: 'termos', en: 'terms' }
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
    nav: { guide: 'Tipos de chá', benefits: 'Benefícios', brewing: 'Preparo', recipes: 'Receitas', gear: 'Utensílios', quiz: 'Quiz', faq: 'Perguntas', shop: 'Guias em PDF', myGuides: 'Meus guias' },
    skip: 'Pular para o conteúdo',
    menu: 'Menu',
    footer: {
      receive: 'Receber meus guias',
      about: 'Uma central independente sobre chás: o que são, como prepará-los bem e o que a ciência diz sobre seus benefícios. E guias em PDF para ir mais fundo.',
      learn: 'Aprenda', shop: 'Loja', legal: 'Transparência',
      privacy: 'Privacidade', terms: 'Termos de uso', disclaimer: 'O conteúdo é educativo e não substitui orientação médica ou nutricional.',
      analytics: 'Métricas próprias sem cookies. Google Analytics e Microsoft Clarity só com a sua permissão.',
      cookies: 'Preferências de cookies',
      rights: 'Todos os direitos reservados.'
    },
    consent: { text: 'Usamos cookies do Google Analytics e do Microsoft Clarity para entender como o site é usado e melhorá-lo. Eles só são ativados se você aceitar.', more: 'Saiba mais', accept: 'Aceitar', reject: 'Só os necessários', label: 'Aviso de cookies' },
    newsletter: {
      title: 'Cartas da Botânora',
      text: 'Receitas novas, um tipo de chá explicado a fundo e aviso quando um guia novo for lançado. Sem spam.',
      consent: 'Ao se inscrever, você aceita receber e-mails da Botânora e pode sair quando quiser.', privacy: 'Política de privacidade',
      placeholder: 'seu@email.com', button: 'Inscrever', ok: 'Pronto! Você está na lista.', err: 'Não deu certo. Confira o e-mail.'
    },
    home: {
      title: 'Botânora | Chás, benefícios e guias de preparo',
      description: 'Central sobre chás: tipos, benefícios com base em evidência, guia de preparo com timer e guias em PDF.',
      eyebrow: 'Chás, receitas e guias ilustrados',
      h1a: 'Descubra o universo do chá,', h1b: 'uma xícara de cada vez',
      lead: 'Aprenda a preparar, explorar e combinar chás e infusões com guias ilustrados, receitas autorais e conhecimento botânico acessível.',
      ctaQuiz: 'Descobrir meu chá', ctaGuide: 'Explorar os guias em PDF',
      pathsEyebrow: 'Por onde começar', pathsTitle: 'O que você quer descobrir hoje?', pathsText: 'Cada caminho começa num conteúdo grátis. Se quiser ir mais fundo, mostramos o guia que trata do assunto.', pathGuide: 'Para ir mais fundo',
      aboutEyebrow: 'Sobre a Botânora', aboutTitle: 'Conteúdo feito com cuidado, sem promessas milagrosas',
      aboutText: 'A Botânora é uma central independente sobre chás e infusões. Explicamos o que cada chá é, como prepará-lo bem e o que a ciência diz, separando evidência de tradição.',
      aboutPoints: [['Evidência antes de promessa', 'Cada benefício mostra o nível de evidência científica e os cuidados. Chá não substitui tratamento.'], ['Receitas para fazer em casa', 'Medidas, temperatura e tempo em cada receita, com ingredientes fáceis de encontrar.'], ['Independente e transparente', 'Não vendemos chá. Quando um link de utensílio é de afiliado, avisamos.']], ctaMine: 'Já comprei: ver meus guias',
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
      seeGuide: 'Ver no guia', benefit: 'Benefício relacionado', product: 'Guia recomendado', brew: 'Como preparar',
      why: 'Por que este chá', whyText: 'Pelas suas respostas:', last: 'Seu último resultado foi', lastSee: 'Ver de novo', recipes: 'Receitas grátis para provar', productSee: 'Conhecer o guia', saved: 'Guardamos este resultado só neste navegador para você voltar depois.'
    },
    shop: {
      title: 'Guias em PDF sobre chá | Botânora',
      description: 'Dez guias ilustrados sobre chás: receitas, tipos, preparo, ervas, blends e harmonização.',
      eyebrow: 'Biblioteca Botânora', h1: 'Guias em PDF',
      lead: 'Cadernos ilustrados para ler no celular, no tablet ou imprimir. Pagamento único, download imediato após a confirmação.',
      available: 'Disponível', soon: 'Em breve', pages: 'páginas', buy: 'Comprar', details: 'Ver detalhes', see: 'Ver o guia', format: 'PDF',
      filterLabel: 'Filtrar por tema', filterAll: 'Todos', notSure: 'Não sabe por onde começar?', notSureText: 'Responda o quiz em 30 segundos e receba a indicação de um chá e do guia que combina com ele.', notSureCta: 'Fazer o quiz', shown: '{n} guias',
      waitlist: 'Avise-me no lançamento', waitlistDone: 'Combinado! Avisaremos você.',
      perks: [['Download imediato', 'Após a confirmação do pagamento'], ['Leia em qualquer tela', 'PDF otimizado para celular e impressão'], ['Pagamento seguro', 'Checkout da Cakto, com acesso automático']],
      all: 'Todos os guias'
    },
    product: {
      includes: 'O que você encontra', format: 'Formato', formatValue: 'PDF · A4', language: 'Idioma',
      checkoutTitle: 'Finalizar compra', name: 'Seu nome', email: 'E-mail para receber o acesso',
      consent: 'Concordo com a política de privacidade e entendo que, por ser um produto digital, o acesso é liberado após a confirmação do pagamento.',
      pdfLang: 'Idioma do PDF', pdfLangHint: 'Na sua biblioteca você também poderá baixar a outra versão, quando disponível.',
      pay: 'Comprar o PDF em {l}', payOne: 'Comprar o guia', bothLangs: 'Você recebe o PDF em português e em inglês.', fee: '+ R$ 0,99 de taxa da Cakto, cobrada no checkout.', langNames: { pt: 'português', en: 'inglês' }, secure: 'O pagamento é feito na Cakto, em ambiente seguro. Não temos acesso aos dados do seu cartão.',
      otherLang: 'Prefere o PDF em {l}? Comprar essa versão', steps: ['Você conclui a compra na Cakto.', 'O acesso chega no e-mail usado na compra.', 'Na biblioteca você baixa o PDF, também em outro aparelho.'],
      soonText: 'Este guia está em produção. Entre na lista e seja avisado no lançamento, com condição especial para a lista.',
      related: 'Guias sobre temas próximos', back: 'Voltar à loja',
      forWho: 'Para quem é', buyNow: 'Comprar meu guia', previewFree: 'Ver prévia gratuita', delivery: 'Entrega', deliveryValue: 'Digital, por e-mail',
      faqTitle: 'Dúvidas sobre este guia',
      faq: {
        receive: ['Como recebo o guia?', 'Depois que a Cakto confirma o pagamento, chega um e-mail com o acesso. Na biblioteca da Botânora você baixa o PDF e pode voltar quando quiser com o e-mail da compra e um código de 6 dígitos.'],
        devices: ['Funciona no celular?', 'Sim. É um PDF em formato A4 que abre em qualquer leitor de PDF, no celular, no tablet ou no computador, e pode ser impresso.'],
        langs: ['Em quais idiomas está disponível?', '{l}.'],
        preview: ['Posso ver antes de comprar?', 'Sim. A prévia gratuita mostra {n} páginas do guia, do jeito que você vai receber.'],
        pay: ['Como funciona o pagamento?', 'O pagamento é feito no checkout da Cakto, com as formas de pagamento disponíveis lá. A Cakto cobra uma taxa de serviço de R$ 0,99. A Botânora não tem acesso aos dados do seu cartão.'],
        other: ['Posso baixar em outro aparelho?', 'Sim. Em "Meus guias", informe o e-mail da compra, receba o código e entre no novo aparelho. Cada e-mail pode ficar conectado em até {d} aparelhos.'],
        help: ['E se eu tiver algum problema?', 'Escreva para {e} informando o e-mail usado na compra.']
      },
      preview: { open: 'Ler uma prévia', eyebrow: 'Prévia gratuita', title: 'Folheie antes de comprar', text: '{n} páginas de amostra do guia, do jeito que você vai receber. Toque numa página para ler em tamanho grande e use o zoom para ver os detalhes.', page: 'Página {p} de {t}', of: 'de', close: 'Fechar', prev: 'Página anterior', next: 'Próxima página', buy: 'Quero o guia completo', zoom: 'Zoom', zoomIn: 'Aumentar zoom', zoomOut: 'Diminuir zoom', zoomReset: 'Voltar ao tamanho normal', zoomHint: 'Dê dois cliques (ou toque duas vezes) na página para ampliar. Com zoom, arraste para mover. No celular, use dois dedos.', langNote: 'Prévia em português. O guia também está disponível em inglês.' }
    },
    privacy: {
      title: 'Privacidade | Botânora', h1: 'Privacidade',
      body: [
        'A Botânora não usa ferramentas de publicidade. Cookies de medição de terceiros só são ativados se você aceitar no aviso de cookies.',
        'Se você aceitar, usamos o Google Analytics (estatísticas de visitas) e o Microsoft Clarity (mapas de calor e gravações anônimas de navegação, sem o que você digita em formulários) para entender como o site é usado e melhorá-lo. Você pode mudar a escolha a qualquer momento em "Preferências de cookies", no rodapé.',
        'Para medir o uso do site, registramos a página visitada, a origem da visita, o tipo de dispositivo e um identificador anônimo gerado a partir do seu IP e navegador combinados com um código que muda todos os dias. O IP não é armazenado.',
        'Quando você compra um guia, entra numa lista de espera ou assina a newsletter, guardamos nome e e-mail apenas para entregar o que você pediu. Você pode pedir a exclusão a qualquer momento pelo e-mail de contato.',
        'Se você avaliar um guia, o nome que escolher, a nota e o comentário ficam públicos na página do guia depois da aprovação. O e-mail nunca é exibido. Para apagar uma avaliação, escreva para o e-mail de contato.',
        'Os pagamentos são processados pela Cakto. Não temos acesso aos dados do seu cartão.'
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
      paidTitle: 'Pagamento aprovado. Obrigado!', paid: 'Seu guia já está liberado. Informe o e-mail usado na compra e toque no botão abaixo: chega um código de 6 dígitos para você entrar na biblioteca e baixar o PDF. Se for Pix, a confirmação pode levar alguns segundos.',
      lead: 'Comprou um guia Botânora? Informe o e-mail usado na compra para entrar na sua biblioteca e baixar os PDFs no idioma que preferir. Vale para um aparelho novo também: cada aparelho entra uma vez e fica conectado.',
      sendCode: 'Receber código de acesso', emailHint: 'Enviamos um código de 6 dígitos para o e-mail usado na compra. Funciona em qualquer aparelho.',
      codeSent: 'Se houver compras neste e-mail, enviamos um código para', codeLabel: 'Código de 6 dígitos', enter: 'Entrar na biblioteca',
      resend: 'Reenviar código', change: 'Trocar e-mail', noEmail: 'Não recebi o e-mail', resent: 'Enviamos um novo código. Confira também o spam.',
      wrong: 'Código incorreto. Confira os 6 dígitos.', expiredCode: 'Este código expirou. Toque em Reenviar código.', rate: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
      backupIntro: 'Sem problema: confirme com os 4 últimos dígitos do celular que você informou na compra.', noMail: 'Confirme com os 4 últimos dígitos do celular que você informou na compra.',
      phoneLabel: 'Últimos 4 dígitos do celular',
      email: 'E-mail da compra', code: 'Código do pedido', codeHint: 'Está no e-mail de confirmação da compra (ex.: o número do pedido na Cakto).',
      codeOptional: 'opcional se você recebe e-mails da Botânora',
      submit: 'Acessar meus guias', sent: 'Pronto! Se houver compras neste e-mail, enviamos agora um link para entrar. Ele vale por 24 horas e funciona uma vez. Confira também o spam.',
      needCode: 'Informe também o código do pedido para liberar o acesso.', notFound: 'Não encontramos uma compra com esses dados. Confira o e-mail e os dígitos, ou fale com a gente pelo e-mail abaixo.',
      steps: [['Compre o guia', 'Na página do guia, pelo checkout da Cakto.'], ['Receba o código', 'Digite seu e-mail aqui e use o código de 6 dígitos que chega na sua caixa de entrada.'], ['Escolha e baixe', 'Na biblioteca, escolha o guia e o idioma do PDF.']],
      help: 'Precisa de ajuda? Escreva para'
    },
    reviews: {
      title: 'Avaliações de quem comprou', none: 'Este guia ainda não tem avaliações publicadas. Quem comprou pode avaliar pela biblioteca, em Meus guias.',
      verified: 'Compra verificada', edited: 'editada', count: n => n === 1 ? '1 avaliação' : `${n} avaliações`, of5: 'de 5',
      up: 'Útil', upTitle: 'Marcar como útil', upCount: n => n === 1 ? '1 pessoa achou útil' : `${n} pessoas acharam útil`,
      note: 'Só quem comprou o guia pode avaliar, e cada avaliação é lida antes de ser publicada.',
      // biblioteca
      yours: 'Sua avaliação', write: 'Avaliar este guia', edit: 'Editar avaliação', fix: 'Corrigir e reenviar',
      status: { pending: 'Em análise', approved: 'Publicada', rejected: 'Não aprovada' },
      pendingNote: 'Recebemos sua avaliação. Ela aparece na página do guia depois da aprovação, e você recebe um e-mail.',
      rejectedNote: 'Sua avaliação não foi aprovada. Corrigir e reenviar não conta como edição.', reason: 'Motivo',
      left: n => n === 1 ? 'Resta 1 edição.' : n ? `Restam ${n} edições.` : 'Você já usou as edições desta avaliação.',
      rules: max => `Depois de enviada, a avaliação pode ser editada ${max} vezes. Cada envio passa por aprovação.`,
      rating: 'Sua nota', stars: n => n === 1 ? '1 estrela' : `${n} estrelas`, name: 'Nome que aparece', nameHint: 'Ex.: Mariana C. Seu e-mail nunca aparece.',
      text: 'Seu comentário', textHint: 'O que você achou do guia? Entre 20 e 1.200 caracteres.',
      public: 'Ao enviar, você concorda que seu nome, nota e comentário fiquem públicos na página do guia depois da aprovação.',
      send: 'Enviar avaliação', save: 'Enviar edição', cancel: 'Cancelar', sent: 'Enviado! Sua avaliação está em análise.',
      err: { rating: 'Escolha uma nota de 1 a 5 estrelas.', name: 'Informe um nome com pelo menos 2 letras.', text: 'Escreva um comentário com pelo menos 20 caracteres.', limit: 'Você já usou as edições desta avaliação. Se precisar mudar algo, fale com a gente.', same: 'Nada mudou na avaliação.', login: 'Sua sessão expirou. Entre de novo na biblioteca.', rate: 'Muitas tentativas. Aguarde alguns minutos.', generic: 'Não deu certo. Tente de novo.' }
    },
    library: {
      title: 'Minha biblioteca | Botânora', h1: 'Sua biblioteca', lead: 'Escolha o guia e o idioma do PDF. Você pode baixar quantas vezes precisar dentro do limite do pedido.',
      choose: 'Idioma do PDF', download: 'Baixar PDF', pt: 'Português', en: 'English', soon: 'Em produção',
      onlyOne: 'Disponível apenas em', expired: 'Este link expirou ou é inválido. Peça um novo abaixo.',
      used: 'Este link já foi usado. Para entrar neste aparelho, peça um link novo abaixo: ele chega no e-mail da compra.',
      out: 'Você saiu da biblioteca neste aparelho.', login: 'Entre com o e-mail da compra para baixar seus guias.',
      enterH1: 'Entrar na sua biblioteca', enterLead: 'Acesso para {email}. Confirme para conectar este aparelho e baixar seus guias.',
      enterBtn: 'Entrar neste aparelho', enterNote: 'Este link funciona uma vez. Depois, este aparelho fica conectado e você volta direto pela página Receber meus guias. Para usar em outro aparelho, peça um novo link por lá.',
      connected: 'Este aparelho está conectado à sua biblioteca.', devices: '({n} aparelhos conectados)', logout: 'Sair deste aparelho', logoutAll: 'Sair de todos os aparelhos',
      empty: 'Nenhum guia pago encontrado para este e-mail.', purchased: 'Comprado em', left: 'downloads restantes', more: 'Ver outros guias'
    },
    notFound: { title: 'Página não encontrada | Botânora', h1: 'Esta folha não está aqui', text: 'A página que você procurou não existe ou mudou de lugar.', cta: 'Voltar ao início' },
    currency: 'BRL', from: 'por'
  },
  en: {
    locale: 'en-US', htmlLang: 'en', other: 'pt', otherLabel: 'Português', langShort: 'EN',
    tagline: 'Tea and botanicals',
    nav: { guide: 'Types of tea', benefits: 'Benefits', brewing: 'Brewing', recipes: 'Recipes', gear: 'Gear', quiz: 'Quiz', faq: 'Questions', shop: 'PDF guides', myGuides: 'My guides' },
    skip: 'Skip to content',
    menu: 'Menu',
    footer: {
      receive: 'Get my guides',
      about: 'An independent hub about tea: what it is, how to brew it well and what the science says about its benefits. Plus PDF guides to go deeper.',
      learn: 'Learn', shop: 'Shop', legal: 'Transparency',
      privacy: 'Privacy', terms: 'Terms of use', disclaimer: 'Content is educational and does not replace medical or nutritional advice.',
      analytics: 'Our own cookie-free analytics. Google Analytics and Microsoft Clarity only with your permission.',
      cookies: 'Cookie preferences',
      rights: 'All rights reserved.'
    },
    consent: { text: 'We use Google Analytics and Microsoft Clarity cookies to understand how the site is used and improve it. They are only enabled if you accept.', more: 'Learn more', accept: 'Accept', reject: 'Necessary only', label: 'Cookie notice' },
    newsletter: {
      title: 'Letters from Botânora',
      text: 'New recipes, one tea style explained in depth, and a note when a new guide launches. No spam.',
      consent: 'By subscribing you agree to receive emails from Botânora and can leave at any time.', privacy: 'Privacy policy',
      placeholder: 'you@email.com', button: 'Subscribe', ok: "Done! You're on the list.", err: "That didn't work. Check the email."
    },
    home: {
      title: 'Botânora | Tea, benefits and brewing guides',
      description: 'A tea hub: types, evidence-based benefits, a brewing guide with timer, and PDF guides.',
      eyebrow: 'Teas, recipes and illustrated guides',
      h1a: 'Discover the world of tea,', h1b: 'one cup at a time',
      lead: 'Learn to brew, explore and pair teas and infusions with illustrated guides, original recipes and approachable botanical know-how.',
      ctaQuiz: 'Find my tea', ctaGuide: 'Explore the PDF guides',
      pathsEyebrow: 'Where to start', pathsTitle: 'What would you like to discover today?', pathsText: 'Every path starts with free content. If you want to go deeper, we show you the guide that covers it.', pathGuide: 'To go deeper',
      aboutEyebrow: 'About Botânora', aboutTitle: 'Content made with care, no miracle claims',
      aboutText: 'Botânora is an independent hub about tea and infusions. We explain what each tea is, how to brew it well and what the science says, keeping evidence and tradition apart.',
      aboutPoints: [['Evidence before promises', 'Every benefit shows its level of scientific evidence and the cautions. Tea is not a treatment.'], ['Recipes you can make at home', 'Measures, temperature and time in every recipe, with easy-to-find ingredients.'], ['Independent and transparent', 'We do not sell tea. When a gear link is an affiliate link, we say so.']], ctaMine: 'Already bought? See my guides',
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
      seeGuide: 'See it in the guide', benefit: 'Related benefit', product: 'Recommended guide', brew: 'How to brew',
      why: 'Why this tea', whyText: 'Based on your answers:', last: 'Your last result was', lastSee: 'See it again', recipes: 'Free recipes to try', productSee: 'See the guide', saved: 'We keep this result in this browser only, so you can come back to it.'
    },
    shop: {
      title: 'Tea PDF guides | Botânora',
      description: 'Ten illustrated tea guides: recipes, tea types, brewing, herbs, blending and pairing.',
      eyebrow: 'The Botânora library', h1: 'PDF guides',
      lead: 'Illustrated handbooks to read on your phone, tablet or in print. One-time payment, instant download once payment is confirmed.',
      available: 'Available', soon: 'Coming soon', pages: 'pages', buy: 'Buy', details: 'View details', see: 'See guide', format: 'PDF',
      filterLabel: 'Filter by topic', filterAll: 'All', notSure: 'Not sure where to start?', notSureText: 'Take the 30-second quiz to get a tea recommendation and the guide that goes with it.', notSureCta: 'Take the quiz', shown: '{n} guides',
      waitlist: 'Notify me at launch', waitlistDone: "Great! We'll let you know.",
      perks: [['Instant download', 'Once payment is confirmed'], ['Read on any screen', 'PDF optimised for mobile and print'], ['Secure payment', 'Cakto checkout, with automatic access']],
      all: 'All guides'
    },
    product: {
      includes: "What's inside", format: 'Format', formatValue: 'PDF · A4', language: 'Language',
      checkoutTitle: 'Checkout', name: 'Your name', email: 'Email to receive access',
      consent: 'I agree to the privacy policy and understand that, as a digital product, access is granted once payment is confirmed.',
      pdfLang: 'PDF language', pdfLangHint: 'Your library will also let you download the other version when available.',
      pay: 'Buy the PDF in {l}', payOne: 'Buy the guide', bothLangs: 'You get the PDF in both English and Portuguese.', fee: '+ R$0.99 Cakto fee, charged at checkout.', langNames: { pt: 'Portuguese', en: 'English' }, secure: 'Payment is handled by Cakto in a secure environment. We never see your card details.',
      otherLang: 'Prefer the PDF in {l}? Buy that version', steps: ['You complete your purchase on Cakto.', 'Access arrives at the email used at checkout.', 'Download the PDF from your library, on any device.'],
      soonText: 'This guide is in production. Join the list to hear at launch, with a special offer for the list.',
      related: 'Guides on related topics', back: 'Back to the shop',
      forWho: 'Who it is for', buyNow: 'Buy my guide', previewFree: 'See the free preview', delivery: 'Delivery', deliveryValue: 'Digital, by email',
      faqTitle: 'Questions about this guide',
      faq: {
        receive: ['How do I get the guide?', 'Once Cakto confirms the payment, you get an email with access. In the Botânora library you download the PDF and can come back any time with your purchase email and a 6-digit code.'],
        devices: ['Does it work on my phone?', 'Yes. It is an A4 PDF that opens in any PDF reader, on a phone, tablet or computer, and it can be printed.'],
        langs: ['Which languages is it available in?', '{l}.'],
        preview: ['Can I look inside before buying?', 'Yes. The free preview shows {n} pages of the guide, exactly as you will receive it.'],
        pay: ['How does payment work?', 'Payment happens at the Cakto checkout, with the payment methods available there. Cakto charges a R$ 0.99 service fee. Botânora never sees your card details.'],
        other: ['Can I download it on another device?', 'Yes. In "My guides", enter your purchase email, get the code and sign in on the new device. Each email can stay signed in on up to {d} devices.'],
        help: ['What if something goes wrong?', 'Write to {e} with the email you used to buy.']
      },
      preview: { open: 'Read a preview', eyebrow: 'Free preview', title: 'Look inside before you buy', text: '{n} sample pages from the guide, exactly as you will receive it. Tap a page to read it full size and zoom in to see the details.', page: 'Page {p} of {t}', of: 'of', close: 'Close', prev: 'Previous page', next: 'Next page', buy: 'Get the full guide', zoom: 'Zoom', zoomIn: 'Zoom in', zoomOut: 'Zoom out', zoomReset: 'Back to normal size', zoomHint: 'Double-click (or double-tap) the page to zoom in. When zoomed, drag to move around. On a phone, pinch with two fingers.', langNote: 'Preview in English. The guide is also available in Portuguese.' }
    },
    privacy: {
      title: 'Privacy | Botânora', h1: 'Privacy',
      body: [
        'Botânora uses no advertising tools. Third-party measurement cookies are only enabled if you accept them in the cookie notice.',
        'If you accept, we use Google Analytics (visit statistics) and Microsoft Clarity (heatmaps and anonymous session recordings, without what you type into forms) to understand how the site is used and improve it. You can change your choice at any time under "Cookie preferences" in the footer.',
        'To measure site usage we record the page visited, the referrer, the device type and an anonymous identifier derived from your IP and browser combined with a code that changes every day. Your IP is never stored.',
        'When you buy a guide, join a waitlist or subscribe to the newsletter, we keep your name and email only to deliver what you asked for. You can request deletion at any time via the contact email.',
        'If you review a guide, the name you choose, your rating and your comment become public on the guide page once approved. Your email is never shown. To delete a review, write to the contact email.',
        'Payments are processed by Cakto. We never see your card details.'
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
      paidTitle: 'Payment approved. Thank you!', paid: 'Your guide is ready. Enter the email you used at checkout and tap the button below: you will get a 6-digit code to open your library and download the PDF. With Pix, confirmation can take a few seconds.',
      lead: 'Bought a Botânora guide? Enter the email you used at checkout to open your library and download the PDFs in your preferred language. It works on a new device too: each device signs in once and stays connected.',
      sendCode: 'Get my access code', emailHint: 'We send a 6-digit code to the email used at checkout. It works on any device.',
      codeSent: 'If this email has purchases, we sent a code to', codeLabel: '6-digit code', enter: 'Open my library',
      resend: 'Resend code', change: 'Use another email', noEmail: "I didn't get the email", resent: 'We sent a new code. Check your spam folder too.',
      wrong: 'Wrong code. Check the 6 digits.', expiredCode: 'This code has expired. Tap Resend code.', rate: 'Too many attempts. Wait a few minutes and try again.',
      backupIntro: 'No problem: confirm with the last 4 digits of the phone number you gave at checkout.', noMail: 'Confirm with the last 4 digits of the phone number you gave at checkout.',
      phoneLabel: 'Last 4 digits of your phone',
      email: 'Purchase email', code: 'Order code', codeHint: 'It is in your purchase confirmation email (e.g. the Cakto order number).',
      codeOptional: 'optional if you receive Botânora emails',
      submit: 'Access my guides', sent: "Done! If this email has purchases, we've just sent you a sign-in link. It is valid for 24 hours and works once. Check your spam folder too.",
      needCode: 'Please also enter your order code to unlock access.', notFound: "We couldn't find a purchase with these details. Check the email and digits, or contact us at the email below.",
      steps: [['Buy the guide', 'On the guide page, through Cakto checkout.'], ['Get your code', 'Enter your email here and use the 6-digit code that arrives in your inbox.'], ['Choose and download', 'In your library, pick the guide and the PDF language.']],
      help: 'Need help? Write to'
    },
    reviews: {
      title: 'Reviews from buyers', none: 'This guide has no published reviews yet. Buyers can review it from their library, under My guides.',
      verified: 'Verified purchase', edited: 'edited', count: n => n === 1 ? '1 review' : `${n} reviews`, of5: 'out of 5',
      up: 'Helpful', upTitle: 'Mark as helpful', upCount: n => n === 1 ? '1 person found this helpful' : `${n} people found this helpful`,
      note: 'Only people who bought the guide can review it, and every review is read before it is published.',
      yours: 'Your review', write: 'Review this guide', edit: 'Edit review', fix: 'Fix and resend',
      status: { pending: 'Under review', approved: 'Published', rejected: 'Not approved' },
      pendingNote: 'We got your review. It appears on the guide page once approved, and we will email you.',
      rejectedNote: 'Your review was not approved. Fixing and resending does not count as an edit.', reason: 'Reason',
      left: n => n === 1 ? '1 edit left.' : n ? `${n} edits left.` : 'You have used all edits for this review.',
      rules: max => `Once sent, your review can be edited ${max} times. Every submission is moderated.`,
      rating: 'Your rating', stars: n => n === 1 ? '1 star' : `${n} stars`, name: 'Display name', nameHint: 'E.g. Mariana C. Your email is never shown.',
      text: 'Your comment', textHint: 'What did you think of the guide? Between 20 and 1,200 characters.',
      public: 'By sending, you agree that your name, rating and comment will be public on the guide page once approved.',
      send: 'Send review', save: 'Send edit', cancel: 'Cancel', sent: 'Sent! Your review is being checked.',
      err: { rating: 'Pick a rating from 1 to 5 stars.', name: 'Enter a name with at least 2 letters.', text: 'Write a comment with at least 20 characters.', limit: 'You have used all edits for this review. If you need to change something, get in touch.', same: 'Nothing changed in the review.', login: 'Your session expired. Sign in to the library again.', rate: 'Too many attempts. Wait a few minutes.', generic: "That didn't work. Try again." }
    },
    library: {
      title: 'My library | Botânora', h1: 'Your library', lead: 'Pick a guide and the PDF language. You can download as often as you need within your order limit.',
      choose: 'PDF language', download: 'Download PDF', pt: 'Português', en: 'English', soon: 'In production',
      onlyOne: 'Available only in', expired: 'This link has expired or is invalid. Request a new one below.',
      used: 'This link has already been used. To sign in on this device, request a new link below: it goes to your purchase email.',
      out: 'You have signed out of the library on this device.', login: 'Sign in with your purchase email to download your guides.',
      enterH1: 'Sign in to your library', enterLead: 'Access for {email}. Confirm to connect this device and download your guides.',
      enterBtn: 'Sign in on this device', enterNote: 'This link works once. After that, this device stays connected and you can come straight back through the Get my guides page. To use another device, request a new link there.',
      connected: 'This device is connected to your library.', devices: '({n} devices connected)', logout: 'Sign out of this device', logoutAll: 'Sign out of all devices',
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
