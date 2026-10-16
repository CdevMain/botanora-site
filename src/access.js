'use strict';
// Link de acesso à biblioteca do cliente: e-mail + validade assinados com HMAC.
// Não exige login nem senha; quem tem o link vê os guias comprados naquele e-mail.
const crypto = require('crypto');
const config = require('./config');

const b64 = s => Buffer.from(s).toString('base64url');
const unb64 = s => Buffer.from(s, 'base64url').toString('utf8');
const sig = data => crypto.createHmac('sha256', config.sessionSecret).update('library|' + data).digest('base64url').slice(0, 32);

function signAccess(email, days = config.accessDays) {
  const exp = Math.floor(Date.now() / 1000) + days * 86400;
  const data = b64(String(email).toLowerCase() + '|' + exp);
  return data + '.' + sig(data);
}

function verifyAccess(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [data, s] = token.split('.');
  const expected = sig(data);
  if (!s || s.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
  const [email, exp] = unb64(data).split('|');
  if (!email || Number(exp) * 1000 < Date.now()) return null;
  return { email, exp: Number(exp) };
}

module.exports = { signAccess, verifyAccess };
