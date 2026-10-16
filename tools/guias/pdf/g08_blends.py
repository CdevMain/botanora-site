import math
from common import *

WHEEL = [(('Floral', 'Floral'), ('lavanda, rosa, jasmim, camomila', 'lavender, rose, jasmine, chamomile')),
         (('Cítrico', 'Citrus'), ('casca de laranja, limão, capim-cidreira', 'orange peel, lemon, lemongrass')),
         (('Frutado', 'Fruity'), ('maçã, hibisco, frutas vermelhas', 'apple, hibiscus, red berries')),
         (('Doce', 'Sweet'), ('baunilha, alcaçuz, coco, cacau', 'vanilla, liquorice, coconut, cacao')),
         (('Especiado', 'Spiced'), ('canela, cravo, cardamomo, gengibre', 'cinnamon, clove, cardamom, ginger')),
         (('Tostado', 'Roasted'), ('hojicha, mate tostado, cevada, arroz', 'hojicha, toasted mate, barley, rice')),
         (('Herbal', 'Herbal'), ('hortelã, alecrim, manjericão, sálvia', 'mint, rosemary, basil, sage')),
         (('Terroso', 'Earthy'), ('pu-erh, rooibos, cúrcuma, raízes', 'pu-erh, rooibos, turmeric, roots'))]


def wheel(lang):
    W, H, cx, cy, r1, r2 = 600, 600, 300, 300, 70, 230
    s = f'<svg viewBox="0 0 {W} {H}" width="100mm" height="100mm" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:2mm auto">'
    s += f'<circle cx="{cx}" cy="{cy}" r="{r2}" fill="#fbf8f0" stroke="#9c7e26" stroke-width="1.4"/><circle cx="{cx}" cy="{cy}" r="{r1}" fill="#111a21"/>'
    n = len(WHEEL)
    for i, (name, ex) in enumerate(WHEEL):
        a = 2 * math.pi * i / n - math.pi / 2
        s += f'<line x1="{cx + r1 * math.cos(a):.1f}" y1="{cy + r1 * math.sin(a):.1f}" x2="{cx + r2 * math.cos(a):.1f}" y2="{cy + r2 * math.sin(a):.1f}" stroke="#9c7e26" stroke-width="1"/>'
        m = a + math.pi / n
        tx, ty = cx + 150 * math.cos(m), cy + 150 * math.sin(m)
        s += f'<text x="{tx:.1f}" y="{ty:.1f}" text-anchor="middle" font-family="EB Garamond" font-size="24" fill="#111a21">{esc(tr(name, lang))}</text>'
        tx2, ty2 = cx + 262 * math.cos(m), cy + 262 * math.sin(m)
        s += f'<circle cx="{cx + 205 * math.cos(m):.1f}" cy="{cy + 205 * math.sin(m):.1f}" r="4" fill="#d6b44c"/>'
    s += f'<text x="{cx}" y="{cy - 4}" text-anchor="middle" font-family="EB Garamond" font-size="22" fill="#e8d084">{"Base" if lang == "en" else "Base"}</text>'
    s += f'<text x="{cx}" y="{cy + 20}" text-anchor="middle" font-family="Jost" font-size="12" letter-spacing="2" fill="#d6b44c">{"TEA" if lang == "en" else "CHÁ"}</text>'
    return s + '</svg>'


