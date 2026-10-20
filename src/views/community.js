'use strict';
// Páginas da comunidade: lista de perguntas, página de cada pergunta e edição pelo link do e-mail.
const config = require('../config');
const { ui, url } = require('../i18n');
const { layout, pageHero, esc } = require('./layout');
const { icon } = require('./svg');
const store = require('../store');
const qa = require('../community');
const team = require('../team');

const T = {
  pt: {
    title: 'Comunidade: perguntas sobre chá | Botânora', desc: 'Pergunte sobre chás, receitas e os guias. Quem comprou e a equipe Botânora respondem.',
    eyebrow: 'Comunidade', h1: 'Perguntas e respostas', lead: 'Pergunte sobre chás, preparo, receitas ou os guias. Respondem leitores que compraram e a equipe da Botânora. Toda pergunta é lida antes de ser publicada.',
    ask: 'Fazer uma pergunta', name: 'Seu nome', email: 'Seu e-mail', emailHint: 'Obrigatório e nunca aparece no site. Usamos só para avisar quando a pergunta for publicada e quando chegar resposta.',
    guide: 'Sobre qual guia? (opcional)', general: 'Assunto geral', text: 'Sua pergunta', textHint: 'Entre 15 e 800 caracteres.', send: 'Enviar para aprovação',
    sent: 'Recebemos! Sua pergunta passa por aprovação e você recebe um e-mail quando ela for publicada.',
    err: { name: 'Informe seu nome (pelo menos 2 letras).', email: 'Confira o e-mail.', text: 'Escreva a pergunta com pelo menos 15 caracteres.', dup: 'Você já enviou essa pergunta.', rate: 'Muitas perguntas seguidas. Tente mais tarde.', generic: 'Não deu certo. Tente de novo.', expired: 'Este link de edição expirou. Envie a pergunta de novo.' },
    filterAll: 'Todos os assuntos', recent: 'Recentes', top: 'Mais votadas', empty: 'Ainda não há perguntas publicadas aqui. Que tal fazer a primeira?',
    answers: n => n === 1 ? '1 resposta' : `${n} respostas`, noAnswer: 'Aguardando resposta', byTeam: 'Respondida pela Botânora',
    want: 'Também quero saber', helpful: 'Útil', asked: 'Perguntado por', on: 'em',
    team: 'Equipe Botânora', buyer: 'Comprou um guia', edited: 'editada',
    answerTitle: 'Responder', answerAs: 'Nome que aparece', answerText: 'Sua resposta', answerHint: 'Conte o que funcionou para você. Entre 10 e 2.000 caracteres. A resposta passa por aprovação.',
    answerSend: 'Enviar resposta', answerSent: 'Obrigado! Sua resposta passa por aprovação e você recebe um e-mail quando for publicada.',
    answerLogin: 'Comprou um guia? Entre em Meus guias neste aparelho para responder como leitor verificado.', answerLoginCta: 'Entrar em Meus guias',
    answerErr: { text: 'Escreva a resposta com pelo menos 10 caracteres.', name: 'Informe um nome com pelo menos 2 letras.', not_buyer: 'Só quem comprou um guia pode responder.', already: 'Você já respondeu esta pergunta.', login: 'Sua sessão expirou. Entre de novo em Meus guias.', rate: 'Muitas tentativas. Aguarde alguns minutos.', generic: 'Não deu certo. Tente de novo.' },
    back: 'Todas as perguntas', editH1: 'Editar sua pergunta', editLead: 'Ajuste a pergunta e envie de novo para aprovação.', editSend: 'Reenviar para aprovação', editExpired: 'Este link de edição expirou ou já foi usado.',
    rules: 'Regras simples: sem links, propaganda ou dados pessoais. Conteúdo educativo, não substitui orientação médica.',
    productQs: 'Perguntas sobre este guia', productAsk: 'Perguntar sobre este guia', seeAll: 'Ver todas'
  },
  en: {
    title: 'Community: tea questions | Botânora', desc: 'Ask about teas, recipes and the guides. Buyers and the Botânora team answer.',
    eyebrow: 'Community', h1: 'Questions and answers', lead: 'Ask about teas, brewing, recipes or the guides. Readers who bought a guide and the Botânora team answer. Every question is read before it is published.',
    ask: 'Ask a question', name: 'Your name', email: 'Your email', emailHint: 'Required and never shown on the site. We only use it to tell you when the question is published and when an answer arrives.',
    guide: 'Which guide is it about? (optional)', general: 'General topic', text: 'Your question', textHint: 'Between 15 and 800 characters.', send: 'Send for approval',
    sent: 'Got it! Your question will be reviewed, and we will email you when it is published.',
    err: { name: 'Enter your name (at least 2 letters).', email: 'Check the email.', text: 'Write a question with at least 15 characters.', dup: 'You already sent this question.', rate: 'Too many questions in a row. Try later.', generic: "That didn't work. Try again.", expired: 'This edit link has expired. Send the question again.' },
    filterAll: 'All topics', recent: 'Recent', top: 'Most voted', empty: 'No published questions here yet. Why not ask the first one?',
    answers: n => n === 1 ? '1 answer' : `${n} answers`, noAnswer: 'Waiting for an answer', byTeam: 'Answered by Botânora',
    want: 'I want to know too', helpful: 'Helpful', asked: 'Asked by', on: 'on',
    team: 'Botânora team', buyer: 'Bought a guide', edited: 'edited',
    answerTitle: 'Answer', answerAs: 'Display name', answerText: 'Your answer', answerHint: 'Share what worked for you. Between 10 and 2,000 characters. Answers are reviewed before going live.',
    answerSend: 'Send answer', answerSent: 'Thank you! Your answer will be reviewed, and we will email you when it is live.',
    answerLogin: 'Bought a guide? Sign in to My guides on this device to answer as a verified reader.', answerLoginCta: 'Go to My guides',
    answerErr: { text: 'Write an answer with at least 10 characters.', name: 'Enter a name with at least 2 letters.', not_buyer: 'Only people who bought a guide can answer.', already: 'You already answered this question.', login: 'Your session expired. Sign in to My guides again.', rate: 'Too many attempts. Wait a few minutes.', generic: "That didn't work. Try again." },
    back: 'All questions', editH1: 'Edit your question', editLead: 'Adjust your question and send it again for approval.', editSend: 'Resend for approval', editExpired: 'This edit link has expired or was already used.',
    rules: 'Simple rules: no links, ads or personal data. Educational content, not medical advice.',
    productQs: 'Questions about this guide', productAsk: 'Ask about this guide', seeAll: 'See all'
  }
};

