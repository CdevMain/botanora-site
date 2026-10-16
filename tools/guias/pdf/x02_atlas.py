from common import *
import g02_atlas as base

RECIPES = [
 R(1, ('Bai Mu Dan na Gaiwan', 'Bai Mu Dan in a Gaiwan'), ('O branco de folha e botão, em infusões curtas.', 'The bud-and-leaf white, in short steeps.'), False, '15 min', ('5 xícaras pequenas', '5 small cups'), True, 'mid',
   [('4 g', '4 g', 'Bai Mu Dan', 'Bai Mu Dan'), ('100 ml', '100 ml', 'água a 85 °C, por rodada', 'water at 85 °C, per round')],
   [('Aqueça a gaiwan e as xícaras com água quente.', 'Warm the gaiwan and cups with hot water.'), ('Coloque as folhas, tampe e agite: sinta o aroma de feno e mel.', 'Add the leaves, cover and shake: smell the hay and honey.'),
    ('Infusões de 30 s, 30 s, 45 s, 1 min e 1 min 30 s.', 'Steeps of 30 s, 30 s, 45 s, 1 min and 1 min 30 s.'), ('Sirva cada rodada inteira, sem deixar água nas folhas.', 'Pour each round out completely, leaving no water on the leaves.')],
   ('Compare a cor: do palha ao dourado.', 'Compare the colour: from straw to gold.'), ('Brancos aguentam mais calor do que parece: abaixo de 80 °C ficam aguados.', 'Whites take more heat than you think: below 80 °C they turn watery.')),
 R(2, ('Shou Mei Cozido', 'Simmered Shou Mei'), ('Branco envelhecido fervido, como em Fujian.', 'Aged white simmered, as in Fujian.'), False, '12 min', ('2 xícaras', '2 cups'), True, 'easy',
   [('5 g', '5 g', 'Shou Mei ou branco envelhecido', 'Shou Mei or aged white'), ('500 ml', '500 ml', 'água', 'water'), ('2', '2', 'tâmaras secas (opcional)', 'dried dates (optional)')],
   [('Faça uma primeira infusão rápida em água quente e beba.', 'Make a quick first steep in hot water and drink it.'), ('Coloque as mesmas folhas numa leiteira com a água fria e as tâmaras.', 'Put the same leaves in a small pan with the cold water and dates.'),
    ('Ferva em fogo baixo por 5 a 8 min. Coe.', 'Simmer gently for 5 to 8 min. Strain.')],
   ('Uma tâmara na xícara.', 'A date in the cup.'), ('Só brancos envelhecidos rendem bem cozidos; folhas novas ficam amargas.', 'Only aged whites do well simmered; young leaves turn bitter.')),
 R(3, ('Long Jing no Copo', 'Long Jing in a Glass'), ('O verde de Hangzhou, folhas dançando.', 'Hangzhou\'s green, leaves dancing.'), False, '3 min', ('1 copo · 250 ml', '1 glass · 250 ml'), True, 'easy',
   [('3 g', '3 g', 'Long Jing (Poço do Dragão)', 'Long Jing (Dragon Well)'), ('250 ml', '250 ml', 'água a 80 °C', 'water at 80 °C')],
   [('Coloque um terço da água no copo e depois as folhas.', 'Pour a third of the water into the glass, then add the leaves.'), ('Espere 30 s, até as folhas se abrirem.', 'Wait 30 s for the leaves to open.'),
    ('Complete a água pela borda, em fio alto.', 'Top up along the rim in a high stream.'), ('Beba quando as folhas afundarem; complete quando faltar um terço.', 'Drink once the leaves sink; top up when a third is left.')],
   ('Folhas em pé, como agulhas.', 'Leaves standing like needles.'), ('Água primeiro protege a folha delicada do choque de calor.', 'Water first protects the delicate leaf from heat shock.')),
 R(4, ('Sencha no Kyusu', 'Sencha in a Kyusu'), ('O preparo japonês, com a última gota.', 'The Japanese way, down to the last drop.'), False, '4 min', ('2 xícaras · 160 ml', '2 cups · 160 ml'), True, 'mid',
   [('5 g', '5 g', 'sencha', 'sencha'), ('160 ml', '160 ml', 'água a 70 °C', 'water at 70 °C')],
   [('Ferva a água e passe pelas xícaras: elas aquecem e a água esfria uns 10 °C.', 'Boil the water and pour it into the cups: they warm up and the water cools by about 10 °C.'),
    ('Coloque o sencha no kyusu e verta a água das xícaras.', 'Put the sencha in the kyusu and pour in the water from the cups.'), ('Infunda 1 min, sem mexer.', 'Steep 1 min without stirring.'),
    ('Sirva alternando as xícaras, até a última gota, que é a mais concentrada.', 'Pour alternating between cups, down to the last drop, which is the most concentrated.')],
   ('Segunda infusão de 20 s, mais quente.', 'Second steep of 20 s, hotter.'), ('Passar a água entre recipientes é o termômetro japonês: cada passagem tira cerca de 10 °C.', 'Pouring between vessels is the Japanese thermometer: each transfer drops about 10 °C.')),
 R(5, ('Chá Amarelo na Gaiwan', 'Yellow Tea in a Gaiwan'), ('O mais raro dos seis estilos.', 'The rarest of the six styles.'), False, '10 min', ('4 xícaras pequenas', '4 small cups'), True, 'mid',
   [('3 g', '3 g', 'chá amarelo (Huoshan Huangya, Junshan Yinzhen)', 'yellow tea (Huoshan Huangya, Junshan Yinzhen)'), ('100 ml', '100 ml', 'água a 80 °C, por rodada', 'water at 80 °C, per round')],
   [('Aqueça a gaiwan.', 'Warm the gaiwan.'), ('Infusões de 40 s, 40 s, 1 min e 1 min 30 s.', 'Steeps of 40 s, 40 s, 1 min and 1 min 30 s.'), ('Prove a primeira sem pressa: doce, de milho verde e castanha.', 'Taste the first slowly: sweet, of fresh corn and chestnut.')],
   None, ('O "abafamento" (men huang) tira a aresta vegetal do verde. Compre de vendedor confiável: muito "amarelo" é verde comum.', 'The "smothering" (men huang) removes green tea\'s grassy edge. Buy from a trusted seller: much "yellow" is ordinary green.')),
 R(6, ('Tie Guan Yin Gongfu', 'Gongfu Tie Guan Yin'), ('Orquídea, manteiga e muitas rodadas.', 'Orchid, butter and many rounds.'), False, '20 min', ('8 xícaras pequenas', '8 small cups'), True, 'adv',
   [('7 g', '7 g', 'Tie Guan Yin', 'Tie Guan Yin'), ('100 ml', '100 ml', 'água a 95 °C, por rodada', 'water at 95 °C, per round')],
   [('Aqueça tudo. Folhas na gaiwan; enxágue de 5 s e descarte.', 'Warm everything. Leaves into the gaiwan; 5 s rinse and discard.'),
    ('Infusões de 20, 20, 25, 30, 40, 50 s, 1 min e 1 min 30 s.', 'Steeps of 20, 20, 25, 30, 40, 50 s, 1 min and 1 min 30 s.'),
    ('Use uma jarra (cha hai) para todas as xícaras terem a mesma força.', 'Use a pitcher (cha hai) so every cup has the same strength.'), ('Cheire a tampa da gaiwan entre rodadas.', 'Smell the gaiwan lid between rounds.')],
   ('Abra as folhas no fim: inteiras, com bordas oxidadas.', 'Open the leaves at the end: whole, with oxidised edges.'), ('As bolinhas enroladas se abrem até encher a gaiwan; 7 g parece pouco, mas é a medida.', 'The rolled balls open until they fill the gaiwan; 7 g looks small but is the right measure.')),
 R(7, ('Bubble Tea Caseiro', 'Homemade Bubble Tea'), ('Chá com leite taiwanês e pérolas de tapioca.', 'Taiwanese milk tea with tapioca pearls.'), True, '40 min', ('2 copos', '2 glasses'), True, 'mid',
   [('6 g', '6 g', 'oolong tostado ou Assam', 'roasted oolong or Assam'), ('300 ml', '300 ml', 'água fervente', 'boiling water'), ('60 g', '60 g', 'pérolas de tapioca', 'tapioca pearls'), ('3 c. sopa', '3 tbsp', 'açúcar mascavo', 'brown sugar'), ('200 ml', '200 ml', 'leite', 'milk')],
   [('Cozinhe as pérolas conforme a embalagem (20 a 30 min). Escorra e misture com o açúcar mascavo e 2 c. sopa de água quente.', 'Cook the pearls as packaged (20 to 30 min). Drain and mix with the brown sugar and 2 tbsp hot water.'),
    ('Infunda o chá forte por 5 min, coe e esfrie.', 'Steep the tea strong for 5 min, strain and cool.'), ('No copo: pérolas com calda, gelo, chá e leite.', 'In the glass: pearls with syrup, ice, tea and milk.')],
   ('Canudo largo.', 'A wide straw.'), ('As pérolas endurecem na geladeira: faça só o que vai consumir em 4 horas.', 'Pearls harden in the fridge: make only what you will drink within 4 hours.'), milk=True),
 R(8, ('Darjeeling de Primavera', 'Spring Darjeeling'), ('O "champanhe dos chás", sem leite.', 'The "champagne of teas", no milk.'), False, '4 min', ('1 bule · 400 ml', '1 pot · 400 ml'), True, 'easy',
   [('6 g', '6 g', 'Darjeeling first flush', 'first-flush Darjeeling'), ('400 ml', '400 ml', 'água a 90 °C', 'water at 90 °C')],
   [('Aqueça o bule.', 'Warm the pot.'), ('Infunda 2 min 30 s a 3 min. Primeira colheita amarga rápido.', 'Steep 2 min 30 s to 3 min. First flush turns bitter quickly.'), ('Coe tudo para outro bule ou xícaras.', 'Strain it all into another pot or cups.')],
   ('Nada: nem leite, nem açúcar.', 'Nothing: no milk, no sugar.'), ('O second flush (verão) aceita água fervente e 4 min; tem notas de moscatel.', 'Second flush (summer) takes boiling water and 4 min; it has muscatel notes.')),
 R(9, ('Po Cha: Chá Tibetano com Manteiga', 'Po Cha: Tibetan Butter Tea'), ('Escuro, salgado e cremoso: o chá das montanhas.', 'Dark, salty and creamy: the mountain tea.'), False, '15 min', ('2 xícaras', '2 cups'), True, 'mid',
   [('5 g', '5 g', 'pu-erh shou ou outro chá escuro prensado', 'shou pu-erh or another pressed dark tea'), ('500 ml', '500 ml', 'água', 'water'), ('1 c. sopa', '1 tbsp', 'manteiga sem sal', 'unsalted butter'), ('100 ml', '100 ml', 'leite', 'milk'), ('1 pitada', '1 pinch', 'sal', 'salt')],
   [('Ferva o chá na água por 10 min, até ficar bem escuro. Coe.', 'Simmer the tea in the water for 10 min until very dark. Strain.'), ('Bata o chá quente com a manteiga, o leite e o sal no liquidificador por 30 s (com a tampa entreaberta e um pano por cima).', 'Blend the hot tea with the butter, milk and salt for 30 s (lid ajar, a cloth on top).'), ('Sirva logo, espumoso.', 'Serve at once, frothy.')],
   None, ('No Tibete o chá é batido num cilindro de madeira. O sal é parte do sabor: comece com pouco, como num caldo.', 'In Tibet the tea is churned in a wooden cylinder. Salt is part of the flavour: start small, as with a broth.'), milk=True),
 R(10, ('London Fog', 'London Fog'), ('Earl Grey, leite espumado e baunilha.', 'Earl Grey, frothed milk and vanilla.'), False, '6 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), True, 'easy',
   [('3 g', '3 g', 'Earl Grey', 'Earl Grey'), ('120 ml', '120 ml', 'água fervente', 'boiling water'), ('130 ml', '130 ml', 'leite', 'milk'), ('1 c. chá', '1 tsp', 'xarope de baunilha ou mel', 'vanilla syrup or honey')],
   [('Infunda o Earl Grey por 4 min, concentrado. Coe.', 'Steep the Earl Grey for 4 min, concentrated. Strain.'), ('Adoce o chá.', 'Sweeten the tea.'), ('Aqueça e espume o leite e verta por cima.', 'Heat and froth the milk and pour on top.')],
   ('Lavanda seca por cima, se gostar.', 'Dried lavender on top, if you like.'), ('Nasceu em Vancouver, apesar do nome. Funciona com rooibos para uma versão sem cafeína.', 'It was born in Vancouver, despite the name. Works with rooibos for a caffeine-free version.'), milk=True),
 R(11, ('Pu-erh com Casca de Tangerina', 'Pu-erh with Tangerine Peel'), ('Terroso e cítrico, para depois do jantar.', 'Earthy and citrusy, for after dinner.'), False, '15 min', ('4 xícaras pequenas', '4 small cups'), True, 'mid',
   [('5 g', '5 g', 'pu-erh shou', 'shou pu-erh'), ('2 g', '2 g', 'casca de tangerina seca (chenpi)', 'dried tangerine peel (chenpi)'), ('100 ml', '100 ml', 'água fervente, por rodada', 'boiling water, per round')],
   [('Quebre o pu-erh com cuidado, sem esmigalhar.', 'Break the pu-erh carefully without crumbling it.'), ('Dois enxágues rápidos de 5 s; descarte.', 'Two quick 5 s rinses; discard.'),
    ('Junte a casca. Infusões de 15, 15, 20, 30, 45 s e 1 min.', 'Add the peel. Steeps of 15, 15, 20, 30, 45 s and 1 min.')],
   ('Cor de café, sem amargor.', 'Coffee colour, no bitterness.'), ('Seque cascas de mexerica em casa: sem a parte branca, 3 dias à sombra ou 1 h em forno baixo.', 'Dry tangerine peel at home: no pith, 3 days in the shade or 1 h in a low oven.')),
 R(12, ('Zavarka à Russa', 'Russian Zavarka'), ('Concentrado no bule, diluído na xícara.', 'A concentrate in the pot, diluted in the cup.'), False, '10 min', ('6 a 8 xícaras', '6 to 8 cups'), True, 'easy',
   [('10 g', '10 g', 'chá preto (Keemun, Ceylon ou blend russo)', 'black tea (Keemun, Ceylon or Russian blend)'), ('200 ml', '200 ml', 'água fervente', 'boiling water'), ('a gosto', 'to taste', 'água quente para diluir, limão, geleia', 'hot water to dilute, lemon, jam')],
   [('Infunda o chá em pouca água por 5 a 7 min: é a zavarka.', 'Steep the tea in little water for 5 to 7 min: that is the zavarka.'), ('Coloque 30 a 50 ml de concentrado em cada xícara.', 'Put 30 to 50 ml of concentrate in each cup.'), ('Complete com água quente. Cada um escolhe a força.', 'Top up with hot water. Everyone picks their strength.')],
   ('Limão ou uma colher de geleia na xícara.', 'Lemon or a spoon of jam in the cup.'), ('O jeito ideal de servir muita gente sem bule grande: o concentrado dura 1 hora.', 'The ideal way to serve many people without a big pot: the concentrate lasts 1 hour.')),
]

