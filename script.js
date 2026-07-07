/* ======================
   CLOUDNEXA — script.js
   Vanilla JavaScript only
   ====================== */
'use strict';

/* ============
   1. THEME
============ */
function initTheme() {
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('cn-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('cn-theme', next);
  });
}

/* ============
   2. NAVBAR SCROLL
============ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const backTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);
    backTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============
   3. MOBILE MENU
============ */
function initMobileMenu() {
  const menuBtn  = document.getElementById('menu-toggle');
  const menu     = document.getElementById('mobile-menu');
  const backdrop = document.getElementById('menu-backdrop');

  function open() {
    menu.classList.add('open');
    menuBtn.classList.add('open');
    backdrop.classList.add('show');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.classList.remove('open');
    menuBtn.classList.remove('open');
    backdrop.classList.remove('show');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', () => menu.classList.contains('open') ? close() : open());
  backdrop.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on Escape key
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) close(); });
}

/* ============
   4. SMOOTH SCROLL
============ */
function initSmoothScroll() {
  // data-scroll links
  document.querySelectorAll('[data-scroll]').forEach(el => {
    el.addEventListener('click', e => {
      const href = el.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Coming soon links
  document.querySelectorAll('.coming-soon').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showToast(`<strong>${el.textContent.trim()}</strong> — Coming soon!`);
    });
  });
}

/* ============
   5. SCROLL ANIMATIONS
============ */
function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));
}

/* ============
   6. COUNT-UP & PROGRESS BARS
============ */
function initCountUp() {
  const section = document.querySelector('.stats-section');
  if (!section) return;

  let triggered = false;
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || triggered) return;
    triggered = true;
    observer.unobserve(section);

    // Animate numbers
    section.querySelectorAll('.count').forEach(el => {
      const target  = parseFloat(el.dataset.target);
      const isFloat = el.dataset.float === 'true';
      const duration = 2200;
      let start;

      function step(ts) {
        if (!start) start = ts;
        const p    = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(2, -10 * p);
        el.textContent = isFloat ? (target * ease).toFixed(1) : Math.floor(target * ease);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = isFloat ? target.toFixed(1) : target;
      }
      requestAnimationFrame(step);
    });

    // Animate progress bars (with small delay)
    setTimeout(() => {
      section.querySelectorAll('.stat-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.progress + '%';
      });
    }, 150);

  }, { threshold: 0.25 });

  observer.observe(section);
}

/* ============
   7. TESTIMONIALS SLIDER
============ */
function initTestimonials() {
  const cards   = Array.from(document.querySelectorAll('.testimonial-card'));
  const dots    = Array.from(document.querySelectorAll('.dot'));
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const track   = document.getElementById('testimonials-track');
  if (!cards.length) return;

  let current = 0;
  let timer;

  function show(index) {
    const prev = current;
    current = ((index % cards.length) + cards.length) % cards.length;
    if (prev === current) return;

    cards[prev].classList.remove('active');
    cards[prev].classList.add('prev');
    dots[prev].classList.remove('active');
    dots[prev].setAttribute('aria-selected', 'false');

    setTimeout(() => cards[prev].classList.remove('prev'), 450);

    cards[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
  }

  function startTimer() { timer = setInterval(() => show(current + 1), 4200); }
  function resetTimer() { clearInterval(timer); startTimer(); }

  prevBtn.addEventListener('click', () => { show(current - 1); resetTimer(); });
  nextBtn.addEventListener('click', () => { show(current + 1); resetTimer(); });
  dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.index); resetTimer(); }));

  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', startTimer);

  startTimer();
}

/* ============
   8. PRICING
============ */
function initPricing() {
  const cards = Array.from(document.querySelectorAll('.pricing-card'));
  const note  = document.getElementById('pricing-selection-note');
  const names = ['Starter', 'Pro', 'Enterprise'];
  if (!cards.length) return;

  function select(index) {
    cards.forEach(c => {
      c.classList.remove('selected');
      const badge = c.querySelector('.selected-badge');
      if (badge) badge.classList.add('hidden');
    });

    const card = cards[index];
    if (!card) return;
    card.classList.add('selected');
    const badge = card.querySelector('.selected-badge');
    if (badge) badge.classList.remove('hidden');

    note.innerHTML = `You selected the <strong style="color:var(--primary)">${names[index]}</strong> plan. <a href="#contact" id="note-link">Get in touch</a> to get started.`;
    const noteLink = document.getElementById('note-link');
    if (noteLink) noteLink.addEventListener('click', e => { e.preventDefault(); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); });
  }

  // Click card to select
  cards.forEach(card => {
    card.addEventListener('click', () => select(+card.dataset.plan));
  });

  // CTA buttons
  document.querySelectorAll('.pricing-cta').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const plan = +btn.dataset.plan;
      select(plan);
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Services cards → scroll to pricing
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' });
    });
  });

  select(1); // Default: Pro
}

/* ============
   9. CONTACT FORM
============ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const rules = {
    name:    { validate: v => v.trim().length >= 2 ? '' : 'Name must be at least 2 characters.' },
    email:   { validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.' },
    subject: { validate: v => v.trim().length >= 5 ? '' : 'Subject must be at least 5 characters.' },
    message: { validate: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.' },
  };

  // Add live validation
  Object.entries(rules).forEach(([name, { validate }]) => {
    const input  = form.querySelector(`#${name}`);
    const errEl  = form.querySelector(`#${name}-error`);
    if (!input || !errEl) return;

    function check() {
      const err = validate(input.value);
      errEl.textContent = err;
      input.classList.toggle('error', !!err);
      return !err;
    }
    input.addEventListener('blur', check);
    input.addEventListener('input', () => { if (input.classList.contains('error')) check(); });
    input._valid = check; // expose for submit
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all fields
    let valid = true;
    Object.keys(rules).forEach(name => {
      const input = form.querySelector(`#${name}`);
      if (input && typeof input._valid === 'function') {
        if (!input._valid()) valid = false;
      }
    });
    if (!valid) return;

    // Loading state
    const btn     = document.getElementById('submit-btn');
    const txtSpan = document.getElementById('submit-text');
    const ldSpan  = document.getElementById('submit-loading');
    const success = document.getElementById('form-success');
    btn.disabled = true;
    txtSpan.classList.add('hidden');
    ldSpan.classList.remove('hidden');

    await new Promise(r => setTimeout(r, 1500)); // Simulate request

    btn.disabled = false;
    txtSpan.classList.remove('hidden');
    ldSpan.classList.add('hidden');
    form.reset();
    success.classList.remove('hidden');
    setTimeout(() => success.classList.add('hidden'), 5000);
    showToast('<strong>Message sent!</strong> We\'ll get back to you as soon as possible.');
  });
}

/* ============
   10. TOAST
============ */
function showToast(html) {
  const toast = document.getElementById('toast');
  toast.innerHTML = html;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ============
   INIT
============ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initTheme();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initCountUp();
  initTestimonials();
  initPricing();
  initContactForm();
});
