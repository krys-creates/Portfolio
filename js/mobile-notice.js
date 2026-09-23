/**
 * mobile-notice.js
 * On a phone-width screen (the same 640px breakpoint the nav's hamburger
 * menu switches on at), shows a one-time closable popup telling visitors
 * the site is built for laptop screens. Shown once per device — same
 * interaction pattern as js/image-lightbox.js: backdrop click, the close
 * button, and Escape all dismiss it.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'mobileNoticeSeen';
  var isMobile = window.matchMedia('(max-width: 640px)').matches;
  if (!isMobile) return;

  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
  } catch (e) {
    // localStorage unavailable (private mode, etc.) — show the notice anyway
  }

  var modal = document.createElement('div');
  modal.className = 'mobile-notice';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'mobile-notice-heading');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML =
    '<button class="mobile-notice__backdrop" type="button" aria-label="Close"></button>' +
    '<div class="mobile-notice__panel">' +
      '<button class="mobile-notice__close" type="button" aria-label="Close">&times;</button>' +
      '<h2 class="mobile-notice__heading" id="mobile-notice-heading">This website is adapted to laptop screens.</h2>' +
      '<p class="mobile-notice__body">Please use a laptop for the best experience.</p>' +
    '</div>';

  document.body.appendChild(modal);

  var closeBtn = modal.querySelector('.mobile-notice__close');
  var backdrop = modal.querySelector('.mobile-notice__backdrop');
  var lastFocused = document.activeElement;

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
      // ignore — worst case the notice reappears next visit
    }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  requestAnimationFrame(function () {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  });
})();
