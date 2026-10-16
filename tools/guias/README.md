# Ferramentas dos guias em PDF

Tudo o que gera os guias, as capas e as prévias do site. Uso interno.

## Antes de criar um guia novo

1. Leia `docs/guias-conteudo.md`. É o guia interno com tudo o que já foi publicado: seções, receitas, ingredientes e temas ainda livres.
2. Escreva o guia em `pdf/gNN_<slug>.py`, copiando a estrutura de um existente (`common.py` tem os atalhos: `opener`, `text`, `R`, `M`, `T`, `B`, `TIP`, `WARN`...). Todo texto é uma tupla `('português', 'english')`.
3. Confira repetições:

   ```
   cd tools/guias/pdf
   python3 catalog.py dups
   ```

   Pares acima de 0,67 precisam ser revistos. Mesma bebida, mesma combinação ou mesma técnica: troque.
4. Gere o PDF e confira se nenhuma página transborda:

   ```
   python3 build.py gNN_<slug> pt,en      # sai em tools/guias/pdf/out
   python3 shot.py out/<slug>-pt.pdf 1,3,5 previa.png
   ```
5. Atualize o guia interno: `python3 inventario.py ../../../docs/guias-conteudo.md`
6. Copie os PDFs para `seed/<slug>-pt.pdf` e `seed/<slug>-en.pdf`, cadastre o produto em `src/content/products.js` e gere a capa e a prévia (abaixo).

## Capas

```
cd tools/guias/capas
python3 render.py ../../../public/assets/img/covers            # web (1000 px)
SCALE=2.48 python3 render.py ../../../design/capas-a4          # A4 300 dpi
```

O desenho de cada capa fica em `designs.py`; o número de páginas e o título vêm de `products.js`. Gere a capa antes do PDF: o PDF usa a capa A4.

## Prévias do site

```
cd tools/guias
python3 previews.py
```

Gera 6 páginas de amostra de cada guia, em cada idioma, em `public/assets/img/previews/`. O site mostra automaticamente na página do produto.

## Requisitos

Python 3 com `playwright`, `numpy` e `Pillow`; Node 18+; `pdftoppm` (poppler-utils). Se o Chromium não for encontrado, defina `CHROMIUM_PATH`.

## Regras fixas

- PT-BR e inglês com o mesmo número de páginas.
- Nenhum travessão (o traço longo) nos textos.
- Cada receita existe em um único guia.
- Cuidados de segurança sempre que houver ervas medicinais, cafeína alta, fermentação, peixe cru ou mel.
