# Guia interno: o que cada guia Botanora já cobre

Documento interno, gerado automaticamente em 15/10/2026 a partir do código dos guias (`tools/guias/pdf`). Não é vendido nem publicado no site.

## Como usar antes de criar um guia novo

1. Leia a seção do tema mais próximo e o **índice de ingredientes** no fim deste documento.
2. Escreva o guia novo em `tools/guias/pdf/` (um arquivo `gNN_<slug>.py`, seguindo os existentes).
3. Rode `python3 catalog.py dups` na pasta `tools/guias/pdf`. Qualquer par acima de 0,67 precisa ser revisto: mesma bebida, mesma combinação de ingredientes ou mesma técnica = trocar.
4. Rode `python3 inventario.py ../../../docs/guias-conteudo.md` para atualizar este documento.

### Regras de conteúdo

- Cada receita existe em um único guia. Variação de sabor de uma técnica (ex.: brigadeiro de matcha e de Earl Grey) é aceitável; a mesma bebida com outro nome não é.
- Um tema pode aparecer em mais de um guia, mas cada receita é única. Ex.: o Foco tem um shot de matcha que não existe no Matcha em Casa. Antes de usar um tema que já tem guia próprio, confira a lista dele abaixo.
- Tudo em PT-BR e inglês, com o mesmo número de páginas nas duas versões.
- Nunca usar travessão (o traço longo) em nenhum texto.
- Receitas com quantidade, temperatura, tempo, passo a passo e uma dica. Nada de promessas de cura; cuidados de segurança sempre que houver ervas medicinais, cafeína alta, fermentação, peixe cru ou mel para bebês.
- Paleta: noite #111a21, ouro #d6b44c, papel #f6f1e6. Fontes: EB Garamond e Jost. Capa no estilo de desenho a mão (`tools/guias/capas`).

## Visão geral

| Nº | Guia | Páginas | Receitas e fórmulas |
|---|---|---|---|
| 01 | Infusões de Autor (`infusoes-de-autor`) | 40 | 40 |
| 02 | Atlas do Chá (`atlas-do-cha`) | 40 | 12 |
| 03 | Ritual da Noite (`ritual-da-noite`) | 24 | 24 |
| 04 | Foco & Energia (`foco-e-energia`) | 24 | 18 |
| 05 | Gelados & Cold Brew (`chas-gelados`) | 28 | 39 |
| 06 | Matcha em Casa (`matcha-em-casa`) | 28 | 18 |
| 07 | Ervas do Quintal (`ervas-do-quintal`) | 32 | 16 |
| 08 | Blends Autorais (`blends-autorais`) | 36 | 44 |
| 09 | Chá & Mesa (`cha-e-mesa`) | 28 | 20 |
| 10 | Erva-Mate (`erva-mate`) | 24 | 18 |

## 01. Infusões de Autor

*40 chás e infusões em estilo barista, feitos com a sua despensa* · slug `infusoes-de-autor`

**Seções**

- A despensa
- Temperatura e tempo
- Escolha rápida
- Chá Preto
- Rooibos Moon
- Florais & Ervas
- Hibisco & Frutos
- Especiarias & Tônicos
- Cremosos
- Índice por ingrediente

**Receitas completas (40)**

