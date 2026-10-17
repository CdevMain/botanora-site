"""Botânora: motor de diagramação dos guias em PDF (A4, página a página).
Cada guia é uma lista de páginas; cada página é um dicionário com tipo e conteúdo bilíngue.
Texto bilíngue: tupla (pt, en) ou dict {'pt':..., 'en':...}. Render via Chromium (Playwright)."""
import html, os, re, json, asyncio, sys
from playwright.async_api import async_playwright

SITE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))  # raiz do site
FONTS = SITE + '/public/assets/fonts/'
COVERS = SITE + '/design/capas-a4/'
BMARK = open(SITE + '/public/assets/img/b-mark.svg').read()
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'capas'))


def L(pt, en):
    return {'pt': pt, 'en': en}


def tr(x, lang):
    if x is None:
        return ''
    if isinstance(x, dict) and 'pt' in x:
        return x[lang]
    if isinstance(x, tuple) and len(x) == 2:
        return x[0] if lang == 'pt' else x[1]
    return x


def esc(s):
    return html.escape(str(s), quote=True)


def rich(s):
    """Texto com **negrito** e *itálico* simples."""
    s = esc(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'\*(.+?)\*', r'<i>\1</i>', s)
    return s


UI = {
    'pt': dict(chapter='Capítulo', contents='Sumário', page='p.', ingredients='Ingredientes', method='Preparo', finish='Finalização',
               tip='Toque do barista', hot='Quente', iced='Gelado', caf='Com cafeína', nocaf='Sem cafeína', milk='Com leite',
               levels={'easy': 'Simples', 'mid': 'Intermediário', 'adv': 'Técnica'}, guide='Guia', made='Feito com cuidado pela Botânora',
               note='Atenção', more='Continue explorando', site='botanora.com.br'),
    'en': dict(chapter='Chapter', contents='Contents', page='p.', ingredients='Ingredients', method='Method', finish='Finish',
               tip='Barista tip', hot='Hot', iced='Iced', caf='Caffeinated', nocaf='Caffeine-free', milk='With milk',
               levels={'easy': 'Easy', 'mid': 'Intermediate', 'adv': 'Technique'}, guide='Guide', made='Made with care by Botânora',
               note='Note', more='Keep exploring', site='botanora.com.br'),
}

ICON = {
    'hot': '<path d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 11h2a2 2 0 0 1 0 4h-2M8 3c-1 1.5 1 2 0 4M12 3c-1 1.5 1 2 0 4"/>',
    'iced': '<path d="M6 4h12l-1.5 16h-9zM9 9h3v3H9zM12.5 13h3v3h-3z"/>',
    'clock': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/>',
    'cup': '<path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6zM17 10h1.5a2.5 2.5 0 0 1 0 5H17"/>',
    'bolt': '<path d="M13 2 5 14h6l-1 8 8-12h-6z"/>',
    'moon': '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
    'milk': '<path d="M8 2h8v3l2 3v14H6V8l2-3zM6 12h12"/>',
    'level': '<path d="M4 20V14M10 20V9M16 20V4"/>',
    'leaf': '<path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16zM4 20 14 10"/>',
    'warn': '<path d="M12 3 2 20h20zM12 10v4M12 17v.5"/>',
}


def ico(name, cls='ic'):
    return f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">{ICON[name]}</svg>'


# ---------------- ornamentos desenhados ----------------
_art_cache = {}


def cover_art(slug, seed_index):
    """Ilustração riscada do guia (mesma da capa), em SVG."""
    if slug in _art_cache:
        return _art_cache[slug]
    from sketch import Sketch
    from designs import DESIGNS
    fn = dict(DESIGNS)[slug]
    S = Sketch(seed=100 + seed_index)
    fn(S)
    pal = ['#a3852b', '#bf9c3a', '#d6b44c', '#dcbd5a', '#e8d084', '#f0dc9c']
    svg = f'<svg viewBox="0 0 1000 1000" fill="none" stroke-linecap="round" stroke-linejoin="round">{S.svg_paths(pal)}</svg>'
    _art_cache[slug] = svg
    return svg


def sprig_svg(seed=3, w=520, h=320, leaves=9):
    """Ramo em traço fino (o mesmo do site)."""
    import subprocess
    js = f"const {{sprig}}=require('{SITE}/src/views/svg.js');console.log(sprig({{width:{w},height:{h},leaves:{leaves},seed:{seed}}}))"
    out = subprocess.check_output(['node', '-e', js]).decode()
    return out.replace('class="draw"', '')


