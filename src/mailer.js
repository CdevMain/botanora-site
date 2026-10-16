'use strict';
// Envio de e-mail transacional pela API HTTP da Resend (https://resend.com).
// Sem RESEND_API_KEY o envio fica desligado e o site usa o código do pedido.
const config = require('./config');

const enabled = () => !!(config.mail.resendKey && config.mail.from);

const T = {
  pt: {
    subject: 'Seus guias Botanora estão prontos',
    hello: n => `Olá${n ? ', ' + n.split(' ')[0] : ''}!`,
    body: 'Obrigado pela compra. Seus guias em PDF estão na sua biblioteca Botanora. Lá você escolhe o guia e o idioma (português ou inglês) e faz o download.',
    cta: 'Abrir minha biblioteca',
    list: 'Seus guias',
    keep: 'Guarde este e-mail: o link vale por 1 ano. Se ele expirar, peça um novo em',
    foot: 'Botanora · Chás e botânicos'
  },
  en: {
    subject: 'Your Botanora guides are ready',
    hello: n => `Hi${n ? ' ' + n.split(' ')[0] : ''}!`,
    body: 'Thank you for your purchase. Your PDF guides are waiting in your Botanora library. Pick a guide and a language (English or Portuguese) and download it.',
    cta: 'Open my library',
    list: 'Your guides',
    keep: 'Keep this email: the link is valid for 1 year. If it expires, request a new one at',
    foot: 'Botanora · Tea and botanicals'
  }
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function accessEmail({ lang, name, link, receiveUrl, titles }) {
  const t = T[lang] || T.pt;
  const html = `<!doctype html><html><body style="margin:0;background:#f4efe4;font-family:Georgia,'Times New Roman',serif;color:#16212a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe4;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#111a21;color:#f4efe4">
<tr><td style="padding:36px 40px 8px;text-align:center"><img src="${config.siteUrl}/assets/img/icon-192.png" width="56" height="56" alt="Botanora" style="border:0"><p style="font-family:Arial,sans-serif;letter-spacing:6px;font-size:13px;color:#d6b44c;margin:14px 0 0">BOTANORA</p></td></tr>
<tr><td style="padding:24px 40px 8px"><h1 style="font-weight:normal;font-size:28px;margin:0 0 14px">${esc(t.hello(name))}</h1>
<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#d9d3c6;margin:0 0 22px">${esc(t.body)}</p>
${titles.length ? `<p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;color:#d6b44c;margin:0 0 8px">${esc(t.list.toUpperCase())}</p><ul style="margin:0 0 26px;padding-left:18px;font-size:18px">${titles.map(x => `<li style="margin:4px 0">${esc(x)}</li>`).join('')}</ul>` : ''}
<p style="text-align:center;margin:0 0 30px"><a href="${esc(link)}" style="display:inline-block;background:#d6b44c;color:#111a21;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:3px;padding:16px 28px">${esc(t.cta.toUpperCase())}</a></p>
<p style="font-family:Arial,sans-serif;font-size:12.5px;line-height:1.6;color:#9aa3a9;margin:0 0 30px">${esc(t.keep)} <a href="${esc(receiveUrl)}" style="color:#d6b44c">${esc(receiveUrl.replace(/^https?:\/\//, ''))}</a></p></td></tr>
<tr><td style="padding:18px 40px;border-top:1px solid #2a3640;font-family:Arial,sans-serif;font-size:12px;color:#6f7a82;text-align:center">${esc(t.foot)}</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${t.hello(name)}\n\n${t.body}\n\n${titles.map(x => '- ' + x).join('\n')}\n\n${t.cta}: ${link}\n\n${t.keep} ${receiveUrl}`;
  return { subject: t.subject, html, text };
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

module.exports = { enabled, send, accessEmail };