- Preto Imperial de Especiarias: chá preto, canela em casca, anis-estrelado, mel
- Preto & Maçã Tostada: maçã em lâminas finas, canela em pó, chá preto, mel
- Toddy do Barista: chá preto, gengibre ralado, canela em casca, suco de limão, mel
- Rubi Escuro: chá preto, flor de hibisco, casca de limão, mel
- Preto Citrino com Capim-Cidreira: chá preto, capim-cidreira seco, limão, mel
- Preto Gelado de Limão & Mel: chá preto, mel, suco de limão, limão
- Anisado Duplo: chá preto, chá de erva-doce, anis-estrelado, mel
- Torta de Maçã no Bule: rooibos moon, maçã em cubos, canela em casca, canela em pó, mel
- Rooibos Âmbar: mel, rooibos moon, casca de limão
- Crepúsculo: rooibos moon, rosehip, hibiscus & cherry, mel, maçã
- Brasa: rooibos moon, gengibre, mel, canela em pó
- Rooibos Estrelado: rooibos moon, chá de erva-doce, anis-estrelado, mel
- Cold Brew de Rooibos & Maçã: rooibos moon, maçã em lâminas, canela em casca, mel
- Lua Cheia: rooibos moon, flores de camomila, mel, raspas de limão
- Camomila Dourada: flores de camomila, mel, limão
- Pomar ao Entardecer: maçã em lâminas, flores de camomila, canela em pó, mel
- Brisa: capim-cidreira seco, gengibre, mel, limão
- Jardim Fresco: capim-cidreira seco, chá de hortelã, mel, casca de limão
- Trio Sereno: flores de camomila, capim-cidreira seco, chá de erva-doce, mel
- Camomila & Limão Tostado: camomile & lemongrass, limão, mel
- Digestivo do Chef: chá de hortelã, chá de erva-doce, anis-estrelado, mel
- Hibisco Quente Especiado: flor de hibisco, maçã em lâminas, canela em casca, anis-estrelado, casca de limão, mel
- Sorrel Caribenho: flor de hibisco, gengibre ralado, canela em casca, mel
- Rosehip Cherry & Maçã Caramelizada: rosehip, hibiscus & cherry, maçã em cubos pequenos, mel, canela em pó
- Rubi Mentolado: chá de hibisco, chá de hortelã, mel, limão
- Água Fresca de Hibisco: flor de hibisco, mel, limão
- Rosa do Deserto: flor de hibisco, capim-cidreira seco, mel
- Rosé da Tarde: rosehip, hibiscus & cherry, flores de camomila, mel
- Elixir de Gengibre, Limão & Mel: gengibre ralado, limão, mel
- Cidra Quente sem Álcool: maçã em cubos, canela em casca, anis-estrelado, casca de limão, mel
- Tisana das Estrelas: anis-estrelado, canela em casca, casca de limão, mel
- Fogo & Gelo: gengibre, chá de hortelã, mel
- Tônico Gelado de Gengibre: gengibre ralado, mel, limão
- Pomar Cítrico: maçã em lâminas, gengibre, capim-cidreira seco, mel
- Chai de Panela: chá preto, canela em casca, anis-estrelado, gengibre ralado, leite integral, mel
- Teh Tarik do Sul: chá preto, leite integral, mel
- Rooibos Moon Latte: rooibos moon, leite integral, mel, canela em pó
- Leite Lunar de Camomila: leite integral, flores de camomila, anis-estrelado, mel, canela em pó
- Névoa de Capim-Cidreira: chá preto, capim-cidreira seco, leite integral, mel
- Torta de Maçã Cremosa: maçã em cubos pequenos, mel, canela em casca, rooibos moon, leite integral, canela em pó

## 02. Atlas do Chá

*Os seis estilos da Camellia sinensis, da folha à xícara* · slug `atlas-do-cha`

**Seções**

- A planta
- Os seis estilos
  - Branco
  - Verde
  - Amarelo
  - Oolong
  - Preto
  - Escuros e pu-erh
- Mapa do chá
- Degustação
- Glossário
- Receitas por estilo
- 24 chás famosos
- Utensílios
- A água
- Gongfu passo a passo

**Receitas completas (12)**

- Bai Mu Dan na Gaiwan: Bai Mu Dan
- Shou Mei Cozido: Shou Mei ou branco envelhecido, tâmaras secas
- Long Jing no Copo: Long Jing
- Sencha no Kyusu: sencha
- Chá Amarelo na Gaiwan: chá amarelo
- Tie Guan Yin Gongfu: Tie Guan Yin
- Bubble Tea Caseiro: oolong tostado ou Assam, pérolas de tapioca, açúcar mascavo, leite
- Darjeeling de Primavera: Darjeeling first flush
- Po Cha: Chá Tibetano com Manteiga: pu-erh shou ou outro chá escuro prensado, manteiga sem sal, leite, sal
- London Fog: Earl Grey, leite, xarope de baunilha ou mel
- Pu-erh com Casca de Tangerina: pu-erh shou, casca de tangerina seca
- Zavarka à Russa: chá preto

## 03. Ritual da Noite

*Tisanas sem cafeína para desacelerar e dormir melhor* · slug `ritual-da-noite`

**Seções**

- Por que um ritual
- As ervas
- O protocolo
- Vinte blends
- Sua primeira semana
- Diário do sono

**Receitas completas (4)**

- Leite de Aveia, Tâmara e Canela: bebida de aveia, tâmaras sem caroço, canela, sal
- Leite de Amêndoas, Baunilha e Noz-moscada: leite de amêndoas, extrato de baunilha, noz-moscada ralada, mel
- Chá de Banana com Canela: banana orgânica madura, com casca, bem lavada, pau de canela
- Melissa Morna com Limão: melissa fresca, lavanda, limão-siciliano

