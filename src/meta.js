'use strict';
// Meta Ads (Marketing API) + Conversions API.
//
// Configuração no .env (nunca no git):
//   META_ACCESS_TOKEN   token de usuário do sistema (Business Manager) com ads_read e ads_management
//   META_AD_ACCOUNT_ID  conta de anúncios (só os números, sem "act_")
//   META_APP_SECRET     opcional: assina as chamadas (appsecret_proof)
//   META_API_VERSION    opcional (padrão v25.0)
//   META_PIXEL_ID       opcional: Pixel no site (só com consentimento) e Conversions API
//   META_CAPI_TOKEN     opcional: token da Conversions API (se vazio, usa META_ACCESS_TOKEN)
//   META_TEST_EVENT_CODE opcional: manda os eventos da CAPI para "Testar eventos"
//
// Nada aqui inventa números: sem token, o painel mostra "não conectado".
const crypto = require('crypto');
const env = process.env;

const cfg = () => ({
  token: env.META_ACCESS_TOKEN || '',
  account: String(env.META_AD_ACCOUNT_ID || '').replace(/^act_/, ''),
  secret: env.META_APP_SECRET || '',
  version: env.META_API_VERSION || 'v25.0',
  pixel: env.META_PIXEL_ID || '',
  capiToken: env.META_CAPI_TOKEN || env.META_ACCESS_TOKEN || '',
  testCode: env.META_TEST_EVENT_CODE || '',
  base: env.META_GRAPH_URL || 'https://graph.facebook.com' // META_GRAPH_URL só para testes locais
});
const connected = () => { const c = cfg(); return !!(c.token && c.account); };

function proof(token) { const c = cfg(); return c.secret ? crypto.createHmac('sha256', c.secret).update(token).digest('hex') : ''; }

async function graph(pathPart, { method = 'GET', params = {}, token } = {}) {
  const c = cfg();
  const tk = token || c.token;
  const u = new URL(`${c.base}/${c.version}/${pathPart}`);
  const body = new URLSearchParams();
  const all = Object.assign({}, params, { access_token: tk }, proof(tk) ? { appsecret_proof: proof(tk) } : {});
  for (const [k, v] of Object.entries(all)) (method === 'GET' ? u.searchParams : body).set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 15000);
  try {
    const res = await fetch(u, { method, signal: ctl.signal, headers: method === 'GET' ? {} : { 'Content-Type': 'application/x-www-form-urlencoded' }, body: method === 'GET' ? undefined : body });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.error) {
      const e = j.error || {};
      throw Object.assign(new Error(e.error_user_msg || e.message || 'HTTP ' + res.status), { code: e.code, status: res.status });
    }
    return j;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('A Meta demorou demais para responder');
    throw e;
  } finally { clearTimeout(timer); }
}

// Página por página (até 5 páginas de 100)
async function all(pathPart, params) {
  let out = [], after = '';
  for (let i = 0; i < 5; i++) {
    const j = await graph(pathPart, { params: Object.assign({ limit: 100 }, params, after ? { after } : {}) });
    out = out.concat(j.data || []);
    after = j.paging && j.paging.cursors && j.paging.next ? j.paging.cursors.after : '';
    if (!after) break;
  }
  return out;
}

const PRESETS = { 1: 'today', 7: 'last_7d', 30: 'last_30d', 90: 'last_90d', 365: 'last_year' };
const actionCount = (list, types) => (list || []).filter(a => types.includes(a.action_type)).reduce((s, a) => s + Number(a.value || 0), 0);
const PURCHASE = ['purchase', 'offsite_conversion.fb_pixel_purchase', 'omni_purchase'];
const LINK = ['link_click'];

// Cache curto para não estourar o limite da API a cada atualização do painel
const cache = new Map();
async function cached(key, ms, fn) {
  const c = cache.get(key);
  if (c && c.t > Date.now() - ms) return c.v;
  const v = await fn(); cache.set(key, { t: Date.now(), v }); return v;
}
const clearCache = () => cache.clear();

async function account() {
  const c = cfg();
  return cached('acct', 3600e3, () => graph(`act_${c.account}`, { params: { fields: 'name,currency,account_status,timezone_name,amount_spent' } }));
}

