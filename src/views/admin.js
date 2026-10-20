'use strict';
const { logo, icon } = require('./svg');

function shell(body, authed) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Painel · Botânora</title>
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

// Áreas do painel (barra lateral). Cada aba tem uma permissão; o JS esconde o que o usuário não pode ver.
const AREAS = [
  ['overview', 'grid', 'Visão geral', 'Vendas, acessos, conversão, alertas e tarefas pendentes.', [['overview', 'Painel', 'stats']]],
  ['catalog', 'book', 'Catálogo e biblioteca', 'eBooks, PDFs, recomendações, arquivos e produtos da Cakto.', [['products', 'Guias e PDFs', 'catalog'], ['gear', 'Recomendações', 'catalog']]],
  ['marketing', 'megaphone', 'Marketing e campanhas', 'Meta Ads, links de campanha e origem das vendas.', [['campaigns', 'Campanhas', 'campaigns']]],
  ['daily', 'cup', 'Conteúdo diário', 'Chá da manhã, tarde e noite, banco de receitas e agendamento.', [['daily', 'Chá do dia', 'content'], ['recipes', 'Banco de receitas', 'content']]],
  ['community', 'chat', 'Comunidade e avaliações', 'Perguntas pendentes, respostas, avaliações e compradores verificados.', [['questions', 'Perguntas', 'community'], ['reviews', 'Avaliações', 'community']]],
  ['clients', 'users', 'Clientes e relatórios', 'Pedidos, downloads, inscritos e indicadores comerciais.', [['sales', 'Pedidos e vendas', 'sales'], ['audience', 'Inscritos', 'sales']]],
  ['settings', 'gear', 'Configurações e segurança', 'Integrações, permissões, identidade do proprietário, histórico e backups.', [['integrations', 'Integrações', 'settings'], ['team', 'Usuários e permissões', 'users'], ['security', 'Segurança e backups', 'backups'], ['history', 'Histórico', 'backups'], ['owner', 'Perfil do dono', 'settings']]]
];

