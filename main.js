/* ============================================================
   RAINMOBI — main.js
   Features: Navbar scroll, mobile menu, scroll reveal,
             stats counter animation, form handling
   ============================================================ */

'use strict';

// ---- Utility: debounce ----
function debounce(fn, ms = 16) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ================================================================
// NAVBAR — scroll-triggered background
// ================================================================
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = debounce(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
})();

// ================================================================
// MOBILE MENU — hamburger toggle
// ================================================================
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!hamburger || !menu) return;

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  }

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close on mobile link click
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !menu.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) toggleMenu(false);
  });
})();

// ================================================================
// SCROLL REVEAL — IntersectionObserver
// ================================================================
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// ================================================================
// STATS COUNTER — animate numbers on scroll
// ================================================================
(function initCounters() {
  const statCards = document.querySelectorAll('.stat-card');
  if (!statCards.length) return;

  function animateCounter(el, target) {
    const numEl = el.querySelector('.stat-number');
    if (!numEl) return;
    const start = performance.now();
    const duration = 1800;

    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const val = Math.round(easeOutQuart(progress) * target);

      // Format large numbers
      if (target >= 10000) {
        numEl.textContent = (val >= 1000 ? (val / 1000).toFixed(1) + 'K' : val.toString());
      } else {
        numEl.textContent = val.toLocaleString();
      }

      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const numEl = card.querySelector('.stat-number');
        const target = parseInt(numEl?.dataset.target || '0', 10);
        if (!isNaN(target)) animateCounter(card, target);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.3 });

  statCards.forEach(card => observer.observe(card));
})();

// ================================================================
// SCROLL TO TOP BUTTON
// ================================================================
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  const onScroll = debounce(() => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ================================================================
// ACTIVE NAV LINK — highlight based on scroll position
// ================================================================
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const onScroll = debounce(() => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ================================================================
// CONTACT FORM — basic client-side handling
// ================================================================
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  if (!form || !successMsg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let valid = true;
    requiredFields.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#FF6B6B';
        valid = false;
      }
    });

    if (!valid) {
      const firstInvalid = form.querySelector('[required]:invalid, [required][style*="FF6B6B"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Simulate async send
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span>';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
      successMsg.classList.add('show');
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    }, 1200);
  });

  // Clear red border on input
  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => { field.style.borderColor = ''; });
  });
})();

// ================================================================
// SMOOTH ANCHOR SCROLL — account for sticky nav
// ================================================================
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// ================================================================
// CHART BAR ANIMATION (About section)
// ================================================================
(function initChartBars() {
  const bars = document.querySelectorAll('.chart-bar');
  if (!bars.length) return;

  // Store original heights and set to 0
  bars.forEach(bar => {
    const targetH = bar.style.getPropertyValue('--h');
    bar.dataset.targetH = targetH;
    bar.style.setProperty('--h', '0%');
  });

  const section = document.querySelector('.about');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        bars.forEach((bar, i) => {
          setTimeout(() => {
            bar.style.setProperty('--h', bar.dataset.targetH);
          }, i * 150);
        });
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
})();

// ================================================================
// PROGRESS BAR ANIMATION (Publisher/Advertiser cards)
// ================================================================
(function initProgressBars() {
  const bars = document.querySelectorAll('.ac-bar-fill, .pc-progress-fill');
  bars.forEach(bar => {
    const targetW = bar.style.width;
    bar.style.width = '0%';
    bar.dataset.targetW = targetW;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        requestAnimationFrame(() => {
          bar.style.width = bar.dataset.targetW;
        });
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => observer.observe(bar));
})();

console.log('%cRainmobi ⚡', 'color:#6C63FF; font-family:Syne,sans-serif; font-size:18px; font-weight:800;');
console.log('%cPerformance Marketing Network', 'color:#00D4FF; font-size:12px;');