# ---------------- CSS ----------------
CSS = f"""
@font-face {{ font-family: EBG; font-weight: 400; src: url(file://{FONTS}eb-garamond-latin-400-normal.woff2); }}
@font-face {{ font-family: EBG; font-weight: 400; font-style: italic; src: url(file://{FONTS}eb-garamond-latin-400-italic.woff2); }}
@font-face {{ font-family: EBG; font-weight: 500; src: url(file://{FONTS}eb-garamond-latin-500-normal.woff2); }}
@font-face {{ font-family: EBG; font-weight: 500; font-style: italic; src: url(file://{FONTS}eb-garamond-latin-500-italic.woff2); }}
@font-face {{ font-family: EBG; font-weight: 600; src: url(file://{FONTS}eb-garamond-latin-600-normal.woff2); }}
@font-face {{ font-family: Jost; font-weight: 300; src: url(file://{FONTS}jost-latin-300-normal.woff2); }}
@font-face {{ font-family: Jost; font-weight: 400; src: url(file://{FONTS}jost-latin-400-normal.woff2); }}
@font-face {{ font-family: Jost; font-weight: 500; src: url(file://{FONTS}jost-latin-500-normal.woff2); }}
@page {{ size: 210mm 297mm; margin: 0; }}
:root {{ --night:#111a21; --night2:#1a2630; --gold:#d6b44c; --gold2:#e8d084; --gold3:#9c7e26; --paper:#f6f1e6; --paper2:#ece4d2; --ink:#1a242c; --muted:#5d6870; --line:rgba(26,36,44,.14); }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; }}
body {{ font: 300 10.4pt/1.55 Jost, sans-serif; color: var(--ink); -webkit-print-color-adjust: exact; print-color-adjust: exact; font-variant-numeric: lining-nums; }}
.page {{ width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; break-after: page; background: var(--paper); }}
.page:last-child {{ page-break-after: auto; }}
.content {{ position: absolute; left: 20mm; right: 20mm; top: 22mm; bottom: 22mm; overflow: hidden; }}
.runhead {{ position: absolute; top: 9.5mm; left: 20mm; right: 20mm; display: flex; justify-content: space-between; font: 400 6.6pt Jost; letter-spacing: .32em; text-transform: uppercase; color: var(--gold3); border-bottom: .3pt solid rgba(156,126,38,.35); padding-bottom: 2.4mm; }}
.folio {{ position: absolute; bottom: 9mm; left: 20mm; right: 20mm; display: flex; justify-content: space-between; align-items: center; font: 400 7pt Jost; letter-spacing: .2em; color: var(--muted); }}
.folio .n {{ font: 500 10pt EBG; color: var(--gold3); letter-spacing: 0; }}
.folio svg {{ width: 6mm; height: 6mm; }}
.folio svg path {{ fill: var(--gold3); }}
.dark {{ background: var(--night); color: #f1ebdf; }}
.dark .runhead {{ color: var(--gold); border-color: rgba(214,180,76,.25); }}
.dark .folio {{ color: rgba(241,235,223,.5); }} .dark .folio .n {{ color: var(--gold); }} .dark .folio svg path {{ fill: var(--gold); }}

h1, h2, h3, h4 {{ font-family: EBG; font-weight: 400; margin: 0; letter-spacing: -.005em; }}
.eyebrow {{ font: 400 7.2pt Jost; letter-spacing: .36em; text-transform: uppercase; color: var(--gold3); margin: 0 0 3mm; }}
.dark .eyebrow {{ color: var(--gold); }}
h2.title {{ font-size: 27pt; line-height: 1.05; margin: 0 0 3mm; }}
.lead {{ font: italic 400 13pt/1.45 EBG; color: var(--muted); margin: 0 0 6mm; max-width: 150mm; }}
.dark .lead {{ color: rgba(241,235,223,.75); }}
h3 {{ font-size: 15pt; margin: 6mm 0 2mm; }}
h3:first-child {{ margin-top: 0; }}
h4 {{ font: 500 7.4pt Jost; letter-spacing: .22em; text-transform: uppercase; color: var(--gold3); margin: 4mm 0 1.5mm; }}
p {{ margin: 0 0 2.6mm; }}
ul, ol {{ margin: 0 0 3mm; padding-left: 5mm; }}
li {{ margin: 0 0 1.4mm; }}
li::marker {{ color: var(--gold3); }}
b {{ font-weight: 500; }}
.cols2 {{ column-count: 2; column-gap: 9mm; }}
.cols2 > * {{ break-inside: avoid; }}
.grid2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 6mm 9mm; }}
.grid3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm 6mm; }}
.rule {{ height: .3pt; background: var(--line); margin: 4mm 0; }}

.tip {{ background: rgba(214,180,76,.14); border-left: 1.4pt solid var(--gold); padding: 3mm 4mm; margin: 3mm 0; font-size: 9.6pt; break-inside: avoid; }}
.tip .k {{ display: block; font: 500 6.8pt Jost; letter-spacing: .24em; text-transform: uppercase; color: var(--gold3); margin-bottom: 1mm; }}
.warn {{ background: rgba(160,70,45,.07); border-left: 1.4pt solid #a3492f; padding: 3mm 4mm; margin: 3mm 0; font-size: 9.2pt; break-inside: avoid; }}
.warn .k {{ display: block; font: 500 6.8pt Jost; letter-spacing: .24em; text-transform: uppercase; color: #a3492f; margin-bottom: 1mm; }}
.quote {{ font: italic 400 16pt/1.35 EBG; color: var(--ink); border-top: .3pt solid var(--gold3); border-bottom: .3pt solid var(--gold3); padding: 5mm 0; margin: 6mm 0; text-align: center; }}

table.data {{ width: 100%; border-collapse: collapse; font-size: 9pt; margin: 2mm 0 4mm; break-inside: avoid; }}
table.data th {{ font: 500 6.6pt Jost; letter-spacing: .18em; text-transform: uppercase; color: var(--gold3); text-align: left; padding: 2mm 2.4mm; border-bottom: .6pt solid var(--gold3); }}
table.data td {{ padding: 2.1mm 2.4mm; border-bottom: .3pt solid var(--line); vertical-align: top; }}
table.data td:first-child {{ font: 500 10.6pt/1.25 EBG; }}
table.data tr:nth-child(even) td {{ background: rgba(236,228,210,.45); }}
table.data.compact td {{ padding: 1.4mm 2mm; }}

.card {{ background: #fffaf0; border: .3pt solid var(--line); padding: 4.5mm 5mm; break-inside: avoid; }}
.card h3 {{ margin: 0 0 1mm; font-size: 14pt; }}
.card .sub {{ font: italic 400 10.5pt EBG; color: var(--muted); margin: 0 0 2.5mm; }}
.card dl {{ display: grid; grid-template-columns: 26mm 1fr; gap: 1.2mm 3mm; margin: 2mm 0 0; font-size: 8.8pt; }}
.card dt {{ font: 500 6.4pt Jost; letter-spacing: .16em; text-transform: uppercase; color: var(--gold3); padding-top: .6mm; }}
.card dd {{ margin: 0; }}
.chips {{ display: flex; flex-wrap: wrap; gap: 1.6mm; margin: 2mm 0; }}
.chip {{ font: 400 7pt Jost; letter-spacing: .08em; border: .3pt solid var(--gold3); color: var(--gold3); padding: .8mm 2.2mm; border-radius: 10mm; }}

.steps {{ counter-reset: s; list-style: none; padding: 0; }}
.steps li {{ counter-increment: s; display: grid; grid-template-columns: 8mm 1fr; margin-bottom: 2.4mm; }}
.steps li::before {{ content: counter(s); font: italic 500 13pt/1 EBG; color: var(--gold3); }}
.check {{ list-style: none; padding: 0; }}
.check li {{ display: grid; grid-template-columns: 6mm 1fr; }}
.check li::before {{ content: ''; width: 3.2mm; height: 3.2mm; border: .5pt solid var(--gold3); margin-top: .9mm; }}

/* abertura de capítulo */
.opener .content {{ top: 30mm; }}
.opener .num {{ font: 400 7.4pt Jost; letter-spacing: .5em; text-transform: uppercase; color: var(--gold); }}
.opener h1 {{ font-size: 46pt; line-height: 1; margin: 6mm 0 3mm; color: #f6f1e6; }}
.opener .sub {{ font: italic 400 17pt EBG; color: var(--gold2); margin-bottom: 12mm; }}
.opener .intro {{ font-size: 11pt; line-height: 1.6; color: rgba(241,235,223,.8); max-width: 95mm; }}
.opener .list {{ position: absolute; right: 0; top: 70mm; width: 62mm; border-top: .3pt solid rgba(214,180,76,.4); background: rgba(17,26,33,.88); z-index: 2; }}
.opener .list div {{ display: grid; grid-template-columns: 9mm 1fr; padding: 2.2mm 0; border-bottom: .3pt solid rgba(214,180,76,.18); font: 400 11pt EBG; color: #f1ebdf; }}
.opener .list span {{ font: 400 7.4pt Jost; color: var(--gold); padding-top: 1.2mm; }}
.opener .art {{ position: absolute; left: 0; right: 0; bottom: 14mm; height: 105mm; opacity: .5; color: var(--gold); }}
.opener .art svg {{ width: 100%; height: 100%; }}
.opener .bigart {{ position: absolute; right: -6mm; bottom: 4mm; width: 110mm; height: 110mm; opacity: .9; }}

/* página de título */
.titlepage .content {{ display: flex; flex-direction: column; }}
.titlepage .brand {{ font: 400 8pt Jost; letter-spacing: .6em; color: var(--gold3); text-transform: uppercase; }}
.titlepage h1 {{ font-size: 40pt; line-height: 1.02; margin: 30mm 0 4mm; }}
.titlepage .sub {{ font: italic 400 16pt/1.35 EBG; color: var(--muted); max-width: 140mm; }}
.titlepage .how {{ margin-top: auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 7mm; border-top: .3pt solid var(--line); padding-top: 6mm; font-size: 9pt; }}
.titlepage .how b {{ display: block; font: 500 12pt EBG; margin-bottom: 1mm; }}
.titlepage .how .n {{ font: italic 500 18pt EBG; color: var(--gold3); }}
.colophon {{ margin-top: 8mm; font-size: 7.4pt; color: var(--muted); line-height: 1.5; }}

/* sumário */
.toc {{ margin-top: 8mm; }}
.toc .row {{ display: grid; grid-template-columns: 14mm 1fr auto; align-items: baseline; gap: 3mm; padding: 2.6mm 0; border-bottom: .3pt solid var(--line); }}
.toc .row .k {{ font: 400 7pt Jost; letter-spacing: .2em; color: var(--gold3); }}
.toc .row .t {{ font: 400 14pt EBG; }}
.toc .row .t small {{ display: block; font: italic 400 10pt EBG; color: var(--muted); }}
.toc .row .p {{ font: 500 11pt EBG; color: var(--gold3); }}
.toc .row.sub .t {{ font-size: 11.5pt; padding-left: 4mm; }}

/* receita */
.recipe {{ display: grid; grid-template-rows: auto auto 1fr auto; border-bottom: .3pt solid var(--line); padding-bottom: 4mm; margin-bottom: 5mm; break-inside: avoid; }}
.recipe:last-child {{ border-bottom: 0; margin-bottom: 0; }}
.rhead {{ display: grid; grid-template-columns: 17mm 1fr; align-items: end; }}
.rhead .rn {{ font: 400 30pt/0.9 EBG; color: var(--gold3); }}
.rhead h2 {{ font-size: 19pt; line-height: 1.1; }}
.rhead .tag {{ font: italic 400 11pt EBG; color: var(--muted); }}
.meta {{ display: flex; flex-wrap: wrap; gap: 4.5mm; margin: 3mm 0 3.5mm; padding: 1.8mm 0; border-top: .3pt solid var(--line); border-bottom: .3pt solid var(--line); font: 400 7.4pt Jost; letter-spacing: .06em; color: var(--muted); }}
.meta span {{ display: inline-flex; gap: 1.4mm; align-items: center; }}
.ic {{ width: 3.6mm; height: 3.6mm; color: var(--gold3); }}
.rbody {{ display: grid; grid-template-columns: 62mm 1fr; gap: 8mm; }}
.ing {{ width: 100%; border-collapse: collapse; font-size: 8.8pt; }}
.ing td {{ padding: 1.1mm 0; border-bottom: .3pt dotted var(--line); vertical-align: top; }}
.ing td:first-child {{ width: 21mm; font-weight: 400; color: var(--gold3); white-space: nowrap; padding-right: 2mm; }}
.rbody h4 {{ margin-top: 0; }}
.rbody .steps li {{ font-size: 9.1pt; margin-bottom: 1.6mm; }}
.rbody .steps li::before {{ font-size: 11pt; }}
.fin {{ font-size: 8.6pt; color: var(--muted); margin-top: 2mm; }}
.fin b {{ color: var(--ink); }}
.rtip {{ margin-top: 2.6mm; font-size: 8.8pt; background: rgba(214,180,76,.13); padding: 2.2mm 3.4mm; }}
.rtip b {{ font: 500 6.6pt Jost; letter-spacing: .2em; text-transform: uppercase; color: var(--gold3); margin-right: 2mm; }}

/* fichas pequenas (blends, receitas compactas) */
.mini {{ background: #fffaf0; border: .3pt solid var(--line); padding: 4mm 4.5mm; break-inside: avoid; }}
.mini .mn {{ font: 400 7pt Jost; letter-spacing: .2em; color: var(--gold3); }}
.mini h3 {{ margin: .6mm 0 .8mm; font-size: 13.5pt; }}
.mini .tag {{ font: italic 400 9.8pt EBG; color: var(--muted); margin: 0 0 2mm; }}
.mini table {{ width: 100%; border-collapse: collapse; font-size: 8.4pt; margin-bottom: 2mm; }}
.mini td {{ padding: .7mm 0; border-bottom: .3pt dotted var(--line); }}
.mini td:first-child {{ color: var(--gold3); width: 22mm; white-space: nowrap; }}
.mini p {{ font-size: 8.6pt; margin: 0 0 1.2mm; }}
.mini .how {{ font-size: 8.4pt; }}
.mini .meta2 {{ font: 400 6.8pt Jost; letter-spacing: .08em; color: var(--muted); text-transform: uppercase; margin-bottom: 1.6mm; }}

/* folha de anotação */
.sheet .line {{ border-bottom: .4pt solid var(--line); height: 8mm; }}
.sheet .field {{ display: grid; grid-template-columns: 38mm 1fr; align-items: end; gap: 3mm; margin-bottom: 2mm; font: 500 7pt Jost; letter-spacing: .16em; text-transform: uppercase; color: var(--gold3); }}
.scale {{ display: flex; gap: 2.4mm; }}
.scale i {{ width: 4.2mm; height: 4.2mm; border: .5pt solid var(--gold3); border-radius: 50%; display: inline-block; }}

/* encerramento */
.closing .content {{ display: flex; flex-direction: column; justify-content: center; text-align: center; align-items: center; }}
.closing h1 {{ font-size: 30pt; color: #f6f1e6; margin: 6mm 0 4mm; }}
.closing p {{ color: rgba(241,235,223,.75); max-width: 120mm; }}
.closing .mark svg {{ width: 18mm; height: 18mm; }}
.closing .mark svg path {{ fill: var(--gold); }}
.closing .others {{ display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 10mm; margin-top: 10mm; text-align: left; font: 400 10.5pt EBG; color: #f1ebdf; }}
.closing .others span {{ font: 400 6.8pt Jost; color: var(--gold); letter-spacing: .2em; margin-right: 2mm; }}
.closing .url {{ margin-top: 12mm; font: 400 8pt Jost; letter-spacing: .4em; color: var(--gold); text-transform: uppercase; }}
.closing .legal {{ position: absolute; bottom: 14mm; left: 25mm; right: 25mm; font-size: 6.8pt; color: rgba(241,235,223,.45); text-align: center; }}
.pageart {{ position: absolute; right: 16mm; bottom: 20mm; width: 78mm; height: 78mm; opacity: .32; }}
.pageart svg, .titleart svg {{ width: 100%; height: 100%; }}
.titleart-in {{ flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: flex-end; padding: 6mm 0; opacity: .9; }}
.titleart-in svg {{ height: 72mm; width: 72mm; }}
.titlepage h1, .titlepage .sub {{ max-width: 100mm; }}
.cover img {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
"""