function appPage() {
  return shell(`<header class="topbar">
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="sidenav" aria-label="Menu">${icon('grid', 'ico')}</button>
  <a class="tb-brand" href="/admin">${logo()}<span class="tb-tag">Painel</span></a>
  <div class="tb-actions">
    <span class="tb-user" id="tb-user"></span>
    <a href="/" target="_blank" rel="noopener" class="tb-link">Ver site ↗</a>
    <button id="logout" class="tb-link">Sair</button>
  </div>
</header>
<div class="layout">
<aside class="sidenav" id="sidenav" aria-label="Áreas do painel">
  <button type="button" class="nav-collapse" aria-pressed="false" title="Recolher menu">${icon('arrow', 'ico')}<span>Recolher menu</span></button>
  <nav>${AREAS.map(([id, ic, title, desc, tabs]) => `<div class="area" data-area="${id}">
    <button type="button" class="area-head" data-tab="${tabs[0][0]}" data-perm="${tabs[0][2]}" title="${title}" aria-label="${title}">${icon(ic, 'area-ico')}<span><b>${title}</b><small>${desc}</small></span><span class="area-count" data-count="${id}" hidden></span></button>
    ${tabs.length > 1 ? `<div class="area-tabs"><p class="area-fly-title">${title}</p>${tabs.map(([t, label, perm]) => `<button type="button" data-tab="${t}" data-perm="${perm}" role="tab" aria-selected="false">${label}<span class="tab-count" data-count-tab="${t}" hidden></span></button>`).join('')}</div>` : ''}
  </div>`).join('')}</nav>
</aside>
<main class="app">
  <div class="toolbar">
    <div>
      <h1 id="page-title">Visão geral</h1>
      <p class="sub" id="range-label"></p>
    </div>
    <div class="toolbar-right">
      <span class="live" title="Visitantes com atividade nos últimos 5 minutos"><i></i><b id="realtime">0</b> agora no site</span>
      <span class="live-sync" id="live-sync" title="O painel atualiza sozinho quando chega uma visita, venda ou inscrição">Ao vivo</span>
      <div class="range" role="group" aria-label="Período">
        <button data-days="1">Hoje</button><button data-days="7">7 dias</button><button data-days="30" class="on">30 dias</button><button data-days="90">90 dias</button><button data-days="365">12 meses</button>
      </div>
    </div>
  </div>

  <section data-panel="overview">
    <div class="card tasks-card" id="tasks" hidden></div>
    <div class="panel-actions">
      <button class="btn-sm" type="button" data-report="geral">Gerar relatório do período</button>
      <button class="btn-sm danger" type="button" data-clear="overview">Limpar últimos 30 dias</button>
    </div>
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
    <div class="card">
      <div class="card-head"><h2>Relatórios salvos</h2><p class="hint">Cada relatório é uma página pronta para imprimir ou salvar em PDF. Os criados antes de limpar ficam marcados.</p></div>
      <div class="table-wrap"><table class="table" data-report-list></table></div>
    </div>
  </section>

  <section data-panel="sales" hidden>
    <div class="panel-actions">
      <button class="btn-sm" type="button" data-report="vendas">Gerar relatório do período</button>
      <button class="btn-sm danger" type="button" data-clear="sales">Limpar últimos 30 dias</button>
    </div>
    <div class="kpis" id="kpis-sales"></div>
    <div class="card">
      <div class="card-head"><h2>Receita por dia</h2></div>
      <div class="chart" id="chart-revenue"></div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Simular compra (teste)</h2><span class="pill pill-pending">Não entra nos números</span></div>
      <p class="hint">Libera guias para um e-mail como se ele tivesse acabado de comprar na Cakto. Serve para testar a página Receber meus guias, o código por e-mail, a biblioteca e o download. A compra aparece na lista com a etiqueta Teste e fica fora da receita e das vendas.</p>
      <form id="test-buy" class="aff-form"></form>
    </div>
    <div class="card">
      <div class="card-head"><h2>Pedidos</h2>
        <div class="head-actions">
          <span class="select"><select id="order-filter" aria-label="Filtrar pedidos"><option value="">Todos</option><option value="pending">Pendentes</option><option value="paid">Pagos</option><option value="cancelled">Cancelados</option><option value="refunded">Reembolsados</option><option value="archived">Arquivados</option></select></span>
          <a class="btn-sm" href="/api/admin/export/orders.csv">Exportar CSV</a>
          <button class="btn-sm" id="clear-tests" type="button" hidden>Apagar compras de teste</button>
        </div>
      </div>
      <div class="table-wrap"><table class="table" id="orders"></table></div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Relatórios salvos</h2><p class="hint">Cada relatório é uma página pronta para imprimir ou salvar em PDF. Os criados antes de limpar ficam marcados.</p></div>
      <div class="table-wrap"><table class="table" data-report-list></table></div>
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
  <section data-panel="reviews" hidden>
    <div class="card">
      <div class="card-head"><h2>Avaliações dos clientes</h2>
        <span class="select"><select id="review-filter" aria-label="Filtrar avaliações"><option value="pending">Em análise</option><option value="approved">Publicadas</option><option value="rejected">Recusadas</option><option value="">Todas</option></select></span>
        <p class="hint">Só quem comprou consegue avaliar, pela biblioteca. Nada aparece no site antes de você aprovar. Cada avaliação pode ser editada 2 vezes depois de enviada (cada edição volta para análise); corrigir uma recusada não gasta edição. Aprovar ou recusar envia um e-mail ao cliente.</p>
      </div>
      <div id="review-list" class="review-admin"></div>
    </div>
  </section>
  <section data-panel="integrations" hidden><div id="integrations"></div></section>
  <section data-panel="campaigns" hidden><div id="campaigns"></div></section>
  <section data-panel="daily" hidden><div id="daily"></div></section>
  <section data-panel="recipes" hidden><div id="recipes"></div></section>
  <section data-panel="questions" hidden>
    <div class="card">
      <div class="card-head"><h2>Perguntas da comunidade</h2>
        <span class="select"><select id="q-filter" aria-label="Filtrar perguntas"><option value="pending">Para moderar</option><option value="unanswered">Publicadas sem resposta</option><option value="approved">Publicadas</option><option value="rejected">Recusadas</option><option value="">Todas</option></select></span>
        <p class="hint">Perguntas e respostas de compradores só aparecem no site depois de aprovadas. Respostas da Botânora são publicadas na hora, com a foto e o selo do perfil do dono. Cada aprovação, recusa ou resposta envia um e-mail para quem perguntou.</p>
      </div>
      <div id="q-list" class="review-admin"></div>
    </div>
  </section>
  <section data-panel="team" hidden><div id="team"></div></section>
  <section data-panel="security" hidden><div id="security"></div></section>
  <section data-panel="history" hidden><div id="history"></div></section>
  <section data-panel="owner" hidden><div id="owner"></div></section>
  <p class="foot-note">Métricas coletadas pelo próprio servidor, sem cookies e sem serviços de terceiros. Visitantes são contados por dia com identificador anônimo (o IP não é armazenado).</p>
</main>
</div>
<dialog class="clear-dlg" id="clear-dlg">
  <form method="dialog" id="clear-form">
    <h2>Limpar últimos 30 dias</h2>
    <p class="hint">Antes de limpar, o painel salva automaticamente um <b>relatório completo</b> dos últimos 30 dias em Relatórios salvos.</p>
    <label class="toggle"><input type="checkbox" name="events"> <span><b>Visitas e eventos</b><br><small>Tráfego, funil, origem, dispositivos, quiz, timers e cliques. Esses dados são apagados.</small></span></label>
    <label class="toggle"><input type="checkbox" name="sales"> <span><b>Vendas</b><br><small>Os pedidos saem dos números e da lista (ficam em Arquivados). Os clientes <b>continuam</b> com acesso aos guias.</small></span></label>
    <label class="clear-confirm"><span>Para confirmar, digite <b>LIMPAR</b></span><input name="confirm" autocomplete="off" placeholder="LIMPAR"></label>
    <div class="clear-actions"><button class="btn-sm" type="button" data-close>Cancelar</button><button class="btn-sm danger-solid" type="submit" value="ok">Salvar relatório e limpar</button></div>
  </form>
</dialog>
<div class="toast" id="toast" role="status"></div>`, true);
}

module.exports = { page: authed => authed ? appPage() : loginPage() };
