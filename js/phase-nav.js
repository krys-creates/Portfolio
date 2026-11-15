/**
 * phase-nav.js
 * A floating, clickable "where am I in the project" bar for subpages that are
 * split into phases. It is built from the page's own headings (each
 * .phase__label and .project-section-label heading), so no per-page markup is
 * needed: a page with fewer than two such headings gets no navigation.
 *
 * Collapsed, it is a slim column of numbered squares joined by a thin line.
 * Hovering (or tabbing into) it widens the bar to show each phase's name.
 * As you scroll, the line and the numbers up to the current phase turn orange,
 * and the current phase is filled red. Clicking a row scrolls to that phase.
 */
(function () {
  'use strict';

  var main = document.getElementById('main-content');
  if (!main) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- read the headings -------------------------------------------------
  function readLabel(el) {
    var clone = el.cloneNode(true);
    var brs = clone.querySelectorAll('br');
    for (var i = 0; i < brs.length; i++) brs[i].replaceWith(' ');
    var junk = clone.querySelectorAll('.heading-sparkle, .project-hero__slash');
    for (var j = 0; j < junk.length; j++) junk[j].remove();

    var text = clone.textContent.replace(/\s+/g, ' ').trim();
    text = text.replace(/^[<>\s]+/, '').replace(/[<>\s]+$/, '');   // "< PHASE 01: … >" / ">> … >>"
    text = text.replace(/\s*\([^)]*\)\s*/g, ' ').trim();           // "(for the full website …)"
    text = text.replace(/^PHASE\s*0*\d+\s*:\s*/i, '');              // the bar numbers the rows itself
    return text.replace(/\s+/g, ' ').trim().toUpperCase();
  }

  var nodes = main.querySelectorAll('.phase__label, .project-section-label h2');
  var items = [];
  for (var n = 0; n < nodes.length; n++) {
    var label = readLabel(nodes[n]);
    if (!label) continue;
    if (!nodes[n].id) nodes[n].id = 'phase-nav-' + (n + 1);
    items.push({ el: nodes[n], text: label });
  }
  if (items.length < 2) return;

  // ---- build the bar -----------------------------------------------------
  var nav = document.createElement('nav');
  nav.className = 'phase-nav';
  nav.setAttribute('aria-label', 'Project phases');

  var list = document.createElement('ol');
  list.className = 'phase-nav__list';

  var links = [];
  var rows = [];
  items.forEach(function (item, index) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'phase-nav__link';
    a.href = '#' + item.el.id;

    var text = document.createElement('span');
    text.className = 'phase-nav__label';
    text.textContent = item.text;

    var num = document.createElement('span');
    num.className = 'phase-nav__num';
    num.textContent = ('0' + (index + 1)).slice(-2);

    a.appendChild(text);
    a.appendChild(num);
    li.appendChild(a);
    list.appendChild(li);
    links.push(a);
    rows.push(li);

    a.addEventListener('click', function (e) {
      e.preventDefault();
      item.el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      item.el.setAttribute('tabindex', '-1');
      item.el.focus({ preventScroll: true });
    });
  });

  nav.appendChild(list);
  document.body.appendChild(nav);

  // ---- follow the scroll -------------------------------------------------
  var current = -2;
  var shown = null;
  var queued = false;

  function update() {
    queued = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var line = vh * 0.38;
    var active = -1;
    for (var i = 0; i < items.length; i++) {
      if (items[i].el.getBoundingClientRect().top <= line) active = i;
    }

    var visible = items[0].el.getBoundingClientRect().top < vh * 0.75;
    if (visible !== shown) {
      shown = visible;
      nav.classList.toggle('is-visible', visible);
    }

    // how far the line has travelled from the current row towards the next one
    var seg = 0;
    if (active >= 0 && active < items.length - 1) {
      var t0 = items[active].el.getBoundingClientRect().top;
      var t1 = items[active + 1].el.getBoundingClientRect().top;
      seg = t1 > t0 ? Math.max(0, Math.min(1, (line - t0) / (t1 - t0))) : 0;
    }
    for (var r = 0; r < rows.length; r++) {
      if (r === active) rows[r].style.setProperty('--seg', seg.toFixed(3));
      else rows[r].style.removeProperty('--seg');
    }

    if (active !== current) {
      current = active;
      for (var k = 0; k < links.length; k++) {
        links[k].classList.toggle('is-active', k === active);
        links[k].classList.toggle('is-past', k < active);
        rows[k].classList.toggle('is-past', k < active);
        rows[k].classList.toggle('is-active', k === active);
        if (k === active) links[k].setAttribute('aria-current', 'location');
        else links[k].removeAttribute('aria-current');
      }
    }
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  window.addEventListener('load', queue);
  window.addEventListener('pageloader:done', queue);
  update();
})();
