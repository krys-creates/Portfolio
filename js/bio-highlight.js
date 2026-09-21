/**
 * bio-highlight.js
 * Sweeps the marker highlight across the <mark> phrases in the intro
 * slogan when the page is entered. The widths animate in CSS; this only
 * flips the class that starts them, on the next frame after load so the
 * transition has an initial state to animate away from.
 */
(function () {
  'use strict';

  var bio = document.querySelector('.about-bio');
  if (!bio) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function highlight() {
    bio.classList.add('is-highlighted');
  }

  if (prefersReducedMotion) {
    highlight();
    return;
  }

  // A timer rather than requestAnimationFrame: rAF never fires while the
  // tab is backgrounded, which would leave the marks stuck at zero width.
  // The short beat also lets the page settle before the marker sweeps.
  function start() {
    setTimeout(highlight, 250);
  }

  // wait for the LOADING screen to lift, so the sweep isn't hidden behind it
  if (document.documentElement.classList.contains('is-loading')) {
    document.addEventListener('pageloader:done', start, { once: true });
  } else {
    start();
  }
})();