# ---------------- páginas ----------------
class Guide:
    def __init__(self, slug, number, title, subtitle, pages_fn):
        self.slug, self.number, self.title, self.subtitle, self.pages_fn = slug, number, title, subtitle, pages_fn
        self.files = {}  # nome do PDF por idioma, quando difere de <slug>-<lang>

    def file(self, lang):
        return self.files.get(lang, f'{self.slug}-{lang}') + '.pdf'


def frame(inner, lang, n, head_left, head_right='', dark=False, cls='', outside=''):
    return f"""<section class="page {'dark ' if dark else ''}{cls}">{outside}
<div class="runhead"><span>{esc(head_left)}</span><span>{esc(head_right)}</span></div>
<div class="content">{inner}</div>
<div class="folio"><span>BOTÂNORA</span><span class="n">{n:02d}</span><span>{BMARK}</span></div>
</section>"""


def render_guide(g, lang):
    u = UI[lang]
    pages = g.pages_fn()
    title = tr(g.title, lang)
    # 1ª passada: números de página e sumário
    toc = []
    for i, p in enumerate(pages, start=1):
        p['_n'] = i
        if p.get('toc'):
            toc.append((p.get('toc_level', 0), tr(p['toc'], lang), tr(p.get('toc_sub'), lang), i, p.get('toc_key', '')))
    chapter = ''
    out = []
    for p in pages:
        n = p['_n']
        t = p['type']
        if p.get('chapter'):
            chapter = tr(p['chapter'], lang)
        if t == 'cover':
            out.append(f'<section class="page cover"><img src="file://{COVERS}{g.slug}-{lang}.jpg"></section>')
        elif t == 'title':
            how = ''.join(f'<div><span class="n">{i + 1:02d}</span><b>{esc(tr(a, lang))}</b>{rich(tr(b, lang))}</div>' for i, (a, b) in enumerate(p.get('how', [])))
            inner = f"""<div class="brand">Botânora · {esc(u['guide'])} Nº {g.number:02d}</div>
<h1>{esc(title)}</h1><div class="sub">{esc(tr(g.subtitle, lang))}</div>
<div style="margin-top:12mm;max-width:150mm">{''.join(f'<p>{rich(tr(x, lang))}</p>' for x in p.get('intro', []))}</div>
<div class="titleart-in">{cover_art(g.slug, g.number - 1)}</div>
<div class="how">{how}</div>
<div class="colophon">{rich(tr(p.get('colophon'), lang))}</div>"""
            out.append(frame(inner, lang, n, title, '', cls='titlepage', outside=''))
        elif t == 'toc':
            rows = ''.join(f'<div class="row{" sub" if lvl else ""}"><span class="k">{esc(k)}</span><span class="t">{esc(tt)}{f"<small>{esc(st)}</small>" if st else ""}</span><span class="p">{pn:02d}</span></div>' for lvl, tt, st, pn, k in toc)
            inner = f'<p class="eyebrow">{esc(u["contents"])}</p><h2 class="title">{esc(tr(p.get("heading", ("O que você vai encontrar", "What you will find")), lang))}</h2><div class="toc">{rows}</div>'
            out.append(frame(inner, lang, n, title, u['contents']))
        elif t == 'opener':
            lst = ''.join(f'<div><span>{esc(a)}</span>{esc(tr(b, lang))}</div>' for a, b in p.get('list', []))
            art = p.get('art', '')
            inner = f"""<div class="num">{esc(u['chapter'])} {esc(p['num'])}</div>
<h1>{esc(tr(p['title'], lang))}</h1><div class="sub">{esc(tr(p.get('sub'), lang))}</div>
<div class="intro">{''.join(f'<p>{rich(tr(x, lang))}</p>' for x in p.get('intro', []))}</div>
{f'<div class="list">{lst}</div>' if lst else ''}"""
            extra = f'<div class="art">{art}</div>' if art else ''
            out.append(frame(inner, lang, n, title, tr(p['title'], lang), dark=True, cls='opener', outside=extra))
        elif t == 'text':
            body = p['body'](lang) if callable(p['body']) else tr(p['body'], lang)
            head = ''
            if p.get('eyebrow'):
                head += f'<p class="eyebrow">{esc(tr(p["eyebrow"], lang))}</p>'
            if p.get('heading'):
                head += f'<h2 class="title">{esc(tr(p["heading"], lang))}</h2>'
            if p.get('lead'):
                head += f'<p class="lead">{rich(tr(p["lead"], lang))}</p>'
            art = f'<div class="pageart">{cover_art(g.slug, g.number - 1)}</div>' if p.get('art') else ''
            out.append(frame(head + body, lang, n, title, chapter, dark=p.get('dark', False), outside=art))
        elif t == 'recipes':
            body = ''.join(recipe_html(r, lang) for r in p['items'])
            out.append(frame(body, lang, n, title, chapter))
        elif t == 'closing':
            others = ''.join(f'<div><span>{o[0]:02d}</span>{esc(tr(o[1], lang))}</div>' for o in p.get('others', []))
            inner = f"""<div class="mark">{BMARK}</div><h1>{esc(tr(p['heading'], lang))}</h1>
{''.join(f'<p>{rich(tr(x, lang))}</p>' for x in p.get('body', []))}
<div class="others">{others}</div><div class="url">{esc(u['site'])}</div>"""
            out.append(f'<section class="page dark closing"><div class="content">{inner}</div><div class="legal">{rich(tr(p.get("legal"), lang))}</div></section>')
        else:
            raise ValueError(t)
    tpl = f'<template id="artTpl"><div class="pageart auto">{cover_art(g.slug, g.number - 1)}</div></template>'
    return f'<!doctype html><html lang="{"pt-BR" if lang == "pt" else "en"}"><head><meta charset="utf-8"><title>{esc(title)}</title><style>{CSS}</style></head><body>{"".join(out)}{tpl}</body></html>', len(pages)


