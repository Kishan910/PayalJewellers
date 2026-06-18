/* ====================================================================
   PAYAL JEWELLERS — script.js
   Preloader · Navbar · Particles · Scroll-reveal · Threads ·
   Trending carousel · Testimonials carousel · Newsletter form ·
   Back-to-top · Year · Active nav highlighting
   ==================================================================== */

'use strict';

/* ---------------------------------------------------------------
   1. PRELOADER
   --------------------------------------------------------------- */
(function preloader() {
  const el = document.getElementById('preloader');
  if (!el) return;
  const hide = () => el.classList.add('is-hidden');
  if (document.readyState === 'complete') {
    setTimeout(hide, 200);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 200));
  }
})();

/* ---------------------------------------------------------------
   2. CURRENT YEAR IN FOOTER
   --------------------------------------------------------------- */
(function setYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ---------------------------------------------------------------
   3. NAVBAR — scroll solidify + mobile toggle + active link
   --------------------------------------------------------------- */
(function navbar() {
  const nav     = document.getElementById('navbar');
  const menu    = document.getElementById('navMenu');
  const toggle  = document.getElementById('navToggle');
  const links   = document.querySelectorAll('.navbar__link');
  if (!nav) return;

  // Scroll solidify
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  const navClose = document.getElementById('navClose');

function openMenu() {
  menu.classList.add('is-open');
  nav.classList.add('menu-open');

  toggle.setAttribute('aria-expanded', 'true');

  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  menu.classList.remove('is-open');
  nav.classList.remove('menu-open');

  toggle.setAttribute('aria-expanded', 'false');

  document.body.style.overflow = '';
}

toggle?.addEventListener('click', () => {
  if (menu.classList.contains('is-open')) {
    closeMenu();
  } else {
    openMenu();
  }
});

navClose?.addEventListener('click', closeMenu);


  // Close menu on link click
  links.forEach(link => {
  link.addEventListener('click', closeMenu);
});

  // Active link on scroll (IntersectionObserver per section)
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.navbar__link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  sections.forEach(s => observer.observe(s));
})();

/* ---------------------------------------------------------------
   4. PARTICLE FIELD IN HERO
   --------------------------------------------------------------- */
(function particles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const COUNT = window.matchMedia('(max-width: 600px)').matches ? 14 : 28;
  const frag  = document.createDocumentFragment();

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const size = 2 + Math.random() * 3;
    Object.assign(p.style, {
      left:           Math.random() * 100 + '%',
      top:            (30 + Math.random() * 60) + '%',
      width:          size + 'px',
      height:         size + 'px',
      animationDelay: Math.random() * 8 + 's',
      animationDuration: (6 + Math.random() * 10) + 's',
      opacity:        String(0.2 + Math.random() * 0.5),
    });
    frag.appendChild(p);
  }
  container.appendChild(frag);
})();

/* ---------------------------------------------------------------
   5. INTERSECTION OBSERVER — scroll-reveal & gold thread draw
   --------------------------------------------------------------- */
(function scrollReveal() {
  // Reveal elements (.reveal class)
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));

  // Gold thread dividers
  const threadIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        threadIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.thread').forEach(el => threadIO.observe(el));
})();

/* ---------------------------------------------------------------
   6. SMOOTH SCROLLING for same-page anchor links
   --------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = document.getElementById('navbar').offsetHeight + 16;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ---------------------------------------------------------------
   7. REUSABLE CAROUSEL FACTORY
   --------------------------------------------------------------- */
function buildCarousel({ trackId, prevId, nextId, dotsId, autoDelay = 4000, perView = null }) {
  const track    = document.getElementById(trackId);
  const prevBtn  = document.getElementById(prevId);
  const nextBtn  = document.getElementById(nextId);
  const dotsWrap = document.getElementById(dotsId);
  if (!track) return;

  const slides = Array.from(track.children);
  let current  = 0;
  let timer    = null;
  let paused   = false;

  // Determine how many slides are visible at once
  function getPerView() {
    if (perView) return perView;
    const vw = window.innerWidth;
    if (vw <= 600) return 1;
    if (vw <= 900) return 2;
    return 4;
  }

  // Build dots
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const total = slides.length - getPerView() + 1;
    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Slide ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    Array.from(dotsWrap.children).forEach((btn, i) => btn.classList.toggle('is-active', i === current));
  }

  function getSlideWidth() {
    if (!slides.length) return 0;
    const style = getComputedStyle(track);
    const gap   = parseFloat(style.gap) || 24;
    const pv    = getPerView();
    return (track.parentElement.offsetWidth - gap * (pv - 1)) / pv + gap;
  }

  function goTo(index) {
    const max = Math.max(0, slides.length - getPerView());
    current = Math.max(0, Math.min(index, max));
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    updateDots();
  }

  function next() { goTo(current + 1 >= slides.length - getPerView() + 1 ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? slides.length - getPerView() : current - 1); }

  function startAuto() {
    if (autoDelay <= 0) return;
    stopAuto();
    timer = setInterval(() => { if (!paused) next(); }, autoDelay);
  }
  function stopAuto() { clearInterval(timer); }

  prevBtn && prevBtn.addEventListener('click', () => { next(); startAuto(); }); // intentional: next on prev for UX variety? Actually prev:
  if (prevBtn) { prevBtn.removeEventListener('click', () => {}); prevBtn.addEventListener('click', () => { prev(); startAuto(); }); }
  nextBtn && nextBtn.addEventListener('click', () => { next(); startAuto(); });

  track.parentElement.addEventListener('mouseenter', () => { paused = true; });
  track.parentElement.addEventListener('mouseleave', () => { paused = false; });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
  });

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(current); }, 200);
  });

  buildDots();
  goTo(0);
  startAuto();
}