// Campanhas + métricas do período
async function campaigns(days = 30) {
  const c = cfg();
  const preset = PRESETS[days] || 'last_30d';
  return cached('camp' + preset, 10 * 60e3, async () => {
    const [acct, list, ins] = await Promise.all([
      account(),
      all(`act_${c.account}/campaigns`, { fields: 'id,name,status,effective_status,objective,daily_budget,lifetime_budget,start_time,stop_time' }),
      all(`act_${c.account}/insights`, { level: 'campaign', date_preset: preset, fields: 'campaign_id,spend,impressions,reach,clicks,inline_link_clicks,ctr,cpc,cpm,actions,action_values' })
    ]);
    const byId = new Map(ins.map(x => [x.campaign_id, x]));
    const rows = list.map(cp => {
      const m = byId.get(cp.id) || {};
      const spend = Number(m.spend || 0), purchases = actionCount(m.actions, PURCHASE), value = actionCount(m.action_values, PURCHASE);
      return {
        id: cp.id, name: cp.name, status: cp.status, effective: cp.effective_status, objective: cp.objective,
        dailyBudget: cp.daily_budget ? Number(cp.daily_budget) : null, lifetimeBudget: cp.lifetime_budget ? Number(cp.lifetime_budget) : null,
        start: cp.start_time || null, stop: cp.stop_time || null,
        spend, impressions: Number(m.impressions || 0), reach: Number(m.reach || 0), clicks: Number(m.inline_link_clicks || actionCount(m.actions, LINK) || m.clicks || 0),
        ctr: Number(m.ctr || 0), cpc: Number(m.cpc || 0), cpm: Number(m.cpm || 0), purchases, value, roas: spend ? value / spend : 0
      };
    }).sort((a, b) => b.spend - a.spend || String(a.name).localeCompare(b.name));
    const sum = k => rows.reduce((s, r) => s + r[k], 0);
    return { account: { name: acct.name, currency: acct.currency, status: acct.account_status, timezone: acct.timezone_name }, preset, rows,
      totals: { spend: sum('spend'), impressions: sum('impressions'), clicks: sum('clicks'), purchases: sum('purchases'), value: sum('value') }, fetchedAt: Date.now() };
  });
}

// Pausar/ativar e orçamento diário (em centavos da moeda da conta)
async function updateCampaign(id, { status, dailyBudget }) {
  if (!/^\d{5,25}$/.test(String(id))) throw new Error('campanha inválida');
  const params = {};
  if (status) { if (!['ACTIVE', 'PAUSED'].includes(status)) throw new Error('status inválido'); params.status = status; }
  if (dailyBudget !== undefined) { const v = Math.round(Number(dailyBudget)); if (!(v >= 100)) throw new Error('orçamento mínimo de 1,00 por dia'); params.daily_budget = v; }
  if (!Object.keys(params).length) throw new Error('nada para mudar');
  const r = await graph(String(id), { method: 'POST', params });
  clearCache();
  return r;
}

// ---------- Conversions API: compra aprovada (vinda do webhook oficial da Cakto) ----------
const sha = v => v ? crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex') : undefined;
async function sendPurchase({ orderId, email, phone, value, currency = 'BRL', contentIds = [], fbc, fbp, ip, ua, url }) {
  const c = cfg();
  if (!c.pixel || !c.capiToken) return { skipped: true };
  const user_data = { em: [sha(email)], ph: phone ? [sha(String(phone).replace(/\D/g, ''))] : undefined, fbc: fbc || undefined, fbp: fbp || undefined, client_ip_address: ip || undefined, client_user_agent: ua || undefined };
  Object.keys(user_data).forEach(k => user_data[k] === undefined && delete user_data[k]);
  const data = [{ event_name: 'Purchase', event_time: Math.floor(Date.now() / 1000), event_id: 'order-' + orderId, action_source: 'website', event_source_url: url || undefined,
    user_data, custom_data: { currency, value: Math.round(value * 100) / 100, content_ids: contentIds, content_type: 'product' } }];
  const params = { data };
  if (c.testCode) params.test_event_code = c.testCode;
  return graph(`${c.pixel}/events`, { method: 'POST', params, token: c.capiToken });
}

// Link de campanha com UTMs (o site guarda e repassa ao checkout da Cakto)
function utmLink(base, { source = 'meta', medium = 'paid_social', campaign = '', content = '' } = {}) {
  const u = new URL(base);
  const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  u.searchParams.set('utm_source', slug(source) || 'meta');
  u.searchParams.set('utm_medium', slug(medium) || 'paid_social');
  if (campaign) u.searchParams.set('utm_campaign', slug(campaign));
  if (content) u.searchParams.set('utm_content', slug(content));
  return u.toString();
}

module.exports = { cfg, connected, campaigns, updateCampaign, sendPurchase, utmLink, clearCache };
