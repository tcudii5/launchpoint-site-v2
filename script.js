const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- mobile drawer ---------- */
const burger = document.getElementById('burger');
const links  = document.getElementById('navLinks');
const scrim  = document.getElementById('scrim');

function setMenu(open) {
  links.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('locked', open);
  scrim.hidden = !open;
  requestAnimationFrame(() => scrim.classList.toggle('show', open));
}
burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
scrim.addEventListener('click', () => setMenu(false));
links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------- scroll progress ---------- */
const bar = document.getElementById('progress');
const mobileBar = document.getElementById('mobileBar');
let ticking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';

  // reveal the sticky action bar once past the hero, hide it over the form
  const form = document.getElementById('audit');
  const past = scrollY > innerHeight * 0.7;
  const atForm = form.getBoundingClientRect().top < innerHeight * 0.85;
  mobileBar.classList.toggle('show', past && !atForm);

  if (!reduced) parallax();
  ticking = false;
}
addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });

/* ---------- gentle parallax on the two big photos ---------- */
const layers = [...document.querySelectorAll('.hero-media img, .media-stack img')];
function parallax() {
  if (innerWidth < 760) return;
  for (const el of layers) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) continue;
    const progress = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    el.style.transform = `translate3d(0, ${(-progress * 18).toFixed(2)}px, 0)`;
  }
}

/* ---------- scroll reveal ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 90 + 'ms';
  io.observe(el);
});

// section headings animate their underline independently of the stagger
document.querySelectorAll('.sec-head').forEach(h => {
  new IntersectionObserver((e, o) => {
    if (e[0].isIntersecting) { h.classList.add('in'); o.disconnect(); }
  }, { threshold: 0.4 }).observe(h);
});

/* ---------- count-up on stat numbers ---------- */
const countIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const b = en.target;
    const node = b.childNodes[0];
    const raw = node.textContent.trim();
    const target = parseFloat(raw.replace(/,/g, ''));
    if (isNaN(target)) { countIO.unobserve(b); return; }
    if (reduced) { countIO.unobserve(b); return; }

    const decimals = (raw.split('.')[1] || '').length;
    let start = null;
    const dur = 1200;
    const step = t => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const val = target * (1 - Math.pow(1 - p, 3));
      node.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countIO.unobserve(b);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat b').forEach(b => countIO.observe(b));

/* ---------- one FAQ open at a time ---------- */
const faqs = [...document.querySelectorAll('#faq details')];
faqs.forEach(d => d.addEventListener('toggle', () => {
  if (d.open) faqs.forEach(o => { if (o !== d) o.open = false; });
}));

/* ---------- form ---------- */
const form = document.getElementById('auditForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const note = document.getElementById('formNote');
  note.textContent = 'Thanks — your audit request is in. We reply within one business day.';
  note.style.color = 'var(--accent)';
  note.style.fontWeight = '700';
  form.querySelector('button').disabled = true;
});

/* ---------- safety: never leave content hidden ---------- */
setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')), 3000);
onScroll();
