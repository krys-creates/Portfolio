/**
 * typewriter.js
 * Character-by-character reveal of the hero bio paragraph, played once when
 * the page first loads (not on hover/scroll). Nested markup (<strong>,
 * <mark>) is preserved so bold names and highlighted phrases keep their
 * styling while still being revealed letter by letter.
 *
 * Timing is intentionally irregular — a small random jitter per character,
 * plus a slightly longer pause after punctuation — so it reads like actual
 * typing rather than a perfectly smooth mechanical fade. It's still fast
 * overall (short average delay, small jitter range, short pauses).
 *
 * A blinking cursor bar follows the most recently revealed character and
 * fades out shortly after the reveal finishes.
 */
(function () {
  'use strict';

  var container = document.getElementById('bio-text');
  if (!container) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Text is visible by default (no wrapping needed) — nothing to do.
    return;
  }

  var BASE_MS = 4;         // baseline delay between characters
  var JITTER_MS = 14;      // +/- random jitter added to the baseline
  var PUNCTUATION_PAUSE = 0;  // extra pause after . , ; : ! ?
  var SAFETY_TIMEOUT_MS = 5000; // guarantees text becomes visible even if something goes wrong
  var HIGHLIGHT_DELAY_MS = 250; // beat between the typing finishing and the marker sweep

  function wrapCharacters(node) {
    var childNodes = Array.prototype.slice.call(node.childNodes);

    childNodes.forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        var frag = document.createDocumentFragment();
        var text = child.textContent;

        for (var i = 0; i < text.length; i++) {
          var span = document.createElement('span');
          span.className = 'char';
          span.textContent = text[i];
          frag.appendChild(span);
        }

        node.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        wrapCharacters(child);
      }
    });
  }

  try {
    wrapCharacters(container);
  } catch (err) {
    // If anything goes wrong, fall back to fully visible text.
    finish();
    return;
  }

  var chars = container.querySelectorAll('.char');
  var total = chars.length;

  if (!total) {
    finish();
    return;
  }

  var cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  chars[0].parentNode.insertBefore(cursor, chars[0]);

  var PAUSE_CHARS = /[.,;:!?]/;

 var finished = false;

 function finish() {
  if (finished) return;
  finished = true;
  container.classList.add('reveal-complete');
  // The marker sweep across the <mark> phrases waits until the typing is
  // done, so the two animations never overlap.
  setTimeout(function () {
    container.classList.add('is-highlighted');
  }, HIGHLIGHT_DELAY_MS);
}

  var index = 0;
  var safetyTimer;

  function revealNext() {
    if (index >= total) {
      clearTimeout(safetyTimer);
      finish();
      return;
    }

    var el = chars[index];
    el.classList.add('is-visible');
    el.parentNode.insertBefore(cursor, el.nextSibling);

    var delay = BASE_MS + Math.random() * JITTER_MS;
    if (PAUSE_CHARS.test(el.textContent)) {
      delay += PUNCTUATION_PAUSE + Math.random() * PUNCTUATION_PAUSE * 0.5;
    }

    index++;
    setTimeout(revealNext, delay);
  }

  // the typing starts once the LOADING screen has lifted, so it isn't
  // played out behind it
  function start() {
    safetyTimer = setTimeout(finish, SAFETY_TIMEOUT_MS);
    revealNext();
  }

  if (document.documentElement.classList.contains('is-loading')) {
    document.addEventListener('pageloader:done', start, { once: true });
  } else {
    start();
  }
})();