const date = (ts, lang) => new Date(ts).toLocaleDateString(ui[lang].locale, { day: 'numeric', month: 'short', year: 'numeric' });
const initials = n => String(n || '?').trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
const pathsFor = (...rest) => ({ pt: url('pt', 'community', ...rest), en: url('en', 'community', ...rest) });
const visibleProducts = () => store.db.products.filter(p => p.status !== 'hidden');

function askForm(lang, product = '') {
  const c = T[lang];
  return `<form class="buy-box stack-form qa-ask" data-qa-ask data-lang="${lang}" data-msg='${esc(JSON.stringify(Object.assign({ sent: c.sent }, c.err)))}' novalidate>
    <h2 class="h3">${icon('question', 'ico')} ${esc(c.ask)}</h2>
    <label for="qa-name">${esc(c.name)}</label><input id="qa-name" name="name" maxlength="40" required autocomplete="name">
    <label for="qa-email">${esc(c.email)}</label><input id="qa-email" name="email" type="email" required autocomplete="email">
    <p class="tiny muted">${esc(c.emailHint)}</p>
    <label for="qa-guide">${esc(c.guide)}</label>
    <span class="select-wrap"><select id="qa-guide" name="product"><option value="">${esc(c.general)}</option>${visibleProducts().map(p => `<option value="${esc(p.slug)}"${p.slug === product ? ' selected' : ''}>${esc(p.title[lang])}</option>`).join('')}</select></span>
    <label for="qa-text">${esc(c.text)}</label><textarea id="qa-text" name="text" rows="5" minlength="15" maxlength="800" required></textarea>
    <p class="tiny muted">${esc(c.textHint)} ${esc(c.rules)}</p>
    <p class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></p>
    <button class="btn btn-dark" type="submit">${esc(c.send)}</button>
    <p class="form-msg" role="status"></p>
  </form>`;
}