def recipe_html(r, lang):
    u = UI[lang]
    meta = [f'<span>{ico("iced" if r.get("iced") else "hot")}{u["iced"] if r.get("iced") else u["hot"]}</span>',
            f'<span>{ico("clock")}{esc(tr(r["time"], lang))}</span>',
            f'<span>{ico("cup")}{esc(tr(r["yield"], lang))}</span>',
            f'<span>{ico("bolt" if r.get("caf") else "moon")}{u["caf"] if r.get("caf") else u["nocaf"]}</span>']
    if r.get('tea'):
        meta = [f'<span>{ico("leaf")}{esc(tr(r["tea"], lang))}</span>', meta[1], meta[2]]
    if r.get('milk'):
        meta.append(f'<span>{ico("milk")}{u["milk"]}</span>')
    meta.append(f'<span>{ico("level")}{u["levels"][r.get("level", "easy")]}</span>')
    ing = ''.join(f'<tr><td>{esc(tr(q, lang))}</td><td>{esc(tr(i, lang))}</td></tr>' for q, i in r['ing'])
    steps = ''.join(f'<li><span>{rich(tr(s, lang))}</span></li>' for s in r['steps'])
    return f"""<article class="recipe">
<div class="rhead"><div class="rn">{r['n']:02d}</div><div><h2>{esc(tr(r['name'], lang))}</h2><div class="tag">{esc(tr(r['tag'], lang))}</div></div></div>
<div class="meta">{''.join(meta)}</div>
<div class="rbody"><div><h4>{u['ingredients']}</h4><table class="ing">{ing}</table>
{f'<div class="fin"><b>{u["finish"]}.</b> {esc(tr(r["finish"], lang))}</div>' if r.get('finish') else ''}</div>
<div><h4>{u['method']}</h4><ol class="steps">{steps}</ol></div></div>
{f'<div class="rtip"><b>{u["tip"]}</b>{rich(tr(r["tip"], lang))}</div>' if r.get('tip') else ''}
</article>"""


