/**
 * Quantum BioTesting — Main JavaScript
 * Handles: nav scroll, mobile menu, scroll animations,
 *          booking form validation, sticky CTA, footer year
 */

'use strict';

// ── Constants ──────────────────────────────────────────────────
const NAV_SCROLL_THRESHOLD = 10;

// ── DOM Ready ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initMobileMenu();
  initScrollAnimations();
  initBookingForm();
  initStickyCTA();
  setFooterYear();
  setMinBookingDate();
});

// ── Navigation Scroll ──────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > NAV_SCROLL_THRESHOLD) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once on load
}

// ── Mobile Menu ────────────────────────────────────────────────
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close when a nav link is clicked
  const menuLinks = mobileMenu.querySelectorAll('a');
  menuLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click / overlay tap
  document.addEventListener('click', function (e) {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });
}

// ── Scroll Animations (Intersection Observer) ──────────────────
function initScrollAnimations() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  // Bail out if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

// ── Booking Form ───────────────────────────────────────────────
function initBookingForm() {
  const form = document.getElementById('booking-form');
  const successMsg = document.getElementById('booking-success');
  if (!form || !successMsg) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validateForm(form)) return;

    // Disable submit button to prevent double-submission
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
    }

    // Simulate async submission (replace with real API call)
    setTimeout(function () {
      form.style.display = 'none';
      successMsg.classList.add('show');
      window.scrollTo({ top: successMsg.getBoundingClientRect().top + window.scrollY - 160, behavior: 'smooth' });
    }, 800);
  });
}

function validateForm(form) {
  let isValid = true;

  // Clear previous errors
  form.querySelectorAll('.form-error').forEach(function (el) {
    el.style.display = 'none';
    el.textContent = '';
  });
  form.querySelectorAll('.form-control').forEach(function (el) {
    el.classList.remove('error');
  });

  // First Name
  const firstName = form.querySelector('#first-name');
  if (firstName && !firstName.value.trim()) {
    showError('error-firstName', firstName, 'Please enter your first name.');
    isValid = false;
  }

  // Last Name
  const lastName = form.querySelector('#last-name');
  if (lastName && !lastName.value.trim()) {
    showError('error-lastName', lastName, 'Please enter your last name.');
    isValid = false;
  }

  // Email
  const email = form.querySelector('#email');
  if (email) {
    if (!email.value.trim()) {
      showError('error-email', email, 'Please enter your email address.');
      isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError('error-email', email, 'Please enter a valid email address.');
      isValid = false;
    }
  }

  // Phone
  const phone = form.querySelector('#phone');
  if (phone) {
    if (!phone.value.trim()) {
      showError('error-phone', phone, 'Please enter your phone number.');
      isValid = false;
    } else if (!isValidUKPhone(phone.value.trim())) {
      showError('error-phone', phone, 'Please enter a valid UK phone number.');
      isValid = false;
    }
  }

  // Location
  const location = form.querySelector('#location');
  if (location && !location.value) {
    showError('error-location', location, 'Please select a clinic location.');
    isValid = false;
  }

  // Date
  const date = form.querySelector('#date');
  if (date) {
    if (!date.value) {
      showError('error-date', date, 'Please select a preferred date.');
      isValid = false;
    } else {
      const selected = new Date(date.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        showError('error-date', date, 'Please select a date in the future.');
        isValid = false;
      }
    }
  }

  // Consent
  const consent = form.querySelector('#consent');
  if (consent && !consent.checked) {
    const errorEl = document.getElementById('error-consent');
    if (errorEl) {
      errorEl.textContent = 'You must agree to our Privacy Policy and Terms & Conditions to proceed.';
      errorEl.style.display = 'block';
    }
    isValid = false;
  }

  // Scroll to first error
  if (!isValid) {
    const firstError = form.querySelector('.form-control.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }

  return isValid;
}

function showError(errorId, inputEl, message) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
  if (inputEl) {
    inputEl.classList.add('error');
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUKPhone(phone) {
  // UK phone: 07xxx, 08xxx, 01xxx, 02xxx with or without spaces
  return /^(\+?44|0)[\s\d]{9,12}$/.test(phone.replace(/[\s\-().]/g, ''));
}

// ── Set minimum booking date ───────────────────────────────────
function setMinBookingDate() {
  const dateInput = document.getElementById('date');
  if (!dateInput) return;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.min = tomorrow.toISOString().split('T')[0];
}

// ── Sticky CTA Bar ────────────────────────────────────────────
function initStickyCTA() {
  const stickyCTA = document.getElementById('sticky-cta');
  const footer = document.querySelector('.site-footer');
  if (!stickyCTA) return;

  function onScroll() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    // Show after scrolling 300px
    if (scrollY > 300) {
      stickyCTA.classList.add('visible');
    } else {
      stickyCTA.classList.remove('visible');
    }

    // Hide when footer is visible
    if (footer) {
      const footerTop = footer.getBoundingClientRect().top;
      if (footerTop < windowH) {
        stickyCTA.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Footer Year ────────────────────────────────────────────────
function setFooterYear() {
  const yearEls = document.querySelectorAll('#footer-year');
  const currentYear = new Date().getFullYear();
  yearEls.forEach(function (el) {
    el.textContent = currentYear;
  });
}