# (nome, origem, descrição, estilo, preparo, notas)
FAMOUS = [
 (('Bai Hao Yin Zhen', 'Silver Needle'), ('Fujian, China', 'Fujian, China'), ('Só brotos cobertos de penugem prateada.', 'Only buds covered in silvery down.'), ('Branco', 'White'), ('85 °C · 3 min', '85 °C · 3 min'), ('melão, mel, flores do campo', 'melon, honey, meadow flowers')),
 (('Bai Mu Dan', 'Bai Mu Dan (White Peony)'), ('Fujian, China', 'Fujian, China'), ('Broto com duas folhas, mais corpo que o Silver Needle.', 'A bud with two leaves, more body than Silver Needle.'), ('Branco', 'White'), ('85 °C · 3 min', '85 °C · 3 min'), ('feno, damasco, mel', 'hay, apricot, honey')),
 (('Long Jing', 'Long Jing (Dragon Well)'), ('Hangzhou, China', 'Hangzhou, China'), ('Folhas achatadas na panela, à mão.', 'Leaves pressed flat in the wok by hand.'), ('Verde', 'Green'), ('80 °C · 2 min', '80 °C · 2 min'), ('castanha tostada, ervilha', 'roasted chestnut, pea')),
 (('Bi Luo Chun', 'Bi Luo Chun'), ('Jiangsu, China', 'Jiangsu, China'), ('Espirais finas e penugentas, plantadas entre frutíferas.', 'Fine downy spirals, grown among fruit trees.'), ('Verde', 'Green'), ('75 °C · 2 min', '75 °C · 2 min'), ('frutado, floral, fresco', 'fruity, floral, fresh')),
 (('Huangshan Mao Feng', 'Huangshan Mao Feng'), ('Anhui, China', 'Anhui, China'), ('Folhas de montanha em forma de bico.', 'Mountain leaves shaped like a beak.'), ('Verde', 'Green'), ('80 °C · 2 min', '80 °C · 2 min'), ('orquídea, doce, leve', 'orchid, sweet, light')),
 (('Gyokuro', 'Gyokuro'), ('Uji e Yame, Japão', 'Uji and Yame, Japan'), ('Sombreado por semanas, como o matcha, mas em folha.', 'Shaded for weeks like matcha, but as leaf.'), ('Verde', 'Green'), ('55–60 °C · 2 min', '55–60 °C · 2 min'), ('umami intenso, caldo', 'intense umami, broth')),
 (('Sencha', 'Sencha'), ('Shizuoka e Kagoshima, Japão', 'Shizuoka and Kagoshima, Japan'), ('O chá do dia a dia japonês, cozido no vapor.', 'Japan\'s everyday tea, steamed.'), ('Verde', 'Green'), ('70 °C · 1 min', '70 °C · 1 min'), ('grama, alga, cítrico', 'grass, seaweed, citrus')),
 (('Hojicha', 'Hojicha'), ('Kyoto, Japão', 'Kyoto, Japan'), ('Bancha e talos tostados em alta temperatura.', 'Bancha and stems roasted at high heat.'), ('Verde tostado', 'Roasted green'), ('95 °C · 30 s', '95 °C · 30 s'), ('caramelo, café leve, madeira', 'caramel, light coffee, wood')),
 (('Junshan Yin Zhen', 'Junshan Yin Zhen'), ('Hunan, China', 'Hunan, China'), ('Brotos de uma ilha no lago Dongting.', 'Buds from an island in Dongting lake.'), ('Amarelo', 'Yellow'), ('80 °C · 2 min', '80 °C · 2 min'), ('milho doce, castanha', 'sweetcorn, chestnut')),
 (('Tie Guan Yin', 'Tie Guan Yin'), ('Anxi, Fujian', 'Anxi, Fujian'), ('Bolinhas enroladas, da "Deusa de Ferro".', 'Rolled balls, the "Iron Goddess".'), ('Oolong leve', 'Light oolong'), ('95 °C · gongfu', '95 °C · gongfu'), ('orquídea, lilás, manteiga', 'orchid, lilac, butter')),
 (('Da Hong Pao', 'Da Hong Pao'), ('Montes Wuyi, Fujian', 'Wuyi Mountains, Fujian'), ('O "Grande Manto Vermelho" dos rochedos.', 'The "Big Red Robe" of the cliffs.'), ('Oolong tostado', 'Roasted oolong'), ('100 °C · gongfu', '100 °C · gongfu'), ('mineral, cacau, fruta seca', 'mineral, cacao, dried fruit')),
 (('Dong Ding', 'Dong Ding'), ('Nantou, Taiwan', 'Nantou, Taiwan'), ('Oolong enrolado de torra média.', 'A rolled, medium-roast oolong.'), ('Oolong', 'Oolong'), ('95 °C · gongfu', '95 °C · gongfu'), ('nozes, mel, pão', 'nuts, honey, bread')),
 (('Oriental Beauty', 'Oriental Beauty'), ('Hsinchu, Taiwan', 'Hsinchu, Taiwan'), ('Folhas picadas por cigarrinhas, o que gera notas de mel.', 'Leaves bitten by leafhoppers, which creates honey notes.'), ('Oolong escuro', 'Dark oolong'), ('90 °C · 3 min', '90 °C · 3 min'), ('mel, pêssego, moscatel', 'honey, peach, muscatel')),
 (('Alto Shan (Alishan)', 'High Mountain (Alishan)'), ('Chiayi, Taiwan', 'Chiayi, Taiwan'), ('Plantado acima de 1.000 m, leve e cremoso.', 'Grown above 1,000 m, light and creamy.'), ('Oolong leve', 'Light oolong'), ('95 °C · gongfu', '95 °C · gongfu'), ('flores brancas, creme', 'white flowers, cream')),
 (('Darjeeling', 'Darjeeling'), ('Bengala Ocidental, Índia', 'West Bengal, India'), ('Jardins no Himalaia; colheitas bem diferentes entre si.', 'Himalayan gardens; very different harvests.'), ('Preto', 'Black'), ('90–95 °C · 3 min', '90–95 °C · 3 min'), ('moscatel, flores, uva', 'muscatel, flowers, grape')),
 (('Assam', 'Assam'), ('Assam, Índia', 'Assam, India'), ('Planícies quentes; a base dos chás de café da manhã.', 'Hot lowlands; the base of breakfast teas.'), ('Preto', 'Black'), ('100 °C · 4 min', '100 °C · 4 min'), ('malte, melado, encorpado', 'malt, molasses, full-bodied')),
 (('Ceylon Nuwara Eliya', 'Ceylon Nuwara Eliya'), ('Sri Lanka', 'Sri Lanka'), ('O mais alto e leve dos Ceylons.', 'The highest and lightest of the Ceylons.'), ('Preto', 'Black'), ('95 °C · 3 min', '95 °C · 3 min'), ('cítrico, floral, brilhante', 'citrus, floral, bright')),
 (('Keemun', 'Keemun'), ('Anhui, China', 'Anhui, China'), ('Preto chinês clássico, base de muitos English Breakfast.', 'A classic Chinese black, base of many English Breakfasts.'), ('Preto', 'Black'), ('95 °C · 3 min', '95 °C · 3 min'), ('cacau, fumaça leve, ameixa', 'cocoa, light smoke, plum')),
 (('Dian Hong', 'Dian Hong'), ('Yunnan, China', 'Yunnan, China'), ('Muitos brotos dourados, doce e macio.', 'Lots of golden buds, sweet and smooth.'), ('Preto', 'Black'), ('95 °C · 3 min', '95 °C · 3 min'), ('batata-doce, malte, pimenta', 'sweet potato, malt, pepper')),
 (('Lapsang Souchong', 'Lapsang Souchong'), ('Montes Wuyi, Fujian', 'Wuyi Mountains, Fujian'), ('Seco sobre fogo de pinho.', 'Dried over pinewood fires.'), ('Preto defumado', 'Smoked black'), ('95 °C · 3 min', '95 °C · 3 min'), ('fumaça, resina, bacon', 'smoke, resin, bacon')),
 (('Pu-erh Sheng', 'Sheng Pu-erh'), ('Yunnan, China', 'Yunnan, China'), ('Prensado cru; envelhece por décadas.', 'Pressed raw; ages for decades.'), ('Escuro', 'Dark'), ('95 °C · gongfu', '95 °C · gongfu'), ('jovem: amargo e frutado; velho: madeira', 'young: bitter and fruity; old: wood')),
 (('Pu-erh Shou', 'Shou Pu-erh'), ('Yunnan, China', 'Yunnan, China'), ('Fermentação acelerada em pilhas úmidas.', 'Accelerated fermentation in damp piles.'), ('Escuro', 'Dark'), ('100 °C · gongfu', '100 °C · gongfu'), ('terra, cacau, café', 'earth, cocoa, coffee')),
 (('Liu Bao', 'Liu Bao'), ('Guangxi, China', 'Guangxi, China'), ('Escuro envelhecido em cestos de bambu.', 'A dark tea aged in bamboo baskets.'), ('Escuro', 'Dark'), ('100 °C · gongfu', '100 °C · gongfu'), ('betel, madeira, ervas', 'betel, wood, herbs')),
 (('Matcha', 'Matcha'), ('Uji e Nishio, Japão', 'Uji and Nishio, Japan'), ('Tencha sombreado e moído em pedra.', 'Shaded tencha ground on stone.'), ('Verde em pó', 'Powdered green'), ('75–80 °C · batido', '75–80 °C · whisked'), ('umami, creme, grama doce', 'umami, cream, sweet grass')),
]