**Blends (20)**

- Camomila Clássica: camomila
- Camomila & Melissa: camomila, melissa seca
- Rooibos da Lua: rooibos, camomila
- Tília Serena: flores de tília, melissa
- Lavanda Discreta: camomila, lavanda culinária
- Passiflora & Rooibos: passiflora seca, rooibos
- Cidreira do Quintal: melissa fresca, limão
- Lúcia-lima Suave: lúcia-lima seca, camomila
- Alface & Hortelã: alface-romana ou crespa, lavadas, hortelã
- Erva-Doce Noturna: sementes de erva-doce, camomila
- Leite Dourado Leve: leite ou bebida vegetal, cúrcuma, canela e pimenta-do-reino
- Hortelã & Melissa: hortelã seca, melissa
- Rosa & Camomila: camomila, pétalas de rosa culinária
- Rooibos & Laranja: rooibos, casca de laranja, cravo
- Tília & Maçã: tília, maçã em cubos
- Erva-Cidreira Brasileira: folhas frescas de Lippia alba
- Flor de Laranjeira & Camomila: flores de laranjeira secas, camomila
- Cacau & Rooibos: rooibos, nibs ou cascas de cacau
- Gengibre Suave: gengibre, camomila
- Noite Completa: camomila, melissa, rooibos, lavanda

## 04. Foco & Energia

*Chá verde, matcha e mate para uma energia sem picos* · slug `foco-e-energia`

**Seções**

- Cafeína e L-teanina
- A rotina das três xícaras
- Dezoito receitas
- A garrafa da semana
- Lanches que ajudam

**Receitas completas (18)**

- Shot de Matcha com Gengibre: matcha, suco de gengibre fresco, mel
- Lassi de Matcha: iogurte natural integral, matcha, mel, cardamomo em pó
- Gyokuro no Gelo: gyokuro ou sencha de sombra, cubos de gelo de água filtrada
- Verde, Limão & Gengibre: gengibre, chá verde chinês, casca de limão
- Branco da Tarde com Hortelã: Shou Mei ou Bai Mu Dan, hortelã fresca
- Tererê de Laranja e Alecrim: erva-mate para tererê, suco de laranja natural, alecrim
- Verde com Guaraná e Limão: chá verde frio, guaraná em pó, limão, mel
- Mocha de Chá Preto: chá preto Assam, cacau em pó 100%, leite, açúcar mascavo
- Oolong com Laranja Chamuscada: oolong tostado, rodelas grossas de laranja
- Genmaicha de Meio da Tarde: genmaicha
- Hojicha Latte: hojicha em folhas, leite, mel
- Verde & Água de Coco: chá verde, limão em rodelas
- Mate Gelado de Coco: erva-mate, coco ralado tostado
- Verde & Cacau com Pimenta: chá verde chinês, nibs de cacau, pimenta-calabresa ou caiena
- Ceylon com Cardamomo e Mel: chá preto Ceylon, bagas de cardamomo amassadas, mel
- Kabusecha de Concentração: kabusecha ou gyokuro
- Kukicha com Maçã Verde: kukicha, maçã verde em lâminas finas
- Rooibos & Hortelã: a Última Xícara: rooibos, hortelã

## 05. Gelados & Cold Brew

*Infusões frias, espumas e chás de verão* · slug `chas-gelados`

**Seções**

- Métodos
- Gelos e xaropes
- 25 receitas
- Kombucha
- Receitas de assinatura
- Bar de chá gelado
- Seis mocktails de chá
- Menos açúcar, mesmo prazer

**Receitas completas (8)**

- Chá Gelado de Pêssego de Verdade: pêssegos maduros, açúcar, chá preto, limão
- Limonada Suíça de Chá Verde: limões-taiti com casca, lavados, cold brew de chá verde, leite condensado ou xarope
- Ponche de Hibisco e Gengibre: hibisco, gengibre em lâminas, xarope simples, laranjas em rodelas
- Earl Grey Gelado com Lavanda: Earl Grey, lavanda culinária, xarope de mel
- Granita de Chá Preto e Limão: chá preto forte, açúcar, limão-siciliano
- Picolé de Chá Verde e Coco: cold brew verde concentrado, leite de coco, açúcar, coco ralado
- Smoothie Verde Tropical: cold brew de chá verde, abacaxi congelado em cubos, hortelã, mel
- Affogato de Chá Preto: sorvete de creme, chá preto Assam ou Keemun, açúcar mascavo

