from common import *
import g07_ervas as base

RECIPES = [
 R(1, ('Capim-cidreira & Maracujá', 'Lemongrass & Passion Fruit'), ('Quente, cítrico e tropical.', 'Hot, citrusy and tropical.'), False, '10 min', ('1 bule · 500 ml', '1 pot · 500 ml'), False, 'easy',
   [('3 folhas', '3 leaves', 'capim-cidreira fresco', 'fresh lemongrass'), ('1', '1', 'maracujá (polpa com sementes)', 'passion fruit (pulp with seeds)'), ('500 ml', '500 ml', 'água a 95 °C', 'water at 95 °C'), ('1 c. chá', '1 tsp', 'mel', 'honey')],
   [('Corte o capim com tesoura em pedaços de 2 cm.', 'Snip the lemongrass into 2 cm pieces.'), ('Infunda com a polpa de maracujá por 7 min, tampado.', 'Steep with the passion fruit pulp for 7 min, covered.'), ('Coe e adoce morno.', 'Strain and sweeten once warm.')],
   None, ('Cortar o capim com tesoura (e não amassar) mantém o perfume sem soltar gosto de grama.', 'Snipping the lemongrass (rather than crushing) keeps the scent without a grassy taste.')),
 R(2, ('Chá de Hortelã à Marroquina', 'Moroccan Mint Tea'), ('Verde gunpowder, hortelã fresca e muito ritual.', 'Gunpowder green, fresh mint and plenty of ritual.'), False, '10 min', ('1 bule · 500 ml', '1 pot · 500 ml'), True, 'mid',
   [('1 c. sopa', '1 tbsp', 'chá verde gunpowder', 'gunpowder green tea'), ('1 maço', '1 bunch', 'hortelã fresca', 'fresh mint'), ('500 ml', '500 ml', 'água fervente', 'boiling water'), ('2 c. sopa', '2 tbsp', 'açúcar (opcional)', 'sugar (optional)')],
   [('Enxágue o chá com 100 ml de água fervente por 30 s e descarte (tira o amargor).', 'Rinse the tea with 100 ml of boiling water for 30 s and discard (removes bitterness).'), ('Junte a hortelã, o açúcar e o resto da água. Infunda 4 min.', 'Add the mint, sugar and the rest of the water. Steep 4 min.'),
    ('Sirva de bem alto para formar espuma e devolva o primeiro copo ao bule. Repita duas vezes.', 'Pour from high up to form foam and return the first glass to the pot. Repeat twice.')],
   ('Copos pequenos de vidro.', 'Small glasses.'), ('Servir do alto mistura o açúcar e esfria o chá até a temperatura de beber.', 'Pouring from a height mixes the sugar and cools the tea to drinking temperature.')),
 R(3, ('Mel de Lavanda e Limão', 'Lavender & Lemon Honey'), ('Mel aromatizado para chás, torradas e iogurte.', 'Flavoured honey for teas, toast and yoghurt.'), False, ('10 min + 1 semana', '10 min + 1 week'), ('1 pote · 250 g', '1 jar · 250 g'), False, 'easy',
   [('250 g', '250 g', 'mel líquido', 'runny honey'), ('1 c. sopa', '1 tbsp', 'lavanda seca culinária', 'dried culinary lavender'), ('1', '1', 'casca de limão-siciliano em tiras, seca por 1 dia', 'lemon peel strips, dried for 1 day')],
   [('Coloque a lavanda e a casca seca num pote escaldado.', 'Put the lavender and dried peel in a scalded jar.'), ('Cubra com o mel morno (não quente) e feche.', 'Cover with warm (not hot) honey and close.'), ('Deixe 1 semana, virando o pote todo dia. Coe se quiser.', 'Leave 1 week, turning the jar daily. Strain if you like.')],
   None, ('Use só ingredientes secos: umidade faz o mel fermentar. Nunca ofereça mel a crianças menores de 1 ano.', 'Use only dry ingredients: moisture makes honey ferment. Never give honey to children under 1 year.')),
 R(4, ('Sal de Ervas do Quintal', 'Backyard Herb Salt'), ('Alecrim, tomilho e sálvia para carnes e legumes.', 'Rosemary, thyme and sage for meat and vegetables.'), False, ('15 min + 1 dia', '15 min + 1 day'), ('1 pote · 200 g', '1 jar · 200 g'), False, 'easy',
   [('1 xícara', '1 cup', 'folhas frescas de alecrim, tomilho e sálvia', 'fresh rosemary, thyme and sage leaves'), ('2', '2', 'dentes de alho', 'garlic cloves'), ('150 g', '150 g', 'sal grosso', 'coarse salt'), ('1', '1', 'raspas de limão', 'lime zest')],
   [('Pique as ervas e o alho com metade do sal até virar uma pasta úmida.', 'Chop the herbs and garlic with half the salt into a damp paste.'), ('Misture o resto do sal e as raspas.', 'Mix in the rest of the salt and the zest.'), ('Espalhe numa assadeira e deixe secar 24 h ao ar, ou 1 h a 60 °C. Guarde em pote.', 'Spread on a tray and air-dry 24 h, or 1 h at 60 °C. Store in a jar.')],
   None, ('O sal seca as ervas e conserva o aroma por meses. Ótimo presente.', 'The salt dries the herbs and keeps the aroma for months. A great gift.')),
 R(5, ('Xarope de Capim-cidreira', 'Lemongrass Syrup'), ('Para adoçar chás gelados, limonadas e drinques.', 'To sweeten iced teas, lemonades and drinks.'), False, '20 min', ('1 garrafa · 300 ml', '1 bottle · 300 ml'), False, 'easy',
   [('200 g', '200 g', 'açúcar', 'sugar'), ('200 ml', '200 ml', 'água', 'water'), ('6 folhas', '6 leaves', 'capim-cidreira picado', 'chopped lemongrass')],
   [('Dissolva o açúcar na água em fogo baixo.', 'Dissolve the sugar in the water over low heat.'), ('Junte o capim, ferva 2 min e desligue.', 'Add the lemongrass, simmer 2 min and turn off.'), ('Tampe por 1 h, coe e engarrafe.', 'Cover for 1 h, strain and bottle.')],
   None, ('Dura 2 semanas na geladeira. Troque o capim por hortelã, manjericão ou alecrim.', 'Keeps 2 weeks in the fridge. Swap the lemongrass for mint, basil or rosemary.')),
 R(6, ('Água de Manjericão e Morango', 'Basil & Strawberry Water'), ('Água aromatizada para o dia todo.', 'Flavoured water for the whole day.'), True, ('5 min + 2 h', '5 min + 2 h'), ('1 jarra · 1 L', '1 jug · 1 L'), False, 'easy',
   [('6', '6', 'morangos em lâminas', 'sliced strawberries'), ('8 folhas', '8 leaves', 'manjericão', 'basil'), ('1 L', '1 L', 'água fria filtrada', 'cold filtered water')],
   [('Bata o manjericão na palma da mão para soltar o aroma.', 'Slap the basil in your palm to release the aroma.'), ('Junte tudo na jarra e leve à geladeira por 2 h.', 'Combine in the jug and chill for 2 h.'), ('Consuma no mesmo dia.', 'Drink the same day.')],
   None, ('Ótima para quem quer beber mais água: sabor sem açúcar nem cafeína.', 'Great for anyone wanting to drink more water: flavour without sugar or caffeine.')),
 R(7, ('Erva-doce com Maçã', 'Fennel and Apple'), ('Doce natural, para depois do almoço.', 'Naturally sweet, for after lunch.'), False, '10 min', ('2 xícaras', '2 cups'), False, 'easy',
   [('1 c. chá', '1 tsp', 'sementes de erva-doce amassadas', 'crushed fennel seeds'), ('½', '½', 'maçã em cubos com casca', 'apple, cubed, skin on'), ('400 ml', '400 ml', 'água', 'water'), ('1', '1', 'pau de canela pequeno', 'small cinnamon stick')],
   [('Ferva a maçã e a canela por 5 min.', 'Simmer the apple and cinnamon for 5 min.'), ('Desligue, junte a erva-doce e tampe por 5 min.', 'Turn off, add the fennel and cover for 5 min.'), ('Coe. Coma os cubos de maçã de colher.', 'Strain. Eat the apple cubes with a spoon.')],
   None, ('Amassar as sementes no pilão libera o óleo: o sabor dobra.', 'Crushing the seeds in a mortar releases the oil: the flavour doubles.')),
 R(8, ('Raspadinha de Hortelã e Limão', 'Mint & Lime Shaved Ice'), ('Sobremesa gelada da horta.', 'An icy garden dessert.'), True, ('10 min + 4 h', '10 min + 4 h'), ('4 taças', '4 glasses'), False, 'easy',
   [('1 maço', '1 bunch', 'hortelã', 'mint'), ('400 ml', '400 ml', 'água fervente', 'boiling water'), ('80 g', '80 g', 'açúcar', 'sugar'), ('2', '2', 'limões (suco)', 'limes (juice)')],
   [('Infunda a hortelã com o açúcar na água por 10 min, tampado.', 'Steep the mint with the sugar in the water for 10 min, covered.'), ('Coe, junte o limão e esfrie.', 'Strain, add the lime and cool.'), ('Congele numa assadeira rasa, raspando com garfo a cada 30 min.', 'Freeze in a shallow tray, scraping with a fork every 30 min.')],
   ('Folhinhas de hortelã.', 'Small mint leaves.'), ('Infusão quente tira mais aroma que hortelã batida crua, e não escurece.', 'A hot infusion pulls more aroma than blended raw mint, and does not turn dark.')),
 R(9, ('Manteiga de Ervas', 'Herb Butter'), ('Para pão, grelhados e legumes.', 'For bread, grills and vegetables.'), False, '10 min', ('1 rolo · 120 g', '1 log · 120 g'), False, 'easy',
   [('100 g', '100 g', 'manteiga em temperatura ambiente', 'room-temperature butter'), ('3 c. sopa', '3 tbsp', 'ervas frescas picadas (salsa, manjericão, tomilho)', 'chopped fresh herbs (parsley, basil, thyme)'), ('1', '1', 'dente de alho ralado', 'grated garlic clove'), ('1 pitada', '1 pinch', 'sal e raspas de limão', 'salt and lime zest')],
   [('Misture tudo com um garfo.', 'Mix everything with a fork.'), ('Enrole em filme, formando um rolo.', 'Roll in cling film into a log.'), ('Geladeira por 1 h. Corte em rodelas.', 'Chill for 1 h. Slice into rounds.')],
   None, ('Dura 1 semana na geladeira e 3 meses no freezer. Um jeito ótimo de usar ervas antes que murchem.', 'Keeps 1 week in the fridge and 3 months frozen. A great way to use herbs before they wilt.'), milk=True),
 R(10, ('Vinagre Aromático de Ervas', 'Herb-infused Vinegar'), ('Para saladas, com o perfume do quintal.', 'For salads, with the scent of the garden.'), False, ('10 min + 2 semanas', '10 min + 2 weeks'), ('1 garrafa · 500 ml', '1 bottle · 500 ml'), False, 'easy',
   [('500 ml', '500 ml', 'vinagre de vinho branco ou maçã', 'white wine or cider vinegar'), ('3 ramos', '3 sprigs', 'alecrim, tomilho ou estragão secos ao ar 1 dia', 'rosemary, thyme or tarragon, air-dried for 1 day'), ('1 tira', '1 strip', 'casca de limão', 'lime peel')],
   [('Lave e seque muito bem as ervas.', 'Wash and dry the herbs very thoroughly.'), ('Coloque-as numa garrafa escaldada e cubra com o vinagre.', 'Put them in a scalded bottle and cover with vinegar.'), ('Deixe 2 semanas no escuro, coe e engarrafe de novo.', 'Leave 2 weeks in the dark, strain and re-bottle.')],
   None, ('Vinagre é seguro para conservar ervas. Óleo com ervas frescas ou alho, ao contrário, pode desenvolver botulismo fora da geladeira.', 'Vinegar is safe for preserving herbs. Oil with fresh herbs or garlic, by contrast, can develop botulism outside the fridge.')),
]

