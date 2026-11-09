// Vercel serverless function: POST /api/stripe-webhook
// Receives checkout.session.completed from Stripe, checks the signature, and forwards the paid order
// to the Google Apps Script (spreadsheet row + email). Set the endpoint in the Stripe dashboard:
// https://balderbageri.sigmaaxel.se/api/stripe-webhook
// Env: STRIPE_WEBHOOK_SECRET (whsec_...), APPS_SCRIPT_URL, APPS_SCRIPT_TOKEN.

import crypto from 'node:crypto';
import { orderNumber } from './_order-number.js';

// The raw body is needed to check the Stripe signature, so Vercel must not parse it.
export const config = { api: { bodyParser: false } };

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

// Stripe-Signature: t=<timestamp>,v1=<hmac>[,v1=<hmac>...]
function verifySignature(raw, header, secret) {
  if (!header || !secret) return false;
  let timestamp = '';
  const signatures = [];
  for (const part of header.split(',')) {
    const [key, value] = part.split('=');
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false; // reject old requests

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.`).update(raw).digest('hex');
  return signatures.some((sig) => {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const raw = await readRaw(req);
  if (!verifySignature(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).send('Ogiltig signatur');
  }

  const event = JSON.parse(raw.toString('utf8'));
  if (event.type !== 'checkout.session.completed') return res.status(200).json({ received: true });

  const s = event.data.object;
  if (s.payment_status !== 'paid') return res.status(200).json({ received: true, skipped: true });

  const shipping = s.collected_information?.shipping_details ?? s.shipping_details ?? {};
  const addr = shipping.address ?? {};

  const order = {
    token: process.env.APPS_SCRIPT_TOKEN,
    orderId: s.id,
    orderNumber: orderNumber(s.id),
    created: new Date(s.created * 1000).toISOString(),
    package: s.metadata?.package ?? '',
    sorts: s.metadata?.sorts ?? '',
    amount: (s.amount_total ?? 0) / 100,
    name: s.customer_details?.name ?? shipping.name ?? '',
    email: s.customer_details?.email ?? '',
    phone: s.customer_details?.phone ?? '',
    street: s.metadata?.street ?? addr.line1 ?? '',
    street2: addr.line2 ?? '',
    postcode: s.metadata?.postcode ?? addr.postal_code ?? '',
    city: s.metadata?.city ?? addr.city ?? '',
    paymentIntent: s.payment_intent ?? '',
  };

  let sheetRes;
  try {
    sheetRes = await fetch(process.env.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
      redirect: 'follow',
    });
  } catch (err) {
    console.error('Apps Script request failed', err && err.message);
    return res.status(500).json({ error: 'retry' }); // Stripe retries the webhook
  }

  const out = await sheetRes.json().catch(() => null);
  if (!sheetRes.ok || !out?.ok) {
    console.error('Apps Script rejected order', s.id, sheetRes.status);
    return res.status(500).json({ error: 'retry' });
  }

  return res.status(200).json({ received: true });
}
