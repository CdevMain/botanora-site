from common import *
import g06_matcha as base

RECIPES = [
 R(15, ('Brigadeiro de Matcha', 'Matcha Brigadeiro'), ('O doce brasileiro, verde e menos enjoativo.', 'The Brazilian sweet, green and less cloying.'), False, ('25 min + 2 h', '25 min + 2 h'), ('≈ 25 unidades', '≈ 25 pieces'), True, 'easy',
   [('1 lata', '1 can', 'leite condensado (395 g)', 'condensed milk (395 g)'), ('1 c. sopa', '1 tbsp', 'manteiga', 'butter'), ('4 g', '4 g', 'matcha culinário peneirado', 'sifted culinary matcha'), ('50 g', '50 g', 'chocolate branco picado', 'chopped white chocolate')],
   [('Leve leite condensado, manteiga e chocolate ao fogo baixo, mexendo sem parar.', 'Cook the condensed milk, butter and chocolate over low heat, stirring constantly.'),
    ('Quando começar a soltar do fundo (cerca de 12 min), desligue.', 'When it starts to pull away from the base (about 12 min), turn off.'),
    ('Junte o matcha peneirado fora do fogo e misture bem.', 'Stir in the sifted matcha off the heat.'), ('Esfrie 2 h, enrole e passe em matcha com açúcar de confeiteiro.', 'Cool 2 h, roll into balls and coat in matcha mixed with icing sugar.')],
   None, ('O matcha entra fora do fogo para não escurecer. O amargor dele equilibra a doçura do leite condensado.', 'Matcha goes in off the heat so it does not darken. Its bitterness balances the sweetness of the condensed milk.'), milk=True),
 R(16, ('Panquecas de Matcha', 'Matcha Pancakes'), ('Fofas, verdes, para o café da manhã de domingo.', 'Fluffy and green, for Sunday breakfast.'), False, '20 min', ('8 panquecas', '8 pancakes'), True, 'easy',
   [('150 g', '150 g', 'farinha de trigo', 'plain flour'), ('4 g', '4 g', 'matcha culinário', 'culinary matcha'), ('2 c. sopa', '2 tbsp', 'açúcar', 'sugar'), ('2 c. chá', '2 tsp', 'fermento químico', 'baking powder'), ('1', '1', 'ovo', 'egg'), ('200 ml', '200 ml', 'leite', 'milk'), ('2 c. sopa', '2 tbsp', 'manteiga derretida', 'melted butter')],
   [('Peneire os secos juntos, incluindo o matcha.', 'Sift the dry ingredients together, including the matcha.'), ('Bata ovo, leite e manteiga e junte aos secos, mexendo pouco.', 'Whisk the egg, milk and butter and fold into the dry mix, stirring briefly.'),
    ('Frigideira antiaderente em fogo médio-baixo: 1 concha por panqueca, vire quando surgirem bolhas.', 'Non-stick pan over medium-low heat: one ladle per pancake, flip when bubbles appear.')],
   ('Mel, frutas vermelhas e iogurte.', 'Honey, berries and yoghurt.'), ('Fogo baixo mantém a cor verde; fogo alto doura e esconde o matcha.', 'Low heat keeps the green colour; high heat browns them and hides the matcha.'), milk=True),
 R(17, ('Tiramisù de Matcha', 'Matcha Tiramisù'), ('Biscoito embebido em matcha e creme de mascarpone.', 'Biscuits soaked in matcha with mascarpone cream.'), True, ('25 min + 6 h', '25 min + 6 h'), ('6 porções', '6 servings'), True, 'mid',
   [('6 g', '6 g', 'matcha', 'matcha'), ('250 ml', '250 ml', 'água a 75 °C', 'water at 75 °C'), ('250 g', '250 g', 'mascarpone (ou cream cheese)', 'mascarpone (or cream cheese)'), ('200 ml', '200 ml', 'creme de leite fresco gelado', 'chilled double cream'), ('70 g', '70 g', 'açúcar de confeiteiro', 'icing sugar'), ('200 g', '200 g', 'biscoito champanhe', 'ladyfingers')],
   [('Bata 4 g de matcha com a água e esfrie.', 'Whisk 4 g of matcha with the water and cool.'), ('Bata o creme em ponto de chantilly e misture com o mascarpone e o açúcar.', 'Whip the cream to soft peaks and fold in the mascarpone and sugar.'),
    ('Molhe rapidamente os biscoitos no matcha e forre o refratário. Cubra com metade do creme. Repita.', 'Dip the biscuits quickly in the matcha and line the dish. Cover with half the cream. Repeat.'),
    ('Geladeira por 6 h. Peneire o restante do matcha por cima antes de servir.', 'Chill 6 h. Sift the remaining matcha on top before serving.')],
   None, ('Versão sem ovos cru, mais segura para servir a muita gente.', 'A version without raw eggs, safer for serving a crowd.'), milk=True),
 R(18, ('Sorvete de Matcha sem Máquina', 'No-churn Matcha Ice Cream'), ('Três ingredientes e um batedor.', 'Three ingredients and a whisk.'), True, ('15 min + 6 h', '15 min + 6 h'), ('≈ 700 ml', '≈ 700 ml'), True, 'easy',
   [('400 ml', '400 ml', 'creme de leite fresco gelado', 'chilled double cream'), ('1 lata', '1 can', 'leite condensado', 'condensed milk'), ('8 g', '8 g', 'matcha culinário', 'culinary matcha'), ('1 pitada', '1 pinch', 'sal', 'salt')],
   [('Bata o matcha com 3 c. sopa de leite condensado até ficar liso.', 'Whisk the matcha with 3 tbsp of the condensed milk until smooth.'), ('Junte o resto do leite condensado e o sal.', 'Add the rest of the condensed milk and the salt.'),
    ('Bata o creme em picos firmes e incorpore em duas vezes, delicadamente.', 'Whip the cream to stiff peaks and fold in, in two goes, gently.'), ('Pote fechado no freezer por 6 h.', 'Closed tub in the freezer for 6 h.')],
   ('Calda de chocolate branco ou nibs de cacau.', 'White chocolate sauce or cacao nibs.'), ('Tire do freezer 5 min antes de servir para as bolas saírem lisas.', 'Take it out 5 min before serving so the scoops come out smooth.'), milk=True),
]

