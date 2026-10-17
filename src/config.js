'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');

// Carrega .env sem dependências
function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) {
    // Primeiro start: cria .env com senha de admin aleatória
    const pass = crypto.randomBytes(9).toString('base64url');
    const example = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8')
      .replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${pass}`)
      .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${crypto.randomBytes(24).toString('hex')}`);
    fs.writeFileSync(ENV_FILE, example);
    console.log('\n  .env criado. Senha inicial do admin: ' + pass + '\n  (altere ADMIN_PASSWORD no arquivo .env)\n');
  }
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let v = m[2];
    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
loadEnv();

const env = process.env;
const config = {
  root: ROOT,
  port: Number(env.PORT || 3000),
  host: env.HOST || '0.0.0.0',
  siteUrl: (env.SITE_URL || `http://localhost:${env.PORT || 3000}`).replace(/\/$/, ''),
  dataDir: path.resolve(ROOT, env.DATA_DIR || 'data'),
  adminUser: env.ADMIN_USER || 'admin',
  adminPassword: env.ADMIN_PASSWORD || '',
  sessionSecret: env.SESSION_SECRET || crypto.randomBytes(24).toString('hex'),
  contactEmail: env.CONTACT_EMAIL || 'contato@botanora.com.br',
  pix: {
    key: env.PIX_KEY || '',
    name: env.PIX_MERCHANT_NAME || 'BOTANORA',
    city: env.PIX_MERCHANT_CITY || 'GUAIBA'
  },
  mercadoPago: { accessToken: env.MP_ACCESS_TOKEN || '', webhookSecret: env.MP_WEBHOOK_SECRET || '' },
  maxDownloads: Number(env.MAX_DOWNLOADS || 10),
  maxDevices: Number(env.MAX_DEVICES || 5),
  accessDays: Number(env.ACCESS_DAYS || 365),
  cakto: { secret: env.CAKTO_WEBHOOK_SECRET || '' },
  mail: { resendKey: env.RESEND_API_KEY || '', from: env.MAIL_FROM || '' },
  trustProxy: env.TRUST_PROXY === '1',
  // Ferramentas de terceiros: só carregam depois que o visitante aceita os cookies
  gaId: env.GA_ID === undefined ? 'G-VC1F9QT587' : env.GA_ID,
  clarityId: env.CLARITY_ID === undefined ? 'yyqohzc7o5' : env.CLARITY_ID,
  // Busca: verificação do Google Search Console e do Bing Webmaster Tools, e chave do IndexNow
  googleVerification: env.GOOGLE_SITE_VERIFICATION || '',
  bingVerification: env.BING_SITE_VERIFICATION || '',
  indexNowKey: env.INDEXNOW_KEY || require('crypto').createHash('sha256').update('indexnow:' + (env.SESSION_SECRET || 'botanora')).digest('hex').slice(0, 32)
};

module.exports = config;