# ---------------- helpers de conteúdo ----------------
def paras(*items):
    """Lista de parágrafos bilíngues -> função lang -> html."""
    def f(lang):
        return ''.join(f'<p>{rich(tr(x, lang))}</p>' for x in items)
    return f


def table(headers, rows, cls='data'):
    def f(lang):
        th = ''.join(f'<th>{esc(tr(h, lang))}</th>' for h in headers)
        tb = ''.join('<tr>' + ''.join(f'<td>{rich(tr(c, lang))}</td>' for c in r) + '</tr>' for r in rows)
        return f'<table class="{cls}"><thead><tr>{th}</tr></thead><tbody>{tb}</tbody></table>'
    return f


def join(*parts):
    """Combina blocos (funções lang->html ou strings html)."""
    def f(lang):
        return ''.join(p(lang) if callable(p) else p for p in parts)
    return f


def h3(x):
    return lambda lang: f'<h3>{esc(tr(x, lang))}</h3>'


def h4(x):
    return lambda lang: f'<h4>{esc(tr(x, lang))}</h4>'


def tip(text, key=None):
    return lambda lang: f'<div class="tip"><span class="k">{esc(tr(key, lang) if key else UI[lang]["tip"].replace("do barista", "Botânora").replace("Barista tip", "Botânora tip"))}</span>{rich(tr(text, lang))}</div>'


