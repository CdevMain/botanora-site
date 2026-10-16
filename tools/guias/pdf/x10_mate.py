from common import *
import g10_mate as base

RECIPES = [
 R(13, ('Mate Cocido com Leite', 'Mate Cocido with Milk'), ('O mate fervido da Argentina e do Paraguai, café da manhã de muitas famílias.', 'Boiled mate from Argentina and Paraguay, breakfast for many families.'), False, '8 min', ('2 canecas', '2 mugs'), True, 'easy',
   [('2 c. sopa', '2 tbsp', 'erva-mate', 'yerba mate'), ('1 c. sopa', '1 tbsp', 'açúcar', 'sugar'), ('250 ml', '250 ml', 'água', 'water'), ('250 ml', '250 ml', 'leite', 'milk')],
   [('Caramelize levemente o açúcar com a erva numa leiteira, mexendo, por 1 min.', 'Lightly caramelise the sugar with the yerba in a small pan, stirring, for 1 min.'), ('Junte a água e ferva 2 min.', 'Add the water and simmer 2 min.'), ('Junte o leite, aqueça sem ferver e coe.', 'Add the milk, heat without boiling and strain.')],
   ('Com pão de queijo ou chipa (receita 16).', 'With cheese bread or chipa (recipe 16).'), ('Caramelizar a erva com açúcar é o segredo da versão tradicional: suaviza o amargor.', 'Caramelising the yerba with sugar is the secret of the traditional version: it softens the bitterness.'), milk=True),
 R(14, ('Tererê de Maracujá e Hortelã', 'Passion Fruit & Mint Tereré'), ('A versão de suco mais pedida no Mato Grosso do Sul.', 'The most requested juice version in Mato Grosso do Sul.'), True, '10 min', ('guampa + 1 L', 'guampa + 1 L'), True, 'easy',
   [('⅔ da guampa', '⅔ of the guampa', 'erva para tererê', 'tereré yerba'), ('2', '2', 'maracujás (polpa)', 'passion fruits (pulp)'), ('1 L', '1 L', 'água gelada', 'iced water'), ('8 folhas', '8 leaves', 'hortelã', 'mint'), ('2 c. sopa', '2 tbsp', 'açúcar (opcional)', 'sugar (optional)')],
   [('Bata a polpa com a água, a hortelã e o açúcar e coe.', 'Blend the pulp with the water, mint and sugar and strain.'), ('Leve à jarra térmica com bastante gelo.', 'Pour into an insulated jug with plenty of ice.'), ('Monte a guampa e sirva o suco rodada a rodada.', 'Set up the guampa and pour the juice round after round.')],
   None, ('Suco muito doce entope a bomba e gruda na erva: prefira pouco açúcar.', 'Very sweet juice clogs the bombilla and sticks to the yerba: go light on sugar.')),
 R(15, ('Bolo de Chá-mate com Laranja', 'Mate & Orange Cake'), ('Bolo de tarde, perfumado e úmido.', 'An afternoon cake, fragrant and moist.'), False, '1 h', ('1 forma média', '1 medium tin'), True, 'easy',
   [('200 ml', '200 ml', 'chá-mate tostado forte (3 c. sopa em 200 ml)', 'strong toasted mate (3 tbsp in 200 ml)'), ('3', '3', 'ovos', 'eggs'), ('200 g', '200 g', 'açúcar', 'sugar'), ('120 ml', '120 ml', 'óleo', 'oil'), ('240 g', '240 g', 'farinha de trigo', 'plain flour'), ('1 c. sopa', '1 tbsp', 'fermento', 'baking powder'), ('1', '1', 'raspas e suco de laranja', 'orange zest and juice')],
   [('Bata ovos, açúcar e óleo até ficar claro.', 'Beat the eggs, sugar and oil until pale.'), ('Junte o chá-mate frio, as raspas e a farinha. Por último, o fermento.', 'Add the cold mate, zest and flour. Finally the baking powder.'),
    ('Asse a 180 °C por 40 min.', 'Bake at 180 °C for 40 min.'), ('Ainda quente, regue com suco de laranja e 2 c. sopa de açúcar.', 'While warm, drizzle with orange juice and 2 tbsp sugar.')],
   None, ('O mate tostado tem notas de caramelo que combinam com laranja e canela.', 'Toasted mate has caramel notes that pair with orange and cinnamon.')),
 R(16, ('Chipa', 'Chipa'), ('O pão de queijo paraguaio, parceiro do tererê.', 'Paraguayan cheese bread, tereré\'s partner.'), False, '40 min', ('≈ 20 unidades', '≈ 20 pieces'), False, 'mid',
   [('500 g', '500 g', 'polvilho doce', 'sweet tapioca starch'), ('200 g', '200 g', 'queijo meia-cura ralado', 'grated semi-hard cheese'), ('100 g', '100 g', 'manteiga', 'butter'), ('2', '2', 'ovos', 'eggs'), ('100 ml', '100 ml', 'leite', 'milk'), ('1 c. chá', '1 tsp', 'sal e 1 c. chá de erva-doce', 'salt and 1 tsp fennel seed')],
   [('Misture o polvilho com a manteiga até virar uma farofa.', 'Rub the starch and butter together into crumbs.'), ('Junte queijo, ovos, sal e erva-doce. Acrescente leite aos poucos até a massa ficar lisa e modelável.', 'Add the cheese, eggs, salt and fennel. Add the milk gradually until the dough is smooth and mouldable.'),
    ('Modele roscas ou bolinhas.', 'Shape into rings or balls.'), ('Asse a 200 °C por 20 a 25 min, até dourar por baixo.', 'Bake at 200 °C for 20 to 25 min, until golden underneath.')],
   None, ('Diferente do pão de queijo mineiro, a chipa leva massa sem escaldar: fica mais firme e dura mais.', 'Unlike Brazilian pão de queijo, chipa dough is not scalded: it is firmer and keeps longer.'), milk=True),
 R(17, ('Xarope de Mate', 'Mate Syrup'), ('Para gelados, drinques e sobremesas.', 'For iced drinks, mocktails and desserts.'), False, '15 min', ('1 garrafa · 300 ml', '1 bottle · 300 ml'), True, 'easy',
   [('4 c. sopa', '4 tbsp', 'chá-mate tostado', 'toasted mate tea'), ('250 ml', '250 ml', 'água fervente', 'boiling water'), ('200 g', '200 g', 'açúcar mascavo ou rapadura', 'brown sugar or panela')],
   [('Infunda o mate por 8 min e coe bem.', 'Steep the mate for 8 min and strain well.'), ('Dissolva o açúcar no chá e ferva 3 min.', 'Dissolve the sugar in the tea and simmer 3 min.'), ('Esfrie e engarrafe.', 'Cool and bottle.')],
   None, ('Uma colher em água com gás e limão vira um refrigerante de mate. Dura 3 semanas na geladeira.', 'A spoonful in sparkling water with lime makes a mate soda. Keeps 3 weeks in the fridge.')),
 R(18, ('Cookies de Mate e Chocolate Branco', 'Mate & White Chocolate Cookies'), ('Verde-oliva, crocantes por fora.', 'Olive-green, crisp outside.'), False, ('25 min + 30 min', '25 min + 30 min'), ('≈ 18 cookies', '≈ 18 cookies'), True, 'easy',
   [('115 g', '115 g', 'manteiga', 'butter'), ('150 g', '150 g', 'açúcar mascavo', 'brown sugar'), ('1', '1', 'ovo', 'egg'), ('200 g', '200 g', 'farinha de trigo', 'plain flour'), ('1 c. sopa', '1 tbsp', 'erva-mate moída fina e peneirada', 'finely ground, sifted yerba mate'), ('½ c. chá', '½ tsp', 'bicarbonato', 'baking soda'), ('100 g', '100 g', 'chocolate branco picado', 'chopped white chocolate')],
   [('Bata manteiga e açúcar, junte o ovo.', 'Beat the butter and sugar, add the egg.'), ('Misture farinha, mate e bicarbonato; depois o chocolate.', 'Mix in the flour, mate and soda; then the chocolate.'), ('Geladeira por 30 min. Bolinhas espaçadas, 180 °C por 11 min.', 'Chill 30 min. Spaced balls, 180 °C for 11 min.')],
   None, ('Moa a erva no liquidificador e peneire: só o pó fino vai na massa.', 'Grind the yerba in a blender and sift: only the fine powder goes in the dough.'), milk=True),
]