**Receitas curtas (fichas) (25)**

- Cold Brew de Chá Preto: chá preto
- Cold Brew Verde: sencha ou verde chinês
- Cold Brew de Oolong: oolong leve
- Branco Gelado de Pêssego: Bai Mu Dan, pêssego em lâminas
- Sencha Flash: sencha
- Cold Brew de Darjeeling com Uva: Darjeeling, uvas verdes cortadas ao meio
- Hibisco & Laranja: flor de hibisco, laranja em rodelas
- Chá Azul com Limão: flor de clitória seca, limões
- Rooibos, Baunilha & Coco: rooibos, fava de baunilha aberta, leite de coco
- Hortelã & Pepino: hortelã, pepino em lâminas, chá verde
- Cold Brew de Genmaicha: genmaicha
- Pu-erh Gelado com Laranja: pu-erh shou, casca de laranja
- Chá Verde & Melancia: cold brew verde, suco de melancia coado, hortelã
- Arnold Palmer de Chá: cold brew de chá preto, limonada pouco doce
- Tônica de Chá Verde: cold brew verde, casca de limão
- Hojicha Tônica: cold brew de hojicha concentrado, laranja
- Chá Preto & Tamarindo: chá preto, polpa de tamarindo, xarope de rapadura
- Thai Iced Tea Caseiro: chá preto, anis-estrelado, leite condensado ou xarope + leite
- Cold Brew de Hojicha: hojicha
- Limonada de Lavanda com Chá Branco: cold brew de chá branco, limões-sicilianos, xarope de lavanda
- Melissa & Maçã Verde: melissa fresca, maçã verde em lâminas
- Frutas Vermelhas: chá de frutas vermelhas, morangos ou frutas vermelhas
- Chá Verde & Kiwi: cold brew verde, kiwis maduros, mel
- Espuma Fria de Chá: leite desnatado bem gelado, xarope, matcha ou canela
- Picolé de Chá: qualquer cold brew deste guia, xarope ou mel, frutas picadas

**Mocktails (6)**

- Chá Branco Spritz: cold brew de chá branco, lâminas finas de pera
- Mojito de Chá Verde: folhas de hortelã, limão em gomos, xarope, cold brew verde
- Oolong & Maracujá: cold brew de oolong, maracujá, xarope
- Chá Preto Sour: chá preto forte frio, suco de limão, xarope, clara pasteurizada ou aquafaba
- Rooibos Cola: rooibos com canela gelado, xarope de rapadura
- Jasmim & Lichia: cold brew de jasmim, lichias amassadas

## 06. Matcha em Casa

*Comprar, guardar, bater e criar com matcha* · slug `matcha-em-casa`

**Seções**

- Conhecer o matcha
- A técnica
- Dezoito receitas
- Doces de matcha
- Sete dias para bater bem
- Combinações de sabor

**Receitas completas (18)**

- Usucha: matcha cerimonial
- Koicha: matcha cerimonial de alta qualidade
- Matcha Latte Clássico: matcha, leite integral, xarope simples ou mel
- Matcha Gelado em Camadas: matcha, leite gelado, xarope
- Matcha de Morango: morangos maduros, açúcar ou mel, leite gelado, matcha
- Matcha Tônica: matcha, casca de limão-siciliano
- Matcha com Laranja: matcha, suco de laranja natural coado
- Matcha Coco: matcha, leite de coco
- Matcha Branco com Baunilha: matcha, leite, chocolate branco picado, extrato de baunilha
- Matcha Especiado: leite, pau de canela pequeno, bagas de cardamomo amassadas, gengibre, matcha, mel
- Smoothie Verde: banana congelada, espinafre baby, leite ou bebida vegetal, matcha culinário, aveia em flocos
- Affogato de Matcha: sorvete de creme ou baunilha, matcha
- Overnight Oats de Matcha: aveia em flocos, leite, iogurte natural, matcha culinário, mel, chia
- Biscoito Amanteigado de Matcha: manteiga sem sal em temperatura ambiente, açúcar de confeiteiro, farinha de trigo, matcha culinário peneirado, sal
- Brigadeiro de Matcha: leite condensado, manteiga, matcha culinário peneirado, chocolate branco picado
- Panquecas de Matcha: farinha de trigo, matcha culinário, açúcar, fermento químico, ovo, leite, manteiga derretida
- Tiramisù de Matcha: matcha, mascarpone, creme de leite fresco gelado, açúcar de confeiteiro, biscoito champanhe
- Sorvete de Matcha sem Máquina: creme de leite fresco gelado, leite condensado, matcha culinário, sal