function qCard(q, lang) {
  const c = T[lang], ans = qa.approvedAnswers(q), p = q.product && store.getProduct(q.product);
  const hasTeam = ans.some(a => a.by === 'owner');
  return `<article class="qa-card">
    <h3 class="qa-q"><a href="${url(lang, 'community', qa.pathOf(q))}">${esc(q.text.length > 220 ? q.text.slice(0, 220) + '…' : q.text)}</a></h3>
    <p class="qa-meta">${esc(q.name)} · ${esc(date(q.approvedAt || q.createdAt, lang))}${p ? ` · <span class="qa-guide">${icon('book', 'ico-sm')} ${esc(p.title[lang])}</span>` : ''}</p>
    <p class="qa-stats"><span>${icon('chat', 'ico-sm')} ${ans.length ? esc(c.answers(ans.length)) : esc(c.noAnswer)}</span>${hasTeam ? `<span class="qa-team-flag"><img src="/assets/img/icon-192.png" alt="" width="16" height="16"> ${esc(c.byTeam)}</span>` : ''}${q.ups ? `<span>▲ ${q.ups}</span>` : ''}</p>
  </article>`;
}

function index(lang, { product = '', sort = 'recent' } = {}) {
  const c = T[lang];
  const list = qa.publicList({ product, sort }).slice(0, 60);
  const body = `${pageHero({ eyebrow: c.eyebrow, h1: c.h1, lead: c.lead })}
<section class="section band-paper">
  <div class="wrap qa-layout">
    <div class="qa-main">
      <form class="qa-filter" method="get" action="${url(lang, 'community')}">
        <span class="select-wrap"><select name="guia" aria-label="${esc(c.guide)}" data-autosubmit>
          <option value="">${esc(c.filterAll)}</option>${visibleProducts().map(p => `<option value="${esc(p.slug)}"${p.slug === product ? ' selected' : ''}>${esc(p.title[lang])}</option>`).join('')}</select></span>
        <div class="chip-row" role="group">${['recent', 'top'].map(s => `<button class="chip${s === sort ? ' is-active' : ''}" name="ordem" value="${s}" aria-pressed="${s === sort}">${esc(c[s])}</button>`).join('')}</div>
        <noscript><button class="btn btn-ghost btn-sm" type="submit">OK</button></noscript>
      </form>
      ${list.length ? `<div class="qa-list">${list.map(q => qCard(q, lang)).join('')}</div>` : `<p class="empty-state">${esc(c.empty)}</p>`}
    </div>
    <aside class="qa-side">${askForm(lang, product)}</aside>
  </div>
</section>`;
  return layout({ lang, key: 'community', paths: pathsFor(), title: c.title, description: c.desc, body, dark: true });
}

function answerBlock(a, lang) {
  const c = T[lang], o = team.owner();
  const who = a.by === 'owner'
    ? `<span class="qa-avatar qa-avatar-team">${o.photo ? `<img src="/media/${esc(o.photo)}" alt="" width="48" height="48">` : `<span>${esc(initials(o.name))}</span>`}<img class="qa-badge" src="/assets/img/icon-192.png" alt="Botânora" width="20" height="20"></span>
       <span class="qa-who"><strong>${esc(o.name)}</strong><span class="qa-role">${esc((o.role && o.role[lang]) || c.team)} · ${esc(c.team)}</span></span>`
    : `<span class="qa-avatar"><span>${esc(initials(a.name))}</span></span>
       <span class="qa-who"><strong>${esc(a.name)}</strong><span class="qa-role qa-buyer">${icon('check', 'ico-sm')} ${esc(c.buyer)}</span></span>`;
  return `<article class="qa-answer${a.by === 'owner' ? ' is-team' : ''}" id="a-${a.id}">
    <header class="qa-answer-head">${who}<span class="qa-date">${esc(date(a.approvedAt || a.createdAt, lang))}</span></header>
    <p class="qa-text">${esc(a.text)}</p>
    <button type="button" class="review-up" data-qa-up="${a.id}" aria-pressed="false"><span aria-hidden="true">▲</span> ${esc(c.helpful)} <span class="review-up-n">${a.ups || 0}</span></button>
  </article>`;
}

