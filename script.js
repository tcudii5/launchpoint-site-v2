// mobile nav
const burger = document.getElementById('burger');
const links = document.getElementById('navLinks');
burger.addEventListener('click', () => links.classList.toggle('open'));
links.addEventListener('click', e => {
  if (e.target.tagName === 'A') links.classList.remove('open');
});

// scroll reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 3) * 80 + 'ms';
  io.observe(el);
});

// count-up on stat numbers
const countIO = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const b = en.target;
    const raw = b.childNodes[0].textContent.trim();
    const target = parseFloat(raw.replace(/,/g, ''));
    if (isNaN(target)) { countIO.unobserve(b); return; }
    const decimals = (raw.split('.')[1] || '').length;
    const node = b.childNodes[0];
    let start = null;
    const dur = 1100;
    const step = t => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const val = (target * (1 - Math.pow(1 - p, 3)));
      node.textContent = decimals
        ? val.toFixed(decimals)
        : Math.round(val).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countIO.unobserve(b);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat b').forEach(b => countIO.observe(b));

// form (no backend wired yet)
const form = document.getElementById('auditForm');
form.addEventListener('submit', e => {
  e.preventDefault();
  const note = document.getElementById('formNote');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  note.textContent = 'Thanks — your audit request is in. We reply within one business day.';
  note.style.color = 'var(--accent)';
  note.style.fontWeight = '700';
  form.querySelector('button').disabled = true;
});

// safety: never leave content hidden
setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')), 3000);