## 07. Ervas do Quintal

*Cultivar, colher, secar e preparar ervas de chá* · slug `ervas-do-quintal`

**Seções**

- Cultivar
- Catorze ervas
- Colher, secar, guardar
- Segurança e misturas
- Receitas do quintal
- Mais ervas e a horta
  - Horta de chá em 1 m²
  - Multiplicar as mudas
  - Pragas e problemas
  - Etiquetas para os potes

**Receitas completas (10)**

- Capim-cidreira & Maracujá: capim-cidreira fresco, maracujá, mel
- Chá de Hortelã à Marroquina: chá verde gunpowder, hortelã fresca, açúcar
- Mel de Lavanda e Limão: mel líquido, lavanda seca culinária, casca de limão-siciliano em tiras, seca por 1 dia
- Sal de Ervas do Quintal: folhas frescas de alecrim, tomilho e sálvia, dentes de alho, sal grosso, raspas de limão
- Xarope de Capim-cidreira: açúcar, capim-cidreira picado
- Água de Manjericão e Morango: morangos em lâminas, manjericão
- Erva-doce com Maçã: sementes de erva-doce amassadas, maçã em cubos com casca, pau de canela pequeno
- Raspadinha de Hortelã e Limão: hortelã, açúcar, limões
- Manteiga de Ervas: manteiga em temperatura ambiente, ervas frescas picadas, dente de alho ralado, sal e raspas de limão
- Vinagre Aromático de Ervas: vinagre de vinho branco ou maçã, alecrim, tomilho ou estragão secos ao ar 1 dia, casca de limão

**Misturas (6)**

- Louro & Laranja: folhas de louro secas, casca de laranja, pau de canela
- Calêndula & Capim: pétalas de calêndula, capim-cidreira picado
- Tomilho & Mel: tomilho fresco, mel
- Jardim gelado: hortelã, manjericão, limão em rodelas
- Manhã de inverno: alecrim, casca de laranja, pau de canela
- Rubi do quintal: hibisco, capim-cidreira, maçã em lâminas

## 08. Blends Autorais

*Crie, teste, embale e rotule os seus próprios chás* · slug `blends-autorais`

**Seções**

- A arquitetura do blend
- Vinte fórmulas
- Do teste à embalagem
- Mais dezoito fórmulas
- Receitas com seus blends
- Técnicas de ateliê
- Produção e presentes
  - Custo e preço
  - Kits de presente
  - Ficha técnica do blend

**Receitas completas (6)**

- Latte de Rooibos Brasil: blend Rooibos Brasil, leite, mel ou xarope de rapadura
- Quentão sem Álcool: blend Quentão sem Álcool, suco de uva integral, açúcar mascavo
- Xarope de Blend: blend à escolha, açúcar
- Cold Brew Frutado com Gás: Morango & Rosa ou Rubi Tropical, xarope de blend
- Bolo de Caneca com Chá: farinha de trigo, açúcar, blend moído no pilão, ovo, leite, óleo, fermento
- Biscoitos de Natal com Chá: farinha de trigo, manteiga gelada, açúcar mascavo, ovo, blend Natal Especiado moído fino, sal

**Fórmulas de blend (38)**

