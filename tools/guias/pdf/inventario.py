"""Gera docs/guias-conteudo.md: o guia interno de consulta do que já foi publicado.

Uso: python3 inventario.py <saida.md>
Rode sempre que um guia for criado ou alterado.
"""
import os, sys, importlib, contextlib, io, datetime
from collections import defaultdict
import catalog

KIND_ORDER = ['receita', 'receita curta', 'blend', 'mistura', 'fórmula', 'mocktail']
KIND_LABEL = {'receita': 'Receitas completas', 'receita curta': 'Receitas curtas (fichas)', 'blend': 'Blends', 'mistura': 'Misturas', 'fórmula': 'Fórmulas de blend', 'mocktail': 'Mocktails'}
MAIN_MOD = {num: mods[-1] for num, _, mods in catalog.GUIDES}


def guide_obj(num):
    with contextlib.redirect_stdout(io.StringIO()):
        return importlib.import_module(MAIN_MOD[num]).GUIDE


def sections(G):
    out = []
    for p in G.pages_fn():
        if p.get('toc'):
            out.append((p.get('toc_level', 0), catalog.pt(p['toc']), p.get('toc_key', '')))
    return out


def main(dest):
    items = catalog.collect()
    by_guide = defaultdict(list)
    for it in items:
        by_guide[it['guide']].append(it)
    L = []
    w = L.append
    w('# Guia interno: o que cada guia Botânora já cobre')
    w('')
    w(f'Documento interno, gerado automaticamente em {datetime.date.today():%d/%m/%Y} a partir do código dos guias (`tools/guias/pdf`). Não é vendido nem publicado no site.')
    w('')
    w('## Como usar antes de criar um guia novo')
    w('')
    w('1. Leia a seção do tema mais próximo e o **índice de ingredientes** no fim deste documento.')
    w('2. Escreva o guia novo em `tools/guias/pdf/` (um arquivo `gNN_<slug>.py`, seguindo os existentes).')
    w('3. Rode `python3 catalog.py dups` na pasta `tools/guias/pdf`. Qualquer par acima de 0,67 precisa ser revisto: mesma bebida, mesma combinação de ingredientes ou mesma técnica = trocar.')
    w('4. Rode `python3 inventario.py ../../../docs/guias-conteudo.md` para atualizar este documento.')
    w('')
    w('### Regras de conteúdo')
    w('')
    for r in ['Cada receita existe em um único guia. Variação de sabor de uma técnica (ex.: brigadeiro de matcha e de Earl Grey) é aceitável; a mesma bebida com outro nome não é.',
              'Um tema pode aparecer em mais de um guia, mas cada receita é única. Ex.: o Foco tem um shot de matcha que não existe no Matcha em Casa. Antes de usar um tema que já tem guia próprio, confira a lista dele abaixo.',
              'Tudo em PT-BR e inglês, com o mesmo número de páginas nas duas versões.',
              'Nunca usar travessão (o traço longo) em nenhum texto.',
              'Receitas com quantidade, temperatura, tempo, passo a passo e uma dica. Nada de promessas de cura; cuidados de segurança sempre que houver ervas medicinais, cafeína alta, fermentação, peixe cru ou mel para bebês.',
              'Paleta: noite #111a21, ouro #d6b44c, papel #f6f1e6. Fontes: EB Garamond e Jost. Capa no estilo de desenho a mão (`tools/guias/capas`).']:
        w(f'- {r}')
    w('')
    w('## Visão geral')
    w('')
    w('| Nº | Guia | Páginas | Receitas e fórmulas |')
    w('|---|---|---|---|')
    for num, title, mods in catalog.GUIDES:
        G = guide_obj(num)
        n = sum(1 for _ in G.pages_fn())
        w(f'| {num} | {title} (`{G.slug}`) | {n} | {len(by_guide[num])} |')
    w('')
    for num, title, mods in catalog.GUIDES:
        G = guide_obj(num)
        w(f'## {num}. {title}')
        w('')
        w(f'*{catalog.pt(G.subtitle)}* · slug `{G.slug}`')
        w('')
        w('**Seções**')
        w('')
        for lvl, name, key in sections(G):
            w(('  ' * lvl) + f'- {name}')
        w('')
        groups = defaultdict(list)
        for it in by_guide[num]:
            groups[it['kind']].append(it)
        for k in KIND_ORDER:
            if not groups.get(k):
                continue
            w(f'**{KIND_LABEL[k]} ({len(groups[k])})**')
            w('')
            for it in groups[k]:
                ing = ', '.join(dict.fromkeys(i.split(' (')[0] for i in it['ingredients'] if i and not catalog.norm(i).startswith(('agua', 'gelo'))))
                w(f'- {it["name"]}: {ing}')
            w('')
    w('## Índice de ingredientes principais')
    w('')
    w('Quantas receitas usam cada ingrediente e em quais guias. Útil para achar o que está saturado (muitas receitas) e o que ainda foi pouco explorado.')
    w('')
    idx = defaultdict(list)
    for it in items:
        for t in set(it['tokens']) - catalog.NOISE - {'preto'}:
            idx[t].append(it)
    w('| Ingrediente | Receitas | Guias |')
    w('|---|---|---|')
    for t, lst in sorted(idx.items(), key=lambda x: -len(x[1])):
        gs = ', '.join(sorted({x['guide'] for x in lst}))
        w(f'| {t} | {len(lst)} | {gs} |')
    w('')
    w('## Temas ainda não explorados (ideias para próximos guias)')
    w('')
    for t in ['Chás do mundo: os rituais do Japão, Marrocos, Rússia, Índia, Inglaterra e Argentina, com receitas típicas de cada país.',
              'Fermentados de chá a fundo: jun, kombucha avançada, kefir de água com chá e vinagres de kombucha.',
              'Coquetelaria com chá (com e sem álcool): infusões em destilados, xaropes e técnicas de bar.',
              'Chás para crianças e família: tudo sem cafeína, com receitas divertidas e regras de segurança por idade.',
              'Panificação e confeitaria com chá: pães, bolos de festa, macarons e cremes.',
              'Pu-erh e chás envelhecidos: como guardar, envelhecer e degustar.',
              'Calendário do chá: uma receita por semana, acompanhando as estações e as festas brasileiras.']:
        w(f'- {t}')
    w('')
    # Receitas de despensa do site (grátis, fora dos guias): não repetir em guias novos
    import json as _json
    pr = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'src', 'content', 'pantry-recipes.json')
    if os.path.exists(pr):
        lst = _json.load(open(pr))
        w('## Receitas de despensa do site (grátis)')
        w('')
        w(f'{len(lst)} receitas criadas para a ferramenta "Com o que você tem" da página Receitas. São públicas e não estão em nenhum guia: um guia novo não deve repeti-las.')
        w('')
        for r in lst:
            w(f"- **{r['name']['pt']}**: {', '.join(i['item']['pt'] for i in r['ingredients'])}")
        w('')
    open(dest, 'w').write('\n'.join(L))
    print('ok', dest, len(items), 'itens')


if __name__ == '__main__':
    main(sys.argv[1])
