# Botânora

Central sobre chás (tipos, benefícios com nível de evidência, guia de preparo com timer e quiz) com loja de guias em PDF e painel administrativo com métricas reais. Bilíngue (PT-BR e EN).

## Rodar

Requer **Node.js 18 ou superior**. Não há dependências para instalar.

```bash
npm start
```

- Site: http://localhost:3000 (redireciona para `/pt` ou `/en` conforme o navegador)
- Painel: http://localhost:3000/admin

No primeiro start o servidor cria o arquivo `.env` com uma **senha de admin aleatória** e mostra a senha no terminal. Troque `ADMIN_PASSWORD` no `.env` quando quiser.

## Estrutura

```
server.js                 servidor HTTP, rotas, APIs, download protegido
src/config.js             leitura do .env
src/store.js              banco em arquivo (data/db.json) + eventos (data/events.ndjson)
src/analytics.js          métricas sem cookies e agregação para o painel
src/auth.js               login do painel (sessão HttpOnly, bloqueio após 5 tentativas)
src/access.js             acesso do cliente: link de uso único e sessão por aparelho
src/i18n.js               textos da interface e rotas em PT/EN
src/content/              conteúdo editorial: chás, benefícios, quiz e os 10 guias
src/views/                páginas renderizadas no servidor (SEO, hreflang, JSON-LD)
public/assets/            CSS, JS, fontes auto-hospedadas e imagens
seed/                     os 20 PDFs (10 guias em PT e EN), copiados para data/pdfs no start
data/                     criado automaticamente: banco, eventos e PDFs (fora do git)
```

## Páginas

| PT | EN | |
|---|---|---|
| `/pt` | `/en` | Home: espectro de oxidação interativo, benefícios, preparo, guias |
| `/pt/guia` | `/en/guide` | 9 tipos de chá, comparativo e gráfico de cafeína |
| `/pt/beneficios` | `/en/benefits` | 6 benefícios com nível de evidência, filtro e cuidados |
| `/pt/preparo` | `/en/brewing` | Calculadora de dose + timer com aviso sonoro e notificação |
| `/pt/quiz` | `/en/quiz` | "Qual chá é para você?" com recomendação de guia |
| `/pt/loja` | `/en/shop` | Os 10 guias em PDF, compra ou lista de espera |
| `/pt/receber` | `/en/receive` | Página de receber: e-mail (recebe um link de uso único) ou e-mail + código do pedido → biblioteca |
| `/pt/biblioteca` | `/en/library` | Biblioteca do cliente: só abre no aparelho conectado; escolhe o guia e o idioma do PDF |

## Vendas

- **Toda venda acontece na Cakto.** Em **Painel → Produtos**, cole em cada guia o link do checkout da Cakto (PT e, se houver, EN). O botão Comprar da página do guia leva para esse link. Guia sem link mostra a lista de espera.
- O PDF fica fora da pasta pública e só é entregue pela biblioteca, no aparelho conectado (limite de `MAX_DOWNLOADS` por pedido).
- Sem a Resend configurada o site não envia e-mails: o cliente entra com e-mail + código do pedido, e o painel tem "Gerar link de acesso" (uso único, vale 3 dias).

## Cakto + entrega por e-mail

Fluxo: o cliente compra na Cakto → a Cakto chama o webhook → o pedido é liberado aqui → o cliente abre a biblioteca e escolhe guia e idioma.

