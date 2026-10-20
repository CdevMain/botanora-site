'use strict';
// Envio de e-mail transacional pela API HTTP da Resend (https://resend.com).
// Sem RESEND_API_KEY o envio fica desligado e o site usa o código do pedido.
const config = require('./config');

const enabled = () => !!(config.mail.resendKey && config.mail.from);

const T = {
  pt: {
    subject: 'Seus guias Botânora estão prontos',
    hello: n => `Olá${n ? ', ' + n.split(' ')[0] : ''}!`,
    body: 'Obrigado pela compra. Seus guias em PDF estão na sua biblioteca Botânora. Lá você escolhe o guia e o idioma (português ou inglês) e faz o download.',
    cta: 'Entrar na minha biblioteca',
    list: 'Seus guias',
    keep: h => `Por segurança, o botão funciona uma vez e vale por ${h >= 48 ? Math.round(h / 24) + ' dias' : h + ' horas'}. Depois de entrar, o aparelho fica conectado. Para outro aparelho ou se o link expirar, peça um novo em`,
    foot: 'Botânora · Chás e botânicos',
    codeSubject: c => `Seu código de acesso Botânora: ${c}`,
    codeIntro: 'Use este código na página Receber meus guias para entrar neste aparelho. Ele vale por 15 minutos.',
    orLink: 'Ou, se estiver neste aparelho, toque no botão:'
  },
  en: {
    subject: 'Your Botânora guides are ready',
    hello: n => `Hi${n ? ' ' + n.split(' ')[0] : ''}!`,
    body: 'Thank you for your purchase. Your PDF guides are waiting in your Botânora library. Pick a guide and a language (English or Portuguese) and download it.',
    cta: 'Sign in to my library',
    list: 'Your guides',
    keep: h => `For your security, the button works once and is valid for ${h >= 48 ? Math.round(h / 24) + ' days' : h + ' hours'}. Once you sign in, that device stays connected. For another device or if the link expires, request a new one at`,
    foot: 'Botânora · Tea and botanicals',
    codeSubject: c => `Your Botânora access code: ${c}`,
    codeIntro: 'Enter this code on the Get my guides page to sign in on that device. It is valid for 15 minutes.',
    orLink: 'Or, if you are on this device, tap the button:'
  }
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function accessEmail({ lang, name, link, receiveUrl, titles, hours = 72, code = '' }) {
  const t = T[lang] || T.pt;
  const keep = t.keep(hours);
  const html = `<!doctype html><html><body style="margin:0;background:#f4efe4;font-family:Georgia,'Times New Roman',serif;color:#16212a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe4;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111a21;color:#f4efe4">
<tr><td style="padding:36px 40px 8px;text-align:center"><img src="${config.siteUrl}/assets/img/icon-192.png" width="56" height="56" alt="Botânora" style="border:0"><p style="font-family:Arial,sans-serif;letter-spacing:6px;font-size:13px;color:#d6b44c;margin:14px 0 0">BOTÂNORA</p></td></tr>
<tr><td style="padding:24px 40px 8px"><h1 style="font-weight:normal;font-size:28px;margin:0 0 14px">${esc(t.hello(name))}</h1>
<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#d9d3c6;margin:0 0 22px">${esc(t.body)}</p>
${titles.length ? `<p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#d6b44c;margin:0 0 8px">${esc(t.list.toUpperCase())}</p><ul style="margin:0 0 26px;padding-left:18px;font-size:18px">${titles.map(x => `<li style="margin:4px 0">${esc(x)}</li>`).join('')}</ul>` : ''}
${code ? `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#d9d3c6;margin:0 0 14px">${esc(t.codeIntro)}</p>
<p style="text-align:center;margin:0 0 26px"><span style="display:inline-block;font-family:'Courier New',monospace;font-size:34px;letter-spacing:10px;color:#111a21;background:#f4efe4;padding:14px 22px 14px 32px">${esc(code)}</span></p>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#9aa3a9;margin:0 0 12px;text-align:center">${esc(t.orLink)}</p>` : ''}
<p style="text-align:center;margin:0 0 30px"><a href="${esc(link)}" style="display:inline-block;background:#d6b44c;color:#111a21;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:3px;padding:16px 28px">${esc(t.cta.toUpperCase())}</a></p>
<p style="font-family:Arial,sans-serif;font-size:12.5px;line-height:1.6;color:#9aa3a9;margin:0 0 30px">${esc(keep)} <a href="${esc(receiveUrl)}" style="color:#d6b44c">${esc(receiveUrl.replace(/^https?:\/\//, ''))}</a></p></td></tr>
<tr><td style="padding:18px 40px;border-top:1px solid #2a3640;font-family:Arial,sans-serif;font-size:12px;color:#6f7a82;text-align:center">${esc(t.foot)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${t.hello(name)}\n\n${code ? t.codeIntro + '\n\n    ' + code + '\n\n' : ''}${t.body}\n\n${titles.map(x => '- ' + x).join('\n')}\n\n${t.cta}: ${link}\n\n${keep} ${receiveUrl}`;
  return { subject: code ? t.codeSubject(code) : t.subject, html, text };
}

// E-mails da avaliação: aprovada, recusada (com convite para corrigir) e aviso ao admin
const RT = {
  pt: {
    approvedSubject: g => `Sua avaliação de ${g} foi publicada`,
    approvedBody: g => `Obrigado por avaliar o guia ${g}. Sua avaliação já está publicada na página do guia e vai ajudar outras pessoas a escolher.`,
    approvedCta: 'Ver minha avaliação',
    rejectedSubject: g => `Sua avaliação de ${g} precisa de um ajuste`,
    rejectedBody: g => `Lemos sua avaliação do guia ${g}, mas ela não pôde ser publicada como está.`,
    reason: 'Motivo',
    rejectedHow: 'Você pode corrigir e reenviar pela sua biblioteca, no mesmo guia. Essa correção não conta como uma das suas edições.',
    rejectedCta: 'Corrigir minha avaliação',
    yours: 'Sua avaliação'
  },
  en: {
    approvedSubject: g => `Your review of ${g} is live`,
    approvedBody: g => `Thank you for reviewing ${g}. Your review is now live on the guide page and will help others choose.`,
    approvedCta: 'See my review',
    rejectedSubject: g => `Your review of ${g} needs a change`,
    rejectedBody: g => `We read your review of ${g}, but it could not be published as it is.`,
    reason: 'Reason',
    rejectedHow: 'You can fix it and send it again from your library, on the same guide. This fix does not count as one of your edits.',
    rejectedCta: 'Fix my review',
    yours: 'Your review'
  }
};
function shell(lang, inner) {
  const t = T[lang] || T.pt;
  return `<!doctype html><html><body style="margin:0;background:#f4efe4;font-family:Georgia,'Times New Roman',serif;color:#16212a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe4;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111a21;color:#f4efe4">
<tr><td style="padding:36px 40px 8px;text-align:center"><img src="${config.siteUrl}/assets/img/icon-192.png" width="56" height="56" alt="Botânora" style="border:0"><p style="font-family:Arial,sans-serif;letter-spacing:6px;font-size:13px;color:#d6b44c;margin:14px 0 0">BOTÂNORA</p></td></tr>
<tr><td style="padding:24px 40px 30px">${inner}</td></tr>
<tr><td style="padding:18px 40px;border-top:1px solid #2a3640;font-family:Arial,sans-serif;font-size:12px;color:#6f7a82;text-align:center">${esc(t.foot)}</td></tr>
</table></td></tr></table></body></html>`;
}
const P = s => `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#d9d3c6;margin:0 0 18px">${s}</p>`;
const BTN = (href, label) => `<p style="text-align:center;margin:8px 0 6px"><a href="${esc(href)}" style="display:inline-block;background:#d6b44c;color:#111a21;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:3px;padding:16px 28px">${esc(label.toUpperCase())}</a></p>`;
function reviewEmail({ lang, status, name, guide, rating, text, reason, link }) {
  const t = T[lang] || T.pt, r = RT[lang] || RT.pt;
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const quote = `<div style="border-left:2px solid #d6b44c;padding:4px 0 4px 16px;margin:0 0 22px"><p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#d6b44c;margin:0 0 6px">${esc(r.yours.toUpperCase())}</p><p style="color:#d6b44c;margin:0 0 6px;font-size:18px">${stars}</p><p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#d9d3c6;margin:0;white-space:pre-line">${esc(text)}</p></div>`;
  const hello = `<h1 style="font-weight:normal;font-size:28px;margin:0 0 14px">${esc(t.hello(name))}</h1>`;
  if (status === 'approved') {
    const html = shell(lang, hello + P(esc(r.approvedBody(guide))) + quote + BTN(link, r.approvedCta));
    return { subject: r.approvedSubject(guide), html, text: `${t.hello(name)}\n\n${r.approvedBody(guide)}\n\n${stars}\n${text}\n\n${r.approvedCta}: ${link}` };
  }
  const html = shell(lang, hello + P(esc(r.rejectedBody(guide))) + (reason ? P(`<strong style="color:#f4efe4">${esc(r.reason)}:</strong> ${esc(reason)}`) : '') + quote + P(esc(r.rejectedHow)) + BTN(link, r.rejectedCta));
  return { subject: r.rejectedSubject(guide), html, text: `${t.hello(name)}\n\n${r.rejectedBody(guide)}\n${reason ? `\n${r.reason}: ${reason}\n` : ''}\n${stars}\n${text}\n\n${r.rejectedHow}\n\n${r.rejectedCta}: ${link}` };
}
function reviewAdminEmail({ guide, name, email, rating, text, edited, panel }) {
  const html = shell('pt', `<h1 style="font-weight:normal;font-size:24px;margin:0 0 14px">${edited ? 'Avaliação editada' : 'Nova avaliação'} para aprovar</h1>` + P(`${esc(guide)} · ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} · ${esc(name)} (${esc(email)})`) + P(esc(text).replace(/\n/g, '<br>')) + BTN(panel, 'Abrir o painel'));
  return { subject: `${edited ? 'Avaliação editada' : 'Nova avaliação'}: ${guide} (${rating}/5)`, html, text: `${guide} · ${rating}/5 · ${name} (${email})\n\n${text}\n\n${panel}` };
}

async function send({ to, subject, html, text }) {
  if (!enabled()) return { skipped: true };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.mail.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: config.mail.from, to: [to], subject, html, text, reply_to: config.contactEmail })
  });
  if (!res.ok) throw new Error('Resend ' + res.status + ': ' + (await res.text()).slice(0, 200));
  return res.json();
}

module.exports = { enabled, send, accessEmail, reviewEmail, reviewAdminEmail };
