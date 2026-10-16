from common import *
import g05_gelados as base

RECIPES = [
 R(26, ('Chá Gelado de Pêssego de Verdade', 'Real Peach Iced Tea'), ('O sabor de lata, feito com fruta e chá de verdade.', 'The canned flavour, made with real fruit and tea.'), True, '25 min', ('1 jarra · 1 L', '1 jug · 1 L'), True, 'easy',
   [('2', '2', 'pêssegos maduros (ou 4 metades em calda, escorridas)', 'ripe peaches (or 4 canned halves, drained)'), ('60 g', '60 g', 'açúcar', 'sugar'), ('100 ml', '100 ml', 'água', 'water'), ('4 sachês', '4 bags', 'chá preto', 'black tea'), ('500 ml', '500 ml', 'água fervente', 'boiling water'), ('400 g', '400 g', 'gelo', 'ice'), ('½', '½', 'limão (suco)', 'lemon (juice)')],
   [('Cozinhe o pêssego picado com o açúcar e 100 ml de água por 10 min. Amasse e coe: é o xarope.', 'Cook the chopped peach with the sugar and 100 ml water for 10 min. Mash and strain: that is the syrup.'),
    ('Infunda o chá na água fervente por 4 min.', 'Steep the tea in the boiling water for 4 min.'), ('Junte o xarope e o limão ao chá quente.', 'Add the syrup and lemon to the hot tea.'), ('Verta sobre o gelo na jarra e mexa.', 'Pour over the ice in the jug and stir.')],
   ('Lâminas de pêssego e hortelã.', 'Peach slices and mint.'), ('O xarope dura 1 semana na geladeira: faça em dobro.', 'The syrup keeps 1 week in the fridge: make double.')),
 R(27, ('Limonada Suíça de Chá Verde', 'Green Tea Brazilian Lemonade'), ('A limonada suíça brasileira, com cold brew verde.', 'Brazil\'s creamy lemonade, with green cold brew.'), True, '5 min', ('4 copos', '4 glasses'), True, 'easy',
   [('2', '2', 'limões-taiti com casca, lavados', 'washed limes, peel on'), ('600 ml', '600 ml', 'cold brew de chá verde', 'green tea cold brew'), ('4 c. sopa', '4 tbsp', 'leite condensado ou xarope', 'condensed milk or syrup'), ('1 xícara', '1 cup', 'gelo', 'ice')],
   [('Corte os limões em quartos e retire o miolo branco do centro.', 'Quarter the limes and remove the white core.'), ('Bata tudo no liquidificador por 10 s, no máximo.', 'Blend everything for 10 s at most.'), ('Coe na hora e sirva.', 'Strain immediately and serve.')],
   None, ('Bater mais que 10 s solta o amargor da casca. Sirva logo: amarga em 20 minutos.', 'Blending longer than 10 s releases the bitterness of the peel. Serve at once: it turns bitter within 20 minutes.'), milk=True),
 R(28, ('Ponche de Hibisco e Gengibre', 'Hibiscus & Ginger Punch'), ('Para festas, sem álcool e sem cafeína.', 'For parties, alcohol- and caffeine-free.'), True, '20 min', ('1 poncheira · 2 L', '1 punch bowl · 2 L'), False, 'easy',
   [('6 c. sopa', '6 tbsp', 'hibisco', 'hibiscus'), ('40 g', '40 g', 'gengibre em lâminas', 'sliced ginger'), ('1 L', '1 L', 'água', 'water'), ('120 ml', '120 ml', 'xarope simples', 'simple syrup'), ('2', '2', 'laranjas em rodelas', 'oranges, sliced'), ('1 L', '1 L', 'água com gás gelada', 'chilled sparkling water')],
   [('Ferva o gengibre na água por 5 min. Desligue, junte o hibisco e infunda 10 min.', 'Simmer the ginger in the water for 5 min. Turn off, add the hibiscus and steep 10 min.'), ('Coe, adoce e gele.', 'Strain, sweeten and chill.'), ('Na hora de servir: gelo, laranja e água com gás.', 'At serving time: ice, orange and sparkling water.')],
   ('Gelo de hibisco (capítulo II).', 'Hibiscus ice (chapter II).'), ('Junte o gás só na hora para não perder as bolhas.', 'Add the fizz only at the last moment so the bubbles survive.')),
 R(29, ('Earl Grey Gelado com Lavanda', 'Iced Earl Grey with Lavender'), ('Bergamota e flor, servido com mel.', 'Bergamot and flowers, served with honey.'), True, ('5 min + 8 h', '5 min + 8 h'), ('1 jarra · 1 L', '1 jug · 1 L'), True, 'easy',
   [('10 g', '10 g', 'Earl Grey', 'Earl Grey'), ('½ c. chá', '½ tsp', 'lavanda culinária', 'culinary lavender'), ('1 L', '1 L', 'água fria', 'cold water'), ('3 c. sopa', '3 tbsp', 'xarope de mel', 'honey syrup')],
   [('Cold brew do chá com a lavanda por 8 h.', 'Cold brew the tea with the lavender for 8 h.'), ('Coe e adoce com o xarope de mel.', 'Strain and sweeten with the honey syrup.')],
   ('Rodela de limão-siciliano.', 'A lemon wheel.'), ('Lavanda demais lembra sabonete: comece com meia colher de chá.', 'Too much lavender tastes of soap: start with half a teaspoon.')),
 R(30, ('Granita de Chá Preto e Limão', 'Black Tea & Lemon Granita'), ('Sobremesa raspada, de garfo.', 'A fork-scraped dessert.'), True, ('10 min + 4 h', '10 min + 4 h'), ('6 taças', '6 glasses'), True, 'easy',
   [('500 ml', '500 ml', 'chá preto forte', 'strong black tea'), ('100 g', '100 g', 'açúcar', 'sugar'), ('1', '1', 'limão-siciliano (suco e raspas)', 'lemon (juice and zest)')],
   [('Dissolva o açúcar no chá quente, junte limão e raspas. Esfrie.', 'Dissolve the sugar in the hot tea, add lemon juice and zest. Cool.'), ('Despeje numa assadeira rasa e leve ao freezer.', 'Pour into a shallow tray and freeze.'), ('A cada 30 min, raspe com um garfo, por 3 a 4 h, até virar cristais soltos.', 'Every 30 min, scrape with a fork for 3 to 4 h, until it becomes loose crystals.')],
   ('Uma colher de creme batido.', 'A spoon of whipped cream.'), ('Funciona com qualquer cold brew deste guia; hibisco e matcha são ótimos.', 'Works with any cold brew in this guide; hibiscus and matcha are great.')),
 R(31, ('Picolé de Chá Verde e Coco', 'Green Tea & Coconut Ice Pops'), ('Cremoso, verde e tropical.', 'Creamy, green and tropical.'), True, ('10 min + 6 h', '10 min + 6 h'), ('6 unidades', '6 pops'), True, 'easy',
   [('200 ml', '200 ml', 'cold brew verde concentrado', 'concentrated green cold brew'), ('200 ml', '200 ml', 'leite de coco', 'coconut milk'), ('60 g', '60 g', 'açúcar', 'sugar'), ('2 c. sopa', '2 tbsp', 'coco ralado', 'grated coconut')],
   [('Dissolva o açúcar no leite de coco morno.', 'Dissolve the sugar in the warm coconut milk.'), ('Misture o chá e o coco ralado.', 'Stir in the tea and grated coconut.'), ('Distribua nas forminhas e congele 6 h.', 'Pour into moulds and freeze 6 h.')],
   None, ('A gordura do leite de coco deixa o picolé macio e cremoso, sem cristais.', 'The fat in the coconut milk keeps the pop soft and creamy, without crystals.'), milk=True),
 R(32, ('Smoothie Verde Tropical', 'Tropical Green Smoothie'), ('Chá verde, abacaxi e hortelã.', 'Green tea, pineapple and mint.'), True, '5 min', ('2 copos', '2 glasses'), True, 'easy',
   [('200 ml', '200 ml', 'cold brew de chá verde', 'green tea cold brew'), ('2 xícaras', '2 cups', 'abacaxi congelado em cubos', 'frozen pineapple chunks'), ('8 folhas', '8 leaves', 'hortelã', 'mint'), ('1 c. sopa', '1 tbsp', 'mel', 'honey')],
   [('Bata tudo até ficar liso.', 'Blend until smooth.'), ('Prove e ajuste o mel.', 'Taste and adjust the honey.')],
   None, ('Fruta congelada no lugar do gelo: o smoothie fica cremoso e não aguado.', 'Frozen fruit instead of ice: the smoothie turns creamy, not watery.')),
 R(33, ('Affogato de Chá Preto', 'Black Tea Affogato'), ('Sorvete de creme afogado num chá preto bem forte.', 'Vanilla ice cream drowned in very strong black tea.'), False, '5 min', ('2 taças', '2 glasses'), True, 'easy',
   [('2 bolas', '2 scoops', 'sorvete de creme', 'vanilla ice cream'), ('6 g', '6 g', 'chá preto Assam ou Keemun', 'Assam or Keemun black tea'), ('80 ml', '80 ml', 'água fervente', 'boiling water'), ('1 c. chá', '1 tsp', 'açúcar mascavo', 'brown sugar')],
   [('Infunda o chá em pouca água por 5 min: é um "espresso" de chá.', 'Steep the tea in little water for 5 min: a tea "espresso".'), ('Coe e dissolva o açúcar.', 'Strain and dissolve the sugar.'), ('Verta quente sobre o sorvete em taças geladas.', 'Pour hot over the ice cream in chilled glasses.')],
   ('Biscoito amanteigado esfarelado.', 'Crumbled shortbread.'), ('Use o dobro de folha e metade da água: o sabor precisa aguentar o sorvete.', 'Use double the leaf and half the water: the flavour has to stand up to the ice cream.'), milk=True),
]