/* ---------------------------------------------------------------
   8. TRENDING CAROUSEL
   --------------------------------------------------------------- */
// Fix the prev button — the factory above has a minor duplicate listener bug. Using direct approach:
(function trendingCarousel() {
  const track    = document.getElementById('trendingTrack');
  const prevBtn  = document.getElementById('trendPrev');
  const nextBtn  = document.getElementById('trendNext');
  const dotsWrap = document.getElementById('trendingDots');
  if (!track) return;

  const slides = Array.from(track.children);
  let current  = 0;
  let timer    = null;
  let paused   = false;

  function getPerView() {
    const vw = window.innerWidth;
    if (vw <= 600) return 1;
    if (vw <= 900) return 2;
    return 4;
  }

  function getMax() { return Math.max(0, slides.length - getPerView()); }

  function getSlideWidth() {
    const gap = 24;
    const pv  = getPerView();
    return (track.parentElement.offsetWidth - gap * (pv - 1)) / pv + gap;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const total = getMax() + 1;
    for (let i = 0; i < total; i++) {
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Slide ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    Array.from(dotsWrap.children).forEach((btn, i) => btn.classList.toggle('is-active', i === current));
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, getMax()));
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    updateDots();
  }

  function next() { goTo(current >= getMax() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? getMax() : current - 1); }

  function startAuto() { clearInterval(timer); timer = setInterval(() => { if (!paused) next(); }, 4200); }

  prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { next(); startAuto(); });

  const viewport = track.parentElement;
  viewport.addEventListener('mouseenter', () => { paused = true; });
  viewport.addEventListener('mouseleave', () => { paused = false; });

  // Touch swipe
  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) dx < 0 ? next() : prev(); });

  // Keyboard
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { buildDots(); goTo(current); }, 200); });

  buildDots();
  goTo(0);
  startAuto();
})();

/* ---------------------------------------------------------------
   9. TESTIMONIALS CAROUSEL
   --------------------------------------------------------------- */
(function testiCarousel() {
  const track    = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  if (!track) return;

  const slides = Array.from(track.children);
  let current  = 0;
  let timer    = null;
  let paused   = false;

  function buildDots() {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Review ${i + 1}`);
      btn.addEventListener('click', () => { goTo(i); startAuto(); });
      dotsWrap.appendChild(btn);
    });
  }

  function updateDots() {
    Array.from(dotsWrap.children).forEach((btn, i) => btn.classList.toggle('is-active', i === current));
  }

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
  }

  function startAuto() { clearInterval(timer); timer = setInterval(() => { if (!paused) goTo(current + 1); }, 5000); }

  track.parentElement.addEventListener('mouseenter', () => { paused = true; });
  track.parentElement.addEventListener('mouseleave', () => { paused = false; });

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) { dx < 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
  });

  buildDots();
  goTo(0);
  startAuto();
})();

/* ---------------------------------------------------------------
   10. BACK TO TOP
   --------------------------------------------------------------- */
(function backToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('is-visible', window.scrollY > 500), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ---------------------------------------------------------------
   11. NEWSLETTER FORM
   --------------------------------------------------------------- */
(function newsletterForm() {
  const form = document.getElementById('newsletterForm');
  const msg  = document.getElementById('formMsg');
  if (!form || !msg) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!email) return;

    // Simulate async submission
    const btn = form.querySelector('.btn');
    btn.textContent = 'Subscribing…';
    btn.disabled = true;

    setTimeout(() => {
      msg.textContent = '✓ You\'re on the list — first looks incoming.';
      form.reset();
      btn.innerHTML = '<span>Subscribe</span>';
      btn.disabled = false;
    }, 1200);
  });
})();

/* ---------------------------------------------------------------
   12. ICON BUTTON FEEDBACK (wishlist / quick view)
   --------------------------------------------------------------- */
document.querySelectorAll('.icon-btn[aria-label="Add to wishlist"]').forEach(btn => {
  btn.addEventListener('click', function () {
    this.style.background = 'var(--gold-2)';
    this.style.borderColor = 'var(--gold-2)';
    this.style.color = '#1a1410';
    this.setAttribute('aria-label', 'Added to wishlist');
  });
});

/* ---------------------------------------------------------------
   13. PARALLAX TILT on hero SVG (subtle, desktop only)
   --------------------------------------------------------------- */
(function heroTilt() {
  if (window.matchMedia('(max-width: 900px)').matches) return;
  const illus = document.querySelector('.hero__necklace');
  if (!illus) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    illus.style.transform = `perspective(900px) rotateY(${dx * 5}deg) rotateX(${-dy * 4}deg) translateZ(10px)`;
  });

  document.addEventListener('mouseleave', () => {
    illus.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
  });
})();