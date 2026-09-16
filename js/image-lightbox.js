/**
 * image-lightbox.js
 * Opens a modal with a larger version of an image when a
 * .project-figure__zoom button is activated (poster, postcard front,
 * postcard back). Mirrors js/video-lightbox.js's open/close behaviour:
 * backdrop click, the close button, and Escape all dismiss it.
 */
(function () {
  'use strict';

  var triggers = document.querySelectorAll('.project-figure__zoom');
  var modal = document.getElementById('image-modal');
  if (!triggers.length || !modal) return;

  var imgEl = modal.querySelector('.image-modal__img');
  var closeBtn = modal.querySelector('.image-modal__close');
  var backdrop = modal.querySelector('.image-modal__backdrop');
  var lastTrigger = null;

  function open(trigger) {
    lastTrigger = trigger;
    var sourceImg = trigger.querySelector('img');
    if (!sourceImg) return;

    imgEl.src = sourceImg.currentSrc || sourceImg.src;
    imgEl.alt = sourceImg.alt || '';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown);
    if (lastTrigger) lastTrigger.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () { open(trigger); });
  });

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
})();
