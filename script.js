const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
  navLinks.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Stäng meny' : 'Öppna meny');
}

navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Färgen bakom sidan (syns vid överscroll och bakom iPhones verktygsfält):
// vinrött överst som menyn, mörkare vinrött nere som sidfoten.
(() => {
  const root = document.documentElement;
  const css = getComputedStyle(root);
  const top = css.getPropertyValue('--wine').trim();
  const bottom = css.getPropertyValue('--wine-deep').trim();
  let last = '';
  function paint() {
    const max = root.scrollHeight - window.innerHeight;
    const c = max > 0 && window.scrollY / max > 0.5 ? bottom : top;
    if (c !== last) { root.style.backgroundColor = c; last = c; }
  }
  window.addEventListener('scroll', paint, { passive: true });
  window.addEventListener('resize', paint);
  paint();
})();