function questionPage(lang, q, sessionEmail) {
  const c = T[lang], ans = qa.approvedAnswers(q), p = q.product && store.getProduct(q.product);
  const buyer = sessionEmail && store.paidOrdersFor(sessionEmail).length;
  const order = buyer ? store.paidOrdersFor(sessionEmail)[0] : null;
  const suggest = order && order.name ? (() => { const n = order.name.trim().split(/\s+/); return n.length > 1 ? `${n[0]} ${n[n.length - 1][0]}.` : n[0]; })() : '';
  const already = buyer && q.answers.some(a => a.by === 'buyer' && a.email === sessionEmail && a.status !== 'rejected');
  const firstLine = q.text.split('\n')[0];
  const body = `${pageHero({ eyebrow: c.eyebrow, h1: firstLine.length > 120 ? firstLine.slice(0, 117) + '…' : firstLine, lead: '', art: false })}
<nav class="crumbs wrap" aria-label="breadcrumb"><ol><li><a href="${url(lang, 'community')}">${esc(c.h1)}</a></li><li aria-current="page">${esc(firstLine.slice(0, 50))}</li></ol></nav>
<section class="section band-paper">
  <div class="wrap narrow">
    <article class="qa-question" id="q-${q.id}">
      ${q.text.includes('\n') || firstLine.length > 120 ? `<p class="qa-text qa-text-lg">${esc(q.text)}</p>` : ''}
      <p class="qa-meta">${esc(c.asked)} <strong>${esc(q.name)}</strong> ${esc(c.on)} ${esc(date(q.approvedAt || q.createdAt, lang))}${p ? ` · <a class="qa-guide" href="${url(lang, 'shop', p.slug)}">${icon('book', 'ico-sm')} ${esc(p.title[lang])}</a>` : ''}</p>
      <button type="button" class="review-up" data-qa-up="" data-qa-q="${q.id}" aria-pressed="false"><span aria-hidden="true">▲</span> ${esc(c.want)} <span class="review-up-n">${q.ups || 0}</span></button>
    </article>
    <h2 class="h3 qa-answers-title">${icon('chat', 'ico')} ${ans.length ? esc(c.answers(ans.length)) : esc(c.noAnswer)}</h2>
    <div class="qa-answers" data-qa="${q.id}">${ans.map(a => answerBlock(a, lang)).join('')}</div>
    <div class="qa-reply">
      ${buyer && !already ? `<form class="stack-form" data-qa-answer="${q.id}" data-msg='${esc(JSON.stringify(Object.assign({ sent: c.answerSent }, c.answerErr)))}' novalidate>
        <h2 class="h4">${icon('edit', 'ico-sm')} ${esc(c.answerTitle)}</h2>
        <label for="ans-name">${esc(c.answerAs)}</label><input id="ans-name" name="name" maxlength="40" value="${esc(suggest)}" required>
        <label for="ans-text">${esc(c.answerText)}</label><textarea id="ans-text" name="text" rows="5" minlength="10" maxlength="2000" required></textarea>
        <p class="tiny muted">${esc(c.answerHint)}</p>
        <button class="btn btn-dark" type="submit">${esc(c.answerSend)}</button>
        <p class="form-msg" role="status"></p>
      </form>` : already ? '' : `<p class="qa-login muted">${icon('lock', 'ico-sm')} ${esc(c.answerLogin)} <a class="link-arrow" href="${url(lang, 'library')}">${esc(c.answerLoginCta)} ${icon('arrow', 'ico-sm')}</a></p>`}
    </div>
    <p class="qa-back"><a class="link-arrow" href="${url(lang, 'community')}">← ${esc(c.back)}</a></p>
  </div>
</section>`;
  const qaLd = { '@context': 'https://schema.org', '@type': 'QAPage', mainEntity: { '@type': 'Question', name: firstLine.slice(0, 200), text: q.text, answerCount: ans.length, datePublished: new Date(q.approvedAt || q.createdAt).toISOString(), author: { '@type': 'Person', name: q.name },
    ...(ans.length ? { suggestedAnswer: ans.map(a => ({ '@type': 'Answer', text: a.text, upvoteCount: a.ups || 0, datePublished: new Date(a.approvedAt || a.createdAt).toISOString(), author: a.by === 'owner' ? { '@type': 'Organization', name: 'Botânora' } : { '@type': 'Person', name: a.name }, url: config.siteUrl + url(lang, 'community', qa.pathOf(q)) + '#a-' + a.id })) } : {}) } };
  return layout({ lang, key: 'community', paths: pathsFor(qa.pathOf(q)), title: `${firstLine.slice(0, 70)} | Botânora`, description: q.text.slice(0, 155), body, dark: true, jsonLd: qaLd, noindex: !ans.length });
}

