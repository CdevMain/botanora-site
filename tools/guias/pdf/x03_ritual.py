from common import *
import g03_ritual as base

RECIPES = [
 R(21, ('Leite de Aveia, Tâmara e Canela', 'Oat Milk with Date and Cinnamon'), ('Cremoso e doce só com fruta.', 'Creamy and sweetened only with fruit.'), False, '8 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), False, 'easy',
   [('250 ml', '250 ml', 'bebida de aveia', 'oat drink'), ('2', '2', 'tâmaras sem caroço', 'pitted dates'), ('¼ c. chá', '¼ tsp', 'canela', 'cinnamon'), ('1 pitada', '1 pinch', 'sal', 'salt')],
   [('Bata a bebida de aveia com as tâmaras no liquidificador até ficar liso.', 'Blend the oat drink with the dates until smooth.'), ('Aqueça com a canela e o sal em fogo baixo, sem ferver.', 'Warm with the cinnamon and salt over low heat, without boiling.'), ('Sirva com espuma.', 'Serve frothy.')],
   None, ('A pitada de sal realça a doçura da tâmara. Bom para quem quer evitar açúcar à noite.', 'The pinch of salt brings out the date\'s sweetness. Good if you want to avoid sugar at night.'), milk=True),
 R(22, ('Leite de Amêndoas, Baunilha e Noz-moscada', 'Almond Milk with Vanilla and Nutmeg'), ('O "leite quente da vovó", sem lactose.', 'Grandma\'s warm milk, dairy-free.'), False, '6 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), False, 'easy',
   [('250 ml', '250 ml', 'leite de amêndoas', 'almond milk'), ('2 gotas', '2 drops', 'extrato de baunilha', 'vanilla extract'), ('1 pitada', '1 pinch', 'noz-moscada ralada', 'grated nutmeg'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Aqueça o leite de amêndoas sem ferver.', 'Warm the almond milk without boiling.'), ('Junte a baunilha e o mel.', 'Add the vanilla and honey.'), ('Rale a noz-moscada por cima na hora.', 'Grate the nutmeg on top at the last moment.')],
   None, ('Noz-moscada só uma pitada: em grande quantidade ela faz mal.', 'Just a pinch of nutmeg: in large amounts it is harmful.'), milk=True),
 R(23, ('Chá de Banana com Canela', 'Banana and Cinnamon Tea'), ('Feito com a fruta inteira, sem cafeína.', 'Made with the whole fruit, caffeine-free.'), False, '15 min', ('2 xícaras', '2 cups'), False, 'easy',
   [('1', '1', 'banana orgânica madura, com casca, bem lavada', 'ripe organic banana, peel on, well washed'), ('500 ml', '500 ml', 'água', 'water'), ('1', '1', 'pau de canela', 'cinnamon stick')],
   [('Corte as pontas da banana e corte-a em 3 pedaços, com casca.', 'Trim the ends of the banana and cut it into 3 pieces, peel on.'), ('Ferva com a canela em fogo baixo por 10 min.', 'Simmer with the cinnamon over low heat for 10 min.'), ('Coe e beba morno. Coma a banana cozida, se quiser.', 'Strain and drink warm. Eat the cooked banana, if you like.')],
   None, ('Use banana orgânica: a casca vai para a água. O sabor é suave e naturalmente doce.', 'Use an organic banana: the peel goes into the water. The taste is mild and naturally sweet.')),
 R(24, ('Melissa Morna com Limão', 'Warm Lemon Balm and Lemon'), ('Leve, cítrica, para depois do jantar.', 'Light and citrusy, for after dinner.'), False, '8 min', ('2 xícaras', '2 cups'), False, 'easy',
   [('12 folhas', '12 leaves', 'melissa fresca (ou 2 c. sopa seca)', 'fresh lemon balm (or 2 tbsp dried)'), ('3 botões', '3 buds', 'lavanda', 'lavender'), ('400 ml', '400 ml', 'água a 90 °C', 'water at 90 °C'), ('2 rodelas', '2 slices', 'limão-siciliano', 'lemon')],
   [('Amasse levemente as folhas de melissa com as mãos.', 'Bruise the lemon balm leaves lightly in your hands.'), ('Infunda com a lavanda e o limão por 6 min, tampado.', 'Steep with the lavender and lemon for 6 min, covered.'), ('Coe e beba morna.', 'Strain and drink warm.')],
   None, ('Tampar é essencial: os óleos que acalmam são os que evaporam primeiro.', 'Covering is essential: the calming oils are the first to evaporate.')),
]

PLAN = [
 (('Noite 1', 'Night 1'), ('Desligar telas 60 min antes. Camomila simples.', 'Screens off 60 min before. Plain chamomile.')),
 (('Noite 2', 'Night 2'), ('Quarto mais fresco (18 a 21 °C). Melissa com limão.', 'A cooler room (18 to 21 °C). Lemon balm and lemon.')),
 (('Noite 3', 'Night 3'), ('Respiração 4-7-8 com a xícara nas mãos. Blend do capítulo IV.', '4-7-8 breathing with the cup in your hands. A chapter IV blend.')),
 (('Noite 4', 'Night 4'), ('Jantar leve e 3 h antes de deitar. Leite de aveia, tâmara e canela.', 'A light dinner 3 h before bed. Oat milk with date and cinnamon.')),
 (('Noite 5', 'Night 5'), ('Escrever três linhas no diário. Rooibos.', 'Write three lines in the diary. Rooibos.')),
 (('Noite 6', 'Night 6'), ('Banho morno 90 min antes. Chá de banana com canela.', 'A warm bath 90 min before. Banana and cinnamon tea.')),
 (('Noite 7', 'Night 7'), ('Repita a noite que funcionou melhor e anote por quê.', 'Repeat the night that worked best and note why.')),
]


def extra():
    ch = ('Para começar', 'Getting started')
    return recipe_pages(RECIPES) + [
        text(('Sua primeira semana', 'Your first week'), eyebrow=ch, chapter=ch, toc=('Sua primeira semana', 'Your first week'),
             lead=('Um plano de sete noites para criar o hábito. Mude uma coisa por noite e observe.', 'A seven-night plan to build the habit. Change one thing per night and observe.'),
             body=join(T([('Noite', 'Night'), ('O que fazer', 'What to do'), ('Dormi bem? (1 a 5)', 'Slept well? (1 to 5)')],
                         [[a, b, ''] for a, b in PLAN], cls='data'),
                       H3('Lista de compras para a semana', 'Shopping list for the week'),
                       grid(2, C(('Ervas', 'Herbs'), None, [('Camomila (50 g), melissa seca ou fresca, lavanda culinária (20 g), rooibos (100 g).', 'Chamomile (50 g), dried or fresh lemon balm, culinary lavender (20 g), rooibos (100 g).')]),
                               C(('Despensa', 'Pantry'), None, [('Mel, canela em pau, tâmaras, bebida de aveia, leite de amêndoas, banana orgânica, limão-siciliano.', 'Honey, cinnamon sticks, dates, oat drink, almond milk, an organic banana, lemons.')])),
                       Q('O chá não faz você dormir. Ele avisa ao corpo que o dia acabou.', 'Tea does not put you to sleep. It tells your body the day is over.'))),
    ]


GUIDE = extend(base.GUIDE, extra, insert_at=lambda p: len(p) - 2)
