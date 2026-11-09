// Beställningsformulär: välj påse, välj kakor och skicka vidare till Stripe Checkout.
// Serversidan kontrollerar pris och antal igen (api/create-checkout-session.js).
(() => {
  const SIZES = { liten: 6, stor: 12 };

  const form = document.getElementById('orderForm');
  if (!form) return;

  const sortFieldset = document.getElementById('sortFieldset');
  const countEl = document.getElementById('count');
  const msg = document.getElementById('orderMsg');
  const payBtn = document.getElementById('payBtn');
  const steppers = form.querySelectorAll('[data-sort][data-step]');

  const counts = {};
  steppers.forEach((btn) => { counts[btn.dataset.sort] = 0; });

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

  form.querySelectorAll('input[name="pkg"]').forEach((input) => {
    input.addEventListener('change', () => {
      // Antalet nollställs när man byter påse, eftersom en stor påse kan inte rymmas i en liten.
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pkg = selectedPkg();
    if (!pkg || total() !== size()) return;

    const sorts = {};
    for (const [key, n] of Object.entries(counts)) {
      if (n > 0) sorts[key] = n;
    }

    payBtn.disabled = true;
    msg.textContent = 'Skickar dig till betalningen…';

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pkg, sorts }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Något gick fel.');
      window.location.href = data.url;
    } catch (err) {
      render();
      msg.textContent = 'Det gick inte att starta betalningen. Försök igen, eller beställ via Instagram eller sms.';
    }
  });

  render();
})();