MORE = [
 (('Lavanda', 'Lavender'), 'Lavandula angustifolia', ('Relaxamento e aroma; usada em pouca quantidade.', 'Relaxation and aroma; used in small amounts.'), ('3 a 5 botões por xícara, 5 min', '3 to 5 buds per cup, 5 min'), ('Sol pleno e solo seco; prefere frio.', 'Full sun and dry soil; prefers cool climates.'), ('Pode somar efeito a sedativos; evite doses altas na gestação.', 'May add to sedatives; avoid high doses in pregnancy.')),
 (('Calêndula', 'Calendula'), 'Calendula officinalis', ('Pétalas coloridas para chás e blends; tradicional na pele.', 'Colourful petals for teas and blends; traditional for the skin.'), ('1 c. sopa de pétalas, 7 min', '1 tbsp petals, 7 min'), ('Sol, inverno ameno; semeia fácil.', 'Sun, mild winter; seeds easily.'), ('Alergia à família das margaridas; evite na gestação.', 'Daisy-family allergy; avoid in pregnancy.')),
 (('Tomilho', 'Thyme'), 'Thymus vulgaris', ('Tradicional para garganta e tosse leve.', 'Traditional for throat and mild cough.'), ('1 raminho, 5 min, tampado', '1 sprig, 5 min, covered'), ('Sol e pouca água; ótimo em vaso.', 'Sun and little water; great in pots.'), ('Seguro em uso culinário; evite doses altas na gestação.', 'Safe in cooking; avoid high doses in pregnancy.')),
 (('Sálvia', 'Sage'), 'Salvia officinalis', ('Garganta e digestão; sabor forte e resinoso.', 'Throat and digestion; strong, resinous flavour.'), ('3 folhas, 5 min', '3 leaves, 5 min'), ('Sol, solo bem drenado.', 'Sun, well-drained soil.'), ('Tem tujona: uso curto; evite na gestação, lactação e epilepsia.', 'Contains thujone: short use only; avoid in pregnancy, breastfeeding and epilepsy.')),
 (('Louro', 'Bay laurel'), 'Laurus nobilis', ('Digestivo, muito usado depois de feijoadas.', 'Digestive, popular after heavy meals.'), ('2 folhas secas, 5 min fervendo', '2 dried leaves, simmer 5 min'), ('Arbusto de vaso grande; cresce devagar.', 'A big-pot shrub; grows slowly.'), ('Seguro em uso culinário.', 'Safe in culinary use.')),
 (('Espinheira-santa', 'Espinheira-santa'), 'Maytenus ilicifolia', ('Nativa do Sul, tradicional para azia e estômago.', 'Native to southern Brazil, traditional for heartburn and the stomach.'), ('1 c. sopa de folhas, 10 min', '1 tbsp leaves, 10 min'), ('Arbusto de meia-sombra, crescimento lento.', 'A part-shade shrub, slow-growing.'), ('Evite na gestação e lactação.', 'Avoid in pregnancy and breastfeeding.')),
 (('Carqueja', 'Carqueja'), 'Baccharis trimera', ('Amarga, digestiva, típica do Sul.', 'Bitter, digestive, typical of southern Brazil.'), ('1 c. chá, 5 min', '1 tsp, 5 min'), ('Campo aberto, sol e solo pobre.', 'Open ground, sun and poor soil.'), ('Pode baixar a glicose; evite na gestação e com hipoglicemiantes.', 'May lower blood sugar; avoid in pregnancy and with diabetes medication.')),
 (('Cúrcuma', 'Turmeric'), 'Curcuma longa', ('Base do leite dourado; cor e sabor terroso.', 'The base of golden milk; colour and earthy flavour.'), ('2 cm ralados, ferver 8 min', '2 cm grated, simmer 8 min'), ('Como o gengibre: rizoma em vaso fundo.', 'Like ginger: rhizome in a deep pot.'), ('Cautela com anticoagulantes e cálculos biliares.', 'Caution with anticoagulants and gallstones.')),
]


