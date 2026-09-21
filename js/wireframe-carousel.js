/**
 * wireframe-carousel.js
 * Low-fidelity wireframe carousel (MODU page): prev/next arrows, dot
 * pagination, keyboard arrows and touch swipe. Clicking a slide opens an
 * expanded viewer (#wf-modal) that has its own prev/next arrows, so the
 * wireframes can be browsed at full size. The viewer and the carousel stay
 * in sync — closing it leaves the carousel on the slide you ended on.
 */
(function () {
  'use strict';

  var roots = document.querySelectorAll('[data-wf-carousel]');
  var modal = document.getElementById('wf-modal');
  if (!roots.length || !modal) return;

  var imgEl = modal.querySelector('.image-modal__img');
  var closeBtn = modal.querySelector('.image-modal__close');
  var backdrop = modal.querySelector('.image-modal__backdrop');
  var modalPrev = modal.querySelector('.wf-modal__nav--prev');
  var modalNext = modal.querySelector('.wf-modal__nav--next');
  var countEl = modal.querySelector('.wf-modal__count');

  var active = null; // carousel currently shown in the viewer
  var lastTrigger = null;

  function setupCarousel(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.wf-carousel__slide'));
    var prev = root.querySelector('.wf-carousel__arrow--prev');
    var next = root.querySelector('.wf-carousel__arrow--next');
    var dots = Array.prototype.slice.call(root.querySelectorAll('.wf-carousel__dot'));
    var viewport = root.querySelector('.wf-carousel__viewport');
    var index = 0;
    var swiped = false;

    function go(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      root.style.setProperty('--i', index);
      root.style.setProperty('--ratio', slides[index].getAttribute('data-ratio'));
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
      dots.forEach(function (dot, n) {
        if (n === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      slides.forEach(function (slide, n) {
        slide.setAttribute('aria-hidden', n === index ? 'false' : 'true');
        slide.querySelector('.wf-carousel__open').tabIndex = n === index ? 0 : -1;
      });
    }

    var api = {
      root: root,
      slides: slides,
      go: go,
      index: function () { return index; }
    };

    prev.addEventListener('click', function () { go(index - 1); });
    next.addEventListener('click', function () { go(index + 1); });
    dots.forEach(function (dot, n) {
      dot.addEventListener('click', function () { go(n); });
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { go(index - 1); }
      else if (e.key === 'ArrowRight') { go(index + 1); }
    });

    // touch swipe — a horizontal drag changes slide and suppresses the tap
    // that would otherwise open the viewer
    var startX = null;
    var startY = null;
    viewport.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swiped = false;
    }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        go(index + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });

    slides.forEach(function (slide) {
      var btn = slide.querySelector('.wf-carousel__open');
      btn.addEventListener('click', function () {
        if (swiped) { swiped = false; return; }
        openModal(api, btn);
      });
    });

    go(0);
  }

  function showInModal() {
    var slide = active.slides[active.index()];
    var img = slide.querySelector('img');
    imgEl.src = img.currentSrc || img.src;
    imgEl.alt = img.alt || '';
    modalPrev.disabled = active.index() === 0;
    modalNext.disabled = active.index() === active.slides.length - 1;
    countEl.textContent = (active.index() + 1) + ' / ' + active.slides.length;
  }

  function step(delta) {
    active.go(active.index() + delta);
    showInModal();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  }

  function openModal(api, trigger) {
    active = api;
    lastTrigger = trigger;
    modal.querySelector('.image-modal__panel').setAttribute(
      'aria-label', (api.root.getAttribute('aria-label') || 'Wireframes') + ', enlarged');
    showInModal();
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown);
    if (lastTrigger) {
      var current = active.slides[active.index()].querySelector('.wf-carousel__open');
      current.focus();
    }
  }

  modalPrev.addEventListener('click', function () { step(-1); });
  modalNext.addEventListener('click', function () { step(1); });
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);

  Array.prototype.forEach.call(roots, setupCarousel);
})();
