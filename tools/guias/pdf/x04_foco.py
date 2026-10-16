from common import *
import g04_foco as base

RECIPES = [
 R(13, ('Mate Gelado de Coco', 'Iced Coconut Mate'), ('Erva-mate e coco, para levar na bolsa.', 'Yerba mate and coconut, to take with you.'), True, ('5 min + 3 h', '5 min + 3 h'), ('1 garrafa · 600 ml', '1 bottle · 600 ml'), True, 'easy',
   [('2 c. sopa', '2 tbsp', 'erva-mate', 'yerba mate'), ('300 ml', '300 ml', 'água fria', 'cold water'), ('300 ml', '300 ml', 'água de coco', 'coconut water'), ('1 c. sopa', '1 tbsp', 'coco ralado tostado (opcional)', 'toasted grated coconut (optional)')],
   [('Junte a erva e a água fria numa garrafa. Geladeira por 3 h.', 'Combine the yerba and cold water in a bottle. Fridge for 3 h.'), ('Coe num coador de papel.', 'Strain through a paper filter.'), ('Complete com a água de coco.', 'Top up with the coconut water.')],
   None, ('O coco arredonda o amargor da erva. Agite antes de beber.', 'Coconut rounds off the yerba\'s bitterness. Shake before drinking.')),
 R(14, ('Verde & Cacau com Pimenta', 'Green Tea, Cacao & Chilli'), ('Chá verde com nibs de cacau e um toque picante.', 'Green tea with cacao nibs and a little heat.'), False, '4 min', ('1 xícara · 250 ml', '1 cup · 250 ml'), True, 'easy',
   [('3 g', '3 g', 'chá verde chinês', 'Chinese green tea'), ('1 c. chá', '1 tsp', 'nibs de cacau', 'cacao nibs'), ('1 pitada', '1 pinch', 'pimenta-calabresa ou caiena', 'chilli flakes or cayenne'), ('250 ml', '250 ml', 'água a 80 °C', 'water at 80 °C')],
   [('Amasse levemente os nibs.', 'Lightly crush the nibs.'), ('Infunda tudo por 2 min 30 s.', 'Steep everything for 2 min 30 s.'), ('Coe e beba sem açúcar.', 'Strain and drink unsweetened.')],
   None, ('Cacau e pimenta trazem sensação de calor e alerta, sem acrescentar cafeína significativa.', 'Cacao and chilli bring warmth and alertness without adding meaningful caffeine.')),
 R(15, ('Ceylon com Cardamomo e Mel', 'Ceylon with Cardamom and Honey'), ('Preto brilhante, perfumado, sem leite.', 'Bright black tea, fragrant, no milk.'), False, '5 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), True, 'easy',
   [('3 g', '3 g', 'chá preto Ceylon', 'Ceylon black tea'), ('2', '2', 'bagas de cardamomo amassadas', 'crushed cardamom pods'), ('250 ml', '250 ml', 'água a 95 °C', 'water at 95 °C'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Infunda o chá com o cardamomo por 3 min.', 'Steep the tea with the cardamom for 3 min.'), ('Coe e adoce com mel.', 'Strain and sweeten with honey.')],
   None, ('Ceylon é mais leve e cítrico que Assam: ótimo puro, sem leite, no meio da manhã.', 'Ceylon is lighter and more citrusy than Assam: great on its own, without milk, mid-morning.')),
 R(16, ('Kabusecha de Concentração', 'Concentration Kabusecha'), ('Verde sombreado, rico em umami e L-teanina.', 'Shaded green, rich in umami and L-theanine.'), False, '5 min', ('2 xícaras pequenas', '2 small cups'), True, 'mid',
   [('5 g', '5 g', 'kabusecha ou gyokuro', 'kabusecha or gyokuro'), ('120 ml', '120 ml', 'água a 60 °C', 'water at 60 °C')],
   [('Esfrie a água passando-a por duas xícaras.', 'Cool the water by pouring it through two cups.'), ('Infunda 1 min 30 s no kyusu ou bule pequeno.', 'Steep 1 min 30 s in a kyusu or small pot.'), ('Sirva até a última gota. Repita com 70 °C e 30 s.', 'Pour to the last drop. Repeat at 70 °C for 30 s.')],
   None, ('Água baixa extrai a L-teanina e deixa a cafeína e os taninos para trás: sabor de caldo e mente calma.', 'Low water extracts the L-theanine and leaves caffeine and tannins behind: a broth-like taste and a calm mind.')),
 R(17, ('Kukicha com Maçã Verde', 'Kukicha with Green Apple'), ('Chá de talos, quase sem cafeína, para o fim do dia.', 'Twig tea, almost caffeine-free, for the end of the day.'), False, '5 min', ('1 bule · 400 ml', '1 pot · 400 ml'), True, 'easy',
   [('4 g', '4 g', 'kukicha (chá de talos)', 'kukicha (twig tea)'), ('½', '½', 'maçã verde em lâminas finas', 'green apple, thinly sliced'), ('400 ml', '400 ml', 'água a 85 °C', 'water at 85 °C')],
   [('Coloque a maçã e o kukicha no bule.', 'Put the apple and kukicha in the pot.'), ('Infunda 2 min.', 'Steep 2 min.'), ('Coe. Faça uma segunda infusão de 3 min.', 'Strain. Make a second 3-minute steep.')],
   None, ('Os talos têm bem menos cafeína que as folhas: ideal para a última xícara antes do rooibos.', 'Twigs have much less caffeine than leaves: ideal as the last cup before rooibos.')),
 R(18, ('Rooibos & Hortelã: a Última Xícara', 'Rooibos & Mint: the Last Cup'), ('Sem cafeína, para encerrar o dia de trabalho.', 'Caffeine-free, to close the workday.'), False, '6 min', ('1 caneca · 300 ml', '1 mug · 300 ml'), False, 'easy',
   [('1 c. sopa', '1 tbsp', 'rooibos', 'rooibos'), ('6 folhas', '6 leaves', 'hortelã', 'mint'), ('300 ml', '300 ml', 'água fervente', 'boiling water')],
   [('Infunda o rooibos por 5 min.', 'Steep the rooibos for 5 min.'), ('Junte a hortelã no último minuto.', 'Add the mint in the last minute.'), ('Coe.', 'Strain.')],
   None, ('Marque a hora desta xícara: ela é o fim do expediente. Depois dela, nada de cafeína.', 'Set a time for this cup: it ends the workday. After it, no caffeine.')),
]


def extra():
    ch = ('Mais receitas e planejamento', 'More recipes and planning')
    return recipe_pages(RECIPES) + [
        text(('A garrafa da semana', 'The weekly bottle'), eyebrow=ch, chapter=ch, toc=('A garrafa da semana', 'The weekly bottle'),
             lead=('Domingo, 20 minutos: cinco dias de chá pronto na geladeira.', 'Sunday, 20 minutes: five days of tea ready in the fridge.'),
             body=join(B(('**Escolha dois chás**: um com cafeína para a manhã (verde ou mate) e um sem cafeína para a tarde (rooibos, hibisco ou ervas).', '**Pick two teas**: one caffeinated for mornings (green or mate) and one caffeine-free for afternoons (rooibos, hibiscus or herbs).'),
                         ('**Faça cold brew** em duas jarras de 1 L (8 a 12 g de folha por litro).', '**Make cold brew** in two 1 L jugs (8 to 12 g of leaf per litre).'),
                         ('**Coe no tempo certo** e transfira para garrafas limpas com tampa.', '**Strain on time** and move to clean bottles with lids.'),
                         ('**Etiquete** com o nome e a data. Consuma em até 3 dias; faça a segunda leva na quarta.', '**Label** with the name and date. Drink within 3 days; make the second batch on Wednesday.'), ordered=True, cls='steps'),
                       T([('Dia', 'Day'), ('Manhã', 'Morning'), ('Tarde', 'Afternoon')],
                         [[('Segunda', 'Monday'), ('Verde & água de coco (receita 12)', 'Green tea & coconut water (recipe 12)'), ('Rooibos e laranja', 'Rooibos and orange')], [('Terça', 'Tuesday'), ('Mate gelado de coco (receita 13)', 'Iced coconut mate (recipe 13)'), ('Hibisco', 'Hibiscus')],
                          [('Quarta', 'Wednesday'), ('Tererê de laranja e alecrim (receita 6)', 'Orange & rosemary tereré (recipe 6)'), ('Hortelã e capim-cidreira', 'Mint and lemongrass')], [('Quinta', 'Thursday'), ('Verde com guaraná e limão (receita 7)', 'Green tea with guaraná and lime (recipe 7)'), ('Rooibos e laranja', 'Rooibos and orange')],
                          [('Sexta', 'Friday'), ('Verde & água de coco (receita 12)', 'Green tea & coconut water (recipe 12)'), ('Hibisco', 'Hibiscus')]], cls='data compact'),
                       TIP('Garrafas de vidro com tampa de rosca não pegam cheiro e mostram a cor do chá. Lave e escalde entre uma leva e outra.', 'Glass bottles with screw caps do not hold smells and show off the tea. Wash and scald between batches.'))),
        text(('Lanches que ajudam', 'Snacks that help'), eyebrow=ch, chapter=ch, toc=('Lanches que ajudam', 'Snacks that help'),
             lead=('Cafeína com estômago vazio dá picos. Um lanche com fibra, gordura boa ou proteína deixa a curva mais suave.', 'Caffeine on an empty stomach spikes. A snack with fibre, good fat or protein smooths the curve.'),
             body=join(T([('Chá', 'Tea'), ('Lanche', 'Snack'), ('Por que combina', 'Why it works')],
                         [[('Matcha', 'Matcha'), ('Castanhas e um quadrado de chocolate 70%', 'Nuts and a square of 70% chocolate'), ('Gordura boa, amargor que conversa', 'Good fat, matching bitterness')],
                          [('Sencha', 'Sencha'), ('Edamame ou onigiri', 'Edamame or onigiri'), ('Umami com umami', 'Umami with umami')],
                          [('Chá preto', 'Black tea'), ('Pão integral com queijo', 'Wholegrain bread with cheese'), ('Corpo e fibra', 'Body and fibre')],
                          [('Mate', 'Mate'), ('Banana com pasta de amendoim', 'Banana with peanut butter'), ('Energia lenta', 'Slow energy')],
                          [('Oolong', 'Oolong'), ('Fruta fresca e iogurte', 'Fresh fruit and yoghurt'), ('Frescor e proteína', 'Freshness and protein')],
                          [('Rooibos', 'Rooibos'), ('Cookies de aveia', 'Oat cookies'), ('Doçura leve para o fim do dia', 'Light sweetness for day\'s end')]], cls='data'),
                       H3('Três regras simples', 'Three simple rules'),
                       B(('Coma algo na primeira hora do dia antes ou junto da primeira xícara.', 'Eat something in the first hour of the day, before or with the first cup.'), ('Beba um copo de água para cada xícara de chá com cafeína.', 'Drink a glass of water for every caffeinated cup.'), ('Prefira lanches com pouco açúcar: o açúcar dá o mesmo pico que você está tentando evitar.', 'Choose low-sugar snacks: sugar gives the same spike you are trying to avoid.')),
                       WARN('Se você tem ansiedade, palpitação, gastrite ou pressão alta, converse com seu médico sobre o seu limite de cafeína.', 'If you have anxiety, palpitations, gastritis or high blood pressure, talk to your doctor about your caffeine limit.', ('Atenção', 'Note')))),
    ]


GUIDE = extend(base.GUIDE, extra)
