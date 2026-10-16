from engine import *


def R(n, name, tag, iced, time, yld, caf, level, ing, steps, fin, tip, milk=False):
    return dict(n=n, name=L(*name), tag=L(*tag), iced=iced, time=time, **{'yield': L(*yld)}, caf=caf, milk=milk, level=level,
                ing=[(L(a, b), L(c, d)) for a, b, c, d in ing], steps=[L(*s) for s in steps], finish=L(*fin), tip=L(*tip))


CUP = ('1 xícara · 250 ml', '1 cup · 250 ml')

RECIPES = [
 # ---------------- I · Chá preto
 R(1, ('Preto Imperial de Especiarias', 'Imperial Spiced Black'), ('Malte, madeira doce e um final anisado longo.', 'Malt, sweet wood and a long anise finish.'), False, '9 min', CUP, True, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('1 sachê', '1 bag', 'chá preto', 'black tea'), ('1 pau (5 cm)', '1 stick (5 cm)', 'canela em casca', 'cinnamon stick'), ('1 un.', '1', 'anis-estrelado', 'star anise'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Ferva a água com a canela e o anis por 4 min, fogo baixo e panela tampada. Especiaria dura pede decocção, não infusão.', 'Simmer the water with the cinnamon and anise for 4 min, low heat, lid on. Hard spices need a decoction, not an infusion.'),
    ('Desligue e aguarde 30 s (≈ 95 °C). Junte o sachê e infunda 3 min, tampado.', 'Turn off the heat and wait 30 s (≈ 95 °C). Add the bag and steep 3 min, covered.'),
    ('Retire o sachê sem espremer: espremer libera taninos amargos. Coe as especiarias.', 'Lift out the bag without squeezing: squeezing releases bitter tannins. Strain the spices.'),
    ('Adoce com o mel fora do fogo.', 'Sweeten with the honey off the heat.')],
   ('A própria estrela de anis flutuando na xícara.', 'The star anise itself floating in the cup.'),
   ('Toste a canela e o anis por 40 s na panela seca antes da água: os óleos essenciais se intensificam.', 'Toast the cinnamon and anise for 40 s in the dry pan before adding water: the essential oils intensify.')),
 R(2, ('Preto & Maçã Tostada', 'Black Tea & Toasted Apple'), ('Caramelo, casca de maçã assada, chá encorpado.', 'Caramel, baked apple skin, full-bodied tea.'), False, '10 min', CUP, True, 'mid',
   [('¼ un.', '¼', 'maçã em lâminas finas', 'apple, thinly sliced'), ('1 pitada', '1 pinch', 'canela em pó', 'ground cinnamon'), ('280 ml', '280 ml', 'água', 'water'), ('1 sachê', '1 bag', 'chá preto', 'black tea'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Doure as lâminas de maçã em frigideira seca, fogo médio, cerca de 2 min de cada lado. Polvilhe a canela no último minuto.', 'Brown the apple slices in a dry pan over medium heat, about 2 min per side. Dust with cinnamon in the last minute.'),
    ('Coloque metade das lâminas no bule ou caneca, junte o sachê e cubra com a água fervente. Infunda 3 min.', 'Put half the slices in the pot or mug, add the bag and pour over the boiling water. Steep 3 min.'),
    ('Retire o sachê e deixe a maçã mais 2 min.', 'Remove the bag and leave the apple for 2 more min.'),
    ('Adoce e prenda uma lâmina tostada na borda da xícara.', 'Sweeten and clip a toasted slice on the rim of the cup.')],
   ('Lâmina de maçã tostada na borda.', 'Toasted apple slice on the rim.'),
   ('A reação de Maillard na maçã cria notas de torta assada que o malte do chá preto abraça muito bem.', 'The Maillard reaction in the apple creates baked-pie notes that the malt of black tea embraces beautifully.')),
 R(3, ('Toddy do Barista', "Barista's Toddy"), ('Versão sem álcool do hot toddy: cítrico, picante, reconfortante.', 'An alcohol-free hot toddy: citrusy, spicy, comforting.'), False, '8 min', CUP, True, 'easy',
   [('250 ml', '250 ml', 'água', 'water'), ('1 sachê', '1 bag', 'chá preto', 'black tea'), ('1 c. chá', '1 tsp', 'gengibre ralado', 'grated ginger'), ('1 pau', '1 stick', 'canela em casca', 'cinnamon stick'), ('1 c. sopa', '1 tbsp', 'suco de limão', 'lime juice'), ('1 c. sopa', '1 tbsp', 'mel', 'honey')],
   [('Ferva a água com o gengibre e a canela por 3 min.', 'Simmer the water with the ginger and cinnamon for 3 min.'),
    ('Desligue, junte o sachê e infunda 3 min.', 'Turn off the heat, add the bag and steep 3 min.'),
    ('Na xícara, dissolva o mel no suco de limão.', 'In the cup, dissolve the honey in the lime juice.'),
    ('Coe o chá sobre essa mistura e mexa.', 'Strain the tea over the mixture and stir.')],
   ('Rodela de limão e o pau de canela como mexedor.', 'A lime wheel and the cinnamon stick as a stirrer.'),
   ('Limão sempre por último e fora do fogo: o calor direto apaga o frescor e deixa o cítrico com gosto de "cozido".', 'Citrus always goes in last and off the heat: direct heat dulls the freshness and makes it taste "cooked".')),
 R(4, ('Rubi Escuro', 'Dark Ruby'), ('Tânico e frutado, cor de granada, acidez de cranberry.', 'Tannic and fruity, garnet in colour, cranberry-like acidity.'), False, '7 min', CUP, True, 'easy',
   [('250 ml', '250 ml', 'água', 'water'), ('1 sachê', '1 bag', 'chá preto', 'black tea'), ('1 c. chá rasa', '1 level tsp', 'flor de hibisco', 'dried hibiscus flowers'), ('1 tira', '1 strip', 'casca de limão', 'lime peel'), ('2 c. chá', '2 tsp', 'mel', 'honey')],
   [('Despeje a água fervente sobre o hibisco e a casca de limão. Infunda 2 min.', 'Pour boiling water over the hibiscus and lime peel. Steep 2 min.'),
    ('Junte o sachê de chá preto e infunda mais 3 min.', 'Add the black tea bag and steep 3 more min.'),
    ('Coe e adoce.', 'Strain and sweeten.')],
   ('Sirva em xícara de vidro para mostrar a cor.', 'Serve in a glass cup to show off the colour.'),
   ('O hibisco extrai muito rápido. Passar de 5 min junto ao chá preto soma duas adstringências e o resultado fica áspero.', 'Hibiscus extracts very fast. Past 5 min alongside black tea, two astringencies add up and the cup turns harsh.')),
 R(5, ('Preto Citrino com Capim-Cidreira', 'Citrus Black with Lemongrass'), ('Leve e perfumado, lembra um Earl Grey tropical.', 'Light and fragrant, like a tropical Earl Grey.'), False, '8 min', CUP, True, 'easy',
   [('250 ml', '250 ml', 'água', 'water'), ('1 sachê', '1 bag', 'chá preto', 'black tea'), ('1 c. sopa', '1 tbsp', 'capim-cidreira seco', 'dried lemongrass'), ('¼ un.', '¼', 'limão (só as raspas)', 'lime (zest only)'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Infunda o capim-cidreira na água fervente por 3 min.', 'Steep the lemongrass in boiling water for 3 min.'),
    ('Junte o sachê de chá preto por mais 3 min. Coe.', 'Add the black tea bag for 3 more min. Strain.'),
    ('Rale a casca do limão diretamente sobre a xícara, só a parte verde.', 'Zest the lime straight over the cup, green part only.'),
    ('Adoce.', 'Sweeten.')],
   ('Raspas de limão na superfície.', 'Lime zest on the surface.'),
   ('Ralar sobre a bebida, e não na panela, deposita os óleos da casca na superfície: é o aroma que você sente antes do primeiro gole.', 'Zesting over the drink, not into the pan, lands the peel oils on the surface: it is the aroma you meet before the first sip.')),
 R(6, ('Preto Gelado de Limão & Mel', 'Iced Black with Lime & Honey'), ('Refrescante, cítrico, final limpo e seco.', 'Refreshing, citrusy, with a clean, dry finish.'), True, '15 min', ('1 copo · 300 ml', '1 glass · 300 ml'), True, 'easy',
   [('2 sachês', '2 bags', 'chá preto', 'black tea'), ('200 ml', '200 ml', 'água fervente', 'boiling water'), ('2 c. sopa', '2 tbsp', 'mel', 'honey'), ('2 c. sopa', '2 tbsp', 'suco de limão', 'lime juice'), ('a gosto', 'to taste', 'gelo', 'ice'), ('2 rodelas', '2 wheels', 'limão', 'lime')],
   [('Infunda os 2 sachês nos 200 ml de água por 4 min: concentrado duplo, porque o gelo vai diluir.', 'Steep both bags in the 200 ml of water for 4 min: a double concentrate, because the ice will dilute it.'),
    ('Retire os sachês e dissolva o mel ainda quente.', 'Remove the bags and dissolve the honey while hot.'),
    ('Deixe amornar 10 min e junte o suco de limão.', 'Let it cool for 10 min and add the lime juice.'),
    ('Encha um copo de gelo com as rodelas de limão e verta o chá. Mexa por 15 s.', 'Fill a glass with ice and the lime wheels and pour in the tea. Stir for 15 s.')],
   ('Rodelas de limão entre os cubos de gelo.', 'Lime wheels between the ice cubes.'),
   ('Chá preto levado quente à geladeira pode turvar. Verter morno direto sobre bastante gelo evita o efeito.', 'Black tea chilled while hot can turn cloudy. Pouring it warm straight over plenty of ice prevents it.')),
 R(7, ('Anisado Duplo', 'Double Anise'), ('Doçura natural de erva-doce, alcaçuz e malte.', 'Natural sweetness of fennel, liquorice and malt.'), False, '9 min', CUP, True, 'easy',
   [('280 ml', '280 ml', 'água', 'water'), ('1 sachê', '1 bag', 'chá preto', 'black tea'), ('1 sachê', '1 bag', 'chá de erva-doce', 'fennel tea'), ('1 un.', '1', 'anis-estrelado', 'star anise'), ('½ c. chá', '½ tsp', 'mel (opcional)', 'honey (optional)')],
   [('Ferva o anis na água por 3 min.', 'Simmer the anise in the water for 3 min.'),
    ('Desligue, junte os dois sachês e infunda 4 min, tampado.', 'Turn off the heat, add both bags and steep 4 min, covered.'),
    ('Coe e prove antes de adoçar: a erva-doce já traz doçura.', 'Strain and taste before sweetening: fennel already brings sweetness.')],
   ('Anis-estrelado inteiro no pires.', 'A whole star anise on the saucer.'),
   ('Anis-estrelado e erva-doce compartilham o mesmo composto aromático (anetol). Juntos, um amplifica o outro.', 'Star anise and fennel share the same aromatic compound (anethole). Together, each amplifies the other.')),
 # ---------------- II · Rooibos moon
 R(8, ('Torta de Maçã no Bule', 'Apple Pie in a Pot'), ('Maçã cozida, canela e o fundo amadeirado do rooibos.', 'Stewed apple, cinnamon and the woody depth of rooibos.'), False, '12 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('1 porção', '1 serving', 'rooibos moon', 'rooibos moon'), ('¼ un.', '¼', 'maçã em cubos', 'apple, diced'), ('1 pau', '1 stick', 'canela em casca', 'cinnamon stick'), ('1 pitada', '1 pinch', 'canela em pó', 'ground cinnamon'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Cozinhe a maçã e a canela em pau na água por 5 min.', 'Simmer the apple and cinnamon stick in the water for 5 min.'),
    ('Desligue, junte o rooibos e infunda 6 min, tampado.', 'Turn off the heat, add the rooibos and steep 6 min, covered.'),
    ('Coe pressionando levemente a maçã.', 'Strain, pressing the apple lightly.'),
    ('Adoce e polvilhe a canela em pó.', 'Sweeten and dust with ground cinnamon.')],
   ('Canela em pó em um lado da superfície.', 'Ground cinnamon on one side of the surface.'),
   ('Rooibos não amarga com tempo: aqui ele pode ficar até 8 min para uma bebida mais densa.', 'Rooibos does not turn bitter with time: here it can stay up to 8 min for a denser cup.')),
 R(9, ('Rooibos Âmbar', 'Amber Rooibos'), ('Mel tostado com notas de caramelo e um toque cítrico.', 'Toasted honey with caramel notes and a touch of citrus.'), False, '10 min', CUP, False, 'adv',
   [('1 c. sopa', '1 tbsp', 'mel', 'honey'), ('280 ml', '280 ml', 'água', 'water'), ('1 porção', '1 serving', 'rooibos moon', 'rooibos moon'), ('1 tira', '1 strip', 'casca de limão', 'lime peel')],
   [('Aqueça o mel numa panelinha, fogo baixo, até borbulhar e escurecer levemente (1 a 2 min). O aroma deve lembrar caramelo.', 'Warm the honey in a small pan over low heat until it bubbles and darkens slightly (1 to 2 min). It should smell of caramel.'),
    ('Verta a água com cuidado (vai chiar), junte a casca de limão e deixe ferver.', 'Pour in the water carefully (it will hiss), add the lime peel and bring to the boil.'),
    ('Desligue, junte o rooibos e infunda 6 min.', 'Turn off the heat, add the rooibos and steep 6 min.'),
    ('Coe e sirva.', 'Strain and serve.')],
   ('Tira de casca de limão torcida sobre a xícara.', 'A strip of lime peel twisted over the cup.'),
   ('Mel tostado perde parte da doçura e ganha um amargor elegante. Tire do fogo antes de escurecer demais: passou do âmbar, amarga.', 'Toasted honey loses some sweetness and gains an elegant bitterness. Take it off before it gets too dark: past amber, it turns bitter.')),
 R(10, ('Crepúsculo', 'Dusk'), ('Base doce-amadeirada com topo de cereja e rosa-mosqueta.', 'A sweet, woody base topped with cherry and rosehip.'), False, '7 min', ('1 xícara · 280 ml', '1 cup · 280 ml'), False, 'easy',
   [('300 ml', '300 ml', 'água fervente', 'boiling water'), ('1 porção', '1 serving', 'rooibos moon', 'rooibos moon'), ('1 sachê', '1 bag', 'rosehip, hibiscus & cherry', 'rosehip, hibiscus & cherry'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('1 lâmina', '1 slice', 'maçã', 'apple')],
   [('Despeje a água sobre o rooibos e o sachê frutado.', 'Pour the water over the rooibos and the fruit bag.'),
    ('Retire o sachê frutado aos 4 min; deixe o rooibos até 6 min.', 'Remove the fruit bag at 4 min; leave the rooibos up to 6 min.'),
    ('Coe, adoce e finalize com a lâmina de maçã.', 'Strain, sweeten and finish with the apple slice.')],
   ('Lâmina fina de maçã flutuando.', 'A thin apple slice floating.'),
   ('Retirar o frutado antes é o que mantém o equilíbrio: acidez no topo, doçura no fundo.', 'Removing the fruit bag first keeps the balance: acidity on top, sweetness underneath.')),
 R(11, ('Brasa', 'Ember'), ('Picância limpa de gengibre sobre rooibos e mel.', 'Clean ginger heat over rooibos and honey.'), False, '11 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('1 porção', '1 serving', 'rooibos moon', 'rooibos moon'), ('4 lâminas', '4 slices', 'gengibre', 'ginger'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('1 pitada', '1 pinch', 'canela em pó', 'ground cinnamon')],
   [('Ferva o gengibre na água por 4 min.', 'Simmer the ginger in the water for 4 min.'),
    ('Desligue, junte o rooibos e infunda 6 min.', 'Turn off the heat, add the rooibos and steep 6 min.'),
    ('Coe, adoce e polvilhe a canela.', 'Strain, sweeten and dust with cinnamon.')],
   ('Uma lâmina de gengibre na borda.', 'A ginger slice on the rim.'),
   ('Gengibre em lâminas dá picância limpa e bebida translúcida; ralado é mais intenso e turvo. Escolha pelo humor do dia.', 'Sliced ginger gives clean heat and a clear cup; grated is stronger and cloudier. Choose by your mood.')),
 R(12, ('Rooibos Estrelado', 'Starry Rooibos'), ('Baunilha e alcaçuz: uma sobremesa sem açúcar.', 'Vanilla and liquorice: a sugar-free dessert.'), False, '10 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('1 porção', '1 serving', 'rooibos moon', 'rooibos moon'), ('1 sachê', '1 bag', 'chá de erva-doce', 'fennel tea'), ('1 un.', '1', 'anis-estrelado', 'star anise'), ('½ c. chá', '½ tsp', 'mel (opcional)', 'honey (optional)')],
   [('Ferva o anis na água por 3 min.', 'Simmer the anise in the water for 3 min.'),
    ('Desligue, junte o rooibos e a erva-doce e infunda 6 min, tampado.', 'Turn off the heat, add the rooibos and fennel and steep 6 min, covered.'),
    ('Coe e prove antes de adoçar.', 'Strain and taste before sweetening.')],
   ('Anis-estrelado no pires.', 'Star anise on the saucer.'),
   ('O doce natural do rooibos somado à erva-doce costuma dispensar o mel. Experimente puro primeiro.', 'The natural sweetness of rooibos plus fennel usually makes honey unnecessary. Try it plain first.')),
 R(13, ('Cold Brew de Rooibos & Maçã', 'Rooibos & Apple Cold Brew'), ('Extração a frio: suave, doce, quase sem taninos.', 'Cold extraction: smooth, sweet, almost tannin-free.'), True, ('5 min + 8 h', '5 min + 8 h'), ('2 copos · 500 ml', '2 glasses · 500 ml'), False, 'mid',
   [('2 porções', '2 servings', 'rooibos moon', 'rooibos moon'), ('500 ml', '500 ml', 'água fria filtrada', 'cold filtered water'), ('½ un.', '½', 'maçã em lâminas', 'apple, sliced'), ('1 pau', '1 stick', 'canela em casca', 'cinnamon stick'), ('2 c. chá', '2 tsp', 'mel', 'honey'), ('a gosto', 'to taste', 'gelo', 'ice')],
   [('Em uma jarra, junte o rooibos, a água, a maçã e a canela. Leve à geladeira por 8 a 12 h.', 'In a jug, combine the rooibos, water, apple and cinnamon. Refrigerate for 8 to 12 h.'),
    ('Coe.', 'Strain.'),
    ('Dissolva o mel em 1 c. sopa de água quente antes de misturar: mel não dissolve no frio.', 'Dissolve the honey in 1 tbsp hot water before adding: honey does not dissolve in the cold.'),
    ('Sirva sobre gelo com uma lâmina de maçã.', 'Serve over ice with an apple slice.')],
   ('Lâmina de maçã e o pau de canela no copo.', 'Apple slice and the cinnamon stick in the glass.'),
   ('A extração a frio puxa menos taninos e mais açúcares: o resultado é naturalmente mais doce que a versão quente.', 'Cold extraction pulls fewer tannins and more sugars: the result is naturally sweeter than the hot version.')),
 R(14, ('Lua Cheia', 'Full Moon'), ('Floral de camomila sobre base de mel e madeira.', 'Chamomile florals over a base of honey and wood.'), False, '8 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('1 porção', '1 serving', 'rooibos moon', 'rooibos moon'), ('1 c. sopa', '1 tbsp', 'flores de camomila', 'chamomile flowers'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('opcional', 'optional', 'raspas de limão', 'lime zest')],
   [('Ferva a água, desligue e aguarde 1 min (≈ 95 °C).', 'Boil the water, turn off and wait 1 min (≈ 95 °C).'),
    ('Infunda o rooibos e a camomila por 5 min, tampado.', 'Steep the rooibos and chamomile for 5 min, covered.'),
    ('Coe e adoce.', 'Strain and sweeten.')],
   ('Algumas flores de camomila inteiras na superfície.', 'A few whole chamomile flowers on the surface.'),
   ('A tampa retém os óleos voláteis da camomila, que evaporam fácil. Destampada, metade do aroma vai embora.', 'The lid traps chamomile’s volatile oils, which evaporate easily. Uncovered, half the aroma is gone.')),
 # ---------------- III · Florais & ervas
 R(15, ('Camomila Dourada', 'Golden Chamomile'), ('Mel, feno doce e raspas cítricas.', 'Honey, sweet hay and citrus zest.'), False, '7 min', CUP, False, 'easy',
   [('250 ml', '250 ml', 'água', 'water'), ('2 c. sopa', '2 tbsp', 'flores de camomila', 'chamomile flowers'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('⅛ un.', '⅛', 'limão (só as raspas)', 'lime (zest only)')],
   [('Ferva a água, desligue e aguarde 1 min (≈ 95 °C).', 'Boil the water, turn off and wait 1 min (≈ 95 °C).'),
    ('Infunda as flores por 5 min, tampado.', 'Steep the flowers for 5 min, covered.'),
    ('Coe, adoce e rale o limão por cima.', 'Strain, sweeten and zest the lime over the top.')],
   ('Raspas finas de limão e uma flor inteira.', 'Fine lime zest and one whole flower.'),
   ('Flores inteiras entregam um chá mais doce e meloso que os sachês, onde a camomila vem triturada.', 'Whole flowers give a sweeter, honeyed cup than bags, where chamomile comes crushed.')),
 R(16, ('Pomar ao Entardecer', 'Orchard at Sunset'), ('Camomila e maçã cozida: doce, floral, macio.', 'Chamomile and stewed apple: sweet, floral, soft.'), False, '11 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('¼ un.', '¼', 'maçã em lâminas', 'apple, sliced'), ('1½ c. sopa', '1½ tbsp', 'flores de camomila', 'chamomile flowers'), ('1 pitada', '1 pinch', 'canela em pó', 'ground cinnamon'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Ferva a maçã na água por 4 min.', 'Simmer the apple in the water for 4 min.'),
    ('Desligue, aguarde 1 min e junte a camomila. Infunda 5 min, tampado.', 'Turn off, wait 1 min and add the chamomile. Steep 5 min, covered.'),
    ('Coe, adoce e polvilhe a canela.', 'Strain, sweeten and dust with cinnamon.')],
   ('Lâmina de maçã e canela.', 'Apple slice and cinnamon.'),
   ('"Camomila" vem do grego para "maçã do chão", pelo aroma das flores. O par é quase natural.', '"Chamomile" comes from the Greek for "ground apple", after the flowers’ scent. The pairing is almost natural.')),
 R(17, ('Brisa', 'Breeze'), ('Capim-cidreira cítrico com calor de gengibre.', 'Citrusy lemongrass with ginger warmth.'), False, '10 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('2 c. sopa', '2 tbsp', 'capim-cidreira seco', 'dried lemongrass'), ('3 lâminas', '3 slices', 'gengibre', 'ginger'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('1 rodela', '1 wheel', 'limão', 'lime')],
   [('Ferva o gengibre na água por 3 min.', 'Simmer the ginger in the water for 3 min.'),
    ('Desligue, junte o capim-cidreira e infunda 5 min, tampado.', 'Turn off, add the lemongrass and steep 5 min, covered.'),
    ('Coe, adoce e finalize com a rodela de limão.', 'Strain, sweeten and finish with the lime wheel.')],
   ('Rodela de limão na borda.', 'Lime wheel on the rim.'),
   ('Capim-cidreira seco precisa de água bem quente e tampa: as folhas são fibrosas e soltam o aroma devagar.', 'Dried lemongrass needs very hot water and a lid: the leaves are fibrous and release their aroma slowly.')),
 R(18, ('Jardim Fresco', 'Fresh Garden'), ('Hortelã e capim-cidreira: verde, fresco, limpo.', 'Mint and lemongrass: green, fresh, clean.'), False, '8 min', CUP, False, 'easy',
   [('280 ml', '280 ml', 'água fervente', 'boiling water'), ('1½ c. sopa', '1½ tbsp', 'capim-cidreira seco', 'dried lemongrass'), ('1 sachê', '1 bag', 'chá de hortelã', 'mint tea'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('1 fita', '1 ribbon', 'casca de limão', 'lime peel')],
   [('Despeje a água sobre o capim-cidreira e infunda 3 min.', 'Pour the water over the lemongrass and steep 3 min.'),
    ('Junte o sachê de hortelã por mais 3 min.', 'Add the mint bag for 3 more min.'),
    ('Coe e adoce.', 'Strain and sweeten.'),
    ('Torça a fita de casca sobre a xícara e depois coloque-a dentro.', 'Twist the peel ribbon over the cup, then drop it in.')],
   ('Fita de casca de limão torcida.', 'A twisted ribbon of lime peel.'),
   ('Torcer a casca sobre a bebida ("expressar") borrifa os óleos na superfície: técnica clássica de bar.', 'Twisting the peel over the drink ("expressing") sprays its oils on the surface: a classic bar technique.')),
 R(19, ('Trio Sereno', 'Serene Trio'), ('Floral, cítrico e doce em equilíbrio.', 'Floral, citrus and sweet in balance.'), False, '8 min', ('1 xícara · 280 ml', '1 cup · 280 ml'), False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('1 c. sopa', '1 tbsp', 'flores de camomila', 'chamomile flowers'), ('1 c. sopa', '1 tbsp', 'capim-cidreira seco', 'dried lemongrass'), ('1 sachê', '1 bag', 'chá de erva-doce', 'fennel tea'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Ferva a água, desligue e aguarde 1 min.', 'Boil the water, turn off and wait 1 min.'),
    ('Infunda tudo junto por 6 min, tampado.', 'Steep everything together for 6 min, covered.'),
    ('Coe e adoce.', 'Strain and sweeten.')],
   ('Flores de camomila sobre a espuma natural.', 'Chamomile flowers on the natural foam.'),
   ('Um blend bem construído tem três vozes: floral (camomila), cítrica (capim) e doce (erva-doce). Nenhuma deve dominar.', 'A well-built blend has three voices: floral (chamomile), citrus (lemongrass) and sweet (fennel). None should dominate.')),
 R(20, ('Camomila & Limão Tostado', 'Chamomile & Charred Lime'), ('Notas de marmelada cítrica sobre camomila e capim-limão.', 'Citrus-marmalade notes over chamomile and lemongrass.'), False, '8 min', CUP, False, 'mid',
   [('250 ml', '250 ml', 'água', 'water'), ('1 sachê', '1 bag', 'camomile & lemongrass', 'camomile & lemongrass'), ('1 rodela grossa', '1 thick wheel', 'limão', 'lime'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Aqueça bem uma frigideira seca e doure a rodela de limão 1 min de cada lado, até marcar.', 'Heat a dry pan well and char the lime wheel 1 min per side, until marked.'),
    ('Infunda o sachê em água a ≈ 95 °C por 5 min.', 'Steep the bag in water at ≈ 95 °C for 5 min.'),
    ('Coloque o limão tostado na xícara, adoce e mexa.', 'Put the charred lime in the cup, sweeten and stir.')],
   ('A rodela tostada dentro da xícara.', 'The charred wheel inside the cup.'),
   ('O limão tostado perde a acidez cortante e ganha amargor de casca caramelizada, como uma marmelada.', 'Charred lime loses its sharp acidity and gains the bitterness of caramelised peel, like marmalade.')),
 R(21, ('Digestivo do Chef', "Chef's Digestif"), ('Mentol, anis e erva-doce para depois do jantar.', 'Menthol, anise and fennel for after dinner.'), False, '7 min', ('1 xícara pequena · 200 ml', '1 small cup · 200 ml'), False, 'easy',
   [('250 ml', '250 ml', 'água', 'water'), ('1 sachê', '1 bag', 'chá de hortelã', 'mint tea'), ('1 sachê', '1 bag', 'chá de erva-doce', 'fennel tea'), ('1 un.', '1', 'anis-estrelado', 'star anise'), ('½ c. chá', '½ tsp', 'mel (opcional)', 'honey (optional)')],
   [('Ferva o anis na água por 2 min.', 'Simmer the anise in the water for 2 min.'),
    ('Desligue, junte os dois sachês e infunda 4 min.', 'Turn off, add both bags and steep 4 min.'),
    ('Coe e sirva em xícara pequena.', 'Strain and serve in a small cup.')],
   ('Anis-estrelado no pires.', 'Star anise on the saucer.'),
   ('Sirva em porção menor, como um café de fim de refeição: concentra a experiência e marca o ritual.', 'Serve a smaller portion, like an after-dinner coffee: it concentrates the experience and marks the ritual.')),
 # ---------------- IV · Hibisco & frutos
 R(22, ('Hibisco Quente Especiado', 'Spiced Hot Hibiscus'), ('Estilo vinho quente, sem álcool: especiarias, fruta e rubi.', 'Mulled-wine style, alcohol-free: spice, fruit and ruby.'), False, '12 min', ('2 xícaras · 400 ml', '2 cups · 400 ml'), False, 'mid',
   [('400 ml', '400 ml', 'água', 'water'), ('1 c. sopa', '1 tbsp', 'flor de hibisco', 'dried hibiscus flowers'), ('¼ un.', '¼', 'maçã em lâminas', 'apple, sliced'), ('1 pau', '1 stick', 'canela em casca', 'cinnamon stick'), ('1 un.', '1', 'anis-estrelado', 'star anise'), ('2 tiras', '2 strips', 'casca de limão', 'lime peel'), ('1½ c. sopa', '1½ tbsp', 'mel', 'honey')],
   [('Ferva a água com maçã, canela, anis e casca de limão por 5 min.', 'Simmer the water with the apple, cinnamon, anise and lime peel for 5 min.'),
    ('Desligue, junte o hibisco e infunda 4 min.', 'Turn off, add the hibiscus and steep 4 min.'),
    ('Coe e adoce.', 'Strain and sweeten.'),
    ('Sirva em taça ou caneca de vidro.', 'Serve in a glass or glass mug.')],
   ('Lâmina de maçã e a estrela de anis.', 'Apple slice and the star anise.'),
   ('Sirva em vidro: a cor rubi é metade da experiência. Uma taça de vinho pré-aquecida com água quente fica impecável.', 'Serve in glass: the ruby colour is half the experience. A wine glass pre-warmed with hot water looks impeccable.')),
 R(23, ('Sorrel Caribenho', 'Caribbean Sorrel'), ('Hibisco, gengibre e canela: tradição natalina da Jamaica.', 'Hibiscus, ginger and cinnamon: a Jamaican Christmas tradition.'), False, '10 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('1 c. sopa', '1 tbsp', 'flor de hibisco', 'dried hibiscus flowers'), ('1 c. chá', '1 tsp', 'gengibre ralado', 'grated ginger'), ('1 pau pequeno', '1 small stick', 'canela em casca', 'cinnamon stick'), ('1 c. sopa', '1 tbsp', 'mel', 'honey')],
   [('Ferva o gengibre e a canela na água por 3 min.', 'Simmer the ginger and cinnamon in the water for 3 min.'),
    ('Desligue, junte o hibisco e infunda 4 min.', 'Turn off, add the hibiscus and steep 4 min.'),
    ('Coe com peneira fina e adoce.', 'Strain through a fine sieve and sweeten.')],
   ('Pau de canela como mexedor.', 'Cinnamon stick as a stirrer.'),
   ('Na Jamaica essa combinação se chama "sorrel" e é servida no Natal. Gelada no dia seguinte, fica ainda melhor.', 'In Jamaica this combination is called "sorrel" and served at Christmas. Chilled the next day, it is even better.')),
 R(24, ('Rosehip Cherry & Maçã Caramelizada', 'Rosehip Cherry & Caramelised Apple'), ('Fruta vermelha ácida sobre maçã em calda de mel.', 'Tart red fruit over apple in honey syrup.'), False, '10 min', CUP, False, 'mid',
   [('250 ml', '250 ml', 'água', 'water'), ('1 sachê', '1 bag', 'rosehip, hibiscus & cherry', 'rosehip, hibiscus & cherry'), ('¼ un.', '¼', 'maçã em cubos pequenos', 'apple, small dice'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('1 pitada', '1 pinch', 'canela em pó', 'ground cinnamon')],
   [('Numa panelinha, caramelize a maçã com o mel por 3 min, fogo médio.', 'In a small pan, caramelise the apple with the honey for 3 min over medium heat.'),
    ('Junte a água e deixe ferver 1 min.', 'Add the water and let it boil for 1 min.'),
    ('Desligue, junte o sachê e infunda 5 min.', 'Turn off, add the bag and steep 5 min.'),
    ('Sirva com os cubos de maçã na xícara e canela por cima.', 'Serve with the apple cubes in the cup and cinnamon on top.')],
   ('Cubos de maçã e colher no pires.', 'Apple cubes, with a spoon on the saucer.'),
   ('Sirva com uma colherzinha: os cubos de maçã ao final são parte da bebida.', 'Serve with a little spoon: the apple cubes at the end are part of the drink.')),
 R(25, ('Rubi Mentolado', 'Minted Ruby'), ('Hibisco ácido com frescor de hortelã.', 'Tart hibiscus with the freshness of mint.'), False, '6 min', CUP, False, 'easy',
   [('250 ml', '250 ml', 'água fervente', 'boiling water'), ('1 sachê', '1 bag', 'chá de hibisco', 'hibiscus tea'), ('1 sachê', '1 bag', 'chá de hortelã', 'mint tea'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('1 rodela', '1 wheel', 'limão', 'lime')],
   [('Infunda os dois sachês por 4 min.', 'Steep both bags for 4 min.'),
    ('Retire sem espremer, adoce.', 'Remove without squeezing and sweeten.'),
    ('Finalize com a rodela de limão.', 'Finish with the lime wheel.')],
   ('Rodela de limão.', 'Lime wheel.'),
   ('O mentol "resfria" a percepção da acidez: o hibisco fica mais macio do que realmente é.', 'Menthol "cools" the perception of acidity: the hibiscus tastes softer than it really is.')),
 R(26, ('Água Fresca de Hibisco', 'Hibiscus Agua Fresca'), ('A "agua de jamaica" mexicana: vibrante, ácida e muito refrescante.', 'Mexican "agua de jamaica": vibrant, tart and very refreshing.'), True, '15 min', ('2 copos · 500 ml', '2 glasses · 500 ml'), False, 'easy',
   [('2 c. sopa', '2 tbsp', 'flor de hibisco', 'dried hibiscus flowers'), ('250 ml', '250 ml', 'água fervente', 'boiling water'), ('250 ml', '250 ml', 'água gelada', 'ice-cold water'), ('3 c. sopa', '3 tbsp', 'mel', 'honey'), ('1 un.', '1', 'limão (suco)', 'lime (juice)'), ('a gosto', 'to taste', 'gelo e lâminas de maçã', 'ice and apple slices')],
   [('Infunda o hibisco na água fervente por 5 min. Coe.', 'Steep the hibiscus in the boiling water for 5 min. Strain.'),
    ('Dissolva o mel ainda quente.', 'Dissolve the honey while hot.'),
    ('Complete com a água gelada e o suco de limão.', 'Top up with the ice-cold water and lime juice.'),
    ('Sirva sobre gelo com lâminas de maçã.', 'Serve over ice with apple slices.')],
   ('Lâminas de maçã e cubos de hibisco.', 'Apple slices and hibiscus ice cubes.'),
   ('Congele parte da bebida em forminha de gelo: cubos de hibisco esfriam sem diluir.', 'Freeze some of the drink in an ice tray: hibiscus cubes chill without diluting.')),
 R(27, ('Rosa do Deserto', 'Desert Rose'), ('Hibisco arredondado por notas de capim-cidreira.', 'Hibiscus rounded off by lemongrass notes.'), False, '6 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água fervente', 'boiling water'), ('1 c. chá', '1 tsp', 'flor de hibisco', 'dried hibiscus flowers'), ('1 c. sopa', '1 tbsp', 'capim-cidreira seco', 'dried lemongrass'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Despeje a água sobre o hibisco e o capim-cidreira.', 'Pour the water over the hibiscus and lemongrass.'),
    ('Infunda 4 min.', 'Steep 4 min.'),
    ('Coe e adoce.', 'Strain and sweeten.')],
   ('Uma folha de capim-cidreira dobrada sobre a xícara.', 'A folded lemongrass leaf across the cup.'),
   ('Pouco hibisco aqui é intencional: ele dá cor e acidez, o capim-cidreira é quem conduz o aroma.', 'Little hibiscus here is intentional: it brings colour and acidity, while lemongrass leads the aroma.')),
 R(28, ('Rosé da Tarde', 'Afternoon Rosé'), ('Rosado suave: fruta vermelha e floral de camomila.', 'Soft pink: red fruit and chamomile florals.'), False, '7 min', CUP, False, 'easy',
   [('280 ml', '280 ml', 'água', 'water'), ('1 sachê', '1 bag', 'rosehip, hibiscus & cherry', 'rosehip, hibiscus & cherry'), ('1 c. sopa', '1 tbsp', 'flores de camomila', 'chamomile flowers'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Ferva a água, desligue e aguarde 1 min.', 'Boil the water, turn off and wait 1 min.'),
    ('Infunda o sachê e a camomila por 5 min, tampado.', 'Steep the bag and chamomile for 5 min, covered.'),
    ('Coe e adoce.', 'Strain and sweeten.')],
   ('Flores de camomila na superfície.', 'Chamomile flowers on the surface.'),
   ('A camomila amacia o frutado e deixa a cor num tom rosé, mais claro que o hibisco puro.', 'Chamomile softens the fruit and turns the colour rosé, lighter than pure hibiscus.')),
 # ---------------- V · Especiarias & tônicos
 R(29, ('Elixir de Gengibre, Limão & Mel', 'Ginger, Lime & Honey Elixir'), ('O clássico tônico: picante, cítrico e meloso.', 'The classic tonic: spicy, citrusy and honeyed.'), False, '9 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('1 c. sopa', '1 tbsp', 'gengibre ralado', 'grated ginger'), ('½ un.', '½', 'limão (suco)', 'lime (juice)'), ('1 c. sopa', '1 tbsp', 'mel', 'honey'), ('1 rodela', '1 wheel', 'limão', 'lime')],
   [('Ferva o gengibre na água por 5 min: quanto mais tempo, mais picante.', 'Simmer the ginger in the water for 5 min: the longer, the spicier.'),
    ('Coe com peneira fina e aguarde 2 min.', 'Strain through a fine sieve and wait 2 min.'),
    ('Junte o mel e o suco de limão.', 'Add the honey and lime juice.'),
    ('Finalize com a rodela.', 'Finish with the wheel.')],
   ('Rodela de limão.', 'Lime wheel.'),
   ('Rale o gengibre com casca, bem lavado: ela também tem aroma. E adoce morno: mel em água fervente perde perfume.', 'Grate the ginger skin-on, well washed: the skin carries aroma too. And sweeten when warm: honey in boiling water loses its perfume.')),
 R(30, ('Cidra Quente sem Álcool', 'Alcohol-free Hot Cider'), ('Maçã cozida, canela e anis: puro fruto e especiaria.', 'Stewed apple, cinnamon and anise: pure fruit and spice.'), False, '25 min', ('2 xícaras · 400 ml', '2 cups · 400 ml'), False, 'mid',
   [('500 ml', '500 ml', 'água', 'water'), ('1 un.', '1', 'maçã em cubos', 'apple, diced'), ('2 paus', '2 sticks', 'canela em casca', 'cinnamon sticks'), ('1 un.', '1', 'anis-estrelado', 'star anise'), ('2 tiras', '2 strips', 'casca de limão', 'lime peel'), ('2 c. sopa', '2 tbsp', 'mel', 'honey')],
   [('Ferva tudo, exceto o mel, em fogo baixo e tampado por 15 min.', 'Simmer everything except the honey, covered, over low heat for 15 min.'),
    ('Amasse levemente a maçã com um garfo e cozinhe mais 5 min.', 'Lightly mash the apple with a fork and cook 5 more min.'),
    ('Coe pressionando bem.', 'Strain, pressing well.'),
    ('Adoce.', 'Sweeten.')],
   ('Pau de canela e lâmina de maçã.', 'Cinnamon stick and an apple slice.'),
   ('Ótima base: acrescente um sachê de chá preto ou rooibos nos últimos 4 min para uma versão "reforçada".', 'A great base: add a black tea or rooibos bag in the last 4 min for a "fortified" version.')),
 R(31, ('Tisana das Estrelas', 'Star Tisane'), ('Anis e canela puros: doce, quente, aromático.', 'Pure anise and cinnamon: sweet, warm, aromatic.'), False, '9 min', CUP, False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('2 un.', '2', 'anis-estrelado', 'star anise'), ('1 pau', '1 stick', 'canela em casca', 'cinnamon stick'), ('1 tira', '1 strip', 'casca de limão', 'lime peel'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Toste o anis e a canela na panela seca por 30 s.', 'Toast the anise and cinnamon in the dry pan for 30 s.'),
    ('Junte a água e a casca de limão e ferva 6 min, tampado.', 'Add the water and lime peel and simmer 6 min, covered.'),
    ('Coe e adoce.', 'Strain and sweeten.')],
   ('As duas estrelas de anis no pires.', 'Both anise stars on the saucer.'),
   ('Especiaria inteira precisa de fervura, não de infusão. Água quente apenas despejada extrai muito pouco.', 'Whole spices need simmering, not steeping. Hot water simply poured over extracts very little.')),
 R(32, ('Fogo & Gelo', 'Fire & Ice'), ('Gengibre e hortelã se alternando a cada gole.', 'Ginger and mint taking turns with every sip.'), False, '9 min', CUP, False, 'easy',
   [('280 ml', '280 ml', 'água', 'water'), ('4 lâminas', '4 slices', 'gengibre', 'ginger'), ('1 sachê', '1 bag', 'chá de hortelã', 'mint tea'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Ferva o gengibre na água por 4 min.', 'Simmer the ginger in the water for 4 min.'),
    ('Desligue, junte a hortelã e infunda 4 min.', 'Turn off, add the mint and steep 4 min.'),
    ('Retire o sachê, coe e adoce.', 'Remove the bag, strain and sweeten.')],
   ('Lâmina de gengibre na borda.', 'Ginger slice on the rim.'),
   ('O mentol ativa receptores de frio e o gengibre, de calor. É um contraste sensorial real, não só de sabor.', 'Menthol triggers cold receptors and ginger triggers heat receptors. It is a real sensory contrast, not just flavour.')),
 R(33, ('Tônico Gelado de Gengibre', 'Iced Ginger Tonic'), ('Um ginger ale sem gás: picante, cítrico, refrescante.', 'A still ginger ale: spicy, citrusy, refreshing.'), True, '15 min', ('2 copos · 500 ml', '2 glasses · 500 ml'), False, 'easy',
   [('300 ml', '300 ml', 'água', 'water'), ('2 c. sopa', '2 tbsp', 'gengibre ralado', 'grated ginger'), ('3 c. sopa', '3 tbsp', 'mel', 'honey'), ('1 un.', '1', 'limão (suco)', 'lime (juice)'), ('200 ml', '200 ml', 'água gelada', 'ice-cold water'), ('a gosto', 'to taste', 'gelo', 'ice')],
   [('Ferva o gengibre na água por 8 min. Coe com peneira fina.', 'Simmer the ginger in the water for 8 min. Strain through a fine sieve.'),
    ('Dissolva o mel e deixe esfriar.', 'Dissolve the honey and let it cool.'),
    ('Junte o suco de limão e a água gelada.', 'Add the lime juice and ice-cold water.'),
    ('Sirva sobre gelo.', 'Serve over ice.')],
   ('Rodela de limão e lâmina de gengibre.', 'Lime wheel and a ginger slice.'),
   ('O concentrado (antes da água gelada) dura até 4 dias na geladeira. Misture também com chá preto gelado.', 'The concentrate (before the cold water) keeps up to 4 days in the fridge. Try it with iced black tea too.')),
 R(34, ('Pomar Cítrico', 'Citrus Orchard'), ('Maçã, gengibre e capim-cidreira em camadas.', 'Apple, ginger and lemongrass in layers.'), False, '12 min', ('1 xícara · 300 ml', '1 cup · 300 ml'), False, 'easy',
   [('350 ml', '350 ml', 'água', 'water'), ('¼ un.', '¼', 'maçã em lâminas', 'apple, sliced'), ('3 lâminas', '3 slices', 'gengibre', 'ginger'), ('1½ c. sopa', '1½ tbsp', 'capim-cidreira seco', 'dried lemongrass'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Ferva a maçã e o gengibre na água por 5 min.', 'Simmer the apple and ginger in the water for 5 min.'),
    ('Desligue, junte o capim-cidreira e infunda 5 min, tampado.', 'Turn off, add the lemongrass and steep 5 min, covered.'),
    ('Coe e adoce.', 'Strain and sweeten.')],
   ('Lâmina de maçã.', 'Apple slice.'),
   ('Camadas por tempo de extração: primeiro o que precisa ferver (raiz e fruta), depois o que é delicado (folha).', 'Layer by extraction time: first what needs simmering (root and fruit), then what is delicate (leaf).')),
 # ---------------- VI · Cremosos
 R(35, ('Chai de Panela', 'Stovetop Chai'), ('Chá preto forte, especiarias inteiras e leite cremoso.', 'Strong black tea, whole spices and creamy milk.'), False, '12 min', ('1 caneca · 280 ml', '1 mug · 280 ml'), True, 'mid',
   [('150 ml', '150 ml', 'água', 'water'), ('2 sachês', '2 bags', 'chá preto', 'black tea'), ('1 pau', '1 stick', 'canela em casca', 'cinnamon stick'), ('1 un.', '1', 'anis-estrelado', 'star anise'), ('1 c. chá', '1 tsp', 'gengibre ralado', 'grated ginger'), ('150 ml', '150 ml', 'leite integral', 'whole milk'), ('1½ c. sopa', '1½ tbsp', 'mel', 'honey')],
   [('Ferva a água com canela, anis e gengibre por 5 min.', 'Simmer the water with cinnamon, anise and ginger for 5 min.'),
    ('Junte os sachês e mantenha em fervura baixa por 3 min.', 'Add the bags and keep at a low simmer for 3 min.'),
    ('Adicione o leite e aqueça até surgirem bolhinhas nas bordas, sem ferver.', 'Add the milk and heat until tiny bubbles appear at the edges, without boiling.'),
    ('Coe, adoce e puxe entre duas canecas 4 a 5 vezes.', 'Strain, sweeten and pull between two mugs 4 to 5 times.')],
   ('Canela em pó sobre a espuma.', 'Ground cinnamon over the foam.'),
   ('Dois sachês, não um: o leite "apaga" o chá. A força tem que vir da base.', 'Two bags, not one: milk "mutes" the tea. The strength must come from the base.'), milk=True),
 R(36, ('Teh Tarik do Sul', 'Southern Teh Tarik'), ('O "chá puxado" da Malásia: espumoso, sedoso, intenso.', 'Malaysia’s "pulled tea": frothy, silky, intense.'), False, '10 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), True, 'adv',
   [('2 sachês', '2 bags', 'chá preto', 'black tea'), ('150 ml', '150 ml', 'água fervente', 'boiling water'), ('120 ml', '120 ml', 'leite integral', 'whole milk'), ('1½ c. sopa', '1½ tbsp', 'mel', 'honey')],
   [('Infunda os sachês na água por 5 min: concentrado forte. Retire.', 'Steep the bags in the water for 5 min: a strong concentrate. Remove.'),
    ('Aqueça o leite com o mel até fumegar.', 'Heat the milk with the honey until steaming.'),
    ('Junte chá e leite em uma caneca.', 'Combine tea and milk in one mug.'),
    ('Verta para outra caneca, cada vez de mais alto (até 30 a 40 cm), 6 a 8 vezes. A espuma se forma pela aeração.', 'Pour into another mug, from higher each time (up to 30 to 40 cm), 6 to 8 times. The foam forms through aeration.')],
   ('A própria espuma, sem nada por cima.', 'The foam itself, nothing on top.'),
   ('Comece baixo e suba aos poucos. Use canecas com alça, sobre a pia, e mantenha a caneca de baixo inclinada.', 'Start low and rise gradually. Use mugs with handles, over the sink, and keep the lower mug tilted.'), milk=True),
 R(37, ('Rooibos Moon Latte', 'Rooibos Moon Latte'), ('Latte sem cafeína: madeira, mel e baunilha.', 'A caffeine-free latte: wood, honey and vanilla.'), False, '10 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), False, 'mid',
   [('150 ml', '150 ml', 'água', 'water'), ('2 porções', '2 servings', 'rooibos moon', 'rooibos moon'), ('150 ml', '150 ml', 'leite integral', 'whole milk'), ('1 c. sopa', '1 tbsp', 'mel', 'honey'), ('1 pitada', '1 pinch', 'canela em pó', 'ground cinnamon')],
   [('Ferva o rooibos na água em fogo baixo por 5 min (concentrado).', 'Simmer the rooibos in the water over low heat for 5 min (concentrate).'),
    ('Aqueça o leite com o mel, sem ferver.', 'Heat the milk with the honey, without boiling.'),
    ('Coe o rooibos na caneca e junte o leite.', 'Strain the rooibos into the mug and add the milk.'),
    ('Puxe 4 a 5 vezes e polvilhe a canela.', 'Pull 4 to 5 times and dust with cinnamon.')],
   ('Canela em pó em meia-lua sobre a espuma.', 'A half-moon of ground cinnamon on the foam.'),
   ('Rooibos é o "espresso" dos lattes sem cafeína: aguenta concentração alta e fervura sem amargar.', 'Rooibos is the "espresso" of caffeine-free lattes: it handles high concentration and simmering without bitterness.'), milk=True),
 R(38, ('Leite Lunar de Camomila', 'Chamomile Moon Milk'), ('Camomila infundida direto no leite: floral e aveludado.', 'Chamomile steeped straight into milk: floral and velvety.'), False, '10 min', ('1 caneca · 220 ml', '1 mug · 220 ml'), False, 'easy',
   [('200 ml', '200 ml', 'leite integral', 'whole milk'), ('50 ml', '50 ml', 'água', 'water'), ('2 c. sopa', '2 tbsp', 'flores de camomila', 'chamomile flowers'), ('1 un.', '1', 'anis-estrelado (opcional)', 'star anise (optional)'), ('1 c. chá', '1 tsp', 'mel', 'honey'), ('1 pitada', '1 pinch', 'canela em pó', 'ground cinnamon')],
   [('Aqueça o leite com a água até fumegar e desligue.', 'Heat the milk with the water until steaming and turn off.'),
    ('Junte a camomila (e o anis) e infunda 6 min, tampado.', 'Add the chamomile (and anise) and steep 6 min, covered.'),
    ('Coe com peneira fina, pressionando as flores.', 'Strain through a fine sieve, pressing the flowers.'),
    ('Adoce, reaqueça se preciso e polvilhe a canela.', 'Sweeten, reheat if needed and dust with cinnamon.')],
   ('Canela em pó e uma flor de camomila.', 'Ground cinnamon and one chamomile flower.'),
   ('A gordura do leite integral captura os aromas da camomila de forma diferente da água: o resultado é mais redondo.', 'The fat in whole milk captures chamomile’s aromas differently from water: the result is rounder.'), milk=True),
 R(39, ('Névoa de Capim-Cidreira', 'Lemongrass Fog'), ('Um London Fog tropical: chá preto, capim e leite.', 'A tropical London Fog: black tea, lemongrass and milk.'), False, '9 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), True, 'mid',
   [('150 ml', '150 ml', 'água fervente', 'boiling water'), ('1 sachê', '1 bag', 'chá preto', 'black tea'), ('1½ c. sopa', '1½ tbsp', 'capim-cidreira seco', 'dried lemongrass'), ('120 ml', '120 ml', 'leite integral', 'whole milk'), ('1 c. sopa', '1 tbsp', 'mel', 'honey')],
   [('Infunda o capim-cidreira e o chá preto por 4 min. Coe.', 'Steep the lemongrass and black tea for 4 min. Strain.'),
    ('Aqueça o leite com o mel sem ferver.', 'Heat the milk with the honey without boiling.'),
    ('Junte ao chá e puxe 4 a 5 vezes entre duas canecas.', 'Add to the tea and pull 4 to 5 times between two mugs.')],
   ('A espuma lisa, sem guarnição.', 'Smooth foam, no garnish.'),
   ('Nunca use limão aqui: ácido mais leite talha. O capim-cidreira entrega o cítrico sem acidez.', 'Never use lime here: acid plus milk curdles. Lemongrass brings citrus without acidity.'), milk=True),
 R(40, ('Torta de Maçã Cremosa', 'Creamy Apple Pie'), ('Maçã caramelizada, rooibos e leite: sobremesa na caneca.', 'Caramelised apple, rooibos and milk: dessert in a mug.'), False, '14 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), False, 'mid',
   [('¼ un.', '¼', 'maçã em cubos pequenos', 'apple, small dice'), ('1 c. sopa', '1 tbsp', 'mel', 'honey'), ('120 ml', '120 ml', 'água', 'water'), ('1 pau', '1 stick', 'canela em casca', 'cinnamon stick'), ('1 porção', '1 serving', 'rooibos moon', 'rooibos moon'), ('150 ml', '150 ml', 'leite integral', 'whole milk'), ('1 pitada', '1 pinch', 'canela em pó', 'ground cinnamon')],
   [('Caramelize a maçã com o mel por 2 min. Junte a água e a canela e ferva 4 min.', 'Caramelise the apple with the honey for 2 min. Add the water and cinnamon and simmer 4 min.'),
    ('Desligue, junte o rooibos e infunda 5 min.', 'Turn off, add the rooibos and steep 5 min.'),
    ('Coe, junte o leite aquecido sem ferver.', 'Strain and add the milk, warmed without boiling.'),
    ('Puxe 4 a 5 vezes e finalize com canela em pó.', 'Pull 4 to 5 times and finish with ground cinnamon.')],
   ('Cubos de maçã caramelizada e canela.', 'Caramelised apple cubes and cinnamon.'),
   ('Reserve alguns cubos de maçã caramelizada para colocar sobre a espuma, como cobertura.', 'Save a few caramelised apple cubes to place on the foam as a topping.'), milk=True),
]
BY = {r['n']: r for r in RECIPES}

CHAPTERS = [
    ('I', ('Chá Preto', 'Black Tea'), ('Corpo & Estrutura', 'Body & Structure'), range(1, 8),
     ('O chá preto é a espinha dorsal dos blends clássicos: taninos firmes, notas de malte e madeira que sustentam especiarias, frutas e cítricos. Aqui ele é tratado como um espresso: base concentrada que recebe camadas aromáticas.',
      'Black tea is the backbone of classic blends: firm tannins and notes of malt and wood that carry spices, fruit and citrus. Here it is treated like an espresso: a concentrated base that takes aromatic layers.')),
    ('II', ('Rooibos Moon', 'Rooibos Moon'), ('Âmbar & Doçura', 'Amber & Sweetness'), range(8, 15),
     ('O rooibos é naturalmente sem cafeína, adocicado e amadeirado, com notas de baunilha e mel. Não amarga com infusões longas, o que o torna perfeito para concentrar, misturar com frutas e servir à noite.',
      'Rooibos is naturally caffeine-free, sweetish and woody, with notes of vanilla and honey. It does not turn bitter with long steeps, which makes it perfect for concentrating, pairing with fruit and serving at night.')),
    ('III', ('Florais & Ervas', 'Florals & Herbs'), ('Calma & Perfume', 'Calm & Fragrance'), range(15, 22),
     ('Camomila, capim-cidreira, hortelã e erva-doce formam a família das tisanas: sem cafeína, aromáticas e delicadas. São bebidas de temperatura mais gentil e tempo curto, em que o perfume é o protagonista.',
      'Chamomile, lemongrass, mint and fennel make up the tisane family: caffeine-free, aromatic and delicate. These drinks want gentler heat and shorter times, and fragrance is the star.')),
    ('IV', ('Hibisco & Frutos', 'Hibiscus & Fruit'), ('Rubi & Acidez', 'Ruby & Acidity'), range(22, 29),
     ('Hibisco e rosa-mosqueta trazem acidez vibrante e cor intensa. O trabalho do barista aqui é equilibrar: mel e maçã arredondam, especiarias aquecem, ervas refrescam. São as bebidas mais bonitas do guia.',
      'Hibiscus and rosehip bring vibrant acidity and intense colour. The barista’s job here is balance: honey and apple round off, spices warm, herbs refresh. These are the most beautiful drinks in the guide.')),
    ('V', ('Especiarias & Tônicos', 'Spices & Tonics'), ('Calor & Raiz', 'Warmth & Root'), range(29, 35),
     ('Gengibre, canela e anis-estrelado são ingredientes de decocção: precisam ferver para entregar tudo o que têm. Este capítulo reúne elixires, tisanas puras de especiaria e bebidas que dispensam chá, em que fruto e raiz são as estrelas.',
      'Ginger, cinnamon and star anise are decoction ingredients: they need simmering to give everything they have. This chapter gathers elixirs, pure spice tisanes and tea-free drinks where fruit and root are the stars.')),
    ('VI', ('Cremosos', 'Creamy'), ('Leite & Conforto', 'Milk & Comfort'), range(35, 41),
     ('Seis receitas com leite integral, 15% do guia. Sem vaporizador nem batedor, a espuma vem da técnica de "puxar" a bebida entre duas canecas. O segredo de todas: uma base concentrada, porque o leite suaviza tudo o que encontra.',
      'Six recipes with whole milk, 15% of the guide. With no steamer or whisk, the foam comes from "pulling" the drink between two mugs. The secret to all of them: a concentrated base, because milk softens everything it meets.')),
]


def pantry(lang):
    items = [
        (('Rooibos moon', 'Rooibos moon'), ('Base sem cafeína, doce e amadeirada. Aguenta fervura e tempo longo.', 'Caffeine-free base, sweet and woody. Handles boiling and long steeps.')),
        (('Chá preto', 'Black tea'), ('Estrutura, malte e taninos. Infusão curta: 3 a 4 min.', 'Structure, malt and tannins. Short steep: 3 to 4 min.')),
        (('Camomila (flores)', 'Chamomile (flowers)'), ('Floral e meloso. Água a ≈ 95 °C, sempre tampado.', 'Floral and honeyed. Water at ≈ 95 °C, always covered.')),
        (('Capim-cidreira', 'Lemongrass'), ('Cítrico sem acidez: o "limão" que combina com leite.', 'Citrus without acidity: the "lemon" that works with milk.')),
        (('Flor de hibisco', 'Hibiscus flowers'), ('Acidez e cor rubi. Extrai rápido: 2 a 5 min.', 'Acidity and ruby colour. Extracts fast: 2 to 5 min.')),
        (('Hibisco (sachê)', 'Hibiscus (bags)'), ('Versão prática e mais suave da flor.', 'A handy, milder version of the flower.')),
        (('Hortelã (sachê)', 'Mint (bags)'), ('Frescor mentolado; suaviza a percepção ácida.', 'Minty freshness; softens perceived acidity.')),
        (('Erva-doce (sachê)', 'Fennel (bags)'), ('Doçura natural, notas de alcaçuz. Digestiva.', 'Natural sweetness, liquorice notes. After-meal friendly.')),
        (('Rosehip, hibiscus & cherry', 'Rosehip, hibiscus & cherry'), ('Frutado ácido pronto, ótimo para camadas.', 'Ready-made tart fruit, great for layering.')),
        (('Camomile & lemongrass', 'Camomile & lemongrass'), ('Blend floral-cítrico pronto.', 'Ready-made floral-citrus blend.')),
        (('Anis-estrelado', 'Star anise'), ('Alcaçuz e doçura. Decocção: precisa ferver.', 'Liquorice and sweetness. Decoction: needs simmering.')),
        (('Canela em casca', 'Cinnamon sticks'), ('Madeira doce. Ferva para extrair; vira mexedor.', 'Sweet wood. Simmer to extract; doubles as a stirrer.')),
        (('Canela em pó', 'Ground cinnamon'), ('Finalização aromática sobre a bebida.', 'Aromatic finish on top of the drink.')),
        (('Gengibre (raiz)', 'Ginger (root)'), ('Calor e picância. Lâmina = limpo; ralado = intenso.', 'Warmth and heat. Sliced = clean; grated = intense.')),
        (('Mel', 'Honey'), ('Adoça e arredonda. Junte sempre fora da fervura.', 'Sweetens and rounds. Always add off the boil.')),
        (('Limão tahiti', 'Lime'), ('Casca = aroma; suco = acidez. Sempre no fim.', 'Peel = aroma; juice = acidity. Always last.')),
        (('Maçã', 'Apple'), ('Doçura e corpo. Crua, cozida, tostada ou caramelizada.', 'Sweetness and body. Raw, stewed, toasted or caramelised.')),
        (('Leite integral', 'Whole milk'), ('Corpo e cremosidade. Nunca ferver, nunca com ácido.', 'Body and creaminess. Never boil, never with acid.')),
    ]
    cells = ''.join(f'<div style="border-bottom:.3pt solid var(--line);padding:1.8mm 0"><b style="font:500 11.5pt EBG">{esc(tr(a, lang))}</b><br><span style="font-size:8.8pt;color:var(--muted)">{esc(tr(b, lang))}</span></div>' for a, b in items)
    pairs = [('Chá preto + canela + anis', 'Black tea + cinnamon + anise'), ('Rooibos + maçã', 'Rooibos + apple'), ('Camomila + mel + limão', 'Chamomile + honey + lime'), ('Hibisco + gengibre', 'Hibiscus + ginger'), ('Capim-cidreira + hortelã', 'Lemongrass + mint'), ('Rooibos + camomila', 'Rooibos + chamomile'), ('Erva-doce + anis', 'Fennel + anise'), ('Chá preto + leite + especiarias', 'Black tea + milk + spices')]
    avoid = [('Leite + limão', 'Milk + lime'), ('Leite + hibisco', 'Milk + hibiscus'), ('Mel em água fervente', 'Honey in boiling water'), ('Espremer sachês', 'Squeezing bags'), ('Chá preto por mais de 5 min', 'Black tea for more than 5 min')]
    chip = lambda xs: '<div class="chips">' + ''.join(f'<span class="chip">{esc(tr(x, lang))}</span>' for x in xs) + '</div>'
    return f'<div class="grid2" style="gap:0 9mm">{cells}</div><h4>{tr(("Pares que funcionam", "Pairings that work"), lang)}</h4>{chip(pairs)}<h4>{tr(("Evite", "Avoid"), lang)}</h4>{chip(avoid)}'


def quick(lang):
    groups = [
        (('Manhã com energia', 'Energising morning'), ('Com cafeína, estruturados', 'Caffeinated and structured'), [1, 2, 3, 4, 5, 7, 35, 36, 39]),
        (('Noite tranquila', 'Quiet night'), ('Sem cafeína e acolhedores', 'Caffeine-free and comforting'), [14, 15, 19, 20, 38, 40]),
        (('Dias quentes', 'Hot days'), ('Servidos com gelo', 'Served over ice'), [6, 13, 26, 33]),
        (('Para receber', 'For guests'), ('Bonitos e para mais pessoas', 'Beautiful and for a crowd'), [22, 30, 26, 9, 36]),
        (('Depois do jantar', 'After dinner'), ('Digestivos e leves', 'Light and digestive'), [7, 21, 18, 31]),
        (('Para aquecer', 'To warm up'), ('Gengibre e especiarias', 'Ginger and spices'), [3, 11, 23, 29, 32]),
    ]
    pg = recipe_pages()
    out = ''
    for (t, s, ns) in groups:
        rows = ''.join(f'<div style="display:grid;grid-template-columns:8mm 1fr 8mm;padding:1.1mm 0;border-bottom:.3pt dotted var(--line);font-size:9.4pt"><span style="color:var(--gold3)">{n:02d}</span><span>{esc(tr(BY[n]["name"], lang))}</span><span style="text-align:right;color:var(--gold3)">{pg[n]}</span></div>' for n in ns)
        out += f'<div><h3 style="margin:0">{esc(tr(t, lang))}</h3><div style="font:italic 400 10pt EBG;color:var(--muted);margin-bottom:2mm">{esc(tr(s, lang))}</div>{rows}</div>'
    return f'<div class="grid2" style="gap:8mm 10mm">{out}</div>'


_PAGES = None


def recipe_pages():
    """Número da página de cada receita (calculado a partir da estrutura)."""
    m = {}
    for p in build_pages():
        if p['type'] == 'recipes':
            for r in p['items']:
                m[r['n']] = p['_n']
    return m


def ginger_ruler(lang):
    t = table([('Corte', 'Cut'), ('Fervura', 'Simmer'), ('Picância', 'Heat')],
              [[('Lâminas finas', 'Thin slices'), '3 min', ('Suave', 'Mild')], [('Lâminas finas', 'Thin slices'), '6 min', ('Média', 'Medium')],
               [('Ralado', 'Grated'), '5 min', ('Intensa', 'Intense')], [('Ralado', 'Grated'), '10 min', ('Muito intensa', 'Very intense')]])(lang)
    return (f'<h3>{tr(("Régua de picância do gengibre", "Ginger heat ruler"), lang)}</h3><p>{tr(("Para 250 ml de água, com 1 c. sopa de gengibre fresco. Use esta régua para ajustar qualquer receita do capítulo ao seu gosto.", "For 250 ml of water with 1 tbsp fresh ginger. Use this ruler to adjust any recipe in the chapter to your taste."), lang)}</p>' + t +
            f'<div class="grid2"><div><h4>{tr(("Por que ferver?", "Why simmer?"), lang)}</h4><p>{tr(("Os compostos picantes do gengibre (gingeróis) são liberados com calor contínuo. Água quente apenas despejada extrai pouco; a fervura extrai de verdade.", "Ginger’s pungent compounds (gingerols) are released by sustained heat. Hot water simply poured over extracts little; simmering extracts for real."), lang)}</p></div>'
            f'<div><h4>{tr(("Para amaciar", "To soften"), lang)}</h4><p>{tr(("Exagerou? Mel e maçã arredondam a picância. Leite também, mas gengibre muito fresco pode talhar leite se ferver junto por muito tempo: junte o leite só no fim.", "Overdid it? Honey and apple round off the heat. Milk does too, but very fresh ginger can curdle milk if simmered together for long: add milk only at the end."), lang)}</p></div></div>')


def foam(lang):
    steps = [(('Duas canecas', 'Two mugs'), ('Use canecas com alça, de preferência de boca larga. Trabalhe sobre a pia.', 'Use mugs with handles, ideally wide-mouthed. Work over the sink.')),
             (('Temperatura', 'Temperature'), ('Leite quente, fumegando, mas sem ferver (≈ 65 a 70 °C). Fervido não espuma bem e ganha gosto de cozido.', 'Hot, steaming milk, but not boiling (≈ 65 to 70 °C). Boiled milk foams poorly and tastes cooked.')),
             (('Comece baixo', 'Start low'), ('Verta de uma caneca para a outra a uns 10 cm, deixando o fio cair no centro.', 'Pour from one mug to the other at about 10 cm, letting the stream fall in the centre.')),
             (('Suba aos poucos', 'Rise gradually'), ('A cada passagem, afaste mais as canecas, até 30 a 40 cm. 6 a 8 passagens formam espuma leve.', 'With each pass, move the mugs further apart, up to 30 to 40 cm. 6 to 8 passes make a light foam.'))]
    cells = ''.join(f'<div><span style="font:italic 500 20pt EBG;color:var(--gold3)">{i + 1}</span><h4 style="margin-top:1mm">{esc(tr(a, lang))}</h4><p style="font-size:9.2pt">{esc(tr(b, lang))}</p></div>' for i, (a, b) in enumerate(steps))
    return (f'<h3>{tr(("Espuma sem equipamento", "Foam without equipment"), lang)}</h3><p>{tr(("A técnica de puxar o chá (como no teh tarik malaio) aera o leite sem vapor nem batedor.", "Pulling the tea (as in Malaysian teh tarik) aerates the milk with no steamer or whisk."), lang)}</p>'
            f'<div class="grid2" style="grid-template-columns:repeat(4,1fr);gap:5mm">{cells}</div>'
            + tip(('**Alternativa: pote com tampa.** Leite morno (não quente) até a metade de um pote de vidro, tampa bem fechada, envolva em um pano e agite por 30 s. Abra devagar, longe do rosto. Nunca use líquido muito quente em recipiente fechado.', '**Alternative: a lidded jar.** Warm (not hot) milk to half a glass jar, lid tightly closed, wrap in a cloth and shake for 30 s. Open slowly, away from your face. Never use very hot liquid in a closed container.'), ('Alternativa', 'Alternative'))(lang)
            + warn(('Leite não combina com ácido. Limão e hibisco talham o leite. Nos cremosos, o cítrico entra só por aroma (capim-cidreira, casca seca), nunca por suco.', 'Milk and acid do not mix. Lime and hibiscus curdle milk. In the creamy drinks, citrus comes in only as aroma (lemongrass, dried peel), never as juice.'))(lang))


def index(lang):
    ing = [('Rooibos moon', 'Rooibos moon'), ('Chá preto', 'Black tea'), ('Camomila (flores)', 'Chamomile (flowers)'), ('Capim-cidreira', 'Lemongrass'), ('Flor de hibisco', 'Hibiscus flowers'),
           ('Hibisco (sachê)', 'Hibiscus (bags)'), ('Hortelã (sachê)', 'Mint (bags)'), ('Erva-doce (sachê)', 'Fennel (bags)'), ('Rosehip, hibiscus & cherry', 'Rosehip, hibiscus & cherry'), ('Camomile & lemongrass', 'Camomile & lemongrass'),
           ('Anis-estrelado', 'Star anise'), ('Canela em casca', 'Cinnamon sticks'), ('Canela em pó', 'Ground cinnamon'), ('Gengibre', 'Ginger'), ('Limão', 'Lime'), ('Maçã', 'Apple'), ('Leite integral', 'Whole milk')]
    keys = ['rooibos moon', 'chá preto', 'camomila', 'capim-cidreira', 'flor de hibisco', 'chá de hibisco', 'hortelã', 'erva-doce', 'rosehip', 'camomile & lemongrass', 'anis', 'canela em casca', 'canela em pó', 'gengibre', 'limão', 'maçã', 'leite']
    rows = ''
    for (lab, k) in zip(ing, keys):
        ns = [r['n'] for r in RECIPES if any(k in i['pt'].lower() for _, i in r['ing'])]
        rows += f'<tr><td>{esc(tr(lab, lang))}</td><td style="font-size:8.4pt;color:var(--muted)">{len(ns)}</td><td style="font-size:8.4pt;letter-spacing:.04em">{" · ".join(f"{n:02d}" for n in ns)}</td></tr>'
    head = f'<thead><tr><th>{tr(("Ingrediente", "Ingredient"), lang)}</th><th>{tr(("Usos", "Uses"), lang)}</th><th>{tr(("Receitas", "Recipes"), lang)}</th></tr></thead>'
    return f'<table class="data compact">{head}<tbody>{rows}</tbody></table><p style="margin-top:3mm"><i>{tr(("Mel aparece em todas as 40 receitas, quase sempre opcional ou ajustável.", "Honey appears in all 40 recipes, almost always optional or adjustable."), lang)}</i></p>' + quote(('Depois de dominar as bases, troque uma camada por vez: outra fruta, outra especiaria, outro tempo. É assim que nascem as receitas da casa.', 'Once you master the bases, swap one layer at a time: another fruit, another spice, another time. That is how house recipes are born.'))(lang)


def build_pages():
    global _PAGES
    if _PAGES:
        return _PAGES
    P = [{'type': 'cover'},
         {'type': 'title', 'intro': [
             ('Este caderno reúne 40 receitas construídas exclusivamente com os ingredientes da sua despensa. Nenhuma pede equipamento especial: uma panela, uma peneira, um ralador e duas canecas bastam.', 'This book gathers 40 recipes built entirely from your pantry. None needs special equipment: a pan, a sieve, a grater and two mugs are enough.'),
             ('As receitas foram pensadas como um barista pensa um menu: cada bebida tem uma base (chá preto, rooibos, ervas ou especiarias), uma camada aromática (fruta, cítrico, flor) e um acabamento (mel, raspas, especiaria em pó). Entender essa estrutura é o que permite improvisar depois.', 'The recipes were designed the way a barista designs a menu: every drink has a base (black tea, rooibos, herbs or spices), an aromatic layer (fruit, citrus, flower) and a finish (honey, zest, ground spice). Understanding that structure is what lets you improvise later.'),
             ('A maioria é quente. Há 4 gelados para dias de calor e 6 cremosos com leite, todos adaptados para espumar sem vaporizador nem batedor. 30 das 40 receitas não têm cafeína.', 'Most are hot. There are 4 iced drinks for warm days and 6 creamy ones with milk, all adapted to foam without a steamer or whisk. 30 of the 40 recipes are caffeine-free.'),
             ('**Medidas:** 1 c. chá ≈ 5 ml · 1 c. sopa ≈ 15 ml · 1 xícara ≈ 250 ml · "1 porção de rooibos moon" = 1 sachê ou 1 c. sopa de folhas soltas.', '**Measures:** 1 tsp ≈ 5 ml · 1 tbsp ≈ 15 ml · 1 cup ≈ 250 ml · "1 serving of rooibos moon" = 1 bag or 1 tbsp loose leaf.')],
          'how': [(('Leia a técnica', 'Read the technique'), ('As páginas de temperatura e tempo valem para tudo. Dez minutos de leitura poupam muitas xícaras amargas.', 'The temperature and timing pages apply to everything. Ten minutes of reading saves many bitter cups.')),
                  (('Prepare as bases', 'Make the bases'), ('Xarope especiado e mel de gengibre duram semanas e aceleram o dia a dia.', 'Spiced syrup and ginger honey keep for weeks and speed up everyday brewing.')),
                  (('Ajuste ao paladar', 'Adjust to taste'), ('Mel e tempo de infusão são sugestões. Prove antes de adoçar.', 'Honey and steep times are suggestions. Taste before sweetening.'))],
          'colophon': ('© Botanora. Caderno de receitas · edição da casa. Uso pessoal; é proibida a redistribuição. Hibisco costuma ser desaconselhado na gestação; mel não deve ser oferecido a menores de 1 ano. Em caso de condição de saúde ou uso de medicamentos, confirme com um profissional.', '© Botanora. House recipe book. For personal use; redistribution is prohibited. Hibiscus is usually not advised in pregnancy; honey should not be given to children under 1 year. If you have a health condition or take medication, check with a professional.')},
         {'type': 'toc'},
         {'type': 'text', 'toc': ('A despensa', 'The pantry'), 'toc_key': '0', 'chapter': ('Capítulo zero', 'Chapter zero'), 'eyebrow': ('Capítulo zero', 'Chapter zero'), 'heading': ('A despensa', 'The pantry'),
          'lead': ('Dezoito ingredientes, cada um com um papel. Conhecer o comportamento de cada um na água é a base de todas as receitas.', 'Eighteen ingredients, each with a role. Knowing how each behaves in water is the foundation of every recipe.'), 'body': pantry},
         {'type': 'text', 'toc': ('Temperatura e tempo', 'Temperature and time'), 'toc_key': '·', 'eyebrow': ('Técnica', 'Technique'), 'heading': ('Temperatura e tempo, sem termômetro', 'Temperature and time, no thermometer'),
          'lead': ('Dois números definem uma boa xícara: quão quente está a água e quanto tempo ela trabalha. Sem termômetro, leia a panela.', 'Two numbers define a good cup: how hot the water is and how long it works. Without a thermometer, read the pan.'),
          'body': join(table([('Ponto da água', 'Water stage'), ('Temperatura', 'Temperature'), ('Use para', 'Use for')], [
              [('Fervura plena', 'Full boil'), '100 °C', ('Rooibos, ervas secas, hibisco, especiarias, gengibre', 'Rooibos, dried herbs, hibiscus, spices, ginger')],
              [('Descansada 30 s', 'Rested 30 s'), '≈ 95 °C', ('Chá preto', 'Black tea')],
              [('Descansada 1 min', 'Rested 1 min'), '≈ 90 a 95 °C', ('Camomila, rosehip, blends florais', 'Chamomile, rosehip, floral blends')],
              [('Fumegando', 'Steaming'), '≈ 65 a 70 °C', ('Leite, nunca ferver', 'Milk, never boil')],
              [('Morno', 'Warm'), '≈ 50 °C', ('Hora de juntar mel e limão', 'Time to add honey and lime')]]),
              h4(('Tempos de infusão', 'Steep times')),
              table([('Ingrediente', 'Ingredient'), ('Tempo', 'Time'), ('Observação', 'Note')], [
                  [('Chá preto', 'Black tea'), '3 a 4 min', ('Mais que 5 min amarga', 'More than 5 min turns bitter')], [('Rooibos', 'Rooibos'), '5 a 8 min', ('Não amarga, pode passar', 'Does not turn bitter')],
                  [('Camomila', 'Chamomile'), '5 a 6 min', ('Tampado', 'Covered')], [('Capim-cidreira', 'Lemongrass'), '5 min', ('Tampado', 'Covered')],
                  [('Hibisco (flor)', 'Hibiscus (flower)'), '2 a 5 min', ('Extrai muito rápido', 'Extracts very fast')], [('Sachês de ervas', 'Herb bags'), '4 a 5 min', ('Não espremer', 'Do not squeeze')],
                  [('Especiarias inteiras', 'Whole spices'), '4 a 6 min', ('Fervendo (decocção)', 'Simmering (decoction)')], [('Gengibre', 'Ginger'), '3 a 8 min', ('Fervendo; ver régua no capítulo V', 'Simmering; see ruler in chapter V')]], cls='data compact'),
              grid(2, lambda l: f'<div><h4>{tr(("Infusão", "Infusion"), l)}</h4><p style="font-size:9.2pt">{tr(("Água quente sobre o ingrediente, fogo desligado. Para folhas e flores: chá preto, camomila, capim-cidreira, hibisco, sachês.", "Hot water over the ingredient, heat off. For leaves and flowers: black tea, chamomile, lemongrass, hibiscus, bags."), l)}</p></div>',
                   lambda l: f'<div><h4>{tr(("Decocção", "Decoction"), l)}</h4><p style="font-size:9.2pt">{tr(("O ingrediente ferve na água. Para o que é duro: canela em casca, anis-estrelado, gengibre, maçã. Nas receitas mistas, a decocção vem primeiro e a infusão depois.", "The ingredient simmers in the water. For hard things: cinnamon sticks, star anise, ginger, apple. In mixed recipes, the decoction comes first and the infusion after."), l)}</p></div>'))},
         {'type': 'text', 'art': True, 'eyebrow': ('Técnica', 'Technique'), 'heading': ('Regras de ouro', 'Golden rules'),
          'body': join(bullets(('**Tampe as ervas.** Os aromas de camomila e capim-cidreira são voláteis e evaporam.', '**Cover the herbs.** Chamomile and lemongrass aromas are volatile and evaporate.'),
                               ('**Não esprema sachês.** O líquido final do sachê concentra taninos amargos.', '**Do not squeeze bags.** The last liquid in the bag is concentrated bitter tannin.'),
                               ('**Mel e limão por último**, fora do fogo, com a bebida morna.', '**Honey and lime last**, off the heat, once the drink is warm.'),
                               ('**Aqueça a xícara** com água quente antes de servir: a bebida mantém temperatura e aroma.', '**Warm the cup** with hot water before serving: the drink keeps its temperature and aroma.'),
                               ('**Prove antes de adoçar.** Erva-doce, rooibos e maçã já trazem doçura natural.', '**Taste before sweetening.** Fennel, rooibos and apple already bring natural sweetness.'), ordered=True, cls='steps'),
                       quote(('Uma boa bebida tem três camadas: base, aroma e acabamento. Ajuste uma por vez.', 'A good drink has three layers: base, aroma and finish. Adjust one at a time.')),
                       h3(('Equipamento mínimo', 'Minimum equipment')),
                       bullets(('Panela pequena com tampa (decocções e leite).', 'A small lidded pan (decoctions and milk).'), ('Peneira fina (folhas soltas, gengibre ralado, especiarias).', 'A fine sieve (loose leaf, grated ginger, spices).'), ('Ralador fino (raspas e gengibre).', 'A fine grater (zest and ginger).'), ('Duas canecas com alça (espuma dos cremosos).', 'Two mugs with handles (foam for the creamy drinks).'), ('Pote de vidro com tampa (xaropes e cold brew).', 'A lidded glass jar (syrups and cold brew).')))},
         {'type': 'text', 'eyebrow': ('Mise en place', 'Mise en place'), 'heading': ('Preparos base', 'Base preparations'),
          'lead': ('Como numa cafeteria, algumas preparações ficam prontas antes do serviço. Elas encurtam o preparo e elevam o acabamento de várias receitas.', 'As in a café, some preparations are ready before service. They shorten brewing and lift the finish of many recipes.'),
          'body': join(grid(2,
                            card(('Xarope de mel especiado', 'Spiced honey syrup'), ('Rende ≈ 180 ml · 2 semanas na geladeira', 'Makes ≈ 180 ml · 2 weeks in the fridge'), [('**Ingredientes.** 100 ml de água, 100 ml de mel, 1 pau de canela, 2 anis-estrelados.', '**Ingredients.** 100 ml water, 100 ml honey, 1 cinnamon stick, 2 star anise.'), ('**Preparo.** Ferva a água com as especiarias por 5 min. Desligue, aguarde 2 min e misture o mel. Guarde com as especiarias em pote de vidro. 1 c. sopa por xícara.', '**Method.** Simmer the water with the spices for 5 min. Turn off, wait 2 min and stir in the honey. Store with the spices in a glass jar. 1 tbsp per cup.')]),
                            card(('Mel de gengibre', 'Ginger honey'), ('Rende ≈ 80 ml · 2 semanas na geladeira', 'Makes ≈ 80 ml · 2 weeks in the fridge'), [('**Ingredientes.** 4 c. sopa de mel, 1 c. sopa cheia de gengibre ralado, 1 tira de casca de limão.', '**Ingredients.** 4 tbsp honey, 1 heaped tbsp grated ginger, 1 strip of lime peel.'), ('**Preparo.** Aqueça tudo em fogo mínimo por 2 min, sem ferver. Descanse 1 h e coe. Atalho para o Elixir, o Toddy e a Brasa.', '**Method.** Warm everything over the lowest heat for 2 min without boiling. Rest 1 h and strain. A shortcut for the Elixir, the Toddy and Ember.')]),
                            card(('Maçã caramelizada', 'Caramelised apple'), ('Na hora · 3 min', 'Fresh · 3 min'), [('¼ de maçã em cubos ou lâminas, 1 c. chá de mel, 1 pitada de canela em pó. Frigideira em fogo médio, maçã e mel juntos, mexendo até dourar e ficar brilhante. Canela no fim.', '¼ apple, diced or sliced, 1 tsp honey, 1 pinch ground cinnamon. Pan over medium heat, apple and honey together, stirring until golden and glossy. Cinnamon at the end.'), ('Guarnição, fundo de xícara ou cobertura dos cremosos.', 'A garnish, cup base or topping for the creamy drinks.')]),
                            card(('Limão tostado', 'Charred lime'), ('Na hora · 2 min', 'Fresh · 2 min'), [('Rodelas grossas (≈ 1 cm) de limão. Frigideira seca bem quente, 1 min de cada lado, até marcar. Não mexa enquanto doura.', 'Thick lime wheels (≈ 1 cm). Very hot dry pan, 1 min per side, until marked. Do not move them while they colour.'), ('Acidez mais macia e notas de marmelada.', 'Softer acidity and marmalade notes.')]),
                            card(('Gelo de hibisco', 'Hibiscus ice'), ('1 forma · 4 h de congelador', '1 tray · 4 h in the freezer'), [('1 c. sopa de flor de hibisco, 250 ml de água fervente, 1 c. sopa de mel. Infunda 5 min, coe, adoce e deixe esfriar. Congele em forminha.', '1 tbsp hibiscus flowers, 250 ml boiling water, 1 tbsp honey. Steep 5 min, strain, sweeten and cool. Freeze in a tray.'), ('Esfria os gelados sem diluir e dá cor ao copo.', 'Chills iced drinks without diluting and colours the glass.')]),
                            card(('Fitas e raspas cítricas', 'Citrus ribbons and zest'), ('Na hora', 'Fresh'), [('Limão bem lavado. Com o ralador, só a parte verde (o branco amarga). Para fitas, use faca e corte tiras finas sem o branco.', 'A well-washed lime. With the grater, green part only (the pith is bitter). For ribbons, use a knife and cut thin strips without pith.'), ('Torça sobre a xícara: os óleos caem na superfície.', 'Twist over the cup: the oils land on the surface.')]))),
          },
         {'type': 'text', 'toc': ('Escolha rápida', 'Quick pick'), 'toc_key': '·', 'eyebrow': ('Escolha rápida', 'Quick pick'), 'heading': ('O que beber agora?', 'What to drink now?'),
          'lead': ('Um atalho por momento do dia. Os números à direita levam direto à página da receita.', 'A shortcut by moment of the day. The numbers on the right take you straight to the recipe page.'), 'body': quick},
         ]
    for num, title, sub, rng, intro in CHAPTERS:
        ns = list(rng)
        P.append({'type': 'opener', 'num': num, 'title': L(*title), 'sub': L(*sub), 'intro': [L(*intro)], 'chapter': L(*title),
                  'list': [(f'{n:02d}', BY[n]['name']) for n in ns], 'toc': L(*title), 'toc_sub': L(*sub), 'toc_key': num,
                  'art': sprig_svg(seed=3 + len(P), w=700, h=420, leaves=10)})
        for i in range(0, len(ns), 2):
            P.append({'type': 'recipes', 'items': [BY[n] for n in ns[i:i + 2]]})
        if num == 'V':
            P.append({'type': 'text', 'body': ginger_ruler, 'art': True})
        if num == 'VI':
            P.append({'type': 'text', 'body': foam, 'art': True})
    P.append({'type': 'text', 'toc': ('Índice por ingrediente', 'Index by ingredient'), 'toc_key': '·', 'chapter': ('Referência', 'Reference'), 'eyebrow': ('Referência', 'Reference'), 'heading': ('Índice por ingrediente', 'Index by ingredient'),
              'lead': ('Quer usar o que está acabando, ou o que acabou de comprar? Procure o ingrediente e siga os números.', 'Want to use what is running low, or what you just bought? Find the ingredient and follow the numbers.'), 'body': index})
    P.append(closing_page(1))
    for i, p in enumerate(P, 1):
        p['_n'] = i
    _PAGES = P
    return P


OTHERS = [(1, L('Infusões Autorais', 'Signature Infusions')), (2, L('Atlas do Chá', 'The Tea Atlas')), (3, L('Ritual da Noite', 'The Night Ritual')), (4, L('Foco & Energia', 'Focus & Energy')),
          (5, L('Gelados & Cold Brew', 'Iced & Cold Brew')), (6, L('Matcha em Casa', 'Matcha at Home')), (7, L('Ervas do Quintal', 'Backyard Herbs')), (8, L('Blends Autorais', 'Crafting Blends')),
          (9, L('Chá & Mesa', 'Tea & Table')), (10, L('Erva-Mate', 'Yerba Mate'))]


def closing_page(n):
    return {'type': 'closing', 'heading': L('Obrigado por preparar com a gente', 'Thank you for brewing with us'),
            'body': [L('A coleção Botanora tem dez guias, cada um dedicado a um jeito de viver o chá. Continue a explorar:', 'The Botanora collection has ten guides, each devoted to one way of living with tea. Keep exploring:')],
            'others': [o for o in OTHERS if o[0] != n],
            'legal': L('© Botanora. Este guia é para uso pessoal; é proibida a reprodução ou redistribuição sem autorização. O conteúdo é educativo e não substitui orientação médica ou nutricional.',
                       '© Botanora. This guide is for personal use; reproduction or redistribution without permission is prohibited. The content is educational and does not replace medical or nutritional advice.')}


GUIDE = Guide('infusoes-de-autor', 1, L('Infusões Autorais', 'Signature Infusions'), L('40 chás e infusões em estilo barista, feitos com a sua despensa', '40 barista-style teas and infusions made from your pantry'), build_pages)