# (nome, tagline, meta, linhas, preparo)
F = [
 (('Café da Manhã Dourado', 'Golden Breakfast'), ('Preto robusto com laranja.', 'Robust black with orange.'), ('com cafeína', 'caffeinated'), [(('70%', '70%'), ('chá preto Assam', 'Assam black tea')), (('20%', '20%'), ('casca de laranja seca', 'dried orange peel')), (('10%', '10%'), ('flor de calêndula', 'calendula petals'))], ('3 g, água fervente, 4 min. Aceita leite.', '3 g, boiling water, 4 min. Takes milk.')),
 (('Earl Grey da Casa', 'House Earl Grey'), ('Bergamota com toque floral.', 'Bergamot with a floral touch.'), ('com cafeína', 'caffeinated'), [(('85%', '85%'), ('chá preto Ceylon', 'Ceylon black tea')), (('10%', '10%'), ('casca de laranja seca', 'dried orange peel')), (('5%', '5%'), ('pétalas de centáurea ou rosa', 'cornflower or rose petals')), (('gotas', 'drops'), ('óleo essencial de bergamota alimentício', 'food-grade bergamot oil'))], ('Aromatize a casca, nunca o chá direto. 3 g, 95 °C, 3 min.', 'Flavour the peel, never the tea directly. 3 g, 95 °C, 3 min.')),
 (('Chai da Estação', 'Seasonal Chai'), ('Especiarias inteiras e preto.', 'Whole spices and black tea.'), ('com cafeína', 'caffeinated'), [(('60%', '60%'), ('chá preto CTC ou Assam', 'CTC or Assam black tea')), (('15%', '15%'), ('canela em lascas', 'cinnamon chips')), (('10%', '10%'), ('gengibre seco em cubos', 'dried ginger pieces')), (('10%', '10%'), ('cardamomo amassado', 'crushed cardamom')), (('5%', '5%'), ('cravo e pimenta-preta', 'clove and black pepper'))], ('5 g ferve 5 min em água e leite.', '5 g simmered 5 min in water and milk.')),
 (('Verde Jardim', 'Garden Green'), ('Sencha, hortelã e capim.', 'Sencha, mint and lemongrass.'), ('com cafeína', 'caffeinated'), [(('70%', '70%'), ('sencha ou verde chinês', 'sencha or Chinese green')), (('20%', '20%'), ('hortelã seca', 'dried mint')), (('10%', '10%'), ('capim-cidreira', 'lemongrass'))], ('3 g, 80 °C, 2 min.', '3 g, 80 °C, 2 min.')),
 (('Jasmim & Pêssego', 'Jasmine & Peach'), ('Verde perfumado de verão.', 'A fragrant summer green.'), ('com cafeína', 'caffeinated'), [(('75%', '75%'), ('chá verde de jasmim', 'jasmine green tea')), (('20%', '20%'), ('pêssego desidratado picado', 'chopped dried peach')), (('5%', '5%'), ('calêndula', 'calendula'))], ('3 g, 80 °C, 2 min 30 s. Ótimo gelado.', '3 g, 80 °C, 2 min 30 s. Great iced.')),
 (('Genmaicha de Coco', 'Coconut Genmaicha'), ('Arroz tostado e coco.', 'Toasted rice and coconut.'), ('pouca cafeína', 'low caffeine'), [(('70%', '70%'), ('genmaicha', 'genmaicha')), (('30%', '30%'), ('coco em lascas tostado', 'toasted coconut chips'))], ('4 g, 85 °C, 2 min.', '4 g, 85 °C, 2 min.')),
 (('Oolong & Figo', 'Oolong & Fig'), ('Mel, fruta escura e torra.', 'Honey, dark fruit and roast.'), ('com cafeína', 'caffeinated'), [(('80%', '80%'), ('oolong tostado (Da Hong Pao, Dong Ding)', 'roasted oolong (Da Hong Pao, Dong Ding)')), (('20%', '20%'), ('figo seco picado', 'chopped dried fig'))], ('4 g, 95 °C, 3 min ou infusões curtas.', '4 g, 95 °C, 3 min or short steeps.')),
 (('Branco Floral', 'White Floral'), ('Delicado e perfumado.', 'Delicate and perfumed.'), ('pouca cafeína', 'low caffeine'), [(('80%', '80%'), ('Bai Mu Dan', 'Bai Mu Dan')), (('15%', '15%'), ('botões de rosa', 'rose buds')), (('5%', '5%'), ('lavanda', 'lavender'))], ('3 g, 85 °C, 4 min.', '3 g, 85 °C, 4 min.')),
 (('Mate Cítrico', 'Citrus Mate'), ('Para tererê ou infusão quente.', 'For tereré or hot infusion.'), ('com cafeína', 'caffeinated'), [(('75%', '75%'), ('erva-mate ou mate tostado', 'yerba or toasted mate')), (('15%', '15%'), ('casca de limão seca', 'dried lime peel')), (('10%', '10%'), ('hortelã', 'mint'))], ('Gelado: 2 h na geladeira. Quente: 90 °C, 4 min.', 'Iced: 2 h in the fridge. Hot: 90 °C, 4 min.')),
 (('Hojicha Caramelo', 'Caramel Hojicha'), ('Tostado e doce, quase sobremesa.', 'Roasted and sweet, almost dessert.'), ('pouca cafeína', 'low caffeine'), [(('80%', '80%'), ('hojicha', 'hojicha')), (('15%', '15%'), ('cacau em nibs', 'cacao nibs')), (('5%', '5%'), ('baunilha em pedaços', 'vanilla pieces'))], ('4 g, fervente, 1 min. Excelente com leite.', '4 g, boiling, 1 min. Excellent with milk.')),
 (('Coco & Baunilha', 'Coconut & Vanilla'), ('Doce e cremoso, sem cafeína.', 'Sweet and creamy, caffeine-free.'), ('sem cafeína', 'caffeine-free'), [(('70%', '70%'), ('rooibos', 'rooibos')), (('20%', '20%'), ('coco em lascas tostado', 'toasted coconut chips')), (('5%', '5%'), ('baunilha em pedaços', 'vanilla pieces')), (('5%', '5%'), ('canela', 'cinnamon'))], ('4 g, fervente, 6 min.', '4 g, boiling, 6 min.')),
 (('Rooibos Brasil', 'Rooibos Brazil'), ('Rooibos, cacau e castanha.', 'Rooibos, cacao and nuts.'), ('sem cafeína', 'caffeine-free'), [(('70%', '70%'), ('rooibos', 'rooibos')), (('15%', '15%'), ('nibs de cacau', 'cacao nibs')), (('10%', '10%'), ('castanha-do-pará tostada picada', 'chopped toasted Brazil nut')), (('5%', '5%'), ('canela', 'cinnamon'))], ('4 g, fervente, 6 min.', '4 g, boiling, 6 min.')),
 (('Rubi Tropical', 'Tropical Ruby'), ('Hibisco, maracujá e manga.', 'Hibiscus, passion fruit and mango.'), ('sem cafeína', 'caffeine-free'), [(('40%', '40%'), ('hibisco', 'hibiscus')), (('30%', '30%'), ('manga desidratada', 'dried mango')), (('20%', '20%'), ('maçã desidratada', 'dried apple')), (('10%', '10%'), ('rosehip', 'rosehip'))], ('5 g, fervente, 8 min. Perfeito gelado.', '5 g, boiling, 8 min. Perfect iced.')),
 (('Digestivo de Domingo', 'Sunday Digestif'), ('Para depois do almoço longo.', 'For after a long lunch.'), ('sem cafeína', 'caffeine-free'), [(('40%', '40%'), ('erva-doce', 'fennel seed')), (('30%', '30%'), ('hortelã', 'mint')), (('20%', '20%'), ('capim-cidreira', 'lemongrass')), (('10%', '10%'), ('gengibre seco', 'dried ginger'))], ('3 g, 95 °C, 7 min.', '3 g, 95 °C, 7 min.')),
 (('Inverno Vermelho', 'Red Winter'), ('Especiado e frutado, sem cafeína.', 'Spiced and fruity, caffeine-free.'), ('sem cafeína', 'caffeine-free'), [(('40%', '40%'), ('rooibos', 'rooibos')), (('25%', '25%'), ('hibisco', 'hibiscus')), (('20%', '20%'), ('maçã e casca de laranja', 'apple and orange peel')), (('15%', '15%'), ('canela, cravo e anis', 'cinnamon, clove and anise'))], ('4 g, fervente, 7 min.', '4 g, boiling, 7 min.')),
 (('Limão & Lavanda', 'Lemon & Lavender'), ('Cítrico e floral, para a tarde.', 'Citrus and floral, for the afternoon.'), ('sem cafeína', 'caffeine-free'), [(('40%', '40%'), ('capim-cidreira', 'lemongrass')), (('30%', '30%'), ('melissa', 'lemon balm')), (('25%', '25%'), ('casca de limão-siciliano', 'lemon peel')), (('5%', '5%'), ('lavanda', 'lavender'))], ('3 g, 95 °C, 5 min, tampado.', '3 g, 95 °C, 5 min, covered.')),
 (('Menta Dupla', 'Double Mint'), ('Hortelã-pimenta e hortelã-comum.', 'Peppermint and spearmint.'), ('sem cafeína', 'caffeine-free'), [(('50%', '50%'), ('hortelã-pimenta', 'peppermint')), (('40%', '40%'), ('hortelã-comum', 'spearmint')), (('10%', '10%'), ('alcaçuz em raiz', 'liquorice root'))], ('2 g, 95 °C, 5 min.', '2 g, 95 °C, 5 min.')),
 (('Jardim de Rosas', 'Rose Garden'), ('Pétalas e frutas vermelhas.', 'Petals and red berries.'), ('sem cafeína', 'caffeine-free'), [(('35%', '35%'), ('botões de rosa', 'rose buds')), (('35%', '35%'), ('frutas vermelhas desidratadas', 'dried red berries')), (('20%', '20%'), ('hibisco', 'hibiscus')), (('10%', '10%'), ('baunilha', 'vanilla'))], ('4 g, fervente, 6 min.', '4 g, boiling, 6 min.')),
 (('Foco Verde', 'Green Focus'), ('Verde, alecrim e limão.', 'Green tea, rosemary and lemon.'), ('com cafeína', 'caffeinated'), [(('75%', '75%'), ('chá verde', 'green tea')), (('15%', '15%'), ('casca de limão-siciliano', 'lemon peel')), (('10%', '10%'), ('alecrim seco', 'dried rosemary'))], ('3 g, 80 °C, 2 min.', '3 g, 80 °C, 2 min.')),
 (('Pu-erh & Cacau', 'Pu-erh & Cacao'), ('Terroso, profundo, de sobremesa.', 'Earthy, deep, a dessert tea.'), ('com cafeína', 'caffeinated'), [(('70%', '70%'), ('pu-erh shou', 'shou pu-erh')), (('20%', '20%'), ('nibs de cacau', 'cacao nibs')), (('10%', '10%'), ('casca de laranja', 'orange peel'))], ('4 g, enxágue rápido, fervente, 3 min.', '4 g, quick rinse, boiling, 3 min.')),
]


