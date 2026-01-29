/* =========================================================
   Wriver-like homepage interactions (vanilla JS)
   - Mobile menu toggle
   - Simple hero slider (dots)
   - Scroll-based dots for collections + news (mobile/tablet)
========================================================= */

(function () {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  // -------------------------
  // Mobile nav
  // -------------------------
  const navToggle = qs('.nav-toggle');
  const navMenu = qs('#navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });

    // Close menu on link click (mobile)
    navMenu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      if (navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  // -------------------------
  // Hero slider (dots)
  // -------------------------
  const hero = qs('[data-slider="hero"]');
  if (hero) {
    const slides = qsa('.hero-slide', hero);
    const dots = qsa('.hero-dots .dot', hero);

    const setActive = (idx) => {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => setActive(idx));
    });

    // Auto-advance (subtle, like reference)
    let i = 0;
    setInterval(() => {
      i = (i + 1) % slides.length;
      setActive(i);
    }, 6500);
  }

  // -------------------------
  // Dots for horizontal scroll sections (collections, news)
  // Creates dots based on scrollable pages.
  // -------------------------
  function initScrollDots(trackSelector, dotsSelector) {
    const track = qs(trackSelector);
    const dotsWrap = qs(dotsSelector);
    if (!track || !dotsWrap) return;

    const isScrollable = () => track.scrollWidth - track.clientWidth > 8;

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      if (!isScrollable()) return;

      const page = track.clientWidth;
      const pages = Math.max(1, Math.round(track.scrollWidth / page));

      for (let p = 0; p < pages; p++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dot' + (p === 0 ? ' is-active' : '');
        b.setAttribute('aria-label', `Page ${p + 1}`);
        b.addEventListener('click', () => {
          track.scrollTo({ left: p * page, behavior: 'smooth' });
        });
        dotsWrap.appendChild(b);
      }
    };

    const updateActive = () => {
      const dots = qsa('.dot', dotsWrap);
      if (!dots.length) return;

      const page = track.clientWidth;
      const idx = Math.max(0, Math.min(dots.length - 1, Math.round(track.scrollLeft / page)));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    };

    // Rebuild on resize (responsive)
    const onResize = () => {
      buildDots();
      updateActive();
    };

    buildDots();
    updateActive();

    track.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateActive);
    });

    window.addEventListener('resize', onResize, { passive: true });
  }

  // Collections: track is grid, becomes scrollable on tablet/mobile
  initScrollDots('.collections-track', '.collections-dots');

  // News: becomes grid; no horizontal scroll on desktop, but on some sizes we may want dots off.
  // We'll make it scrollable only if we switch it to overflow auto via CSS (not default).
  // Keep dot builder harmless.
  initScrollDots('.news-items', '.news-dots');

  // -------------------------
  // Scroll reveal animations
  // -------------------------
  const revealSelectors = [
    '.story',
    '.collections',
    '.collection-card',
    '.products',
    '.product-card',
    '.banner',
    '.news',
    '.news-item',
    '.footer-grid',
    '.footer-bottom'
  ];

  const revealTargets = qsa(revealSelectors.join(','));
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const staggerItems = qsa('.collection-card, .product-card, .news-item');
  staggerItems.forEach((el, idx) => {
    const delay = (idx % 6) * 80;
    el.style.setProperty('--reveal-delay', `${delay}ms`);
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    );

    revealTargets.forEach((el) => io.observe(el));
  } else {
    // Fallback: show content if IntersectionObserver is not supported
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }
})();
