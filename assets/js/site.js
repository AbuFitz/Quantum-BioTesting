/* Quantum BioTesting — site behaviour
   Menu · test switcher · booking dialog · cookie notice · testing-page tools · scroll spy */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile menu ---------------------------------------------------- */
  (function menu() {
    var btn = $('#menu-btn');
    var panel = $('#menu-panel');
    if (!btn || !panel) return;
    var label = $('.menu-btn__label', btn);
    var inertTargets = $$('main, .site-footer, .cookie');
    var desktop = window.matchMedia('(min-width: 60em)');

    function set(open, restoreFocus) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (label) label.textContent = open ? 'Close' : 'Menu';
      panel.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      inertTargets.forEach(function (el) { el.inert = open; });
      if (!open && restoreFocus) btn.focus();
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    $$('a, button[data-book]', panel).forEach(function (el) { el.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) set(false, true);
    });
    var onChange = function () { if (desktop.matches) set(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else desktop.addListener(onChange);
  })();

  /* ---- Booking dialog ------------------------------------------------- */
  (function booking() {
    var dlg = $('#booking');
    var form = $('#booking-form');
    if (!dlg || !form || typeof dlg.showModal !== 'function') return;

    var panels = $$('.step-panel', form);
    var stepItems = $$('.dialog__steps li', dlg);
    var backBtn = $('#bk-back');
    var nextBtn = $('#bk-next');
    var errBox = $('#bk-error');
    var result = $('#bk-result');
    var chrome = $$('[data-chrome]', dlg);
    var step = 0;

    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var get = function (id) { return document.getElementById(id); };
    var isoDate = function (d) { return d.toISOString().slice(0, 10); };

    var rules = [
      [
        ['bk-test', function (el) { return el.value ? '' : 'Choose a health check.'; }],
        ['bk-clinic', function (el) { return el.value ? '' : 'Choose a clinic location.'; }],
        ['bk-date', function (el) {
          if (!el.value) return 'Choose a preferred date.';
          if (el.min && el.value < el.min) return 'Choose a date from tomorrow onwards.';
          if (el.max && el.value > el.max) return 'Choose a date within the next year.';
          return '';
        }]
      ],
      [
        ['bk-first', function (el) { return el.value.trim() ? '' : 'Enter your first name.'; }],
        ['bk-last', function (el) { return el.value.trim() ? '' : 'Enter your last name.'; }],
        ['bk-email', function (el) { return EMAIL.test(el.value.trim()) ? '' : 'Enter a valid email address.'; }],
        ['bk-phone', function (el) { return el.value.trim().length > 6 ? '' : 'Enter a phone number.'; }],
        ['bk-consent-contact', function (el) { return el.checked ? '' : 'Please confirm you agree to be contacted.'; }],
        ['bk-consent-terms', function (el) { return el.checked ? '' : 'Please confirm you have read the Terms and Privacy Policy.'; }]
      ]
    ];

    function wrapper(el) { return el.closest('.field, .check'); }
    function setError(el, msg) {
      var w = wrapper(el);
      var err = $('.field__err', w);
      w.classList.toggle('has-error', !!msg);
      err.textContent = msg;
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
      } else {
        el.removeAttribute('aria-invalid');
      }
    }
    function validate(n) {
      var firstBad = null;
      rules[n].forEach(function (r) {
        var el = get(r[0]);
        var msg = r[1](el);
        setError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }
    $$('input, select, textarea', form).forEach(function (el) {
      var clear = function () { if (wrapper(el) && wrapper(el).classList.contains('has-error')) setError(el, ''); };
      el.addEventListener('input', clear);
      el.addEventListener('change', clear);
    });

    function optionText(id) {
      var s = get(id);
      return s.selectedIndex > 0 ? s.options[s.selectedIndex].text : '';
    }
    function showStep(n) {
      step = n;
      panels.forEach(function (p, i) { p.hidden = i !== n; });
      stepItems.forEach(function (li, i) {
        if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.classList.toggle('is-done', i < n);
      });
      backBtn.hidden = n === 0;
      nextBtn.textContent = n === panels.length - 1 ? 'Send enquiry' : 'Continue';
      errBox.hidden = true;
      if (n === 1) {
        var d = get('bk-date').value;
        var pretty = d ? new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
        $('#bk-summary').innerHTML = '<b></b><br><span></span>';
        $('#bk-summary b').textContent = optionText('bk-test');
        $('#bk-summary span').textContent = [optionText('bk-clinic'), pretty].filter(Boolean).join(' · ');
      }
      $('.dialog__body', dlg).scrollTop = 0;
    }

    function reset() {
      form.reset();
      $$('.has-error', form).forEach(function (w) { w.classList.remove('has-error'); });
      $$('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
      result.hidden = true;
      form.hidden = false;
      chrome.forEach(function (el) { el.hidden = false; });
      showStep(0);
    }

    function open(trigger) {
      if (!result.hidden) reset();
      var now = new Date();
      var min = new Date(now); min.setDate(min.getDate() + 1);
      var max = new Date(now); max.setFullYear(max.getFullYear() + 1);
      get('bk-date').min = isoDate(min);
      get('bk-date').max = isoDate(max);
      var t = trigger && trigger.getAttribute('data-book');
      if (t === 'mens' || t === 'womens') get('bk-test').value = t;
      showStep(0);
      dlg.showModal();
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-book]');
      if (!t) return;
      e.preventDefault();
      $$('.drawer[open]').forEach(function (d) { d.close(); });
      open(t);
    });
    $('#bk-close').addEventListener('click', function () { dlg.close(); });
    $('#bk-done').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (!result.hidden) reset(); });

    backBtn.addEventListener('click', function () { if (step > 0) showStep(step - 1); });

    function payload() {
      return {
        healthCheck: get('bk-test').value,
        clinic: get('bk-clinic').value,
        preferredDate: get('bk-date').value,
        notes: get('bk-notes').value.trim(),
        firstName: get('bk-first').value.trim(),
        lastName: get('bk-last').value.trim(),
        email: get('bk-email').value.trim(),
        phone: get('bk-phone').value.trim(),
        consentContact: get('bk-consent-contact').checked,
        consentTerms: get('bk-consent-terms').checked
      };
    }
    function succeed() {
      chrome.forEach(function (el) { el.hidden = true; });
      form.hidden = true;
      result.hidden = false;
      $('h2', result).focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(step)) return;
      if (step < panels.length - 1) { showStep(step + 1); return; }

      /* Set data-endpoint on #booking-form to POST the enquiry as JSON.
         Without one, the flow completes client-side as it did before. */
      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) { succeed(); return; }
      nextBtn.disabled = true;
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); succeed(); })
        .catch(function () { errBox.hidden = false; errBox.focus(); })
        .then(function () { nextBtn.disabled = false; });
    });
  })();

  /* ---- Cookie notice -------------------------------------------------- */
  (function cookie() {
    var box = $('#cookie');
    if (!box) return;
    var KEY = 'qbt-cookie-v2';
    try { if (localStorage.getItem(KEY)) return; } catch (e) { /* storage blocked: show notice each visit */ }
    box.classList.add('is-shown');
    $$('[data-cookie]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        try { localStorage.setItem(KEY, b.getAttribute('data-cookie')); } catch (e) { /* ignore */ }
        box.classList.remove('is-shown');
      });
    });
  })();

  /* ---- Test details drawers -------------------------------------------- */
  (function drawers() {
    $$('[data-details]').forEach(function (trigger) {
      var dlg = document.getElementById('details-' + trigger.getAttribute('data-details'));
      if (!dlg || typeof dlg.showModal !== 'function') return;
      trigger.addEventListener('click', function () { dlg.showModal(); });
      $('[data-close]', dlg).addEventListener('click', function () { dlg.close(); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    });
  })();

  /* ---- Booking dialog ------------------------------------------------- */
  (function booking() {
    var dlg = $('#booking');
    var form = $('#booking-form');
    if (!dlg || !form || typeof dlg.showModal !== 'function') return;

    var panels = $$('.step-panel', form);
    var stepItems = $$('.dialog__steps li', dlg);
    var backBtn = $('#bk-back');
    var nextBtn = $('#bk-next');
    var errBox = $('#bk-error');
    var result = $('#bk-result');
    var chrome = $$('[data-chrome]', dlg);
    var step = 0;

    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var get = function (id) { return document.getElementById(id); };
    var isoDate = function (d) { return d.toISOString().slice(0, 10); };

    var rules = [
      [
        ['bk-test', function (el) { return el.value ? '' : 'Choose a health check.'; }],
        ['bk-clinic', function (el) { return el.value ? '' : 'Choose a clinic location.'; }],
        ['bk-date', function (el) {
          if (!el.value) return 'Choose a preferred date.';
          if (el.min && el.value < el.min) return 'Choose a date from tomorrow onwards.';
          if (el.max && el.value > el.max) return 'Choose a date within the next year.';
          return '';
        }]
      ],
      [
        ['bk-first', function (el) { return el.value.trim() ? '' : 'Enter your first name.'; }],
        ['bk-last', function (el) { return el.value.trim() ? '' : 'Enter your last name.'; }],
        ['bk-email', function (el) { return EMAIL.test(el.value.trim()) ? '' : 'Enter a valid email address.'; }],
        ['bk-phone', function (el) { return el.value.trim().length > 6 ? '' : 'Enter a phone number.'; }],
        ['bk-consent-contact', function (el) { return el.checked ? '' : 'Please confirm you agree to be contacted.'; }],
        ['bk-consent-terms', function (el) { return el.checked ? '' : 'Please confirm you have read the Terms and Privacy Policy.'; }]
      ]
    ];

    function wrapper(el) { return el.closest('.field, .check'); }
    function setError(el, msg) {
      var w = wrapper(el);
      var err = $('.field__err', w);
      w.classList.toggle('has-error', !!msg);
      err.textContent = msg;
      if (msg) {
        el.setAttribute('aria-invalid', 'true');
      } else {
        el.removeAttribute('aria-invalid');
      }
    }
    function validate(n) {
      var firstBad = null;
      rules[n].forEach(function (r) {
        var el = get(r[0]);
        var msg = r[1](el);
        setError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }
    $$('input, select, textarea', form).forEach(function (el) {
      var clear = function () { if (wrapper(el) && wrapper(el).classList.contains('has-error')) setError(el, ''); };
      el.addEventListener('input', clear);
      el.addEventListener('change', clear);
    });

    function optionText(id) {
      var s = get(id);
      return s.selectedIndex > 0 ? s.options[s.selectedIndex].text : '';
    }
    function showStep(n) {
      step = n;
      panels.forEach(function (p, i) { p.hidden = i !== n; });
      stepItems.forEach(function (li, i) {
        if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.classList.toggle('is-done', i < n);
      });
      backBtn.hidden = n === 0;
      nextBtn.textContent = n === panels.length - 1 ? 'Send enquiry' : 'Continue';
      errBox.hidden = true;
      if (n === 1) {
        var d = get('bk-date').value;
        var pretty = d ? new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
        $('#bk-summary').innerHTML = '<b></b><br><span></span>';
        $('#bk-summary b').textContent = optionText('bk-test');
        $('#bk-summary span').textContent = [optionText('bk-clinic'), pretty].filter(Boolean).join(' · ');
      }
      $('.dialog__body', dlg).scrollTop = 0;
    }

    function reset() {
      form.reset();
      $$('.has-error', form).forEach(function (w) { w.classList.remove('has-error'); });
      $$('[aria-invalid]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); });
      result.hidden = true;
      form.hidden = false;
      chrome.forEach(function (el) { el.hidden = false; });
      showStep(0);
    }

    function open(trigger) {
      if (!result.hidden) reset();
      var now = new Date();
      var min = new Date(now); min.setDate(min.getDate() + 1);
      var max = new Date(now); max.setFullYear(max.getFullYear() + 1);
      get('bk-date').min = isoDate(min);
      get('bk-date').max = isoDate(max);
      var t = trigger && trigger.getAttribute('data-book');
      if (t === 'mens' || t === 'womens') get('bk-test').value = t;
      showStep(0);
      dlg.showModal();
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-book]');
      if (!t) return;
      e.preventDefault();
      $$('.drawer[open]').forEach(function (d) { d.close(); });
      open(t);
    });
    $('#bk-close').addEventListener('click', function () { dlg.close(); });
    $('#bk-done').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (!result.hidden) reset(); });

    backBtn.addEventListener('click', function () { if (step > 0) showStep(step - 1); });

    function payload() {
      return {
        healthCheck: get('bk-test').value,
        clinic: get('bk-clinic').value,
        preferredDate: get('bk-date').value,
        notes: get('bk-notes').value.trim(),
        firstName: get('bk-first').value.trim(),
        lastName: get('bk-last').value.trim(),
        email: get('bk-email').value.trim(),
        phone: get('bk-phone').value.trim(),
        consentContact: get('bk-consent-contact').checked,
        consentTerms: get('bk-consent-terms').checked
      };
    }
    function succeed() {
      chrome.forEach(function (el) { el.hidden = true; });
      form.hidden = true;
      result.hidden = false;
      $('h2', result).focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(step)) return;
      if (step < panels.length - 1) { showStep(step + 1); return; }

      /* Set data-endpoint on #booking-form to POST the enquiry as JSON.
         Without one, the flow completes client-side as it did before. */
      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint) { succeed(); return; }
      nextBtn.disabled = true;
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); succeed(); })
        .catch(function () { errBox.hidden = false; errBox.focus(); })
        .then(function () { nextBtn.disabled = false; });
    });
  })();

  /* ---- Cookie notice -------------------------------------------------- */
  (function cookie() {
    var box = $('#cookie');
    if (!box) return;
    var KEY = 'qbt-cookie-v2';
    try { if (localStorage.getItem(KEY)) return; } catch (e) { /* storage blocked: show notice each visit */ }
    box.classList.add('is-shown');
    $$('[data-cookie]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        try { localStorage.setItem(KEY, b.getAttribute('data-cookie')); } catch (e) { /* ignore */ }
        box.classList.remove('is-shown');
      });
    });
  })();

  /* ---- Test switcher (phones: one test at a time) --------------------- */
  (function choose() {
    var canvas = $('.canvas');
    var tabs = $$('.switch [role="tab"]');
    if (!canvas || !tabs.length) return;
    var mq = window.matchMedia('(max-width: 51.99em)');
    var keys = ['mens', 'womens'];

    function select(key, focus) {
      canvas.setAttribute('data-active', key);
      tabs.forEach(function (t) {
        var on = t.id === 'tab-' + key;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
    }
    function roles() {
      keys.forEach(function (k) {
        var panel = document.getElementById('half-' + k);
        if (mq.matches) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'tab-' + k); }
        else { panel.removeAttribute('role'); panel.setAttribute('aria-labelledby', 't-' + k); }
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(keys[i]); });
      t.addEventListener('keydown', function (e) {
        var next = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!next) return;
        e.preventDefault();
        select(keys[(i + next + keys.length) % keys.length], true);
      });
    });
    if (mq.addEventListener) mq.addEventListener('change', roles); else mq.addListener(roles);
    roles();
  })();

  /* ---- Testing page: open anchored category, expand all --------------- */
  (function categories() {
    var cats = $$('.cat');
    if (!cats.length) return;

    function openFromHash() {
      var id = decodeURIComponent(location.hash.slice(1));
      var el = id && document.getElementById(id);
      if (el && el.classList.contains('cat')) {
        el.open = true;
        el.scrollIntoView({ block: 'start' });
      }
    }
    window.addEventListener('hashchange', openFromHash);
    openFromHash();

    $$('[data-jump]').forEach(function (a) {
      a.addEventListener('click', function () {
        var el = document.getElementById(a.getAttribute('href').slice(1));
        if (el && el.classList.contains('cat')) el.open = true;
      });
    });

    var toggle = $('[data-expand-all]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var expand = toggle.getAttribute('data-state') !== 'open';
        cats.forEach(function (c) { c.open = expand; });
        toggle.setAttribute('data-state', expand ? 'open' : 'closed');
        toggle.textContent = expand ? 'Collapse all categories' : 'Expand all categories';
      });
    }
  })();

  /* ---- Scroll spy (nav, sub-nav, legal contents) ---------------------- */
  (function spy() {
    if (!('IntersectionObserver' in window)) return;
    $$('[data-spy]').forEach(function (group) {
      var links = $$('a[href^="#"]', group);
      var map = {};
      links.forEach(function (a) {
        var t = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
        if (t) map[t.id] = a;
      });
      var ids = Object.keys(map);
      if (!ids.length) return;
      var current = null;
      function mark(id) {
        if (id === current) return;
        current = id;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (!id) return;
        var a = map[id];
        a.setAttribute('aria-current', 'true');
        var row = a.closest('.subnav__row');
        if (row && row.scrollWidth > row.clientWidth) {
          row.scrollTo({ left: a.offsetLeft - row.clientWidth / 2 + a.offsetWidth / 2, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }
      var visible = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
        var first = ids.filter(function (id) { return visible[id]; })[0];
        mark(first || (window.scrollY < 200 ? null : current));
      }, { rootMargin: '-18% 0px -70% 0px' });
      ids.forEach(function (id) { io.observe(document.getElementById(id)); });
    });
  })();
})();
