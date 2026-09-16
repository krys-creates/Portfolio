/**
 * section-reveal.js
 * Applies the same text-scramble effect used on the header nav links to
 * each "# SECTION" heading on the About page — but triggered once, the
 * first time the heading scrolls close to view, rather than on hover.
 */
(function () {
  'use strict';

  var labels = document.querySelectorAll('.section-heading__label');
  if (!labels.length) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+*#%';
  var FRAME_MS = 32;

  function scramble(el, finalText, duration) {
    if (!el || !finalText) return;

    if (prefersReducedMotion) {
      el.textContent = finalText;
      return;
    }

    duration = duration || 550;
    var totalFrames = Math.max(1, Math.round(duration / FRAME_MS));
    var revealEvery = totalFrames / finalText.length;
    var frame = 0;

    var timer = setInterval(function () {
      var revealedCount = Math.floor(frame / revealEvery);
      var output = '';

      for (var i = 0; i < finalText.length; i++) {
        var ch = finalText[i];
        if (ch === ' ') {
          output += ' ';
        } else if (i < revealedCount) {
          output += ch;
        } else {
          output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      el.textContent = output;
      frame++;

      if (revealedCount >= finalText.length) {
        clearInterval(timer);
        el.textContent = finalText;
      }
    }, FRAME_MS);
  }

  if (prefersReducedMotion) {
    labels.forEach(function (label) {
      label.textContent = label.dataset.text || label.textContent;
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var label = entry.target;
        scramble(label, label.dataset.text || label.textContent);
        observer.unobserve(label);
      }
    });
  }, { threshold: 0.6, rootMargin: '0px 0px -10% 0px' });

  labels.forEach(function (label) {
    observer.observe(label);
  });
})();