def fpage(a, b):
    return text(None, body=grid(2, *[M(i + 1, F[i][0], F[i][1], F[i][3], F[i][4], meta=F[i][2]) for i in range(a, min(b, len(F)))]), chapter=('Vinte fórmulas', 'Twenty formulas'))


def build_pages():
    pages = [{'type': 'cover'},
        title_page([('Fazer o próprio blend é o passo seguinte de quem já gosta de chá. É composição: escolher uma base, dar corpo, colocar aroma e fechar com um acabamento, como um perfumista trabalha com notas. Com algumas regras de proporção e um caderno de testes, qualquer cozinha vira um pequeno ateliê.', 'Making your own blend is the next step for anyone who already loves tea. It is composition: choose a base, add body, layer aroma and close with a finish, the way a perfumer works with notes. With a few ratio rules and a testing notebook, any kitchen becomes a small studio.'),
                    ('O guia traz a estrutura, as proporções, a roda de sabores, 38 fórmulas, seis receitas com os blends, técnicas de secagem, torra e aromatização, calculadora de lote, planilha de custo, como embalar e rotular e o que observar antes de vender.', 'The guide covers structure, ratios, the flavour wheel, 38 formulas, six recipes using the blends, drying, roasting and scenting techniques, a batch calculator, a cost sheet, how to pack and label and what to check before selling.')],
                   [(('Aprenda a estrutura', 'Learn the structure'), ('Base, corpo, aroma e acabamento.', 'Base, body, aroma and finish.')),
                    (('Teste pequeno', 'Test small'), ('Lotes de 20 g, anotados.', '20 g batches, written down.')),
                    (('Escale com a fórmula', 'Scale with the formula'), ('Porcentagens funcionam em qualquer quantidade.', 'Percentages work at any quantity.'))]),
        {'type': 'toc'},
        opener('I', ('A arquitetura do blend', 'The architecture of a blend'), ('Notas, proporções e ingredientes', 'Notes, ratios and ingredients'),
               [('Um bom blend tem uma ideia central e poucos ingredientes que a servem. O erro mais comum é colocar demais: oito ingredientes viram um gosto genérico de "chá de ervas".', 'A good blend has one central idea and a few ingredients that serve it. The most common mistake is adding too much: eight ingredients turn into a generic "herbal tea" taste.')],
               [('As quatro camadas', 'The four layers'), ('A roda de sabores', 'The flavour wheel'), ('Ingredientes e preparo', 'Ingredients and preparation')]),
        text(('As quatro camadas', 'The four layers'), eyebrow=('Capítulo I', 'Chapter I'),
             lead=('Pense em porcentagem do peso total. A soma é sempre 100.', 'Think in percentages of total weight. The sum is always 100.'),
             body=join(T([('Camada', 'Layer'), ('Função', 'Role'), ('Proporção', 'Ratio'), ('Exemplos', 'Examples')],
                         [[('Base', 'Base'), ('A identidade e o volume', 'Identity and volume'), '50–80%', ('chá preto, verde, rooibos, camomila, mate', 'black, green, rooibos, chamomile, mate')],
                          [('Corpo', 'Body'), ('Textura e doçura natural', 'Texture and natural sweetness'), '10–25%', ('maçã, coco, cacau, arroz tostado, raízes', 'apple, coconut, cacao, toasted rice, roots')],
                          [('Aroma', 'Aroma'), ('O que se sente primeiro', 'What you notice first'), '5–15%', ('cascas cítricas, especiarias, hortelã', 'citrus peel, spices, mint')],
                          [('Acabamento', 'Finish'), ('Detalhe, cor e beleza', 'Detail, colour and beauty'), '1–5%', ('pétalas, lavanda, baunilha', 'petals, lavender, vanilla')]], cls='data'),
                       H3('Regras práticas', 'Practical rules'),
                       B(('**De três a cinco ingredientes.** Mais que isso, cada um some.', '**Three to five ingredients.** Beyond that, each one disappears.'),
                         ('**Ingredientes fortes em pouca quantidade.** Cravo, lavanda, alcaçuz e hortelã-pimenta dominam acima de 5 a 10%.', '**Strong ingredients in small amounts.** Clove, lavender, liquorice and peppermint dominate above 5 to 10%.'),
                         ('**Mesmo tempo de infusão.** Combine ingredientes que extraem em tempos parecidos, ou pique menor os mais lentos.', '**Same steeping time.** Combine ingredients that extract at similar speeds, or cut the slower ones smaller.'),
                         ('**Mesma temperatura.** Chá verde a 80 °C não combina com raízes que pedem fervura. Nesse caso, faça duas preparações.', '**Same temperature.** Green tea at 80 °C does not suit roots that need boiling. In that case, make two preparations.'),
                         ('**Tamanhos parecidos.** Pedaços muito diferentes se separam no pacote e cada xícara sai diferente.', '**Similar sizes.** Very different pieces separate in the pack and every cup comes out different.')),
                       Q('Um blend é uma frase: um sujeito, um verbo e no máximo dois adjetivos.', 'A blend is a sentence: one subject, one verb and at most two adjectives.'))),
        text(('A roda de sabores', 'The flavour wheel'), eyebrow=('Capítulo I', 'Chapter I'),
             lead=('Famílias vizinhas na roda combinam com facilidade. Opostas criam contraste, que pede mais cuidado.', 'Neighbouring families on the wheel pair easily. Opposites create contrast, which needs more care.'),
             body=join(raw_lang(wheel),
                       T([('Família', 'Family'), ('Ingredientes', 'Ingredients')], [[n, e] for n, e in WHEEL], cls='data compact'),
                       TIP('Para começar, escolha uma base e uma família vizinha. Depois de dominar, experimente um contraste: tostado com cítrico, terroso com floral.', 'To start, pick a base and one neighbouring family. Once confident, try a contrast: roasted with citrus, earthy with floral.'))),
        text(('Ingredientes e preparo', 'Ingredients and preparation'), eyebrow=('Capítulo I', 'Chapter I'),
             lead=('Tudo que entra no blend deve estar seco, limpo e com umidade baixa. Um único ingrediente úmido estraga o pote inteiro.', 'Everything in the blend must be dry, clean and low in moisture. A single damp ingredient spoils the whole jar.'),
             body=join(T([('Ingrediente', 'Ingredient'), ('Como preparar', 'How to prepare'), ('Atenção', 'Watch out')],
                         [[('Cascas cítricas', 'Citrus peel'), ('Sem a parte branca, em tiras finas, secas a 50 °C', 'No pith, thin strips, dried at 50 °C'), ('Quebre em pedaços de 3 a 5 mm', 'Break into 3 to 5 mm pieces')],
                          [('Frutas desidratadas', 'Dried fruit'), ('Cubos pequenos, bem secos', 'Small cubes, very dry'), ('Evite frutas cristalizadas ou com açúcar: grudam', 'Avoid candied or sugared fruit: it sticks')],
                          [('Especiarias', 'Spices'), ('Inteiras e amassadas, nunca em pó', 'Whole and crushed, never powdered'), ('Pó turva a xícara e vai para o fundo', 'Powder clouds the cup and sinks')],
                          [('Flores', 'Flowers'), ('Secas e de grau alimentício', 'Dried and food-grade'), ('Flores de floricultura têm agrotóxicos', 'Florist flowers carry pesticides')],
                          [('Coco, castanhas, cacau', 'Coconut, nuts, cacao'), ('Tostados levemente', 'Lightly toasted'), ('Têm gordura: duram menos, até 3 meses', 'They contain fat: they keep less, up to 3 months')],
                          [('Óleos e aromas', 'Oils and flavourings'), ('Só de grau alimentício, em gotas', 'Food-grade only, in drops'), ('Aplique numa parte do blend e deixe descansar 48 h fechado', 'Apply to part of the blend and rest 48 h sealed')]], cls='data compact'),
                       H3('Como misturar', 'How to mix'),
                       B(('Pese cada ingrediente separadamente.', 'Weigh each ingredient separately.'), ('Misture numa tigela grande com as mãos limpas e secas ou com uma colher, sem esmagar.', 'Mix in a large bowl with clean dry hands or a spoon, without crushing.'),
                         ('Comece pela base e vá juntando dos maiores aos menores.', 'Start with the base and add from the largest to the smallest.'), ('Descanse 2 dias num pote fechado antes de provar: os aromas se casam.', 'Rest 2 days in a closed jar before tasting: the aromas marry.'), ordered=True, cls='steps'))),
        opener('II', ('Vinte fórmulas', 'Twenty formulas'), ('Com e sem cafeína', 'With and without caffeine'),
               [('Fórmulas em porcentagem do peso. Para um pote de 100 g, 70% são 70 g. Comece com lotes de 20 g para testar e ajuste ao seu gosto.', 'Formulas as percentages by weight. For a 100 g jar, 70% is 70 g. Start with 20 g batches to test and adjust to your taste.')],
               [('Bases de chá: preto, verde, branco, oolong, pu-erh', 'Tea bases: black, green, white, oolong, pu-erh'), ('Bases tostadas: hojicha, genmaicha, mate', 'Roasted bases: hojicha, genmaicha, mate'), ('Sem cafeína: ervas, frutas, flores e raízes', 'Caffeine-free: herbs, fruit, flowers and roots')]),
        fpage(0, 6), fpage(6, 12), fpage(12, 18), fpage(18, 20),
        opener('III', ('Do teste à embalagem', 'From testing to packaging'), ('Ajustar, rotular e vender', 'Adjust, label and sell'),
               [('Um blend fica pronto depois de várias versões. Anote tudo, prove em condições iguais e só então pense em embalagem e venda.', 'A blend is ready after several versions. Write everything down, taste under the same conditions and only then think about packaging and selling.')],
               [('Método de teste', 'Testing method'), ('Ficha de teste', 'Testing sheet'), ('Embalar e rotular', 'Packing and labelling'), ('Antes de vender', 'Before selling')]),
        text(('Método de teste', 'Testing method'), eyebrow=('Capítulo III', 'Chapter III'),
             lead=('Mude uma coisa por vez. Assim você sabe o que melhorou.', 'Change one thing at a time. That way you know what improved.'),
             body=join(B(('**Lote de 20 g** de cada versão, identificado com letra (A, B, C).', '**A 20 g batch** of each version, labelled with a letter (A, B, C).'),
                         ('**Prepare igual:** mesma água, temperatura, tempo e xícara. Use 3 g para 200 ml como padrão.', '**Brew the same way:** same water, temperature, time and cup. Use 3 g per 200 ml as standard.'),
                         ('**Prove em três momentos:** quente, morno e frio. Defeitos aparecem quando esfria.', '**Taste at three points:** hot, warm and cold. Flaws show as it cools.'),
                         ('**Prove às cegas** quando comparar duas versões: peça a alguém que sirva.', '**Taste blind** when comparing two versions: ask someone else to pour.'),
                         ('**Teste com e sem leite e açúcar**, se for um blend que as pessoas vão adoçar.', '**Test with and without milk and sugar**, if people are likely to sweeten it.'),
                         ('**Repita depois de 2 semanas.** Alguns aromas somem; outros se destacam.', '**Repeat after 2 weeks.** Some aromas fade; others come forward.'), ordered=True, cls='steps'),
                       H3('Diagnóstico rápido', 'Quick diagnosis'),
                       T([('Sintoma', 'Symptom'), ('Ajuste', 'Adjustment')],
                         [[('Plano, sem graça', 'Flat, dull'), ('+ aroma (cítrico ou especiaria) em 5%', '+ aroma (citrus or spice) by 5%')], [('Ralo, aguado', 'Thin, watery'), ('+ corpo (fruta, coco, raiz) ou + base', '+ body (fruit, coconut, root) or + base')],
                          [('Um ingrediente domina', 'One ingredient dominates'), ('Reduza pela metade', 'Halve it')], [('Amargo ou adstringente', 'Bitter or astringent'), ('Menos base com cafeína ou menor tempo', 'Less caffeinated base or shorter time')],
                          [('Doce enjoativo', 'Cloyingly sweet'), ('Menos alcaçuz, baunilha ou fruta; + cítrico', 'Less liquorice, vanilla or fruit; + citrus')]], cls='data compact'))),
        text(('Ficha de teste', 'Testing sheet'), eyebrow=('Capítulo III', 'Chapter III'),
             body=lambda lang: ''.join(sheet(lang, [('Nome e versão', 'Name and version'), ('Fórmula (%)', 'Formula (%)'), ('Preparo', 'Brew'), ('O que mudar', 'What to change')],
                                             [('Aroma', 'Aroma'), ('Corpo', 'Body'), ('Equilíbrio', 'Balance')]) for _ in range(2))),
        text(('Embalar e rotular', 'Packing and labelling'), eyebrow=('Capítulo III', 'Chapter III'),
             lead=('A embalagem protege o que você criou. A etiqueta conta ao cliente como preparar.', 'Packaging protects what you created. The label tells the customer how to brew it.'),
             body=join(grid(2,
                            C(('Embalagens', 'Packaging'), ('Do melhor ao básico', 'From best to basic'), [('Lata com tampa dupla ou sachê metalizado com zip e válvula: protegem de luz, ar e umidade. Vidro transparente só para uso em casa, longe da luz.', 'A double-lid tin or a foil zip pouch: they protect from light, air and moisture. Clear glass only for home use, away from light.')],
                              [(('Validade usual', 'Usual shelf life'), ('6 a 12 meses', '6 to 12 months')), (('Com castanhas ou coco', 'With nuts or coconut'), ('até 3 meses', 'up to 3 months'))]),
                            C(('A etiqueta ideal', 'The ideal label'), ('O que não pode faltar', 'What it must include'), [('Nome do blend, lista de ingredientes em ordem decrescente de peso, peso líquido, modo de preparo (quantidade, temperatura, tempo), lote, data de fabricação e validade, e se contém cafeína.', 'Blend name, ingredients in descending order of weight, net weight, brewing instructions (amount, temperature, time), batch, production and best-before dates, and whether it contains caffeine.')])),
                       H3('Alergênicos e avisos', 'Allergens and warnings'),
                       P(('Castanhas, amendoim, leite e glúten devem aparecer em destaque. Ervas com restrições conhecidas (como na gestação) merecem um aviso claro, mesmo quando não obrigatório.', 'Tree nuts, peanuts, milk and gluten must be highlighted. Herbs with known restrictions (such as in pregnancy) deserve a clear warning, even when not mandatory.')),
                       TIP('Um nome evocativo vende, mas a descrição de sabor em três palavras ("laranja, mel, tostado") é o que faz a pessoa escolher.', 'An evocative name sells, but a three-word flavour description ("orange, honey, toasted") is what makes people choose.'))),
        text(('Antes de vender', 'Before selling'), eyebrow=('Capítulo III', 'Chapter III'),
             lead=('Presentear amigos é uma coisa; vender é produzir alimento, com regras próprias.', 'Gifting friends is one thing; selling is producing food, with its own rules.'),
             body=join(P(('No Brasil, chás e misturas de ervas são alimentos regulados pela Anvisa. Existe uma lista oficial de espécies vegetais autorizadas para o preparo de chás, e plantas fora dela não podem ser vendidas como chá alimentício. Também há regras de rotulagem geral e nutricional e de boas práticas de fabricação.', 'In Brazil, teas and herbal mixtures are foods regulated by Anvisa, the national health agency. There is an official list of plant species authorised for teas, and plants outside it cannot be sold as food tea. There are also general and nutrition labelling rules and good manufacturing practices.'),
                         ('Em outros países, procure o órgão equivalente (como a FDA nos EUA ou a autoridade de segurança alimentar local) antes de vender.', 'In other countries, check with the equivalent body (such as the FDA in the US or your local food safety authority) before selling.')),
                       B(('**Verifique cada ingrediente** na lista de espécies autorizadas para chá.', '**Check every ingredient** against the list of species authorised for tea.'),
                         ('**Formalize a atividade** (MEI ou empresa) com a atividade de alimentos adequada.', '**Register the business** with the appropriate food activity.'),
                         ('**Procure a vigilância sanitária do seu município** para licença e orientações sobre o local de produção.', '**Contact your local health authority** for a licence and guidance on the production space.'),
                         ('**Compre de fornecedores com nota fiscal** e laudo, e guarde os lotes.', '**Buy from invoiced suppliers** with certificates, and keep batch records.'),
                         ('**Não prometa efeitos terapêuticos** na embalagem ou na divulgação: alimentos não podem alegar cura ou tratamento.', '**Do not promise therapeutic effects** on packaging or in marketing: foods cannot claim to cure or treat.'), ordered=True, cls='steps'),
                       WARN('As normas mudam. Este capítulo é orientação geral e não substitui a consulta às normas vigentes da Anvisa e da vigilância sanitária local.', 'Regulations change. This chapter is general guidance and does not replace checking current Anvisa rules and your local health authority.', ('Importante', 'Important')))),
        closing_page(8)]
    return pages


def raw_lang(f):
    return lambda lang: f(lang)


GUIDE = Guide('blends-autorais', 8, L('Blends Autorais', 'Crafting Blends'), L('Crie, teste, embale e rotule os seus próprios chás', 'Create, test, pack and label your own teas'), build_pages)