- Café da Manhã Dourado: chá preto Assam, casca de laranja seca, flor de calêndula
- Earl Grey da Casa: chá preto Ceylon, casca de laranja seca, pétalas de centáurea ou rosa, óleo essencial de bergamota alimentício
- Chai da Estação: chá preto CTC ou Assam, canela em lascas, gengibre seco em cubos, cardamomo amassado, cravo e pimenta-preta
- Verde Jardim: sencha ou verde chinês, hortelã seca, capim-cidreira
- Jasmim & Pêssego: chá verde de jasmim, pêssego desidratado picado, calêndula
- Genmaicha de Coco: genmaicha, coco em lascas tostado
- Oolong & Figo: oolong tostado, figo seco picado
- Branco Floral: Bai Mu Dan, botões de rosa, lavanda
- Mate Cítrico: erva-mate ou mate tostado, casca de limão seca, hortelã
- Hojicha Caramelo: hojicha, cacau em nibs, baunilha em pedaços
- Coco & Baunilha: rooibos, coco em lascas tostado, baunilha em pedaços, canela
- Rooibos Brasil: rooibos, nibs de cacau, castanha-do-pará tostada picada, canela
- Rubi Tropical: hibisco, manga desidratada, maçã desidratada, rosehip
- Digestivo de Domingo: erva-doce, hortelã, capim-cidreira, gengibre seco
- Inverno Vermelho: rooibos, hibisco, maçã e casca de laranja, canela, cravo e anis
- Limão & Lavanda: capim-cidreira, melissa, casca de limão-siciliano, lavanda
- Menta Dupla: hortelã-pimenta, hortelã-comum, alcaçuz em raiz
- Jardim de Rosas: botões de rosa, frutas vermelhas desidratadas, hibisco, baunilha
- Foco Verde: chá verde, casca de limão-siciliano, alecrim seco
- Pu-erh & Cacau: pu-erh shou, nibs de cacau, casca de laranja
- Natal Especiado: chá preto Ceylon, casca de laranja, canela em lascas, amêndoa laminada tostada, cravo e anis
- Primavera Floral: chá verde chinês, botões de rosa, calêndula
- Manga & Capim: Bai Mu Dan, manga desidratada, capim-cidreira
- Outono Tostado: hojicha, maçã desidratada, canela
- Pinhão & Mate: chá-mate tostado, pinhão cozido, seco e tostado em lascas, casca de tangerina
- Quentão sem Álcool: gengibre seco em cubos, casca de laranja, maçã desidratada, canela em lascas, cravo
- Cacau & Pimenta-rosa: rooibos, nibs de cacau, canela, pimenta-rosa
- Maçã Verde & Hortelã: maçã verde desidratada, hortelã, casca de limão
- Hortelã & Chocolate: rooibos, hortelã-pimenta, nibs de cacau
- Verde Cítrico: sencha, casca de limão-siciliano, casca de laranja, gengibre seco
- Oolong Piña Colada: oolong leve, abacaxi desidratado, coco em lascas
- Earl Grey Provence: Earl Grey, botões de rosa, lavanda
- Breakfast da Casa: Assam, Ceylon, Keemun
- Morango & Rosa: hibisco, morango desidratado, maçã, pétalas de rosa
- Pera & Baunilha: Bai Mu Dan, pera desidratada, baunilha em pedaços
- Genmaicha Matcha-iri: genmaicha, matcha
- Pu-erh "Café": pu-erh shou, cevada tostada, nibs de cacau
- Cevada & Arroz Tostados: cevada tostada, arroz tostado, casca de laranja

## 09. Chá & Mesa

*Harmonização, chá da tarde e receitas com chá* · slug `cha-e-mesa`

**Seções**

- Harmonizar
- Chá da tarde
- Cozinhar com chá
- Mais receitas e menus
- Brunch com chá
- Jantar harmonizado em quatro tempos
- Chá no lugar do vinho
- Ficha de harmonização

**Receitas completas (20)**