def more_card(i):
    n, sci, use, prep, grow, care = MORE[i]
    return C(n, sci, [use], [(('Preparo', 'Brew'), prep), (('Cultivo', 'Growing'), grow), (('Cuidado', 'Caution'), care)])


def labels(lang):
    names = ['Camomila', 'Hortelã', 'Capim-cidreira', 'Melissa', 'Alecrim', 'Erva-doce', 'Hibisco', 'Gengibre', 'Calêndula', 'Lavanda', '', ''] if lang == 'pt' else \
            ['Chamomile', 'Mint', 'Lemongrass', 'Lemon balm', 'Rosemary', 'Fennel', 'Hibiscus', 'Ginger', 'Calendula', 'Lavender', '', '']
    d = tr(('Colhida em', 'Harvested'), lang)
    v = tr(('Validade', 'Best before'), lang)
    cell = lambda n: f'<div style="border:1px solid #9c7e26;border-radius:2mm;padding:4mm 5mm;height:30mm;display:flex;flex-direction:column;justify-content:space-between;background:#fbf8f0"><div style="font:400 15pt \'EB Garamond\';color:#111a21">{esc(n) if n else "&nbsp;"}</div><div style="font:400 7pt Jost;letter-spacing:.12em;text-transform:uppercase;color:#9c7e26">{d} ____ / ____ &nbsp; · &nbsp; {v} ____ / ____</div></div>'
    return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm">' + ''.join(cell(n) for n in names) + '</div>'


