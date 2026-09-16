/**
 * timeline.js
 * For each timeline column in # EXPERIENCE & EDUCATION: once it scrolls
 * into view, the vertical connecting line grows downward, and each
 * entry's sparkle bullet + text fades in timed to roughly when the
 * growing line reaches that entry's position — not all at once.
 */
(function () {
  'use strict';

  var timelines = document.querySelectorAll('.timeline');
  if (!timelines.length) return;

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LINE_GROW_MS = 1400; // must match the .timeline__line height transition duration in about.css

  // A sparkle's vertical center relative to the timeline, via offsetTop
  // chaining rather than getBoundingClientRect — offsetTop ignores the
  // reveal transform (translateY), so it reads correctly whether the item
  // has already faded in or not.
  function sparkleCenter(item) {
    var sparkle = item.querySelector('.timeline__sparkle');
    if (!sparkle) return item.offsetTop;
    return item.offsetTop + sparkle.offsetTop + sparkle.offsetHeight / 2;
  }

  // Points the line's top at the first sparkle's center and its length at
  // the last sparkle's center, so it always starts and ends exactly on a
  // sparkle — never short of one, never trailing past the last one —
  // regardless of how the item text wraps at any screen width.
  function positionLine(timeline) {
    var line = timeline.querySelector('.timeline__line');
    var items = timeline.querySelectorAll('.timeline__item');
    if (!line || !items.length) return;

    var firstCenter = sparkleCenter(items[0]);
    var lastCenter = sparkleCenter(items[items.length - 1]);

    line.style.top = firstCenter + 'px';
    line.style.setProperty('--tl-line-height', Math.max(lastCenter - firstCenter, 0) + 'px');
  }

  function positionAllLines() {
    timelines.forEach(positionLine);
  }

  positionAllLines();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(positionAllLines);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(positionAllLines, 150);
  });

  function revealAllInstantly(timeline) {
    positionLine(timeline);
    timeline.classList.add('is-revealed');
    var items = timeline.querySelectorAll('.timeline__item');
    items.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  if (prefersReducedMotion) {
    timelines.forEach(revealAllInstantly);
    return;
  }

  function revealTimeline(timeline) {
    if (timeline.classList.contains('is-revealed')) return;
    positionLine(timeline);
    timeline.classList.add('is-revealed');

    var items = timeline.querySelectorAll('.timeline__item');
    if (!items.length) return;

    var firstCenter = sparkleCenter(items[0]);
    var totalSpan = sparkleCenter(items[items.length - 1]) - firstCenter;

    items.forEach(function (item) {
      var ratio = totalSpan ? Math.min((sparkleCenter(item) - firstCenter) / totalSpan, 1) : 0;
      var delay = ratio * LINE_GROW_MS;

      setTimeout(function () {
        item.classList.add('is-visible');
      }, delay);
    });
  }

  // The timelines are taller than the viewport, so an area-based threshold
  // fires while the section is still just a sliver at the bottom of the
  // screen — the whole sequence would be over before the user got to it.
  // Shrinking the root's bottom edge upward instead means the reveal waits
  // until the section's top has climbed well into view.
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        revealTimeline(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -35% 0px' });

  timelines.forEach(function (timeline) {
    observer.observe(timeline);
  });
})();
