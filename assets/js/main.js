/* ============================================================
   QUANTUM BIOTESTING — main.js
   Header · Mobile nav · Modal (2-step) · Cookie consent
   Fade animations · Counter animation · Scroll utilities
   ============================================================ */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function setAttr(el, attrs) {
    if (!el) return;
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }

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
     HEADER
  ══════════════════════════════════════════════════════════ */
  function initHeader() {
    const header = $('#site-header');
    if (!header) return;

    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════════════════════════════════════════════════════
     MOBILE NAV
  ══════════════════════════════════════════════════════════ */
  function initMobileNav() {
    const toggle = $('#menu-toggle');
    const nav    = $('#mobile-nav');
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

    $$('.mob-link', nav).forEach(link => {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', e => {
      if (isOpen && !nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closeNav();
    });
  }

  /* ══════════════════════════════════════════════════════════
     BOOKING MODAL — 2-step flow
  ══════════════════════════════════════════════════════════ */
  function initModal() {
    const overlay    = $('#booking-modal');
    if (!overlay) return;

    const sheet      = $('.modal-sheet', overlay);
    const closeBtn   = $('#modal-close');
    const nextBtn    = $('#modal-next');
    const backBtn    = $('#modal-back');
    const modalFooter = $('#modal-footer');
    const successEl  = $('#modal-success');
    const progressEl = $('#modal-progress');

    const TOTAL_STEPS = 2;
    let currentStep = 1;

    /* ─── Open / Close ──────────────────────────────────── */
    function openModal() {
      overlay.classList.add('open');
      setAttr(overlay, { 'aria-hidden': 'false' });
      document.body.style.overflow = 'hidden';
      sheet.setAttribute('tabindex', '-1');
      sheet.focus();
      goToStep(1);
    }

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
      'open-modal-footer2',
      'open-modal-mobilebar',
    ];

    triggerIds.forEach(id => {
      const el = $(`#${id}`);
      if (el) el.addEventListener('click', e => { e.preventDefault(); openModal(); });
    });

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
    });

    const successClose = $('#modal-success-close');
    if (successClose) successClose.addEventListener('click', closeModal);

    /* ─── Step navigation ───────────────────────────────── */
    function goToStep(step) {
      currentStep = step;

      // Show/hide step panels
      for (let i = 1; i <= TOTAL_STEPS; i++) {
        const panel = $(`#step-${i}`);
        if (panel) panel.classList.toggle('active', i === step);
      }

      // Update progress dots
      $$('.step-dot', progressEl).forEach(dot => {
        const dotStep = parseInt(dot.dataset.step, 10);
        dot.classList.toggle('active', dotStep === step);
        dot.classList.toggle('done', dotStep < step);
      });

      setAttr(progressEl, { 'aria-valuenow': step });

      // Back button
      if (backBtn) backBtn.style.display = step > 1 ? 'inline-flex' : 'none';

      // Next/submit label
      if (nextBtn) {
        if (step === TOTAL_STEPS) {
          nextBtn.innerHTML = `Send Enquiry <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M1 4l3 3 5-5"/></svg>`;
        } else {
          nextBtn.innerHTML = `Continue <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`;
        }
      }

      // Scroll sheet back to top
      sheet.scrollTop = 0;
    }

    nextBtn.addEventListener('click', () => {
      if (currentStep < TOTAL_STEPS) {
        if (validateStep(currentStep)) goToStep(currentStep + 1);
      } else {
        if (validateStep(currentStep)) submitEnquiry();
      }
    });

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (currentStep > 1) goToStep(currentStep - 1);
      });
    }

    /* ─── Validation ────────────────────────────────────── */
    function showError(fieldId, msg) {
      const field = $(`#${fieldId}`);
      if (!field) return;
      const control = field.querySelector('.form-control') || field;
      const errorEl = field.querySelector('.form-error');
      control.classList.add('has-error');
      if (errorEl && msg) errorEl.textContent = msg;
    }

    function clearError(fieldId) {
      const field = $(`#${fieldId}`);
      if (!field) return;
      const control = field.querySelector('.form-control') || field;
      const errorEl = field.querySelector('.form-error');
      control.classList.remove('has-error');
      if (errorEl) errorEl.textContent = errorEl.getAttribute('data-default') || errorEl.textContent;
    }

    function getVal(id) {
      const el = $(`#${id}`);
      return el ? el.value.trim() : '';
    }

    function validateStep(step) {
      let valid = true;
      const firstErrors = [];

      function fail(fieldId, msg) {
        showError(fieldId, msg);
        firstErrors.push(fieldId);
        valid = false;
      }

      if (step === 1) {
        // clinic location required
        if (!getVal('clinic-location')) {
          fail('field-location', 'Please select a preferred location');
        } else clearError('field-location');

        // date required
        if (!getVal('appt-date')) {
          fail('field-date', 'Please select a preferred date');
        } else clearError('field-date');
      }

      if (step === 2) {
        // First name
        if (!getVal('fname')) {
          fail('field-fname', 'Please enter your first name');
        } else clearError('field-fname');

        // Last name
        if (!getVal('lname')) {
          fail('field-lname', 'Please enter your last name');
        } else clearError('field-lname');

        // Email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const emailVal = getVal('email');
        if (!emailVal || !emailPattern.test(emailVal)) {
          fail('field-email', 'Please enter a valid email address');
        } else clearError('field-email');

        // Phone
        if (!getVal('phone')) {
          fail('field-phone', 'Please enter your phone number');
        } else clearError('field-phone');

        // Consent checkboxes
        const contactCb = $('#consent-contact');
        const termsCb   = $('#consent-terms');

        if (!contactCb?.checked) {
          contactCb?.classList.add('has-error');
          valid = false;
        } else {
          contactCb?.classList.remove('has-error');
        }

        if (!termsCb?.checked) {
          termsCb?.classList.add('has-error');
          valid = false;
        } else {
          termsCb?.classList.remove('has-error');
        }
      }

      // Scroll to first error
      if (firstErrors.length > 0) {
        const firstErrorEl = $(`#${firstErrors[0]}`);
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      return valid;
    }

    /* ─── Submit ────────────────────────────────────────── */
    function submitEnquiry() {
      if (nextBtn) nextBtn.disabled = true;

      setTimeout(() => {
        // Hide steps and footer, show success
        for (let i = 1; i <= TOTAL_STEPS; i++) {
          const panel = $(`#step-${i}`);
          if (panel) panel.classList.remove('active');
        }

        const progressBar = $('#modal-progress');
        if (progressBar) progressBar.style.display = 'none';

        if (modalFooter) modalFooter.style.display = 'none';

        if (successEl) {
          successEl.classList.add('show');
          successEl.focus();
        }

        if (nextBtn) nextBtn.disabled = false;
      }, 900);
    }
  }

  /* ══════════════════════════════════════════════════════════
     COOKIE CONSENT
  ══════════════════════════════════════════════════════════ */
  function initCookieConsent() {
    const bar       = $('#cookie-bar');
    const acceptBtn = $('#cookie-accept');
    const essBtn    = $('#cookie-essential');

    if (!bar) return;

    const STORAGE_KEY = 'qbt-cookies';

    if (localStorage.getItem(STORAGE_KEY)) return;

    setTimeout(() => {
      bar.classList.add('show');
    }, 1500);

    function dismiss() {
      bar.classList.remove('show');
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, 'all');
        dismiss();
      });
    }

    if (essBtn) {
      essBtn.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, 'essential');
        dismiss();
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     FADE ANIMATIONS
  ══════════════════════════════════════════════════════════ */
  function initFadeAnimations() {
    const elements = $$('.fade-up');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '-40px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }

  /* ══════════════════════════════════════════════════════════
     COUNTER ANIMATION
  ══════════════════════════════════════════════════════════ */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const observed = new Set();

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (observed.has(el)) return;
        observed.add(el);
        observer.unobserve(el);

        const target   = parseInt(el.dataset.count, 10);
        const duration = 1100;
        const start    = performance.now();

        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

        // Grab any child elements that should be preserved (sub, span)
        const children = Array.from(el.children);

        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const value    = Math.round(easeOut(progress) * target);

          // Set only the first text node, preserving child elements
          const textNode = el.childNodes[0];
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = value;
          } else {
            // Fallback: prepend a text node
            el.insertBefore(document.createTextNode(value), el.firstChild);
          }

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            const finalText = el.childNodes[0];
            if (finalText && finalText.nodeType === Node.TEXT_NODE) {
              finalText.textContent = target;
            }
          }
        }

        requestAnimationFrame(update);
      });
    }, { threshold: 0.4 });

    counters.forEach(el => observer.observe(el));
  }

  /* ══════════════════════════════════════════════════════════
     SCROLL UTILITIES
  ══════════════════════════════════════════════════════════ */
  function initScrollUtilities() {
    const backTop    = $('#back-top');
    const mobileBar  = $('#mobile-book-bar');
    const pricing    = $('#pricing');

    let mobileBarShown = false;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;

      // Back to top
      if (backTop) backTop.classList.toggle('show', y > 400);

      // Mobile booking bar — show after pricing section enters view
      if (mobileBar && pricing) {
        const pricingTop = pricing.getBoundingClientRect().top;
        if (pricingTop < window.innerHeight * 0.6 && !mobileBarShown) {
          mobileBar.classList.add('show');
          mobileBar.setAttribute('aria-hidden', 'false');
          mobileBarShown = true;
        }
      }
    }, { passive: true });

    if (backTop) {
      backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     DATE CONSTRAINTS
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
  }

  /* ══════════════════════════════════════════════════════════
     NAV ACTIVE STATE
  ══════════════════════════════════════════════════════════ */
  function initNavActiveState() {
    const navLinks = $$('.header-nav a');
    const sections = navLinks
      .map(l => ({ link: l, section: document.querySelector(l.getAttribute('href')) }))
      .filter(item => item.section);

    if (!sections.length) return;

    function updateActive() {
      const y = window.scrollY + 100;
      let current = sections[0];
      sections.forEach(item => {
        if (item.section.offsetTop <= y) current = item;
      });

      navLinks.forEach(l => l.removeAttribute('aria-current'));
      if (current) current.link.setAttribute('aria-current', 'location');
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

})();
