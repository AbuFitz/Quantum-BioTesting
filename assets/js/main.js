/* ============================================================
   QUANTUM BIOTESTING — main.js
   Header · Mobile nav · Modal (4-step) · Cookie consent
   Fade animations · Counter animation · Scroll utilities
   ============================================================ */

(function () {
  'use strict';

  /* ── UTILS ──────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function setAttr(el, attrs) {
    if (!el) return;
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }

  /* ── DOM READY ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initHeader();
    initMobileNav();
    initModal();
    initCookieConsent();
    initFadeAnimations();
    initCounters();
    initScrollUtilities();
    initDateConstraints();
    initNavActiveState();
  }

  /* ══════════════════════════════════════════════════════════
     HEADER — transparent → scrolled
  ══════════════════════════════════════════════════════════ */
  function initHeader() {
    const header = $('#site-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run immediately
  }

  /* ══════════════════════════════════════════════════════════
     MOBILE NAV
  ══════════════════════════════════════════════════════════ */
  function initMobileNav() {
    const toggle = $('#menu-toggle');
    const nav = $('#mobile-nav');
    if (!toggle || !nav) return;

    let isOpen = false;

    function openNav() {
      isOpen = true;
      toggle.classList.add('open');
      nav.classList.add('open');
      setAttr(toggle, { 'aria-expanded': 'true' });
      setAttr(nav, { 'aria-hidden': 'false' });
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      isOpen = false;
      toggle.classList.remove('open');
      nav.classList.remove('open');
      setAttr(toggle, { 'aria-expanded': 'false' });
      setAttr(nav, { 'aria-hidden': 'true' });
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', () => isOpen ? closeNav() : openNav());

    // Close on nav link click
    $$('.mobile-nav-link', nav).forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeNav();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeNav();
    });
  }

  /* ══════════════════════════════════════════════════════════
     BOOKING MODAL — 4-step flow
  ══════════════════════════════════════════════════════════ */
  function initModal() {
    const overlay = $('#booking-modal');
    if (!overlay) return;

    const sheet     = $('.modal-sheet', overlay);
    const closeBtn  = $('#modal-close');
    const nextBtn   = $('#modal-next');
    const backBtn   = $('#modal-back');
    const footer    = $('#modal-footer');
    const successEl = $('#modal-success');
    const progressEl = $('#modal-progress');

    let currentStep = 1;
    const TOTAL_STEPS = 4;

    /* ─── Open modal ────────────────────────────────────── */
    function openModal() {
      overlay.classList.add('open');
      setAttr(overlay, { 'aria-hidden': 'false' });
      document.body.style.overflow = 'hidden';
      // Focus the sheet for accessibility
      sheet.setAttribute('tabindex', '-1');
      sheet.focus();
      goToStep(1);
    }

    /* ─── Close modal ───────────────────────────────────── */
    function closeModal() {
      overlay.classList.remove('open');
      setAttr(overlay, { 'aria-hidden': 'true' });
      document.body.style.overflow = '';
    }

    /* ─── Triggers ──────────────────────────────────────── */
    const triggerIds = [
      'open-modal-header',
      'open-modal-hero',
      'open-modal-mobile',
      'open-modal-pricing',
      'open-modal-footer',
      'open-modal-mobilebar',
    ];

    triggerIds.forEach(id => {
      const el = $(`#${id}`);
      if (el) el.addEventListener('click', e => { e.preventDefault(); openModal(); });
    });

    // Close button
    closeBtn.addEventListener('click', closeModal);

    // Click outside the sheet
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    // Success close
    const successClose = $('#modal-success-close');
    if (successClose) successClose.addEventListener('click', closeModal);

    /* ─── Step navigation ───────────────────────────────── */
    function goToStep(step) {
      currentStep = step;

      // Toggle step panels
      for (let i = 1; i <= TOTAL_STEPS; i++) {
        const panel = $(`#step-${i}`);
        if (panel) {
          panel.classList.toggle('active', i === step);
        }
      }

      // Update progress dots
      $$('.modal-step-dot', progressEl).forEach(dot => {
        const dotStep = parseInt(dot.dataset.step, 10);
        dot.classList.toggle('active', dotStep === step);
        dot.classList.toggle('done', dotStep < step);
      });

      // Update progress lines
      $$('.modal-step-line', progressEl).forEach(line => {
        const lineNum = parseInt(line.dataset.line, 10);
        line.classList.toggle('done', lineNum < step);
      });

      // Update progress bar aria
      setAttr(progressEl, { 'aria-valuenow': step });

      // Back button visibility
      backBtn.style.display = step > 1 ? 'inline-flex' : 'none';

      // Next button label
      if (step === TOTAL_STEPS) {
        nextBtn.innerHTML = `Submit Enquiry <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M1 4l3 3 5-5"/></svg>`;
      } else {
        nextBtn.innerHTML = `Continue <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`;
      }

      // Reset scroll
      const activeBody = $(`#step-${step}`);
      if (activeBody) activeBody.scrollTop = 0;
    }

    nextBtn.addEventListener('click', () => {
      if (currentStep < TOTAL_STEPS) {
        if (validateStep(currentStep)) {
          goToStep(currentStep + 1);
        }
      } else {
        // Final step — submit
        if (validateStep(currentStep)) {
          submitEnquiry();
        }
      }
    });

    backBtn.addEventListener('click', () => {
      if (currentStep > 1) goToStep(currentStep - 1);
    });

    /* ─── Validation ────────────────────────────────────── */
    function validateStep(step) {
      let valid = true;

      if (step === 1) {
        // No required fields on step 1 (package confirmation)
        return true;
      }

      if (step === 2) {
        const location = $('#location');
        const date = $('#appt-date');
        const time = $('#appt-time');

        if (!location?.value) {
          showError('field-location');
          valid = false;
        } else clearError('field-location');

        if (!date?.value) {
          showError('field-date');
          valid = false;
        } else clearError('field-date');

        if (!time?.value) {
          showError('field-time');
          valid = false;
        } else clearError('field-time');
      }

      if (step === 3) {
        const fields = [
          { id: 'field-fname', inputId: 'fname' },
          { id: 'field-lname', inputId: 'lname' },
          { id: 'field-phone', inputId: 'phone' },
          { id: 'field-dob', inputId: 'dob' },
          { id: 'field-sex', inputId: 'sex' },
        ];

        fields.forEach(f => {
          const input = $(`#${f.inputId}`);
          if (!input?.value?.trim()) {
            showError(f.id);
            valid = false;
          } else {
            clearError(f.id);
          }
        });

        // Email validation
        const email = $('#email');
        const emailField = $('#field-email');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!email?.value || !emailPattern.test(email.value.trim())) {
          showError('field-email');
          valid = false;
        } else {
          clearError('field-email');
        }

        // Age validation (must be 18+)
        if ($('#dob')?.value) {
          const dob = new Date($('#dob').value);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear() -
            ((today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0);
          if (age < 18) {
            showError('field-dob', 'You must be 18 or older to book this test');
            valid = false;
          }
        }
      }

      if (step === 4) {
        const terms = $('#consent-terms');
        const age = $('#consent-age');

        if (!terms?.checked) {
          $('#label-terms')?.classList.add('has-error');
          valid = false;
        } else {
          $('#label-terms')?.classList.remove('has-error');
        }

        if (!age?.checked) {
          $('#label-age')?.classList.add('has-error');
          valid = false;
        } else {
          $('#label-age')?.classList.remove('has-error');
        }
      }

      if (!valid) {
        // Scroll to first error
        const firstError = overlay.querySelector('.has-error, .field.has-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return valid;
    }

    function showError(fieldId, customMsg) {
      const field = $(`#${fieldId}`);
      if (!field) return;
      field.classList.add('has-error');
      if (customMsg) {
        const errEl = $('.field-error', field);
        if (errEl) errEl.textContent = customMsg;
      }
    }

    function clearError(fieldId) {
      const field = $(`#${fieldId}`);
      if (!field) return;
      field.classList.remove('has-error');
    }

    // Real-time error clearing on input
    overlay.addEventListener('input', e => {
      const field = e.target.closest('.field');
      if (field) field.classList.remove('has-error');
    });

    overlay.addEventListener('change', e => {
      const field = e.target.closest('.field');
      if (field) field.classList.remove('has-error');
      if (e.target.id === 'consent-terms') $('#label-terms')?.classList.remove('has-error');
      if (e.target.id === 'consent-age') $('#label-age')?.classList.remove('has-error');
    });

    /* ─── Submission ────────────────────────────────────── */
    function submitEnquiry() {
      nextBtn.disabled = true;
      nextBtn.innerHTML = `<span style="opacity:0.7">Submitting…</span>`;

      // Simulate async submission (replace with real API call)
      setTimeout(() => {
        // Hide step panels and footer
        $$('.modal-step').forEach(s => s.classList.remove('active'));
        footer.style.display = 'none';
        progressEl.style.display = 'none';

        // Show success
        successEl.classList.add('show');

        nextBtn.disabled = false;
      }, 900);
    }
  }

  /* ══════════════════════════════════════════════════════════
     COOKIE CONSENT
  ══════════════════════════════════════════════════════════ */
  function initCookieConsent() {
    const bar = $('#cookie-bar');
    if (!bar) return;

    // Check if already decided
    if (localStorage.getItem('qbt-cookies')) return;

    // Show after 1.5s
    setTimeout(() => bar.classList.add('show'), 1500);

    function setConsent(type) {
      localStorage.setItem('qbt-cookies', type);
      bar.classList.remove('show');
    }

    $('#cookie-accept')?.addEventListener('click', () => setConsent('all'));
    $('#cookie-essential')?.addEventListener('click', () => setConsent('essential'));
  }

  /* ══════════════════════════════════════════════════════════
     FADE-UP ANIMATIONS — IntersectionObserver
  ══════════════════════════════════════════════════════════ */
  function initFadeAnimations() {
    const els = $$('.fade-up');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: make all visible immediately
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '-40px 0px',
    });

    els.forEach(el => observer.observe(el));
  }

  /* ══════════════════════════════════════════════════════════
     COUNTER ANIMATION
  ══════════════════════════════════════════════════════════ */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length || !('IntersectionObserver' in window)) return;

    function animateCounter(el) {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();

      // Find the suffix element if it exists
      const suffixEl = el.querySelector('.stat-suffix');

      function tick(now) {
        const elapsed = Math.min((now - start) / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const current = Math.round(eased * target);

        if (suffixEl) {
          el.childNodes[0].textContent = current;
        } else {
          el.textContent = current + suffix;
        }

        if (elapsed < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* ══════════════════════════════════════════════════════════
     SCROLL UTILITIES — back to top, mobile bar
  ══════════════════════════════════════════════════════════ */
  function initScrollUtilities() {
    const backTop = $('#back-top');
    const mobileBar = $('#mobile-book-bar');
    const pricingSection = $('#pricing');

    function onScroll() {
      const y = window.scrollY;

      // Back to top button
      if (backTop) {
        if (y > 400) {
          backTop.classList.add('show');
        } else {
          backTop.classList.remove('show');
        }
      }

      // Mobile booking bar — shows after passing pricing section, or after 400px
      if (mobileBar) {
        const threshold = pricingSection
          ? pricingSection.getBoundingClientRect().bottom + y
          : 400;

        if (y > threshold || y > 500) {
          mobileBar.classList.add('show');
          mobileBar.setAttribute('aria-hidden', 'false');
        } else {
          mobileBar.classList.remove('show');
          mobileBar.setAttribute('aria-hidden', 'true');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Back to top click
    backTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════════════════
     DATE CONSTRAINTS — min = tomorrow, max = 1 year
  ══════════════════════════════════════════════════════════ */
  function initDateConstraints() {
    const apptDate = $('#appt-date');
    if (apptDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      apptDate.min = tomorrow.toISOString().split('T')[0];

      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      apptDate.max = maxDate.toISOString().split('T')[0];
    }

    const dobField = $('#dob');
    if (dobField) {
      const maxDob = new Date();
      maxDob.setFullYear(maxDob.getFullYear() - 18);
      dobField.max = maxDob.toISOString().split('T')[0];

      const minDob = new Date();
      minDob.setFullYear(minDob.getFullYear() - 110);
      dobField.min = minDob.toISOString().split('T')[0];
    }
  }

  /* ══════════════════════════════════════════════════════════
     NAV ACTIVE STATE — highlight nav link for current section
  ══════════════════════════════════════════════════════════ */
  function initNavActiveState() {
    const navLinks = $$('.header-nav a');
    const sections = navLinks
      .map(link => {
        const id = link.getAttribute('href')?.replace('#', '');
        return id ? { link, section: $(`#${id}`) } : null;
      })
      .filter(Boolean);

    if (!sections.length) return;

    function updateActive() {
      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '68',
        10
      );
      const scrollY = window.scrollY + headerH + 40;

      let current = sections[0];
      sections.forEach(({ link, section }) => {
        if (section && section.offsetTop <= scrollY) {
          current = { link, section };
        }
      });

      navLinks.forEach(l => l.removeAttribute('aria-current'));
      if (current?.link) {
        current.link.setAttribute('aria-current', 'location');
      }
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

})();
