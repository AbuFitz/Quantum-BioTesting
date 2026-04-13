/* ================================================================
   QUANTUM BIOTESTING — main.js
   Header scroll · Mobile nav · Animations · Form validation
   ================================================================ */

(function () {
  'use strict';

  /* ── Header scroll behaviour ─────────────────────────────────── */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ── Mobile navigation ───────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileNav.hidden = !isOpen;
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (
        hamburger.classList.contains('open') &&
        !hamburger.contains(e.target) &&
        !mobileNav.contains(e.target)
      ) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('open')) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        hamburger.focus();
      }
    });
  }

  /* ── Mobile booking bar ──────────────────────────────────────── */
  const mobBar = document.getElementById('mob-bar');
  if (mobBar) {
    let lastScrollY = window.scrollY;
    const showMobBar = () => {
      const scrolled = window.scrollY > 300;
      const scrollingUp = window.scrollY < lastScrollY;
      // Show when past 300px or scrolling up past initial fold
      mobBar.classList.toggle('visible', scrolled && !scrollingUp || (scrolled && scrollingUp));
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', showMobBar, { passive: true });
  }

  /* ── Scroll-triggered fade-up animations ────────────────────── */
  if ('IntersectionObserver' in window) {
    const fadeEls = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    fadeEls.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all immediately
    document.querySelectorAll('.fade-up').forEach((el) => el.classList.add('visible'));
  }

  /* ── Testing page: subnav active link on scroll ──────────────── */
  const subnavLinks = document.querySelectorAll('.subnav-link');
  if (subnavLinks.length > 0) {
    const sectionIds = Array.from(subnavLinks).map((a) => a.getAttribute('href').replace('#', ''));
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    const updateSubnav = () => {
      let current = '';
      const scrollY = window.scrollY + 140;
      sections.forEach((sec) => {
        if (sec.offsetTop <= scrollY) {
          current = sec.id;
        }
      });
      subnavLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === '#' + current;
        link.style.color = isActive ? 'var(--gold)' : '';
        link.style.borderBottomColor = isActive ? 'var(--gold)' : 'transparent';
      });
    };

    window.addEventListener('scroll', updateSubnav, { passive: true });
    updateSubnav();
  }

  /* ── Smooth scroll for anchor links ─────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 72;
        const subnavH = document.getElementById('testing-subnav')
          ? document.getElementById('testing-subnav').offsetHeight
          : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - subnavH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ── Booking form validation ─────────────────────────────────── */
  const bookingForm = document.getElementById('booking-form');
  const bookingSuccess = document.getElementById('booking-success');
  const formSubmit = document.getElementById('form-submit');

  if (bookingForm) {
    // Validate a single field, return true if valid
    const validateField = (id, errId, validator) => {
      const el = document.getElementById(id);
      const err = document.getElementById(errId);
      if (!el || !err) return true;
      const valid = validator(el);
      el.classList.toggle('error', !valid);
      err.classList.toggle('show', !valid);
      if (!valid && el.getAttribute('aria-invalid') !== 'true') {
        el.setAttribute('aria-invalid', 'true');
      } else if (valid) {
        el.removeAttribute('aria-invalid');
      }
      return valid;
    };

    const notEmpty = (el) => el.value.trim().length > 0;
    const validEmail = (el) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
    const validPhone = (el) => /^[\d\s\+\(\)\-]{7,20}$/.test(el.value.trim());
    const validDate = (el) => el.value.length > 0;
    const notEmptySelect = (el) => el.value !== '';
    const isChecked = (el) => el.checked;

    // Real-time blur validation
    const rules = [
      ['first-name',        'first-name-err',  notEmpty],
      ['last-name',         'last-name-err',   notEmpty],
      ['email',             'email-err',       validEmail],
      ['phone',             'phone-err',       validPhone],
      ['dob',               'dob-err',         validDate],
      ['sex',               'sex-err',         notEmptySelect],
      ['preferred-location','location-err',    notEmptySelect],
      ['preferred-date',    'date-err',        validDate],
    ];

    rules.forEach(([id, errId, validator]) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('blur', () => validateField(id, errId, validator));
        el.addEventListener('input', () => {
          if (el.classList.contains('error')) {
            validateField(id, errId, validator);
          }
        });
      }
    });

    // Checkbox blur/change
    ['consent-terms', 'consent-age'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          const errId = id === 'consent-terms' ? 'consent-err' : 'age-err';
          validateField(id, errId, isChecked);
        });
      }
    });

    // Future date check for preferred-date
    const prefDateEl = document.getElementById('preferred-date');
    if (prefDateEl) {
      // Set minimum to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      prefDateEl.min = tomorrow.toISOString().split('T')[0];
      // Set max to 6 months out
      const sixMonths = new Date();
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      prefDateEl.max = sixMonths.toISOString().split('T')[0];
    }

    // Block past dob
    const dobEl = document.getElementById('dob');
    if (dobEl) {
      const today = new Date().toISOString().split('T')[0];
      dobEl.max = today;
    }

    // Form submit
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let allValid = true;

      rules.forEach(([id, errId, validator]) => {
        const ok = validateField(id, errId, validator);
        if (!ok) allValid = false;
      });

      // Checkbox validation
      const consentTermsOk = validateField('consent-terms', 'consent-err', isChecked);
      const consentAgeOk   = validateField('consent-age',   'age-err',     isChecked);
      if (!consentTermsOk || !consentAgeOk) allValid = false;

      if (!allValid) {
        // Scroll to first error
        const firstErr = bookingForm.querySelector('.form-control.error, .form-check.error');
        if (firstErr) {
          const top = firstErr.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        return;
      }

      // Disable submit during processing
      if (formSubmit) {
        formSubmit.disabled = true;
        formSubmit.textContent = 'Submitting…';
      }

      // Simulate async submission (replace with real endpoint)
      setTimeout(() => {
        bookingForm.style.display = 'none';
        if (bookingSuccess) {
          bookingSuccess.classList.add('show');
          bookingSuccess.focus();
          // Scroll to success
          const top = bookingSuccess.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 700);
    });
  }

})();
