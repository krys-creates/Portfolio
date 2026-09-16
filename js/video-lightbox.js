/**
 * video-lightbox.js
 * Opens a modal with a full-size, controllable <video> when a
 * .project-video__thumb (which itself shows the file's first frame as a
 * static preview — no autoplay) is activated. The modal copies the thumb's
 * own inline aspect-ratio style (set in the HTML to match each file's real
 * dimensions) so playback is never cropped or stretched. Same bare
 * image-and-close-button treatment as the image lightbox — no surrounding
 * card or caption text.
 * Backdrop click, the close button, and Escape all dismiss it and stop
 * playback.
 */
(function () {
  'use strict';

  var triggers = document.querySelectorAll('.project-video__thumb');
  var modal = document.getElementById('video-modal');
  if (!triggers.length || !modal) return;

  // A <video> that's never been played renders as a blank/black frame in
  // some browsers rather than its actual first frame. Nudging currentTime
  // forward a hair once metadata loads forces that frame to render, without
  // ever calling .play() — the preview stays paused throughout.
  document.querySelectorAll('.project-video__preview').forEach(function (video) {
    video.addEventListener('loadedmetadata', function () {
      video.currentTime = 0.01;
    });
  });

  var panel = modal.querySelector('.video-modal__panel');
  var videoEl = modal.querySelector('.video-modal__video');
  var closeBtn = modal.querySelector('.video-modal__close');
  var backdrop = modal.querySelector('.video-modal__backdrop');
  var lastTrigger = null;

  function open(trigger) {
    lastTrigger = trigger;

    panel.setAttribute('aria-label', trigger.dataset.title || 'Video player');
    videoEl.style.aspectRatio = trigger.style.aspectRatio || '';
    videoEl.src = trigger.dataset.video || '';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    videoEl.play();
    document.addEventListener('keydown', onKeydown);
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.load();
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