1. **Webhook:** Cakto → Integrações → Webhooks → Adicionar. URL: `SITE_URL/api/webhooks/cakto`. Eventos: `purchase_approved`, `refund`, `chargeback`. Copie o *secret* para `CAKTO_WEBHOOK_SECRET` no `.env` e reinicie. A assinatura `X-Cakto-Signature` (HMAC-SHA256) é validada; reembolso e chargeback revogam o acesso.
2. **Entrega "Acesso por e-mail":** no produto da Cakto, use o link `SITE_URL/receber` (ou `SITE_URL/receive` para a oferta em inglês). O cliente informa o e-mail e o código do pedido (o mesmo `refId` que aparece na Cakto) e entra na biblioteca.
3. **Ligar guias:** Painel → Produtos → "IDs na Cakto": ID do produto ou da oferta. Um combo libera vários guias se o mesmo ID estiver em cada um. Use `id:en` numa oferta em inglês para que o idioma padrão do PDF seja inglês. Vendas sem guia ligado aparecem em Painel → Integrações com o ID para copiar.
4. **E-mail automático (opcional):** com `RESEND_API_KEY` e `MAIL_FROM` (domínio verificado na [Resend](https://resend.com)) o cliente recebe o link da biblioteca no idioma da compra assim que o pagamento é aprovado, e a página de receber funciona só com o e-mail.

## PDFs em português e inglês

Os 10 guias já vêm prontos nas duas línguas em `seed/` (`<slug>-pt.pdf` e `<slug>-en.pdf`) e são ligados aos produtos automaticamente no primeiro start. Para trocar uma versão, envie o novo arquivo em Painel → Produtos. Na compra pelo site o cliente escolhe o idioma; na biblioteca ele pode baixar qualquer versão disponível. Se só existir uma versão, ela é entregue nas duas línguas.

## Capas, favicon e prompts

- Capas ilustradas: `public/assets/img/covers/<slug>-pt.jpg` e `-en.jpg` (usadas automaticamente no site). Versões A4 300 dpi em `design/capas-a4/`.
- Prompts para gerar ilustrações alternativas: `docs/prompts-capas.md`.
- Favicon com o B desenhado à mão: `public/favicon.ico`, `public/assets/img/favicon.svg`, ícones 180/192/512 e `manifest.webmanifest`. O B isolado está em `public/assets/img/b-mark.svg`.

## Prévia antes de comprar

Cada página de produto mostra 6 páginas de amostra do guia (capa, abertura, sumário, uma página de conteúdo e duas de receitas), no idioma do site, com um leitor em tela cheia que funciona no celular (deslizar) e no teclado (setas). As imagens ficam em `public/assets/img/previews/` e são geradas a partir dos PDFs de `seed/` com `python3 tools/guias/previews.py`. Quantas vezes as prévias foram abertas aparece no painel, em Engajamento.

## Busca (Google) e IAs

Páginas de chá (`/pt/guia/<chá>`), 20 receitas grátis (`/pt/receitas`), perguntas frequentes (`/pt/perguntas`), dados estruturados, `sitemap.xml`, `robots.txt` aberto para IAs, `/llms.txt`, versão Markdown de cada página (`.md` no fim da URL) e IndexNow automático. O plano completo, com o passo a passo do Search Console e ideias para crescer, está em `docs/seo-e-ia.md`. As receitas públicas saem dos guias com `python3 tools/guias/pdf/export_receitas.py`.

## Acesso do cliente (sem senha e sem link aberto)

- **Link de entrada de uso único:** chega por e-mail (24 h quando pedido na página de receber, 3 dias após a compra). Abre uma página com o botão "Entrar neste aparelho"; só o clique gasta o link, então leitores de e-mail que abrem links sozinhos não estragam o acesso. Guardamos apenas o hash do link.
- **Aparelho conectado:** depois de entrar, o aparelho recebe um cookie seguro (HttpOnly) que dura `ACCESS_DAYS`. A biblioteca e os downloads só funcionam com ele; o endereço da biblioteca sozinho não abre nada.
- **Outro aparelho:** a pessoa vai em Receber meus guias e pede um link novo, que chega no e-mail da compra. Sem e-mail configurado, entra com e-mail + código do pedido da Cakto.
- **Limites:** até `MAX_DEVICES` aparelhos por e-mail (o mais antigo sai) e `MAX_DOWNLOADS` por pedido. O cliente pode sair de um ou de todos os aparelhos; no painel, "Desconectar aparelhos" faz o mesmo.

## Criar um guia novo

Antes de escrever, consulte `docs/guias-conteudo.md`, o guia interno com tudo o que os 10 guias já cobrem (seções, receitas, ingredientes e temas livres). O passo a passo para escrever, checar repetições, gerar o PDF, a capa e a prévia está em `tools/guias/README.md`.

## Adicionar um novo guia

1. Painel → **Produtos** → envie o PDF em português e/ou inglês no card do guia.
2. Ajuste preço e páginas, mude o status para **Disponível** e salve.
3. Avise a lista de espera daquele guia (Painel → Público → exportar CSV).

Para trocar a capa gerada por uma imagem, coloque o arquivo em `public/assets/img/covers/` e defina `cover` no item correspondente de `src/content/products.js` (ou em `data/db.json`).

## Métricas

Coletadas pelo próprio servidor, sem cookies e sem serviços de terceiros:
visitantes (identificador anônimo com sal diário; o IP não é guardado), visualizações, páginas por visita, tempo de engajamento, rejeição, origem, campanhas `utm_source`, dispositivo, navegador, idioma, funil de compra, receita, ticket médio, conversão por guia, listas de espera, uso do quiz e do timer, downloads. Robôs e navegadores automatizados são ignorados.

## Produção (VPS: botanora.cdev.com.br)

Tudo o que é preciso está em `deploy/`: Nginx, serviço do systemd e scripts de instalação e atualização.

1. **DNS:** no painel do domínio `cdev.com.br`, crie um registro **A** `botanora` apontando para o IP da VPS (e **AAAA** se a VPS tiver IPv6).
2. **Código na VPS:** `git clone <repositório> /var/www/botanora` (ou envie a pasta por `scp`/`rsync`).
3. **Instalação (uma vez):** `sudo bash /var/www/botanora/deploy/setup.sh`. O script instala o Node 20 se faltar, cria o usuário `botanora`, gera o `.env` de produção (porta 3010 em 127.0.0.1, `SITE_URL=https://botanora.cdev.com.br`, `TRUST_PROXY=1`, senha nova do painel), ativa o serviço, configura o Nginx e tira o certificado HTTPS com o Certbot.
4. **Atualizações:** `sudo bash /var/www/botanora/deploy/update.sh` faz backup de `data/` e `.env` em `/var/backups/botanora`, roda `git pull` e reinicia o serviço.

Depois de no ar:

- Webhook da Cakto: `https://botanora.cdev.com.br/api/webhooks/cakto` e o secret em `CAKTO_WEBHOOK_SECRET` no `.env`.
- Link do produto na Cakto ("Acesso por e-mail"): `https://botanora.cdev.com.br/pt/receber` (ou `/en/receive`).
- Logs: `journalctl -u botanora -f`. Reiniciar: `systemctl restart botanora`.
- Faça backup da pasta `data/` (pedidos, métricas e PDFs enviados pelo painel).

## Créditos

Fontes EB Garamond e Jost (SIL Open Font License). QR Code: qrcode-generator (MIT, Kazuhiko Arase).