- Ovos Marmorizados no Chá: ovos, chá preto, shoyu, anis-estrelado, pau de canela
- Frango Defumado no Chá: sobrecoxas sem osso, chá lapsang ou preto, arroz cru, açúcar mascavo, casca de laranja, sal, alho e shoyu
- Sal de Chá Verde: sencha, flor de sal ou sal grosso, raspas de limão secas
- Ochazuke: arroz japonês cozido, sencha ou genmaicha quente, salmão grelhado em lascas, nori, gergelim, cebolinha, shoyu
- Ameixas Pochê no Chá: ameixas secas, chá preto forte, açúcar, pau de canela, casca de laranja
- Bolo de Earl Grey: leite, Earl Grey, manteiga, açúcar, ovos, farinha com fermento, açúcar de confeiteiro + chá forte
- Panna Cotta de Matcha: creme de leite fresco, leite, açúcar, matcha culinário, gelatina em pó sem sabor
- Arroz-doce de Hojicha: arroz branco, leite, hojicha em folhas, leite condensado, sal
- Vinagrete de Hibisco: hibisco, mel, mostarda Dijon, azeite, sal e pimenta
- Cookies de Rooibos e Laranja: manteiga, açúcar mascavo, ovo, farinha de trigo, rooibos moído fino, raspas de laranja, bicarbonato
- Scones Clássicos: farinha de trigo, fermento químico, açúcar, manteiga gelada em cubos, leite gelado, ovo, sal
- Sanduíches de Chá da Tarde: pão de forma fino, pepino em lâminas finas, cream cheese com hortelã picada, ovos cozidos picados, maionese com cebolinha, manteiga, sal e pimenta
- Arroz de Jasmim Perfumado: arroz agulhinha ou jasmim, chá verde de jasmim, óleo, sal
- Salmão Curado com Lapsang: filé de salmão com pele, congelado antes, sal grosso, açúcar mascavo, lapsang souchong moído, raspas de limão-siciliano
- Marinada de Chá Preto: chá preto forte, frio, shoyu, mel, dentes de alho amassados, gengibre ralado, pimenta-preta
- Chutney de Manga com Chá Preto: mangas firmes em cubos, chá preto Ceylon forte, açúcar mascavo, vinagre de maçã, cebola picada, gengibre ralado e uma pitada de pimenta-calabresa
- Brigadeiro de Earl Grey: creme de leite, Earl Grey, leite condensado, cacau em pó, manteiga
- Pudim de Chai: leite condensado, leite, ovos, chá preto, pau de canela, 4 cardamomos, 3 cravos, açúcar para a calda
- Trufas Defumadas: chocolate 60–70% picado, creme de leite fresco, lapsang souchong, manteiga, cacau em pó
- Geleia de Hibisco: hibisco seco, maçãs raladas com casca, açúcar, limão

## 10. Erva-Mate

*Chimarrão, tererê e chá-mate do jeito certo* · slug `erva-mate`

**Seções**

- A erva
- O chimarrão
- Tererê e chá-mate
- Dezoito receitas
- Mais seis receitas
- Cuias e bombas
- Perguntas frequentes
- Do amargo ao hábito

**Receitas completas (6)**

- Mate Cocido com Leite: erva-mate, açúcar, leite
- Tererê de Maracujá e Hortelã: erva para tererê, maracujás, hortelã, açúcar
- Bolo de Chá-mate com Laranja: chá-mate tostado forte, ovos, açúcar, óleo, farinha de trigo, fermento, raspas e suco de laranja
- Chipa: polvilho doce, queijo meia-cura ralado, manteiga, ovos, leite, sal e 1 c. chá de erva-doce
- Xarope de Mate: chá-mate tostado, açúcar mascavo ou rapadura
- Cookies de Mate e Chocolate Branco: manteiga, açúcar mascavo, ovo, farinha de trigo, erva-mate moída fina e peneirada, bicarbonato, chocolate branco picado

**Receitas curtas (fichas) (12)**

- Chimarrão de Hortelã: erva-mate para chimarrão, hortelã fresca
- Mate com Casca de Laranja: erva-mate, casca de laranja seca
- Tererê de Abacaxi: erva para tererê, suco de abacaxi com hortelã bem gelado
- Tererê de Capim-cidreira: erva para tererê
- Chimarrão com Erva-doce: erva-mate para chimarrão, sementes de erva-doce
- Mate Gelado com Limão: chá-mate tostado, limões, xarope simples
- Mate com Gengibre e Mel: chá-mate tostado, gengibre, mel
- Cold Brew de Erva-mate: erva-mate
- Mate Tônica: cold brew de erva-mate, laranja
- Mate Especiado de Inverno: chá-mate tostado, pau de canela, cravos
- Mate Shake: chá-mate tostado forte e frio, banana congelada, cacau em pó, leite
- Sorvete de Mate e Doce de Leite: chá-mate tostado bem forte, frio, doce de leite, creme de leite fresco gelado

## Índice de ingredientes principais

Quantas receitas usam cada ingrediente e em quais guias. Útil para achar o que está saturado (muitas receitas) e o que ainda foi pouco explorado.