def famous_card(i):
    n, origin, desc, style, brew, notes = FAMOUS[i]
    return C(n, origin, [desc], [(('Estilo', 'Style'), style), (('Preparo', 'Brew'), brew), (('Notas', 'Notes'), notes)])


def extra():
    ch_r = ('Receitas por estilo', 'Recipes by style')
    ch_f = ('24 chás famosos', '24 famous teas')
    pages = [opener('V', ch_r, ('Do branco ao escuro', 'From white to dark'),
                    [('Doze preparos que mostram o melhor de cada família: gongfu, kyusu, copo, cozido, com leite e gelado. Cada receita indica a folha ideal, mas funciona com equivalentes.', 'Twelve preparations that show the best of each family: gongfu, kyusu, glass, simmered, with milk and iced. Each recipe names the ideal leaf but works with equivalents.')],
                    [(r['name']['pt'], r['name']['en']) for r in RECIPES])]
    pages += recipe_pages(RECIPES)
    pages += [opener('VI', ch_f, ('Fichas para reconhecer e comprar', 'Profiles to recognise and buy'),
                     [('Os nomes que você vai encontrar nos cardápios e nas lojas de chá especial. Para cada um: origem, estilo, preparo e as notas que deve procurar na xícara.', 'The names you will meet on menus and in specialty tea shops. For each: origin, style, brewing and the notes to look for in the cup.')])]
    pages += cards_page([famous_card(i) for i in range(len(FAMOUS))], ch_f, per=6)
    ch_u = ('Em casa', 'At home')
    pages += [
        text(('Utensílios', 'Tools'), eyebrow=('Em casa', 'At home'), chapter=ch_u, toc=('Utensílios', 'Tools'),
             lead=('Não é preciso comprar tudo. Um bule com infusor e uma gaiwan cobrem os seis estilos.', 'You do not need to buy everything. A pot with an infuser and a gaiwan cover all six styles.'),
             body=join(T([('Utensílio', 'Tool'), ('Melhor para', 'Best for'), ('Por quê', 'Why'), ('Preço', 'Price')],
                         [[('Bule com infusor', 'Pot with infuser'), ('pretos, ervas, blends', 'blacks, herbs, blends'), ('Retira as folhas na hora certa', 'Removes the leaves at the right time'), ('$', '$')],
                          [('Gaiwan', 'Gaiwan'), ('brancos, oolongs, pu-erh', 'whites, oolongs, pu-erh'), ('Infusões curtas, folha à vista', 'Short steeps, leaf in view'), ('$', '$')],
                          [('Kyusu', 'Kyusu'), ('verdes japoneses', 'Japanese greens'), ('Filtro fino para folha cozida no vapor', 'Fine filter for steamed leaf'), ('$$', '$$')],
                          [('Copo alto de vidro', 'Tall glass'), ('verdes chineses, amarelos', 'Chinese greens, yellows'), ('Mostra a folha; dispensa coar', 'Shows the leaf; no straining'), ('$', '$')],
                          [('Bule de barro Yixing', 'Yixing clay pot'), ('um só tipo de oolong ou pu-erh', 'a single type of oolong or pu-erh'), ('O barro poroso guarda sabor', 'Porous clay holds flavour'), ('$$$', '$$$')],
                          [('Chaleira com temperatura', 'Variable-temperature kettle'), ('todos', 'all'), ('Acaba com o chute', 'Ends the guesswork'), ('$$', '$$')],
                          [('Balança de 0,1 g', '0.1 g scale'), ('todos', 'all'), ('Folhas têm volumes muito diferentes', 'Leaves vary hugely in volume'), ('$', '$')]], cls='data compact'),
                       H3('Kit inicial recomendado', 'Recommended starter kit'),
                       B(('Bule de vidro de 500 ml com infusor de aço fino.', 'A 500 ml glass pot with a fine steel infuser.'), ('Gaiwan de porcelana de 100 a 120 ml.', 'A 100 to 120 ml porcelain gaiwan.'), ('Balança de cozinha de 0,1 g.', 'A 0.1 g kitchen scale.'), ('Termômetro culinário ou chaleira com temperatura.', 'A cooking thermometer or a temperature kettle.')),
                       TIP('Porcelana branca por dentro é a melhor para provar: não guarda sabor e mostra a cor real da infusão.', 'White porcelain inside is best for tasting: it holds no flavour and shows the true colour of the liquor.'))),
        text(('A água', 'The water'), eyebrow=('Em casa', 'At home'), chapter=ch_u, toc=('A água', 'The water'),
             lead=('O chá é 99% água. Uma água ruim estraga a melhor folha.', 'Tea is 99% water. Bad water spoils the best leaf.'),
             body=join(T([('Tipo de água', 'Water type'), ('Efeito no chá', 'Effect on tea'), ('Use?', 'Use?')],
                         [[('Torneira com cloro', 'Chlorinated tap'), ('Cheiro de piscina, aroma apagado', 'Pool smell, dull aroma'), ('Filtre antes', 'Filter first')],
                          [('Filtrada (carvão)', 'Filtered (carbon)'), ('Neutra, boa para quase tudo', 'Neutral, good for almost everything'), ('Sim', 'Yes')],
                          [('Mineral leve (resíduo seco < 100 mg/L)', 'Light mineral (TDS < 100 mg/L)'), ('Doçura e brilho', 'Sweetness and brightness'), ('Ideal', 'Ideal')],
                          [('Mineral dura (> 250 mg/L)', 'Hard mineral (> 250 mg/L)'), ('Turva, opaca, pesada', 'Cloudy, dull, heavy'), ('Evite', 'Avoid')],
                          [('Destilada ou osmose', 'Distilled or RO'), ('Chata, sem corpo', 'Flat, no body'), ('Misture com mineral', 'Mix with mineral')]], cls='data compact'),
                       H3('Temperatura sem termômetro', 'Temperature without a thermometer'),
                       T([('Sinal na chaleira', 'Sign in the kettle'), ('Temperatura aproximada', 'Approximate temperature'), ('Para', 'For')],
                         [[('Pequenas bolhas no fundo ("olho de camarão")', 'Small bubbles at the bottom ("shrimp eyes")'), '70–80 °C', ('verdes, amarelos', 'greens, yellows')],
                          [('Bolhas médias subindo ("olho de peixe")', 'Medium bubbles rising ("fish eyes")'), '80–90 °C', ('brancos, oolongs leves', 'whites, light oolongs')],
                          [('Colar de pérolas na borda', 'String of pearls at the edge'), '90–95 °C', ('oolongs, Darjeeling', 'oolongs, Darjeeling')],
                          [('Fervura plena', 'Full boil'), '100 °C', ('pretos, escuros, ervas', 'blacks, dark teas, herbs')]], cls='data compact'),
                       P(('Os nomes vêm dos tratados chineses de chá da dinastia Tang. Água fervida muito tempo perde oxigênio e deixa o chá chato: ferva uma vez, na hora.', 'The names come from Tang-dynasty Chinese tea treatises. Water boiled too long loses oxygen and makes tea flat: boil once, just before brewing.')))),
        text(('Gongfu passo a passo', 'Gongfu step by step'), eyebrow=('Em casa', 'At home'), chapter=ch_u, toc=('Gongfu passo a passo', 'Gongfu step by step'),
             lead=('Mais folha, pouca água, infusões curtas: o método chinês que revela cada camada do chá.', 'More leaf, little water, short steeps: the Chinese method that reveals each layer of a tea.'),
             body=join(B(('**Aqueça** gaiwan, jarra e xícaras com água fervente.', '**Warm** the gaiwan, pitcher and cups with boiling water.'),
                         ('**Pese** 5 a 7 g de folha para 100 ml. É o dobro ou triplo do preparo ocidental.', '**Weigh** 5 to 7 g of leaf per 100 ml. That is double or triple the Western ratio.'),
                         ('**Cheire** as folhas secas na gaiwan quente, tampada e agitada.', '**Smell** the dry leaves in the warm gaiwan, covered and shaken.'),
                         ('**Enxágue** (oolongs e escuros): 5 s e descarte. Acorda a folha.', '**Rinse** (oolongs and dark teas): 5 s and discard. It wakes the leaf.'),
                         ('**Infunda curto**: comece com 10 a 20 s e aumente 5 a 10 s por rodada.', '**Steep short**: start at 10 to 20 s and add 5 to 10 s each round.'),
                         ('**Sirva tudo** na jarra, depois nas xícaras: nenhuma água fica nas folhas.', '**Pour everything** into the pitcher, then the cups: no water stays on the leaves.'),
                         ('**Continue** até o chá perder sabor: 5 a 15 rodadas, conforme a folha.', '**Continue** until the tea fades: 5 to 15 rounds, depending on the leaf.'), ordered=True, cls='steps'),
                       T([('Estilo', 'Style'), ('Folha / 100 ml', 'Leaf / 100 ml'), ('Água', 'Water'), ('Primeira infusão', 'First steep'), ('Rodadas', 'Rounds')],
                         [[('Branco', 'White'), '5 g', '85–90 °C', '20 s', '6–8'], [('Verde', 'Green'), '4 g', '80 °C', '15 s', '3–4'], [('Oolong', 'Oolong'), '6–7 g', '95–100 °C', '20 s', '8–12'],
                          [('Preto', 'Black'), '5 g', '95 °C', '10 s', '5–7'], [('Pu-erh', 'Pu-erh'), '6–7 g', '100 °C', '10 s', '10–15']], cls='data compact'))),
    ]
    return pages


GUIDE = extend(base.GUIDE, extra)
