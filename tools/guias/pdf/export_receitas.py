"""Exporta as receitas gratuitas (amostras dos guias) para o site: src/content/recipes.json

Uso: python3 export_receitas.py
Duas receitas por guia, escolhidas pelo nome em PICKS. Ficam públicas no site como
porta de entrada do Google e das IAs, sempre com link para o guia completo.
"""
import contextlib, importlib, io, json, os, re, unicodedata
import catalog

PICKS = {
    '01': ['Preto Imperial de Especiarias', 'Água Fresca de Hibisco'],
    '02': ['Long Jing no Copo', 'Bubble Tea Caseiro'],
    '03': ['Melissa Morna com Limão', 'Chá de Banana com Canela'],
    '04': ['Gyokuro no Gelo', 'Mocha de Chá Preto'],
    '05': ['Chá Gelado de Pêssego de Verdade', 'Limonada Suíça de Chá Verde'],
    '06': ['Usucha', 'Brigadeiro de Matcha'],
    '07': ['Capim-cidreira & Maracujá', 'Sal de Ervas do Quintal'],
    '08': ['Quentão sem Álcool', 'Cold Brew Frutado com Gás'],
    '09': ['Scones Clássicos', 'Pudim de Chai'],
    '10': ['Mate Cocido com Leite', 'Chipa'],
}
LEVEL = {'easy': ('Simples', 'Easy'), 'mid': ('Intermediário', 'Intermediate'), 'adv': ('Técnica', 'Technique')}


def both(x):
    if isinstance(x, dict):
        return {'pt': x.get('pt', ''), 'en': x.get('en', '')}
    if isinstance(x, tuple):
        return {'pt': x[0], 'en': x[1]}
    return {'pt': str(x), 'en': str(x)}


def slugify(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def main():
    out = []
    index = []  # todas as receitas dos guias: só nome e ingredientes (sem quantidade nem preparo)
    for num, title, mods in catalog.GUIDES:
        want = PICKS[num]
        found = {}
        for m in mods:
            with contextlib.redirect_stdout(io.StringIO()):
                M = importlib.import_module(m)
            for var in ('RECIPES',):
                for r in getattr(M, var, []) or []:
                    if isinstance(r, dict) and catalog.pt(r['name']) in want and 'steps' in r:
                        found[catalog.pt(r['name'])] = r
                    if isinstance(r, dict) and 'steps' in r and 'ing' in r and not any(x['name']['pt'] == catalog.pt(r['name']) for x in index):
                        index.append({'name': both(r['name']), 'guideNumber': int(num), 'free': catalog.pt(r['name']) in want,
                                      'iced': bool(r.get('iced')), 'items': [both(i)['pt'] for q, i in r['ing']]})
        with contextlib.redirect_stdout(io.StringIO()):
            G = importlib.import_module(mods[-1]).GUIDE
        for name in want:
            r = found.get(name)
            assert r, (num, name)
            n = both(r['name'])
            out.append({
                'slug': {'pt': slugify(n['pt']), 'en': slugify(n['en'])},
                'guide': G.slug, 'guideNumber': int(num),
                'name': n, 'tag': both(r['tag']),
                'time': both(r['time']), 'yield': both(r['yield']),
                'caffeine': bool(r.get('caf')), 'iced': bool(r.get('iced')), 'milk': bool(r.get('milk')),
                'level': {'pt': LEVEL[r.get('level', 'easy')][0], 'en': LEVEL[r.get('level', 'easy')][1]},
                'ingredients': [{'qty': both(q), 'item': both(i)} for q, i in r['ing']],
                'steps': [both(s) for s in r['steps']],
                'finish': both(r['finish']) if r.get('finish') else None,
                'tip': both(r['tip']) if r.get('tip') else None,
            })
    dest = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'src', 'content', 'recipes.json')
    idx = os.path.join(os.path.dirname(dest), 'pantry-index.json')
    json.dump(index, open(idx, 'w'), ensure_ascii=False, indent=0)
    print(len(index), 'receitas no índice da busca por ingredientes ->', os.path.abspath(idx))
    json.dump(out, open(dest, 'w'), ensure_ascii=False, indent=1)
    print(len(out), 'receitas ->', os.path.abspath(dest))


if __name__ == '__main__':
    main()
