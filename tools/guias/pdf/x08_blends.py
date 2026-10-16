from common import *
import g08_blends as base

F2 = [
 (('Natal Especiado', 'Spiced Christmas'), ('Preto, canela, laranja e amêndoa.', 'Black tea, cinnamon, orange and almond.'), ('com cafeína', 'caffeinated'), [(('60%', '60%'), ('chá preto Ceylon', 'Ceylon black tea')), (('15%', '15%'), ('casca de laranja', 'orange peel')), (('10%', '10%'), ('canela em lascas', 'cinnamon chips')), (('10%', '10%'), ('amêndoa laminada tostada', 'toasted flaked almond')), (('5%', '5%'), ('cravo e anis', 'clove and star anise'))], ('3 g, fervente, 4 min.', '3 g, boiling, 4 min.')),
 (('Primavera Floral', 'Spring Floral'), ('Verde com rosa e calêndula.', 'Green tea with rose and calendula.'), ('com cafeína', 'caffeinated'), [(('75%', '75%'), ('chá verde chinês', 'Chinese green tea')), (('15%', '15%'), ('botões de rosa', 'rose buds')), (('10%', '10%'), ('calêndula', 'calendula'))], ('3 g, 80 °C, 2 min 30 s.', '3 g, 80 °C, 2 min 30 s.')),
 (('Manga & Capim', 'Mango & Lemongrass'), ('Branco tropical, ótimo gelado.', 'Tropical white, great iced.'), ('pouca cafeína', 'low caffeine'), [(('60%', '60%'), ('Bai Mu Dan', 'Bai Mu Dan')), (('25%', '25%'), ('manga desidratada', 'dried mango')), (('15%', '15%'), ('capim-cidreira', 'lemongrass'))], ('4 g, 85 °C, 4 min ou cold brew.', '4 g, 85 °C, 4 min or cold brew.')),
 (('Outono Tostado', 'Toasted Autumn'), ('Hojicha, maçã e canela.', 'Hojicha, apple and cinnamon.'), ('pouca cafeína', 'low caffeine'), [(('65%', '65%'), ('hojicha', 'hojicha')), (('25%', '25%'), ('maçã desidratada', 'dried apple')), (('10%', '10%'), ('canela', 'cinnamon'))], ('4 g, fervente, 1 min 30 s.', '4 g, boiling, 1 min 30 s.')),
 (('Pinhão & Mate', 'Pine Nut & Mate'), ('O inverno do Sul num blend: mate tostado e pinhão.', 'Southern Brazilian winter in a blend: toasted mate and pinhão.'), ('com cafeína', 'caffeinated'), [(('70%', '70%'), ('chá-mate tostado', 'toasted mate tea')), (('20%', '20%'), ('pinhão cozido, seco e tostado em lascas', 'cooked, dried and toasted pinhão slivers')), (('10%', '10%'), ('casca de tangerina', 'tangerine peel'))], ('4 g, 90 °C, 5 min. Pinhão tem validade curta: até 2 meses.', '4 g, 90 °C, 5 min. Pinhão keeps briefly: up to 2 months.')),
 (('Quentão sem Álcool', 'Alcohol-free Quentão'), ('O blend da festa junina.', 'The Brazilian June-festival blend.'), ('sem cafeína', 'caffeine-free'), [(('35%', '35%'), ('gengibre seco em cubos', 'dried ginger pieces')), (('25%', '25%'), ('casca de laranja', 'orange peel')), (('20%', '20%'), ('maçã desidratada', 'dried apple')), (('15%', '15%'), ('canela em lascas', 'cinnamon chips')), (('5%', '5%'), ('cravo', 'clove'))], ('Ferva 10 g por litro de suco de uva com água (1:1).', 'Simmer 10 g per litre of grape juice and water (1:1).')),
 (('Cacau & Pimenta-rosa', 'Cacao & Pink Pepper'), ('Rooibos com nibs e um toque picante.', 'Rooibos with nibs and a gentle heat.'), ('sem cafeína', 'caffeine-free'), [(('70%', '70%'), ('rooibos', 'rooibos')), (('20%', '20%'), ('nibs de cacau', 'cacao nibs')), (('7%', '7%'), ('canela', 'cinnamon')), (('3%', '3%'), ('pimenta-rosa', 'pink peppercorns'))], ('4 g, fervente, 6 min. Bom com leite.', '4 g, boiling, 6 min. Good with milk.')),
 (('Maçã Verde & Hortelã', 'Green Apple & Mint'), ('Ácido, fresco e sem cafeína.', 'Tart, fresh and caffeine-free.'), ('sem cafeína', 'caffeine-free'), [(('45%', '45%'), ('maçã verde desidratada', 'dried green apple')), (('35%', '35%'), ('hortelã', 'spearmint')), (('20%', '20%'), ('casca de limão', 'lime peel'))], ('4 g, 95 °C, 6 min ou cold brew.', '4 g, 95 °C, 6 min or cold brew.')),
 (('Hortelã & Chocolate', 'Mint & Chocolate'), ('Rooibos com hortelã e nibs: sobremesa sem cafeína.', 'Rooibos with mint and nibs: a caffeine-free dessert tea.'), ('sem cafeína', 'caffeine-free'), [(('55%', '55%'), ('rooibos', 'rooibos')), (('25%', '25%'), ('hortelã-pimenta', 'peppermint')), (('20%', '20%'), ('nibs de cacau', 'cacao nibs'))], ('4 g, fervente, 6 min. Ótimo com leite.', '4 g, boiling, 6 min. Great with milk.')),
 (('Verde Cítrico', 'Citrus Green'), ('Três cascas e um toque de gengibre.', 'Three peels and a touch of ginger.'), ('com cafeína', 'caffeinated'), [(('70%', '70%'), ('sencha', 'sencha')), (('10%', '10%'), ('casca de limão-siciliano', 'lemon peel')), (('10%', '10%'), ('casca de laranja', 'orange peel')), (('10%', '10%'), ('gengibre seco', 'dried ginger'))], ('3 g, 75 °C, 1 min 30 s.', '3 g, 75 °C, 1 min 30 s.')),
 (('Oolong Piña Colada', 'Piña Colada Oolong'), ('Oolong leve com coco e abacaxi.', 'Light oolong with coconut and pineapple.'), ('com cafeína', 'caffeinated'), [(('65%', '65%'), ('oolong leve', 'light oolong')), (('20%', '20%'), ('abacaxi desidratado', 'dried pineapple')), (('15%', '15%'), ('coco em lascas', 'coconut chips'))], ('4 g, 90 °C, 3 min ou cold brew.', '4 g, 90 °C, 3 min or cold brew.')),
 (('Earl Grey Provence', 'Earl Grey Provence'), ('Bergamota e lavanda.', 'Bergamot and lavender.'), ('com cafeína', 'caffeinated'), [(('85%', '85%'), ('Earl Grey', 'Earl Grey')), (('10%', '10%'), ('botões de rosa', 'rose buds')), (('5%', '5%'), ('lavanda', 'lavender'))], ('3 g, 95 °C, 3 min.', '3 g, 95 °C, 3 min.')),
 (('Breakfast da Casa', 'House Breakfast'), ('O blend de chá puro para leite.', 'A pure tea blend for milk.'), ('com cafeína', 'caffeinated'), [(('50%', '50%'), ('Assam', 'Assam')), (('30%', '30%'), ('Ceylon', 'Ceylon')), (('20%', '20%'), ('Keemun', 'Keemun'))], ('3 g, fervente, 4 min, com leite.', '3 g, boiling, 4 min, with milk.')),
 (('Morango & Rosa', 'Strawberry & Rose'), ('Frutado, perfumado e sem cafeína.', 'Fruity, perfumed and caffeine-free.'), ('sem cafeína', 'caffeine-free'), [(('40%', '40%'), ('hibisco', 'hibiscus')), (('30%', '30%'), ('morango desidratado', 'dried strawberry')), (('20%', '20%'), ('maçã', 'apple')), (('10%', '10%'), ('pétalas de rosa', 'rose petals'))], ('5 g, fervente, 8 min.', '5 g, boiling, 8 min.')),
 (('Pera & Baunilha', 'Pear & Vanilla'), ('Branco delicado de sobremesa.', 'A delicate dessert white.'), ('pouca cafeína', 'low caffeine'), [(('70%', '70%'), ('Bai Mu Dan', 'Bai Mu Dan')), (('25%', '25%'), ('pera desidratada', 'dried pear')), (('5%', '5%'), ('baunilha em pedaços', 'vanilla pieces'))], ('4 g, 85 °C, 4 min.', '4 g, 85 °C, 4 min.')),
 (('Genmaicha Matcha-iri', 'Matcha-iri Genmaicha'), ('O clássico japonês com matcha.', 'The Japanese classic with matcha.'), ('com cafeína', 'caffeinated'), [(('95%', '95%'), ('genmaicha', 'genmaicha')), (('5%', '5%'), ('matcha', 'matcha'))], ('4 g, 85 °C, 1 min 30 s.', '4 g, 85 °C, 1 min 30 s.')),
 (('Pu-erh "Café"', 'Pu-erh "Coffee"'), ('Para quem quer largar o café.', 'For anyone giving up coffee.'), ('com cafeína', 'caffeinated'), [(('60%', '60%'), ('pu-erh shou', 'shou pu-erh')), (('25%', '25%'), ('cevada tostada', 'roasted barley')), (('15%', '15%'), ('nibs de cacau', 'cacao nibs'))], ('5 g, fervente, 4 min. Com leite.', '5 g, boiling, 4 min. With milk.')),
 (('Cevada & Arroz Tostados', 'Roasted Barley & Rice'), ('Mugicha à brasileira, sem cafeína.', 'Brazilian-style mugicha, caffeine-free.'), ('sem cafeína', 'caffeine-free'), [(('60%', '60%'), ('cevada tostada', 'roasted barley')), (('30%', '30%'), ('arroz tostado', 'toasted rice')), (('10%', '10%'), ('casca de laranja', 'orange peel'))], ('10 g por litro, ferver 5 min. Ótimo gelado.', '10 g per litre, simmer 5 min. Great iced.')),
]

