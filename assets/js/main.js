/* ============================================================
   QUANTUM BIOTESTING — main.js
   NHS-style UI interactions: nav, scroll, form, animations
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile navigation toggle ──────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileNav.classList.contains('open');
      mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', !isOpen);
      mobileNav.setAttribute('aria-hidden', isOpen);
    });

    // Close menu when a link inside is clicked
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        hamburger.focus();
      }
    });
  }

  /* ── Mobile booking bar (scroll reveal) ─────────────────── */
  const mobBookBar = document.getElementById('mob-book-bar');

  if (mobBookBar) {
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', function () {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (lastScrollY > 300) {
            mobBookBar.classList.add('visible');
          } else {
            mobBookBar.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Scroll-in fade animations ──────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-in');

  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately if IntersectionObserver unsupported
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ── Footer year ────────────────────────────────────────── */
  document.querySelectorAll('#footer-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ── Set minimum booking date to tomorrow ───────────────── */
  const dateInput = document.getElementById('appt-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formatted = tomorrow.toISOString().split('T')[0];
    dateInput.setAttribute('min', formatted);
  }

  /* ── Prevent dates in the past on DOB date field ─────────── */
  const dobInput = document.getElementById('dob');
  if (dobInput) {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    dobInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
    dobInput.setAttribute('min', '1920-01-01');
  }

  /* ── Booking form validation and submit ─────────────────── */
  const bookingForm = document.getElementById('booking-form');
  const bookingSuccess = document.getElementById('booking-success');
  const formSubmit = document.getElementById('form-submit');

  if (bookingForm && bookingSuccess) {

    function showError(fieldId, errorId) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(errorId);
      if (field) field.classList.add('error');
      if (error) error.classList.add('show');
    }

    function clearError(fieldId, errorId) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(errorId);
      if (field) field.classList.remove('error');
      if (error) error.classList.remove('show');
    }

    // Clear error on input/change
    const fieldsToWatch = [
      ['first-name', 'first-name-error'],
      ['last-name', 'last-name-error'],
      ['email', 'email-error'],
      ['phone', 'phone-error'],
      ['dob', 'dob-error'],
      ['location', 'location-error'],
      ['appt-date', 'date-error'],
      ['appt-time', 'time-error'],
    ];

    fieldsToWatch.forEach(function (pair) {
      const field = document.getElementById(pair[0]);
      if (field) {
        field.addEventListener('input', function () { clearError(pair[0], pair[1]); });
        field.addEventListener('change', function () { clearError(pair[0], pair[1]); });
      }
    });

    ['consent-terms', 'consent-data', 'consent-age'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', function () {
        const errMap = { 'consent-terms': 'consent-error', 'consent-data': 'data-error', 'consent-age': 'age-error' };
        clearError(id, errMap[id]);
      });
    });

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let valid = true;

      // Validate required text fields
      const textFields = [
        ['first-name', 'first-name-error'],
        ['last-name', 'last-name-error'],
        ['dob', 'dob-error'],
        ['location', 'location-error'],
        ['appt-date', 'date-error'],
        ['appt-time', 'time-error'],
      ];

      textFields.forEach(function (pair) {
        const el = document.getElementById(pair[0]);
        if (!el || !el.value.trim()) {
          showError(pair[0], pair[1]);
          valid = false;
        }
      });

      // Validate email
      const emailEl = document.getElementById('email');
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailEl || !emailPattern.test(emailEl.value.trim())) {
        showError('email', 'email-error');
        valid = false;
      }

      // Validate phone (UK-ish: 10–11 digits, optional spaces/hyphens)
      const phoneEl = document.getElementById('phone');
      if (phoneEl) {
        const stripped = phoneEl.value.replace(/[\s\-()]/g, '');
        if (!/^\+?[\d]{10,13}$/.test(stripped)) {
          showError('phone', 'phone-error');
          valid = false;
        }
      }

      // Validate appointment date is not in the past
      const apptDateEl = document.getElementById('appt-date');
      if (apptDateEl && apptDateEl.value) {
        const chosen = new Date(apptDateEl.value);
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);
        if (chosen <= minDate) {
          showError('appt-date', 'date-error');
          const err = document.getElementById('date-error');
          if (err) err.textContent = 'Please select a future date';
          valid = false;
        }
      }

      // Validate checkboxes
      const checkboxes = [
        ['consent-terms', 'consent-error'],
        ['consent-data', 'data-error'],
        ['consent-age', 'age-error'],
      ];

      checkboxes.forEach(function (pair) {
        const el = document.getElementById(pair[0]);
        if (!el || !el.checked) {
          showError(pair[0], pair[1]);
          valid = false;
        }
      });

      if (!valid) {
        // Find first visible error and scroll to it
        const firstError = bookingForm.querySelector('.form-error-msg.show');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Disable submit button to prevent double submission
      if (formSubmit) {
        formSubmit.disabled = true;
        formSubmit.textContent = 'Submitting…';
      }

      // Simulate async submission (replace with real fetch/API call)
      setTimeout(function () {
        bookingForm.style.display = 'none';
        bookingSuccess.classList.add('show');
        bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 800);
    });
  }

  /* ── Smooth scroll for in-page anchor links ─────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerHeight = document.querySelector('.site-header')
        ? document.querySelector('.site-header').offsetHeight
        : 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

})();