def extra():
    ch = ('Mais receitas e dúvidas', 'More recipes and questions')
    rp = recipe_pages(RECIPES)
    rp[0].update(toc=L('Mais seis receitas', 'Six more recipes'), toc_key='·', chapter=L(*ch))
    return rp + [
        text(('Cuias e bombas', 'Gourds and bombillas'), eyebrow=ch, chapter=ch, toc=('Cuias e bombas', 'Gourds and bombillas'),
             lead=('Como escolher o equipamento que vai durar anos.', 'How to choose gear that will last for years.'),
             body=join(T([('Cuia', 'Gourd'), ('Prós', 'Pros'), ('Contras', 'Cons')],
                         [[('Porongo', 'Calabash'), ('Tradicional, sabor que melhora com o uso', 'Traditional, flavour improves with use'), ('Precisa de cura e cuidado contra mofo', 'Needs curing and care against mould')],
                          [('Madeira (palo santo, algarrobo)', 'Wood (palo santo, algarrobo)'), ('Aroma próprio, bonita', 'Its own aroma, beautiful'), ('Pode rachar; também precisa de cura', 'Can crack; also needs curing')],
                          [('Cerâmica ou vidro', 'Ceramic or glass'), ('Higiene fácil, sem cura, sem gosto', 'Easy hygiene, no curing, no taste'), ('Esquenta a mão; pode quebrar', 'Gets hot; can break')],
                          [('Inox com parede dupla', 'Double-wall steel'), ('Resistente, térmica, prática para viagem', 'Tough, insulated, travel-friendly'), ('Menos tradicional', 'Less traditional')]], cls='data compact'),
                       T([('Bomba', 'Bombilla'), ('Para', 'For'), ('Observação', 'Note')],
                         [[('Bojo com furos', 'Holed bulb'), ('chimarrão de moagem média', 'medium-grind chimarrão'), ('Clássica, fácil de limpar', 'Classic, easy to clean')],
                          [('Mola', 'Spring'), ('erva fina com muito pó', 'fine, dusty yerba'), ('Filtra melhor; desmonte para lavar', 'Filters better; take apart to wash')],
                          [('Bojo largo e achatado', 'Wide flat bulb'), ('tererê e erva grossa', 'tereré and coarse yerba'), ('Não entope com o frio', 'Does not clog in the cold')]], cls='data compact'),
                       TIP('Uma vez por semana, ferva a bomba de inox por 5 minutos ou deixe de molho em água com bicarbonato: tira o resíduo que amarga.', 'Once a week, boil the steel bombilla for 5 minutes or soak it in water with baking soda: it removes the residue that turns bitter.'))),
        text(('Perguntas frequentes', 'Frequently asked questions'), eyebrow=ch, chapter=ch, toc=('Perguntas frequentes', 'Frequently asked questions'),
             body=join(H4('O chimarrão está muito amargo. O que faço?', 'My chimarrão is too bitter. What can I do?'),
                       P(('Baixe a temperatura para 70 °C, use uma erva suave ou nativa, encha só metade da cuia e não deixe a água parada na erva. Se ainda assim for forte, comece pelo chá-mate tostado ou pelo tererê com suco.', 'Lower the temperature to 70 °C, use a mild or native yerba, fill only half the gourd and do not leave water sitting on the yerba. If it is still strong, start with toasted mate tea or tereré with juice.')),
                       H4('Quantas cuias posso tomar por dia?', 'How many gourds a day is OK?'),
                       P(('Depende da sua sensibilidade à cafeína. Uma sessão pode passar de 100 mg. Some ao café e a outros chás e evite tomar nas 6 horas antes de dormir se o sono é sensível.', 'It depends on your caffeine sensitivity. One session can exceed 100 mg. Add it to your coffee and other teas and avoid it in the 6 hours before bed if your sleep is sensitive.')),
                       H4('Posso adoçar?', 'Can I sweeten it?'),
                       P(('No Sul do Brasil, o chimarrão é amargo por tradição. Na Argentina, muita gente adoça. Se adoçar, use uma cuia só para isso: o açúcar fica no porongo.', 'In southern Brazil chimarrão is bitter by tradition. In Argentina many people sweeten it. If you do, keep a gourd just for that: sugar stays in the calabash.')),
                       H4('Quanto tempo dura a erva aberta?', 'How long does opened yerba last?'),
                       P(('A erva verde brasileira perde o frescor em 1 a 2 meses depois de aberta. Feche bem o pacote ou transfira para um pote opaco.', 'Brazilian green yerba loses freshness within 1 to 2 months of opening. Close the pack tightly or move it to an opaque container.')),
                       H4('Compartilhar a bomba é seguro?', 'Is sharing the bombilla safe?'),
                       P(('A roda é parte da tradição, mas a bomba compartilhada transmite gripes e outras infecções. Quando alguém estiver doente, cada um com a sua cuia.', 'The circle is part of the tradition, but a shared bombilla passes on colds and other infections. When someone is unwell, everyone gets their own gourd.')),
                       H4('Por que a erva "lava" tão rápido?', 'Why does the yerba go flat so fast?'),
                       P(('Água quente demais, água no topo da erva ou bomba mexida. Siga a montagem inclinada do capítulo II e sirva sempre no mesmo ponto.', 'Water too hot, water on top of the yerba or a moved bombilla. Follow the tilted set-up in chapter II and always pour in the same spot.')))),
        text(('Do amargo ao hábito', 'From bitter to habit'), eyebrow=ch, chapter=ch, toc=('Do amargo ao hábito', 'From bitter to habit'),
             lead=('Um caminho de quatro semanas para quem nunca tomou chimarrão e quer aprender a gostar.', 'A four-week path for anyone who has never had chimarrão and wants to learn to enjoy it.'),
             body=join(T([('Semana', 'Week'), ('O que tomar', 'What to drink'), ('Por quê', 'Why')],
                         [[('1', '1'), ('Chá-mate tostado com laranja e mel', 'Toasted mate with orange and honey'), ('Mesmo sabor de fundo, sem amargor', 'Same background taste, no bitterness')],
                          [('2', '2'), ('Tererê com suco de frutas', 'Tereré with fruit juice'), ('Primeiro contato com a erva verde, gelada e doce', 'First contact with green yerba, cold and sweet')],
                          [('3', '3'), ('Tererê com água e hortelã', 'Tereré with water and mint'), ('O sabor real da erva, ainda refrescante', 'The real taste of yerba, still refreshing')],
                          [('4', '4'), ('Chimarrão com erva suave, a 70 °C, meia cuia', 'Chimarrão with mild yerba, at 70 °C, half a gourd'), ('Agora o paladar está pronto', 'Now the palate is ready')]], cls='data'),
                       (lambda lang: sheet(lang, [('Erva que mais gostei', 'Yerba I liked most'), ('Temperatura e quantidade ideais', 'Ideal temperature and amount')], [('Amargor', 'Bitterness'), ('Vontade de repetir', 'Want to repeat')])),
                       Q('O primeiro chimarrão é estranho. O décimo já é saudade.', 'The first chimarrão is strange. By the tenth, you will miss it.'))),
    ]


GUIDE = extend(base.GUIDE, extra)