RECIPES = [
 R(1, ('Latte de Rooibos Brasil', 'Rooibos Brazil Latte'), ('O blend de cacau e castanha virando bebida de cafeteria.', 'The cacao and nut blend turned café drink.'), False, '8 min', ('1 caneca · 250 ml', '1 mug · 250 ml'), False, 'easy',
   [('5 g', '5 g', 'blend Rooibos Brasil', 'Rooibos Brazil blend'), ('100 ml', '100 ml', 'água fervente', 'boiling water'), ('150 ml', '150 ml', 'leite', 'milk'), ('1 c. chá', '1 tsp', 'mel ou xarope de rapadura', 'honey or panela syrup')],
   [('Infunda o blend na água por 6 min, concentrado. Coe.', 'Steep the blend in the water for 6 min, concentrated. Strain.'), ('Adoce o concentrado.', 'Sweeten the concentrate.'), ('Junte o leite quente espumado.', 'Add the hot frothed milk.')],
   ('Cacau em pó por cima.', 'Cocoa powder on top.'), ('Para vender como "concentrado", dobre o blend e engarrafe: dura 5 dias na geladeira.', 'To sell as a "concentrate", double the blend and bottle it: it keeps 5 days in the fridge.'), milk=True),
 R(2, ('Quentão sem Álcool', 'Alcohol-free Quentão'), ('O blend junino com suco de uva.', 'The June-festival blend with grape juice.'), False, '20 min', ('1 panela · 2 L', '1 pot · 2 L'), False, 'easy',
   [('20 g', '20 g', 'blend Quentão sem Álcool', 'Alcohol-free Quentão blend'), ('1 L', '1 L', 'suco de uva integral', 'pure grape juice'), ('1 L', '1 L', 'água', 'water'), ('3 c. sopa', '3 tbsp', 'açúcar mascavo (opcional)', 'brown sugar (optional)')],
   [('Ferva a água com o blend por 10 min.', 'Simmer the water with the blend for 10 min.'), ('Junte o suco e o açúcar e aqueça sem ferver.', 'Add the juice and sugar and heat without boiling.'), ('Coe e sirva quente em canecas.', 'Strain and serve hot in mugs.')],
   ('Rodela de laranja.', 'An orange wheel.'), ('Mantenha numa garrafa térmica durante a festa.', 'Keep it in a thermos during the party.')),
 R(3, ('Xarope de Blend', 'Blend Syrup'), ('Qualquer blend vira xarope para drinques e sobremesas.', 'Any blend becomes a syrup for drinks and desserts.'), False, '20 min', ('1 garrafa · 300 ml', '1 bottle · 300 ml'), True, 'easy',
   [('10 g', '10 g', 'blend à escolha', 'blend of your choice'), ('250 ml', '250 ml', 'água fervente', 'boiling water'), ('200 g', '200 g', 'açúcar', 'sugar')],
   [('Infunda o blend por 5 min (o dobro do normal).', 'Steep the blend for 5 min (twice as strong as usual).'), ('Coe, junte o açúcar e ferva 3 min.', 'Strain, add the sugar and simmer 3 min.'), ('Esfrie e engarrafe.', 'Cool and bottle.')],
   None, ('Dura 3 semanas na geladeira. Earl Grey Provence e Morango & Rosa rendem os melhores xaropes.', 'Keeps 3 weeks in the fridge. Earl Grey Provence and Strawberry & Rose make the best syrups.')),
 R(4, ('Cold Brew Frutado com Gás', 'Sparkling Fruity Cold Brew'), ('O refrigerante natural do ateliê.', 'The studio\'s natural soda.'), True, ('5 min + 8 h', '5 min + 8 h'), ('1 L', '1 L'), False, 'easy',
   [('15 g', '15 g', 'Morango & Rosa ou Rubi Tropical', 'Strawberry & Rose or Tropical Ruby'), ('500 ml', '500 ml', 'água fria', 'cold water'), ('500 ml', '500 ml', 'água com gás gelada', 'chilled sparkling water'), ('2 c. sopa', '2 tbsp', 'xarope de blend', 'blend syrup')],
   [('Cold brew do blend na água fria por 8 h.', 'Cold brew the blend in the cold water for 8 h.'), ('Coe e adoce com o xarope.', 'Strain and sweeten with the syrup.'), ('Na hora de servir, complete com a água com gás.', 'At serving time, top up with the sparkling water.')],
   None, ('Concentrado em dobro + gás na hora = bebida com cor e sabor de refrigerante, sem corantes.', 'Double concentrate + fizz at the last moment = soda colour and taste, no dyes.')),
 R(5, ('Bolo de Caneca com Chá', 'Tea Mug Cake'), ('Três minutos no micro-ondas.', 'Three minutes in the microwave.'), False, '5 min', ('1 caneca', '1 mug'), True, 'easy',
   [('4 c. sopa', '4 tbsp', 'farinha de trigo', 'plain flour'), ('3 c. sopa', '3 tbsp', 'açúcar', 'sugar'), ('1 c. chá', '1 tsp', 'blend moído no pilão (Earl Grey, Chai ou Natal)', 'blend ground in a mortar (Earl Grey, Chai or Christmas)'), ('1', '1', 'ovo', 'egg'), ('3 c. sopa', '3 tbsp', 'leite', 'milk'), ('2 c. sopa', '2 tbsp', 'óleo', 'oil'), ('½ c. chá', '½ tsp', 'fermento', 'baking powder')],
   [('Misture os secos na caneca.', 'Mix the dry ingredients in the mug.'), ('Junte ovo, leite e óleo e mexa com garfo até ficar liso.', 'Add egg, milk and oil and stir with a fork until smooth.'), ('Micro-ondas na potência alta por 1 min 30 s a 2 min.', 'Microwave on high for 1 min 30 s to 2 min.')],
   ('Uma colher de iogurte por cima.', 'A spoon of yoghurt on top.'), ('Moa só as folhas e especiarias; tire pedaços duros de fruta antes.', 'Grind only the leaves and spices; remove hard fruit pieces first.'), milk=True),
 R(6, ('Biscoitos de Natal com Chá', 'Christmas Tea Biscuits'), ('Para presentear junto com o blend.', 'To gift along with the blend.'), False, ('30 min + 30 min', '30 min + 30 min'), ('≈ 30 biscoitos', '≈ 30 biscuits'), True, 'mid',
   [('200 g', '200 g', 'farinha de trigo', 'plain flour'), ('100 g', '100 g', 'manteiga gelada', 'cold butter'), ('80 g', '80 g', 'açúcar mascavo', 'brown sugar'), ('1', '1', 'ovo', 'egg'), ('2 c. sopa', '2 tbsp', 'blend Natal Especiado moído fino', 'finely ground Spiced Christmas blend'), ('1 pitada', '1 pinch', 'sal', 'salt')],
   [('Esfarele farinha, blend, sal e manteiga com as pontas dos dedos.', 'Rub the flour, blend, salt and butter together with your fingertips.'), ('Junte açúcar e ovo e forme uma massa. Geladeira por 30 min.', 'Add sugar and egg and form a dough. Chill for 30 min.'),
    ('Abra com 4 mm, corte com cortadores e asse a 170 °C por 12 a 14 min.', 'Roll to 4 mm, cut with cutters and bake at 170 °C for 12 to 14 min.')],
   ('Açúcar de confeiteiro com canela.', 'Icing sugar with cinnamon.'), ('Uma lata de biscoitos + um pacote de 50 g do mesmo blend é um kit de presente pronto.', 'A tin of biscuits + a 50 g pack of the same blend is a ready-made gift kit.'), milk=True),
]

