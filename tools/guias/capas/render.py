import asyncio, json, subprocess, sys, os
from playwright.async_api import async_playwright
from sketch import Sketch
from designs import DESIGNS

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out')
ONLY = sys.argv[2].split(',') if len(sys.argv) > 2 else None
os.makedirs(OUT, exist_ok=True)

products = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./src/content/products').seedProducts))"], cwd=SITE))
bymap = {p['slug']: p for p in products}
bmark = open(os.path.join(SITE, 'public/assets/img/b-mark.svg')).read()
FONTS = SITE + '/public/assets/fonts/'
PALETTE = ['#a3852b', '#bf9c3a', '#d6b44c', '#dcbd5a', '#e8d084', '#f0dc9c']

LABEL = {'pt': ('Guia em PDF', 'páginas'), 'en': ('PDF guide', 'pages')}


def html(slug, lang, svg_paths):
    p = bymap[slug]
    g, pg = LABEL[lang]
    n = str(p['order']).zfill(2)
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: EBG; src: url(file://{FONTS}eb-garamond-latin-400-normal.woff2); }}
@font-face {{ font-family: EBG; font-style: italic; src: url(file://{FONTS}eb-garamond-latin-400-italic.woff2); }}
@font-face {{ font-family: Jost; font-weight: 400; src: url(file://{FONTS}jost-latin-400-normal.woff2); }}
html, body {{ margin: 0; }}
.c {{ width: 1000px; height: 1414px; position: relative; overflow: hidden; background: radial-gradient(120% 70% at 50% 34%, #19262f 0%, #111a21 55%, #0c1318 100%); color: #f4efe4; }}
.grain {{ position: absolute; inset: 0; opacity: .22; mix-blend-mode: overlay; }}
.f1 {{ position: absolute; inset: 40px; border: 1px solid rgba(214,180,76,.38); }}
.f2 {{ position: absolute; inset: 52px; border: 1px solid rgba(214,180,76,.14); }}
.top {{ position: absolute; top: 92px; left: 0; right: 0; text-align: center; font: 400 19px Jost; letter-spacing: .62em; color: #d6b44c; }}
.top small {{ display: block; margin-top: 12px; font-size: 13px; letter-spacing: .5em; color: rgba(214,180,76,.65); }}
.art {{ position: absolute; top: 170px; left: 110px; width: 780px; height: 780px; }}
.t {{ position: absolute; top: 965px; left: 90px; right: 90px; text-align: center; }}
.t h1 {{ font: 400 {96 if len(p['title'][lang]) < 16 else 82}px/1.0 EBG; margin: 0; letter-spacing: -.01em; }}
.t p {{ font: italic 400 30px/1.3 EBG; color: #e8d084; margin: 22px auto 0; max-width: 700px; }}
.bot {{ position: absolute; bottom: 92px; left: 0; right: 0; text-align: center; font: 400 13px Jost; letter-spacing: .42em; color: rgba(244,239,228,.62); text-transform: uppercase; }}
.bot .rule {{ width: 90px; height: 1px; background: rgba(214,180,76,.5); margin: 0 auto 26px; }}
.mark {{ position: absolute; bottom: 132px; left: 50%; width: 44px; margin-left: -22px; opacity: .9; }}
</style></head><body><div class="c">
<svg class="grain" width="1000" height="1414"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
<div class="f1"></div><div class="f2"></div>
<div class="top">BOTANORA<small>Nº {n}</small></div>
<svg class="art" viewBox="0 0 1000 1000" fill="none" stroke-linecap="round" stroke-linejoin="round">{svg_paths}</svg>
<div class="t"><h1>{p['title'][lang]}</h1><p>{p['subtitle'][lang]}</p></div>
<div class="mark">{bmark}</div>
<div class="bot"><div class="rule"></div>{g} · {p['pages']} {pg}</div>
</div></body></html>"""


async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None)
        pg = await b.new_page(viewport={'width': 1000, 'height': 1414}, device_scale_factor=float(os.environ.get('SCALE', '1')))
        for i, (slug, fn) in enumerate(DESIGNS):
            if ONLY and slug not in ONLY:
                continue
            S = Sketch(seed=100 + i)
            fn(S)
            paths = S.svg_paths(PALETTE)
            for lang in ('pt', 'en'):
                f = os.path.join(HERE, f'_{slug}-{lang}.html')
                open(f, 'w').write(html(slug, lang, paths))
                await pg.goto('file://' + f)
                await pg.wait_for_timeout(250)
                await pg.screenshot(path=os.path.join(OUT, f'{slug}-{lang}.jpg'), type='jpeg', quality=86)
            print(slug, len(S.strokes), 'traços')
        await b.close()

asyncio.run(main())
