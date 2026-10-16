# Botanora: plano para aparecer no Google e ser recomendado por IAs

## O que já está no site

| Recurso | Para quê |
|---|---|
| 9 páginas de chá (`/pt/guia/matcha`, `/en/guide/matcha`...) | Cada chá tem a própria URL, título com "como preparar, temperatura, cafeína", resposta direta no topo e perguntas frequentes. Pegam buscas como "como fazer chá verde" ou "temperatura do matcha". |
| 20 receitas grátis (`/pt/receitas/...`) | Duas por guia, com schema **Recipe**, que pode aparecer com foto e tempo no Google. Cada uma leva ao guia pago. |
| 30 perguntas e respostas (`/pt/perguntas`) | Perguntas que as pessoas digitam no Google e no ChatGPT, com resposta curta na primeira frase, formato que as IAs costumam citar. |
| Dados estruturados (JSON-LD) | Organization, Product (com preço e páginas), Recipe, Article, FAQPage e BreadcrumbList. |
| `sitemap.xml` com PT e EN | Lista todas as páginas, com as versões dos dois idiomas ligadas (hreflang) e data de atualização. |
| `robots.txt` aberto para IAs | Libera explicitamente ChatGPT (OAI-SearchBot, ChatGPT-User, GPTBot), Claude, Perplexity, Gemini, Copilot (Bingbot), Apple e outros. Bloqueia só admin, pedidos e downloads. |
| `/llms.txt` e `/llms-full.txt` | Resumo do site em texto puro para IAs: tipos de chá com temperatura e cafeína, guias, receitas e todas as respostas. |
| Versão Markdown de cada página | Basta adicionar `.md` à URL (`/pt/guia/matcha.md`). Texto limpo, sem layout, fácil para IAs lerem e citarem. |
| IndexNow | Avisa Bing (base do Copilot) e outros buscadores das URLs uma vez por dia, automaticamente, quando o site está em HTTPS. |
| Verificação Google e Bing | Campos `GOOGLE_SITE_VERIFICATION` e `BING_SITE_VERIFICATION` no `.env`. |
| HTTPS forçado (HSTS) | Liga sozinho quando o `SITE_URL` é https. |

## Passo a passo depois que o HTTPS estiver ativo

1. **Google Search Console** (search.google.com/search-console): adicione a propriedade `https://botanora.cdev.com.br`, escolha verificação por "tag HTML", copie só o código do `content` para `GOOGLE_SITE_VERIFICATION` no `.env` da VPS e reinicie. Depois envie o sitemap: `https://botanora.cdev.com.br/sitemap.xml`.
2. **Bing Webmaster Tools** (bing.com/webmasters): importe direto do Search Console (mais rápido) ou verifique com `BING_SITE_VERIFICATION`. Envie o mesmo sitemap. O Bing alimenta o Copilot e outros assistentes.
3. **Teste os dados estruturados** no Rich Results Test do Google com uma receita (`/pt/receitas/chipa`) e uma página de chá.
4. **Peça indexação** no Search Console das páginas principais: home, `/pt/receitas`, `/pt/perguntas` e as 9 páginas de chá.

## Ideias reais para subir no Google

1. **Pinterest com as receitas.** Receita é o conteúdo que mais gera tráfego no Pinterest. Crie um pin vertical por receita (as capas e prévias já servem de base) com link para a página da receita. Funciona em PT e EN.
2. **Uma receita nova por semana.** Use o guia interno (`docs/guias-conteudo.md`) para não repetir e publique em `src/content/recipes.json` (ou peça para gerar). O Google favorece sites que publicam com regularidade.
3. **Responder no Reddit e Quora.** Perguntas como "how to make matcha without lumps" ou "melhor chá para dormir" aparecem em toda IA. Responda com conteúdo útil e o link da página específica, sem spam.
4. **Vídeos curtos (Reels, Shorts, TikTok).** Uma receita em 30 segundos com o link na bio. O YouTube é o segundo maior buscador e aparece nas respostas do Google.
5. **Parcerias com lojas de chá e empórios.** Peça para linkarem as páginas de chá como "como preparar". Links de sites do mesmo assunto são o fator externo mais forte.
6. **Perfil da Botanora nas redes** (Instagram, Pinterest, YouTube): depois de criar, coloque os links no schema `sameAs` (posso fazer). Ajuda Google e IAs a reconhecerem a marca como entidade.
7. **Atualizar as páginas de chá a cada 3 a 6 meses** com uma pergunta nova ou dado novo. Data de atualização recente pesa nas respostas de IA.
8. **Termos para mirar primeiro** (concorrência menor, intenção clara): "temperatura da água para chá verde", "como fazer chá gelado", "como fazer matcha sem batedor", "como montar chimarrão", "chá para dormir sem cafeína", "receita de chipa", "scones receita", "brigadeiro de matcha".

## Como acompanhar

- Search Console: impressões e cliques por página e por termo.
- Bing Webmaster Tools: relatório de desempenho em IA (citações no Copilot).
- Google Analytics e Clarity (com consentimento): de onde vem o tráfego e o que as pessoas fazem nas páginas de receita.
- Teste manual mensal: pergunte ao ChatGPT, Perplexity e Gemini "qual a temperatura certa para chá verde" e "receita de chipa" e veja se a Botanora aparece.

## Expectativa realista

Um site novo leva de 2 a 6 meses para ganhar posição no Google, e ninguém consegue garantir o primeiro lugar. O que acelera: conteúdo útil e específico (já está no ar), publicar com frequência e conseguir links de outros sites. As IAs costumam citar páginas que já aparecem bem no Google e no Bing, então os dois trabalhos andam juntos.
