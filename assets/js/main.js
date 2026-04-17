/* ============================================================
   QUANTUM BIOTESTING — main.js
   Nav · Drawer · Modal (2-step) · Cookie · Counters · Utils
   ============================================================ */
(function () {
  'use strict';

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initNav();
    initDrawer();
    initModal();
    initCookie();
    initCounters();
    initFadeUp();
    initScrollUtils();
    initDateConstraints();
    initNavActive();
  }

  /* ── NAV SCROLL ─────────────────────────────────────────── */
  function initNav() {
    const nav = $('#site-nav');
    if (!nav) return;
    function tick() {
      nav.classList.toggle('elevated', window.scrollY > 12);
    }
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ── DRAWER ─────────────────────────────────────────────── */
  function initDrawer() {
    const burger  = $('#menu-toggle');
    const drawer  = $('#nav-drawer');
    const overlay = $('#drawer-overlay');
    const closeBtn = $('#drawer-close');
    if (!burger || !drawer) return;

    let open = false;

    function openDrawer() {
      open = true;
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      burger.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      open = false;
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', () => open ? closeDrawer() : openDrawer());
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    $$('.drawer-a', drawer).forEach(a => a.addEventListener('click', closeDrawer));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && open) closeDrawer();
    });
  }

  /* ── MODAL ──────────────────────────────────────────────── */
  function initModal() {
    const overlay = $('#booking-modal');
    if (!overlay) return;

    const box        = $('.modal-box', overlay);
    const closeBtn   = $('#modal-close');
    const nextBtn    = $('#modal-next');
    const backBtn    = $('#modal-back');
    const footerEl   = $('#modal-footer');
    const successEl  = $('#modal-success');
    const progressEl = $('#modal-progress');

    const STEPS = 2;
    let step = 1;

    /* open / close */
    function open() {
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (box) { box.setAttribute('tabindex', '-1'); box.focus(); }
      goTo(1);
    }

    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    /* triggers */
    const triggerIds = [
      'open-modal-header',
      'open-modal-hero',
      'open-modal-mobile',
      'open-modal-pricing',
      'open-modal-footer',
      'open-modal-footer2',
      'open-modal-mobilebar',
      'open-modal-reports',
    ];
    triggerIds.forEach(id => {
      const el = $(`#${id}`);
      if (el) el.addEventListener('click', e => { e.preventDefault(); open(); });
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });

    const successClose = $('#modal-success-close');
    if (successClose) successClose.addEventListener('click', close);

    /* step navigation */
    function goTo(n) {
      step = n;

      for (let i = 1; i <= STEPS; i++) {
        const panel = $(`#step-${i}`);
        if (panel) panel.classList.toggle('active', i === n);

        const progStep = $(`#prog-step-${i}`);
        if (progStep) progStep.classList.toggle('active', i === n);

        const dot = $(`.mp-dot[data-step="${i}"]`, progressEl);
        if (dot) {
          dot.classList.toggle('active', i === n);
          dot.classList.toggle('done', i < n);
        }
      }

      if (progressEl) progressEl.setAttribute('aria-valuenow', n);
      if (backBtn) backBtn.style.display = n > 1 ? 'inline-flex' : 'none';

      if (nextBtn) {
        nextBtn.innerHTML = n === STEPS
          ? 'Send Enquiry <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 8.5l3 3 7-7"/></svg>'
          : 'Continue <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
      }

      if (box) box.scrollTop = 0;
    }

    /* validation */
    function markErr(id, show) {
      const el = $(`#${id}`);
      if (el) el.classList.toggle('has-err', show);
    }

    function validateStep(n) {
      let ok = true;
      if (n === 1) {
        const loc = $('#clinic-location');
        const dt  = $('#appt-date');
        if (!loc || !loc.value) { markErr('field-location', true); ok = false; } else markErr('field-location', false);
        if (!dt  || !dt.value)  { markErr('field-date', true);     ok = false; } else markErr('field-date', false);
      }
      if (n === 2) {
        const checks = [
          ['fname',  'field-fname',  v => v.trim().length > 0],
          ['lname',  'field-lname',  v => v.trim().length > 0],
          ['email',  'field-email',  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
          ['phone',  'field-phone',  v => v.trim().length > 6],
        ];
        checks.forEach(([id, wrapId, test]) => {
          const el = $(`#${id}`);
          const pass = el && test(el.value);
          markErr(wrapId, !pass);
          if (!pass) ok = false;
        });
        const cc = $('#consent-contact');
        const ct = $('#consent-terms');
        if (!cc || !cc.checked) ok = false;
        if (!ct || !ct.checked) ok = false;
      }
      return ok;
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!validateStep(step)) return;
        if (step < STEPS) {
          goTo(step + 1);
        } else {
          /* final submit */
          if (footerEl) footerEl.style.display = 'none';
          if (successEl) successEl.classList.add('active');
          for (let i = 1; i <= STEPS; i++) {
            const p = $(`#step-${i}`);
            if (p) p.classList.remove('active');
          }
          const bodyEl = $('.modal-body', overlay);
          if (bodyEl) bodyEl.style.display = 'none';
          const progCont = $('.modal-prog', overlay);
          if (progCont) progCont.style.display = 'none';
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (step > 1) goTo(step - 1);
      });
    }
  }

  /* ── COOKIE ─────────────────────────────────────────────── */
  function initCookie() {
    const bar    = $('#cookie-bar');
    const accept = $('#cookie-accept');
    const ess    = $('#cookie-essential');
    if (!bar) return;

    const KEY = 'qbt-cookie';
    if (localStorage.getItem(KEY)) return;

    setTimeout(() => bar.classList.add('show'), 1600);

    function dismiss() { bar.classList.remove('show'); }

    if (accept) accept.addEventListener('click', () => { localStorage.setItem(KEY, 'all'); dismiss(); });
    if (ess)    ess.addEventListener('click',    () => { localStorage.setItem(KEY, 'ess'); dismiss(); });
  }

  /* ── COUNTERS ───────────────────────────────────────────── */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length) return;

    const seen = new WeakSet();

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (seen.has(el)) return;
        seen.add(el);
        obs.unobserve(el);

        const target = parseInt(el.dataset.count, 10);
        const dur    = 1100;
        const t0     = performance.now();
        function ease(t) { return 1 - Math.pow(1 - t, 3); }

        function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const v = Math.round(ease(p) * target);
          // Only update first text node to preserve child elements (sub, em etc)
          const tn = el.childNodes[0];
          if (tn && tn.nodeType === Node.TEXT_NODE) {
            tn.textContent = v;
          } else {
            el.textContent = v;
          }
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    els.forEach(el => obs.observe(el));
  }

  /* ── FADE UP ────────────────────────────────────────────── */
  function initFadeUp() {
    const els = $$('.fade-up');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '-40px 0px' });

    els.forEach(el => obs.observe(el));
  }

  /* ── SCROLL UTILITIES ───────────────────────────────────── */
  function initScrollUtils() {
    const backTop    = $('#back-top');
    const mobileBar  = $('#mobile-book-bar');
    const pricing    = $('#pricing');
    let barShown = false;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (backTop) backTop.classList.toggle('show', y > 400);
      if (mobileBar && pricing && !barShown) {
        const top = pricing.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.7) {
          mobileBar.classList.add('show');
          mobileBar.setAttribute('aria-hidden', 'false');
          barShown = true;
        }
      }
    }, { passive: true });

    if (backTop) {
      backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ── DATE CONSTRAINTS ───────────────────────────────────── */
  function initDateConstraints() {
    const d = $('#appt-date');
    if (!d) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    d.min = tomorrow.toISOString().split('T')[0];
    const max = new Date();
    max.setFullYear(max.getFullYear() + 1);
    d.max = max.toISOString().split('T')[0];
  }

  /* ── NAV ACTIVE ─────────────────────────────────────────── */
  function initNavActive() {
    const links = $$('.nav-links a');
    const sections = links
      .map(l => ({ link: l, section: $(l.getAttribute('href')) }))
      .filter(x => x.section);

    if (!sections.length) return;

    function update() {
      const y = window.scrollY + 90;
      let current = sections[0];
      sections.forEach(x => { if (x.section.offsetTop <= y) current = x; });
      links.forEach(l => l.classList.remove('active'));
      if (current) current.link.classList.add('active');
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

})();