def warn(text, key=None):
    return lambda lang: f'<div class="warn"><span class="k">{esc(tr(key, lang) if key else UI[lang]["note"])}</span>{rich(tr(text, lang))}</div>'


def quote(text):
    return lambda lang: f'<div class="quote">{rich(tr(text, lang))}</div>'


def bullets(*items, ordered=False, cls=''):
    tag = 'ol' if ordered else 'ul'
    return lambda lang: f'<{tag} class="{cls}">' + ''.join(f'<li><span>{rich(tr(x, lang))}</span></li>' for x in items) + f'</{tag}>'


def cols2(*parts):
    inner = join(*parts)
    return lambda lang: f'<div class="cols2">{inner(lang)}</div>'


def grid(n, *cells):
    return lambda lang: f'<div class="grid{n}">' + ''.join(c(lang) if callable(c) else c for c in cells) + '</div>'


def card(title, sub, body=None, facts=None, chips=None):
    def f(lang):
        dl = ''
        if facts:
            dl = '<dl>' + ''.join(f'<dt>{esc(tr(k, lang))}</dt><dd>{rich(tr(v, lang))}</dd>' for k, v in facts) + '</dl>'
        ch = ''
        if chips:
            ch = '<div class="chips">' + ''.join(f'<span class="chip">{esc(tr(c, lang))}</span>' for c in chips) + '</div>'
        b = ''
        if body:
            b = ''.join(f'<p>{rich(tr(x, lang))}</p>' for x in (body if isinstance(body, list) else [body]))
        return f'<div class="card"><h3>{esc(tr(title, lang))}</h3>{f"<div class=sub>{esc(tr(sub, lang))}</div>" if sub else ""}{b}{ch}{dl}</div>'
    return f