ING = [
 ('Chá preto', 'Black tea', 'base', 'base', '50–90%', ('Assam para corpo, Ceylon para brilho', 'Assam for body, Ceylon for brightness')),
 ('Chá verde', 'Green tea', 'base', 'base', '50–80%', ('Prefira chinês: aguenta melhor misturas', 'Prefer Chinese: it holds up better in blends')),
 ('Chá branco', 'White tea', 'base', 'base', '50–80%', ('Delicado: aromas leves', 'Delicate: light aromas')),
 ('Oolong', 'Oolong', 'base', 'base', '60–85%', ('Folhas enroladas expandem: pese bem', 'Rolled leaves expand: weigh carefully')),
 ('Rooibos', 'Rooibos', 'base', 'base', '50–80%', ('Sem cafeína; aceita tudo', 'Caffeine-free; takes anything')),
 ('Erva-mate', 'Yerba mate', 'base', 'base', '60–80%', ('Verde ou tostada', 'Green or toasted')),
 ('Camomila', 'Chamomile', ('base/aroma', 'base/aroma'), ('base/aroma', 'base/aroma'), '20–70%', ('Flores quebram: misture com cuidado', 'Flowers crumble: mix gently')),
 ('Hibisco', 'Hibiscus', ('base/cor', 'base/colour'), ('base/cor', 'base/colour'), '20–50%', ('Domina a cor e a acidez', 'Dominates colour and acidity')),
 ('Maçã desidratada', 'Dried apple', ('corpo', 'body'), ('corpo', 'body'), '10–30%', ('Doçura neutra', 'Neutral sweetness')),
 ('Manga, abacaxi, pera', 'Mango, pineapple, pear', ('corpo', 'body'), ('corpo', 'body'), '10–30%', ('Cubos pequenos e bem secos', 'Small, very dry cubes')),
 ('Frutas vermelhas', 'Red berries', ('corpo', 'body'), ('corpo', 'body'), '10–30%', ('Liofilizadas dão mais cor', 'Freeze-dried give more colour')),
 ('Coco em lascas', 'Coconut chips', ('corpo', 'body'), ('corpo', 'body'), '10–20%', ('Gordura: validade curta', 'Fat: short shelf life')),
 ('Nibs de cacau', 'Cacao nibs', ('corpo', 'body'), ('corpo', 'body'), '10–20%', ('Tostados, sem açúcar', 'Roasted, unsweetened')),
 ('Arroz tostado', 'Toasted rice', ('corpo', 'body'), ('corpo', 'body'), '20–50%', ('Base de genmaicha', 'Genmaicha base')),
 ('Cevada tostada', 'Roasted barley', ('corpo', 'body'), ('corpo', 'body'), '20–60%', ('Sabor de café, sem cafeína', 'Coffee taste, no caffeine')),
 ('Castanhas e amêndoas', 'Nuts and almonds', ('corpo', 'body'), ('corpo', 'body'), '5–15%', ('Alergênico: declare', 'Allergen: declare it')),
 ('Casca de laranja', 'Orange peel', ('aroma', 'aroma'), ('aroma', 'aroma'), '5–20%', ('Sem a parte branca', 'No pith')),
 ('Casca de limão', 'Lemon or lime peel', ('aroma', 'aroma'), ('aroma', 'aroma'), '5–15%', ('Mais ácida que a de laranja', 'Sharper than orange')),
 ('Capim-cidreira', 'Lemongrass', ('aroma', 'aroma'), ('aroma', 'aroma'), '10–35%', ('Corte em 5 mm', 'Cut to 5 mm')),
 ('Hortelã', 'Mint', ('aroma', 'aroma'), ('aroma', 'aroma'), '10–50%', ('Pimenta domina; comum é suave', 'Peppermint dominates; spearmint is gentle')),
 ('Gengibre seco', 'Dried ginger', ('aroma', 'aroma'), ('aroma', 'aroma'), '5–35%', ('Picância cresce com o tempo', 'Heat builds with time')),
 ('Canela', 'Cinnamon', ('aroma', 'aroma'), ('aroma', 'aroma'), '5–15%', ('Em lascas, nunca em pó', 'In chips, never powder')),
 ('Cardamomo', 'Cardamom', ('aroma', 'aroma'), ('aroma', 'aroma'), '3–12%', ('Amasse as bagas', 'Crush the pods')),
 ('Cravo', 'Clove', ('aroma', 'aroma'), ('aroma', 'aroma'), '1–5%', ('Muito forte', 'Very strong')),
 ('Anis-estrelado', 'Star anise', ('aroma', 'aroma'), ('aroma', 'aroma'), '1–5%', ('Quebre em pontas', 'Break into points')),
 ('Pimenta-preta e rosa', 'Black and pink pepper', ('aroma', 'aroma'), ('aroma', 'aroma'), '1–5%', ('Toque, não protagonista', 'An accent, not a lead')),
 ('Erva-doce', 'Fennel seed', ('aroma', 'aroma'), ('aroma', 'aroma'), '5–30%', ('Doçura anisada', 'Aniseed sweetness')),
 ('Alecrim', 'Rosemary', ('aroma', 'aroma'), ('aroma', 'aroma'), '3–10%', ('Resinoso; pouco basta', 'Resinous; a little goes far')),
 ('Melissa', 'Lemon balm', ('aroma', 'aroma'), ('aroma', 'aroma'), '10–40%', ('Aroma volátil: use fresca e recente', 'Volatile aroma: use recent harvests')),
 ('Cúrcuma', 'Turmeric', ('aroma/cor', 'aroma/colour'), ('aroma/cor', 'aroma/colour'), '5–40%', ('Mancha: avise no rótulo', 'Stains: warn on the label')),
 ('Alcaçuz', 'Liquorice root', ('acabamento', 'finish'), ('acabamento', 'finish'), '2–10%', ('Doçura intensa; evite para hipertensos', 'Intense sweetness; avoid with high blood pressure')),
 ('Baunilha', 'Vanilla', ('acabamento', 'finish'), ('acabamento', 'finish'), '1–5%', ('Fava em pedaços', 'Pod in pieces')),
 ('Lavanda', 'Lavender', ('acabamento', 'finish'), ('acabamento', 'finish'), '1–5%', ('Acima de 5% vira sabonete', 'Above 5% tastes of soap')),
 ('Pétalas de rosa', 'Rose petals', ('acabamento', 'finish'), ('acabamento', 'finish'), '2–15%', ('Grau alimentício', 'Food-grade')),
 ('Calêndula', 'Calendula', ('acabamento', 'finish'), ('acabamento', 'finish'), '2–10%', ('Cor, pouco sabor', 'Colour, little taste')),
 ('Centáurea', 'Cornflower', ('acabamento', 'finish'), ('acabamento', 'finish'), '1–5%', ('Azul, puramente visual', 'Blue, purely visual')),
 ('Jasmim', 'Jasmine flowers', ('acabamento', 'finish'), ('acabamento', 'finish'), '2–10%', ('Intenso e floral', 'Intense and floral')),
 ('Matcha', 'Matcha', ('acabamento', 'finish'), ('acabamento', 'finish'), '3–8%', ('Cobre as folhas e dá cor', 'Coats the leaves and adds colour')),
]


