/**
 * decorations.js
 * Drives the pale decorative squares scattered along the page edges.
 * By design they are perfectly still at rest. Two things wake them up:
 *   1. Scrolling — each square drifts with a soft, over-damped spring (no
 *      springy bounce, just a floaty settle) that follows the scroll
 *      trajectory, plus a smooth, continuously-varying "wander" layered on
 *      top. The wander uses a couple of sine waves with each square's own
 *      random frequency/phase, so it reads as organic, chaotic drifting
 *      rather than jittery noise — and its amplitude is tied to how much
 *      the square is currently moving, so everything settles to a dead
 *      stop once scrolling ends.
 *   2. The cursor (or a tap) — a square eases away and grows slightly as
 *      the pointer gets close, then eases back once it's clear.
 * Both effects are fully disabled for prefers-reduced-motion.
 */
(function () {
  'use strict';

  // Keep the decorations layer from extending into the footer, so no
  // square can ever land there, regardless of each square's --top value
  // or how the footer's height changes across breakpoints/content.
  // Runs unconditionally (even for prefers-reduced-motion), since it's
  // layout, not animation.
  function constrainToFooter() {
    var wrapper = document.getElementById('decorations');
    var footer = document.querySelector('.site-footer');
    if (!wrapper || !footer) return;
    wrapper.style.height = footer.offsetTop + 'px';
  }

  constrainToFooter();
  window.addEventListener('load', constrainToFooter);

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(constrainToFooter, 150);
  });

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nodes = Array.prototype.slice.call(document.querySelectorAll('.decoration'));
  if (!nodes.length) return;

  if (prefersReducedMotion) {
    // Squares stay static; no animation loop needed.
    return;
  }

  // --- hover / touch repel ---
  var REPEL_RADIUS = 140; // px, distance at which the cursor starts pushing a square
  var REPEL_MAX = 30;      // px, maximum push distance
  var REPEL_LERP = 0.11;   // smoothing factor per frame for the repel easing
  var REPEL_SCALE_MAX = 0.18; // extra scale (on top of 1.0) at closest proximity
  var SCALE_LERP = 0.12;

  // --- scroll-driven float ---
  var SPRING_STIFFNESS = 0.016; // low stiffness = gentle pull back to rest
  var SPRING_DAMPING = 0.30;    // high damping = settles smoothly, no springy bounce
  var SHAKE_CLAMP = 34;         // px, keeps the drift bounded even during a fast scroll
  var SCROLL_SMOOTH = 0.3;      // how quickly the smoothed scroll delta catches up to the raw one
  var WANDER_FACTOR = 0.55;     // how strongly the sine-wander shows up relative to motion energy
  var ROTATION_FACTOR = 0.22;   // degrees of rotation per px/frame of horizontal velocity
  var ROTATION_CLAMP = 9;       // max degrees of rotation

  var squares = nodes.map(function (el, i) {
    // Each square gets its own random direction bias and wander frequencies,
    // so a single scroll impulse doesn't move every square the same way.
    var angle = Math.random() * Math.PI * 2;
    return {
      el: el,
      response: parseFloat(el.dataset.response) || 0.04,
      sinA: Math.sin(angle),
      cosA: Math.cos(angle),
      // cursor-repel state
      curDx: 0,
      curDy: 0,
      targetDx: 0,
      targetDy: 0,
      curScale: 1,
      targetScale: 1,
      // scroll-float spring state
      shakeX: 0,
      shakeY: 0,
      velX: 0,
      velY: 0,
      rot: 0,
      clock: 0,
      fx1: 0.4 + Math.random() * 0.5,
      fx2: 0.9 + Math.random() * 0.6,
      fy1: 0.35 + Math.random() * 0.5,
      fy2: 0.8 + Math.random() * 0.6,
      px1: Math.random() * Math.PI * 2,
      px2: Math.random() * Math.PI * 2,
      py1: Math.random() * Math.PI * 2,
      py2: Math.random() * Math.PI * 2
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
  var smoothedDelta = 0;

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
        var proximity = 1 - dist / REPEL_RADIUS;
        var strength = proximity * REPEL_MAX;
        s.targetDx = (dx / dist) * strength;
        s.targetDy = (dy / dist) * strength;
        s.targetScale = 1 + proximity * REPEL_SCALE_MAX;
      } else {
        s.targetDx = 0;
        s.targetDy = 0;
        s.targetScale = 1;
      }
    }
  }

  function tick() {
    var scrollY = window.scrollY || window.pageYOffset;
    var rawDelta = scrollY - lastScrollY;
    lastScrollY = scrollY;

    // smooth the raw scroll delta so the float responds fluidly rather
    // than jerking with every noisy scroll event
    smoothedDelta += (rawDelta - smoothedDelta) * SCROLL_SMOOTH;

    updateRepelTargets();

    var settled = true;

    for (var i = 0; i < squares.length; i++) {
      var s = squares[i];

      // --- cursor repel: smooth easing toward target offset + scale ---
      s.curDx += (s.targetDx - s.curDx) * REPEL_LERP;
      s.curDy += (s.targetDy - s.curDy) * REPEL_LERP;
      s.curScale += (s.targetScale - s.curScale) * SCALE_LERP;

      // --- scroll float: soft, over-damped spring, kicked by the smoothed
      //     scroll delta, split into x/y using each square's own random
      //     direction bias ---
      if (smoothedDelta !== 0) {
        var impulse = smoothedDelta * s.response;
        s.velX += impulse * s.sinA * 0.7;
        s.velY += impulse * s.cosA;
      }

      var springForceX = -SPRING_STIFFNESS * s.shakeX;
      var dampingForceX = -SPRING_DAMPING * s.velX;
      s.velX += springForceX + dampingForceX;
      s.shakeX += s.velX;

      var springForceY = -SPRING_STIFFNESS * s.shakeY;
      var dampingForceY = -SPRING_DAMPING * s.velY;
      s.velY += springForceY + dampingForceY;
      s.shakeY += s.velY;

      if (s.shakeX > SHAKE_CLAMP) { s.shakeX = SHAKE_CLAMP; s.velX = 0; }
      if (s.shakeX < -SHAKE_CLAMP) { s.shakeX = -SHAKE_CLAMP; s.velX = 0; }
      if (s.shakeY > SHAKE_CLAMP) { s.shakeY = SHAKE_CLAMP; s.velY = 0; }
      if (s.shakeY < -SHAKE_CLAMP) { s.shakeY = -SHAKE_CLAMP; s.velY = 0; }

      // smooth, continuous chaotic wander — amplitude tied to current
      // motion energy so it only shows up while actively floating, and
      // fades out naturally as the square comes to rest
      var energy = Math.sqrt(s.velX * s.velX + s.velY * s.velY);
      var wanderAmp = energy * WANDER_FACTOR;
      var wanderX = 0;
      var wanderY = 0;

      if (wanderAmp > 0.01) {
        s.clock += 0.016;
        wanderX = wanderAmp * (Math.sin(s.clock * s.fx1 + s.px1) * 0.7 + Math.sin(s.clock * s.fx2 + s.px2) * 0.4);
        wanderY = wanderAmp * (Math.sin(s.clock * s.fy1 + s.py1) * 0.7 + Math.sin(s.clock * s.fy2 + s.py2) * 0.4);
      }

      // a touch of rotation tied to horizontal velocity, for extra character
      var targetRot = s.velX * ROTATION_FACTOR;
      if (targetRot > ROTATION_CLAMP) targetRot = ROTATION_CLAMP;
      if (targetRot < -ROTATION_CLAMP) targetRot = -ROTATION_CLAMP;
      s.rot += (targetRot - s.rot) * 0.1;

      var x = s.curDx + s.shakeX + wanderX;
      var y = s.curDy + s.shakeY + wanderY;

      s.el.style.transform =
        'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) ' +
        'rotate(' + s.rot.toFixed(2) + 'deg) scale(' + s.curScale.toFixed(3) + ')';

      // consider the square "settled" once it's essentially back at rest
      if (Math.abs(s.shakeX) > 0.05 || Math.abs(s.shakeY) > 0.05 ||
          Math.abs(s.velX) > 0.05 || Math.abs(s.velY) > 0.05 ||
          Math.abs(s.rot) > 0.05 ||
          Math.abs(s.curDx) > 0.05 || Math.abs(s.curDy) > 0.05 ||
          Math.abs(s.curScale - 1) > 0.001 ||
          s.targetDx !== 0 || s.targetDy !== 0) {
        settled = false;
      }
    }

    if (!document.hidden) {
      if (settled && Math.abs(smoothedDelta) < 0.05) {
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
