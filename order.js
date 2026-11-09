// Beställningsformulär: välj påse, välj kakor och betala i en inbäddad Stripe Checkout.
// Serversidan kontrollerar pris och antal igen (api/create-checkout-session.js).
(() => {
  // Publik nyckel (pk_...). Den är inte hemlig, men den hör till kontot.
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51UZp3RBAuGLWdkFjLKyXpkMWf7Y2CrvDGMEiSisG9AwRpGWFzgx4XJ6C7pDzCxQhP0ZiN2CZiyBLApVJqr5ZPvq900DiEN9CUU';
  const SIZES = { liten: 6, stor: 12 };
  const APPEARANCE = {
    theme: 'stripe',
    labels: 'auto',
    inputs: 'spaced',
    variables: {
      borderRadius: '12px',
      colorBackground: '#ffffff',
      colorDanger: '#b3261e',
      colorPrimary: '#522834', // wine
      colorSuccess: '#2e7d32',
      colorText: '#2A1A1D', // ink
      fontFamily: 'default',
      fontSizeBase: '16px',
      spacingUnit: '4px',
    },
  };

  const form = document.getElementById('orderForm');
  if (!form) return;

  const stepsEl = document.getElementById('orderSteps');
  const checkoutWrap = document.getElementById('checkoutWrap');
  const checkoutEl = document.getElementById('checkout');
  const backBtn = document.getElementById('backBtn');
  const sortFieldset = document.getElementById('sortFieldset');
  const countEl = document.getElementById('count');
  const msg = document.getElementById('orderMsg');
  const payBtn = document.getElementById('payBtn');
  const steppers = form.querySelectorAll('[data-sort][data-step]');

  const counts = {};
  steppers.forEach((btn) => { counts[btn.dataset.sort] = 0; });

  let checkout = null;
  let stripePromise = null;

  // Stripe.js laddas först när kunden klickar på betala, och bara från Stripe.
  function loadStripe() {
    if (!stripePromise) {
      stripePromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/dahlia/stripe.js';
        script.onload = () => resolve(window.Stripe(STRIPE_PUBLISHABLE_KEY));
        script.onerror = () => { stripePromise = null; reject(new Error('stripe-load')); };
        document.head.appendChild(script);
      });
    }
    return stripePromise;
  }

  const selectedPkg = () => {
    const checked = form.querySelector('input[name="pkg"]:checked');
    return checked ? checked.value : null;
  };
  const size = () => SIZES[selectedPkg()] || 0;
  const total = () => Object.values(counts).reduce((a, b) => a + b, 0);

  function render() {
    const pkg = selectedPkg();
    const t = total();
    const s = size();

    sortFieldset.disabled = !pkg;
    for (const key of Object.keys(counts)) {
      document.getElementById(`qty-${key}`).textContent = counts[key];
    }
    countEl.textContent = `${t} av ${s} valda`;

    steppers.forEach((btn) => {
      const key = btn.dataset.sort;
      btn.disabled = btn.dataset.step === '1' ? t >= s : counts[key] <= 0;
    });

    const ready = Boolean(pkg) && t === s;
    payBtn.disabled = !ready;

    if (!pkg) msg.textContent = 'Välj en påse först.';
    else if (ready) msg.textContent = 'Allt klart. Nu går du vidare till betalningen.';
    else msg.textContent = `Välj ${s - t} kakor till.`;
  }

  function showSteps() {
    if (checkout) { checkout.destroy?.(); checkout = null; }
    checkoutEl.replaceChildren();
    checkoutWrap.hidden = true;
    stepsEl.hidden = false;
    render();
  }

  function showCheckout() {
    stepsEl.hidden = true;
    checkoutWrap.hidden = false;
    checkoutWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.querySelectorAll('input[name="pkg"]').forEach((input) => {
    input.addEventListener('change', () => {
      // Antalet nollställs när man byter påse, eftersom en stor påse inte ryms i en liten.
      Object.keys(counts).forEach((key) => { counts[key] = 0; });
      render();
    });
  });

  steppers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sort;
      const delta = Number(btn.dataset.step);
      const next = counts[key] + delta;
      if (next < 0 || total() + delta > size()) return;
      counts[key] = next;
      render();
    });
  });

  backBtn.addEventListener('click', showSteps);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pkg = selectedPkg();
    if (!pkg || total() !== size()) return;

    const sorts = {};
    for (const [key, n] of Object.entries(counts)) {
      if (n > 0) sorts[key] = n;
    }

    payBtn.disabled = true;
    msg.textContent = 'Startar betalningen…';

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkg, sorts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.client_secret) throw new Error(data.error || 'Något gick fel.');

      const stripe = await loadStripe();
      if (checkout) checkout.destroy?.();
      checkout = stripe.initCheckoutFormSdk({ clientSecret: data.client_secret, appearance: APPEARANCE });
      showCheckout();
      const paymentForm = checkout.createForm({ layout: 'expanded' });
      paymentForm.mount('#checkout');

      const loaded = await checkout.loadActions();
      if (loaded.type === 'success') {
        paymentForm.on('confirm', async (event) => {
          try {
            await loaded.actions.confirm({ formConfirmEvent: event });
          } catch (error) {
            console.error('Payment confirmation error:', error);
          }
        });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      render();
      msg.textContent = 'Det gick inte att starta betalningen. Försök igen, eller beställ via Instagram eller sms.';
    }
  });

  render();
})();
