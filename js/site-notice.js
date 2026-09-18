
(function () {
  'use strict';

  var STORAGE_KEY = 'siteNoticeSeen';

  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
  } catch (e) {
    // localStorage unavailable (private mode, etc.) — show the notice anyway
  }

  var modal = document.createElement('div');
  modal.className = 'site-notice';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'site-notice-heading');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML =
    '<button class="site-notice__backdrop" type="button" aria-label="Close"></button>' +
    '<div class="site-notice__panel">' +
      '<button class="site-notice__close" type="button" aria-label="Close">&times;</button>' +
      '<span class="site-notice__tag">// under construction</span>' +
      '<h2 class="site-notice__heading" id="site-notice-heading">This site is still being built</h2>' +
      '<p class="site-notice__body">You&rsquo;re looking at a work in progress &mdash; some pages contain placeholder images and dummy text while the real content is finished.</p>' +
      '<p class="site-notice__body">Website will be complete by <span class="site-notice__date">September 21</span>. Feel free to look around in the meantime.</p>' +
    '</div>';

  document.body.appendChild(modal);

  var closeBtn = modal.querySelector('.site-notice__close');
  var backdrop = modal.querySelector('.site-notice__backdrop');
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