def extra():
    ch = ('Receitas do quintal', 'Backyard recipes')
    ch2 = ('Mais ervas e a horta', 'More herbs and the garden')
    pages = [opener('V', ch, ('Chás, xaropes, sais e vinagres', 'Teas, syrups, salts and vinegars'),
                    [('Dez receitas para usar a colheita inteira: chás quentes e gelados, xaropes, sal e manteiga de ervas e um vinagre aromático. Todas com conservação explicada.', 'Ten recipes to use the whole harvest: hot and iced teas, syrups, herb salt and butter and an infused vinegar. All with storage explained.')],
                    [(r['name']['pt'], r['name']['en']) for r in RECIPES])]
    pages += recipe_pages(RECIPES)
    pages += cards_page([more_card(i) for i in range(8)], ch2, per=4, heading=('Mais oito ervas', 'Eight more herbs'), eyebrow=ch2, toc=ch2)
    pages += [
        text(('Horta de chá em 1 m²', 'A 1 m² tea garden'), eyebrow=ch2, chapter=ch2, toc=('Horta de chá em 1 m²', 'A 1 m² tea garden'), sub_toc=True,
             lead=('Um canteiro ou quatro vasos grandes já dão chá para uma família o ano inteiro.', 'One bed or four big pots give a family tea all year round.'),
             body=join(T([('Quadrante (50 × 50 cm)', 'Quadrant (50 × 50 cm)'), ('Plantas', 'Plants'), ('Por quê', 'Why')],
                         [[('Norte (mais sol)', 'North (most sun)'), ('alecrim, tomilho, lavanda', 'rosemary, thyme, lavender'), ('Mediterrâneas: sol e solo seco', 'Mediterranean: sun and dry soil')],
                          [('Leste (sol da manhã)', 'East (morning sun)'), ('manjericão, camomila, calêndula', 'basil, chamomile, calendula'), ('Gostam de sol, mas não de calor extremo', 'Like sun, not extreme heat')],
                          [('Oeste (sol da tarde)', 'West (afternoon sun)'), ('capim-cidreira, erva-doce', 'lemongrass, fennel'), ('Resistem ao calor; ficam altas', 'Heat-tolerant; grow tall')],
                          [('Sul (mais sombra)', 'South (most shade)'), ('hortelã (em vaso enterrado), melissa', 'mint (in a sunken pot), lemon balm'), ('Preferem umidade e meia-sombra', 'Prefer moisture and part shade')]], cls='data'),
                       H3('Montagem', 'Setting up'),
                       B(('Escolha um local com pelo menos 4 h de sol direto.', 'Choose a spot with at least 4 h of direct sun.'), ('Solo fofo: 1 parte de terra, 1 de composto, 1 de areia grossa.', 'Loose soil: 1 part earth, 1 compost, 1 coarse sand.'),
                         ('Plante a hortelã dentro de um vaso sem fundo enterrado: ela não invade o resto.', 'Plant the mint inside a bottomless pot sunk into the ground: it will not take over.'), ('Cubra o solo com palha: menos rega e menos ervas daninhas.', 'Mulch the soil with straw: less watering and fewer weeds.'), ordered=True, cls='steps'),
                       TIP('No hemisfério sul, as faces norte e oeste recebem mais sol. Em apartamento, a janela voltada para o norte é a melhor.', 'In the southern hemisphere, north and west faces get the most sun. In a flat, a north-facing window is best.'))),
        text(('Multiplicar as mudas', 'Propagating plants'), eyebrow=ch2, chapter=ch2, toc=('Multiplicar as mudas', 'Propagating plants'), sub_toc=True,
             lead=('Três técnicas cobrem quase todas as ervas deste guia, sem gastar com mudas novas.', 'Three techniques cover almost every herb in this guide, without buying new plants.'),
             body=join(grid(3,
                            C(('Estaca', 'Cutting'), ('alecrim, hortelã, melissa, manjericão, sálvia, falsa-melissa', 'rosemary, mint, lemon balm, basil, sage, bushy lippia'), [('Corte um ramo de 10 cm sem flores, tire as folhas de baixo e coloque em água ou em areia úmida. Raízes em 2 a 4 semanas.', 'Cut a 10 cm flowerless stem, strip the lower leaves and put it in water or damp sand. Roots in 2 to 4 weeks.')]),
                            C(('Divisão', 'Division'), ('capim-cidreira, cebolinha, hortelã', 'lemongrass, chives, mint'), [('Retire a touceira, separe com as mãos ou uma faca em partes com raiz e replante na hora. Melhor na primavera.', 'Lift the clump, separate it by hand or with a knife into rooted parts and replant at once. Best in spring.')]),
                            C(('Semente', 'Seed'), ('camomila, calêndula, manjericão, erva-doce', 'chamomile, calendula, basil, fennel'), [('Semeie raso em bandeja, mantenha úmido e transplante com 4 folhas verdadeiras. Camomila: semente na superfície, precisa de luz.', 'Sow shallow in trays, keep moist and transplant at 4 true leaves. Chamomile: seed on the surface, it needs light.')])),
                       H3('Calendário de propagação', 'Propagation calendar'),
                       T([('Época', 'Season'), ('O que fazer', 'What to do')],
                         [[('Primavera (set–nov)', 'Spring (Sep–Nov)'), ('Divisão de touceiras, estacas de quase tudo, semear manjericão', 'Divide clumps, take cuttings of almost everything, sow basil')],
                          [('Verão (dez–fev)', 'Summer (Dec–Feb)'), ('Estacas na água, colher e secar', 'Cuttings in water, harvest and dry')],
                          [('Outono (mar–mai)', 'Autumn (Mar–May)'), ('Semear camomila, calêndula e erva-doce', 'Sow chamomile, calendula and fennel')],
                          [('Inverno (jun–ago)', 'Winter (Jun–Aug)'), ('Podar, adubar com composto e planejar', 'Prune, feed with compost and plan')]], cls='data compact'))),
        text(('Pragas e problemas', 'Pests and problems'), eyebrow=ch2, chapter=ch2, toc=('Pragas e problemas', 'Pests and problems'), sub_toc=True,
             lead=('Ervas de chá vão para a xícara: nada de veneno. Estas soluções são caseiras e seguras.', 'Tea herbs go into the cup: no poisons. These fixes are homemade and safe.'),
             body=join(T([('Sinal', 'Sign'), ('Causa provável', 'Likely cause'), ('O que fazer', 'What to do')],
                         [[('Folhas amarelas de baixo para cima', 'Leaves yellowing from the bottom up'), ('Excesso de água', 'Overwatering'), ('Regue menos, melhore a drenagem', 'Water less, improve drainage')],
                          [('Pontinhos verdes ou pretos nos brotos', 'Tiny green or black dots on shoots'), ('Pulgões', 'Aphids'), ('Jato de água; calda de sabão de coco (1 c. sopa/L) e enxágue antes de colher', 'Water spray; coconut soap solution (1 tbsp/L) and rinse before harvest')],
                          [('Teias finas e folhas pontilhadas', 'Fine webs and speckled leaves'), ('Ácaros (tempo seco)', 'Mites (dry weather)'), ('Borrifar água nas folhas, aumentar umidade', 'Mist the leaves, raise humidity')],
                          [('Pó branco nas folhas', 'White powder on leaves'), ('Oídio (fungo)', 'Powdery mildew (fungus)'), ('Retire folhas afetadas; 1 parte de leite para 9 de água, borrifado', 'Remove affected leaves; 1 part milk to 9 water, sprayed')],
                          [('Buracos e folhas comidas', 'Holes and eaten leaves'), ('Lagartas ou lesmas', 'Caterpillars or slugs'), ('Catar à mão à noite; cinza ou casca de ovo ao redor', 'Pick off by hand at night; ash or eggshell around')],
                          [('Planta comprida e rala', 'Leggy, sparse plant'), ('Pouca luz ou falta de poda', 'Too little light or no pruning'), ('Mais sol; corte as pontas', 'More sun; pinch the tips')],
                          [('Manjericão florindo e amargando', 'Basil flowering and turning bitter'), ('Calor e idade', 'Heat and age'), ('Corte as flores sempre que surgirem', 'Remove flowers as soon as they appear')]], cls='data compact'),
                       WARN('Depois de qualquer tratamento, espere alguns dias e lave bem as folhas antes de usar no chá.', 'After any treatment, wait a few days and wash the leaves well before using them for tea.', ('Antes de colher', 'Before harvesting')))),
        text(('Etiquetas para os potes', 'Labels for your jars'), eyebrow=ch2, chapter=ch2, toc=('Etiquetas para os potes', 'Labels for your jars'), sub_toc=True,
             lead=('Recorte, preencha as datas e cole nos potes de ervas secas. Duas em branco para as suas.', 'Cut out, fill in the dates and stick them on your dried-herb jars. Two blank for your own.'),
             body=lambda lang: labels(lang)),
    ]
    return pages


GUIDE = extend(base.GUIDE, extra, insert_at=lambda p: len(p) - 2)