PLAN = [
 (('Dia 1', 'Day 1'), ('Só peneirar e fazer a pasta. Observe a textura.', 'Just sift and make the paste. Notice the texture.')),
 (('Dia 2', 'Day 2'), ('Usucha com 70 ml a 80 °C. Cronometre 20 s de batida.', 'Usucha with 70 ml at 80 °C. Time 20 s of whisking.')),
 (('Dia 3', 'Day 3'), ('Treine o "W" só com o pulso, cotovelo parado.', 'Practise the "W" from the wrist only, elbow still.')),
 (('Dia 4', 'Day 4'), ('Compare 70 °C e 85 °C no mesmo dia: anote o amargor.', 'Compare 70 °C and 85 °C on the same day: note the bitterness.')),
 (('Dia 5', 'Day 5'), ('Foque no refinamento: microespuma sem bolhas grandes.', 'Focus on refining: microfoam with no big bubbles.')),
 (('Dia 6', 'Day 6'), ('Faça um latte e um gelado com a mesma base.', 'Make a latte and an iced drink from the same base.')),
 (('Dia 7', 'Day 7'), ('Prepare para alguém e explique o que fez.', 'Make one for someone and explain what you did.')),
]


def extra():
    ch = ('Mais receitas e prática', 'More recipes and practice')
    rp = recipe_pages(RECIPES)
    rp[0].update(toc=L('Doces de matcha', 'Matcha sweets'), toc_key='·')
    return rp + [
        text(('Sete dias para bater bem', 'Seven days to whisk well'), eyebrow=ch, chapter=ch, toc=('Sete dias para bater bem', 'Seven days to whisk well'),
             lead=('Um exercício por dia. Em uma semana a espuma fina vira hábito.', 'One exercise a day. Within a week fine foam becomes a habit.'),
             body=join(T([('Dia', 'Day'), ('Exercício', 'Exercise'), ('Espuma (1 a 5)', 'Foam (1 to 5)')], [[a, b, ''] for a, b in PLAN], cls='data'),
                       H3('Como avaliar a espuma', 'How to judge the foam'),
                       T([('Nota', 'Score'), ('Aparência', 'Appearance')],
                         [['1', ('Sem espuma, pó assentando', 'No foam, powder settling')], ['2', ('Bolhas grandes que somem em segundos', 'Big bubbles that vanish in seconds')], ['3', ('Espuma irregular, com ilhas', 'Patchy foam with islands')],
                          ['4', ('Cobre tudo, algumas bolhas visíveis', 'Covers everything, a few visible bubbles')], ['5', ('Lisa, opaca, como creme; dura minutos', 'Smooth, opaque, creamy; lasts minutes')]], cls='data compact'))),
        text(('Combinações de sabor', 'Flavour pairings'), eyebrow=ch, chapter=ch, toc=('Combinações de sabor', 'Flavour pairings'),
             lead=('Para criar as suas receitas: o que conversa bem com o matcha e o que pede cuidado.', 'To create your own recipes: what talks well with matcha and what needs care.'),
             body=join(T([('Família', 'Family'), ('Combina muito bem', 'Pairs very well'), ('Use com cuidado', 'Use with care')],
                         [[('Laticínios', 'Dairy'), ('leite, creme, chocolate branco, iogurte', 'milk, cream, white chocolate, yoghurt'), ('queijos salgados', 'salty cheeses')],
                          [('Frutas', 'Fruit'), ('morango, manga, maracujá, coco, laranja', 'strawberry, mango, passion fruit, coconut, orange'), ('limão em excesso', 'too much lime')],
                          [('Doces', 'Sweet'), ('baunilha, mel, gergelim preto, feijão-azuki', 'vanilla, honey, black sesame, azuki bean'), ('chocolate amargo (encobre)', 'dark chocolate (masks it)')],
                          [('Especiarias', 'Spices'), ('cardamomo, gengibre, canela leve', 'cardamom, ginger, light cinnamon'), ('cravo, anis (dominam)', 'clove, anise (dominate)')],
                          [('Salgados', 'Savoury'), ('sal com matcha em tempurá, ovos, abacate', 'matcha salt on tempura, eggs, avocado'), ('molhos de tomate', 'tomato sauces')]], cls='data'),
                       H3('Quanto usar em receitas', 'How much to use in recipes'),
                       T([('Preparo', 'Preparation'), ('Matcha', 'Matcha')],
                         [[('Bolo (forma média)', 'Cake (medium tin)'), '8–10 g'], [('Biscoitos (20 unidades)', 'Biscuits (20)'), '6 g'], [('Sorvete (700 ml)', 'Ice cream (700 ml)'), '8 g'], [('Creme ou ganache (300 g)', 'Custard or ganache (300 g)'), '4–5 g'], [('Smoothie (1 copo)', 'Smoothie (1 glass)'), '2 g']], cls='data compact'),
                       TIP('Na confeitaria, peneire o matcha junto com a farinha ou o açúcar: os grumos somem e a cor fica uniforme.', 'In baking, sift the matcha together with the flour or sugar: lumps disappear and the colour is even.'))),
    ]


GUIDE = extend(base.GUIDE, extra, insert_at=lambda p: len(p) - 2)
