/**
 * main.js
 * General page wiring: the mobile navigation toggle (hamburger menu).
 * Keeps ARIA state in sync and supports click-outside / Escape to close.
 */
(function () {
  'use strict';

  var toggle = document.getElementById('nav-toggle');
  var list = document.getElementById('primary-nav-list');
  if (!toggle || !list) return;

  function openMenu() {
    list.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    list.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  toggle.addEventListener('click', function () {
    isOpen() ? closeMenu() : openMenu();
  });

  document.addEventListener('click', function (e) {
    if (isOpen() && !e.target.closest('.primary-nav')) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) {
      closeMenu();
      toggle.focus();
    }
  });

  // Close the mobile menu automatically if the viewport grows past the
  // mobile breakpoint while it's open.
  var mobileQuery = window.matchMedia('(max-width: 640px)');
  mobileQuery.addEventListener('change', function (e) {
    if (!e.matches) closeMenu();
  });
})();
