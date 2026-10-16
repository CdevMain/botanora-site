'use strict';
// PIX estático (BR Code / EMV) e Mercado Pago Checkout Pro.
const crypto = require('crypto');
const config = require('./config');

// ---------- PIX ----------
function tlv(id, value) { return id + String(value.length).padStart(2, '0') + value; }

function crc16(str) {
  let crc = 0xFFFF;
  for (const byte of Buffer.from(str, 'utf8')) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function clean(s, max) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().slice(0, max).trim();
}

function pixPayload({ amountCents, txid }) {
  if (!config.pix.key) return null;
  const mai = tlv('00', 'br.gov.bcb.pix') + tlv('01', config.pix.key);
  let p = tlv('00', '01') +
    tlv('26', mai) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', (amountCents / 100).toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', clean(config.pix.name, 25) || 'BOTANORA') +
    tlv('60', clean(config.pix.city, 15) || 'BRASIL') +
    tlv('62', tlv('05', txid.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***'));
  p += '6304';
  return p + crc16(p);
}

// ---------- Mercado Pago ----------
async function mpCreatePreference(order, product) {
  const lang = order.lang;
  const base = config.siteUrl;
  const orderUrl = `${base}/${lang}/${lang === 'pt' ? 'pedido' : 'order'}/${order.id}?t=${order.token}`;
  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.mercadoPago.accessToken}`, 'X-Idempotency-Key': order.id },
    body: JSON.stringify({
      items: [{ id: product.slug, title: product.title[lang] || product.title.pt, quantity: 1, currency_id: 'BRL', unit_price: order.amount / 100 }],
      payer: { name: order.name, email: order.email },
      external_reference: order.id,
      back_urls: { success: orderUrl, pending: orderUrl, failure: orderUrl },
      auto_return: 'approved',
      notification_url: `${base}/api/webhooks/mercadopago`,
      statement_descriptor: 'BOTANORA'
    })
  });
  if (!res.ok) throw new Error('Mercado Pago: ' + res.status + ' ' + (await res.text()).slice(0, 300));
  const data = await res.json();
  return data.init_point;
}

async function mpGetPayment(paymentId) {
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${config.mercadoPago.accessToken}` }
  });
  if (!res.ok) throw new Error('Mercado Pago payment ' + res.status);
  return res.json();
}

// Valida x-signature do webhook (quando MP_WEBHOOK_SECRET estiver definido)
function mpVerifySignature(req, dataId) {
  const secret = config.mercadoPago.webhookSecret;
  if (!secret) return true;
  const sig = req.headers['x-signature'] || '';
  const reqId = req.headers['x-request-id'] || '';
  const parts = Object.fromEntries(sig.split(',').map(p => p.split('=').map(s => s.trim())));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${String(dataId).toLowerCase()};request-id:${reqId};ts:${parts.ts};`;
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(parts.v1)); } catch (_) { return false; }
}

module.exports = { pixPayload, crc16, mpCreatePreference, mpGetPayment, mpVerifySignature };
