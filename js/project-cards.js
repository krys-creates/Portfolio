/**
 * project-cards.js
 * The project hover reveal (keyword tag + corner brackets + image zoom) is
 * driven entirely by CSS :hover / :focus-visible. This module only adds a
 * small touch-device accommodation: since touchscreens have no real hover,
 * the first tap on a project reveals the preview state, and a second tap
 * follows the link — so the reveal animation isn't skipped entirely on
 * mobile/tablet.
 */
(function () {
  'use strict';

  var isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isCoarsePointer) return;

  var links = document.querySelectorAll('.project__link');

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (!link.classList.contains('is-active')) {
        e.preventDefault();
        links.forEach(function (other) { other.classList.remove('is-active'); });
        link.classList.add('is-active');
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.project__link')) {
      links.forEach(function (link) { link.classList.remove('is-active'); });
    }
  });
})();
