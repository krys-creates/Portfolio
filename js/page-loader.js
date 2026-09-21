/**
 * page-loader.js
 * Full-screen "// LOADING..." screen shown from the very first paint until
 * the page's own resources (CSS, scripts, fonts, images that load straight
 * away) are ready. Loaded as a plain script at the very top of <body> — not
 * deferred — so the overlay is in place before any page content can flash.
 * Styles live in css/style.css (section 11b).
 *
 * Kept on screen for at least MIN_MS so it never just flickers, and given
 * up after MAX_MS so a stalled request can never lock visitors out.
 */
(function () {
  'use strict';

  var MIN_MS = 450;
  var MAX_MS = 15000;
  var started = Date.now();

  var loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-live', 'polite');
  loader.setAttribute('aria-label', 'Loading');
  loader.innerHTML =
    '<div class="page-loader__stars" aria-hidden="true">' +
      '<svg class="page-loader__star page-loader__star--big" viewBox="0 0 200 200"><path fill="currentColor" d="M100,4 C100,100 100,100 196,100 C100,100 100,100 100,196 C100,100 100,100 4,100 C100,100 100,100 100,4 Z"/></svg>' +
      '<svg class="page-loader__star page-loader__star--small" viewBox="0 0 200 200"><path fill="currentColor" d="M100,4 C100,100 100,100 196,100 C100,100 100,100 100,196 C100,100 100,100 4,100 C100,100 100,100 100,4 Z"/></svg>' +
    '</div>' +
    '<p class="page-loader__text" aria-hidden="true"><span class="page-loader__slash">//</span> LOADING<span class="page-loader__dots"><span>.</span><span>.</span><span>.</span></span></p>' +
    '<span class="page-loader__bar" aria-hidden="true"><span class="page-loader__bar-fill"></span></span>';

  document.body.insertBefore(loader, document.body.firstChild);
  document.documentElement.classList.add('is-loading');

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    var wait = Math.max(0, MIN_MS - (Date.now() - started));
    setTimeout(function () {
      loader.classList.add('is-done');
      document.documentElement.classList.remove('is-loading');
      // intro animations (typewriter, marker sweep) wait for this
      document.dispatchEvent(new Event('pageloader:done'));
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 700);
    }, wait);
  }

  // ready = window load (everything the page loads straight away), then
  // web fonts — checked after load, since fonts only start downloading once
  // text that uses them is laid out
  function afterLoad() {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(finish, finish);
    } else {
      finish();
    }
  }

  if (document.readyState === 'complete') {
    afterLoad();
  } else {
    window.addEventListener('load', afterLoad);
  }

  setTimeout(finish, MAX_MS);
})();