MOCK = [
 (('Chá Branco Spritz', 'White Tea Spritz'), ('Pera, bolhas e chá branco.', 'Pear, bubbles and white tea.'), ('1 taça', '1 glass'), [(('100 ml', '100 ml'), ('cold brew de chá branco', 'white tea cold brew')), (('80 ml', '80 ml'), ('água com gás', 'sparkling water')), (('3', '3'), ('lâminas finas de pera', 'thin pear slices'))], ('Taça com gelo e pera, chá, gás por cima.', 'Glass with ice and pear, tea, fizz on top.')),
 (('Mojito de Chá Verde', 'Green Tea Mojito'), ('Hortelã, limão e verde.', 'Mint, lime and green tea.'), ('1 copo', '1 glass'), [(('8', '8'), ('folhas de hortelã', 'mint leaves')), (('½', '½'), ('limão em gomos', 'lime in wedges')), (('1 c. sopa', '1 tbsp'), ('xarope', 'syrup')), (('150 ml', '150 ml'), ('cold brew verde', 'green cold brew'))], ('Amasse hortelã, limão e xarope; gelo e chá.', 'Muddle mint, lime and syrup; ice and tea.')),
 (('Oolong & Maracujá', 'Oolong & Passion Fruit'), ('Tropical e floral.', 'Tropical and floral.'), ('1 copo', '1 glass'), [(('150 ml', '150 ml'), ('cold brew de oolong', 'oolong cold brew')), (('1', '1'), ('maracujá (polpa)', 'passion fruit (pulp)')), (('1 c. sopa', '1 tbsp'), ('xarope', 'syrup'))], ('Agite tudo com gelo num pote fechado.', 'Shake everything with ice in a closed jar.')),
 (('Chá Preto Sour', 'Black Tea Sour'), ('Espuma, limão e chá.', 'Foam, lemon and tea.'), ('1 copo', '1 glass'), [(('120 ml', '120 ml'), ('chá preto forte frio', 'strong cold black tea')), (('30 ml', '30 ml'), ('suco de limão', 'lemon juice')), (('20 ml', '20 ml'), ('xarope', 'syrup')), (('1', '1'), ('clara pasteurizada ou aquafaba', 'pasteurised egg white or aquafaba'))], ('Agite sem gelo, depois com gelo. Coe.', 'Shake without ice, then with ice. Strain.')),
 (('Rooibos Cola', 'Rooibos Cola'), ('Sem cafeína, com especiarias.', 'Caffeine-free, with spices.'), ('1 copo', '1 glass'), [(('100 ml', '100 ml'), ('rooibos com canela gelado', 'iced rooibos with cinnamon')), (('20 ml', '20 ml'), ('xarope de rapadura', 'panela syrup')), (('100 ml', '100 ml'), ('água com gás', 'sparkling water'))], ('Gelo, rooibos, xarope e gás.', 'Ice, rooibos, syrup and fizz.')),
 (('Jasmim & Lichia', 'Jasmine & Lychee'), ('Delicado, de festa.', 'Delicate, party-worthy.'), ('1 taça', '1 glass'), [(('120 ml', '120 ml'), ('cold brew de jasmim', 'jasmine cold brew')), (('3', '3'), ('lichias amassadas', 'crushed lychees')), (('60 ml', '60 ml'), ('água tônica', 'tonic water'))], ('Lichias no fundo, gelo, chá e tônica.', 'Lychees at the bottom, ice, tea and tonic.')),
]