| Ingrediente | Receitas | Guias |
|---|---|---|
| limao | 45 | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10 |
| leite | 44 | 01, 02, 03, 04, 05, 06, 08, 09, 10 |
| canela | 37 | 01, 03, 05, 06, 07, 08, 09, 10 |
| cha preto | 30 | 01, 02, 04, 05, 08, 09 |
| verde | 26 | 04, 05, 06, 07, 08, 09 |
| maca | 25 | 01, 03, 04, 05, 07, 08, 09 |
| hortela | 25 | 01, 03, 04, 05, 07, 08, 09, 10 |
| rooibos | 24 | 01, 03, 04, 05, 08, 09 |
| laranja | 24 | 03, 04, 05, 06, 07, 08, 09, 10 |
| matcha | 23 | 04, 05, 06, 08, 09 |
| gengibre | 21 | 01, 03, 04, 05, 06, 08, 09, 10 |
| cidreira | 18 | 01, 03, 07, 08, 10 |
| mate | 18 | 04, 08, 10 |
| camomila | 17 | 01, 03 |
| capim | 16 | 01, 07, 08, 10 |
| hibisco | 15 | 01, 05, 07, 08, 09 |
| anis | 13 | 01, 05, 08, 09 |
| cacau | 12 | 03, 04, 08, 09, 10 |
| branco | 11 | 02, 04, 05, 06, 07, 08, 09, 10 |
| rosa | 10 | 01, 03, 08 |
| pimenta | 10 | 03, 04, 08, 09 |
| erva-doce | 9 | 01, 03, 07, 08, 10 |
| baunilha | 9 | 02, 03, 05, 06, 08 |
| lavanda | 9 | 03, 05, 07, 08 |
| sencha | 8 | 02, 04, 05, 08, 09 |
| earl grey | 8 | 02, 05, 08, 09 |
| melissa | 8 | 03, 05, 08 |
| coco | 8 | 04, 05, 06, 08 |
| assam | 7 | 02, 04, 05, 08 |
| ceylon | 7 | 02, 04, 05, 08, 09 |
| cravo | 7 | 03, 08, 09, 10 |
| bai mu dan | 6 | 02, 04, 05, 08 |
| oolong | 6 | 02, 04, 05, 08 |
| hojicha | 6 | 04, 05, 08, 09 |
| pu-erh | 5 | 02, 05, 08 |
| cardamomo | 5 | 04, 06, 08, 09 |
| alecrim | 5 | 04, 07, 08 |
| genmaicha | 5 | 04, 05, 08, 09 |
| tonica | 5 | 05, 06, 10 |
| morango | 5 | 05, 06, 07, 08 |
| chocolate | 5 | 06, 08, 09, 10 |
| arroz | 5 | 08, 09 |
| chai | 4 | 01, 08, 09 |
| tererê | 4 | 04, 10 |
| pera | 4 | 05, 06, 07, 08 |
| calendula | 4 | 07, 08 |
| tomilho | 4 | 07 |
| lapsang | 4 | 09 |
| aveia | 3 | 03, 06 |
| banana | 3 | 03, 06, 10 |
| pessego | 3 | 05, 08 |
| abacaxi | 3 | 05, 08, 10 |
| maracuja | 3 | 05, 07, 10 |
| jasmim | 3 | 05, 08, 09 |
| manjericao | 3 | 07 |
| manga | 3 | 08, 09 |
| tamara | 2 | 02, 03 |
| darjeeling | 2 | 02, 05 |
| tangerina | 2 | 02, 08 |
| tilia | 2 | 03 |
| amendoa | 2 | 03, 08 |
| iogurte | 2 | 04, 06 |
| gyokuro | 2 | 04 |
| uva | 2 | 05, 08 |
| pepino | 2 | 05, 09 |
| cevada | 2 | 08 |
| passiflora | 1 | 03 |
| curcuma | 1 | 03 |
| guarana | 1 | 04 |
| kukicha | 1 | 04 |
| cha azul | 1 | 05 |
| melancia | 1 | 05 |
| tamarindo | 1 | 05 |
| kiwi | 1 | 05 |
| lichia | 1 | 05 |
| louro | 1 | 07 |
| castanha | 1 | 08 |

## Temas ainda não explorados (ideias para próximos guias)

- Chás do mundo: os rituais do Japão, Marrocos, Rússia, Índia, Inglaterra e Argentina, com receitas típicas de cada país.
- Fermentados de chá a fundo: jun, kombucha avançada, kefir de água com chá e vinagres de kombucha.
- Coquetelaria com chá (com e sem álcool): infusões em destilados, xaropes e técnicas de bar.
- Chás para crianças e família: tudo sem cafeína, com receitas divertidas e regras de segurança por idade.
- Panificação e confeitaria com chá: pães, bolos de festa, macarons e cremes.
- Pu-erh e chás envelhecidos: como guardar, envelhecer e degustar.
- Calendário do chá: uma receita por semana, acompanhando as estações e as festas brasileiras.
