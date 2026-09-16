/**
 * decorations.js
 * Drives the pale decorative squares scattered along the page edges.
 * By design they are perfectly still at rest. Two things wake them up:
 *   1. Scrolling — each square gets a small vertical "shake" that follows
 *      the scroll trajectory via a lightweight damped spring, then settles
 *      back to rest as soon as scrolling stops.
 *   2. The cursor (or a tap) — a square eases away when the pointer gets
 *      close, then eases back once it's clear.
 * Both effects are fully disabled for prefers-reduced-motion.
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nodes = Array.prototype.slice.call(document.querySelectorAll('.decoration'));
  if (!nodes.length) return;

  if (prefersReducedMotion) {
    // Squares stay static; no animation loop needed.
    return;
  }

  var REPEL_RADIUS = 90;  // px, distance at which the cursor starts pushing a square
  var REPEL_MAX = 16;     // px, maximum push distance
  var REPEL_LERP = 0.08;  // smoothing factor per frame for the repel easing

var SPRING_STIFFNESS = 0.045;
var SPRING_DAMPING = 0.16;
var SHAKE_CLAMP = 50; // px, keeps the shake subtle even during a fast scroll

  var squares = nodes.map(function (el) {
    return {
      el: el,
      response: parseFloat(el.dataset.response) || 0.04,
      // cursor-repel state
      curDx: 0,
      curDy: 0,
      targetDx: 0,
      targetDy: 0,
      // scroll-shake spring state
      shakeY: 0,
      shakeVelocity: 0
    };
  });

  var mouseX = -9999;
  var mouseY = -9999;
  var hasPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (hasPointer) {
    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      mouseX = -9999;
      mouseY = -9999;
    });
  }

  var lastScrollY = window.scrollY || window.pageYOffset;

  function updateRepelTargets() {
    if (!hasPointer) return;
    for (var i = 0; i < squares.length; i++) {
      var s = squares[i];
      var rect = s.el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var dx = cx - mouseX;
      var dy = cy - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS && dist > 0.001) {
        var strength = (1 - dist / REPEL_RADIUS) * REPEL_MAX;
        s.targetDx = (dx / dist) * strength;
        s.targetDy = (dy / dist) * strength;
      } else {
        s.targetDx = 0;
        s.targetDy = 0;
      }
    }
  }

  function tick() {
    var scrollY = window.scrollY || window.pageYOffset;
    var scrollDelta = scrollY - lastScrollY;
    lastScrollY = scrollY;

    updateRepelTargets();

    var settled = true;

    for (var i = 0; i < squares.length; i++) {
      var s = squares[i];

      // --- cursor repel: smooth easing toward target offset ---
      s.curDx += (s.targetDx - s.curDx) * REPEL_LERP;
      s.curDy += (s.targetDy - s.curDy) * REPEL_LERP;

      // --- scroll shake: a small damped spring, "kicked" by scroll delta ---
      if (scrollDelta !== 0) {
        s.shakeVelocity += scrollDelta * s.response;
      }
      var springForce = -SPRING_STIFFNESS * s.shakeY;
      var dampingForce = -SPRING_DAMPING * s.shakeVelocity;
      s.shakeVelocity += springForce + dampingForce;
      s.shakeY += s.shakeVelocity;

      if (s.shakeY > SHAKE_CLAMP) { s.shakeY = SHAKE_CLAMP; s.shakeVelocity = 0; }
      if (s.shakeY < -SHAKE_CLAMP) { s.shakeY = -SHAKE_CLAMP; s.shakeVelocity = 0; }

      var x = s.curDx;
      var y = s.curDy + s.shakeY;

      s.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';

      // consider the square "settled" once it's essentially back at rest
      if (Math.abs(s.shakeY) > 0.05 || Math.abs(s.shakeVelocity) > 0.05 ||
          Math.abs(s.curDx) > 0.05 || Math.abs(s.curDy) > 0.05 ||
          s.targetDx !== 0 || s.targetDy !== 0) {
        settled = false;
      }
    }

    if (!document.hidden) {
      if (settled) {
        running = false; // pause the loop entirely while everything is at rest
      } else {
        requestAnimationFrame(tick);
      }
    } else {
      pendingResume = true;
    }
  }

  var running = false;
  var pendingResume = false;

  function ensureRunning() {
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener('scroll', ensureRunning, { passive: true });

  if (hasPointer) {
    window.addEventListener('mousemove', ensureRunning, { passive: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && pendingResume) {
      pendingResume = false;
      ensureRunning();
    }
  });
})();
