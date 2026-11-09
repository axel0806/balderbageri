// Vercel serverless function: POST /api/create-checkout-session
// Creates a Stripe Checkout Session (embedded, one-time payment) for one cookie bag.
// Returns a client_secret that the page uses to mount the embedded checkout (order.js).
// The price and the sort mix are checked here, on the server. The browser's numbers are never trusted.
// Env: STRIPE_SECRET_KEY (sk_test_... while testing, sk_live_... only after go-live).

const SITE = 'https://balderbageri.sigmaaxel.se';

// Amounts are in öre (79 kr = 7900). Keep in sync with the prices on the page.
const PACKAGES = {
  liten: { count: 6, amountOre: 7900, label: 'Liten påse' },
  stor: { count: 12, amountOre: 14900, label: 'Stor påse' },
};

const SORTS = {
  'chocolate-chip': 'Chocolate chip cookies',
  kolakakor: 'Kolakakor',
  havrekakor: 'Havrekakor',
  hallongrottor: 'Hallongrottor',
  kladdkake: 'Kladdkakecookies',
};

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

function validate(body) {
  const pkgKey = body && typeof body.pkg === 'string' ? body.pkg : '';
  if (!hasOwn(PACKAGES, pkgKey)) return { error: 'Välj en påse.' };
  const pkg = PACKAGES[pkgKey];

  const sorts = body.sorts;
  if (!sorts || typeof sorts !== 'object' || Array.isArray(sorts)) return { error: 'Välj kakor.' };

  const lines = [];
  let total = 0;
  for (const [key, qty] of Object.entries(sorts)) {
    if (!hasOwn(SORTS, key)) return { error: 'Okänd sort.' };
    if (!Number.isInteger(qty) || qty < 0 || qty > pkg.count) return { error: 'Ogiltigt antal.' };
    if (qty > 0) {
      lines.push([key, qty]);
      total += qty;
    }
  }
  if (total !== pkg.count) return { error: `Påsen ska innehålla exakt ${pkg.count} kakor.` };

  return { pkgKey, pkg, lines };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metoden stöds inte.' });
  }

  const checked = validate(req.body);
  if (checked.error) return res.status(400).json({ error: checked.error });
  const { pkgKey, pkg, lines } = checked;

  const breakdown = lines.map(([k, q]) => `${SORTS[k]} ×${q}`).join(', ');
  const sortsMeta = lines.map(([k, q]) => `${SORTS[k]}: ${q}`).join(', ');

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('locale', 'sv');
  params.set('ui_mode', 'form');
  params.set('billing_address_collection', 'auto');
  params.set('submit_type', 'auto');
  params.set('integration_identifier', 'custom_embedded_web_0002');
  params.set('return_url', `${SITE}/tack.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', 'sek');
  params.set('line_items[0][price_data][unit_amount]', String(pkg.amountOre));
  // Swedish consumer prices include moms, so the price is tax-inclusive.
  params.set('line_items[0][price_data][tax_behavior]', 'inclusive');
  params.set('line_items[0][price_data][product_data][name]', pkg.label);
  params.set('line_items[0][price_data][product_data][description]', breakdown);
  params.set('automatic_tax[enabled]', 'false');
  params.set('shipping_address_collection[allowed_countries][0]', 'SE'); // delivery address
  params.set('phone_number_collection[enabled]', 'false');
  params.set('metadata[package]', pkgKey);
  params.set('metadata[sorts]', sortsMeta);
  params.set('metadata[source]', 'hemsida');

  let stripeRes;
  try {
    stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': '2026-03-25.dahlia', // required for ui_mode "form"
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
  } catch (err) {
    console.error('Stripe request failed', err && err.message);
    return res.status(502).json({ error: 'Betalningen kunde inte startas.' });
  }

  const data = await stripeRes.json().catch(() => ({}));
  if (!stripeRes.ok || !data.client_secret) {
    console.error('Stripe error', stripeRes.status, data?.error?.type, data?.error?.code);
    return res.status(502).json({ error: 'Betalningen kunde inte startas.' });
  }

  return res.status(200).json({ client_secret: data.client_secret });
}
