/**
 * theme.js
 * Night-mode toggle. The saved theme (light unless the visitor chose night mode) is applied before first paint by a
 * tiny inline script in each page's <head> (so there is no light flash); this
 * file wires up the header switch, remembers the choice, and keeps open tabs in sync.
 */
(function () {
  'use strict';

  var KEY = 'theme';
  var root = document.documentElement;

  function save(theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) { /* private mode: still works for this visit */ }
  }

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function paint(theme) {
    root.setAttribute('data-theme', theme);
    var dark = theme === 'dark';
    var buttons = document.querySelectorAll('.theme-toggle');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-checked', String(dark));
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = dark ? '#14110F' : '#F8F6F0';
  }

  function apply(theme, animate) {
    if (animate) {
      // brief cross-fade of colours, only while switching
      root.classList.add('theme-transition');
      window.setTimeout(function () { root.classList.remove('theme-transition'); }, 450);
    }
    paint(theme);
  }

  paint(current());

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.theme-toggle') : null;
    if (!btn) return;
    var next = current() === 'dark' ? 'light' : 'dark';
    save(next);
    apply(next, true);
  });

  // another tab changed the theme
  window.addEventListener('storage', function (e) {
    if (e.key === KEY && (e.newValue === 'dark' || e.newValue === 'light')) paint(e.newValue);
  });
})();