def ing_table(a, b):
    rows = [[(x[0], x[1]), x[2] if isinstance(x[2], tuple) else (x[2], x[3] if not isinstance(x[3], tuple) else x[3][1]), x[4], x[5]] for x in ING[a:b]]
    return T([('Ingrediente', 'Ingredient'), ('Camada', 'Layer'), ('Faixa', 'Range'), ('Dica', 'Tip')], rows, cls='data compact')


def calc_sheet(lang):
    h = [tr(x, lang) for x in [('Ingrediente', 'Ingredient'), ('%', '%'), ('20 g', '20 g'), ('100 g', '100 g'), ('250 g', '250 g'), ('500 g', '500 g'), ('1 kg', '1 kg')]]
    ex = [(('chá preto', 'black tea'), 60), (('casca de laranja', 'orange peel'), 15), (('canela', 'cinnamon'), 10), (('amêndoa', 'almond'), 10), (('cravo e anis', 'clove and anise'), 5)]
    fmt = lambda v: (f'{v:g}'.replace('.', ',') if lang == 'pt' else f'{v:g}')
    rows = ''.join(f'<tr><td>{esc(tr(n, lang))}</td><td>{p}</td>' + ''.join(f'<td>{fmt(p * w / 100)} g</td>' for w in (20, 100, 250, 500, 1000)) + '</tr>' for n, p in ex)
    blank = ''.join('<tr>' + '<td style="height:8mm"></td>' * 7 + '</tr>' for _ in range(8))
    return f'<table class="data compact"><thead><tr>{"".join(f"<th>{esc(x)}</th>" for x in h)}</tr></thead><tbody>{rows}</tbody></table>' + \
           f'<h3>{esc(tr(("Sua fórmula", "Your formula"), lang))}</h3><table class="data compact"><thead><tr>{"".join(f"<th>{esc(x)}</th>" for x in h)}</tr></thead><tbody>{blank}<tr><td><b>Total</b></td><td>100</td><td>20 g</td><td>100 g</td><td>250 g</td><td>500 g</td><td>1 kg</td></tr></tbody></table>'


