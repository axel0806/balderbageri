// Short, customer-facing order number, e.g. "BB-7K3QF9".
// Derived from the Stripe Checkout Session id, so no database is needed and the same session
// always gives the same number (page, sheet and email agree). Files starting with "_" are not routes.

import crypto from 'node:crypto';

// No 0/O/1/I/L, so the number is easy to read out over sms or Instagram.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function orderNumber(sessionId) {
  const hash = crypto.createHash('sha256').update(String(sessionId)).digest();
  let out = '';
  for (let i = 0; i < 6; i++) out += ALPHABET[hash[i] % ALPHABET.length];
  return `BB-${out}`;
}
