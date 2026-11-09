// Vercel serverless function: GET /api/order-status?session_id=cs_...
// Used by tack.html to show the customer their order number after a paid checkout.
// Env: STRIPE_SECRET_KEY.

import { orderNumber } from './_order-number.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Metoden stöds inte.' });
  }

  const id = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(id)) return res.status(400).json({ error: 'Ogiltigt id.' });

  let stripeRes;
  try {
    stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
  } catch (err) {
    console.error('Stripe request failed', err && err.message);
    return res.status(502).json({ error: 'Kunde inte hämta ordern.' });
  }

  const s = await stripeRes.json().catch(() => ({}));
  if (!stripeRes.ok) return res.status(404).json({ error: 'Ordern hittades inte.' });
  if (s.payment_status !== 'paid') return res.status(402).json({ error: 'Betalningen är inte klar.' });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ orderNumber: orderNumber(s.id) });
}
