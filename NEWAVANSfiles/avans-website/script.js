(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Footer year
  ------------------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Header scroll state
  ------------------------------------------------------------------ */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------------
     Mobile nav toggle
  ------------------------------------------------------------------ */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  const closeNav = () => {
    header.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  /* ------------------------------------------------------------------
     Scroll reveal
  ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     Animated stat counters
  ------------------------------------------------------------------ */
  const statEls = document.querySelectorAll('.stat__value[data-count]');

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (prefersReducedMotion || !target) {
      el.textContent = target;
      return;
    }
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    statEls.forEach(el => countObserver.observe(el));
  } else {
    statEls.forEach(animateCount);
  }

  /* ------------------------------------------------------------------
     Bubble button ripple effect
  ------------------------------------------------------------------ */
  document.querySelectorAll('.btn--bubble').forEach(btn => {
    btn.addEventListener('pointerdown', () => {
      btn.classList.remove('is-rippling');
      // force reflow to restart animation
      void btn.offsetWidth;
      btn.classList.add('is-rippling');
    });
    btn.addEventListener('animationend', (e) => {
      if (e.animationName === 'bubbleRipple') btn.classList.remove('is-rippling');
    });
  });

  /* ------------------------------------------------------------------
     Contact form (client-side only demo handling)
  ------------------------------------------------------------------ */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Please fill in all required fields.';
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      const label = submitBtn.querySelector('.btn__label');
      const originalText = label.textContent;

      label.textContent = 'Sending…';
      submitBtn.disabled = true;

      window.setTimeout(() => {
        label.textContent = originalText;
        submitBtn.disabled = false;
        status.textContent = "Thanks — we'll be in touch within one business day.";
        form.reset();
      }, 900);
    });
  }

  /* ------------------------------------------------------------------
     WORK section lightbox (new)
     Reads every .work-gallery__item on the page in document order
     (data-index 0-5), and reuses a single overlay + <img> to display
     whichever one was clicked. Prev/Next just move through that same
     ordered list, wrapping at the ends.
  ------------------------------------------------------------------ */
  const galleryItems = Array.from(document.querySelectorAll('.work-gallery__item'));

  if (galleryItems.length) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxCounter = document.getElementById('lightboxCounter');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const backdrop = document.getElementById('lightboxBackdrop');

    // Build an ordered list of { src, alt } from the gallery images
    // themselves, so the lightbox always matches whatever is currently
    // in the DOM (swap the <img src> in HTML and this stays in sync).
    const slides = galleryItems.map(item => {
      const img = item.querySelector('.work-gallery__img');
      return { src: img.getAttribute('src'), alt: img.getAttribute('alt') };
    });

    let currentIndex = 0;
    let lastFocusedEl = null;

    function renderSlide(index) {
      const slide = slides[index];
      lightboxImage.src = slide.src;
      lightboxImage.alt = slide.alt;
      lightboxCaption.textContent = slide.alt;
      lightboxCounter.textContent = `${index + 1} / ${slides.length}`;
    }

    function openLightbox(index) {
      currentIndex = index;
      lastFocusedEl = document.activeElement;
      renderSlide(currentIndex);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-open');
      if (lastFocusedEl) lastFocusedEl.focus();
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % slides.length;
      renderSlide(currentIndex);
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      renderSlide(currentIndex);
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Clicking the frame itself shouldn't close the lightbox; only the
    // backdrop (handled above) and explicit close/ESC should.
    document.querySelector('.lightbox__frame').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });

    // Basic touch swipe support for mobile
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) < 40) return;
      if (delta < 0) showNext();
      else showPrev();
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Ambient shard particle field (canvas, GPU-light)
  ------------------------------------------------------------------ */
  const canvas = document.getElementById('shard-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width, height, dpr;
    let particles = [];

    const PARTICLE_COUNT_BASE = 46;

    const rand = (min, max) => Math.random() * (max - min) + min;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticles() {
      const count = window.innerWidth < 760 ? Math.round(PARTICLE_COUNT_BASE * 0.5) : PARTICLE_COUNT_BASE;
      particles = Array.from({ length: count }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(0.6, 2.1),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.09, -0.02),
        alpha: rand(0.15, 0.65),
        pulse: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.004, 0.012),
        isShard: Math.random() < 0.14,
        size: rand(4, 10),
        rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.0015, 0.0015),
      }));
    }

    function drawShard(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      const s = p.size;
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.7, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s * 0.7, 0);
      ctx.closePath();
      ctx.strokeStyle = `rgba(140, 220, 245, ${p.alpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.pulse += p.pulseSpeed;
        const flicker = 0.7 + Math.sin(p.pulse) * 0.3;

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.y < -20) { p.y = height + 20; p.x = rand(0, width); }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        if (p.isShard) {
          drawShard(p);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(180, 235, 250, ${p.alpha * flicker})`;
          ctx.shadowColor = 'rgba(99, 211, 242, 0.8)';
          ctx.shadowBlur = 6;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(step);
    }

    let rafId;
    resize();
    makeParticles();
    rafId = requestAnimationFrame(step);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        makeParticles();
      }, 200);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(step);
      }
    });
  }
})();
