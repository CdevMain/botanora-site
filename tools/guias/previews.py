"""Gera as prévias (páginas de amostra) de cada guia para a página do produto.

Uso: python3 tools/guias/previews.py          (todos os guias)
     python3 tools/guias/previews.py <slug>   (um guia)

Lê seed/<slug>-<lang>.pdf e escreve public/assets/img/previews/<slug>-<lang>-<n>.jpg
e o índice previews.json, que o site lê para montar o leitor de prévia.
"""
import contextlib, importlib, io, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(HERE, 'pdf'))
import catalog  # noqa: E402

OUT = os.path.join(ROOT, 'public', 'assets', 'img', 'previews')
WIDTH = 900
HD = 1600  # versão para o zoom do leitor, carregada só quando a pessoa amplia
LABEL = {'pt': 'PRÉVIA · BOTÂNORA', 'en': 'PREVIEW · BOTÂNORA'}


def pick(pages):
    """Capa, abertura, sumário, uma página de conteúdo, uma de receitas e uma da segunda metade."""
    n = len(pages)
    idx = [0, 1, 2]
    heads = [i for i, p in enumerate(pages) if p['type'] == 'text' and p.get('heading') and i > 2]
    recs = [i for i, p in enumerate(pages) if p['type'] == 'recipes']
    content = heads[0] if heads else 3
    if recs:
        recipe = recs[0]
    else:
        recipe = next((i for i, p in enumerate(pages) if p['type'] == 'text' and not p.get('heading') and i > content), content + 1)
    late = next((i for i in heads if i >= n // 2 and abs(i - recipe) > 1 and i != content), None)
    if late is None:
        late = next((i for i in recs if abs(i - recipe) > 2), n - 3)
    for i in (content, recipe, late):
        if i not in idx:
            idx.append(i)
    return sorted(idx)[:6]


def font(size):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'C:/Windows/Fonts/arial.ttf', '/System/Library/Fonts/Supplemental/Arial.ttf']:
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def stamp(im, lang):
    d = ImageDraw.Draw(im, 'RGBA')
    k = im.width / WIDTH
    h = round(30 * k)
    d.rectangle([0, im.height - h, im.width, im.height], fill=(17, 26, 33, 215))
    f = font(round(13 * k))
    t = LABEL[lang]
    w = d.textlength(t, font=f)
    d.text(((im.width - w) / 2, im.height - h + round(8 * k)), t, fill=(214, 180, 76, 255), font=f)
    return im


def run(only=None):
    os.makedirs(OUT, exist_ok=True)
    mpath = os.path.join(OUT, 'previews.json')
    manifest = json.load(open(mpath)) if os.path.exists(mpath) else {}
    for num, title, mods in catalog.GUIDES:
        with contextlib.redirect_stdout(io.StringIO()):
            G = importlib.import_module(mods[-1]).GUIDE
        if only and G.slug != only:
            continue
        pages = G.pages_fn()
        chosen = pick(pages)
        manifest[G.slug] = {}
        for lang in ('pt', 'en'):
            pdf = os.path.join(ROOT, 'seed', G.file(lang))
            if not os.path.exists(pdf):
                print('sem PDF:', pdf)
                continue
            files = []
            for k, i in enumerate(chosen, 1):
                tmp = os.path.join(OUT, f'_tmp')
                subprocess.run(['pdftoppm', '-r', '200', '-png', '-f', str(i + 1), '-l', str(i + 1), '-singlefile', pdf, tmp], check=True)
                src = Image.open(tmp + '.png').convert('RGB')
                name, hd = f'{G.slug}-{lang}-{k}.jpg', f'{G.slug}-{lang}-{k}-hd.jpg'
                for w, fn, q in ((WIDTH, name, 80), (HD, hd, 78)):
                    im = src.resize((w, round(src.height * w / src.width)), Image.LANCZOS)
                    if k > 1:
                        stamp(im, lang)
                    im.save(os.path.join(OUT, fn), quality=q, optimize=True, progressive=True)
                os.remove(tmp + '.png')
                files.append({'file': name, 'hd': hd, 'page': i + 1})
            manifest[G.slug][lang] = {'pages': len(pages), 'items': files}
        print(G.slug, [i + 1 for i in chosen])
    json.dump(manifest, open(mpath, 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv) > 1 else None)
