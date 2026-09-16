/**
 * scramble.js
 * Header nav links scramble through random characters before settling back
 * into their label on hover/focus — the same spirit of interaction as the
 * reference site's nav treatment. Runs on both mouse hover and keyboard
 * focus so the effect is available to everyone, not just mouse users.
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+*#%';
  var FRAME_MS = 32;

  function scramble(el, finalText, duration) {
    if (!el || !finalText) return;

    if (prefersReducedMotion) {
      el.textContent = finalText;
      return;
    }

    duration = duration || 480;
    var totalFrames = Math.max(1, Math.round(duration / FRAME_MS));
    var revealEvery = totalFrames / finalText.length;
    var frame = 0;

    if (el._scrambleTimer) {
      clearInterval(el._scrambleTimer);
    }

    el._scrambleTimer = setInterval(function () {
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
        clearInterval(el._scrambleTimer);
        el._scrambleTimer = null;
        el.textContent = finalText;
      }
    }, FRAME_MS);
  }

  var links = document.querySelectorAll('.nav-link');

  links.forEach(function (link) {
    var label = link.querySelector('.nav-link__label');
    if (!label) return;
    var finalText = label.dataset.text || label.textContent;

    var trigger = function () { scramble(label, finalText); };

    link.addEventListener('mouseenter', trigger);
    link.addEventListener('focus', trigger);
  });
})();