function editPage(lang, token, q) {
  const c = T[lang];
  const body = `${pageHero({ eyebrow: c.eyebrow, h1: c.editH1, lead: q ? c.editLead : c.editExpired, art: false })}
<section class="section band-paper"><div class="wrap narrow">
  ${q ? `<form class="buy-box stack-form" data-qa-edit data-t="${esc(token)}" data-back="${url(lang, 'community')}" data-msg='${esc(JSON.stringify(Object.assign({ sent: c.sent }, c.err)))}' novalidate>
    ${q.rejectReason ? `<p class="notice">${esc(q.rejectReason)}</p>` : ''}
    <label for="qe-name">${esc(c.name)}</label><input id="qe-name" name="name" maxlength="40" value="${esc(q.name)}" required>
    <label for="qe-text">${esc(c.text)}</label><textarea id="qe-text" name="text" rows="6" minlength="15" maxlength="800" required>${esc(q.text)}</textarea>
    <p class="tiny muted">${esc(c.textHint)} ${esc(c.rules)}</p>
    <button class="btn btn-dark" type="submit">${esc(c.editSend)}</button>
    <p class="form-msg" role="status"></p>
  </form>` : `<p><a class="btn btn-dark" href="${url(lang, 'community')}">${esc(c.ask)}</a></p>`}
</div></section>`;
  return layout({ lang, key: 'community', paths: pathsFor(), title: c.editH1 + ' | Botânora', description: c.editLead, body, dark: true, noindex: true });
}

// Bloco na página do guia: até 3 perguntas publicadas sobre ele
function productBlock(lang, p) {
  const c = T[lang], list = qa.publicList({ product: p.slug, sort: 'top' }).slice(0, 3);
  return `<div class="qa-product">
    <h2 class="h3">${icon('chat', 'ico')} ${esc(c.productQs)}</h2>
    ${list.length ? `<div class="qa-list">${list.map(q => qCard(q, lang)).join('')}</div>` : ''}
    <p class="qa-product-links"><a class="btn btn-ghost btn-sm" href="${url(lang, 'community')}?guia=${esc(p.slug)}#qa-name">${icon('question', 'ico-sm')} ${esc(c.productAsk)}</a>${list.length ? ` <a class="link-arrow" href="${url(lang, 'community')}?guia=${esc(p.slug)}">${esc(c.seeAll)} ${icon('arrow', 'ico-sm')}</a>` : ''}</p>
  </div>`;
}

module.exports = { index, questionPage, editPage, productBlock, T };