def mini(n, name, tag, rows, how, meta=None, note=None):
    def f(lang):
        tb = ''.join(f'<tr><td>{esc(tr(a, lang))}</td><td>{esc(tr(b, lang))}</td></tr>' for a, b in rows)
        return f"""<div class="mini"><div class="mn">Nº {n:02d}</div><h3>{esc(tr(name, lang))}</h3><div class="tag">{esc(tr(tag, lang))}</div>
{f'<div class="meta2">{esc(tr(meta, lang))}</div>' if meta else ''}<table>{tb}</table><p class="how">{rich(tr(how, lang))}</p>{f'<p><i>{rich(tr(note, lang))}</i></p>' if note else ''}</div>"""
    return f


def raw(h):
    return lambda lang: h


# ---------------- render ----------------
async def build(guides, outdir, langs=('pt', 'en'), check=True):
    os.makedirs(outdir, exist_ok=True)
    report = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        pg = await b.new_page()
        for g in guides:
            for lang in langs:
                doc, n = render_guide(g, lang)
                f = os.path.join(HERE, 'html', f'{g.slug}-{lang}.html')
                os.makedirs(os.path.dirname(f), exist_ok=True)
                open(f, 'w').write(doc)
                await pg.goto('file://' + f)
                await pg.wait_for_timeout(300)
                await pg.evaluate("""() => { const t = document.getElementById('artTpl'); if (!t) return;
                  document.querySelectorAll('.page:not(.dark):not(.cover):not(.titlepage)').forEach(p => {
                    if (p.querySelector('.pageart')) return; const c = p.querySelector('.content'); if (!c) return;
                    const last = [...c.children].pop(); if (!last) return;
                    const used = last.getBoundingClientRect().bottom - c.getBoundingClientRect().top;
                    if (used < c.clientHeight * 0.66) p.appendChild(t.content.cloneNode(true)); }); }""")
                over = await pg.evaluate("""() => [...document.querySelectorAll('.page')].map((p, i) => { const c = p.querySelector('.content'); return c && c.scrollHeight > c.clientHeight + 2 ? [i + 1, c.scrollHeight - c.clientHeight] : null }).filter(Boolean)""")
                await pg.pdf(path=os.path.join(outdir, g.file(lang)), prefer_css_page_size=True, print_background=True)
                report[f'{g.slug}-{lang}'] = (n, over)
                print(f'{g.slug}-{lang}: {n} páginas', ('TRANSBORDO ' + str(over)) if over else 'ok')
        await b.close()
    return report
