/**
 * tools-diagram.js
 * Lays out each tool group's connector line/image and label in the
 * # TOOLS diagram — measured live so they always touch exactly, whatever
 * the box width or label text length turns out to be. No reveal animation.
 */
(function () {
  'use strict';

  var groups = document.querySelectorAll('.tool-group');
  if (!groups.length) return;

  // line1-ui.png's geometry: a diagonal from (0, DIAG_RISE) up to
  // (DIAG_RUN, 0), then flat at y=0 the rest of the way. This is a
  // redrawn-to-scale copy of line1.png — the original is a ~5000px-wide
  // asset with an ~3px stroke, so shrinking it down for this UI (an ~11x
  // reduction) anti-aliased the line into near-invisibility; this version
  // keeps the same diagonal angle and proportions at a size a normal CSS
  // scale-down actually preserves.
  var LINE_IMG_NATURAL_WIDTH = 1200;
  var LINE_IMG_NATURAL_HEIGHT = 84;
  var LINE_IMG_DIAG_RUN = 100;
  var LINE_IMG_DIAG_RISE = 84;

  // Figma's connector is the line1.png artwork rather than a drawn SVG
  // line: scaled (uniformly, so the diagonal keeps its true angle instead
  // of flattening out) so the image's own rise matches the real gap
  // between the box and the label, then clipped by its container so only
  // the diagonal plus as much of the flat run as the label needs shows.
  function positionImageConnector(container, img, boxX, boxY, labelX, labelY, groupRect) {
    var width = Math.max(Math.abs(labelX - boxX), 1);
    var height = Math.max(Math.abs(boxY - labelY), 1);
    var scale = height / LINE_IMG_DIAG_RISE;

    container.style.left = (Math.min(boxX, labelX) - groupRect.left) + 'px';
    container.style.top = (Math.min(boxY, labelY) - groupRect.top) + 'px';
    container.style.width = width + 'px';
    container.style.height = height + 'px';

    // anchor the image's bottom-left (the diagonal's foot) at the box
    // corner; if the box corner is on the right, mirror the whole image
    var anchorRight = boxX > labelX;
    img.style.width = (LINE_IMG_NATURAL_WIDTH * scale) + 'px';
    img.style.height = (LINE_IMG_NATURAL_HEIGHT * scale) + 'px';
    img.style.left = anchorRight ? 'auto' : '0';
    img.style.right = anchorRight ? '0' : 'auto';
    img.style.top = (height - LINE_IMG_NATURAL_HEIGHT * scale) + 'px';
    img.style.transform = anchorRight ? 'scaleX(-1)' : 'none';
  }

  // Points the connector SVG from the box's corner to the label's nearest
  // edge, measured live — so it always touches both ends exactly, whatever
  // the box width or label text length turns out to be.
  function positionConnector(group) {
    var box = group.querySelector('.tool-group__box');
    var labelEl = group.querySelector('.tool-group__label');
    var labelText = group.querySelector('.tool-group__label-text');
    if (!box || !labelEl || !labelText) return;

    var groupRect = group.getBoundingClientRect();
    var boxRect = box.getBoundingClientRect();
    var labelRect = labelText.getBoundingClientRect();

    var isTop = labelEl.classList.contains('tool-group__label--top-right') ||
      labelEl.classList.contains('tool-group__label--top-left') ||
      labelEl.classList.contains('tool-group__label--top-center');

    var boxY = isTop ? boxRect.top : boxRect.bottom;
    var labelY = isTop ? labelRect.bottom : labelRect.top;

    // box's near corner (x): whichever side the label variant faces —
    // unless a group opts into anchoring from its horizontal center instead
    // (data-connect-from="center"), for boxes narrower than the label where
    // a corner-to-edge line reads as unnecessarily long and diagonal.
    var isRight = labelEl.classList.contains('tool-group__label--top-right') ||
      labelEl.classList.contains('tool-group__label--bottom-right');
    var boxX = group.dataset.connectFrom === 'center'
      ? (boxRect.left + boxRect.right) / 2
      : (isRight ? boxRect.right : boxRect.left);

    var imageConnector = group.querySelector('.tool-group__connector--image');
    if (imageConnector) {
      var img = imageConnector.querySelector('.tool-group__connector-line-img');
      // the image itself is the full underline's worth of flat line, so it
      // spans from the box corner all the way to the label's far edge
      var labelFarX = isRight ? labelRect.right : labelRect.left;
      positionImageConnector(imageConnector, img, boxX, boxY, labelFarX, labelY, groupRect);
      return;
    }

    var svg = group.querySelector('.tool-group__connector');
    var line = group.querySelector('.tool-group__connector-line');
    if (!svg || !line) return;

    // label's near end (x): whichever edge of the label sits closer to the
    // box, unless a group explicitly pins one edge via data-connect-edge
    // (for cases where the box/label ranges overlap and the nearest-point
    // pick reads backwards). Always an edge, never the label's midpoint —
    // the underline (border-bottom/border-top on the label text) runs the
    // full label width, so the diagonal has to land on one of its ends or
    // it visibly crosses the underline instead of joining it.
    var forcedEdge = group.dataset.connectEdge;
    var labelX = forcedEdge === 'left'
        ? labelRect.left
        : forcedEdge === 'right'
          ? labelRect.right
          : Math.abs(labelRect.left - boxX) <= Math.abs(labelRect.right - boxX)
            ? labelRect.left
            : labelRect.right;

    var minX = Math.min(boxX, labelX);
    var minY = Math.min(boxY, labelY);
    var width = Math.max(Math.abs(boxX - labelX), 1);
    var height = Math.max(Math.abs(boxY - labelY), 1);

    svg.style.left = (minX - groupRect.left) + 'px';
    svg.style.top = (minY - groupRect.top) + 'px';
    svg.style.width = width + 'px';
    svg.style.height = height + 'px';
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);

    line.setAttribute('x1', boxX - minX);
    line.setAttribute('y1', boxY - minY);
    line.setAttribute('x2', labelX - minX);
    line.setAttribute('y2', labelY - minY);
  }

  function positionAllConnectors() {
    groups.forEach(positionConnector);
  }

  // Twine and the video/audio box share a grid cell (video pinned to its
  // start, Twine free to float) so Twine can sit with equal breathing room
  // from video/audio on its left and the graphic-design column on its
  // right — something plain justify-self can't express, since centering in
  // the shared cell ignores how much of it the video/audio box already
  // occupies. Only applies to the desktop 3-column row; bows out on
  // narrower layouts where these boxes stack instead.
  function positionTwine() {
    var group = document.querySelector('.tool-group--twine');
    var box = group && group.querySelector('.tool-group__box');
    var video = document.querySelector('.tool-group--videoaudio .tool-group__box');
    var graphic = document.querySelector('.tool-group--graphic .tool-group__box');
    if (!group || !box || !video || !graphic) return;

    group.style.marginLeft = '0px';
    var videoRect = video.getBoundingClientRect();
    var graphicRect = graphic.getBoundingClientRect();
    var boxRect = box.getBoundingClientRect();

    // graphic-design spans both rows, so check vertical overlap with video's
    // row rather than equal tops (which only matches the top-right layout)
    var sameRow = videoRect.top < graphicRect.bottom && videoRect.bottom > graphicRect.top;
    var gapTotal = graphicRect.left - videoRect.right - boxRect.width;
    if (!sameRow || gapTotal <= 40) {
      group.style.marginLeft = '';
      return;
    }

    var desiredLeft = videoRect.right + gapTotal / 2;
    group.style.marginLeft = (desiredLeft - boxRect.left) + 'px';
  }

  function layoutTools() {
    positionTwine();
    positionAllConnectors();
  }

  // Re-layout at most once per frame, however many things ask for it, so
  // the lines follow the boxes while a window is still being dragged
  // instead of catching up after a delay.
  var layoutQueued = false;
  function scheduleLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(function () {
      layoutQueued = false;
      layoutTools();
    });
  }

  layoutTools();
  window.addEventListener('load', scheduleLayout);
  window.addEventListener('resize', scheduleLayout);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleLayout);
  }

  // Anything that changes a box's or label's size — window resize, browser
  // zoom, a late-loading font or icon, a media-query layout switch — re-runs
  // the layout, not just the window's resize event.
  if ('ResizeObserver' in window) {
    var observer = new ResizeObserver(scheduleLayout);
    var diagram = document.querySelector('.tools-diagram');
    if (diagram) observer.observe(diagram);
    groups.forEach(function (group) {
      var box = group.querySelector('.tool-group__box');
      var label = group.querySelector('.tool-group__label-text');
      observer.observe(group);
      if (box) observer.observe(box);
      if (label) observer.observe(label);
    });
  }

  // Lines and labels are static — no scroll-triggered reveal, no typing.
  groups.forEach(function (group) {
    var label = group.querySelector('.tool-group__label-text');
    if (label) label.textContent = label.dataset.text || label.textContent;
  });
})();