def cost_sheet(lang):
    lines = [('Ingredientes (custo por grama × gramas)', 'Ingredients (cost per gram × grams)'), ('Embalagem (lata, sachê, saco)', 'Packaging (tin, pouch, bag)'), ('Rótulo e etiqueta', 'Label and tag'),
             ('Perdas (10% dos ingredientes)', 'Waste (10% of ingredients)'), ('Seu tempo (minutos × valor/minuto)', 'Your time (minutes × rate per minute)'), ('Taxas (plataforma, cartão, frete)', 'Fees (platform, card, shipping)')]
    rows = ''.join(f'<tr><td>{esc(tr(l, lang))}</td><td style="width:40mm"></td></tr>' for l in lines)
    tot = [('Custo total', 'Total cost'), ('× margem (2 a 3)', '× markup (2 to 3)'), ('Preço de venda', 'Selling price')]
    rows += ''.join(f'<tr><td><b>{esc(tr(l, lang))}</b></td><td></td></tr>' for l in tot)
    return f'<table class="data"><thead><tr><th>{esc(tr(("Item", "Item"), lang))}</th><th>{esc(tr(("Valor", "Amount"), lang))}</th></tr></thead><tbody>{rows}</tbody></table>'


def extra():
    chF = ('Mais dezoito fórmulas', 'Eighteen more formulas')
    chR = ('Receitas com seus blends', 'Recipes with your blends')
    chT = ('Técnicas de ateliê', 'Studio techniques')
    chA = ('Produção e presentes', 'Production and gifts')
    pages = [opener('IV', chF, ('Estações, festas e o dia a dia', 'Seasons, festivities and everyday'),
                    [('Fórmulas pensadas para o calendário brasileiro: Natal, festa junina, verão e inverno, além de clássicos como breakfast, Earl Grey e genmaicha com matcha.', 'Formulas designed for the Brazilian calendar: Christmas, June festivals, summer and winter, plus classics like breakfast, Earl Grey and genmaicha with matcha.')])]
    for i in range(0, len(F2), 6):
        pages.append(text(None, body=grid(2, *[M(21 + j, F2[j][0], F2[j][1], F2[j][3], F2[j][4], meta=F2[j][2]) for j in range(i, min(i + 6, len(F2)))]), chapter=chF))
    pages += [opener('V', chR, ('Do pote para a mesa', 'From the jar to the table'),
                     [('Seis receitas que transformam os blends em latte, quentão, xarope, refrigerante natural e doces para presentear.', 'Six recipes that turn your blends into lattes, quentão, syrups, natural soda and sweets to give as gifts.')],
                     [(r['name']['pt'], r['name']['en']) for r in RECIPES])]
    pages += recipe_pages(RECIPES)
    pages += [opener('VI', chT, ('Secar, tostar, aromatizar', 'Dry, roast, scent'),
                     [('Produzir parte dos ingredientes em casa barateia os blends e dá um sabor que não se compra pronto.', 'Making some ingredients at home lowers costs and gives flavour you cannot buy ready-made.')],
                     [('Secar frutas e cascas', 'Drying fruit and peel'), ('Tostar grãos e folhas', 'Roasting grains and leaves'), ('Aromatizar com segurança', 'Scenting safely'), ('38 ingredientes do blender', '38 blender ingredients')]),
              text(('Secar frutas e cascas', 'Drying fruit and peel'), eyebrow=chT, chapter=chT,
                   lead=('Forno na temperatura mais baixa (60 a 70 °C), porta entreaberta, assadeira com papel-manteiga.', 'Oven at the lowest setting (60 to 70 °C), door ajar, tray lined with baking paper.'),
                   body=join(T([('Ingrediente', 'Ingredient'), ('Corte', 'Cut'), ('Tempo', 'Time'), ('Pronto quando', 'Ready when')],
                               [[('Casca de laranja e limão', 'Orange and lemon peel'), ('tiras de 5 mm, sem a parte branca', '5 mm strips, no pith'), ('1–2 h', '1–2 h'), ('quebra com estalo', 'snaps cleanly')],
                                [('Maçã e pera', 'Apple and pear'), ('lâminas de 3 mm, depois cubos', '3 mm slices, then cubes'), ('3–4 h', '3–4 h'), ('seca e flexível', 'dry and leathery')],
                                [('Abacaxi e manga', 'Pineapple and mango'), ('cubos de 8 mm', '8 mm cubes'), ('5–7 h', '5–7 h'), ('sem umidade ao apertar', 'no moisture when pressed')],
                                [('Morango', 'Strawberry'), ('lâminas de 4 mm', '4 mm slices'), ('3–4 h', '3–4 h'), ('crocante', 'crisp')],
                                [('Gengibre', 'Ginger'), ('lâminas de 2 mm', '2 mm slices'), ('2–3 h', '2–3 h'), ('quebradiço', 'brittle')],
                                [('Pétalas e flores', 'Petals and flowers'), ('inteiras', 'whole'), ('à sombra, 3–5 dias', 'in the shade, 3–5 days'), ('crocantes, com cor', 'crisp, colour kept')]], cls='data compact'),
                             H3('O teste do pote', 'The jar test'),
                             P(('Antes de misturar, deixe o ingrediente seco num pote fechado por 2 dias. Se aparecer vapor na tampa ou ele amolecer, volte ao forno. Umidade é o que estraga um blend inteiro.', 'Before blending, keep the dried ingredient in a closed jar for 2 days. If condensation appears on the lid or it softens, return it to the oven. Moisture is what ruins a whole blend.')),
                             TIP('Mergulhar maçã e pera em água com limão por 5 minutos antes de secar evita que escureçam.', 'Dipping apple and pear in lemon water for 5 minutes before drying stops them from browning.'))),
              text(('Tostar grãos e folhas', 'Roasting grains and leaves'), eyebrow=chT, chapter=chT,
                   lead=('A torra traz notas de caramelo, pão e café, e reduz o amargor.', 'Roasting brings caramel, bread and coffee notes, and reduces bitterness.'),
                   body=join(T([('O quê', 'What'), ('Como', 'How'), ('Tempo', 'Time'), ('Ponto', 'Done when')],
                               [[('Arroz para genmaicha', 'Rice for genmaicha'), ('Arroz cozido e seco no forno, depois frigideira seca', 'Cooked rice dried in the oven, then a dry pan'), ('10–15 min', '10–15 min'), ('dourado, alguns estouram', 'golden, some pop')],
                                [('Cevada', 'Barley'), ('Frigideira seca, fogo médio, mexendo', 'Dry pan, medium heat, stirring'), ('15–20 min', '15–20 min'), ('marrom-café, cheiro de pão', 'coffee-brown, bread smell')],
                                [('Chá verde em "hojicha caseira"', 'Green tea as "home hojicha"'), ('Frigideira seca, fogo médio-baixo, sem parar', 'Dry pan, medium-low heat, constantly'), ('3–5 min', '3–5 min'), ('marrom-avelã, fumaça leve', 'hazelnut-brown, light smoke')],
                                [('Coco e amêndoas', 'Coconut and almonds'), ('Forno a 160 °C', 'Oven at 160 °C'), ('6–10 min', '6–10 min'), ('dourado claro', 'light golden')],
                                [('Especiarias', 'Spices'), ('Frigideira seca', 'Dry pan'), ('1–2 min', '1–2 min'), ('perfumam a cozinha', 'they scent the kitchen')]], cls='data compact'),
                             WARN('Esfrie tudo completamente antes de misturar ou embalar. Ingrediente morno solta vapor e cria umidade dentro do pote.', 'Cool everything completely before blending or packing. Warm ingredients release steam and create moisture in the jar.', ('Atenção', 'Note')),
                             TIP('Bancha e folhas baratas de chá verde viram ótima hojicha caseira. É um jeito de aproveitar chá verde que perdeu o frescor.', 'Bancha and cheap green tea leaves make excellent home hojicha. It is a way to use green tea that has lost its freshness.'))),
              text(('Aromatizar com segurança', 'Scenting safely'), eyebrow=chT, chapter=chT,
                   lead=('Do método natural ao óleo essencial, sempre de grau alimentício.', 'From the natural method to essential oils, always food-grade.'),
                   body=join(grid(2,
                                  C(('Perfumar com flores', 'Scenting with flowers'), ('O método do jasmim', 'The jasmine method'), [('Camadas de chá e flores frescas num pote fechado por 12 a 24 h; retire as flores e repita até 3 vezes. É assim que se faz o chá de jasmim tradicional.', 'Layers of tea and fresh flowers in a closed jar for 12 to 24 h; remove the flowers and repeat up to 3 times. This is how traditional jasmine tea is made.')]),
                                  C(('Casca e fava', 'Peel and pod'), ('Sem nenhum óleo', 'No oil at all'), [('Raspas frescas de laranja ou uma fava de baunilha aberta no pote do blend por 1 semana perfumam todo o chá. Retire antes de embalar.', 'Fresh orange zest or a split vanilla pod in the blend jar for 1 week scents all the tea. Remove before packing.')]),
                                  C(('Óleo essencial alimentício', 'Food-grade essential oil'), ('Dose mínima', 'Minimal dose'), [('Pingue as gotas na casca seca ou na fruta (não no chá), misture num pote fechado e descanse 48 h. Comece com 2 a 3 gotas por 100 g de blend.', 'Drop the oil onto dried peel or fruit (not the tea), mix in a closed jar and rest 48 h. Start with 2 to 3 drops per 100 g of blend.')]),
                                  C(('O que evitar', 'What to avoid'), ('Por segurança e sabor', 'For safety and taste'), [('Óleos de aromaterapia (não são para ingestão), aromas artificiais em excesso, perfumar o blend inteiro com óleo direto na folha e misturar aromatizados com não aromatizados no mesmo pote.', 'Aromatherapy oils (not for ingestion), excessive artificial flavourings, dosing oil straight onto the leaves and storing flavoured with unflavoured teas in the same jar.')])),
                             WARN('Óleos essenciais concentrados podem ser tóxicos. Use apenas produtos rotulados como próprios para alimentos e respeite a dose do fabricante.', 'Concentrated essential oils can be toxic. Use only products labelled as food-grade and follow the manufacturer\'s dosage.', ('Segurança', 'Safety')))),
              text(('38 ingredientes do blender', '38 blender ingredients'), eyebrow=chT, chapter=chT,
                   lead=('Faixas de uso em porcentagem do peso do blend. Comece pelo meio da faixa.', 'Usage ranges as a percentage of blend weight. Start in the middle of the range.'),
                   body=ing_table(0, 19)),
              text(None, eyebrow=chT, chapter=chT, body=ing_table(19, 38)),
              text(('Calculadora de lote', 'Batch calculator'), eyebrow=chA, chapter=chA, toc=chA,
                   lead=('Com a fórmula em porcentagem, qualquer quantidade é uma conta simples: peso total × % ÷ 100.', 'With the formula as percentages, any quantity is simple maths: total weight × % ÷ 100.'),
                   body=lambda lang: f'<h3>{esc(tr(("Exemplo: Natal Especiado", "Example: Spiced Christmas"), lang))}</h3>' + calc_sheet(lang)),
              text(('Custo e preço', 'Cost and price'), eyebrow=chA, chapter=chA, toc=('Custo e preço', 'Cost and price'), sub_toc=True,
                   lead=('Antes de vender, saiba quanto custa cada pacote. Preencha para um pacote de 50 g.', 'Before selling, know what each pack costs. Fill this in for a 50 g pack.'),
                   body=join(lambda lang: cost_sheet(lang),
                             H3('Exemplo', 'Example'),
                             P(('Ingredientes R$ 4,00 + lata R$ 6,00 + rótulo R$ 1,00 + perdas R$ 0,40 + tempo R$ 3,00 + taxas R$ 2,00 = R$ 16,40 de custo. Com margem de 2,5, o preço fica em torno de R$ 41,00. Compare com o mercado e ajuste a embalagem, que costuma ser o maior custo.', 'Ingredients R$ 4.00 + tin R$ 6.00 + label R$ 1.00 + waste R$ 0.40 + time R$ 3.00 + fees R$ 2.00 = R$ 16.40 in cost. With a 2.5 markup, the price is around R$ 41.00. Compare with the market and adjust the packaging, which is often the biggest cost.')),
                             TIP('Sachês metalizados custam uma fração das latas. Ofereça a lata só na primeira compra e refis em sachê depois.', 'Foil pouches cost a fraction of tins. Offer the tin only on the first purchase and pouch refills after that.'))),
              text(('Kits de presente', 'Gift kits'), eyebrow=chA, chapter=chA, toc=('Kits de presente', 'Gift kits'), sub_toc=True,
                   lead=('Blends são presentes perfeitos: leves, duráveis e pessoais.', 'Blends make perfect gifts: light, long-lasting and personal.'),
                   body=join(grid(2,
                                  C(('Kit Degustação', 'Tasting Kit'), ('3 blends × 20 g', '3 blends × 20 g'), [('Um com cafeína, um sem e um frutado, com um cartão explicando como preparar cada um.', 'One caffeinated, one caffeine-free and one fruity, with a card explaining how to brew each.')]),
                                  C(('Kit Natal', 'Christmas Kit'), ('Blend + biscoitos', 'Blend + biscuits'), [('Natal Especiado 50 g, biscoitos da receita 6 e uma fita dourada. Prepare em novembro.', 'Spiced Christmas 50 g, biscuits from recipe 6 and a gold ribbon. Make it in November.')]),
                                  C(('Kit Noite', 'Night Kit'), ('Sem cafeína', 'Caffeine-free'), [('Coco & Baunilha, Rooibos Brasil, uma caneca e um infusor. Ótimo para quem está estressado.', 'Coconut & Vanilla, Rooibos Brazil, a mug and an infuser. Great for someone stressed.')]),
                                  C(('Kit Faça seu Blend', 'Make-your-own Kit'), ('Experiência', 'Experience'), [('Uma base, quatro potinhos de aroma e uma ficha de teste deste guia: quem ganha monta o próprio blend.', 'A base, four little aroma jars and a testing sheet from this guide: the recipient builds their own blend.')])),
                             H3('Detalhes que valorizam', 'Details that add value'),
                             B(('Cartão com modo de preparo e a história do blend.', 'A card with brewing instructions and the story of the blend.'), ('Etiqueta escrita à mão ou carimbo.', 'A handwritten label or a stamp.'), ('Um ramo seco de alecrim, lavanda ou canela amarrado no laço.', 'A dried sprig of rosemary, lavender or cinnamon tied into the bow.'), ('Data de produção visível: mostra que é fresco.', 'A visible production date: it shows freshness.')))),
              text(('Ficha técnica do blend', 'Blend specification sheet'), eyebrow=chA, chapter=chA, toc=('Ficha técnica do blend', 'Blend specification sheet'), sub_toc=True,
                   lead=('Uma ficha por blend aprovado. É o que garante que o lote 10 seja igual ao lote 1.', 'One sheet per approved blend. It is what makes batch 10 taste like batch 1.'),
                   body=lambda lang: sheet(lang, [('Nome do blend', 'Blend name'), ('Fórmula final (%)', 'Final formula (%)'), ('Fornecedores e lotes', 'Suppliers and batches'), ('Preparo recomendado', 'Recommended brewing'),
                                                  ('Cafeína e alergênicos', 'Caffeine and allergens'), ('Validade e embalagem', 'Shelf life and packaging'), ('Preço de custo e de venda', 'Cost and selling price'), ('Observações', 'Notes')])),
              ]
    return pages


GUIDE = extend(base.GUIDE, extra)
