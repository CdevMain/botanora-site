'use strict';
const { logo } = require('./svg');

function shell(body, authed) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Painel · Botanora</title>
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/admin.css?v=${V}">
</head>
<body class="${authed ? 'is-app' : 'is-login'}">
${body}
<script src="/assets/js/admin.js?v=${V}" defer></script>
</body>
</html>`;
}
const V = Date.now().toString(36);

function loginPage() {
  return shell(`<main class="login">
  <form class="login-card" id="login-form">
    <div class="login-logo">${logo()}</div>
    <h1>Painel</h1>
    <label for="user">Usuário</label>
    <input id="user" name="user" autocomplete="username" required value="admin">
    <label for="password">Senha</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
    <button type="submit" class="btn">Entrar</button>
    <p class="msg" role="alert"></p>
  </form>
</main>`, false);
}

function appPage() {
  return shell(`<header class="topbar">
  <a class="tb-brand" href="/admin">${logo()}<span class="tb-tag">Painel</span></a>
  <nav class="tabs" role="tablist">
    <button role="tab" data-tab="overview" aria-selected="true">Visão geral</button>
    <button role="tab" data-tab="sales" aria-selected="false">Vendas</button>
    <button role="tab" data-tab="products" aria-selected="false">Produtos</button>
    <button role="tab" data-tab="gear" aria-selected="false">Recomendações</button>
    <button role="tab" data-tab="audience" aria-selected="false">Público</button>
    <button role="tab" data-tab="integrations" aria-selected="false">Integrações</button>
  </nav>
  <div class="tb-actions">
    <a href="/" target="_blank" rel="noopener" class="tb-link">Ver site ↗</a>
    <button id="logout" class="tb-link">Sair</button>
  </div>
</header>
<main class="app">
  <div class="toolbar">
    <div>
      <h1 id="page-title">Visão geral</h1>
      <p class="sub" id="range-label"></p>
    </div>
    <div class="toolbar-right">
      <span class="live" title="Visitantes com atividade nos últimos 5 minutos"><i></i><b id="realtime">0</b> agora no site</span>
      <div class="range" role="group" aria-label="Período">
        <button data-days="1">Hoje</button><button data-days="7">7 dias</button><button data-days="30" class="on">30 dias</button><button data-days="90">90 dias</button><button data-days="365">12 meses</button>
      </div>
    </div>
  </div>

  <section data-panel="overview">
    <div class="kpis" id="kpis"></div>
    <div class="grid-2-1">
      <div class="card">
        <div class="card-head"><h2>Tráfego</h2><div class="legend"><span class="lg lg-a">Visitantes</span><span class="lg lg-b">Visualizações</span></div></div>
        <div class="chart" id="chart-traffic"></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Funil de compra</h2></div>
        <div id="funnel"></div>
      </div>
    </div>
    <div class="grid-3">
      <div class="card"><div class="card-head"><h2>Páginas mais vistas</h2></div><div id="top-pages"></div></div>
      <div class="card"><div class="card-head"><h2>Origem do tráfego</h2></div><div id="referrers"></div></div>
      <div class="card"><div class="card-head"><h2>Dispositivos e idioma</h2></div><div id="devices"></div></div>
    </div>
    <div class="grid-2">
      <div class="card"><div class="card-head"><h2>Engajamento com as ferramentas</h2></div><div id="engagement"></div></div>
      <div class="card"><div class="card-head"><h2>Resultados do quiz</h2></div><div id="quiz"></div></div>
    </div>
  </section>

  <section data-panel="sales" hidden>
    <div class="kpis" id="kpis-sales"></div>
    <div class="card">
      <div class="card-head"><h2>Receita por dia</h2></div>
      <div class="chart" id="chart-revenue"></div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Pedidos</h2>
        <div class="head-actions">
          <span class="select"><select id="order-filter" aria-label="Filtrar pedidos"><option value="">Todos</option><option value="pending">Pendentes</option><option value="paid">Pagos</option><option value="cancelled">Cancelados</option><option value="refunded">Reembolsados</option></select></span>
          <a class="btn-sm" href="/api/admin/export/orders.csv">Exportar CSV</a>
        </div>
      </div>
      <div class="table-wrap"><table class="table" id="orders"></table></div>
    </div>
  </section>

  <section data-panel="products" hidden>
    <div class="card">
      <div class="card-head"><h2>Desempenho por guia</h2><p class="hint">A lista de espera mostra a demanda: use-a para decidir qual PDF produzir primeiro.</p></div>
      <div class="table-wrap"><table class="table" id="product-perf"></table></div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Catálogo</h2><p class="hint">Edite preço e status, envie o PDF em português e/ou inglês e ligue o guia ao produto da Cakto. Um guia só pode ficar "Disponível" depois de ter ao menos um PDF.</p></div>
      <div id="product-editor" class="product-editor"></div>
    </div>
  </section>

  <section data-panel="audience" hidden>
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><h2>Newsletter</h2><a class="btn-sm" href="/api/admin/export/subscribers.csv">Exportar CSV</a></div>
        <div class="table-wrap"><table class="table" id="subscribers"></table></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Listas de espera</h2><a class="btn-sm" href="/api/admin/export/waitlist.csv">Exportar CSV</a></div>
        <div class="table-wrap"><table class="table" id="waitlist"></table></div>
      </div>
    </div>
  </section>
  <section data-panel="gear" hidden>
    <div class="card">
      <div class="card-head"><h2>Adicionar recomendação</h2><p class="hint">Cole o link de afiliado do Mercado Livre (meli.la/…) ou da Amazon (amzn.to/…). O site conta cada clique antes de redirecionar, e os links saem com <code>rel="sponsored"</code>.</p></div>
      <form id="aff-new" class="aff-form"></form>
    </div>
    <div class="card">
      <div class="card-head"><h2>Recomendações no site</h2><p class="hint">Aparecem em Utensílios, na home (as 4 primeiras ativas) e no Preparo (categoria Preparo). Ordem menor aparece primeiro.</p></div>
      <div id="aff-list" class="product-editor"></div>
    </div>
  </section>
  <section data-panel="integrations" hidden><div id="integrations"></div></section>
  <p class="foot-note">Métricas coletadas pelo próprio servidor, sem cookies e sem serviços de terceiros. Visitantes são contados por dia com identificador anônimo (o IP não é armazenado).</p>
</main>
<div class="toast" id="toast" role="status"></div>`, true);
}

module.exports = { page: authed => authed ? appPage() : loginPage() };
