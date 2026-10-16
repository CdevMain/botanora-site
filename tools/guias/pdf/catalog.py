"""Inventário de receitas de todos os guias + detector de repetições.

Uso:
  python3 catalog.py dups            -> lista pares de receitas parecidas
  python3 catalog.py json out.json   -> inventário completo (para o guia interno)
"""
import importlib, json, sys, unicodedata, itertools, contextlib, io

GUIDES = [
    ('01', 'Infusões de Autor', ['g01_infusoes']),
    ('02', 'Atlas do Chá', ['g02_atlas', 'x02_atlas']),
    ('03', 'Ritual da Noite', ['g03_ritual', 'x03_ritual']),
    ('04', 'Foco & Energia', ['g04_foco', 'x04_foco']),
    ('05', 'Gelados & Cold Brew', ['g05_gelados', 'x05_gelados']),
    ('06', 'Matcha em Casa', ['g06_matcha', 'x06_matcha']),
    ('07', 'Ervas do Quintal', ['g07_ervas', 'x07_ervas']),
    ('08', 'Blends Autorais', ['g08_blends', 'x08_blends']),
    ('09', 'Chá & Mesa', ['g09_mesa', 'x09_mesa']),
    ('10', 'Erva-Mate', ['g10_mate', 'x10_mate']),
]
RECIPE_VARS = {'RECIPES', 'BLENDS', 'ICED', 'MIX', 'MOCK', 'MR', 'F', 'F2'}

KEYS = ['camomila', 'melissa', 'cidreira', 'capim', 'hortela', 'gengibre', 'limao', 'laranja', 'tangerina', 'hibisco', 'rooibos', 'mate', 'matcha', 'cha preto', 'preto', 'verde', 'sencha',
        'oolong', 'branco', 'bai mu dan', 'canela', 'cardamomo', 'cravo', 'anis', 'maca', 'pera', 'mel', 'leite', 'aveia', 'curcuma', 'cacau', 'chocolate', 'lavanda', 'erva-doce', 'pessego',
        'abacaxi', 'coco', 'morango', 'maracuja', 'manga', 'hojicha', 'genmaicha', 'earl grey', 'jasmim', 'pu-erh', 'tonica', 'gas', 'baunilha', 'rosa', 'tilia', 'alecrim', 'manjericao',
        'tomilho', 'louro', 'calendula', 'passiflora', 'pepino', 'melancia', 'uva', 'tamara', 'banana', 'castanha', 'amendoa', 'cevada', 'arroz', 'guarana', 'pimenta', 'lapsang', 'chai',
        'tererê', 'terere', 'lichia', 'kiwi', 'tamarindo', 'acucar', 'xarope', 'cha azul', 'gyokuro', 'kukicha', 'ceylon', 'darjeeling', 'assam', 'iogurte', 'cha-mate']
NOISE = {'acucar', 'xarope', 'mel', 'gas'}


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def pt(x):
    if isinstance(x, dict):
        return x.get('pt', '')
    if isinstance(x, tuple):
        return x[0]
    return str(x)


def tokens(texts):
    t = norm(' '.join(texts))
    out = set()
    for k in KEYS:
        if norm(k) in t:
            out.add(norm(k).replace('cha-mate', 'mate').replace('terere', 'tererê'))
    if 'cha preto' in out:
        out.add('preto')
    return out


def collect():
    items = []
    for num, title, mods in GUIDES:
        for m in mods:
            with contextlib.redirect_stdout(io.StringIO()):
                M = importlib.import_module(m)
            for var, val in vars(M).items():
                if var not in RECIPE_VARS or not isinstance(val, list):
                    continue
                for it in val:
                    if isinstance(it, dict) and 'ing' in it:
                        name, ings = pt(it['name']), [pt(i) for _, i in it['ing']]
                        kind = 'receita'
                    elif isinstance(it, tuple):
                        name = pt(it[0])
                        rows = next((x for x in it if isinstance(x, list)), [])
                        ings = [pt(r[1]) for r in rows]
                        kind = {'F': 'fórmula', 'F2': 'fórmula', 'MOCK': 'mocktail', 'BLENDS': 'blend', 'MIX': 'mistura'}.get(var, 'receita curta')
                    else:
                        continue
                    items.append(dict(guide=num, title=title, module=m, var=var, kind=kind, name=name, ingredients=ings, tokens=sorted(tokens([name] + ings))))
    return items


def dups(items, thr=0.6):
    out = []
    for a, b in itertools.combinations(items, 2):
        if a['module'] == b['module'] and a['var'] == b['var'] and a['name'] == b['name']:
            continue
        ta, tb = set(a['tokens']) - NOISE, set(b['tokens']) - NOISE
        if len(ta) < 2 or len(tb) < 2:
            continue
        j = len(ta & tb) / len(ta | tb)
        if j >= thr:
            out.append((round(j, 2), a, b))
    return sorted(out, key=lambda x: -x[0])


if __name__ == '__main__':
    items = collect()
    if sys.argv[1] == 'dups':
        thr = float(sys.argv[2]) if len(sys.argv) > 2 else 0.6
        for j, a, b in dups(items, thr):
            print(f"{j:.2f}  [{a['guide']}] {a['name']}  ({a['module']})  <->  [{b['guide']}] {b['name']}  ({b['module']})   {sorted(set(a['tokens']) & set(b['tokens']))}")
        print(len(items), 'itens')
    elif sys.argv[1] == 'json':
        json.dump(items, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