def extra():
    chk = ('Kombucha', 'Kombucha')
    chr_ = ('Receitas de assinatura', 'Signature recipes')
    chf = ('Para receber', 'For entertaining')
    pages = [opener('IV', chk, ('Chá fermentado em casa', 'Fermented tea at home'),
                    [('Kombucha é chá adoçado fermentado por uma colônia de bactérias e leveduras (o SCOBY). O resultado é uma bebida ácida, levemente gaseificada e muito versátil. Com higiene e paciência, é simples de fazer.', 'Kombucha is sweetened tea fermented by a colony of bacteria and yeast (the SCOBY). The result is a tart, lightly sparkling and very versatile drink. With hygiene and patience it is simple to make.')],
                    [('O que você precisa', 'What you need'), ('Primeira fermentação', 'First fermentation'), ('Segunda fermentação e sabores', 'Second fermentation and flavours')]),
             text(('O que você precisa', 'What you need'), eyebrow=chk, chapter=chk,
                  body=join(T([('Item', 'Item'), ('Para 2 L', 'For 2 L'), ('Observação', 'Note')],
                              [[('Chá preto ou verde', 'Black or green tea'), ('12–16 g (6 a 8 sachês)', '12–16 g (6 to 8 bags)'), ('Sem aromatizantes nem óleos: atrapalham o SCOBY', 'No flavourings or oils: they harm the SCOBY')],
                               [('Açúcar cristal', 'Granulated sugar'), ('140–160 g', '140–160 g'), ('É alimento das leveduras, não do bebedor: a maior parte é consumida', 'Food for the yeast, not the drinker: most is consumed')],
                               [('Água filtrada', 'Filtered water'), ('2 L', '2 L'), ('Sem cloro', 'Chlorine-free')],
                               [('Líquido de partida', 'Starter liquid'), ('200–300 ml', '200–300 ml'), ('Kombucha pronta, sem sabor; acidifica e protege', 'Plain finished kombucha; it acidifies and protects')],
                               [('SCOBY', 'SCOBY'), ('1 disco', '1 disc'), ('Peça a quem já faz ou compre de fornecedor confiável', 'Get one from a brewer or a trusted supplier')],
                               [('Pote de vidro', 'Glass jar'), ('3 L, boca larga', '3 L, wide mouth'), ('Nada de metal, plástico arranhado ou cerâmica com esmalte de chumbo', 'No metal, scratched plastic or lead-glazed ceramic')],
                               [('Pano e elástico', 'Cloth and band'), ('1', '1'), ('Tecido de trama fechada: deixa o ar entrar e as moscas fora', 'Tight-weave fabric: lets air in and keeps flies out')],
                               [('Garrafas com tampa', 'Swing-top bottles'), ('4 de 500 ml', '4 of 500 ml'), ('Vidro grosso, próprias para gás', 'Thick glass, made for pressure')]], cls='data compact'),
                            WARN('Não recomendado para gestantes, lactantes, crianças pequenas e pessoas com imunidade baixa. A kombucha caseira pode ter traços de álcool (em geral abaixo de 1%) e acidez alta: comece com meio copo por dia.', 'Not recommended for pregnant or breastfeeding people, young children or the immunocompromised. Homemade kombucha can contain traces of alcohol (usually below 1%) and is very acidic: start with half a glass a day.', ('Quem deve evitar', 'Who should avoid it')))),
             text(('Primeira fermentação', 'First fermentation'), eyebrow=chk, chapter=chk, lead=('7 a 14 dias, de 22 a 26 °C, longe do sol.', '7 to 14 days, at 22 to 26 °C, out of the sun.'),
                  body=join(B(('**Lave tudo** com água quente e enxágue com vinagre. Mãos limpas, sem sabão residual.', '**Wash everything** in hot water and rinse with vinegar. Clean hands, no soap residue.'),
                              ('**Faça o chá:** ferva 500 ml de água, infunda o chá 10 min, coe e dissolva o açúcar.', '**Make the tea:** boil 500 ml of water, steep the tea 10 min, strain and dissolve the sugar.'),
                              ('**Complete com 1,5 L de água fria** e espere chegar à temperatura ambiente. Chá quente mata o SCOBY.', '**Top up with 1.5 L of cold water** and wait until it is at room temperature. Hot tea kills the SCOBY.'),
                              ('**Junte o líquido de partida e o SCOBY.** Cubra com o pano e prenda com elástico.', '**Add the starter liquid and the SCOBY.** Cover with the cloth and secure with the band.'),
                              ('**Espere sem mexer.** Do 7º dia em diante, prove com um canudo: pronto quando estiver levemente ácido, ainda um pouco doce.', '**Wait without stirring.** From day 7, taste with a straw: it is ready when lightly tart and still a little sweet.'),
                              ('**Separe 300 ml e o SCOBY** para a próxima leva. O resto vai para as garrafas.', '**Set aside 300 ml and the SCOBY** for the next batch. The rest goes into bottles.'), ordered=True, cls='steps'),
                            H3('Normal ou problema?', 'Normal or a problem?'),
                            T([('Você vê', 'You see'), ('O que é', 'What it is')],
                              [[('Película nova e clara na superfície', 'A new pale film on the surface'), ('Normal: é o novo SCOBY se formando', 'Normal: the new SCOBY forming')], [('Fios marrons pendurados', 'Brown strands hanging'), ('Normal: são leveduras', 'Normal: yeast')],
                               [('Bolhas presas sob o SCOBY', 'Bubbles trapped under the SCOBY'), ('Normal: fermentação ativa', 'Normal: active fermentation')],
                               [('Bolinhas felpudas, secas, verdes, pretas ou azuis em cima', 'Fuzzy, dry, green, black or blue spots on top'), ('Mofo: descarte tudo, inclusive o SCOBY', 'Mould: throw everything out, SCOBY included')],
                               [('Cheiro de vinagre muito forte', 'Very strong vinegar smell'), ('Fermentou demais: use como vinagre ou líquido de partida', 'Over-fermented: use as vinegar or starter')]], cls='data compact'))),
             text(('Segunda fermentação e sabores', 'Second fermentation and flavours'), eyebrow=chk, chapter=chk, lead=('Nas garrafas fechadas, com fruta: é aqui que nascem o gás e o sabor.', 'In sealed bottles, with fruit: this is where fizz and flavour are born.'),
                  body=join(B(('Coloque a fruta ou o suco na garrafa (10 a 15% do volume) e complete com a kombucha, deixando 3 cm livres.', 'Put the fruit or juice in the bottle (10 to 15% of the volume) and fill with kombucha, leaving 3 cm free.'),
                              ('Feche e deixe 1 a 3 dias em temperatura ambiente.', 'Close and leave 1 to 3 days at room temperature.'),
                              ('Abra uma vez por dia com cuidado, sobre a pia, para aliviar a pressão.', 'Open once a day carefully, over the sink, to release pressure.'),
                              ('Quando estiver com gás, leve à geladeira. Consuma em até 2 semanas.', 'Once fizzy, move to the fridge. Drink within 2 weeks.'), ordered=True, cls='steps'),
                            T([('Sabor', 'Flavour'), ('Por garrafa de 500 ml', 'Per 500 ml bottle')],
                              [[('Gengibre e limão', 'Ginger and lime'), ('1 c. sopa de gengibre ralado + 1 c. sopa de suco de limão', '1 tbsp grated ginger + 1 tbsp lime juice')],
                               [('Morango e manjericão', 'Strawberry and basil'), ('4 morangos amassados + 3 folhas de manjericão', '4 crushed strawberries + 3 basil leaves')],
                               [('Abacaxi e hortelã', 'Pineapple and mint'), ('60 ml de suco de abacaxi + 4 folhas de hortelã', '60 ml pineapple juice + 4 mint leaves')],
                               [('Hibisco e laranja', 'Hibiscus and orange'), ('1 c. chá de hibisco + 1 tira de casca de laranja', '1 tsp hibiscus + 1 strip orange peel')],
                               [('Maracujá', 'Passion fruit'), ('Polpa de 1 maracujá', 'Pulp of 1 passion fruit')],
                               [('Uva', 'Grape'), ('60 ml de suco de uva integral', '60 ml pure grape juice')]], cls='data compact'),
                            WARN('Garrafas comuns ou finas podem estourar com a pressão. Use vidro próprio para gás, não encha até a boca e não esqueça as garrafas fora da geladeira.', 'Ordinary or thin bottles can burst under pressure. Use glass made for carbonation, do not fill to the top and never forget bottles outside the fridge.', ('Pressão', 'Pressure'))))]
    rp = recipe_pages(RECIPES)
    rp[0].update(toc=L(*chr_), toc_key='·', chapter=L(*chr_))
    pages += rp
    pages += [
        text(('Bar de chá gelado', 'Iced tea bar'), eyebrow=chf, chapter=chf, toc=('Bar de chá gelado', 'Iced tea bar'),
             lead=('Para aniversários, churrascos e festas: três jarras, uma mesa de complementos e cada um monta o seu.', 'For birthdays, barbecues and parties: three jugs, a table of add-ins and everyone builds their own.'),
             body=join(T([('Convidados', 'Guests'), ('Chá pronto', 'Ready tea'), ('Folha seca', 'Dry leaf'), ('Gelo', 'Ice')],
                         [['10', '4 L', '40–50 g', '3 kg'], ['20', '8 L', '80–100 g', '6 kg'], ['40', '15 L', '150–180 g', '12 kg']], cls='data compact'),
                       grid(3, C(('Três jarras', 'Three jugs'), None, [('Uma com cafeína (preto ou verde), uma sem (hibisco ou rooibos) e uma "especial" (pêssego ou oolong).', 'One caffeinated (black or green), one caffeine-free (hibiscus or rooibos) and one "special" (peach or oolong).')]),
                               C(('Complementos', 'Add-ins'), None, [('Frutas em rodelas, hortelã, manjericão, xaropes em garrafinhas, gelos aromáticos e água com gás.', 'Sliced fruit, mint, basil, syrups in small bottles, aromatic ice and sparkling water.')]),
                               C(('Na véspera', 'The day before'), None, [('Prepare os cold brews e os xaropes, congele os gelos e etiquete tudo.', 'Make the cold brews and syrups, freeze the ice and label everything.')])),
                       TIP('Etiquetas pequenas com "com cafeína" e "sem cafeína" evitam perguntas e protegem crianças e quem não pode tomar cafeína.', 'Small "caffeinated" and "caffeine-free" labels save questions and protect children and anyone avoiding caffeine.'))),
        text(('Seis mocktails de chá', 'Six tea mocktails'), eyebrow=chf, chapter=chf, toc=('Seis mocktails de chá', 'Six tea mocktails'),
             body=grid(2, *[M(i + 1, MOCK[i][0], MOCK[i][1], MOCK[i][3], MOCK[i][4], meta=MOCK[i][2]) for i in range(6)])),
        text(('Menos açúcar, mesmo prazer', 'Less sugar, same pleasure'), eyebrow=chf, chapter=chf, toc=('Menos açúcar, mesmo prazer', 'Less sugar, same pleasure'),
             lead=('Um refrigerante comum tem cerca de 35 g de açúcar por lata. Os chás deste guia ficam entre 0 e 12 g por copo.', 'A regular soda has about 35 g of sugar per can. The teas in this guide range from 0 to 12 g per glass.'),
             body=join(T([('Adoçante', 'Sweetener'), ('Como usar', 'How to use'), ('Combina com', 'Pairs with')],
                         [[('Fruta madura', 'Ripe fruit'), ('Amassada no cold brew ou em xarope', 'Crushed into the cold brew or as syrup'), ('pretos, brancos, hibisco', 'blacks, whites, hibiscus')],
                          [('Mel', 'Honey'), ('Em xarope (2:1 com água morna)', 'As syrup (2:1 with warm water)'), ('ervas, verdes, Earl Grey', 'herbs, greens, Earl Grey')],
                          [('Rapadura e mascavo', 'Panela and brown sugar'), ('Em xarope', 'As syrup'), ('mate, chai, rooibos', 'mate, chai, rooibos')],
                          [('Estévia e eritritol', 'Stevia and erythritol'), ('Dissolvidos no concentrado quente', 'Dissolved into the hot concentrate'), ('hibisco e frutados', 'hibiscus and fruity teas')],
                          [('Especiarias doces', 'Sweet spices'), ('Canela, baunilha, anis no preparo', 'Cinnamon, vanilla, anise in the brew'), ('quase todos', 'almost all')]], cls='data'),
                       H3('Desmame em quatro semanas', 'Weaning off in four weeks'),
                       T([('Semana', 'Week'), ('Açúcar por litro', 'Sugar per litre')], [[('1', '1'), '80 g'], [('2', '2'), '60 g'], [('3', '3'), '40 g'], [('4', '4'), ('20 g ou nenhum', '20 g or none')]], cls='data compact'),
                       P(('O paladar se adapta em poucas semanas. Reduzir aos poucos funciona melhor do que cortar tudo de uma vez, e o cold brew, naturalmente mais doce, ajuda muito nessa transição.', 'Your palate adapts within a few weeks. Cutting back gradually works better than stopping all at once, and cold brew, naturally sweeter, helps a lot in the transition.')))),
    ]
    return pages


GUIDE = extend(base.GUIDE, extra)
