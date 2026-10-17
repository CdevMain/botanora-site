from engine import *
from g01_infusoes import closing_page, OTHERS

_seed = [10]


def opener(num, title, sub, intro, items=None, toc=True):
    _seed[0] += 3
    p = {'type': 'opener', 'num': num, 'title': L(*title), 'sub': L(*sub), 'intro': [L(*x) for x in intro], 'chapter': L(*title),
         'art': sprig_svg(seed=_seed[0], w=700, h=420, leaves=10)}
    if items:
        p['list'] = [(f'{i + 1:02d}', L(*t)) for i, t in enumerate(items)]
    if toc:
        p.update(toc=L(*title), toc_sub=L(*sub), toc_key=num)
    return p


def text(heading=None, body=None, eyebrow=None, lead=None, toc=None, art=False, chapter=None, sub_toc=False):
    p = {'type': 'text', 'body': body}
    if heading:
        p['heading'] = L(*heading)
    if eyebrow:
        p['eyebrow'] = L(*eyebrow)
    if lead:
        p['lead'] = L(*lead)
    if toc:
        p.update(toc=L(*toc) if isinstance(toc, tuple) else L(*heading), toc_level=1 if sub_toc else 0, toc_key='·')
    if art:
        p['art'] = True
    if chapter:
        p['chapter'] = L(*chapter)
    return p


def title_page(intro, how, colophon_extra=('', '')):
    base = ('© Botânora. Uso pessoal; é proibida a reprodução ou redistribuição sem autorização. O conteúdo é educativo e não substitui orientação médica, nutricional ou de outro profissional de saúde.',
            '© Botânora. For personal use; reproduction or redistribution without permission is prohibited. The content is educational and does not replace medical, nutritional or other professional health advice.')
    return {'type': 'title', 'intro': [L(*x) for x in intro], 'how': [(L(*a), L(*b)) for a, b in how],
            'colophon': L((base[0] + ' ' + colophon_extra[0]).strip(), (base[1] + ' ' + colophon_extra[1]).strip())}


def fn(lang_fn):
    return lang_fn


def P(*pairs):
    return paras(*[L(*x) for x in pairs])


def T(headers, rows, cls='data'):
    conv = lambda c: L(*c) if isinstance(c, tuple) else c
    return table([conv(h) for h in headers], [[conv(c) for c in r] for r in rows], cls)


def B(*items, ordered=False, cls=''):
    return bullets(*[L(*x) for x in items], ordered=ordered, cls=cls)


def C(title, sub, body=None, facts=None, chips=None):
    conv = lambda c: L(*c) if isinstance(c, tuple) else c
    return card(conv(title), conv(sub) if sub else None, [conv(b) for b in body] if isinstance(body, list) else (conv(body) if body else None),
                [(conv(a), conv(b)) for a, b in facts] if facts else None, [conv(c) for c in chips] if chips else None)


def TIP(pt, en, key=None):
    return tip(L(pt, en), L(*key) if key else None)


def WARN(pt, en, key=None):
    return warn(L(pt, en), L(*key) if key else None)


def Q(pt, en):
    return quote(L(pt, en))


def H3(pt, en):
    return h3(L(pt, en))


def H4(pt, en):
    return h4(L(pt, en))


def M(n, name, tag, rows, how, meta=None, note=None):
    conv = lambda c: L(*c) if isinstance(c, tuple) else c
    return mini(n, conv(name), conv(tag), [(conv(a), conv(b)) for a, b in rows], conv(how), conv(meta) if meta else None, conv(note) if note else None)


def sheet(lang, fields, scales=()):
    h = '<div class="sheet">'
    for f in fields:
        h += f'<div class="field"><span>{esc(tr(L(*f), lang))}</span><div class="line"></div></div>'
    for s in scales:
        h += f'<div class="field"><span>{esc(tr(L(*s), lang))}</span><div class="scale">' + '<i></i>' * 5 + '</div></div>'
    return h + '</div>'


def R(n, name, tag, iced, time, yld, caf, level, ing, steps, fin, tip_, milk=False):
    return dict(n=n, name=L(*name), tag=L(*tag), iced=iced, time=L(*time) if isinstance(time, tuple) else time, **{'yield': L(*yld)}, caf=caf, milk=milk, level=level,
                ing=[(L(a, b), L(c, d)) for a, b, c, d in ing], steps=[L(*s) for s in steps], finish=L(*fin) if fin else None, tip=L(*tip_) if tip_ else None)


def extend(G, extra, insert_at=None):
    """Acrescenta páginas a um guia já escrito (antes do fechamento, ou em insert_at)."""
    orig = G.pages_fn

    def f():
        p = orig()
        at = len(p) - 1 if insert_at is None else insert_at(p)
        return p[:at] + extra() + p[at:]
    return Guide(G.slug, G.number, G.title, G.subtitle, f)


def recipe_pages(recs):
    return [{'type': 'recipes', 'items': recs[i:i + 2]} for i in range(0, len(recs), 2)]


def cards_page(cards, chapter, per=4, cols=2, heading=None, eyebrow=None, lead=None, toc=None):
    out = []
    for i in range(0, len(cards), per):
        out.append(text(heading if i == 0 else None, body=grid(cols, *cards[i:i + per]), chapter=chapter,
                        eyebrow=eyebrow if i == 0 else None, lead=lead if i == 0 else None, toc=toc if i == 0 else None))
    return out
